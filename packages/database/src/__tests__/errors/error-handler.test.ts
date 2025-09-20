/**
 * 에러 핸들링 유틸리티 단위 테스트
 *
 * @description
 * - 에러 핸들링 함수들의 단위 테스트
 * - Prisma 에러 변환 테스트
 * - 에러 로깅 및 모니터링 테스트
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Prisma } from "@prisma/client";
import {
  handlePrismaError,
  logError,
  monitorError,
  canRecover,
  shouldRetry,
  notifyError,
} from "../../errors/error-handler";
import {
  DatabaseError,
  RecordNotFoundError,
  DuplicateRecordError,
  DatabaseConnectionError,
  ConstraintViolationError,
} from "../../errors/database.errors";

// Console 모킹
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
};

// Console 모킹 설정
Object.assign(console, mockConsole);

describe("Error Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("handlePrismaError", () => {
    it("Prisma Known Request Error를 적절한 커스텀 에러로 변환해야 함", () => {
      // Given
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed on the constraint: `User_email_key`",
        {
          code: "P2002",
          clientVersion: "5.0.0",
          meta: {
            target: ["email"],
          },
        }
      );

      // When
      const result = handlePrismaError(prismaError, { operation: "create" });

      // Then
      expect(result).toBeInstanceOf(DuplicateRecordError);
      expect(result.code).toBe("DUPLICATE_RECORD");
      expect(result.statusCode).toBe(409);
    });

    it("Record Not Found Error를 적절히 변환해야 함", () => {
      // Given
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Record to update not found",
        {
          code: "P2025",
          clientVersion: "5.0.0",
          meta: {
            model: "User",
            cause: "user-123",
          },
        }
      );

      // When
      const result = handlePrismaError(prismaError, { operation: "update" });

      // Then
      expect(result).toBeInstanceOf(RecordNotFoundError);
      expect(result.code).toBe("RECORD_NOT_FOUND");
      expect(result.statusCode).toBe(404);
    });

    it("Foreign Key Constraint Error를 적절히 변환해야 함", () => {
      // Given
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Foreign key constraint failed",
        {
          code: "P2003",
          clientVersion: "5.0.0",
          meta: {
            field_name: "userId",
          },
        }
      );

      // When
      const result = handlePrismaError(prismaError, { operation: "create" });

      // Then
      expect(result).toBeInstanceOf(ConstraintViolationError);
      expect(result.code).toBe("CONSTRAINT_VIOLATION");
      expect(result.statusCode).toBe(400);
    });

    it("Database Connection Error를 적절히 변환해야 함", () => {
      // Given
      const prismaError = new Prisma.PrismaClientInitializationError(
        "Can't reach database server",
        "P1001"
      );

      // When
      const result = handlePrismaError(prismaError, { operation: "connect" });

      // Then
      expect(result).toBeInstanceOf(DatabaseConnectionError);
      expect(result.code).toBe("DATABASE_CONNECTION_ERROR");
      expect(result.statusCode).toBe(503);
    });

    it("Validation Error를 적절히 변환해야 함", () => {
      // Given
      const prismaError = new Prisma.PrismaClientValidationError(
        "Invalid value for field `email`"
      );

      // When
      const result = handlePrismaError(prismaError, { operation: "create" });

      // Then
      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.code).toBe("VALIDATION_ERROR");
      expect(result.statusCode).toBe(400);
    });

    it("Rust Panic Error를 적절히 변환해야 함", () => {
      // Given
      const prismaError = new Prisma.PrismaClientRustPanicError(
        "Rust panic occurred",
        "5.0.0"
      );

      // When
      const result = handlePrismaError(prismaError, { operation: "query" });

      // Then
      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.code).toBe("RUST_PANIC_ERROR");
      expect(result.statusCode).toBe(500);
    });

    it("알 수 없는 에러를 적절히 처리해야 함", () => {
      // Given
      const unknownError = new Error("Unknown error");

      // When
      const result = handlePrismaError(unknownError, { operation: "unknown" });

      // Then
      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.code).toBe("UNKNOWN_PRISMA_ERROR");
      expect(result.statusCode).toBe(500);
    });

    it("에러가 아닌 값을 적절히 처리해야 함", () => {
      // Given
      const nonError = "Not an error";

      // When
      const result = handlePrismaError(nonError, { operation: "unknown" });

      // Then
      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.code).toBe("UNKNOWN_ERROR");
      expect(result.statusCode).toBe(500);
    });
  });

  describe("logError", () => {
    it("에러를 적절히 로깅해야 함", () => {
      // Given
      const error = new DatabaseError("Test error", "TEST_ERROR", 500);
      const context = { operation: "test" };

      // When
      logError(error, "error", context);

      // Then
      expect(mockConsole.error).toHaveBeenCalledWith(
        "Database Error:",
        expect.objectContaining({
          timestamp: expect.any(String),
          level: "error",
          error: expect.objectContaining({
            name: "DatabaseError",
            message: "Test error",
            code: "TEST_ERROR",
            statusCode: 500,
          }),
          context: expect.objectContaining({
            operation: "test",
          }),
        })
      );
    });

    it("경고 레벨로 로깅해야 함", () => {
      // Given
      const error = new DatabaseError("Test warning", "TEST_WARNING", 400);

      // When
      logError(error, "warn");

      // Then
      expect(mockConsole.warn).toHaveBeenCalledWith(
        "Database Warning:",
        expect.objectContaining({
          level: "warn",
        })
      );
    });

    it("정보 레벨로 로깅해야 함", () => {
      // Given
      const error = new DatabaseError("Test info", "TEST_INFO", 200);

      // When
      logError(error, "info");

      // Then
      expect(mockConsole.info).toHaveBeenCalledWith(
        "Database Info:",
        expect.objectContaining({
          level: "info",
        })
      );
    });
  });

  describe("monitorError", () => {
    it("에러를 모니터링해야 함", () => {
      // Given
      const error = new DatabaseError("Test error", "TEST_ERROR", 500);
      const context = { operation: "test" };

      // When
      monitorError(error, context);

      // Then
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Monitoring Error:",
        expect.objectContaining({
          error: expect.objectContaining({
            name: "DatabaseError",
            message: "Test error",
            code: "TEST_ERROR",
          }),
          context: expect.objectContaining({
            operation: "test",
          }),
        })
      );
    });
  });

  describe("canRecover", () => {
    it("복구 가능한 에러를 올바르게 식별해야 함", () => {
      // Given
      const recoverableError = new DatabaseConnectionError("Connection failed");
      const nonRecoverableError = new RecordNotFoundError("User", "user-123");

      // When & Then
      expect(canRecover(recoverableError)).toBe(true);
      expect(canRecover(nonRecoverableError)).toBe(false);
    });
  });

  describe("shouldRetry", () => {
    it("재시도 가능한 에러와 횟수에 따라 올바르게 판단해야 함", () => {
      // Given
      const retryableError = new DatabaseConnectionError("Connection failed");
      const nonRetryableError = new RecordNotFoundError("User", "user-123");

      // When & Then
      expect(shouldRetry(retryableError, 0)).toBe(true);
      expect(shouldRetry(retryableError, 1)).toBe(true);
      expect(shouldRetry(retryableError, 2)).toBe(true);
      expect(shouldRetry(retryableError, 3)).toBe(false); // 최대 재시도 횟수 초과

      expect(shouldRetry(nonRetryableError, 0)).toBe(false);
      expect(shouldRetry(nonRetryableError, 1)).toBe(false);
    });
  });

  describe("notifyError", () => {
    it("에러 알림을 전송해야 함", () => {
      // Given
      const error = new DatabaseError("Test error", "TEST_ERROR", 500);
      const context = { operation: "test" };

      // When
      notifyError(error, context);

      // Then
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Error Notification:",
        expect.objectContaining({
          error: expect.objectContaining({
            name: "DatabaseError",
            message: "Test error",
            code: "TEST_ERROR",
          }),
          context: expect.objectContaining({
            operation: "test",
          }),
        })
      );
    });
  });
});
