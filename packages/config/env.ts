import { z } from "zod";

// 환경변수 검증 스키마
const envSchema = z
  .object({
    // 필수 환경변수
    NODE_ENV: z.enum(["development", "staging", "production"]),
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),

    // 선택적 환경변수 (기본값 제공)
    API_BASE_URL: z.string().url().default("http://localhost:4000"),
    SOCKET_URL: z.string().url().default("http://localhost:4001"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    REDIS_URL: z.string().url().default("redis://localhost:6379"),

    // OAuth 관련 (개발용 더미 값 허용)
    KAKAO_CLIENT_ID: z.string().optional(),
    KAKAO_CLIENT_SECRET: z.string().optional(),
    NAVER_CLIENT_ID: z.string().optional(),
    NAVER_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // Next.js 환경변수
    NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
    NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:4000"),

    // AWS 관련 (프로덕션에서만 필수)
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().default("ap-northeast-2"),
    S3_BUCKET_NAME: z.string().optional(),

    // 외부 API
    KAKAO_MAP_API_KEY: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
    FIREBASE_PROJECT_ID: z.string().optional(),
    SENTRY_DSN: z.string().optional(),

    // 보안 설정
    RATE_LIMIT_REQUESTS: z.string().transform(Number).default("100"),
    RATE_LIMIT_WINDOW: z.string().transform(Number).default("15"),
    SESSION_TIMEOUT: z.string().transform(Number).default("86400"),
  })
  .refine(
    data => {
      // AWS 키는 프로덕션에서 필수
      if (data.NODE_ENV === "production") {
        return data.AWS_ACCESS_KEY_ID && data.AWS_SECRET_ACCESS_KEY;
      }
      return true;
    },
    {
      message: "AWS credentials are required in production",
    }
  );

// 환경변수 로딩 및 검증
export const env = envSchema.parse(process.env);

// 타입 내보내기
export type Env = z.infer<typeof envSchema>;

// 환경별 설정 헬퍼
export const isDevelopment = env.NODE_ENV === "development";
export const isStaging = env.NODE_ENV === "staging";
export const isProduction = env.NODE_ENV === "production";

// 환경변수 검증 함수
export function validateEnv() {
  try {
    envSchema.parse(process.env);
    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError ? error.errors : error,
    };
  }
}
