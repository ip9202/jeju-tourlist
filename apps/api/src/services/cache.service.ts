/**
 * 캐시 서비스
 *
 * @description
 * - Redis 기반 캐싱 시스템
 * - API 응답 캐싱, 세션 관리, 실시간 데이터 캐싱
 * - SRP: 캐시 관련 작업만 담당
 */

import Redis from "ioredis";

/**
 * 캐시 서비스 클래스
 *
 * @description
 * - Redis를 사용한 고성능 캐싱 시스템
 * - 다양한 캐시 전략 지원
 * - 자동 만료 및 무효화 기능
 */
export class CacheService {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.setupEventHandlers();
  }

  /**
   * Redis 이벤트 핸들러 설정
   */
  private setupEventHandlers(): void {
    this.redis.on("connect", () => {
      console.log("Redis connected");
      this.isConnected = true;
    });

    this.redis.on("error", (error) => {
      console.error("Redis error:", error);
      this.isConnected = false;
    });

    this.redis.on("close", () => {
      console.log("Redis connection closed");
      this.isConnected = false;
    });
  }

  /**
   * 캐시 연결 확인
   */
  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.redis.connect();
      } catch (error) {
        console.error("Failed to connect to Redis:", error);
        throw new Error("Cache service unavailable");
      }
    }
  }

  /**
   * 캐시 키 생성
   *
   * @param prefix - 키 접두사
   * @param params - 키 파라미터
   * @returns 생성된 캐시 키
   */
  private generateKey(prefix: string, ...params: (string | number)[]): string {
    return `${prefix}:${params.join(":")}`;
  }

  /**
   * 데이터를 캐시에 저장
   *
   * @param key - 캐시 키
   * @param data - 저장할 데이터
   * @param ttl - 만료 시간 (초)
   * @returns 저장 성공 여부
   */
  async set(key: string, data: any, ttl: number = 3600): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const serializedData = JSON.stringify(data);
      await this.redis.setex(key, ttl, serializedData);
      
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  /**
   * 캐시에서 데이터 조회
   *
   * @param key - 캐시 키
   * @returns 조회된 데이터 또는 null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      await this.ensureConnection();
      
      const data = await this.redis.get(key);
      if (!data) {
        return null;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  /**
   * 캐시에서 데이터 삭제
   *
   * @param key - 캐시 키
   * @returns 삭제 성공 여부
   */
  async delete(key: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  /**
   * 패턴에 맞는 캐시 키들 삭제
   *
   * @param pattern - 삭제할 키 패턴
   * @returns 삭제된 키 개수
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      await this.ensureConnection();
      
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      
      const result = await this.redis.del(...keys);
      return result;
    } catch (error) {
      console.error("Cache delete pattern error:", error);
      return 0;
    }
  }

  /**
   * 캐시 존재 여부 확인
   *
   * @param key - 캐시 키
   * @returns 존재 여부
   */
  async exists(key: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Cache exists error:", error);
      return false;
    }
  }

  /**
   * 캐시 만료 시간 설정
   *
   * @param key - 캐시 키
   * @param ttl - 만료 시간 (초)
   * @returns 설정 성공 여부
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const result = await this.redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error("Cache expire error:", error);
      return false;
    }
  }

  /**
   * 캐시 만료 시간 조회
   *
   * @param key - 캐시 키
   * @returns 만료 시간 (초) 또는 -1 (만료 시간 없음)
   */
  async ttl(key: string): Promise<number> {
    try {
      await this.ensureConnection();
      
      return await this.redis.ttl(key);
    } catch (error) {
      console.error("Cache TTL error:", error);
      return -1;
    }
  }

  /**
   * 해시 필드 설정
   *
   * @param key - 해시 키
   * @param field - 필드명
   * @param value - 값
   * @returns 설정 성공 여부
   */
  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const serializedValue = JSON.stringify(value);
      const result = await this.redis.hset(key, field, serializedValue);
      return result >= 0;
    } catch (error) {
      console.error("Cache hset error:", error);
      return false;
    }
  }

  /**
   * 해시 필드 조회
   *
   * @param key - 해시 키
   * @param field - 필드명
   * @returns 조회된 값 또는 null
   */
  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      await this.ensureConnection();
      
      const data = await this.redis.hget(key, field);
      if (!data) {
        return null;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error("Cache hget error:", error);
      return null;
    }
  }

  /**
   * 해시 전체 조회
   *
   * @param key - 해시 키
   * @returns 해시 전체 데이터
   */
  async hgetall(key: string): Promise<Record<string, any>> {
    try {
      await this.ensureConnection();
      
      const data = await this.redis.hgetall(key);
      const result: Record<string, any> = {};
      
      for (const [field, value] of Object.entries(data)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      
      return result;
    } catch (error) {
      console.error("Cache hgetall error:", error);
      return {};
    }
  }

  /**
   * 해시 필드 삭제
   *
   * @param key - 해시 키
   * @param field - 필드명
   * @returns 삭제 성공 여부
   */
  async hdel(key: string, field: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const result = await this.redis.hdel(key, field);
      return result > 0;
    } catch (error) {
      console.error("Cache hdel error:", error);
      return false;
    }
  }

  /**
   * 리스트에 데이터 추가
   *
   * @param key - 리스트 키
   * @param value - 추가할 값
   * @param position - 추가 위치 ("left" | "right")
   * @returns 추가 성공 여부
   */
  async listPush(
    key: string,
    value: any,
    position: "left" | "right" = "right"
  ): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const serializedValue = JSON.stringify(value);
      const result = position === "left" 
        ? await this.redis.lpush(key, serializedValue)
        : await this.redis.rpush(key, serializedValue);
      
      return result > 0;
    } catch (error) {
      console.error("Cache list push error:", error);
      return false;
    }
  }

  /**
   * 리스트에서 데이터 조회
   *
   * @param key - 리스트 키
   * @param start - 시작 인덱스
   * @param stop - 종료 인덱스
   * @returns 조회된 데이터 배열
   */
  async listRange<T>(
    key: string,
    start: number = 0,
    stop: number = -1
  ): Promise<T[]> {
    try {
      await this.ensureConnection();
      
      const data = await this.redis.lrange(key, start, stop);
      return data.map(item => {
        try {
          return JSON.parse(item);
        } catch {
          return item;
        }
      });
    } catch (error) {
      console.error("Cache list range error:", error);
      return [];
    }
  }

  /**
   * 캐시 통계 조회
   *
   * @returns 캐시 통계 정보
   */
  async getStats(): Promise<{
    connected: boolean;
    memory: any;
    keys: number;
    hitRate: number;
  }> {
    try {
      await this.ensureConnection();
      
      const info = await this.redis.info("memory");
      const keys = await this.redis.dbsize();
      
      // 메모리 정보 파싱
      const memoryInfo: any = {};
      info.split("\r\n").forEach(line => {
        const [key, value] = line.split(":");
        if (key && value) {
          memoryInfo[key] = value;
        }
      });
      
      return {
        connected: this.isConnected,
        memory: memoryInfo,
        keys,
        hitRate: 0, // TODO: 히트율 계산 로직 구현
      };
    } catch (error) {
      console.error("Cache stats error:", error);
      return {
        connected: false,
        memory: {},
        keys: 0,
        hitRate: 0,
      };
    }
  }

  /**
   * 캐시 연결 종료
   */
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
      this.isConnected = false;
    } catch (error) {
      console.error("Cache disconnect error:", error);
    }
  }
}

// 싱글톤 인스턴스
export const cacheService = new CacheService();
