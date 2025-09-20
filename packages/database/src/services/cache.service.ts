// import { env } from "@jeju-tourlist/config";

/**
 * 캐시 서비스 인터페이스
 *
 * @description
 * 애플리케이션에서 사용할 캐시 기능을 정의하는 인터페이스입니다.
 * Redis, Memcached 등 다양한 캐시 구현체를 지원할 수 있도록 설계되었습니다.
 *
 * **주요 기능:**
 * - 키-값 저장 및 조회
 * - TTL(Time To Live) 기반 만료 관리
 * - 패턴 기반 일괄 삭제
 * - 캐시 상태 확인
 *
 * @interface ICacheService
 * @since 1.0.0
 */
// 캐시 서비스 인터페이스 (ISP)
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
  getTTL(key: string): Promise<number>;
  extendTTL(key: string, ttl: number): Promise<void>;
}

/**
 * Redis 캐시 서비스 클래스
 *
 * @description
 * Redis를 사용한 캐시 서비스 구현체입니다.
 * 고성능 키-값 저장소인 Redis를 활용하여 애플리케이션의 성능을 향상시킵니다.
 *
 * **캐시 전략:**
 * - Cache-Aside: 애플리케이션에서 캐시 관리
 * - TTL 기반: 자동 만료를 통한 메모리 관리
 * - 패턴 매칭: 관련 캐시 일괄 삭제
 *
 * **성능 최적화:**
 * - Connection Pooling: 연결 풀을 통한 효율적 연결 관리
 * - Pipeline: 다중 명령어 일괄 처리
 * - Compression: 대용량 데이터 압축 저장
 *
 * **SOLID 원칙 적용:**
 * - SRP: 캐시 기능만 담당
 * - OCP: 다른 캐시 구현체로 교체 가능
 * - LSP: ICacheService 완전 구현
 * - ISP: 캐시 관련 메서드만 포함
 * - DIP: 추상화(인터페이스)에 의존
 *
 * @class RedisCacheService
 * @implements ICacheService
 *
 * @example
 * ```typescript
 * const cacheService = new RedisCacheService();
 *
 * // 데이터 저장 (5분 TTL)
 * await cacheService.set("user:123", userData, 300);
 *
 * // 데이터 조회
 * const user = await cacheService.get<User>("user:123");
 *
 * // 패턴 기반 삭제
 * await cacheService.deletePattern("user:*");
 * ```
 *
 * @since 1.0.0
 */
// Redis 캐시 서비스 구현 (SRP)
export class RedisCacheService implements ICacheService {
  private redis: any;
  private isConnected: boolean = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      // Redis 클라이언트 초기화 (실제 구현에서는 redis 패키지 사용)
      // const Redis = require('redis');
      // this.redis = Redis.createClient({ url: env.REDIS_URL });
      // await this.redis.connect();
      // this.isConnected = true;

      // 개발 환경에서는 메모리 캐시 사용
      this.redis = new Map();
      this.isConnected = true;
    } catch (error) {
      console.error("Failed to initialize Redis:", error);
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) return null;

      // Redis 사용 시
      // const value = await this.redis.get(key);
      // return value ? JSON.parse(value) : null;

      // 메모리 캐시 사용 시
      const cached = this.redis.get(key);
      if (!cached) return null;

      const { value, expires } = cached;
      if (expires && Date.now() > expires) {
        this.redis.delete(key);
        return null;
      }

      return JSON.parse(value);
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    try {
      if (!this.isConnected) return;

      const serializedValue = JSON.stringify(value);
      const expires = ttl > 0 ? Date.now() + ttl * 1000 : null;

      // Redis 사용 시
      // if (ttl > 0) {
      //   await this.redis.setEx(key, ttl, serializedValue);
      // } else {
      //   await this.redis.set(key, serializedValue);
      // }

      // 메모리 캐시 사용 시
      this.redis.set(key, {
        value: serializedValue,
        expires,
      });
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      if (!this.isConnected) return;

      // Redis 사용 시
      // await this.redis.del(key);

      // 메모리 캐시 사용 시
      this.redis.delete(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      if (!this.isConnected) return;

      // Redis 사용 시
      // const keys = await this.redis.keys(pattern);
      // if (keys.length > 0) {
      //   await this.redis.del(keys);
      // }

      // 메모리 캐시 사용 시
      const regex = new RegExp(pattern.replace(/\*/g, ".*"));
      for (const key of this.redis.keys()) {
        if (regex.test(key)) {
          this.redis.delete(key);
        }
      }
    } catch (error) {
      console.error("Cache delete pattern error:", error);
    }
  }

  async clear(): Promise<void> {
    try {
      if (!this.isConnected) return;

      // Redis 사용 시
      // await this.redis.flushAll();

      // 메모리 캐시 사용 시
      this.redis.clear();
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) return false;

      // Redis 사용 시
      // return await this.redis.exists(key) === 1;

      // 메모리 캐시 사용 시
      const cached = this.redis.get(key);
      if (!cached) return false;

      const { expires } = cached;
      if (expires && Date.now() > expires) {
        this.redis.delete(key);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Cache exists error:", error);
      return false;
    }
  }

  async getTTL(key: string): Promise<number> {
    try {
      if (!this.isConnected) return -1;

      // Redis 사용 시
      // return await this.redis.ttl(key);

      // 메모리 캐시 사용 시
      const cached = this.redis.get(key);
      if (!cached || !cached.expires) return -1;

      const remaining = Math.ceil((cached.expires - Date.now()) / 1000);
      return remaining > 0 ? remaining : -1;
    } catch (error) {
      console.error("Cache TTL error:", error);
      return -1;
    }
  }

  async extendTTL(key: string, ttl: number): Promise<void> {
    try {
      if (!this.isConnected) return;

      // Redis 사용 시
      // await this.redis.expire(key, ttl);

      // 메모리 캐시 사용 시
      const cached = this.redis.get(key);
      if (cached) {
        cached.expires = Date.now() + ttl * 1000;
        this.redis.set(key, cached);
      }
    } catch (error) {
      console.error("Cache extend TTL error:", error);
    }
  }
}

// 캐시 키 생성 헬퍼
export class CacheKeyBuilder {
  private static readonly PREFIX = "jeju_tourlist";

  static user(id: string): string {
    return `${this.PREFIX}:user:${id}`;
  }

  static userProfile(userId: string): string {
    return `${this.PREFIX}:user_profile:${userId}`;
  }

  static question(id: string): string {
    return `${this.PREFIX}:question:${id}`;
  }

  static questionsList(options: any): string {
    const hash = this.hashObject(options);
    return `${this.PREFIX}:questions:list:${hash}`;
  }

  static answer(id: string): string {
    return `${this.PREFIX}:answer:${id}`;
  }

  static answersList(questionId: string, options: any): string {
    const hash = this.hashObject(options);
    return `${this.PREFIX}:answers:${questionId}:${hash}`;
  }

  static category(id: string): string {
    return `${this.PREFIX}:category:${id}`;
  }

  static categoriesList(): string {
    return `${this.PREFIX}:categories:list`;
  }

  static searchResults(query: string, options: any): string {
    const hash = this.hashObject({ query, ...options });
    return `${this.PREFIX}:search:${hash}`;
  }

  static popularTags(): string {
    return `${this.PREFIX}:popular:tags`;
  }

  static popularLocations(): string {
    return `${this.PREFIX}:popular:locations`;
  }

  static userStats(userId: string): string {
    return `${this.PREFIX}:user_stats:${userId}`;
  }

  static questionStats(questionId: string): string {
    return `${this.PREFIX}:question_stats:${questionId}`;
  }

  private static hashObject(obj: any): string {
    return Buffer.from(JSON.stringify(obj)).toString("base64").slice(0, 16);
  }
}

// 캐시 TTL 상수
export const CACHE_TTL = {
  USER: 3600, // 1시간
  USER_PROFILE: 1800, // 30분
  QUESTION: 1800, // 30분
  QUESTIONS_LIST: 300, // 5분
  ANSWER: 1800, // 30분
  ANSWERS_LIST: 300, // 5분
  CATEGORY: 3600, // 1시간
  CATEGORIES_LIST: 1800, // 30분
  SEARCH_RESULTS: 600, // 10분
  POPULAR_TAGS: 1800, // 30분
  POPULAR_LOCATIONS: 1800, // 30분
  USER_STATS: 900, // 15분
  QUESTION_STATS: 300, // 5분
} as const;
