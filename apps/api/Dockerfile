# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:18-alpine AS deps

# Build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Package files 복사
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/utils/package.json ./packages/utils/
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/

# 의존성 설치
RUN npm ci --legacy-peer-deps

# ============================================
# Stage 2: Builder
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules

# 소스 코드 복사
COPY apps/api ./apps/api
COPY packages ./packages
COPY turbo.json package.json ./

# ============================================
# Stage 3: Runner
# ============================================
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 시스템 사용자 생성
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

# OpenSSL 3.x 설치 (Prisma 엔진을 위해 필수)
RUN apk add --no-cache libc6-compat openssl

# node_modules 및 소스 복사
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

# tsx 전역 설치
RUN npm install -g tsx

# Prisma 클라이언트 생성 (빌드 타임에 실행)
WORKDIR /app/packages/database
RUN npx prisma generate

# 권한 설정
WORKDIR /app
RUN mkdir -p /app/apps/api/uploads && \
    chown -R expressjs:nodejs /app

USER expressjs

EXPOSE 4000

WORKDIR /app/apps/api

# 직접 실행
CMD ["tsx", "src/index.ts"]
