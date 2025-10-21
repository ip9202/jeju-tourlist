/**
 * 데이터베이스 관련 커스텀 에러 클래스들
 *
 * @description
 * - 데이터베이스 작업 중 발생하는 다양한 에러 상황을 명확하게 구분
 * - 에러 코드, 메시지, 상세 정보를 포함한 구조화된 에러 처리
 * - 로깅 및 모니터링을 위한 메타데이터 제공
 */

/**
 * 데이터베이스 기본 에러 클래스
 */
export class DatabaseError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    this.context = context;

    // Error.captureStackTrace가 있는 경우 스택 트레이스 캡처
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * 에러를 JSON 형태로 직렬화
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
  }
}

/**
 * 레코드를 찾을 수 없을 때 발생하는 에러
 */
export class RecordNotFoundError extends DatabaseError {
  constructor(
    entity: string,
    identifier: string | Record<string, any>,
    context?: Record<string, any>
  ) {
    const idStr =
      typeof identifier === "string" ? identifier : JSON.stringify(identifier);

    super(
      `${entity} with identifier '${idStr}' not found`,
      "RECORD_NOT_FOUND",
      404,
      { entity, identifier, ...context }
    );
  }
}

/**
 * 중복된 레코드가 존재할 때 발생하는 에러
 */
export class DuplicateRecordError extends DatabaseError {
  constructor(
    entity: string,
    field: string,
    value: any,
    context?: Record<string, any>
  ) {
    super(
      `${entity} with ${field} '${value}' already exists`,
      "DUPLICATE_RECORD",
      409,
      { entity, field, value, ...context }
    );
  }
}

/**
 * 데이터베이스 연결 에러
 */
export class DatabaseConnectionError extends DatabaseError {
  constructor(
    message: string = "Database connection failed",
    context?: Record<string, any>
  ) {
    super(message, "DATABASE_CONNECTION_ERROR", 503, context);
  }
}

/**
 * 데이터베이스 쿼리 실행 에러
 */
export class QueryExecutionError extends DatabaseError {
  constructor(
    query: string,
    originalError: Error,
    context?: Record<string, any>
  ) {
    super(
      `Query execution failed: ${originalError.message}`,
      "QUERY_EXECUTION_ERROR",
      500,
      { query, originalError: originalError.message, ...context }
    );
  }
}

/**
 * 데이터베이스 트랜잭션 에러
 */
export class TransactionError extends DatabaseError {
  constructor(
    message: string = "Transaction failed",
    context?: Record<string, any>
  ) {
    super(message, "TRANSACTION_ERROR", 500, context);
  }
}

/**
 * 데이터베이스 제약 조건 위반 에러
 */
export class ConstraintViolationError extends DatabaseError {
  constructor(
    constraint: string,
    message: string,
    context?: Record<string, any>
  ) {
    super(
      `Constraint violation: ${constraint} - ${message}`,
      "CONSTRAINT_VIOLATION",
      400,
      { constraint, ...context }
    );
  }
}

/**
 * 데이터베이스 타임아웃 에러
 */
export class DatabaseTimeoutError extends DatabaseError {
  constructor(
    operation: string,
    timeout: number,
    context?: Record<string, any>
  ) {
    super(
      `Database operation '${operation}' timed out after ${timeout}ms`,
      "DATABASE_TIMEOUT",
      504,
      { operation, timeout, ...context }
    );
  }
}

/**
 * 데이터베이스 권한 에러
 */
export class DatabasePermissionError extends DatabaseError {
  constructor(
    operation: string,
    resource: string,
    context?: Record<string, any>
  ) {
    super(
      `Permission denied for operation '${operation}' on resource '${resource}'`,
      "DATABASE_PERMISSION_ERROR",
      403,
      { operation, resource, ...context }
    );
  }
}

/**
 * 데이터베이스 스키마 에러
 */
export class DatabaseSchemaError extends DatabaseError {
  constructor(message: string, schema: string, context?: Record<string, any>) {
    super(`Schema error: ${message}`, "DATABASE_SCHEMA_ERROR", 500, {
      schema,
      ...context,
    });
  }
}

/**
 * 데이터베이스 마이그레이션 에러
 */
export class DatabaseMigrationError extends DatabaseError {
  constructor(
    migration: string,
    message: string,
    context?: Record<string, any>
  ) {
    super(
      `Migration '${migration}' failed: ${message}`,
      "DATABASE_MIGRATION_ERROR",
      500,
      { migration, ...context }
    );
  }
}

/**
 * 데이터베이스 백업 에러
 */
export class DatabaseBackupError extends DatabaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(
      `Database backup failed: ${message}`,
      "DATABASE_BACKUP_ERROR",
      500,
      context
    );
  }
}

/**
 * 데이터베이스 복원 에러
 */
export class DatabaseRestoreError extends DatabaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(
      `Database restore failed: ${message}`,
      "DATABASE_RESTORE_ERROR",
      500,
      context
    );
  }
}
