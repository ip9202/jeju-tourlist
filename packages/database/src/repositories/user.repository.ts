import { PrismaClient, User, UserProfile } from "@prisma/client";
import { BaseRepository } from "./base.repository";
import {
  CreateUserData,
  UpdateUserData,
  UserSearchOptions,
  CreateUserProfileData,
  UpdateUserProfileData,
  UserStats,
} from "../types/user";

/**
 * 사용자 Repository 인터페이스
 *
 * @description
 * 사용자 관련 데이터 접근 인터페이스를 정의합니다.
 * Interface Segregation Principle (ISP)를 준수하여 클라이언트가
 * 필요한 메서드만 의존하도록 설계되었습니다.
 *
 * @interface IUserRepository
 * @since 1.0.0
 */
// 사용자 Repository 인터페이스 (ISP)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByProvider(provider: string, providerId: string): Promise<User | null>;
  findByNickname(nickname: string): Promise<User | null>;
  findMany(options?: UserSearchOptions): Promise<User[]>;
  findManyPaginated(
    options: UserSearchOptions & { pagination: { page: number; limit: number } }
  ): Promise<{ data: User[]; pagination: any }>;
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
  count(options?: UserSearchOptions): Promise<number>;

  // 사용자 프로필 관련
  findProfileByUserId(userId: string): Promise<UserProfile | null>;
  createProfile(data: CreateUserProfileData): Promise<UserProfile>;
  updateProfile(
    userId: string,
    data: UpdateUserProfileData
  ): Promise<UserProfile>;

  // 통계 관련
  getUserStats(userId: string): Promise<UserStats>;
  updateUserPoints(userId: string, points: number): Promise<User>;
  updateUserLevel(userId: string, level: number): Promise<User>;
}

// 사용자 Repository 구현 (SRP)

/**
 * 사용자 Repository 클래스
 *
 * @description
 * 사용자 관련 데이터베이스 작업을 담당하는 Repository 클래스입니다.
 * SOLID 원칙을 준수하여 설계되었습니다:
 * - SRP: 사용자 데이터 접근만 담당
 * - OCP: BaseRepository를 확장하여 기능 추가
 * - LSP: IUserRepository 인터페이스 완전 구현
 * - ISP: 사용자 관련 메서드만 포함
 * - DIP: 추상화(인터페이스)에 의존
 *
 * @class UserRepository
 * @extends BaseRepository
 * @implements IUserRepository
 *
 * @example
 * ```typescript
 * const userRepo = new UserRepository(prisma);
 *
 * // 사용자 조회
 * const user = await userRepo.findById("user123");
 *
 * // 사용자 생성
 * const newUser = await userRepo.create({
 *   email: "test@example.com",
 *   name: "홍길동",
 *   nickname: "길동이",
 *   provider: "kakao",
 *   providerId: "kakao123"
 * });
 * ```
 *
 * @since 1.0.0
 */
export class UserRepository
  extends BaseRepository<
    User,
    CreateUserData,
    UpdateUserData,
    UserSearchOptions
  >
  implements IUserRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma, "User");
  }

  /**
   * ID로 사용자 조회
   *
   * @description
   * 주어진 ID를 사용하여 단일 사용자를 조회합니다.
   * 사용자가 존재하지 않으면 null을 반환합니다.
   *
   * @param {string} id - 조회할 사용자의 고유 ID
   * @returns {Promise<User | null>} 조회된 사용자 정보 또는 null
   *
   * @throws {Error} 데이터베이스 연결 오류 시
   *
   * @example
   * ```typescript
   * const user = await userRepo.findById("user123");
   * if (user) {
   *   console.log(`사용자 이름: ${user.name}`);
   * }
   * ```
   */
  async findById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, "findById");
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      this.handleError(error, "findByEmail");
    }
  }

  async findByProvider(
    provider: string,
    providerId: string
  ): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: {
          provider,
          providerId,
        },
      });
    } catch (error) {
      this.handleError(error, "findByProvider");
    }
  }

  async findByNickname(nickname: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { nickname },
      });
    } catch (error) {
      this.handleError(error, "findByNickname");
    }
  }

  async findMany(options: UserSearchOptions = {}): Promise<User[]> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );

      return await this.prisma.user.findMany({
        where,
        orderBy,
        take: options.pagination?.limit,
        skip: options.pagination
          ? (options.pagination.page - 1) * options.pagination.limit
          : undefined,
      });
    } catch (error) {
      this.handleError(error, "findMany");
    }
  }

  async findManyPaginated(
    options: UserSearchOptions & { pagination: { page: number; limit: number } }
  ): Promise<{ data: User[]; pagination: any }> {
    try {
      const where = this.buildWhereClause(options);
      const orderBy = this.buildOrderByClause(
        options.sortBy,
        options.sortOrder
      );
      const { page, limit } = options.pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        this.prisma.user.count({ where }),
      ]);

      return this.paginate(data, total, { page, limit });
    } catch (error) {
      this.handleError(error, "findManyPaginated");
    }
  }

  /**
   * 새로운 사용자 생성
   *
   * @description
   * 제공된 데이터를 사용하여 새로운 사용자를 생성합니다.
   * 이메일과 닉네임의 고유성을 보장하며, 중복 시 에러를 발생시킵니다.
   *
   * @param {CreateUserData} data - 생성할 사용자 정보
   * @param {string} data.email - 사용자 이메일 (고유)
   * @param {string} data.name - 사용자 실명
   * @param {string} data.nickname - 사용자 닉네임 (고유)
   * @param {string} data.provider - 소셜 로그인 제공자 (kakao, naver, google)
   * @param {string} data.providerId - 제공자별 고유 ID
   * @param {string} [data.avatar] - 프로필 이미지 URL (선택적)
   *
   * @returns {Promise<User>} 생성된 사용자 정보
   *
   * @throws {Error} 이메일 중복 시 "Email already exists" 에러
   * @throws {Error} 닉네임 중복 시 "Nickname already exists" 에러
   * @throws {Error} 데이터베이스 연결 오류 시
   *
   * @example
   * ```typescript
   * const newUser = await userRepo.create({
   *   email: "user@example.com",
   *   name: "홍길동",
   *   nickname: "길동이",
   *   provider: "kakao",
   *   providerId: "kakao123456",
   *   avatar: "https://example.com/avatar.jpg"
   * });
   * console.log(`새 사용자 생성: ${newUser.name}`);
   * ```
   */
  async create(data: CreateUserData): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "create");
    }
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "update");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.handleError(error, "delete");
    }
  }

  async count(options: UserSearchOptions = {}): Promise<number> {
    try {
      const where = this.buildWhereClause(options);
      return await this.prisma.user.count({ where });
    } catch (error) {
      this.handleError(error, "count");
    }
  }

  // 사용자 프로필 관련 메서드
  async findProfileByUserId(userId: string): Promise<UserProfile | null> {
    try {
      return await this.prisma.userProfile.findUnique({
        where: { userId },
      });
    } catch (error) {
      this.handleError(error, "findProfileByUserId");
    }
  }

  async createProfile(data: CreateUserProfileData): Promise<UserProfile> {
    try {
      return await this.prisma.userProfile.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "createProfile");
    }
  }

  async updateProfile(
    userId: string,
    data: UpdateUserProfileData
  ): Promise<UserProfile> {
    try {
      return await this.prisma.userProfile.update({
        where: { userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "updateProfile");
    }
  }

  // 통계 관련 메서드
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const [user, questionStats, answerStats, likeStats, bookmarkStats] =
        await Promise.all([
          this.prisma.user.findUnique({
            where: { id: userId },
            select: { points: true, level: true, createdAt: true },
          }),
          this.prisma.question.count({
            where: { authorId: userId },
          }),
          this.prisma.answer.count({
            where: { authorId: userId },
          }),
          (await this.prisma.questionLike.count({
            where: { userId },
          })) +
            (await this.prisma.answerLike.count({
              where: { userId, isLike: true },
            })),
          this.prisma.bookmark.count({
            where: { userId },
          }),
        ]);

      if (!user) {
        throw new Error("User not found");
      }

      return {
        totalQuestions: questionStats,
        totalAnswers: answerStats,
        totalLikes: likeStats,
        totalBookmarks: bookmarkStats,
        points: user.points,
        level: user.level,
        badges: 0, // TODO: 배지 시스템 구현 후 추가
        joinDate: user.createdAt,
        lastActivity: user.createdAt, // TODO: 실제 마지막 활동 시간으로 업데이트
      };
    } catch (error) {
      this.handleError(error, "getUserStats");
    }
  }

  async updateUserPoints(userId: string, points: number): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: points,
          },
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "updateUserPoints");
    }
  }

  async updateUserLevel(userId: string, level: number): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: {
          level,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handleError(error, "updateUserLevel");
    }
  }

  protected buildWhereClause(options: UserSearchOptions): any {
    const where: any = {};

    if (options.query) {
      where.OR = [
        { name: { contains: options.query, mode: "insensitive" } },
        { nickname: { contains: options.query, mode: "insensitive" } },
        { email: { contains: options.query, mode: "insensitive" } },
      ];
    }

    if (options.location) {
      where.location = { contains: options.location, mode: "insensitive" };
    }

    if (options.isJejuResident !== undefined) {
      where.userProfile = {
        isJejuResident: options.isJejuResident,
      };
    }

    if (options.interests && options.interests.length > 0) {
      where.userProfile = {
        ...where.userProfile,
        interests: {
          hasSome: options.interests,
        },
      };
    }

    if (options.hasProfile !== undefined) {
      if (options.hasProfile) {
        where.userProfile = {
          ...where.userProfile,
          isNot: null,
        };
      } else {
        where.userProfile = null;
      }
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    return where;
  }
}
