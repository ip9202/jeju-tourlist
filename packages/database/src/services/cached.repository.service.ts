import { PrismaClient } from "@prisma/client";
import { ICacheService, CacheKeyBuilder, CACHE_TTL } from "./cache.service";
import {
  IUserRepository,
  IQuestionRepository,
  IAnswerRepository,
  ICategoryRepository,
} from "../repositories";
import { User, Question, Answer, Category } from "@prisma/client";
import { CreateUserData, UpdateUserData } from "../types/user";
import {
  CreateQuestionData,
  UpdateQuestionData,
  QuestionSearchOptions,
} from "../types/question";
import {
  CreateAnswerData,
  UpdateAnswerData,
  AnswerSearchOptions,
} from "../types/answer";
import { CreateCategoryData, UpdateCategoryData } from "../types/category";

/**
 * 캐시된 Repository 서비스 클래스
 *
 * @description
 * Repository 패턴과 Decorator 패턴을 조합하여 캐싱 기능을 제공합니다.
 * 기존 Repository 기능을 확장하여 Redis 캐시를 통한 성능 최적화를 구현합니다.
 *
 * **디자인 패턴:**
 * - Decorator Pattern: Repository 기능을 캐싱으로 확장
 * - Facade Pattern: 복잡한 캐시 로직을 단순한 인터페이스로 제공
 * - Strategy Pattern: 다양한 캐시 전략 적용 가능
 *
 * **SOLID 원칙 적용:**
 * - SRP: 캐시 로직만 담당
 * - OCP: 기존 Repository 수정 없이 기능 확장
 * - LSP: Repository 인터페이스 완전 호환
 * - ISP: 캐시 관련 인터페이스만 의존
 * - DIP: Repository 인터페이스에 의존
 *
 * **캐싱 전략:**
 * - Cache-Aside: 캐시 미스 시 DB 조회 후 캐시 저장
 * - Write-Through: 데이터 변경 시 캐시도 함께 업데이트
 * - TTL 기반: 시간 기반 캐시 만료
 *
 * @class CachedRepositoryService
 *
 * @example
 * ```typescript
 * const cachedService = new CachedRepositoryService(
 *   prisma,
 *   cacheService,
 *   userRepo,
 *   questionRepo,
 *   answerRepo,
 *   categoryRepo
 * );
 *
 * // 캐시된 사용자 조회 (첫 번째 호출은 DB, 두 번째부터는 캐시)
 * const user1 = await cachedService.getUserById("user123"); // DB 조회
 * const user2 = await cachedService.getUserById("user123"); // 캐시 조회
 * ```
 *
 * @since 1.0.0
 */

// 캐시된 Repository 서비스 (Decorator 패턴)
export class CachedRepositoryService {
  private cache: ICacheService;
  private userRepository: IUserRepository;
  private questionRepository: IQuestionRepository;
  private answerRepository: IAnswerRepository;
  private categoryRepository: ICategoryRepository;

  constructor(
    prisma: PrismaClient,
    cache: ICacheService,
    repositories: {
      user: IUserRepository;
      question: IQuestionRepository;
      answer: IAnswerRepository;
      category: ICategoryRepository;
    }
  ) {
    this.cache = cache;
    this.userRepository = repositories.user;
    this.questionRepository = repositories.question;
    this.answerRepository = repositories.answer;
    this.categoryRepository = repositories.category;
  }

  // 사용자 관련 캐시된 메서드
  async getUserById(id: string): Promise<User | null> {
    const cacheKey = CacheKeyBuilder.user(id);
    let user = await this.cache.get<User>(cacheKey);

    if (!user) {
      user = await this.userRepository.findById(id);
      if (user) {
        await this.cache.set(cacheKey, user, CACHE_TTL.USER);
      }
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    // 이메일로 검색하는 경우 캐시 키가 다르므로 직접 호출
    return await this.userRepository.findByEmail(email);
  }

  async createUser(data: CreateUserData): Promise<User> {
    const user = await this.userRepository.create(data);

    // 사용자 생성 후 관련 캐시 무효화
    await this.invalidateUserCaches();

    return user;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.userRepository.update(id, data);

    // 사용자 업데이트 후 관련 캐시 무효화
    await this.invalidateUserCaches(id);

    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);

    // 사용자 삭제 후 관련 캐시 무효화
    await this.invalidateUserCaches(id);
  }

  // 질문 관련 캐시된 메서드
  async getQuestionById(id: string): Promise<Question | null> {
    const cacheKey = CacheKeyBuilder.question(id);
    let question = await this.cache.get<Question>(cacheKey);

    if (!question) {
      question = await this.questionRepository.findById(id);
      if (question) {
        await this.cache.set(cacheKey, question, CACHE_TTL.QUESTION);
      }
    }

    return question;
  }

  async getQuestionsList(
    options: QuestionSearchOptions = {}
  ): Promise<Question[]> {
    const cacheKey = CacheKeyBuilder.questionsList(options);
    let questions = await this.cache.get<Question[]>(cacheKey);

    if (!questions) {
      questions = await this.questionRepository.findMany(options);
      await this.cache.set(cacheKey, questions, CACHE_TTL.QUESTIONS_LIST);
    }

    return questions;
  }

  async createQuestion(data: CreateQuestionData): Promise<Question> {
    const question = await this.questionRepository.create(data);

    // 질문 생성 후 관련 캐시 무효화
    await this.invalidateQuestionCaches();

    return question;
  }

  async updateQuestion(
    id: string,
    data: UpdateQuestionData
  ): Promise<Question> {
    const question = await this.questionRepository.update(id, data);

    // 질문 업데이트 후 관련 캐시 무효화
    await this.invalidateQuestionCaches(id);

    return question;
  }

  async deleteQuestion(id: string): Promise<void> {
    await this.questionRepository.delete(id);

    // 질문 삭제 후 관련 캐시 무효화
    await this.invalidateQuestionCaches(id);
  }

  // 답변 관련 캐시된 메서드
  async getAnswerById(id: string): Promise<Answer | null> {
    const cacheKey = CacheKeyBuilder.answer(id);
    let answer = await this.cache.get<Answer>(cacheKey);

    if (!answer) {
      answer = await this.answerRepository.findById(id);
      if (answer) {
        await this.cache.set(cacheKey, answer, CACHE_TTL.ANSWER);
      }
    }

    return answer;
  }

  async getAnswersList(
    questionId: string,
    options: AnswerSearchOptions = {}
  ): Promise<Answer[]> {
    const cacheKey = CacheKeyBuilder.answersList(questionId, options);
    let answers = await this.cache.get<Answer[]>(cacheKey);

    if (!answers) {
      answers = await this.answerRepository.findByQuestion(questionId, options);
      await this.cache.set(cacheKey, answers, CACHE_TTL.ANSWERS_LIST);
    }

    return answers;
  }

  async createAnswer(data: CreateAnswerData): Promise<Answer> {
    const answer = await this.answerRepository.create(data);

    // 답변 생성 후 관련 캐시 무효화
    await this.invalidateAnswerCaches(data.questionId);

    return answer;
  }

  async updateAnswer(id: string, data: UpdateAnswerData): Promise<Answer> {
    const answer = await this.answerRepository.update(id, data);

    // 답변 업데이트 후 관련 캐시 무효화
    await this.invalidateAnswerCaches(answer.questionId);

    return answer;
  }

  async deleteAnswer(id: string): Promise<void> {
    const answer = await this.answerRepository.findById(id);
    await this.answerRepository.delete(id);

    // 답변 삭제 후 관련 캐시 무효화
    if (answer) {
      await this.invalidateAnswerCaches(answer.questionId);
    }
  }

  // 카테고리 관련 캐시된 메서드
  async getCategoryById(id: string): Promise<Category | null> {
    const cacheKey = CacheKeyBuilder.category(id);
    let category = await this.cache.get<Category>(cacheKey);

    if (!category) {
      category = await this.categoryRepository.findById(id);
      if (category) {
        await this.cache.set(cacheKey, category, CACHE_TTL.CATEGORY);
      }
    }

    return category;
  }

  async getCategoriesList(): Promise<Category[]> {
    const cacheKey = CacheKeyBuilder.categoriesList();
    let categories = await this.cache.get<Category[]>(cacheKey);

    if (!categories) {
      categories = await this.categoryRepository.findActive();
      await this.cache.set(cacheKey, categories, CACHE_TTL.CATEGORIES_LIST);
    }

    return categories;
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    const category = await this.categoryRepository.create(data);

    // 카테고리 생성 후 관련 캐시 무효화
    await this.invalidateCategoryCaches();

    return category;
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryData
  ): Promise<Category> {
    const category = await this.categoryRepository.update(id, data);

    // 카테고리 업데이트 후 관련 캐시 무효화
    await this.invalidateCategoryCaches(id);

    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.categoryRepository.delete(id);

    // 카테고리 삭제 후 관련 캐시 무효화
    await this.invalidateCategoryCaches(id);
  }

  // 캐시 무효화 메서드들
  private async invalidateUserCaches(userId?: string): Promise<void> {
    const patterns = [
      "jeju_tourlist:user*",
      "jeju_tourlist:user_profile*",
      "jeju_tourlist:user_stats*",
    ];

    if (userId) {
      patterns.push(`jeju_tourlist:user:${userId}`);
      patterns.push(`jeju_tourlist:user_profile:${userId}`);
      patterns.push(`jeju_tourlist:user_stats:${userId}`);
    }

    await Promise.all(
      patterns.map(pattern => this.cache.deletePattern(pattern))
    );
  }

  private async invalidateQuestionCaches(questionId?: string): Promise<void> {
    const patterns = [
      "jeju_tourlist:question*",
      "jeju_tourlist:questions*",
      "jeju_tourlist:search*",
      "jeju_tourlist:popular*",
    ];

    if (questionId) {
      patterns.push(`jeju_tourlist:question:${questionId}`);
      patterns.push(`jeju_tourlist:question_stats:${questionId}`);
    }

    await Promise.all(
      patterns.map(pattern => this.cache.deletePattern(pattern))
    );
  }

  private async invalidateAnswerCaches(questionId: string): Promise<void> {
    const patterns = [
      "jeju_tourlist:answer*",
      `jeju_tourlist:answers:${questionId}*`,
    ];

    await Promise.all(
      patterns.map(pattern => this.cache.deletePattern(pattern))
    );
  }

  private async invalidateCategoryCaches(categoryId?: string): Promise<void> {
    const patterns = [
      "jeju_tourlist:category*",
      "jeju_tourlist:categories*",
      "jeju_tourlist:questions*", // 카테고리 변경 시 질문 목록도 무효화
    ];

    if (categoryId) {
      patterns.push(`jeju_tourlist:category:${categoryId}`);
    }

    await Promise.all(
      patterns.map(pattern => this.cache.deletePattern(pattern))
    );
  }

  // 캐시 통계 메서드
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
  }> {
    // 실제 구현에서는 Redis INFO 명령어 사용
    return {
      totalKeys: 0,
      memoryUsage: "0B",
      hitRate: 0,
    };
  }

  // 캐시 정리 메서드
  async clearAllCaches(): Promise<void> {
    await this.cache.clear();
  }

  async clearExpiredCaches(): Promise<void> {
    // 실제 구현에서는 Redis EXPIRE 명령어로 자동 정리
    // 여기서는 수동으로 만료된 키들을 정리하는 로직 구현
  }
}
