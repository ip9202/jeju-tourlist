// @ts-expect-error Prisma client type recognition issue in monorepo
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
