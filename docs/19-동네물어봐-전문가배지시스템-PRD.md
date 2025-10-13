# 전문가 배지 시스템 PRD (Product Requirements Document)

## 📋 개요

**프로젝트명**: 전문가 배지 시스템 (Expert Badge System)  
**작성일**: 2025-10-13  
**작성자**: 개발팀  
**버전**: 1.0

## 🎯 목표 및 배경

### 목표

- 사용자의 전문성을 시각적으로 표현하여 신뢰도 향상
- 답변 활동에 대한 보상 체계 구축으로 참여 동기 부여
- 카테고리별 전문가 육성으로 커뮤니티 품질 향상

### 배경

- 제주 여행 Q&A 커뮤니티에서 답변자의 신뢰도가 중요
- 현지인/전문가 답변 식별 필요성
- 지속적인 참여 유도를 위한 gamification 요소 필요

## 🏆 배지 시스템 구조

### 전문 분야 배지 (Category Expert Badges)

| 배지               | 획득 조건                                 | 카테고리 | 추가 조건                |
| ------------------ | ----------------------------------------- | -------- | ------------------------ |
| 🍜 맛집 탐정       | 맛집 카테고리 답변 50개 + 채택률 30% 이상 | 맛집     | 질문자 선택 시 +5 포인트 |
| ☕ 카페 큐레이터   | 카페 관련 답변 30개 + 채택률 25% 이상     | 맛집     | 질문자 선택 시 +3 포인트 |
| 🚗 드라이브 마스터 | 교통/드라이브 답변 30개 + 채택률 25% 이상 | 교통     | 질문자 선택 시 +3 포인트 |
| 🏖️ 해변 전문가     | 해변/액티비티 답변 20개 + 채택률 20% 이상 | 액티비티 | 질문자 선택 시 +3 포인트 |

### 활동 수준 배지 (Activity Level Badges)

| 배지             | 획득 조건     | 포인트 |
| ---------------- | ------------- | ------ |
| 🥉 새내기 도우미 | 총 답변 10개  | +10    |
| 🥈 든든한 가이드 | 총 답변 50개  | +30    |
| 🥇 제주 마스터   | 총 답변 100개 | +50    |
| 👑 제주 전설     | 총 답변 300개 | +100   |

### 미래 구현 예정 (데이터베이스만 준비)

#### 1단계: GPS 기반 자동 인증

- ⭐ 임시 현지인 (1주일 이상 제주 거주 패턴)
- 🏢 제주 직장인 (평일 규칙적 출퇴근 패턴)

#### 2단계: 소셜 간편 인증

- 🏠 검증된 제주도민 (지인 3명 추천)
- 🌊 해녀의 후예 (동부 지역 + 지역민 인증)
- ⛰️ 한라산 지기 (서귀포 + 지역민 인증)

#### 3단계: 공식 서류 인증

- 👑 공식 제주도민 (주민등록 기반)
- 🏘️ 제주 토박이 (5년 이상 거주)

## 🔄 배지 획득 프로세스

### 배치 처리 (일일 1회, 새벽 4시)

```
1. 모든 사용자의 답변 통계 집계
2. 카테고리별 답변 수 + 채택률 계산
3. 배지 획득 조건 검증
4. 신규 배지 부여
5. 알림 생성 (배지 획득 축하)
6. 포인트 지급
```

### 질문자 선택 (Best Answer) 프로세스

```
1. 질문자가 답변 채택
2. 답변자에게 카테고리별 전문가 포인트 지급
   - 맛집 탐정: +5 포인트
   - 기타 전문가: +3 포인트
3. 채택률 업데이트 (실시간)
4. 다음 배치 처리 시 배지 재검증
```

## 📍 배지 표시 위치

### 사용자 프로필 페이지

- 배지 컬렉션 섹션 (획득한 모든 배지 표시)
- 배지별 획득 진행률 표시
- 다음 배지까지 필요한 활동량 표시

### 답변 카드

- 답변자 이름 옆 대표 배지 1개 표시
- 호버 시 전체 배지 목록 툴팁

### 헤더 (로그인 상태)

- 사용자 드롭다운 메뉴에 최고 등급 배지 표시

## 🔔 알림 시스템

### 배지 획득 알림

- 타입: `BADGE_EARNED`
- 내용: "🎉 축하합니다! '{배지명}' 배지를 획득하셨습니다!"
- 링크: `/profile` (프로필 페이지로 이동)
- 발송 시점: 배치 처리 완료 후

### 배지 진행률 알림 (선택적)

- 타입: `BADGE_PROGRESS`
- 내용: "'{배지명}' 배지까지 답변 {n}개 남았습니다!"
- 조건: 목표의 80% 달성 시

## 🗄️ 데이터베이스 설계

### Badge 모델 (배지 정의)

```prisma
model Badge {
  id          String   @id @default(cuid())
  code        String   @unique  // FOOD_DETECTIVE, NEWBIE_HELPER
  name        String              // 맛집 탐정, 새내기 도우미
  emoji       String              // 🍜, 🥉
  description String
  type        BadgeType           // CATEGORY_EXPERT, ACTIVITY_LEVEL, LOCATION_BASED
  category    String?             // 맛집, 교통, 액티비티 (type이 CATEGORY_EXPERT인 경우)

  // 획득 조건
  requiredAnswers    Int      // 필요 답변 수
  requiredAdoptRate  Float?   // 필요 채택률 (%)
  bonusPoints        Int      // 배지 획득 시 포인트
  adoptBonusPoints   Int?     // 질문자 선택 시 추가 포인트

  // 미래 기능용 필드
  requiresGpsAuth    Boolean  @default(false)
  requiresSocialAuth Boolean  @default(false)
  requiresDocAuth    Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userBadges  UserBadge[]
}

enum BadgeType {
  CATEGORY_EXPERT    // 전문 분야 배지
  ACTIVITY_LEVEL     // 활동 수준 배지
  LOCATION_BASED     // GPS/위치 기반 (미래)
  SOCIAL_VERIFIED    // 소셜 인증 (미래)
  OFFICIAL_VERIFIED  // 공식 서류 인증 (미래)
}
```

### UserBadge 모델 (사용자 배지 보유)

```prisma
model UserBadge {
  id          String   @id @default(cuid())
  userId      String
  badgeId     String

  earnedAt    DateTime @default(now())
  notified    Boolean  @default(false)  // 알림 발송 여부

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge       Badge    @relation(fields: [badgeId], references: [id])

  @@unique([userId, badgeId])
  @@index([userId])
}
```

### User 모델 확장

```prisma
// 기존 User 모델에 추가
model User {
  // ... 기존 필드

  badges          UserBadge[]
  points          Int         @default(0)  // 포인트 시스템

  // 통계 필드 (배치 처리용 캐시)
  totalAnswers    Int         @default(0)
  adoptedAnswers  Int         @default(0)
  adoptRate       Float       @default(0)
}
```

### Answer 모델 확장

```prisma
// 기존 Answer 모델에 추가
model Answer {
  // ... 기존 필드

  isAdopted       Boolean     @default(false)  // 질문자가 채택한 답변
  adoptedAt       DateTime?                    // 채택 시간
  expertPoints    Int         @default(0)      // 이 답변으로 받은 전문가 포인트
}
```

## 🔌 API 엔드포인트

### 배지 관련

- `GET /api/badges` - 모든 배지 목록 조회
- `GET /api/users/:userId/badges` - 사용자 배지 조회
- `GET /api/users/:userId/badge-progress` - 배지 진행률 조회

### 답변 채택

- `POST /api/answers/:answerId/adopt` - 답변 채택 (질문자만)
- 로직:
  1. 권한 확인 (질문 작성자인지)
  2. 기존 채택 취소
  3. 새 답변 채택
  4. 전문가 포인트 지급
  5. 채택률 업데이트

### 배치 작업

- `POST /api/admin/badges/calculate` - 배지 계산 실행 (관리자용)

## ⏰ 배치 작업 스케줄러

### 일일 배지 계산 Cron Job

```typescript
// apps/api/src/services/badge.cron.ts

// 매일 새벽 4시 실행
cron.schedule("0 4 * * *", async () => {
  await badgeService.calculateAndAwardBadges();
});
```

### 배지 계산 로직

```typescript
async calculateAndAwardBadges() {
  // 1. 모든 활성 사용자 조회
  // 2. 사용자별 답변 통계 집계
  // 3. 카테고리별 답변 수 + 채택률 계산
  // 4. 배지 획득 조건 검증
  // 5. 신규 배지 부여
  // 6. 알림 생성
  // 7. 포인트 지급
}
```

## 🎨 UI/UX 설계

### 배지 컴포넌트

```tsx
// BadgeIcon.tsx - 배지 아이콘 표시
// BadgeCard.tsx - 배지 상세 카드
// BadgeProgress.tsx - 배지 진행률 바
// BadgeCollection.tsx - 배지 컬렉션 그리드
```

### 배지 획득 축하 모달

```tsx
// BadgeCelebrationModal.tsx
// - 배지 이미지 애니메이션
// - 획득 메시지
// - 포인트 표시
// - "프로필 보기" 버튼
```

## 📈 성공 지표 (KPI)

- 배지 획득 사용자 수
- 배지별 획득률
- 답변 채택률 증가
- 카테고리별 전문가 분포
- 사용자 참여도 증가 (답변 수)

## 🚀 향후 확장 계획

- GPS 기반 현지인 인증 (Phase 2)
- 소셜 인증 시스템 (Phase 3)
- 공식 서류 인증 (Phase 4)
- 배지 거래/선물 기능
- 시즌별 특별 배지

---

**문서 버전**: 1.0  
**최종 수정일**: 2025-10-13  
**승인자**: 프로젝트 매니저
