# CLAUDE.md

## 🎯 프로젝트 개요

**"동네물어봐" (AskLocal)** - 제주도 여행자와 현지 주민을 연결하는 실시간 여행 Q&A 커뮤니티

### 핵심 컨셉

- **브랜드**: "동네물어봐" (AskLocal)
- **핵심**: 제주 여행자 ↔ 현지 주민 실시간 Q&A
- **비즈니스**: 커뮤니티 + 리워드 → 업체 제휴 → AI 추천
- **플랫폼**: 웹 우선 → 모바일 앱 확장

### 기술 스택

- **프론트엔드**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **백엔드**: Node.js + Express.js + PostgreSQL + Prisma ORM
- **실시간**: Socket.io + NextAuth.js

---

## 🚀 개발 환경 실행 정책

### 🐳 **배포용: Docker 전체 스택**

```bash
# 전체 스택 실행 (배포/테스트용)
docker-compose up -d

# 서비스 확인
docker-compose ps
```

### ⚡ **개발용: 하이브리드 환경 (권장)**

**빠른 개발을 위한 최적화된 환경**

```bash
# 1. 데이터베이스 및 Prisma Studio만 Docker로 실행
docker-compose up -d postgres redis prisma-studio

# 2. API 서버 로컬 실행 (핫리로드)
cd apps/api && npm run dev

# 3. 웹 서버 로컬 실행 (핫리로드)
cd apps/web && npm run dev
```

**🎯 하이브리드 환경의 장점:**

- ✅ **빠른 개발**: CSS/JS 수정 시 즉시 반영 (빌드 불필요)
- ✅ **정확한 테스트**: 로컬 환경에서 정확한 크기/동작 확인
- ✅ **메모리 효율**: 불필요한 컨테이너 빌드 없음
- ✅ **디버깅 용이**: 로컬 개발 도구 활용 가능

**📊 서비스별 실행 방식:**
| 서비스 | 개발용 | 배포용 | 포트 | 컨테이너명 |
|--------|--------|--------|------|-----------|
| PostgreSQL | 🐳 Docker | 🐳 Docker | 5433 | jeju-postgres |
| Redis | 🐳 Docker | 🐳 Docker | 6379 | jeju-redis |
| Prisma Studio | 🐳 Docker | 🐳 Docker | 5555 | jeju-prisma-studio |
| API Server | ⚡ 로컬 | 🐳 Docker | 4000 | jeju-api |
| Web Server | ⚡ 로컬 | 🐳 Docker | 3000 | jeju-web |

**📈 현재 데이터 현황 (2025-10-09):**

- **카테고리**: 9개 (맛집, 관광지, 숙박, 교통, 액티비티, 쇼핑, 일반, 문화, 자연)
- **사용자**: 10명 (테스트 사용자)
- **질문**: 100개 (카테고리별 분포 정상화 완료)
- **페이징**: UI 개선 완료 (현재 페이지 명확한 구분)

---

## 📅 개발 진행 상황 (시간순)

### Phase 1.1~1.7: 핵심 기능 완성 (2025-10-04 이전)

✅ **완료된 기능들**:

- 온보딩 플로우
- 질문 작성 및 답변
- 검색 및 필터링
- 현지인 전문가 기능
- 실시간 알림 시스템
- 북마크 및 공유
- 에러 처리 및 검증

### Phase 1.8: 답변 댓글 기능 (2025-10-04)

✅ **완료**:

- DB 스키마: `AnswerComment`, `AnswerCommentLike` 모델 추가
- 백엔드: 댓글 CRUD API 완전 구현
- 프론트엔드: 계층형 댓글 시스템 (무한 깊이)
- UX: 댓글 수 배지, 기본 펼침 상태

### Phase 1.9: 검색 및 필터링 개선 (2025-10-04)

✅ **완료**:

- 검색 기능 수정 (이중 URL 인코딩 제거)
- 카테고리 필터 동적 로드
- Input 컴포넌트 Hydration 에러 해결
- 실시간 검색 구현

### Phase 1.10: 시스템 안정화 (2025-10-05)

✅ **완료**:

- Turbo 빌드 시스템 수정
- 중복 프로세스 정리 (Next.js 서버 2개 → 1개)
- 서비스 상태 검증 완료

### Phase 1.11: 계층형 댓글 시스템 (2025-10-06)

✅ **완료**:

- DB 스키마: `parentId`, `depth` 필드 추가
- API: 계층 데이터 저장 로직 구현
- 프론트엔드: `buildCommentTree()` 함수로 트리 구조 변환
- UX: 답글에 답글 달기 기능 완전 구현

### Phase 1.12: 검색 통합 및 헤더 최적화 (2025-10-06)

✅ **완료**:

- `useQuestionSearch` 훅으로 검색 로직 통합
- 헤더 3-column 레이아웃 적용
- Playwright E2E 테스트 추가
- 서브헤더/필터 간격 최적화

### Phase 1.13: Docker 컨테이너화 (2025-10-07)

✅ **완료**:

- Docker 환경 구축 완료
- PostgreSQL, Redis 컨테이너 정상 작동
- API Server: Prisma 바이너리 문제 해결
- Web Server: 정상 작동

### Phase 1.14: 이메일 기반 로그인 시스템 (2025-10-07~08)

✅ **완료**:

#### Step 1: 데이터베이스 준비 ✅ (2025-10-07)

- User 모델 확장 (`password`, `emailVerified` 필드 추가)
- 인증 토큰 모델 추가 (`EmailVerificationToken`, `PasswordResetToken`)

#### Step 2: 백엔드 회원가입 API ✅ (2025-10-07)

- Zod 스키마 정의 (`RegisterSchema`, `LoginSchema` 등)
- PasswordService 구현 (bcrypt 기반)
- AuthRepository, AuthService 구현
- EmailAuthController & Router 구현
- API 테스트 성공

#### Step 3: 백엔드 로그인 API ✅ (2025-10-07)

- AuthService 로그인 메서드 구현
- NextAuth CredentialsProvider 설정
- OAuth + 이메일 로그인 통합 시스템
- 통합 테스트 성공

#### Step 4: 프론트엔드 회원가입 페이지 ✅ (2025-10-08)

- `useRegisterForm` 훅 (React Hook Form + Zod)
- `PasswordStrengthIndicator` 컴포넌트
- `RegisterForm` 컴포넌트 (3개 약관 동의)
- `/auth/signup` 페이지 구현
- Playwright E2E 테스트 100% 통과

#### Step 5: 프론트엔드 로그인 페이지 ✅ (2025-10-08)

- `EmailLoginForm` 컴포넌트 구현
- `signin/page.tsx` 레이아웃 개선
- OAuth + 이메일 로그인 통합 UI
- Docker 환경 동기화 문제 해결

#### Step 6: 보안 강화 ✅ (2025-10-08)

- Rate Limiter 구현 (회원가입 3회/시간, 로그인 5회/분)
- CSRF 보호 검증 (NextAuth.js)
- 환경변수 설정 완료

#### Step 7: E2E 테스트 ✅ (2025-10-08)

- Playwright 테스트 22개 시나리오 구현
- 회원가입/로그인/통합 플로우 테스트
- 핵심 테스트 4개 100% 통과

#### Step 8: 문서화 및 배포 준비 ✅ (2025-10-08)

- README.md 완전 업데이트 (183줄 추가)
- API 문서 검증 완료
- Git 태그 v1.14.0 생성
- 전체 시스템 통합 테스트 완료

### Phase 1.15: 시스템 최적화 및 안정화 (2025-10-09)

✅ **완료**:

#### 카테고리 데이터 연결 문제 해결 ✅ (2025-10-09)

- **문제**: 테스트 데이터 생성 시 카테고리 정보가 질문에 연결되지 않음
- **원인**: `createQuestions` 함수에서 `categories` 매개변수 누락
- **해결**:
  - `createQuestions(users, categories)` 함수 시그니처 수정
  - `main()` 함수에서 카테고리 배열 전달
  - 기존 카테고리 없는 질문들 삭제 후 재생성
- **결과**: 카테고리별 질문 분포 정상화 (총 100개 질문, 9개 카테고리)

#### 페이징 컴포넌트 UI 개선 ✅ (2025-10-09)

- **문제**: 현재 선택된 페이지 번호가 명확하게 구분되지 않음
- **해결**:
  - 현재 페이지: 파란색 배경 (`bg-blue-600`) + 흰색 텍스트 + 굵은 글씨 + 그림자 효과
  - 일반 페이지: 회색 테두리 + 호버 효과
  - 비활성화 버튼: 투명도 + 커서 상태 명확화
- **적용 컴포넌트**:
  - `apps/web/src/app/questions/page.tsx` - 메인 질문 목록
  - `apps/web/src/components/search/SearchResults.tsx` - 검색 결과
  - `apps/web/src/components/ui/data-table.tsx` - 데이터 테이블

### Phase 1.16: NextAuth 세션 콜백 수정 (2025-10-09)

✅ **완료**:

#### 로그인 세션 유지 문제 해결 ✅ (2025-10-09)

- **문제**: 로그인 성공 후 세션이 유지되지 않고 즉시 로그아웃되는 현상
- **원인**: NextAuth JWT/세션 콜백에서 사용자 데이터가 토큰과 세션으로 제대로 전달되지 않음
- **해결**:
  - **JWT 콜백 수정** (`apps/web/src/lib/auth.ts:L67-95`):
    - `user` 객체 존재 시 사용자 정보를 토큰에 저장하도록 수정
    - Credentials/OAuth 로그인 구분 로직 추가
    - 디버깅을 위한 상세한 로그 추가
  - **세션 콜백 수정** (`apps/web/src/lib/auth.ts:L97-120`):
    - 토큰의 사용자 정보를 세션 객체로 복사
    - `token.id` 또는 `token.sub`를 `session.user.id`로 설정
    - 세션 생성 과정 로깅 추가
  - **SessionProvider 개선** (`apps/web/src/components/providers/SessionProvider.tsx:L14-18`):
    - 자동 갱신 간격 설정 (`refetchInterval: 5분`)
    - 창 포커스 시 세션 갱신 (`refetchOnWindowFocus: true`)
  - **AuthContext 디버깅 강화** (`apps/web/src/contexts/AuthContext.tsx`):
    - 세션 업데이트 추적 로그 추가
    - 사용자 데이터 설정 로그 추가
- **핵심 개념**:
  - NextAuth에서 `user` 객체는 최초 로그인 시에만 JWT 콜백에 전달됨
  - 모든 사용자 정보는 첫 로그인 시 JWT 토큰에 저장해야 함
  - 이후 요청에서는 토큰의 정보를 세션으로 전달하는 구조
- **테스트 결과**:
  - ✅ 이메일 로그인 성공 (`ip9202@gmail.com`)
  - ✅ 세션 정상 유지 확인
  - ✅ 헤더에 "로그아웃" 버튼 정상 표시
  - ✅ JWT 콜백 → 세션 콜백 데이터 흐름 정상 동작

### Phase 1.17: 로그인 세션 안정화 (2025-10-09)

✅ **완료**:

#### JWEDecryptionFailed 오류 해결 ✅ (2025-10-09)

- **문제**: JWEDecryptionFailed 오류로 인한 세션 유지 실패
- **원인**: 캐시된 불일치 토큰들이 새 시크릿과 호환되지 않음
- **해결**:
  - **서버 완전 종료**: 모든 개발 서버 프로세스 종료
  - **Next.js 캐시 정리**: `.next/cache/`, `.next/static/`, `.next/server/` 삭제
  - **서버 재시작**: 깨끗한 상태로 API 서버 및 웹 서버 재시작
- **결과**:
  - ✅ JWEDecryptionFailed 오류 완전 해결
  - ✅ 로그인 세션 정상 유지 확인
  - ✅ 테스트 계정으로 정상 로그인 (`test1@jeju.com`)

### Phase 1.18: 프로젝트 정리 및 코드 품질 개선 (2025-10-09)

✅ **완료**:

#### 사용하지 않는 파일 및 디렉토리 제거 ✅ (2025-10-09)

- **백업 파일**: `user.repository.ts.backup` 삭제
- **빈 디렉토리**: `apps/web/apps/web/` (중복 구조) 삭제
- **빌드 캐시**: `.turbo/`, `dist/`, `tsconfig.tsbuildinfo` 정리
- **테스트 결과**: `test-results/`, `playwright-report/` 정리

#### Import 경로 최적화 ✅ (2025-10-09)

- **상대 경로 → 절대 경로**: `../../../` → `@/` 변경
- **영향받은 파일**: 3개 파일 최적화
  - `apps/web/src/app/auth/error/page.tsx`
  - `apps/web/src/app/profile/page.tsx`
  - `apps/web/src/app/admin/page.tsx`

#### ESLint 오류 수정 ✅ (2025-10-09)

- **사용하지 않는 import**: `Calendar` 제거
- **코드 품질**: 모든 ESLint 오류 해결

### Phase 1.19: 메인 페이지 인기질문 개선 (2025-10-09)

✅ **완료**:

#### 2컬럼 레이아웃 변경 ✅ (2025-10-09)

- **이전**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` (4컬럼)
- **현재**: `grid-cols-1 md:grid-cols-2` (2컬럼)
- **효과**: 더 깔끔하고 집중된 레이아웃

#### 실제 데이터베이스 데이터 연동 ✅ (2025-10-09)

- **API 엔드포인트**: `/api/questions/popular` 연동
- **데이터 소스**: 목업 데이터 → 실제 데이터베이스 데이터
- **정렬 기능**: 실제 API와 연동
  - **인기순**: `/api/questions/popular` (조회수 기준)
  - **최신순**: `/api/questions?sortBy=createdAt&sortOrder=desc`
  - **답변완료**: `/api/questions?isResolved=true`

#### 견고한 에러 처리 및 폴백 메커니즘 ✅ (2025-10-09)

- **HTTP 상태 코드 검증**: `response.ok` 체크
- **API 응답 검증**: `data.success` 체크
- **폴백 데이터**: 에러 발생 시 목업 데이터 사용
- **에러 상태 UI**: 사용자 친화적 에러 메시지 표시

#### 데이터 매핑 및 타입 안전성 ✅ (2025-10-09)

- **타입 정의**: `ApiQuestionData` 인터페이스 추가
- **데이터 변환**: API 응답을 `PopularQuestion` 타입으로 매핑
- **타입 안전성**: `any` 타입 제거, 명시적 타입 사용

---

## 🚨 현재 문제점

### 1. 기존 이슈 (해결됨)

- ✅ Docker 환경 동기화 문제 해결
- ✅ Prisma 바이너리 문제 해결
- ✅ Prettier 권한 문제 해결
- ✅ NextAuth 세션 유지 문제 해결 (Phase 1.16)
- ✅ JWEDecryptionFailed 오류 해결 (Phase 1.17)
- ✅ 프로젝트 정리 및 코드 품질 개선 (Phase 1.18)
- ✅ 메인 페이지 인기질문 개선 (Phase 1.19)

### 2. 남은 이슈

- 검색 기능 무한 루프 (기존 기능)
- Hydration 에러 (기존 기능)
- 일부 E2E 테스트 실패 (API 연동 문제)

---

## 📊 현재 시스템 상태

### ⚡ **하이브리드 개발 환경 (현재 실행 중)**

**Docker 컨테이너에서 실행:**

```
✅ PostgreSQL 15 (jeju-postgres) - 포트 5433
✅ Redis 7 (jeju-redis) - 포트 6379
✅ Prisma Studio (jeju-prisma-studio) - 포트 5555
```

**로컬에서 실행 (핫리로드):**

```
⚡ API Server - 포트 4000 (npm run dev)
⚡ Web Server - 포트 3000 (npm run dev)
```

### 🐳 **Docker 전체 스택 환경 (배포용)**

**모든 서비스가 Docker 컨테이너에서 실행:**

```
🐳 PostgreSQL 15 (jeju-postgres) - 포트 5433
🐳 Redis 7 (jeju-redis) - 포트 6379
🐳 API Server (jeju-api) - 포트 4000
🐳 Web Server (jeju-web) - 포트 3000
🐳 Prisma Studio (jeju-prisma-studio) - 포트 5555
```

### 🎯 **개발 환경 선택 가이드**

- **일반 개발**: 하이브리드 환경 사용 (빠른 개발)
- **배포 테스트**: Docker 전체 스택 사용 (완전한 환경)
- **CI/CD**: Docker 전체 스택 사용 (일관된 환경)

---

## 🎯 다음 단계

### Phase 2: 디자인 시스템 개선 (미구현)

1. **UI/UX 리뉴얼**: 회원가입/로그인 페이지 디자인 개선
2. **반응형 최적화**: 모바일/태블릿/데스크톱 최적화
3. **브랜딩 강화**: 제주도 테마 디자인 적용
4. **사용자 경험**: 애니메이션, 인터랙션 개선

### Phase 2.1: 소셜 네트워크 통합 (미구현)

1. **계정 연동 시스템**: 이메일 + OAuth 계정 통합
2. **Account 모델**: NextAuth Account 테이블 연동
3. **계정 통합 UI**: 비밀번호 재확인 후 연동

### 백로그 (기존 기능 - 미해결)

- 검색 기능 무한 루프 해결
- Hydration 에러 해결
- E2E 테스트 안정화 (일부 테스트 실패)
- Rate Limiter 재활성화 (현재 비활성화 상태)

---

## 🛠️ 개발 환경 운영

### ⚡ **하이브리드 환경 (개발용 - 권장)**

```bash
# 1. 데이터베이스만 Docker로 실행
docker-compose up -d postgres redis

# 2. API 서버 로컬 실행 (핫리로드)
cd apps/api && npm run dev

# 3. 웹 서버 로컬 실행 (핫리로드)
cd apps/web && npm run dev
```

### 🐳 **Docker 전체 스택 (배포/테스트용)**

```bash
# 전체 스택 실행
docker-compose up -d

# 서비스 확인
docker-compose ps
```

### Health Check

```bash
curl http://localhost:3000/api/auth/session  # Web
curl http://localhost:4000/health            # API
```

### Prisma Studio

```bash
# Docker 환경 (권장 - 현재 실행 중)
docker-compose up -d prisma-studio
# 접속: http://localhost:5555

# 로컬 환경 (대안)
cd packages/database && DATABASE_URL="postgresql://test:test@localhost:5433/asklocal_dev?schema=public" npx prisma studio --port 5555
# 접속: http://localhost:5555
```

### 🔄 **환경 전환 방법**

```bash
# 하이브리드 → Docker 전체 스택
docker-compose down
docker-compose up -d

# Docker 전체 스택 → 하이브리드
docker-compose down
docker-compose up -d postgres redis
cd apps/api && npm run dev &
cd apps/web && npm run dev
```

---

**마지막 업데이트**: 2025-10-09
**현재 작업**: Phase 1.19 완료 ✅
**완료 사항**: 메인 페이지 인기질문 2컬럼 레이아웃 + 실제 데이터 연동 ✅
**시스템 상태**: 모든 핵심 기능 정상 작동 (인증, Q&A, 댓글, 검색, 메인페이지) ✅
**다음 단계**: Phase 2 디자인 시스템 개선
