# Hook Configuration Fix Progress

## 문제

- `UserPromptSubmit` hook 실행 실패
- 에러: `Failed to spawn: .claude/hooks/alfred/alfred_hooks.py`
- 원인: settings.json의 hook 경로가 상대 경로로 설정되어 있고, 변수 확장이 제대로 이루어지지 않음

## 해결책

- settings.json의 모든 hook 커맨드를 절대 경로로 변경
- 프로젝트 절대 경로: `/Users/ip9202/develop/vibe/jeju-tourlist`

## 수정할 항목

1. SessionStart - `/Users/ip9202/develop/vibe/jeju-tourlist/.claude/hooks/alfred/alfred_hooks.py SessionStart`
2. PreToolUse - `/Users/ip9202/develop/vibe/jeju-tourlist/.claude/hooks/alfred/alfred_hooks.py PreToolUse`
3. UserPromptSubmit - `/Users/ip9202/develop/vibe/jeju-tourlist/.claude/hooks/alfred/alfred_hooks.py UserPromptSubmit`
4. SessionEnd - `/Users/ip9202/develop/vibe/jeju-tourlist/.claude/hooks/alfred/alfred_hooks.py SessionEnd`
5. PostToolUse - `/Users/ip9202/develop/vibe/jeju-tourlist/.claude/hooks/alfred/alfred_hooks.py PostToolUse`
