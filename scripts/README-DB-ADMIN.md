# 🗄️ Prisma Studio 데이터베이스 관리 도구

Prisma Studio를 사용하여 데이터베이스를 시각적으로 관리할 수 있습니다.

## 🚀 실행 방법

### macOS / Linux

```bash
# 프로젝트 루트에서
./scripts/db-admin.sh
```

### Windows

```cmd
# 프로젝트 루트에서
scripts\db-admin.bat
```

### 직접 실행 (모든 OS)

```bash
npx prisma studio --schema=./packages/database/prisma/schema.prisma
```

## 🌐 접속 정보

- **URL**: http://localhost:5555
- **자동 브라우저 열림**: 스크립트 실행 시 자동으로 브라우저가 열립니다

## ✨ 주요 기능

### 1️⃣ 데이터 조회

- 모든 테이블의 데이터를 실시간으로 확인
- 필터링, 검색, 정렬 기능
- 페이지네이션 지원

### 2️⃣ 데이터 수정

- 레코드 추가 (➕ Add record 버튼)
- 레코드 수정 (셀 클릭 후 편집)
- 레코드 삭제 (🗑️ 아이콘 클릭)

### 3️⃣ 관계 탐색

- 연관된 데이터 자동 링크
- 1:N, N:M 관계 시각화
- 클릭으로 관련 레코드 이동

### 4️⃣ 실시간 동기화

- 데이터 변경 시 자동 새로고침
- 트랜잭션 안전성 보장

## 📊 주요 테이블 설명

### 👥 users

- 사용자 정보 관리
- 닉네임, 이메일, 프로필 등

### ❓ questions

- 질문 데이터
- 제목, 내용, 카테고리, 태그, 위치 정보

### 💬 answers

- 답변 데이터
- 질문과 1:N 관계

### 📂 categories

- 질문 카테고리
- 맛집, 관광지, 숙소, 교통, 기타

### 👍 question_likes

- 질문 좋아요 관계 테이블

### 👍 answer_likes

- 답변 좋아요/싫어요 관계 테이블

### 🔖 bookmarks

- 질문 북마크 관계 테이블

### 🚨 reports

- 신고 데이터
- 질문/답변 신고 관리

### 🔔 notifications

- 알림 데이터
- 사용자별 알림 관리

### 🏅 badges

- 배지 시스템
- 전문가, 베스트 답변자 등

### 💰 point_transactions

- 포인트 거래 내역
- 적립, 차감 기록

## 🛠️ 유용한 작업 예시

### 테스트 사용자 추가

1. `users` 테이블 선택
2. ➕ Add record 클릭
3. 필수 필드 입력:
   - email: test@example.com
   - name: 테스트 사용자
   - nickname: test_user
   - provider: kakao
   - providerId: test_kakao_123

### 카테고리 데이터 확인

1. `categories` 테이블 선택
2. 현재 등록된 카테고리 확인
3. 필요시 새 카테고리 추가

### 질문 상태 확인

1. `questions` 테이블 선택
2. 필터: `status = ACTIVE`
3. 정렬: `createdAt DESC`

### 답변 채택 상태 변경

1. `answers` 테이블 선택
2. 특정 답변의 `isAccepted` 체크박스 클릭
3. 자동 저장됨

## ⚠️ 주의사항

1. **개발 환경에서만 사용**: 프로덕션 DB에 직접 연결 금지
2. **백업 필수**: 중요한 데이터 수정 전 백업
3. **관계 데이터 주의**: 외래 키 제약 조건 확인 후 삭제
4. **동시 접속 제한**: 한 번에 한 명만 실행 권장

## 🔄 종료 방법

터미널에서 `Ctrl + C` 입력

## 🐛 문제 해결

### 포트 5555가 이미 사용 중

```bash
# 기존 프로세스 확인
lsof -i :5555

# 프로세스 종료
kill -9 <PID>
```

### 데이터베이스 연결 실패

```bash
# .env 파일 확인
cat packages/database/.env

# DATABASE_URL이 올바른지 확인
# PostgreSQL 서버가 실행 중인지 확인
```

### Prisma Client 에러

```bash
# Prisma Client 재생성
npm run db:generate
```

## 📚 참고 자료

- [Prisma Studio 공식 문서](https://www.prisma.io/docs/concepts/components/prisma-studio)
- [Prisma 데이터 모델 가이드](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model)
