/**
 * 데이터베이스 에러 핸들링 유틸리티
 *
 * @description
 * - Prisma 에러를 커스텀 에러로 변환
 * - 에러 로깅 및 모니터링
 * - 에러 분류 및 처리 전략
 */

import { Prisma } from "@prisma/client";
import {
  DatabaseError,
  RecordNotFoundError,
  DuplicateRecordError,
  DatabaseConnectionError,
  TransactionError,
  ConstraintViolationError,
  DatabaseTimeoutError,
  DatabaseSchemaError,
} from "./database.errors";

/**
 * Prisma 에러를 커스텀 에러로 변환
 *
 * @param error - Prisma 에러 객체
 * @param context - 추가 컨텍스트 정보
 * @returns 변환된 커스텍 에러
 */
export function handlePrismaError(
  error: unknown,
  context?: Record<string, any>
): DatabaseError {
  // Prisma 에러가 아닌 경우
  if (!(error instanceof Error)) {
    return new DatabaseError("Unknown error occurred", "UNKNOWN_ERROR", 500, {
      originalError: error,
      ...context,
    });
  }

  // Prisma Client 에러 처리
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handleKnownRequestError(error, context);
  }

  // Prisma Client 초기화 에러 처리
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return handleInitializationError(error, context);
  }

  // Prisma Client 검증 에러 처리
  if (error instanceof Prisma.PrismaClientValidationError) {
    return handleValidationError(error, context);
  }

  // Prisma Client 런타임 에러 처리
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return handleRustPanicError(error, context);
  }

  // 기타 에러 처리
  return new DatabaseError(error.message, "UNKNOWN_PRISMA_ERROR", 500, {
    originalError: error.message,
    ...context,
  });
}

/**
 * Prisma Known Request Error 처리
 */
function handleKnownRequestError(
  error: Prisma.PrismaClientKnownRequestError,
  context?: Record<string, any>
): DatabaseError {
  const { code, meta } = error;

  switch (code) {
    case "P2002": // Unique constraint violation
      return new DuplicateRecordError(
        meta?.target?.[0] || "record",
        meta?.target?.[0] || "field",
        meta?.target?.[1] || "value",
        { ...context, prismaCode: code, meta }
      );

    case "P2025": // Record not found
      return new RecordNotFoundError(
        meta?.model || "record",
        meta?.cause || "unknown",
        { ...context, prismaCode: code, meta }
      );

    case "P2003": // Foreign key constraint violation
      return new ConstraintViolationError(
        "foreign_key",
        `Foreign key constraint failed: ${error.message}`,
        { ...context, prismaCode: code, meta }
      );

    case "P2004": // Constraint violation
      return new ConstraintViolationError(
        meta?.constraint || "unknown",
        error.message,
        { ...context, prismaCode: code, meta }
      );

    case "P2021": // Table does not exist
      return new DatabaseSchemaError(
        `Table '${meta?.table}' does not exist`,
        meta?.table || "unknown",
        { ...context, prismaCode: code, meta }
      );

    case "P2022": // Column does not exist
      return new DatabaseSchemaError(
        `Column '${meta?.column}' does not exist`,
        meta?.table || "unknown",
        { ...context, prismaCode: code, meta }
      );

    case "P2024": // Timed out
      return new DatabaseTimeoutError(
        meta?.operation || "unknown",
        meta?.timeout || 0,
        { ...context, prismaCode: code, meta }
      );

    case "P2027": // Multiple errors occurred
      return new DatabaseError(
        `Multiple errors occurred: ${error.message}`,
        "MULTIPLE_ERRORS",
        500,
        { ...context, prismaCode: code, meta }
      );

    case "P2034": // Transaction failed
      return new TransactionError(`Transaction failed: ${error.message}`, {
        ...context,
        prismaCode: code,
        meta,
      });

    default:
      return new DatabaseError(
        error.message,
        "PRISMA_KNOWN_REQUEST_ERROR",
        500,
        { ...context, prismaCode: code, meta }
      );
  }
}

/**
 * Prisma Initialization Error 처리
 */
function handleInitializationError(
  error: Prisma.PrismaClientInitializationError,
  context?: Record<string, any>
): DatabaseError {
  return new DatabaseConnectionError(
    `Database initialization failed: ${error.message}`,
    { ...context, errorCode: error.errorCode }
  );
}

/**
 * Prisma Validation Error 처리
 */
function handleValidationError(
  error: Prisma.PrismaClientValidationError,
  context?: Record<string, any>
): DatabaseError {
  return new DatabaseError(
    `Validation error: ${error.message}`,
    "VALIDATION_ERROR",
    400,
    { ...context }
  );
}

/**
 * Prisma Rust Panic Error 처리
 */
function handleRustPanicError(
  error: Prisma.PrismaClientRustPanicError,
  context?: Record<string, any>
): DatabaseError {
  return new DatabaseError(
    `Rust panic error: ${error.message}`,
    "RUST_PANIC_ERROR",
    500,
    { ...context }
  );
}

/**
 * 에러 로깅
 *
 * @param error - 에러 객체
 * @param level - 로그 레벨
 * @param context - 추가 컨텍스트
 */
export function logError(
  error: DatabaseError,
  level: "error" | "warn" | "info" = "error",
  context?: Record<string, any>
): void {
  const logData = {
    timestamp: error.timestamp.toISOString(),
    level,
    error: error.toJSON(),
    context: { ...error.context, ...context },
  };

  // 실제 프로덕션에서는 적절한 로깅 라이브러리 사용
  if (level === "error") {
    console.error("Database Error:", logData);
  } else if (level === "warn") {
    console.warn("Database Warning:", logData);
  } else {
    console.info("Database Info:", logData);
  }
}

/**
 * 에러 모니터링 (Sentry, DataDog 등)
 *
 * @param error - 에러 객체
 * @param context - 추가 컨텍스트
 */
export function monitorError(
  error: DatabaseError,
  context?: Record<string, any>
): void {
  // 실제 프로덕션에서는 모니터링 서비스 사용
  console.log("Monitoring Error:", {
    error: error.toJSON(),
    context,
  });
}

/**
 * 에러 복구 전략
 *
 * @param error - 에러 객체
 * @returns 복구 가능 여부
 */
export function canRecover(error: DatabaseError): boolean {
  const recoverableCodes = [
    "DATABASE_CONNECTION_ERROR",
    "DATABASE_TIMEOUT",
    "QUERY_EXECUTION_ERROR",
  ];

  return recoverableCodes.includes(error.code);
}

/**
 * 에러 재시도 전략
 *
 * @param error - 에러 객체
 * @param attempt - 현재 시도 횟수
 * @returns 재시도 가능 여부
 */
export function shouldRetry(error: DatabaseError, attempt: number): boolean {
  const maxRetries = 3;
  const retryableCodes = [
    "DATABASE_CONNECTION_ERROR",
    "DATABASE_TIMEOUT",
    "QUERY_EXECUTION_ERROR",
  ];

  return attempt < maxRetries && retryableCodes.includes(error.code);
}

/**
 * 에러 알림 전송
 *
 * @param error - 에러 객체
 * @param context - 추가 컨텍스트
 */
export function notifyError(
  error: DatabaseError,
  context?: Record<string, any>
): void {
  // 실제 프로덕션에서는 알림 서비스 사용 (Slack, Email 등)
  console.log("Error Notification:", {
    error: error.toJSON(),
    context,
  });
}
