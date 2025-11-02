#!/usr/bin/env python3
"""Session event handlers

SessionStart, SessionEnd event handling
"""

import json
from pathlib import Path

from core import HookPayload, HookResult
from core.checkpoint import list_checkpoints
from core.project import count_specs, detect_language, get_git_info, get_package_version_info


def load_user_critical_from_claude() -> list:
    """Extract @USER_CRITICAL section from CLAUDE.md

    Reads both global (~/.claude/CLAUDE.md) and project CLAUDE.md files
    and extracts content between @USER_CRITICAL markers.
    Returns empty list if section not found or files don't exist.
    """
    critical_rules = []

    # Try to read CLAUDE.md files
    for claude_path in [
        Path.home() / ".claude" / "CLAUDE.md",  # Global
        Path.cwd() / "CLAUDE.md",  # Project root
    ]:
        if not claude_path.exists():
            continue

        try:
            with open(claude_path) as f:
                content = f.read()

            # Look for @USER_CRITICAL section
            if "@USER_CRITICAL" in content:
                # Extract content between @USER_CRITICAL and next # section
                lines = content.split('\n')
                in_critical = False

                for line in lines:
                    if "@USER_CRITICAL" in line:
                        in_critical = True
                        continue

                    # Stop at next section marker
                    if in_critical and line.startswith('#'):
                        break

                    # Extract rule lines (starting with - or **)
                    if in_critical:
                        stripped = line.strip()
                        if stripped and not stripped.startswith('#') and not stripped.startswith('CRITICAL:'):
                            critical_rules.append(stripped)

        except Exception:
            # Graceful degradation if file read fails
            pass

    return critical_rules


def handle_session_start(payload: HookPayload) -> HookResult:
    """SessionStart event handler with GRACEFUL DEGRADATION

    When Claude Code Session starts, it displays a summary of project status.
    You can check the language, Git status, SPEC progress, and checkpoint list at a glance.
    All optional operations are wrapped in try-except to ensure hook completes quickly even if
    Git commands, file I/O, or other operations timeout or fail.

    Args:
        payload: Claude Code event payload (cwd key required)

    Returns:
        HookResult(system_message=project status summary message)

    Message Format:
        🚀 MoAI-ADK Session Started
           Language: {language}
           [Branch: {branch} ({commit hash})] - optional if git fails
           [Changes: {Number of Changed Files}] - optional if git fails
           [SPEC Progress: {Complete}/{Total} ({percent}%)] - optional if specs fail
           [Checkpoints: {number} available] - optional if checkpoint list fails

    Graceful Degradation Strategy:
        - CRITICAL: Language detection (must succeed - no try-except)
        - OPTIONAL: Git info (skip if timeout/failure)
        - OPTIONAL: SPEC progress (skip if timeout/failure)
        - OPTIONAL: Checkpoint list (skip if timeout/failure)
        - Always display SOMETHING to user, never return empty message

    Note:
        - Claude Code processes SessionStart in several stages (clear → compact)
        - Display message only at "compact" stage to prevent duplicate output
        - "clear" step returns minimal result (empty hookSpecificOutput)
        - CRITICAL: All optional operations must complete within 2-3 seconds total

    TDD History:
        - RED: Session startup message format test
        - GREEN: Generate status message by combining helper functions
        - REFACTOR: Improved message format, improved readability, added checkpoint list
        - FIX: Prevent duplicate output of clear step (only compact step is displayed)
        - UPDATE: Migrated to Claude Code standard Hook schema
        - HOTFIX: Add graceful degradation for timeout scenarios (Issue #66)

    @TAG:CHECKPOINT-EVENT-001
    @TAG:HOOKS-TIMEOUT-001
    """
    # Claude Code SessionStart runs in several stages (clear, compact, etc.)
    # Ignore the "clear" stage and output messages only at the "compact" stage
    event_phase = payload.get("phase", "")
    if event_phase == "clear":
        # Return minimal valid Hook result for clear phase
        return HookResult(continue_execution=True)

    cwd = payload.get("cwd", ".")

    # Load critical rules from CLAUDE.md @USER_CRITICAL section
    critical_rules = load_user_critical_from_claude()

    # CRITICAL: Language detection - MUST succeed (no try-except)
    language = detect_language(cwd)

    # OPTIONAL: Git info - skip if timeout/failure
    git_info = {}
    try:
        git_info = get_git_info(cwd)
    except Exception:
        # Graceful degradation - continue without git info
        pass

    # OPTIONAL: SPEC progress - skip if timeout/failure
    specs = {"completed": 0, "total": 0, "percentage": 0}
    try:
        specs = count_specs(cwd)
    except Exception:
        # Graceful degradation - continue without spec info
        pass

    # OPTIONAL: Checkpoint list - skip if timeout/failure
    checkpoints = []
    try:
        checkpoints = list_checkpoints(cwd, max_count=10)
    except Exception:
        # Graceful degradation - continue without checkpoints
        pass

    # OPTIONAL: Package version info - skip if timeout/failure
    version_info = {}
    try:
        version_info = get_package_version_info()
    except Exception:
        # Graceful degradation - continue without version info
        pass

    # Build message with available information
    branch = git_info.get("branch", "N/A") if git_info else "N/A"
    commit = git_info.get("commit", "N/A")[:7] if git_info else "N/A"
    changes = git_info.get("changes", 0) if git_info else 0
    spec_progress = f"{specs['completed']}/{specs['total']}" if specs["total"] > 0 else "0/0"

    # system_message: displayed directly to the user
    lines = [
        "🚀 MoAI-ADK Session Started",
        "",  # Blank line after title
    ]

    # Add critical rules from CLAUDE.md if available
    if critical_rules:
        lines.append("📋 Critical Rules (from @USER_CRITICAL):")
        for rule in critical_rules:
            lines.append(f"   • {rule}")
        lines.append("")  # Blank line separator

    # Add version info first (at the top, right after title)
    if version_info and version_info.get("current") != "unknown":
        version_line = f"   🗿 MoAI-ADK Ver: {version_info['current']}"
        if version_info.get("update_available"):
            version_line += f" → {version_info['latest']} available ✨"
        lines.append(version_line)

        # Add upgrade recommendation if update is available
        if version_info.get("update_available") and version_info.get("upgrade_command"):
            lines.append(f"   ⬆️ Upgrade: {version_info['upgrade_command']}")

    # Add language info
    lines.append(f"   🐍 Language: {language}")

    # Add Git info only if available (not degraded)
    if git_info:
        lines.append(f"   🌿 Branch: {branch} ({commit})")
        lines.append(f"   📝 Changes: {changes}")

        # Add last commit message if available
        last_commit = git_info.get("last_commit", "")
        if last_commit:
            lines.append(f"   🔨 Last: {last_commit}")

    # Add Checkpoint list (show only the latest 3 items)
    if checkpoints:
        lines.append(f"   🗂️  Checkpoints: {len(checkpoints)} available")
        for cp in reversed(checkpoints[-3:]):  # Latest 3 items
            branch_short = cp["branch"].replace("before-", "")
            lines.append(f"      📌 {branch_short}")
        lines.append("")  # Blank line before restore command
        lines.append("   ↩️  Restore: /alfred:0-project restore")

    # Add SPEC progress only if available (not degraded) - at the bottom
    if specs["total"] > 0:
        lines.append(f"   📋 SPEC Progress: {spec_progress} ({specs['percentage']}%)")

    system_message = "\n".join(lines)

    return HookResult(system_message=system_message)


def handle_session_end(payload: HookPayload) -> HookResult:
    """SessionEnd event handler (default implementation)"""
    return HookResult()


__all__ = ["handle_session_start", "handle_session_end"]
