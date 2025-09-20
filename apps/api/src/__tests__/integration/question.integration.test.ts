/**
 * 질문 관리 시스템 통합 테스트
 *
 * @description
 * - 질문 CRUD 작업과 관련 기능들의 통합 테스트
 * - API 엔드포인트와 데이터베이스 연동 테스트
 * - SRP: 각 테스트는 특정 질문 시나리오만 검증
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { app } from "../../index";
import { prisma } from "@jeju-tourlist/database";
import { generateId } from "@jeju-tourlist/utils";

describe("Question Management Integration Tests", () => {
  let testUser: any;
  let authToken: string;
  let testQuestion: any;

  beforeAll(async () => {
    // 테스트 데이터베이스 초기화
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.user.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.category.deleteMany();
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.user.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.category.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 각 테스트 전 데이터 정리
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.user.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.category.deleteMany();

    // 테스트용 사용자 생성 및 로그인
    testUser = await prisma.user.create({
      data: {
        email: "question@example.com",
        name: "Question User",
        provider: "google",
        providerId: generateId(),
      },
    });

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "question@example.com",
        provider: "google",
        providerId: testUser.providerId,
      });

    authToken = loginResponse.body.data.token;
  });

  describe("POST /api/questions", () => {
    it("유효한 질문 데이터로 질문 생성이 성공해야 함", async () => {
      // Given
      const questionData = {
        title: "제주도 맛집 추천해주세요",
        content: "가족여행으로 제주도에 왔는데 현지인이 추천하는 맛집이 궁금합니다.",
        tags: ["맛집", "제주시", "가족여행"],
        regionCode: "jeju_city",
        categoryId: null,
      };

      // When
      const response = await request(app)
        .post("/api/questions")
        .set("Authorization", `Bearer ${authToken}`)
        .send(questionData)
        .expect(201);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.data.question.title).toBe(questionData.title);
      expect(response.body.data.question.content).toBe(questionData.content);
      expect(response.body.data.question.tags).toEqual(questionData.tags);
      expect(response.body.data.question.authorId).toBe(testUser.id);

      // 데이터베이스에 저장되었는지 확인
      const savedQuestion = await prisma.question.findFirst({
        where: { title: questionData.title },
      });
      expect(savedQuestion).toBeTruthy();
      expect(savedQuestion?.authorId).toBe(testUser.id);
    });

    it("제목이 없는 질문 생성 시 실패해야 함", async () => {
      // Given
      const questionData = {
        content: "내용만 있는 질문",
        tags: ["테스트"],
        regionCode: "jeju_city",
      };

      // When & Then
      const response = await request(app)
        .post("/api/questions")
        .set("Authorization", `Bearer ${authToken}`)
        .send(questionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("제목은 필수입니다");
    });

    it("내용이 없는 질문 생성 시 실패해야 함", async () => {
      // Given
      const questionData = {
        title: "제목만 있는 질문",
        tags: ["테스트"],
        regionCode: "jeju_city",
      };

      // When & Then
      const response = await request(app)
        .post("/api/questions")
        .set("Authorization", `Bearer ${authToken}`)
        .send(questionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("내용은 필수입니다");
    });

    it("인증되지 않은 사용자가 질문 생성 시 실패해야 함", async () => {
      // Given
      const questionData = {
        title: "인증 없는 질문",
        content: "인증 없이 작성한 질문",
        tags: ["테스트"],
        regionCode: "jeju_city",
      };

      // When & Then
      const response = await request(app)
        .post("/api/questions")
        .send(questionData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("인증이 필요합니다");
    });
  });

  describe("GET /api/questions", () => {
    beforeEach(async () => {
      // 테스트용 질문들 생성
      await prisma.question.createMany({
        data: [
          {
            id: generateId(),
            title: "첫 번째 질문",
            content: "첫 번째 질문 내용",
            authorId: testUser.id,
            tags: ["테스트1"],
            regionCode: "jeju_city",
            status: "active",
            createdAt: new Date("2024-01-01"),
          },
          {
            id: generateId(),
            title: "두 번째 질문",
            content: "두 번째 질문 내용",
            authorId: testUser.id,
            tags: ["테스트2"],
            regionCode: "seogwipo",
            status: "active",
            createdAt: new Date("2024-01-02"),
          },
          {
            id: generateId(),
            title: "세 번째 질문",
            content: "세 번째 질문 내용",
            authorId: testUser.id,
            tags: ["테스트3"],
            regionCode: "jeju_city",
            status: "closed",
            createdAt: new Date("2024-01-03"),
          },
        ],
      });
    });

    it("모든 활성 질문 목록을 조회해야 함", async () => {
      // When
      const response = await request(app)
        .get("/api/questions")
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.data.questions).toHaveLength(2); // 활성 질문만
      expect(response.body.data.pagination.total).toBe(2);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });

    it("지역별 필터링이 작동해야 함", async () => {
      // When
      const response = await request(app)
        .get("/api/questions?region=jeju_city")
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.data.questions).toHaveLength(1);
      expect(response.body.data.questions[0].regionCode).toBe("jeju_city");
    });

    it("태그별 필터링이 작동해야 함", async () => {
      // When
      const response = await request(app)
        .get("/api/questions?tags=테스트1")
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.data.questions).toHaveLength(1);
      expect(response.body.data.questions[0].tags).toContain("테스트1");
    });

    it("페이지네이션이 작동해야 함", async () => {
      // When
      const response = await request(app)
        .get("/api/questions?page=1&limit=1")
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.data.questions).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
      expect(response.body.data.pagination.total).toBe(2);
    });
  });

  describe("GET /api/questions/:id", () => {
    beforeEach(async () => {
      // 테스트용 질문 생성
      testQuestion = await prisma.question.create({
        data: {
          id: generateId(),
          title: "상세 조회 테스트 질문",
          content: "상세 조회 테스트 내용",
          authorId: testUser.id,
          tags: ["테스트"],
          regionCode: "jeju_city",
          status: "active",
        },
      });
    });

    it("존재하는 질문 ID로 상세 조회가 성공해야 함", async () => {
      // When
      const response = await request(app)
        .get(`/api/questions/${testQuestion.id}`)
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.data.question.id).toBe(testQuestion.id);
      expect(response.body.data.question.title).toBe(testQuestion.title);
      expect(response.body.data.question.content).toBe(testQuestion.content);
      expect(response.body.data.question.author).toBeDefined();
      expect(response.body.data.question.author.id).toBe(testUser.id);
    });

    it("존재하지 않는 질문 ID로 조회 시 실패해야 함", async () => {
      // When & Then
      const response = await request(app)
        .get(`/api/questions/${generateId()}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("질문을 찾을 수 없습니다");
    });

    it("삭제된 질문 조회 시 실패해야 함", async () => {
      // Given
      await prisma.question.update({
        where: { id: testQuestion.id },
        data: { status: "deleted" },
      });

      // When & Then
      const response = await request(app)
        .get(`/api/questions/${testQuestion.id}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("질문을 찾을 수 없습니다");
    });
  });

  describe("PUT /api/questions/:id", () => {
    beforeEach(async () => {
      // 테스트용 질문 생성
      testQuestion = await prisma.question.create({
        data: {
          id: generateId(),
          title: "수정 테스트 질문",
          content: "수정 테스트 내용",
          authorId: testUser.id,
          tags: ["테스트"],
          regionCode: "jeju_city",
          status: "active",
        },
      });
    });

    it("작성자가 질문 수정이 성공해야 함", async () => {
      // Given
      const updateData = {
        title: "수정된 제목",
        content: "수정된 내용",
        tags: ["수정된", "태그"],
      };

      // When
      const response = await request(app)
        .put(`/api/questions/${testQuestion.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.data.question.title).toBe(updateData.title);
      expect(response.body.data.question.content).toBe(updateData.content);
      expect(response.body.data.question.tags).toEqual(updateData.tags);

      // 데이터베이스에 반영되었는지 확인
      const updatedQuestion = await prisma.question.findUnique({
        where: { id: testQuestion.id },
      });
      expect(updatedQuestion?.title).toBe(updateData.title);
      expect(updatedQuestion?.content).toBe(updateData.content);
    });

    it("작성자가 아닌 사용자가 수정 시 실패해야 함", async () => {
      // Given
      const otherUser = await prisma.user.create({
        data: {
          email: "other@example.com",
          name: "Other User",
          provider: "google",
          providerId: generateId(),
        },
      });

      const otherUserLogin = await request(app)
        .post("/api/auth/login")
        .send({
          email: "other@example.com",
          provider: "google",
          providerId: otherUser.providerId,
        });

      const otherUserToken = otherUserLogin.body.data.token;

      const updateData = {
        title: "무단 수정 시도",
        content: "무단 수정 내용",
      };

      // When & Then
      const response = await request(app)
        .put(`/api/questions/${testQuestion.id}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("권한이 없습니다");
    });

    it("인증되지 않은 사용자가 수정 시 실패해야 함", async () => {
      // Given
      const updateData = {
        title: "인증 없는 수정",
        content: "인증 없는 수정 내용",
      };

      // When & Then
      const response = await request(app)
        .put(`/api/questions/${testQuestion.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("인증이 필요합니다");
    });
  });

  describe("DELETE /api/questions/:id", () => {
    beforeEach(async () => {
      // 테스트용 질문 생성
      testQuestion = await prisma.question.create({
        data: {
          id: generateId(),
          title: "삭제 테스트 질문",
          content: "삭제 테스트 내용",
          authorId: testUser.id,
          tags: ["테스트"],
          regionCode: "jeju_city",
          status: "active",
        },
      });
    });

    it("작성자가 질문 삭제가 성공해야 함", async () => {
      // When
      const response = await request(app)
        .delete(`/api/questions/${testQuestion.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("질문이 삭제되었습니다");

      // 데이터베이스에서 삭제되었는지 확인
      const deletedQuestion = await prisma.question.findUnique({
        where: { id: testQuestion.id },
      });
      expect(deletedQuestion?.status).toBe("deleted");
    });

    it("작성자가 아닌 사용자가 삭제 시 실패해야 함", async () => {
      // Given
      const otherUser = await prisma.user.create({
        data: {
          email: "other@example.com",
          name: "Other User",
          provider: "google",
          providerId: generateId(),
        },
      });

      const otherUserLogin = await request(app)
        .post("/api/auth/login")
        .send({
          email: "other@example.com",
          provider: "google",
          providerId: otherUser.providerId,
        });

      const otherUserToken = otherUserLogin.body.data.token;

      // When & Then
      const response = await request(app)
        .delete(`/api/questions/${testQuestion.id}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("권한이 없습니다");
    });
  });

  describe("POST /api/questions/:id/like", () => {
    beforeEach(async () => {
      // 테스트용 질문 생성
      testQuestion = await prisma.question.create({
        data: {
          id: generateId(),
          title: "좋아요 테스트 질문",
          content: "좋아요 테스트 내용",
          authorId: testUser.id,
          tags: ["테스트"],
          regionCode: "jeju_city",
          status: "active",
        },
      });
    });

    it("질문에 좋아요가 성공해야 함", async () => {
      // When
      const response = await request(app)
        .post(`/api/questions/${testQuestion.id}/like`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("좋아요를 눌렀습니다");

      // 데이터베이스에 반영되었는지 확인
      const updatedQuestion = await prisma.question.findUnique({
        where: { id: testQuestion.id },
      });
      expect(updatedQuestion?.likeCount).toBe(1);
    });

    it("이미 좋아요한 질문에 다시 좋아요 시 취소되어야 함", async () => {
      // Given - 첫 번째 좋아요
      await request(app)
        .post(`/api/questions/${testQuestion.id}/like`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // When - 두 번째 좋아요 (취소)
      const response = await request(app)
        .post(`/api/questions/${testQuestion.id}/like`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("좋아요를 취소했습니다");

      // 데이터베이스에 반영되었는지 확인
      const updatedQuestion = await prisma.question.findUnique({
        where: { id: testQuestion.id },
      });
      expect(updatedQuestion?.likeCount).toBe(0);
    });
  });
});
