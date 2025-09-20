/**
 * EnhancedUserRepository 단위 테스트
 *
 * @description
 * - 에러 핸들링이 개선된 UserRepository의 단위 테스트
 * - 재시도 로직, 로깅, 모니터링 기능 테스트
 * - 에러 케이스 및 복구 전략 테스트
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Prisma } from "@prisma/client";
import { EnhancedUserRepository } from "../../repositories/enhanced-user.repository";
import { prisma } from "../../client";
import { CreateUserData, UpdateUserData, UserSearchOptions } from "../../types";
import {
  RecordNotFoundError,
  DuplicateRecordError,
} from "../../errors/database.errors";

// Prisma Client 모킹
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Console 모킹
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
};

// Console 모킹 설정
Object.assign(console, mockConsole);

describe("EnhancedUserRepository", () => {
  let userRepository: EnhancedUserRepository;

  beforeEach(() => {
    userRepository = new EnhancedUserRepository();
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("존재하는 사용자 ID로 조회 시 사용자 정보를 반환해야 함", async () => {
      // Given
      const userId = "user-123";
      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        provider: "google",
        providerId: "google-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        userProfile: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      // When
      const result = await userRepository.findById(userId);

      // Then
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: { userProfile: true },
      });
    });

    it("존재하지 않는 사용자 ID로 조회 시 RecordNotFoundError를 던져야 함", async () => {
      // Given
      const userId = "non-existent-user";
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // When & Then
      await expect(userRepository.findById(userId)).rejects.toThrow(
        RecordNotFoundError
      );
      await expect(userRepository.findById(userId)).rejects.toThrow(
        "User with identifier 'non-existent-user' not found"
      );
    });

    it("데이터베이스 연결 에러 발생 시 재시도해야 함", async () => {
      // Given
      const userId = "user-123";
      const connectionError = new Prisma.PrismaClientInitializationError(
        "Can't reach database server",
        "P1001"
      );

      const mockUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        provider: "google",
        providerId: "google-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        userProfile: null,
      };

      // 첫 번째 호출에서 연결 에러, 두 번째 호출에서 성공
      mockPrisma.user.findUnique
        .mockRejectedValueOnce(connectionError)
        .mockResolvedValueOnce(mockUser as any);

      // When
      const result = await userRepository.findById(userId);

      // Then
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(2);
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining(
          "Retrying findById for user user-123, attempt 1"
        )
      );
    });

    it("최대 재시도 횟수 초과 시 에러를 던져야 함", async () => {
      // Given
      const userId = "user-123";
      const connectionError = new Prisma.PrismaClientInitializationError(
        "Can't reach database server",
        "P1001"
      );

      // 모든 호출에서 연결 에러
      mockPrisma.user.findUnique.mockRejectedValue(connectionError);

      // When & Then
      await expect(userRepository.findById(userId)).rejects.toThrow();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(4); // 1 + 3 retries
    });
  });

  describe("create", () => {
    it("유효한 사용자 데이터로 생성 시 사용자를 생성해야 함", async () => {
      // Given
      const userData: CreateUserData = {
        email: "newuser@example.com",
        name: "New User",
        provider: "google",
        providerId: "google-456",
      };

      const mockCreatedUser = {
        id: "user-456",
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        userProfile: null,
      };

      mockPrisma.user.create.mockResolvedValue(mockCreatedUser as any);

      // When
      const result = await userRepository.create(userData);

      // Then
      expect(result).toEqual(mockCreatedUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: userData,
        include: { userProfile: true },
      });
    });

    it("중복된 이메일로 생성 시 DuplicateRecordError를 던져야 함", async () => {
      // Given
      const userData: CreateUserData = {
        email: "duplicate@example.com",
        name: "Duplicate User",
        provider: "google",
        providerId: "google-789",
      };

      const duplicateError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed on the constraint: `User_email_key`",
        {
          code: "P2002",
          clientVersion: "5.0.0",
          meta: {
            target: ["email"],
          },
        }
      );

      mockPrisma.user.create.mockRejectedValue(duplicateError);

      // When & Then
      await expect(userRepository.create(userData)).rejects.toThrow(
        DuplicateRecordError
      );
      await expect(userRepository.create(userData)).rejects.toThrow(
        "User with email 'email' already exists"
      );
    });

    it("에러 로깅이 수행되어야 함", async () => {
      // Given
      const userData: CreateUserData = {
        email: "test@example.com",
        name: "Test User",
        provider: "google",
        providerId: "google-123",
      };

      const dbError = new Error("Database error");
      mockPrisma.user.create.mockRejectedValue(dbError);

      // When & Then
      await expect(userRepository.create(userData)).rejects.toThrow();

      // 로깅이 호출되었는지 확인
      expect(mockConsole.error).toHaveBeenCalledWith(
        "Database Error:",
        expect.objectContaining({
          level: "error",
          error: expect.objectContaining({
            code: "UNKNOWN_PRISMA_ERROR",
          }),
        })
      );
    });

    it("에러 모니터링이 수행되어야 함", async () => {
      // Given
      const userData: CreateUserData = {
        email: "test@example.com",
        name: "Test User",
        provider: "google",
        providerId: "google-123",
      };

      const dbError = new Error("Database error");
      mockPrisma.user.create.mockRejectedValue(dbError);

      // When & Then
      await expect(userRepository.create(userData)).rejects.toThrow();

      // 모니터링이 호출되었는지 확인
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Monitoring Error:",
        expect.objectContaining({
          error: expect.objectContaining({
            code: "UNKNOWN_PRISMA_ERROR",
          }),
        })
      );
    });
  });

  describe("update", () => {
    it("유효한 사용자 ID와 데이터로 업데이트 시 사용자를 업데이트해야 함", async () => {
      // Given
      const userId = "user-123";
      const updateData: UpdateUserData = {
        name: "Updated User",
      };

      const mockUpdatedUser = {
        id: userId,
        email: "test@example.com",
        name: "Updated User",
        provider: "google",
        providerId: "google-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        userProfile: null,
      };

      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser as any);

      // When
      const result = await userRepository.update(userId, updateData);

      // Then
      expect(result).toEqual(mockUpdatedUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateData,
        include: { userProfile: true },
      });
    });

    it("존재하지 않는 사용자 ID로 업데이트 시 RecordNotFoundError를 던져야 함", async () => {
      // Given
      const userId = "non-existent-user";
      const updateData: UpdateUserData = {
        name: "Updated User",
      };

      const notFoundError = new Prisma.PrismaClientKnownRequestError(
        "Record to update not found",
        {
          code: "P2025",
          clientVersion: "5.0.0",
          meta: {
            model: "User",
            cause: userId,
          },
        }
      );

      mockPrisma.user.update.mockRejectedValue(notFoundError);

      // When & Then
      await expect(userRepository.update(userId, updateData)).rejects.toThrow(
        RecordNotFoundError
      );
    });
  });

  describe("delete", () => {
    it("존재하는 사용자 ID로 삭제 시 사용자를 삭제해야 함", async () => {
      // Given
      const userId = "user-123";
      const mockDeletedUser = {
        id: userId,
        email: "test@example.com",
        name: "Test User",
        provider: "google",
        providerId: "google-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        userProfile: null,
      };

      mockPrisma.user.delete.mockResolvedValue(mockDeletedUser as any);

      // When
      const result = await userRepository.delete(userId);

      // Then
      expect(result).toEqual(mockDeletedUser);
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
        include: { userProfile: true },
      });
    });
  });

  describe("search", () => {
    it("검색 옵션에 따라 사용자를 검색해야 함", async () => {
      // Given
      const searchOptions: UserSearchOptions = {
        query: "test",
        limit: 10,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      const mockUsers = [
        {
          id: "user-1",
          email: "test1@example.com",
          name: "Test User 1",
          provider: "google",
          providerId: "google-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          userProfile: null,
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

      // When
      const result = await userRepository.search(searchOptions);

      // Then
      expect(result).toEqual(mockUsers);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: "test", mode: "insensitive" } },
            { email: { contains: "test", mode: "insensitive" } },
          ],
        },
        include: { userProfile: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        skip: 0,
      });
    });
  });

  describe("count", () => {
    it("검색 조건에 따른 사용자 수를 반환해야 함", async () => {
      // Given
      const searchOptions: UserSearchOptions = {
        query: "test",
      };

      mockPrisma.user.count.mockResolvedValue(5);

      // When
      const result = await userRepository.count(searchOptions);

      // Then
      expect(result).toBe(5);
      expect(mockPrisma.user.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: "test", mode: "insensitive" } },
            { email: { contains: "test", mode: "insensitive" } },
          ],
        },
      });
    });
  });

  describe("exists", () => {
    it("사용자 존재 여부를 올바르게 확인해야 함", async () => {
      // Given
      const userId = "user-123";
      mockPrisma.user.count.mockResolvedValue(1);

      // When
      const result = await userRepository.exists(userId);

      // Then
      expect(result).toBe(true);
      expect(mockPrisma.user.count).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it("존재하지 않는 사용자에 대해 false를 반환해야 함", async () => {
      // Given
      const userId = "non-existent-user";
      mockPrisma.user.count.mockResolvedValue(0);

      // When
      const result = await userRepository.exists(userId);

      // Then
      expect(result).toBe(false);
    });
  });

  describe("createProfile", () => {
    it("사용자 프로필을 생성해야 함", async () => {
      // Given
      const userId = "user-123";
      const profileData = {
        bio: "Test bio",
        location: "제주시",
        website: "https://example.com",
      };

      const mockProfile = {
        id: "profile-123",
        userId,
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.userProfile.create.mockResolvedValue(mockProfile as any);

      // When
      const result = await userRepository.createProfile(userId, profileData);

      // Then
      expect(result).toEqual(mockProfile);
      expect(mockPrisma.userProfile.create).toHaveBeenCalledWith({
        data: {
          ...profileData,
          userId,
        },
      });
    });
  });
});
