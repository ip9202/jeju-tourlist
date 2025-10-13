#!/usr/bin/env node

/**
 * 배치 스케줄러 실행 스크립트
 *
 * @description
 * - 매일 새벽 4시 배지 계산 배치 작업 실행
 * - Cron Job으로 실행되는 독립적인 스크립트
 * - 에러 처리 및 로깅 포함
 *
 * @author 동네물어봐 개발팀
 * @version 1.0.0
 */

import "dotenv-flow/config";
import { PrismaClient } from "@prisma/client";
import { BatchSchedulerService } from "@jeju-tourlist/database/services/batch-scheduler.service";

// 환경변수 설정
const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://test:test@localhost:5433/asklocal_dev?schema=public",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
};

// Prisma 클라이언트 초기화
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
});

// 배치 스케줄러 서비스 초기화
const batchService = new BatchSchedulerService(prisma);

/**
 * 메인 실행 함수
 */
async function main() {
  console.log("🚀 배치 스케줄러 시작");
  console.log("📅 실행 시간:", new Date().toISOString());
  console.log("🌍 환경:", env.NODE_ENV);

  try {
    // 배치 작업 실행
    const result = await batchService.runBatchJob();

    // 결과 로깅
    console.log("✅ 배치 작업 완료");
    console.log("📊 처리 결과:", {
      성공: result.success,
      처리시간: `${Math.round(result.duration / 1000)}초`,
      처리사용자: result.processedUsers,
      새배지부여: result.newBadgesAwarded,
      알림발송: result.notificationsSent,
      오류수: result.errors.length,
    });

    // 오류가 있는 경우 상세 로깅
    if (result.errors.length > 0) {
      console.log("❌ 처리 중 오류 발생:");
      result.errors.forEach(error => {
        console.log(`  - 사용자 ${error.userId}: ${error.error}`);
      });
    }

    // 성공 시 종료 코드 0
    process.exit(0);
  } catch (error) {
    console.error("❌ 배치 작업 실행 실패:", error);
    
    // 실패 시 종료 코드 1
    process.exit(1);
  } finally {
    // Prisma 연결 종료
    await prisma.$disconnect();
  }
}

/**
 * 신호 처리 (Graceful Shutdown)
 */
process.on("SIGINT", async () => {
  console.log("⏹️ 배치 작업 중단 요청");
  try {
    await batchService.stopBatchJob();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ 중단 처리 중 오류:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("⏹️ 배치 작업 종료 요청");
  try {
    await batchService.stopBatchJob();
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ 종료 처리 중 오류:", error);
    process.exit(1);
  }
});

// 처리되지 않은 예외 처리
process.on("uncaughtException", (error) => {
  console.error("❌ 처리되지 않은 예외:", error);
  process.exit(1);
});

process.on("unhandledRejection", (_reason, _promise) => {
  console.error("❌ 처리되지 않은 Promise 거부:", _reason);
  process.exit(1);
});

// 메인 함수 실행
main().catch((error) => {
  console.error("❌ 메인 함수 실행 실패:", error);
  process.exit(1);
});
