/**
 * 배지 시스템 로직 단위 테스트
 *
 * @description
 * - 배지 결정 알고리즘 테스트
 * - 사용자 활동도에 따른 배지 부여 테스트
 * - 배지 우선순위 테스트
 * - 특별 배지 조건 테스트
 */

import {
  determineBadge,
  isBadgeQualified,
  getBadgeColor,
  getBadgeIcon,
  calculateExpertLevel,
} from "../../utils/badgeLogic";

// Mock 사용자 데이터
interface UserStats {
  userId: string;
  answerCount: number;
  correctAnswerCount: number;
  helpfulVoteCount: number;
  totalViewCount: number;
  questionCount: number;
  averageRating: number;
  isVerified: boolean;
  isAdmin: boolean;
  registrationDate: Date;
  lastActivityDate: Date;
}

const createMockUser = (overrides: Partial<UserStats> = {}): UserStats => ({
  userId: "user_001",
  answerCount: 0,
  correctAnswerCount: 0,
  helpfulVoteCount: 0,
  totalViewCount: 0,
  questionCount: 0,
  averageRating: 0,
  isVerified: false,
  isAdmin: false,
  registrationDate: new Date("2025-01-01"),
  lastActivityDate: new Date(),
  ...overrides,
});

describe("배지 시스템 로직", () => {
  describe("배지 결정 함수 (determineBadge)", () => {
    test("관리자는 Admin 배지를 받아야 함", () => {
      const adminUser = createMockUser({ isAdmin: true });
      const badge = determineBadge(adminUser);

      expect(badge).toBe("admin");
    });

    test("인증된 사용자는 Verified 배지를 받아야 함", () => {
      const verifiedUser = createMockUser({ isVerified: true });
      const badge = determineBadge(verifiedUser);

      expect(badge).toBe("verified");
    });

    test("높은 답변 개수와 평점을 가진 사용자는 Expert 배지를 받아야 함", () => {
      const expertUser = createMockUser({
        answerCount: 50,
        averageRating: 4.5,
        helpfulVoteCount: 100,
      });
      const badge = determineBadge(expertUser);

      expect(badge).toBe("expert");
    });

    test("많은 유용한 답변을 작성한 사용자는 Helpful 배지를 받아야 함", () => {
      const helpfulUser = createMockUser({
        answerCount: 20,
        helpfulVoteCount: 80,
        averageRating: 4.0,
      });
      const badge = determineBadge(helpfulUser);

      expect(badge).toBe("helpful");
    });

    test("높은 평점의 사용자는 TopRated 배지를 받아야 함", () => {
      const topRatedUser = createMockUser({
        answerCount: 10,
        averageRating: 4.8,
        helpfulVoteCount: 40,
      });
      const badge = determineBadge(topRatedUser);

      expect(badge).toBe("top-rated");
    });

    test("많은 활동을 한 사용자는 Active 배지를 받아야 함", () => {
      const activeUser = createMockUser({
        answerCount: 30,
        questionCount: 15,
        totalViewCount: 500,
        lastActivityDate: new Date(),
      });
      const badge = determineBadge(activeUser);

      expect(badge).toBe("active");
    });

    test("신규 사용자는 배지를 받지 않아야 함", () => {
      const newUser = createMockUser({
        answerCount: 0,
        questionCount: 1,
        registrationDate: new Date(),
      });
      const badge = determineBadge(newUser);

      expect(badge).toBeNull();
    });

    test("배지 우선순위: Admin > Verified > Expert > Helpful > TopRated > Active", () => {
      // Admin + Verified + Expert 모두 해당하는 경우
      const superUser = createMockUser({
        isAdmin: true,
        isVerified: true,
        answerCount: 100,
        averageRating: 4.8,
        helpfulVoteCount: 200,
      });

      const badge = determineBadge(superUser);
      expect(badge).toBe("admin"); // 최고 우선순위
    });
  });

  describe("배지 자격 검증 함수 (isBadgeQualified)", () => {
    test("Expert 배지 자격: 최소 50개 답변 + 4.5 이상 평점", () => {
      const user1 = createMockUser({
        answerCount: 49,
        averageRating: 4.5,
      });
      expect(isBadgeQualified(user1, "expert")).toBe(false);

      const user2 = createMockUser({
        answerCount: 50,
        averageRating: 4.4,
      });
      expect(isBadgeQualified(user2, "expert")).toBe(false);

      const user3 = createMockUser({
        answerCount: 50,
        averageRating: 4.5,
      });
      expect(isBadgeQualified(user3, "expert")).toBe(true);
    });

    test("Helpful 배지 자격: 최소 20개 답변 + 유용도 80% 이상", () => {
      const user1 = createMockUser({
        answerCount: 19,
        helpfulVoteCount: 20,
      });
      expect(isBadgeQualified(user1, "helpful")).toBe(false);

      const user2 = createMockUser({
        answerCount: 20,
        helpfulVoteCount: 15, // 75%
      });
      expect(isBadgeQualified(user2, "helpful")).toBe(false);

      const user3 = createMockUser({
        answerCount: 20,
        helpfulVoteCount: 16, // 80%
      });
      expect(isBadgeQualified(user3, "helpful")).toBe(true);
    });

    test("TopRated 배지 자격: 4.8 이상 평점", () => {
      const user1 = createMockUser({ averageRating: 4.7 });
      expect(isBadgeQualified(user1, "top-rated")).toBe(false);

      const user2 = createMockUser({ averageRating: 4.8 });
      expect(isBadgeQualified(user2, "top-rated")).toBe(true);

      const user3 = createMockUser({ averageRating: 5.0 });
      expect(isBadgeQualified(user3, "top-rated")).toBe(true);
    });

    test("Active 배지 자격: 최근 7일 내 활동", () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activeUser = createMockUser({
        lastActivityDate: new Date(),
      });
      expect(isBadgeQualified(activeUser, "active")).toBe(true);

      const inactiveUser = createMockUser({
        lastActivityDate: new Date("2025-10-01"), // 20일 전
      });
      expect(isBadgeQualified(inactiveUser, "active")).toBe(false);
    });

    test("Verified 배지는 명시적으로 설정된 경우만 자격", () => {
      const user1 = createMockUser({ isVerified: false });
      expect(isBadgeQualified(user1, "verified")).toBe(false);

      const user2 = createMockUser({ isVerified: true });
      expect(isBadgeQualified(user2, "verified")).toBe(true);
    });
  });

  describe("배지 색상 함수 (getBadgeColor)", () => {
    test("각 배지마다 적절한 색상을 반환해야 함", () => {
      expect(getBadgeColor("admin")).toBe("bg-red-500");
      expect(getBadgeColor("verified")).toBe("bg-blue-500");
      expect(getBadgeColor("expert")).toBe("bg-purple-500");
      expect(getBadgeColor("helpful")).toBe("bg-green-500");
      expect(getBadgeColor("top-rated")).toBe("bg-yellow-500");
      expect(getBadgeColor("active")).toBe("bg-cyan-500");
    });

    test("알 수 없는 배지는 기본 색상을 반환해야 함", () => {
      const defaultColor = getBadgeColor("unknown" as unknown as BadgeType);
      expect(defaultColor).toBe("bg-gray-500");
    });
  });

  describe("배지 아이콘 함수 (getBadgeIcon)", () => {
    test("각 배지마다 적절한 아이콘을 반환해야 함", () => {
      expect(getBadgeIcon("admin")).toBeDefined();
      expect(getBadgeIcon("verified")).toBeDefined();
      expect(getBadgeIcon("expert")).toBeDefined();
      expect(getBadgeIcon("helpful")).toBeDefined();
      expect(getBadgeIcon("top-rated")).toBeDefined();
      expect(getBadgeIcon("active")).toBeDefined();
    });

    test("아이콘이 React 컴포넌트여야 함", () => {
      const icon = getBadgeIcon("expert");
      expect(icon).toBeDefined();
      expect(typeof icon).toBe("object"); // JSX 타입
    });
  });

  describe("전문가 레벨 계산 함수 (calculateExpertLevel)", () => {
    test("답변 개수에 따라 레벨이 결정되어야 함", () => {
      expect(
        calculateExpertLevel({ answerCount: 10, averageRating: 4.0 })
      ).toBe(1);
      expect(
        calculateExpertLevel({ answerCount: 50, averageRating: 4.0 })
      ).toBe(2);
      expect(
        calculateExpertLevel({ answerCount: 100, averageRating: 4.0 })
      ).toBe(3);
      expect(
        calculateExpertLevel({ answerCount: 200, averageRating: 4.0 })
      ).toBe(4);
    });

    test("평점에 따라 보너스가 적용되어야 함", () => {
      const level1 = calculateExpertLevel({
        answerCount: 50,
        averageRating: 3.5,
      });
      const level2 = calculateExpertLevel({
        answerCount: 50,
        averageRating: 4.5,
      });

      // 같은 답변 개수라도 평점이 높으면 레벨이 높아야 함
      expect(level2).toBeGreaterThanOrEqual(level1);
    });

    test("최소 레벨은 0이어야 함", () => {
      expect(calculateExpertLevel({ answerCount: 0, averageRating: 0 })).toBe(
        0
      );
    });

    test("최대 레벨은 5여야 함", () => {
      expect(
        calculateExpertLevel({
          answerCount: 1000,
          averageRating: 5.0,
        })
      ).toBeLessThanOrEqual(5);
    });
  });

  describe("엣지 케이스", () => {
    test("정확히 배지 자격선의 사용자는 배지를 받아야 함", () => {
      const edgeCase = createMockUser({
        answerCount: 50, // 정확히 Expert 최소 기준
        averageRating: 4.5,
      });

      expect(isBadgeQualified(edgeCase, "expert")).toBe(true);
    });

    test("0.1만큼 부족한 사용자는 배지를 받지 않아야 함", () => {
      const almostExpert = createMockUser({
        answerCount: 50,
        averageRating: 4.4999, // 4.5보다 약간 낮음
      });

      expect(isBadgeQualified(almostExpert, "expert")).toBe(false);
    });

    test("아무 활동도 하지 않은 사용자는 배지를 받지 않아야 함", () => {
      const inactiveUser = createMockUser();
      const badge = determineBadge(inactiveUser);

      expect(badge).toBeNull();
    });

    test("매우 오래된 활동만 있는 사용자는 Active 배지를 받지 않아야 함", () => {
      const oldActivityUser = createMockUser({
        answerCount: 50,
        lastActivityDate: new Date("2024-01-01"),
      });

      // Active 배지를 받지 않아야 함
      const badge = determineBadge(oldActivityUser);
      expect(badge).not.toBe("active");
    });
  });

  describe("배지 여러 개 적용 시나리오", () => {
    test("새로운 사용자가 시간이 지나면서 배지를 얻는 프로세스", () => {
      // 1단계: 신규 사용자
      const newUser = createMockUser();
      expect(determineBadge(newUser)).toBeNull();

      // 2단계: Active 배지 획득
      const activeUser = createMockUser({
        questionCount: 3,
        lastActivityDate: new Date(),
      });
      expect(determineBadge(activeUser)).toBe("active");

      // 3단계: Helpful 배지 획득
      const helpfulUser = createMockUser({
        answerCount: 25,
        helpfulVoteCount: 20, // 80% 이상
        averageRating: 4.0,
      });
      expect(determineBadge(helpfulUser)).toBe("helpful");

      // 4단계: Expert 배지 획득
      const expertUser = createMockUser({
        answerCount: 60,
        averageRating: 4.6,
        helpfulVoteCount: 120,
      });
      expect(determineBadge(expertUser)).toBe("expert");
    });
  });

  describe("성능", () => {
    test("배지 결정 함수가 빠르게 실행되어야 함", () => {
      const user = createMockUser({
        answerCount: 100,
        averageRating: 4.5,
      });

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        determineBadge(user);
      }
      const endTime = performance.now();

      // 1000번 실행이 100ms 이내에 완료되어야 함
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
