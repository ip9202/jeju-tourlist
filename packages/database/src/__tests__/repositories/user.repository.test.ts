/**
 * UserRepository 단위 테스트
 *
 * @description
 * - UserRepository의 모든 메서드에 대한 단위 테스트
 * - CRUD 작업, 검색, 필터링 기능 테스트
 * - 에러 케이스 및 엣지 케이스 테스트
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { UserRepository } from "../../repositories/user.repository";
import { prisma } from "../../client";
import { CreateUserData, UpdateUserData, UserSearchOptions } from "../../types";

// Prisma Client 모킹
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("UserRepository", () => {
  let userRepository: UserRepository;

  beforeEach(() => {
    userRepository = new UserRepository();
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

    it("존재하지 않는 사용자 ID로 조회 시 null을 반환해야 함", async () => {
      // Given
      const userId = "non-existent-user";
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // When
      const result = await userRepository.findById(userId);

      // Then
      expect(result).toBeNull();
    });

    it("데이터베이스 에러 발생 시 에러를 던져야 함", async () => {
      // Given
      const userId = "user-123";
      const dbError = new Error("Database connection failed");
      mockPrisma.user.findUnique.mockRejectedValue(dbError);

      // When & Then
      await expect(userRepository.findById(userId)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("findByEmail", () => {
    it("존재하는 이메일로 조회 시 사용자 정보를 반환해야 함", async () => {
      // Given
      const email = "test@example.com";
      const mockUser = {
        id: "user-123",
        email,
        name: "Test User",
        provider: "google",
        providerId: "google-123",
        createdAt: new Date(),
        updatedAt: new Date(),
        userProfile: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      // When
      const result = await userRepository.findByEmail(email);

      // Then
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
        include: { userProfile: true },
      });
    });

    it("존재하지 않는 이메일로 조회 시 null을 반환해야 함", async () => {
      // Given
      const email = "nonexistent@example.com";
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // When
      const result = await userRepository.findByEmail(email);

      // Then
      expect(result).toBeNull();
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

    it("중복된 이메일로 생성 시 에러를 던져야 함", async () => {
      // Given
      const userData: CreateUserData = {
        email: "duplicate@example.com",
        name: "Duplicate User",
        provider: "google",
        providerId: "google-789",
      };

      const duplicateError = new Error("Unique constraint failed on email");
      mockPrisma.user.create.mockRejectedValue(duplicateError);

      // When & Then
      await expect(userRepository.create(userData)).rejects.toThrow(
        "Unique constraint failed on email"
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

    it("존재하지 않는 사용자 ID로 업데이트 시 에러를 던져야 함", async () => {
      // Given
      const userId = "non-existent-user";
      const updateData: UpdateUserData = {
        name: "Updated User",
      };

      const notFoundError = new Error("Record to update not found");
      mockPrisma.user.update.mockRejectedValue(notFoundError);

      // When & Then
      await expect(userRepository.update(userId, updateData)).rejects.toThrow(
        "Record to update not found"
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

    it("존재하지 않는 사용자 ID로 삭제 시 에러를 던져야 함", async () => {
      // Given
      const userId = "non-existent-user";
      const notFoundError = new Error("Record to delete does not exist");
      mockPrisma.user.delete.mockRejectedValue(notFoundError);

      // When & Then
      await expect(userRepository.delete(userId)).rejects.toThrow(
        "Record to delete does not exist"
      );
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
        {
          id: "user-2",
          email: "test2@example.com",
          name: "Test User 2",
          provider: "google",
          providerId: "google-2",
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

    it("빈 검색 결과 시 빈 배열을 반환해야 함", async () => {
      // Given
      const searchOptions: UserSearchOptions = {
        query: "nonexistent",
        limit: 10,
        offset: 0,
      };

      mockPrisma.user.findMany.mockResolvedValue([]);

      // When
      const result = await userRepository.search(searchOptions);

      // Then
      expect(result).toEqual([]);
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
});
