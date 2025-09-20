/**
 * 인증 시스템 통합 테스트
 *
 * @description
 * - 인증 플로우 전체에 대한 통합 테스트
 * - API 엔드포인트와 데이터베이스 연동 테스트
 * - SRP: 각 테스트는 특정 인증 시나리오만 검증
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { app } from "../../index";
import { prisma } from "@jeju-tourlist/database";
import { generateId } from "@jeju-tourlist/utils";

describe("Authentication Integration Tests", () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // 테스트 데이터베이스 초기화
    await prisma.user.deleteMany();
    await prisma.userProfile.deleteMany();
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.user.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // 각 테스트 전 데이터 정리
    await prisma.user.deleteMany();
    await prisma.userProfile.deleteMany();
  });

  describe("POST /api/auth/register", () => {
    it("유효한 사용자 정보로 회원가입이 성공해야 함", async () => {
      // Given
      const userData = {
        email: "test@example.com",
        name: "Test User",
        provider: "google",
        providerId: generateId(),
      };

      // When
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();

      // 데이터베이스에 저장되었는지 확인
      const savedUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(savedUser).toBeTruthy();
      expect(savedUser?.email).toBe(userData.email);
    });

    it("중복된 이메일로 회원가입 시 실패해야 함", async () => {
      // Given
      const userData = {
        email: "duplicate@example.com",
        name: "Test User",
        provider: "google",
        providerId: generateId(),
      };

      // 첫 번째 사용자 생성
      await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      // When & Then
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("이미 존재하는 이메일");
    });

    it("유효하지 않은 이메일로 회원가입 시 실패해야 함", async () => {
      // Given
      const userData = {
        email: "invalid-email",
        name: "Test User",
        provider: "google",
        providerId: generateId(),
      };

      // When & Then
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("유효하지 않은 이메일");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // 테스트용 사용자 생성
      testUser = await prisma.user.create({
        data: {
          email: "login@example.com",
          name: "Login User",
          provider: "google",
          providerId: generateId(),
        },
      });
    });

    it("유효한 이메일로 로그인이 성공해야 함", async () => {
      // Given
      const loginData = {
        email: "login@example.com",
        provider: "google",
        providerId: testUser.providerId,
      };

      // When
      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();

      authToken = response.body.data.token;
    });

    it("존재하지 않는 이메일로 로그인 시 실패해야 함", async () => {
      // Given
      const loginData = {
        email: "nonexistent@example.com",
        provider: "google",
        providerId: generateId(),
      };

      // When & Then
      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("사용자를 찾을 수 없습니다");
    });
  });

  describe("GET /api/auth/me", () => {
    beforeEach(async () => {
      // 테스트용 사용자 생성 및 로그인
      testUser = await prisma.user.create({
        data: {
          email: "me@example.com",
          name: "Me User",
          provider: "google",
          providerId: generateId(),
        },
      });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "me@example.com",
          provider: "google",
          providerId: testUser.providerId,
        });

      authToken = loginResponse.body.data.token;
    });

    it("유효한 토큰으로 사용자 정보 조회가 성공해야 함", async () => {
      // When
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("me@example.com");
      expect(response.body.data.user.name).toBe("Me User");
    });

    it("유효하지 않은 토큰으로 조회 시 실패해야 함", async () => {
      // When & Then
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("인증이 필요합니다");
    });

    it("토큰 없이 조회 시 실패해야 함", async () => {
      // When & Then
      const response = await request(app)
        .get("/api/auth/me")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("인증이 필요합니다");
    });
  });

  describe("POST /api/auth/logout", () => {
    beforeEach(async () => {
      // 테스트용 사용자 생성 및 로그인
      testUser = await prisma.user.create({
        data: {
          email: "logout@example.com",
          name: "Logout User",
          provider: "google",
          providerId: generateId(),
        },
      });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "logout@example.com",
          provider: "google",
          providerId: testUser.providerId,
        });

      authToken = loginResponse.body.data.token;
    });

    it("유효한 토큰으로 로그아웃이 성공해야 함", async () => {
      // When
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("로그아웃되었습니다");

      // 로그아웃 후 토큰이 무효화되었는지 확인
      const meResponse = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(401);

      expect(meResponse.body.success).toBe(false);
    });
  });

  describe("PUT /api/auth/profile", () => {
    beforeEach(async () => {
      // 테스트용 사용자 생성 및 로그인
      testUser = await prisma.user.create({
        data: {
          email: "profile@example.com",
          name: "Profile User",
          provider: "google",
          providerId: generateId(),
        },
      });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "profile@example.com",
          provider: "google",
          providerId: testUser.providerId,
        });

      authToken = loginResponse.body.data.token;
    });

    it("유효한 프로필 정보로 업데이트가 성공해야 함", async () => {
      // Given
      const profileData = {
        name: "Updated Name",
        bio: "Updated bio",
        location: "Seoul, Korea",
      };

      // When
      const response = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(profileData)
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(profileData.name);

      // 데이터베이스에 반영되었는지 확인
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
        include: { userProfile: true },
      });
      expect(updatedUser?.name).toBe(profileData.name);
    });

    it("유효하지 않은 데이터로 업데이트 시 실패해야 함", async () => {
      // Given
      const invalidData = {
        email: "invalid-email", // 유효하지 않은 이메일
      };

      // When & Then
      const response = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("유효하지 않은");
    });
  });

  describe("DELETE /api/auth/account", () => {
    beforeEach(async () => {
      // 테스트용 사용자 생성 및 로그인
      testUser = await prisma.user.create({
        data: {
          email: "delete@example.com",
          name: "Delete User",
          provider: "google",
          providerId: generateId(),
        },
      });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "delete@example.com",
          provider: "google",
          providerId: testUser.providerId,
        });

      authToken = loginResponse.body.data.token;
    });

    it("유효한 토큰으로 계정 삭제가 성공해야 함", async () => {
      // When
      const response = await request(app)
        .delete("/api/auth/account")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Then
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain("계정이 삭제되었습니다");

      // 데이터베이스에서 삭제되었는지 확인
      const deletedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(deletedUser).toBeNull();
    });
  });
});
