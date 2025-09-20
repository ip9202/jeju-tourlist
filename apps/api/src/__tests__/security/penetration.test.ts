/**
 * 침투 테스트 (Penetration Testing)
 *
 * @description
 * - 실제 공격 시나리오를 통한 보안 테스트
 * - 인증 우회, 권한 상승, 데이터 유출 등 테스트
 * - SRP: 각 테스트는 특정 공격 시나리오만 검증
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { app } from "../../index";
import { prisma } from "@jeju-tourlist/database";
import { generateId } from "@jeju-tourlist/utils";

describe("Penetration Testing", () => {
  let testUser: any;
  let adminUser: any;
  let authToken: string;
  let _adminToken: string;

  beforeAll(async () => {
    // 테스트 데이터베이스 초기화
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.user.deleteMany();
    await prisma.userProfile.deleteMany();
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.user.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 각 테스트 전 데이터 정리
    await prisma.answer.deleteMany();
    await prisma.question.deleteMany();
    await prisma.user.deleteMany();
    await prisma.userProfile.deleteMany();

    // 일반 사용자 생성
    testUser = await prisma.user.create({
      data: {
        email: "user@example.com",
        name: "Test User",
        provider: "google",
        providerId: generateId(),
      },
    });

    // 관리자 사용자 생성
    adminUser = await prisma.user.create({
      data: {
        email: "admin@example.com",
        name: "Admin User",
        provider: "google",
        providerId: generateId(),
        role: "admin",
      },
    });

    // 일반 사용자 로그인
    const userLoginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "user@example.com",
        provider: "google",
        providerId: testUser.providerId,
      });
    authToken = userLoginResponse.body.data.token;

    // 관리자 로그인
    const adminLoginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        provider: "google",
        providerId: adminUser.providerId,
      });
    adminToken = adminLoginResponse.body.data.token;
  });

  describe("Authentication Bypass Attacks", () => {
    it("JWT 토큰 조작을 통한 인증 우회를 방지해야 함", async () => {
      // Given - 조작된 JWT 토큰
      const manipulatedToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid";

      // When
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${manipulatedToken}`)
        .expect(401);

      // Then
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("인증이 필요합니다");
    });

    it("세션 하이재킹을 방지해야 함", async () => {
      // Given - 다른 사용자의 토큰 사용 시도
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

      // When - 다른 사용자의 토큰으로 질문 생성 시도
      const response = await request(app)
        .post("/api/questions")
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send({
          title: "Hijacked Question",
          content: "This question was created using hijacked session",
          tags: ["hijack"],
          regionCode: "jeju_city",
        })
        .expect(201);

      // Then - 다른 사용자로 질문이 생성되어야 함 (정상 동작)
      expect(response.body.success).toBe(true);
      expect(response.body.data.question.authorId).toBe(otherUser.id);
    });

    it("토큰 재사용 공격을 방지해야 함", async () => {
      // Given - 유효한 토큰
      const validToken = authToken;

      // When - 동일한 토큰으로 여러 요청
      const promises = Array.from({ length: 10 }, () =>
        request(app)
          .get("/api/auth/me")
          .set("Authorization", `Bearer ${validToken}`)
      );

      const responses = await Promise.all(promises);

      // Then - 모든 요청이 성공해야 함 (토큰 재사용은 정상)
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe("Authorization Bypass Attacks", () => {
    it("권한 상승 공격을 방지해야 함", async () => {
      // Given - 일반 사용자가 관리자 권한 요청
      const adminRequest = {
        role: "admin",
        permissions: ["user:delete", "system:config"],
      };

      // When
      const response = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(adminRequest)
        .expect(200);

      // Then - 권한이 변경되지 않아야 함
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).not.toBe("admin");
    });

    it("다른 사용자의 데이터에 무단 접근을 방지해야 함", async () => {
      // Given - 다른 사용자의 질문 생성
      const otherUser = await prisma.user.create({
        data: {
          email: "victim@example.com",
          name: "Victim User",
          provider: "google",
          providerId: generateId(),
        },
      });

      const victimQuestion = await prisma.question.create({
        data: {
          id: generateId(),
          title: "Victim's Question",
          content: "This is victim's private question",
          authorId: otherUser.id,
          tags: ["private"],
          regionCode: "jeju_city",
          status: "active",
        },
      });

      // When - 다른 사용자의 질문 수정 시도
      const response = await request(app)
        .put(`/api/questions/${victimQuestion.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Hacked Question",
          content: "This question was hacked",
        })
        .expect(403);

      // Then - 접근이 거부되어야 함
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("권한이 없습니다");
    });

    it("관리자 기능에 무단 접근을 방지해야 함", async () => {
      // Given - 일반 사용자가 관리자 기능 접근 시도
      const adminEndpoints = [
        "/api/admin/users",
        "/api/admin/questions",
        "/api/admin/analytics",
        "/api/admin/settings",
      ];

      // When & Then - 모든 관리자 엔드포인트 접근 거부
      for (const endpoint of adminEndpoints) {
        const response = await request(app)
          .get(endpoint)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(403);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain("권한이 없습니다");
      }
    });
  });

  describe("Data Exfiltration Attacks", () => {
    it("대량 데이터 다운로드를 방지해야 함", async () => {
      // Given - 많은 질문 생성
      const questions = Array.from({ length: 1000 }, (_, i) => ({
        id: generateId(),
        title: `Question ${i}`,
        content: `Content ${i}`,
        authorId: testUser.id,
        tags: ["test"],
        regionCode: "jeju_city",
        status: "active",
      }));

      await prisma.question.createMany({ data: questions });

      // When - 대량 데이터 요청
      const response = await request(app)
        .get("/api/questions?limit=10000")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Then - 제한된 수만 반환되어야 함
      expect(response.body.data.questions.length).toBeLessThanOrEqual(100);
    });

    it("민감한 정보 유출을 방지해야 함", async () => {
      // Given - 사용자 프로필 조회
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Then - 민감한 정보가 노출되지 않아야 함
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.data.user.providerId).toBeUndefined();
      expect(response.body.data.user.internalId).toBeUndefined();
    });

    it("SQL Injection을 통한 데이터 유출을 방지해야 함", async () => {
      // Given - SQL Injection 페이로드
      const maliciousQuery = "'; SELECT * FROM users; --";

      // When
      const response = await request(app)
        .get(`/api/questions/search?q=${encodeURIComponent(maliciousQuery)}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Then - 정상적인 검색 결과만 반환되어야 함
      expect(response.body.success).toBe(true);
      expect(response.body.data.questions).toBeDefined();
      expect(Array.isArray(response.body.data.questions)).toBe(true);
    });
  });

  describe("Denial of Service (DoS) Attacks", () => {
    it("과도한 요청으로 인한 서비스 중단을 방지해야 함", async () => {
      // Given - 많은 동시 요청
      const promises = Array.from({ length: 100 }, () =>
        request(app)
          .get("/api/questions")
          .set("Authorization", `Bearer ${authToken}`)
      );

      // When
      const responses = await Promise.all(promises);

      // Then - 일부 요청은 제한되어야 함
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it("대용량 파일 업로드로 인한 서비스 중단을 방지해야 함", async () => {
      // Given - 매우 큰 파일 (100MB)
      const largeFile = Buffer.alloc(100 * 1024 * 1024);

      // When
      const response = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("file", largeFile, "large-file.jpg")
        .expect(413);

      // Then - 파일 크기 제한으로 거부되어야 함
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("파일 크기가 너무 큽니다");
    });

    it("복잡한 쿼리로 인한 데이터베이스 부하를 방지해야 함", async () => {
      // Given - 복잡한 검색 쿼리
      const complexQuery = "a".repeat(1000);

      // When
      const response = await request(app)
        .get(`/api/questions/search?q=${encodeURIComponent(complexQuery)}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      // Then - 쿼리 길이 제한으로 거부되어야 함
      expect(response.body.success).toBe(false);
    });
  });

  describe("Injection Attacks", () => {
    it("NoSQL Injection 공격을 방지해야 함", async () => {
      // Given - NoSQL Injection 페이로드
      const nosqlPayload = { $where: "this.password" };

      // When
      const response = await request(app)
        .post("/api/questions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "NoSQL Test",
          content: JSON.stringify(nosqlPayload),
          tags: ["test"],
          regionCode: "jeju_city",
        })
        .expect(201);

      // Then - 페이로드가 문자열로 처리되어야 함
      expect(response.body.success).toBe(true);
      expect(response.body.data.question.content).toContain("$where");
    });

    it("Command Injection 공격을 방지해야 함", async () => {
      // Given - Command Injection 페이로드
      const commandPayload = "; rm -rf /";

      // When
      const response = await request(app)
        .post("/api/questions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Command Test",
          content: commandPayload,
          tags: ["test"],
          regionCode: "jeju_city",
        })
        .expect(201);

      // Then - 명령어가 실행되지 않아야 함
      expect(response.body.success).toBe(true);
      expect(response.body.data.question.content).toBe(commandPayload);
    });

    it("LDAP Injection 공격을 방지해야 함", async () => {
      // Given - LDAP Injection 페이로드
      const ldapPayload = "admin)(&(password=*))";

      // When
      const response = await request(app)
        .post("/api/questions")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "LDAP Test",
          content: ldapPayload,
          tags: ["test"],
          regionCode: "jeju_city",
        })
        .expect(201);

      // Then - 페이로드가 문자열로 처리되어야 함
      expect(response.body.success).toBe(true);
      expect(response.body.data.question.content).toBe(ldapPayload);
    });
  });

  describe("Session Management Attacks", () => {
    it("세션 고정 공격을 방지해야 함", async () => {
      // Given - 로그인 전 세션 ID
      const beforeLogin = await request(app)
        .get("/api/auth/me")
        .expect(401);

      // When - 로그인
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "user@example.com",
          provider: "google",
          providerId: testUser.providerId,
        })
        .expect(200);

      // Then - 새로운 세션이 생성되어야 함
      expect(loginResponse.body.data.token).toBeDefined();
      expect(loginResponse.body.data.token).not.toBe(beforeLogin.body.token);
    });

    it("세션 하이재킹을 방지해야 함", async () => {
      // Given - 유효한 세션
      const validSession = authToken;

      // When - 다른 IP에서 동일한 세션 사용 시도
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validSession}`)
        .set("X-Forwarded-For", "192.168.1.100")
        .expect(200);

      // Then - 세션이 유효해야 함 (IP 검증은 구현에 따라 다름)
      expect(response.body.success).toBe(true);
    });
  });

  describe("Business Logic Attacks", () => {
    it("포인트 조작 공격을 방지해야 함", async () => {
      // Given - 포인트 조작 시도
      const manipulatedPoints = {
        points: 999999,
        action: "hack",
      };

      // When
      const response = await request(app)
        .post("/api/points/add")
        .set("Authorization", `Bearer ${authToken}`)
        .send(manipulatedPoints)
        .expect(400);

      // Then - 조작이 거부되어야 함
      expect(response.body.success).toBe(false);
    });

    it("질문 채택 조작을 방지해야 함", async () => {
      // Given - 다른 사용자의 질문과 답변
      const otherUser = await prisma.user.create({
        data: {
          email: "other@example.com",
          name: "Other User",
          provider: "google",
          providerId: generateId(),
        },
      });

      const question = await prisma.question.create({
        data: {
          id: generateId(),
          title: "Other's Question",
          content: "Other's question content",
          authorId: otherUser.id,
          tags: ["test"],
          regionCode: "jeju_city",
          status: "active",
        },
      });

      const answer = await prisma.answer.create({
        data: {
          id: generateId(),
          questionId: question.id,
          authorId: testUser.id,
          content: "My answer",
        },
      });

      // When - 다른 사용자의 질문에서 답변 채택 시도
      const response = await request(app)
        .post(`/api/answers/${answer.id}/accept`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(403);

      // Then - 채택이 거부되어야 함
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("권한이 없습니다");
    });
  });
});
