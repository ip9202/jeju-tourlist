import { PrismaClient } from "../node_modules/.prisma/client";
import { env } from "@jeju-tourlist/config";

// Prisma 클라이언트 인스턴스 생성
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

// 개발 환경에서 글로벌 객체에 저장 (Hot Reload 방지)
if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// 데이터베이스 연결 상태 확인
export async function checkDatabaseConnection(): Promise<{
  isConnected: boolean;
  version?: string;
  uptime?: number;
  lastError?: string;
}> {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const uptime = Date.now() - startTime;

    // PostgreSQL 버전 확인
    const versionResult = await prisma.$queryRaw<
      [{ version: string }]
    >`SELECT version()`;
    const version = versionResult[0]?.version;

    return {
      isConnected: true,
      version,
      uptime,
    };
  } catch (error) {
    return {
      isConnected: false,
      lastError: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// 데이터베이스 연결 종료
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

// 트랜잭션 헬퍼
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(fn);
}

// 연결 풀 상태 확인
export async function getConnectionPoolStatus() {
  try {
    const result = await prisma.$queryRaw<
      [
        {
          total_connections: number;
          active_connections: number;
          idle_connections: number;
        },
      ]
    >`
      SELECT 
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as total_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections
    `;

    return result[0];
  } catch (error) {
    console.error("Failed to get connection pool status:", error);
    return null;
  }
}
