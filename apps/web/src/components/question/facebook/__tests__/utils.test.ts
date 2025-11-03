/**
 * Unit tests for Facebook Q&A utility functions
 * Tests badge logic, sorting, and user classification
 */

import { getBadgeType, isNewbie, sortByBadgePriority } from "../utils";
import type { Answer, User } from "../types";

describe("Facebook Q&A Utils", () => {
  describe("getBadgeType", () => {
    const mockUser: User = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
    };

    it('should return "accepted" for accepted answers (highest priority)', () => {
      const answer: Answer = {
        id: "ans-1",
        content: "Answer",
        author: { ...mockUser, badge: "expert" },
        createdAt: new Date().toISOString(),
        likeCount: 0,
        dislikeCount: 0,
        isAccepted: true,
      };

      expect(getBadgeType(answer)).toBe("accepted");
    });

    it('should return "expert" for author with expert badge', () => {
      const answer: Answer = {
        id: "ans-1",
        content: "Answer",
        author: { ...mockUser, badge: "expert" },
        createdAt: new Date().toISOString(),
        likeCount: 0,
        dislikeCount: 0,
      };

      expect(getBadgeType(answer)).toBe("expert");
    });

    it('should return "newbie" for users created within 7 days', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 3); // 3 days ago

      const answer: Answer = {
        id: "ans-1",
        content: "Answer",
        author: { ...mockUser, createdAt: recentDate.toISOString() },
        createdAt: new Date().toISOString(),
        likeCount: 0,
        dislikeCount: 0,
      };

      expect(getBadgeType(answer)).toBe("newbie");
    });

    it("should return undefined for regular users", () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 30); // 30 days ago

      const answer: Answer = {
        id: "ans-1",
        content: "Answer",
        author: { ...mockUser, createdAt: oldDate.toISOString() },
        createdAt: new Date().toISOString(),
        likeCount: 0,
        dislikeCount: 0,
      };

      expect(getBadgeType(answer)).toBeUndefined();
    });

    it("should prioritize accepted over expert badge", () => {
      const answer: Answer = {
        id: "ans-1",
        content: "Answer",
        author: { ...mockUser, badge: "expert" },
        createdAt: new Date().toISOString(),
        likeCount: 0,
        dislikeCount: 0,
        isAccepted: true,
      };

      expect(getBadgeType(answer)).toBe("accepted");
    });
  });

  describe("isNewbie", () => {
    it("should return true for users created within 7 days", () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 5); // 5 days ago

      const user: User = {
        id: "user-1",
        name: "New User",
        email: "new@example.com",
        createdAt: recentDate.toISOString(),
      };

      expect(isNewbie(user)).toBe(true);
    });

    it("should return true for users created exactly 7 days ago", () => {
      const exactDate = new Date();
      exactDate.setDate(exactDate.getDate() - 7); // Exactly 7 days ago

      const user: User = {
        id: "user-1",
        name: "User",
        email: "user@example.com",
        createdAt: exactDate.toISOString(),
      };

      expect(isNewbie(user)).toBe(true);
    });

    it("should return false for users created more than 7 days ago", () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 14); // 14 days ago

      const user: User = {
        id: "user-1",
        name: "Old User",
        email: "old@example.com",
        createdAt: oldDate.toISOString(),
      };

      expect(isNewbie(user)).toBe(false);
    });

    it("should return false for users without createdAt date", () => {
      const user: User = {
        id: "user-1",
        name: "User",
        email: "user@example.com",
      };

      expect(isNewbie(user)).toBe(false);
    });

    it("should return false for undefined user", () => {
      expect(isNewbie(undefined)).toBe(false);
    });

    it("should handle invalid date strings gracefully", () => {
      const user: User = {
        id: "user-1",
        name: "User",
        email: "user@example.com",
        createdAt: "invalid-date",
      };

      expect(isNewbie(user)).toBe(false);
    });
  });

  describe("sortByBadgePriority", () => {
    const mockUser: User = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
    };

    const expertUser: User = {
      ...mockUser,
      id: "user-2",
      badge: "expert",
    };

    const newbieDate = new Date();
    newbieDate.setDate(newbieDate.getDate() - 3);

    const newbieUser: User = {
      ...mockUser,
      id: "user-3",
      createdAt: newbieDate.toISOString(),
    };

    it("should sort accepted answers first", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Regular answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-2",
          content: "Accepted answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          isAccepted: true,
        },
      ];

      const sorted = sortByBadgePriority(answers);

      expect(sorted[0].id).toBe("ans-2"); // Accepted first
      expect(sorted[1].id).toBe("ans-1");
    });

    it("should sort expert answers before newbie answers", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Newbie answer",
          author: newbieUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-2",
          content: "Expert answer",
          author: expertUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
      ];

      const sorted = sortByBadgePriority(answers);

      expect(sorted[0].id).toBe("ans-2"); // Expert first
      expect(sorted[1].id).toBe("ans-1");
    });

    it("should handle complex priority: accepted > expert > newbie", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Newbie answer",
          author: newbieUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-2",
          content: "Expert answer",
          author: expertUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-3",
          content: "Accepted answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
          isAccepted: true,
        },
      ];

      const sorted = sortByBadgePriority(answers);

      expect(sorted[0].id).toBe("ans-3"); // Accepted
      expect(sorted[1].id).toBe("ans-2"); // Expert
      expect(sorted[2].id).toBe("ans-1"); // Newbie
    });

    it("should not mutate the original array", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Answer 1",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
        {
          id: "ans-2",
          content: "Answer 2",
          author: expertUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
      ];

      const originalOrder = answers.map(a => a.id);
      sortByBadgePriority(answers);

      expect(answers.map(a => a.id)).toEqual(originalOrder);
    });

    it("should handle empty array", () => {
      const sorted = sortByBadgePriority([]);
      expect(sorted).toEqual([]);
    });

    it("should handle single answer", () => {
      const answers: Answer[] = [
        {
          id: "ans-1",
          content: "Single answer",
          author: mockUser,
          createdAt: new Date().toISOString(),
          likeCount: 0,
          dislikeCount: 0,
        },
      ];

      const sorted = sortByBadgePriority(answers);
      expect(sorted).toHaveLength(1);
      expect(sorted[0].id).toBe("ans-1");
    });
  });
});
