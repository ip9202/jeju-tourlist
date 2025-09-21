/**
 * 베이스 서비스 클래스
 * 모든 서비스 클래스의 공통 기능을 제공
 */

import { PrismaClient } from '../../node_modules/.prisma/client';

export abstract class BaseService {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * 트랜잭션 실행 헬퍼
   */
  protected async executeInTransaction<T>(
    fn: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  /**
   * 로그 헬퍼
   */
  protected log(message: string, data?: any) {
    console.log(`[${this.constructor.name}] ${message}`, data || '');
  }

  /**
   * 에러 로그 헬퍼
   */
  protected logError(message: string, error: any) {
    console.error(`[${this.constructor.name}] ${message}`, error);
  }
}