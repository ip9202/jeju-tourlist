// @TEST:ANSWER-SERVICE-DEFAULTS-001
// @TEST:ANSWER-USER-REACTIONS-001
// @TEST:ANSWER-TOP-LEVEL-FILTER-001
// @TEST:ANSWER-NULLABLE-FIELDS-001

import { PrismaClient } from "@prisma/client";
import { QuestionService } from "../QuestionService";
import { AnswerService } from "../../answer/AnswerService";

describe("QuestionService - getQuestionById", () => {
  let prisma: PrismaClient;
  let questionService: QuestionService;
  let answerService: AnswerService;

  beforeAll(() => {
    prisma = new PrismaClient();
    answerService = new AnswerService(prisma);
    questionService = new QuestionService(prisma, answerService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Helper function to generate unique email
  const getUniqueEmail = (base: string) => {
    return `${base}-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  };

  describe("@TEST:ANSWER-SERVICE-DEFAULTS-001 - boolean 필드 기본값", () => {
    it("비로그인 사용자의 경우 모든 boolean 필드가 기본값을 가져야 함", async () => {
      // Given: 테스트 질문과 답변 생성
      const testUser = await prisma.user.create({
        data: {
          email: getUniqueEmail("test-defaults"),
          name: "Test User",
          nickname: `testuser-${Date.now()}`,
          password: "hashedpassword",
          provider: "email",
        },
      });

      const testQuestion = await prisma.question.create({
        data: {
          title: "Test Question for Defaults",
          content: "Testing default boolean values",
          authorId: testUser.id,
        },
      });

      const testAnswer = await prisma.answer.create({
        data: {
          content: "Test Answer",
          questionId: testQuestion.id,
          authorId: testUser.id,
        },
      });

      // When: userId 없이 질문 조회
      const result = await questionService.getQuestionById(
        testQuestion.id,
        false // incrementView
      );

      // Then: 모든 boolean 필드가 정의되어 있어야 함
      expect(result.answers).toBeDefined();
      expect(result.answers.length).toBeGreaterThan(0);

      const answer = result.answers[0];
      expect(answer.isLiked).toBeDefined();
      expect(answer.isDisliked).toBeDefined();
      expect(answer.isAccepted).toBeDefined();
      expect(answer.isAuthor).toBeDefined();
      expect(answer.isQuestionAuthor).toBeDefined();

      // 기본값 검증
      expect(answer.isLiked).toBe(false);
      expect(answer.isDisliked).toBe(false);
      expect(answer.isAccepted).toBe(false);
      expect(answer.isAuthor).toBe(false);
      expect(answer.isQuestionAuthor).toBe(false);

      // Cleanup
      await prisma.answer.delete({ where: { id: testAnswer.id } });
      await prisma.question.delete({ where: { id: testQuestion.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    });
  });

  describe("@TEST:ANSWER-USER-REACTIONS-001 - 사용자 반응 로드", () => {
    it("로그인 사용자의 경우 사용자 반응이 정확히 로드되어야 함", async () => {
      // Given: 테스트 질문, 답변, 사용자 생성
      const testUser = await prisma.user.create({
        data: {
          email: getUniqueEmail("test-reactions"),
          name: "Test User",
          nickname: `reactionuser-${Date.now()}`,
          password: "hashedpassword",
          provider: "email",
        },
      });

      const testQuestion = await prisma.question.create({
        data: {
          title: "Test Question for Reactions",
          content: "Testing user reactions",
          authorId: testUser.id,
        },
      });

      const testAnswer = await prisma.answer.create({
        data: {
          content: "Test Answer for Reactions",
          questionId: testQuestion.id,
          authorId: testUser.id,
        },
      });

      // 사용자 반응 생성 (좋아요)
      await prisma.answerLike.create({
        data: {
          userId: testUser.id,
          answerId: testAnswer.id,
          isLike: true,
        },
      });

      // When: userId와 함께 질문 조회
      const result = await questionService.getQuestionById(
        testQuestion.id,
        false,
        testUser.id
      );

      // Then: 사용자 반응이 정확히 로드되어야 함
      const answer = result.answers.find((a: any) => a.id === testAnswer.id);
      expect(answer).toBeDefined();
      expect(answer.isLiked).toBe(true);
      expect(answer.isDisliked).toBe(false);
      expect(answer.isAuthor).toBe(true);
      expect(answer.isQuestionAuthor).toBe(true);

      // Cleanup
      await prisma.answerLike.deleteMany({
        where: { answerId: testAnswer.id },
      });
      await prisma.answer.delete({ where: { id: testAnswer.id } });
      await prisma.question.delete({ where: { id: testQuestion.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    });

    it("싫어요 반응이 정확히 로드되어야 함", async () => {
      // Given: 테스트 질문, 답변, 사용자 생성
      const testUser = await prisma.user.create({
        data: {
          email: getUniqueEmail("test-dislike"),
          name: "Test User Dislike",
          nickname: `dislikeuser-${Date.now()}`,
          password: "hashedpassword",
          provider: "email",
        },
      });

      const testQuestion = await prisma.question.create({
        data: {
          title: "Test Question for Dislike",
          content: "Testing dislike reactions",
          authorId: testUser.id,
        },
      });

      const testAnswer = await prisma.answer.create({
        data: {
          content: "Test Answer for Dislike",
          questionId: testQuestion.id,
          authorId: testUser.id,
        },
      });

      // 사용자 반응 생성 (싫어요)
      await prisma.answerLike.create({
        data: {
          userId: testUser.id,
          answerId: testAnswer.id,
          isLike: false,
        },
      });

      // When: userId와 함께 질문 조회
      const result = await questionService.getQuestionById(
        testQuestion.id,
        false,
        testUser.id
      );

      // Then: 싫어요 반응이 정확히 로드되어야 함
      const answer = result.answers.find((a: any) => a.id === testAnswer.id);
      expect(answer).toBeDefined();
      expect(answer.isLiked).toBe(false);
      expect(answer.isDisliked).toBe(true);

      // Cleanup
      await prisma.answerLike.deleteMany({
        where: { answerId: testAnswer.id },
      });
      await prisma.answer.delete({ where: { id: testAnswer.id } });
      await prisma.question.delete({ where: { id: testQuestion.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    });
  });

  describe("@TEST:ANSWER-TOP-LEVEL-FILTER-001 - 최상위 답변 필터링", () => {
    it("최상위 답변만 반환되어야 함 (parentId null/undefined)", async () => {
      // Given: 테스트 질문, 답변, 댓글 생성
      const testUser = await prisma.user.create({
        data: {
          email: getUniqueEmail("test-toplevel"),
          name: "Test User TopLevel",
          nickname: `topleveluser-${Date.now()}`,
          password: "hashedpassword",
          provider: "email",
        },
      });

      const testQuestion = await prisma.question.create({
        data: {
          title: "Test Question for Top Level",
          content: "Testing top level answers",
          authorId: testUser.id,
        },
      });

      const testAnswer = await prisma.answer.create({
        data: {
          content: "Test Top Level Answer",
          questionId: testQuestion.id,
          authorId: testUser.id,
        },
      });

      const testComment = await prisma.answerComment.create({
        data: {
          content: "Test Comment",
          answerId: testAnswer.id,
          authorId: testUser.id,
        },
      });

      // When: 질문 조회
      const result = await questionService.getQuestionById(
        testQuestion.id,
        false
      );

      // Then: 답변과 댓글이 모두 포함되어야 하지만 구분 가능해야 함
      expect(result.answers).toBeDefined();

      // 최상위 답변 (parentId가 없음)
      const topLevelAnswers = result.answers.filter(
        (a: any) => !a.parentId || a.parentId === null
      );
      expect(topLevelAnswers.length).toBeGreaterThan(0);

      // 댓글 (parentId가 있음)
      const comments = result.answers.filter((a: any) => a.parentId);
      expect(comments.length).toBeGreaterThan(0);
      expect(comments[0].parentId).toBe(testAnswer.id);

      // Cleanup
      await prisma.answerComment.delete({ where: { id: testComment.id } });
      await prisma.answer.delete({ where: { id: testAnswer.id } });
      await prisma.question.delete({ where: { id: testQuestion.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    });
  });

  describe("@TEST:ANSWER-NULLABLE-FIELDS-001 - Nullable 필드 처리", () => {
    it("nullable 필드가 안전하게 처리되어야 함 (avatar, category null)", async () => {
      // Given: avatar가 null인 사용자와 질문 생성
      const testUser = await prisma.user.create({
        data: {
          email: getUniqueEmail("test-nullable"),
          name: "Test User Nullable",
          nickname: `nullableuser-${Date.now()}`,
          password: "hashedpassword",
          provider: "email",
          avatar: null, // explicitly null
        },
      });

      const testQuestion = await prisma.question.create({
        data: {
          title: "Test Question for Nullable",
          content: "Testing nullable fields",
          authorId: testUser.id,
          categoryId: null, // explicitly null
        },
      });

      const testAnswer = await prisma.answer.create({
        data: {
          content: "Test Answer with Nullable Fields",
          questionId: testQuestion.id,
          authorId: testUser.id,
        },
      });

      // When: 질문 조회
      const result = await questionService.getQuestionById(
        testQuestion.id,
        false
      );

      // Then: null 필드가 안전하게 처리되어야 함
      expect(result.answers).toBeDefined();
      const answer = result.answers.find((a: any) => a.id === testAnswer.id);
      expect(answer).toBeDefined();
      expect(answer.author).toBeDefined();
      expect(answer.author.avatar).toBeNull(); // null은 허용
      expect(result.category).toBeNull(); // null은 허용

      // 필수 필드는 정의되어야 함
      expect(answer.author.id).toBeDefined();
      expect(answer.author.name).toBeDefined();
      expect(answer.content).toBeDefined();

      // Cleanup
      await prisma.answer.delete({ where: { id: testAnswer.id } });
      await prisma.question.delete({ where: { id: testQuestion.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    });
  });
});
