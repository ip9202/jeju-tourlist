/**
 * 향상된 UserRepository
 *
 * @description
 * - 에러 핸들링이 개선된 UserRepository
 * - 재시도 로직, 로깅, 모니터링 포함
 * - SOLID 원칙을 준수한 설계
 */

import { prisma } from "../client";
import {
  CreateUserData,
  UpdateUserData,
  UserSearchOptions,
  User,
} from "../types";
import { BaseRepository } from "./base.repository";
import {
  handlePrismaError,
  logError,
  monitorError,
  shouldRetry,
} from "../errors/error-handler";
import {
  RecordNotFoundError,
  DuplicateRecordError,
} from "../errors/database.errors";

/**
 * 향상된 UserRepository 클래스
 *
 * @description
 * - 에러 핸들링, 재시도 로직, 로깅이 포함된 UserRepository
 * - BaseRepository를 상속하여 공통 기능 활용
 * - SOLID 원칙을 준수한 설계
 */
export class EnhancedUserRepository extends BaseRepository<User> {
  constructor() {
    super(prisma.user);
  }

  /**
   * ID로 사용자 조회 (에러 핸들링 포함)
   *
   * @param id - 사용자 ID
   * @param retryCount - 재시도 횟수 (기본값: 0)
   * @returns 사용자 정보 또는 null
   * @throws RecordNotFoundError - 사용자를 찾을 수 없는 경우
   */
  async findById(id: string, retryCount: number = 0): Promise<User | null> {
    try {
      const user = await this.prisma.findUnique({
        where: { id },
        include: { userProfile: true },
      });

      if (!user) {
        throw new RecordNotFoundError("User", id, { operation: "findById" });
      }

      return user as User;
    } catch (error) {
      const dbError = handlePrismaError(error, {
        operation: "findById",
        id,
        retryCount,
      });

      // 로깅
      logError(dbError, "error", { operation: "findById", id, retryCount });

      // 모니터링
      monitorError(dbError, { operation: "findById", id, retryCount });

      // 재시도 가능한 에러인 경우 재시도
      if (shouldRetry(dbError, retryCount)) {
        console.log(
          `Retrying findById for user ${id}, attempt ${retryCount + 1}`
        );
        return this.findById(id, retryCount + 1);
      }

      throw dbError;
    }
  }

  /**
   * 이메일로 사용자 조회 (에러 핸들링 포함)
   *
   * @param email - 사용자 이메일
   * @param retryCount - 재시도 횟수 (기본값: 0)
   * @returns 사용자 정보 또는 null
   */
  async findByEmail(
    email: string,
    retryCount: number = 0
  ): Promise<User | null> {
    try {
      const user = await this.prisma.findUnique({
        where: { email },
        include: { userProfile: true },
      });

      return user as User | null;
    } catch (error) {
      const dbError = handlePrismaError(error, {
        operation: "findByEmail",
        email,
        retryCount,
      });

      // 로깅
      logError(dbError, "error", {
        operation: "findByEmail",
        email,
        retryCount,
      });

      // 모니터링
      monitorError(dbError, { operation: "findByEmail", email, retryCount });

      // 재시도 가능한 에러인 경우 재시도
      if (shouldRetry(dbError, retryCount)) {
        console.log(
          `Retrying findByEmail for email ${email}, attempt ${retryCount + 1}`
        );
        return this.findByEmail(email, retryCount + 1);
      }

      throw dbError;
    }
  }

  /**
   * 사용자 생성 (에러 핸들링 포함)
   *
   * @param data - 사용자 생성 데이터
   * @param retryCount - 재시도 횟수 (기본값: 0)
   * @returns 생성된 사용자 정보
   * @throws DuplicateRecordError - 중복된 이메일인 경우
   */
  async create(data: CreateUserData, retryCount: number = 0): Promise<User> {
    try {
      const user = await this.prisma.create({
        data,
        include: { userProfile: true },
      });

      return user as User;
    } catch (error) {
      const dbError = handlePrismaError(error, {
        operation: "create",
        data,
        retryCount,
      });

      // 로깅
      logError(dbError, "error", { operation: "create", data, retryCount });

      // 모니터링
      monitorError(dbError, { operation: "create", data, retryCount });

      // 중복 레코드 에러인 경우 특별 처리
      if (dbError instanceof DuplicateRecordError) {
        throw dbError;
      }

      // 재시도 가능한 에러인 경우 재시도
      if (shouldRetry(dbError, retryCount)) {
        console.log(
          `Retrying create for user ${data.email}, attempt ${retryCount + 1}`
        );
        return this.create(data, retryCount + 1);
      }

      throw dbError;
    }
  }

  /**
   * 사용자 업데이트 (에러 핸들링 포함)
   *
   * @param id - 사용자 ID
   * @param data - 업데이트 데이터
   * @param retryCount - 재시도 횟수 (기본값: 0)
   * @returns 업데이트된 사용자 정보
   * @throws RecordNotFoundError - 사용자를 찾을 수 없는 경우
   */
  async update(
    id: string,
    data: UpdateUserData,
    retryCount: number = 0
  ): Promise<User> {
    try {
      const user = await this.prisma.update({
        where: { id },
        data,
        include: { userProfile: true },
      });

      return user as User;
    } catch (error) {
      const dbError = handlePrismaError(error, {
        operation: "update",
        id,
        data,
        retryCount,
      });

      // 로깅
      logError(dbError, "error", { operation: "update", id, data, retryCount });

      // 모니터링
      monitorError(dbError, { operation: "update", id, data, retryCount });

      // 재시도 가능한 에러인 경우 재시도
      if (shouldRetry(dbError, retryCount)) {
        console.log(
          `Retrying update for user ${id}, attempt ${retryCount + 1}`
        );
        return this.update(id, data, retryCount + 1);
      }

      throw dbError;
    }
  }

  /**
   * 사용자 삭제 (에러 핸들링 포함)
   *
   * @param id - 사용자 ID
   * @param retryCount - 재시도 횟수 (기본값: 0)
   * @returns 삭제된 사용자 정보
   * @throws RecordNotFoundError - 사용자를 찾을 수 없는 경우
   */
  async delete(id: string, retryCount: number = 0): Promise<User> {
    try {
      const user = await this.prisma.delete({
        where: { id },
        include: { userProfile: true },
      });

      return user as User;
    } catch (error) {
      const dbError = handlePrismaError(error, {
        operation: "delete",
        id,
        retryCount,
      });

      // 로깅
      logError(dbError, "error", { operation: "delete", id, retryCount });

      // 모니터링
      monitorError(dbError, { operation: "delete", id, retryCount });

      // 재시도 가능한 에러인 경우 재시도
      if (shouldRetry(dbError, retryCount)) {
        console.log(
          `Retrying delete for user ${id}, attempt ${retryCount + 1}`
        );
        return this.delete(id, retryCount + 1);
      }

      throw dbError;
    }
  }

  /**
   * 사용자 검색 (에러 핸들링 포함)
   *
   * @param options - 검색 옵션
   * @param retryCount - 재시도 횟수 (기본값: 0)
   * @returns 검색 결과
   */
  async search(
    options: UserSearchOptions,
    retryCount: number = 0
  ): Promise<User[]> {
    try {
      const whereClause = this.buildWhereClause(options);

      const users = await this.prisma.findMany({
        where: whereClause,
        include: { userProfile: true },
        orderBy: this.buildOrderBy(options),
        take: options.limit || 10,
        skip: options.offset || 0,
      });

      return users as User[];
    } catch (error) {
      const dbError = handlePrismaError(error, {
        operation: "search",
        options,
        retryCount,
      });

      // 로깅
      logError(dbError, "error", { operation: "search", options, retryCount });

      // 모니터링
      monitorError(dbError, { operation: "search", options, retryCount });

      // 재시도 가능한 에러인 경우 재시도
      if (shouldRetry(dbError, retryCount)) {
        console.log(`Retrying search, attempt ${retryCount + 1}`);
        return this.search(options, retryCount + 1);
      }

      throw dbError;
    }
  }

  /**
   * 사용자 수 조회 (에러 핸들링 포함)
   *
   * @param options - 검색 옵션
   * @param retryCount - 재시도 횟수 (기본값: 0)
   * @returns 사용자 수
   */
  async count(
    options: UserSearchOptions,
    retryCount: number = 0
  ): Promise<number> {
    try {
      const whereClause = this.buildWhereClause(options);

      const count = await this.prisma.count({
        where: whereClause,
      });

      return count;
    } catch (error) {
      const dbError = handlePrismaError(error, {
        operation: "count",
        options,
        retryCount,
      });

      // 로깅
      logError(dbError, "error", { operation: "count", options, retryCount });

      // 모니터링
      monitorError(dbError, { operation: "count", options, retryCount });

      // 재시도 가능한 에러인 경우 재시도
      if (shouldRetry(dbError, retryCount)) {
        console.log(`Retrying count, attempt ${retryCount + 1}`);
        return this.count(options, retryCount + 1);
      }

      throw dbError;
    }
  }

  /**
   * 사용자 존재 여부 확인 (에러 핸들링 포함)
   *
   * @param id - 사용자 ID
   * @param retryCount - 재시도 횟수 (기본값: 0)
   * @returns 존재 여부
   */
  async exists(id: string, retryCount: number = 0): Promise<boolean> {
    try {
      const count = await this.prisma.count({
        where: { id },
      });

      return count > 0;
    } catch (error) {
      const dbError = handlePrismaError(error, {
        operation: "exists",
        id,
        retryCount,
      });

      // 로깅
      logError(dbError, "error", { operation: "exists", id, retryCount });

      // 모니터링
      monitorError(dbError, { operation: "exists", id, retryCount });

      // 재시도 가능한 에러인 경우 재시도
      if (shouldRetry(dbError, retryCount)) {
        console.log(
          `Retrying exists for user ${id}, attempt ${retryCount + 1}`
        );
        return this.exists(id, retryCount + 1);
      }

      throw dbError;
    }
  }

  /**
   * 사용자 프로필 생성 (에러 핸들링 포함)
   *
   * @param userId - 사용자 ID
   * @param profileData - 프로필 데이터
   * @param retryCount - 재시도 횟수 (기본값: 0)
   * @returns 생성된 프로필 정보
   */
  async createProfile(
    userId: string,
    profileData: any,
    retryCount: number = 0
  ): Promise<any> {
    try {
      const profile = await prisma.userProfile.create({
        data: {
          ...profileData,
          userId,
        },
      });

      return profile;
    } catch (error) {
      const dbError = handlePrismaError(error, {
        operation: "createProfile",
        userId,
        profileData,
        retryCount,
      });

      // 로깅
      logError(dbError, "error", {
        operation: "createProfile",
        userId,
        profileData,
        retryCount,
      });

      // 모니터링
      monitorError(dbError, {
        operation: "createProfile",
        userId,
        profileData,
        retryCount,
      });

      // 재시도 가능한 에러인 경우 재시도
      if (shouldRetry(dbError, retryCount)) {
        console.log(
          `Retrying createProfile for user ${userId}, attempt ${retryCount + 1}`
        );
        return this.createProfile(userId, profileData, retryCount + 1);
      }

      throw dbError;
    }
  }
}
