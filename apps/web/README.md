# 동네물어봐 (AskLocal) - 제주 여행 Q&A 커뮤니티

제주도 여행자와 현지 주민을 연결하는 실시간 여행 Q&A 커뮤니티 플랫폼입니다.

## 🚀 주요 기능

### 🔐 인증 시스템

- **이메일 회원가입/로그인**: 안전한 비밀번호 기반 인증
- **OAuth 로그인**: 카카오, 네이버, 구글 소셜 로그인
- **비밀번호 강도 표시**: 실시간 비밀번호 보안 수준 확인
- **세션 관리**: 7일 자동 로그인 유지

### 💬 Q&A 커뮤니티

- **실시간 질문/답변**: Socket.io 기반 실시간 소통
- **계층형 댓글**: 답글에 답글 달기 (무한 깊이)
- **검색 및 필터링**: 키워드 검색, 카테고리 필터
- **북마크 및 공유**: 관심 질문 저장, 소셜 공유

### 👥 사용자 관리

- **현지인 전문가**: 제주도 현지인 인증 시스템
- **프로필 관리**: 아바타, 닉네임, 자기소개
- **알림 시스템**: 실시간 알림 및 이메일 알림

## 🛠️ 기술 스택

### Frontend

- **Next.js 14**: App Router, Server Components
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 유틸리티 우선 CSS
- **shadcn/ui**: 재사용 가능한 컴포넌트
- **React Hook Form**: 폼 관리 및 검증
- **Zod**: 스키마 검증

### Backend

- **Node.js + Express.js**: RESTful API
- **PostgreSQL**: 관계형 데이터베이스
- **Prisma ORM**: 데이터베이스 ORM
- **Redis**: 세션 및 캐시 관리
- **Socket.io**: 실시간 통신

### 인증 및 보안

- **커스텀 JWT 인증**: JWT 토큰 기반 인증 시스템
- **bcrypt**: 비밀번호 해싱
- **Rate Limiting**: API 요청 제한
- **CSRF Protection**: 크로스 사이트 요청 위조 방지

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.14.0 이상
- Docker 및 Docker Compose
- PostgreSQL 15
- Redis 7

### 설치 및 실행

1. **저장소 클론**

```bash
git clone https://github.com/your-org/jeju-tourlist.git
cd jeju-tourlist
```

2. **Docker로 전체 스택 실행**

```bash
# 전체 서비스 실행
docker-compose up -d

# 서비스 상태 확인
docker-compose ps
```

3. **개발 서버 실행 (로컬)**

```bash
# 웹 서버 (포트 3000)
cd apps/web
npm install
npm run dev

# API 서버 (포트 4000)
cd apps/api
npm install
npm run dev
```

### 접속 URL

- **웹 애플리케이션**: http://localhost:3000
- **API 서버**: http://localhost:4000
- **API 문서**: http://localhost:4000/api-docs
- **Prisma Studio**: http://localhost:5555

## 📱 사용법

### 회원가입

1. http://localhost:3000/auth/signup 접속
2. 이메일, 비밀번호, 이름, 닉네임 입력
3. 이용약관 및 개인정보처리방침 동의
4. 회원가입 완료

### 로그인

1. http://localhost:3000/auth/signin 접속
2. 이메일/비밀번호 또는 OAuth 로그인
3. 로그인 성공 시 홈페이지로 이동

### 질문 작성

1. 로그인 후 "질문하기" 버튼 클릭
2. 질문 내용 및 해시태그 입력
3. 질문 등록 및 실시간 답변 대기

## 🧪 테스트

### E2E 테스트 (Playwright)

```bash
cd apps/web
npx playwright test
```

### API 테스트

```bash
cd apps/api
npm run test
```

### 전체 테스트

```bash
npm run test:all
```

## 📚 API 문서

### 인증 API

- `POST /api/auth/email/register` - 이메일 회원가입
- `POST /api/auth/email/login` - 이메일 로그인
- `GET /api/auth/session` - 세션 정보 조회

### 질문 API

- `GET /api/questions` - 질문 목록 조회
- `POST /api/questions` - 질문 작성
- `GET /api/questions/:id` - 질문 상세 조회

자세한 API 문서는 http://localhost:4000/api-docs 에서 확인할 수 있습니다.

## 🔧 환경변수 설정

### 웹 애플리케이션 (.env.local)

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5433/jeju_tourlist
REDIS_URL=redis://localhost:6379
API_BASE_URL=http://localhost:4000
```

### API 서버 (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5433/jeju_tourlist
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
PASSWORD_MIN_LENGTH=8
PASSWORD_SALT_ROUNDS=10
```

## 🚀 배포

### Docker 배포

```bash
# 프로덕션 빌드
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel 배포 (웹)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

- **프로젝트 관리자**: [이메일 주소]
- **이슈 리포트**: [GitHub Issues](https://github.com/your-org/jeju-tourlist/issues)
- **문서**: [프로젝트 위키](https://github.com/your-org/jeju-tourlist/wiki)

---

**동네물어봐**와 함께 제주도 여행의 모든 궁금증을 해결해보세요! 🏝️✨
