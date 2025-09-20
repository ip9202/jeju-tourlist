// import { env } from "@jeju-tourlist/config";

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
