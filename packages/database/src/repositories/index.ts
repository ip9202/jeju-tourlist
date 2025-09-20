// Repository 인터페이스 내보내기
export * from "./base.repository";
export * from "./user.repository";
export * from "./question.repository";
export * from "./answer.repository";
export * from "./category.repository";

// Repository 팩토리 클래스 (DIP - Dependency Inversion Principle)
// @ts-expect-error Prisma client type recognition issue in monorepo
import { PrismaClient } from "@prisma/client";
import { IUserRepository, UserRepository } from "./user.repository";
import { IQuestionRepository, QuestionRepository } from "./question.repository";
import { IAnswerRepository, AnswerRepository } from "./answer.repository";
import { ICategoryRepository, CategoryRepository } from "./category.repository";

export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private prisma: PrismaClient;

  // Repository 인스턴스들 (싱글톤 패턴)
  private _userRepository: IUserRepository | null = null;
  private _questionRepository: IQuestionRepository | null = null;
  private _answerRepository: IAnswerRepository | null = null;
  private _categoryRepository: ICategoryRepository | null = null;

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // 싱글톤 인스턴스 생성
  public static getInstance(prisma: PrismaClient): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(prisma);
    }
    return RepositoryFactory.instance;
  }

  // Repository 게터들 (Lazy Loading)
  public get userRepository(): IUserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(this.prisma);
    }
    return this._userRepository;
  }

  public get questionRepository(): IQuestionRepository {
    if (!this._questionRepository) {
      this._questionRepository = new QuestionRepository(this.prisma);
    }
    return this._questionRepository;
  }

  public get answerRepository(): IAnswerRepository {
    if (!this._answerRepository) {
      this._answerRepository = new AnswerRepository(this.prisma);
    }
    return this._answerRepository;
  }

  public get categoryRepository(): ICategoryRepository {
    if (!this._categoryRepository) {
      this._categoryRepository = new CategoryRepository(this.prisma);
    }
    return this._categoryRepository;
  }

  // 모든 Repository 초기화
  public initializeAll(): void {
    this._userRepository = new UserRepository(this.prisma);
    this._questionRepository = new QuestionRepository(this.prisma);
    this._answerRepository = new AnswerRepository(this.prisma);
    this._categoryRepository = new CategoryRepository(this.prisma);
  }

  // 모든 Repository 정리
  public cleanup(): void {
    this._userRepository = null;
    this._questionRepository = null;
    this._answerRepository = null;
    this._categoryRepository = null;
  }
}
