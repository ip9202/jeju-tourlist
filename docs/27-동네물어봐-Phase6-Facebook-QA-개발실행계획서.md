# 동네물어봐 - Phase 6 페이스북 스타일 Q&A 개발실행계획서

**문서작성일**: 2025-10-21  
**작성자**: Claude Code  
**상태**: 📋 계획 수립 완료  
**목표**: 질문 상세 페이지의 답변/댓글 UI를 페이스북 스타일의 계층적 댓글 구조로 완전 리디자인

---

## 📋 개요

질문 상세 페이지(Questions Detail Page)의 답변/댓글 UI를 **페이스북 스타일의 계층적 댓글 구조**로 완전 리디자인합니다. 기존 API와 데이터 구조를 유지하면서 신규 컴포넌트로 확장하며, SOLID 원칙을 준수하여 점진적 마이그레이션이 가능하도록 구현합니다.

**예상 일정**: 23시간  
**담당자**: Claude Code

---

## 🎯 최종 목표

- ☑ 페이스북 스타일의 버블형 댓글 UI 구현
- ☑ 계층적 댓글 구조 (대댓글 지원)
- ☐ 배지 시스템 (채택됨, 전문가, 신입)
- ☐ 모든 breakpoint에서 완벽한 반응형 동작
- ☑ **SOLID 원칙을 지켜서 개발** (기존 로직 유지, 신규 컴포넌트로 확장)
- ☐ Feature flag를 통한 점진적 마이그레이션
- ☑ Lint, Type Check 통과
- ☐ 완벽한 테스트 커버리지
- ☑ Git 커밋 완료

---

## 📝 Phase별 실행 계획

### **Phase 1: 컴포넌트 분리 및 구현**

**목표**: 신규 Facebook\* 컴포넌트 4개 생성

**예상 시간**: 3시간

#### **1-1: FacebookQuestionCard.tsx 생성**

- ☑ 컴포넌트 파일 생성
- ☑ 질문 헤더 구현
  - ☑ 작성자 프로필 이미지 (32px 아바타)
  - ☑ 작성자 이름 표시
  - ☑ 작성 시간 표시
  - ☑ 메뉴 버튼 (⋯) 구현
- ☑ 질문 내용 구현
  - ☑ 제목 강조 표시 (bold)
  - ☑ 본문 텍스트 렌더링
  - ☑ 첨부 이미지 갤러리 (기존 로직 재사용)
- ☑ 통계 정보 표시
  - ☑ 좋아요 수 (👍)
  - ☑ 댓글 수 (💬)
  - ☑ 조회 시간 (상대 시간)
- ☑ 액션 버튼 (4개)
  - ☑ 좋아요 버튼 구현
  - ☑ 댓글 버튼 구현
  - ☑ 공유 버튼 구현
  - ☑ 저장(북마크) 버튼 구현
- ☑ Props 타입 정의
- ☑ TypeScript 타입 체크 통과

#### **1-2: FacebookAnswerInput.tsx 생성**

- ☑ 컴포넌트 파일 생성
- ☑ 프로필 아바타 표시
  - ☑ 현재 로그인 사용자 아바타
  - ☑ 크기: 32px
- ☑ 라운드 입력창 구현
  - ☑ placeholder 텍스트
  - ☑ border-radius: 20px
  - ☑ 배경색: #f0f2f5
  - ☑ 포커스 스타일
- ☑ 이모지 버튼 구현
  - ☑ 버튼 위치 (우측)
  - ☑ 클릭 가능 상태
- ☑ Props 타입 정의
- ☑ TypeScript 타입 체크 통과

#### **1-3: FacebookAnswerCard.tsx 생성**

- ☑ 컴포넌트 파일 생성
- ☑ 답변 버블 UI 구현
  - ☑ border-radius: 18px
  - ☑ 배경색: #ffffff
  - ☑ 그림자: 0 1px 2px rgba(0,0,0,0.1)
- ☑ 작성자 정보 (헤더) 구현
  - ☑ 작성자 닉네임 표시
  - ☑ 배지 표시 영역 (isAccepted/isExpert/isNew)
  - ☑ 시간 표시 (우상단)
- ☑ 답변 본문 구현
  - ☑ 텍스트 렌더링
  - ☑ line-height: 1.4
  - ☑ word-break 처리
- ☑ 리액션 표시 구현
  - ☑ 좋아요 수 (👍 0)
  - ☑ 싫어요 수 (👎 1)
- ☑ 액션 버튼 구현
  - ☑ 좋아요 버튼
  - ☑ 답글 버튼
  - ☑ 더보기 메뉴 (⋯)
- ☑ Props 타입 정의 (isNested, handlers)
- ☑ TypeScript 타입 체크 통과

#### **1-4: FacebookAnswerThread.tsx 생성**

- ☑ 컴포넌트 파일 생성
- ☑ 댓글 입력 섹션
  - ☑ FacebookAnswerInput 통합
  - ☑ 폼 제출 로직
- ☑ 답변 리스트 렌더링
  - ☑ map() 함수로 반복 렌더링
  - ☑ key={answer.id} 설정
- ☑ 대댓글 렌더링
  - ☑ parentId 기반 필터링
  - ☑ isNested={true} prop 전달
  - ☑ margin-left: 32px 들여쓰기
- ☑ 더보기 버튼 구현
  - ☑ "N개의 답글 더 보기" 텍스트
  - ☑ 클릭 시 추가 로드
- ☑ Props 타입 정의
- ☑ TypeScript 타입 체크 통과

#### **1-5: types.ts 생성**

- ☑ FacebookAnswer 인터페이스 정의
- ☑ FacebookQuestionCardProps 타입 정의
- ☑ FacebookAnswerCardProps 타입 정의
- ☑ FacebookAnswerInputProps 타입 정의
- ☑ FacebookAnswerThreadProps 타입 정의

#### **Phase 1 마무리**

- ☑ Lint 실행 및 수정 (`npm run lint`)
- ☑ Type Check 실행 및 수정 (`npm run type-check`)
- ☑ Git 커밋: `feat: 페이스북 스타일 Q&A 컴포넌트 분리 및 구현`
- ☑ **☑ Phase 1 완료 체크**

---

### **Phase 2: 스타일 시스템 구축**

**목표**: CSS 변수와 Tailwind 커스텀 설정

**예상 시간**: 2시간

#### **2-1: facebook-qa.css 생성**

- ☑ CSS 파일 생성
- ☑ 색상 변수 정의
  - ☑ --fb-bg: #f0f2f5
  - ☑ --fb-white: #ffffff
  - ☑ --fb-text-primary: #050505
  - ☑ --fb-text-secondary: #65676b
  - ☑ --fb-primary: #0a66c2
- ☑ 타이포그래피 변수
  - ☑ --fb-font-title: 14px, 600 weight
  - ☑ --fb-font-body: 13px, 400 weight
  - ☑ --fb-font-small: 12px, 400 weight
- ☑ 간격 변수
  - ☑ --fb-spacing-xs: 8px
  - ☑ --fb-spacing-sm: 12px
  - ☑ --fb-spacing-md: 16px

#### **2-2: 컴포넌트 스타일 정의**

- ☑ .fb-question-card 스타일
  - ☑ 배경색, 패딩, 테두리 반경
  - ☑ 섹션별 테두리
- ☑ .fb-answer-bubble 스타일
  - ☑ 버블 모양 (18px border-radius)
  - ☑ 그림자 효과
  - ☑ 패딩
- ☑ .fb-comment-input 스타일
  - ☑ 라운드 입력창 (20px)
  - ☑ 포커스 상태
- ☑ .fb-reactions 스타일
  - ☑ 리액션 표시 레이아웃
  - ☑ 호버 효과
- ☑ .fb-action-button 스타일
  - ☑ 기본 스타일
  - ☑ 호버 상태
  - ☑ 활성 상태

#### **2-3: Tailwind CSS 커스텀 설정**

- ☑ tailwind.config.js 수정
  - ☑ rounded-bubble: 18px 추가
  - ☑ rounded-input: 20px 추가
  - ☑ shadow-facebook: 0 1px 2px rgba(0,0,0,0.1) 추가
  - ☑ colors.facebook 팔레트 추가

#### **2-4: 반응형 미디어 쿼리**

- ☑ 데스크톱 (≥1024px) 스타일
  - ☑ 전체 스타일 적용
  - ☑ 버튼 라벨 + 아이콘
- ☑ 태블릿 (600-1024px) 스타일
  - ☑ 버튼 크기 조정
  - ☑ 폰트 크기 축소 (13px → 12px)
  - ☑ 버튼 라벨 숨김
- ☑ 모바일 (< 600px) 스타일
  - ☑ 패딩 감소
  - ☑ 폰트 크기 재조정
  - ☑ 터치 최적화 (44px 버튼)

#### **Phase 2 마무리**

- ☑ Lint 실행 및 수정 (`npm run lint`)
- ☑ Type Check 실행 및 수정 (`npm run type-check`)
- ☑ Git 커밋: `style: 페이스북 스타일 Q&A CSS 시스템 구축`
- ☑ **☑ Phase 2 완료 체크**

---

### **Phase 3: API 연동**

**목표**: 기존 API와 신규 컴포넌트 연동

**예상 시간**: 2시간

#### **3-1: 기존 API 호출 유지**

- ☑ GET /api/questions/:id
  - ☑ 질문 데이터 조회 유지
  - ☑ 캐싱 로직 유지
- ☑ POST /api/answers
  - ☑ 답변 작성 API 호출
  - ☑ 요청 본문 유지
- ☑ POST /api/answers/:id/reaction
  - ☑ 좋아요/싫어요 처리
  - ☑ 기존 로직 재사용
- ☑ POST /api/answers/:id/accept
  - ☑ 답변 채택 API 호출
  - ☑ 기존 로직 재사용
- ☑ DELETE /api/answers/:id
  - ☑ 답변 삭제 API 호출
  - ☑ 기존 로직 재사용

#### **3-2: 데이터 변환 로직**

- ☑ Answer → FacebookAnswer 매핑 함수 생성
- ☑ isNested 판별 로직 구현
  - ☑ parentId 확인
  - ☑ 플래그 설정
- ☑ 배지 결정 로직 구현
  - ☑ isAccepted → 채택됨 배지
  - ☑ user.isExpert → 전문가 배지
  - ☑ user.createdAt (최근 7일) → 신입 배지

#### **3-3: 에러 핸들링**

- ☑ API 호출 실패 처리
- ☑ 타임아웃 처리
- ☑ 사용자 피드백 (토스트 메시지)

#### **Phase 3 마무리**

- ☑ Lint 실행 및 수정 (`npm run lint`)
- ☑ Type Check 실행 및 수정 (`npm run type-check`)
- ☑ Git 커밋: `feat: 페이스북 Q&A 컴포넌트 API 연동`
- ☑ **☑ Phase 3 완료 체크**

---

### **Phase 4: 배지 시스템 구현**

**목표**: 배지 컴포넌트 및 결정 로직

**예상 시간**: 1시간

#### **4-1: Badge 컴포넌트 생성**

- ☐ FacebookBadge.tsx 컴포넌트 생성
- ☐ 채택됨 배지 (초록색, #d4edda)
  - ☐ 스타일 정의
  - ☐ 라벨 "채택됨"
- ☐ 전문가 배지 (파랑색, #d1ecf1)
  - ☐ 스타일 정의
  - ☐ 라벨 "전문가"
- ☐ 신입 배지 (노랑색, #fff3cd)
  - ☐ 스타일 정의
  - ☐ 라벨 "신입"

#### **4-2: 배지 결정 로직**

- ☐ isAccepted → 채택됨 배지
  - ☐ answer.isAccepted === true 확인
- ☐ user.isExpert → 전문가 배지
  - ☐ user.role === 'expert' 또는 user.isExpert === true 확인
- ☐ user.createdAt (최근 7일) → 신입 배지
  - ☐ 가입 날짜 확인
  - ☐ 유틸 함수로 분리

#### **4-3: 유틸 함수 생성**

- ☐ getBadgeType(answer, user) 함수
  - ☐ 배지 타입 결정 로직
  - ☐ 우선순위: accepted > expert > newbie

#### **Phase 4 마무리**

- ☐ Lint 실행 및 수정 (`npm run lint`)
- ☐ Type Check 실행 및 수정 (`npm run type-check`)
- ☐ Git 커밋: `feat: 페이스북 Q&A 배지 시스템 구현`
- ☐ **☑ Phase 4 완료 체크**

---

### **Phase 5: 반응형 디자인**

**목표**: 모든 breakpoint에서 완벽한 반응형 동작

**예상 시간**: 2시간

#### **5-1: 데스크톱 (≥1024px)**

- ☐ 전체 너비 표시
  - ☐ max-width 설정 없음 (또는 1200px)
  - ☐ 양쪽 여백 균형
- ☐ 버튼 라벨 + 아이콘
  - ☐ 액션 버튼에 텍스트 표시
  - ☐ 예: "👍 좋아요"
- ☐ 전체 메뉴 표시
  - ☐ 더보기 메뉴 표시

#### **5-2: 태블릿 (600-1024px)**

- ☐ 버튼 아이콘만
  - ☐ 라벨 숨김 (aria-label 유지)
  - ☐ tooltip 고려
- ☐ 입력창 폭 조정
  - ☐ 완전한 폭 사용
- ☐ 폰트 크기 축소
  - ☐ 본문: 13px → 12px

#### **5-3: 모바일 (< 600px)**

- ☐ 전체 폭 사용
  - ☐ padding: 0 (또는 minimal)
  - ☐ border-radius: 0 (카드)
- ☐ 단순화된 메뉴
  - ☐ 더보기 메뉴만 표시
  - ☐ 다른 액션은 하단 위치
- ☐ 터치 최적화
  - ☐ 버튼 최소 크기: 44px × 44px
  - ☐ 충분한 간격: 8px 이상

#### **5-4: 반응형 테스트**

- ☐ 1920px (광범위 모니터)에서 테스트
- ☐ 1280px (일반 데스크톱)에서 테스트
- ☐ 768px (iPad)에서 테스트
- ☐ 425px (모바일)에서 테스트
- ☐ 375px (작은 모바일)에서 테스트

#### **Phase 5 마무리**

- ☐ Lint 실행 및 수정 (`npm run lint`)
- ☐ Type Check 실행 및 수정 (`npm run type-check`)
- ☐ Git 커밋: `style: 페이스북 Q&A 반응형 디자인 구현`
- ☐ **☑ Phase 5 완료 체크**

---

### **Phase 6: 대댓글 시스템**

**목표**: 계층적 댓글 구조 구현

**예상 시간**: 2시간

#### **6-1: 대댓글 표시 로직**

- ☐ parentId 기반 그룹화 함수
  - ☐ 메인 답변 필터링
  - ☐ 대댓글 필터링
  - ☐ 그룹화 로직
- ☐ isNested 플래그 설정
  - ☐ answer.parentId 확인
- ☐ 좌측 들여쓰기 (32px margin-left)
  - ☐ CSS 적용
  - ☐ Tailwind: ml-8

#### **6-2: 대댓글 작성 UI**

- ☐ "답글" 버튼 클릭 시 입력창 표시
  - ☐ useState로 상태 관리
  - ☐ replyToId 저장
- ☐ 부모 ID 자동 설정
  - ☐ 입력창에 parentId 전달
- ☐ 취소 버튼 추가
  - ☐ 입력 상태 초기화
  - ☐ replyToId 초기화

#### **6-3: 대댓글 수 표시**

- ☐ "N개의 답글 더 보기" 버튼
  - ☐ 클릭 시 전개
  - ☐ 초기 2-3개만 표시
- ☐ 애니메이션 (선택사항)
  - ☐ 부드러운 전개

#### **6-4: 중첩도 제한**

- ☐ 2단계까지만 허용
  - ☐ 대댓글의 댓글은 불가
  - ☐ UI에 "답글" 버튼 숨김

#### **Phase 6 마무리**

- ☐ Lint 실행 및 수정 (`npm run lint`)
- ☐ Type Check 실행 및 수정 (`npm run type-check`)
- ☐ Git 커밋: `feat: 페이스북 Q&A 대댓글 시스템 구현`
- ☐ **☑ Phase 6 완료 체크**

---

### **Phase 7: 성능 최적화**

**목표**: 컴포넌트 성능 최적화

**예상 시간**: 2시간

#### **7-1: 컴포넌트 메모이제이션**

- ☐ React.memo 적용
  - ☐ FacebookQuestionCard
  - ☐ FacebookAnswerCard
  - ☐ FacebookBadge
- ☐ useMemo 최적화
  - ☐ 배지 로직 메모이제이션
  - ☐ 리액션 수 계산 메모이제이션

#### **7-2: 렌더링 최적화**

- ☐ 대댓글 초기 숨김
  - ☐ 메인 답변만 기본 표시
  - ☐ 더보기 클릭 시만 렌더
- ☐ "더보기" 버튼으로 지연 로딩
  - ☐ 필요한 만큼만 렌더링
- ☐ Virtual scrolling 검토 (선택사항)
  - ☐ 매우 많은 댓글 시 고려

#### **7-3: 데이터 최적화**

- ☐ API 응답 캐싱
  - ☐ 기존 캐싱 로직 유지
- ☐ 불필요한 리렌더 방지
  - ☐ dependency array 정확히 설정
  - ☐ useCallback 활용

#### **7-4: 성능 측정**

- ☐ Lighthouse 점수 확인 (목표: > 90)
- ☐ Core Web Vitals 모니터링
  - ☐ LCP (Largest Contentful Paint)
  - ☐ FID (First Input Delay)
  - ☐ CLS (Cumulative Layout Shift)

#### **Phase 7 마무리**

- ☐ Lint 실행 및 수정 (`npm run lint`)
- ☐ Type Check 실행 및 수정 (`npm run type-check`)
- ☐ Git 커밋: `perf: 페이스북 Q&A 성능 최적화`
- ☐ **☑ Phase 7 완료 체크**

---

### **Phase 8: 테스트**

**목표**: 완벽한 테스트 커버리지

**예상 시간**: 4시간

#### **8-1: 단위 테스트**

- ☐ FacebookQuestionCard 테스트
  - ☐ 렌더링 확인
  - ☐ Props 전달 확인
  - ☐ 이벤트 핸들러 확인
- ☐ FacebookAnswerCard 테스트
  - ☐ 렌더링 확인
  - ☐ 배지 표시 확인
  - ☐ 리액션 수 표시 확인
- ☐ 배지 결정 로직 테스트
  - ☐ isAccepted → 채택됨 배지
  - ☐ isExpert → 전문가 배지
  - ☐ newbie → 신입 배지

#### **8-2: 통합 테스트**

- ☐ 질문 상세 페이지 전체
  - ☐ 질문 로드
  - ☐ 답변 리스트 표시
- ☐ 답변 작성/수정/삭제
  - ☐ 폼 제출
  - ☐ API 호출 확인
  - ☐ 상태 업데이트 확인
- ☐ 대댓글 상호작용
  - ☐ 대댓글 작성
  - ☐ 들여쓰기 확인
  - ☐ 계층 구조 유지

#### **8-3: E2E 테스트**

- ☐ 전체 플로우 테스트
  - ☐ 질문 보기 → 댓글 작성 → 대댓글 작성
  - ☐ 모든 액션 버튼 확인
  - ☐ 반응형 동작 확인
- ☐ 모바일 반응형 테스트
  - ☐ 375px 너비에서 렌더링 확인
  - ☐ 버튼 크기 확인 (44px)
- ☐ 크로스 브라우저 테스트
  - ☐ Chrome에서 테스트
  - ☐ Firefox에서 테스트
  - ☐ Safari에서 테스트

#### **8-4: 접근성 테스트**

- ☐ a11y 검사
  - ☐ WCAG 2.1 AA 준수
  - ☐ 스크린 리더 테스트
- ☐ 키보드 네비게이션
  - ☐ Tab 키로 모든 요소 접근 가능
  - ☐ Enter 키로 버튼 활성화

#### **Phase 8 마무리**

- ☐ Lint 실행 및 수정 (`npm run lint`)
- ☐ Type Check 실행 및 수정 (`npm run type-check`)
- ☐ Git 커밋: `test: 페이스북 Q&A 완벽한 테스트 구현`
- ☐ **☑ Phase 8 완료 체크**

---

### **Phase 9: 마이그레이션 및 모니터링**

**목표**: Feature flag를 통한 점진적 마이그레이션

**예상 시간**: 2시간

#### **9-1: Feature flag 구현**

- ☐ 환경 변수 추가
  - ☐ NEXT_PUBLIC_USE_FACEBOOK_UI 환경 변수
- ☐ useNewFacebookUI 훅 생성
  - ☐ 환경 변수 확인 로직
- ☐ 페이지에서 조건부 렌더링
  - ☐ 신규 또는 기존 컴포넌트 선택

#### **9-2: 기존 페이지 백업**

- ☐ 기존 페이지 완전히 작동 유지
- ☐ Version 관리 (Git)

#### **9-3: Gradual migration 계획**

- ☐ 1차: 개발 환경에서만 활성화
- ☐ 2차: 10% 사용자에게만 활성화
- ☐ 3차: 50% 사용자에게 활성화
- ☐ 4차: 100% 전체 사용자에게 활성화

#### **9-4: 모니터링 및 메트릭 수집**

- ☐ 성능 메트릭
  - ☐ LCP, FID, CLS 모니터링
  - ☐ Time to Interactive (TTI)
- ☐ 사용자 에러 추적
  - ☐ Sentry 또는 유사 서비스
  - ☐ 에러율 모니터링
- ☐ 분석 이벤트 추적
  - ☐ "답변 작성" 이벤트
  - ☐ "좋아요" 클릭 이벤트
  - ☐ "대댓글 작성" 이벤트

#### **Phase 9 마무리**

- ☐ Lint 실행 및 수정 (`npm run lint`)
- ☐ Type Check 실행 및 수정 (`npm run type-check`)
- ☐ Git 커밋: `feat: 페이스북 Q&A Feature flag 및 마이그레이션`
- ☐ **☑ Phase 9 완료 체크**

---

### **Phase 10: QA & 배포**

**목표**: 최종 검증 및 프로덕션 배포

**예상 시간**: 3시간

#### **10-1: 최종 검증**

- ☐ 디자인 시스템 준수 확인
  - ☐ 색상 팔레트 확인
  - ☐ 타이포그래피 확인
  - ☐ 간격/패딩 확인
- ☐ 접근성 검사 (a11y)
  - ☐ axe-core 또는 유사 도구 실행
  - ☐ 모든 에러 수정
- ☐ 성능 벤치마크
  - ☐ Lighthouse 점수 > 90
  - ☐ Core Web Vitals 모두 "Good"

#### **10-2: 스테이징 환경 배포**

- ☐ 환경 변수 설정
  - ☐ NEXT_PUBLIC_USE_FACEBOOK_UI=true
- ☐ 스테이징 서버 배포
- ☐ QA 팀 테스트
  - ☐ 기능 테스트
  - ☐ 성능 테스트
  - ☐ 보안 테스트

#### **10-3: 사용자 피드백 수집**

- ☐ 스테이징 환경에서 제한된 사용자 테스트
- ☐ 피드백 수집 및 분석
- ☐ 버그/개선 사항 식별
- ☐ 필요시 수정

#### **10-4: 프로덕션 배포**

- ☐ 배포 전 최종 체크리스트
  - ☐ 모든 테스트 통과
  - ☐ 성능 벤치마크 확인
  - ☐ 접근성 검사 완료
- ☐ 프로덕션 서버 배포
- ☐ Feature flag 점진적 활성화
  - ☐ 1시간: 5% 사용자
  - ☐ 4시간: 25% 사용자
  - ☐ 12시간: 100% 사용자

#### **10-5: 배포 후 모니터링**

- ☐ 실시간 모니터링 (1시간)
  - ☐ 에러율 확인
  - ☐ 성능 메트릭 확인
- ☐ 롤백 준비
  - ☐ 문제 발생 시 즉시 롤백 가능
  - ☐ Feature flag로 간단히 롤백

#### **Phase 10 마무리**

- ☐ Lint 최종 실행 및 수정 (`npm run lint`)
- ☐ Type Check 최종 실행 및 수정 (`npm run type-check`)
- ☐ Git 커밋: `deploy: 페이스북 Q&A 완전 배포 및 마이그레이션 완료`
- ☐ **☑ Phase 10 완료 체크**

---

## 📁 수정 대상 파일

| 파일 경로                                                            | 변경 내용                        | Phase |
| -------------------------------------------------------------------- | -------------------------------- | ----- |
| `apps/web/src/components/question/facebook/FacebookQuestionCard.tsx` | 신규 생성                        | 1     |
| `apps/web/src/components/question/facebook/FacebookAnswerInput.tsx`  | 신규 생성                        | 1     |
| `apps/web/src/components/question/facebook/FacebookAnswerCard.tsx`   | 신규 생성                        | 1     |
| `apps/web/src/components/question/facebook/FacebookAnswerThread.tsx` | 신규 생성                        | 1     |
| `apps/web/src/components/question/facebook/FacebookBadge.tsx`        | 신규 생성                        | 4     |
| `apps/web/src/components/question/facebook/types.ts`                 | 신규 생성                        | 1     |
| `apps/web/src/styles/facebook-qa.css`                                | 신규 생성                        | 2     |
| `apps/web/src/app/questions/[id]/page.tsx`                           | Feature flag 추가, 컴포넌트 교체 | 9     |
| `tailwind.config.js`                                                 | Tailwind 커스텀 설정 추가        | 2     |

---

## 🔍 체크리스트 완료 기준

각 Phase는 **100% 완료**되어야 다음 Phase로 진행합니다.

### 완료 기준:

- ✅ 모든 개발 업무 완료 (모든 항목에 ✓ 체크)
- ✅ Lint 통과 (`npm run lint`)
- ✅ Type Check 통과 (`npm run type-check`)
- ✅ Git 커밋 완료 (`git commit`)
- ✅ Phase 완료 체크 수행

### 진행 상태:

```
Phase 1: [✓] 100%  완료
Phase 2: [✓] 100%  완료
Phase 3: [✓] 100%  완료 ← 방금 완료!
Phase 4: [ ] 0%    대기
Phase 5: [ ] 0%    대기
Phase 6: [ ] 0%    대기
Phase 7: [ ] 0%    대기
Phase 8: [ ] 0%    대기
Phase 9: [ ] 0%    대기
Phase 10: [ ] 0%   대기
```

---

## 🚀 실행 순서

1. **Phase 1 시작** → 모든 체크박스 완료 → Lint/Type Check → Git 커밋 → Phase 1 완료 체크
2. **Phase 2 시작** → 모든 체크박스 완료 → Lint/Type Check → Git 커밋 → Phase 2 완료 체크
3. **Phase 3 시작** → 모든 체크박스 완료 → Lint/Type Check → Git 커밋 → Phase 3 완료 체크
4. **Phase 4 시작** → 모든 체크박스 완료 → Lint/Type Check → Git 커밋 → Phase 4 완료 체크
5. **Phase 5 시작** → 모든 체크박스 완료 → Lint/Type Check → Git 커밋 → Phase 5 완료 체크
6. **Phase 6 시작** → 모든 체크박스 완료 → Lint/Type Check → Git 커밋 → Phase 6 완료 체크
7. **Phase 7 시작** → 모든 체크박스 완료 → Lint/Type Check → Git 커밋 → Phase 7 완료 체크
8. **Phase 8 시작** → 모든 체크박스 완료 → Lint/Type Check → Git 커밋 → Phase 8 완료 체크
9. **Phase 9 시작** → 모든 체크박스 완료 → Lint/Type Check → Git 커밋 → Phase 9 완료 체크
10. **Phase 10 시작** → 모든 체크박스 완료 → Lint/Type Check → Git 커밋 → Phase 10 완료 체크

---

## ⏱️ 예상 소요 시간 요약

| Phase            | 예상 시간 | 상태            |
| ---------------- | --------- | --------------- |
| 1. 컴포넌트 분리 | 3h        | ☑              |
| 2. 스타일 구축   | 2h        | ☑              |
| 3. API 연동      | 2h        | ☑              |
| 4. 배지 시스템   | 1h        | ☐               |
| 5. 반응형 디자인 | 2h        | ☐               |
| 6. 대댓글 시스템 | 2h        | ☐               |
| 7. 성능 최적화   | 2h        | ☐               |
| 8. 테스트        | 4h        | ☐               |
| 9. 마이그레이션  | 2h        | ☐               |
| 10. QA & 배포    | 3h        | ☐               |
| **합계**         | **23h**   | 7h 완료 (30.4%) |

---

## 📊 참고 문서

- 프로토타입 HTML: `docs/facebook-style-qa-prototype.html`
- 디자인 계획서: `docs/26-페이스북스타일-QA-리디자인-계획서.md`
- 현재 페이지: http://localhost:3000/questions/[id]

---

## 📞 진행 상황 업데이트

| 날짜       | Phase      | 상태    | 진행률 | 메모                    |
| ---------- | ---------- | ------- | ------ | ----------------------- |
| 2025-10-21 | 기획       | ✅ 완료 | 100%   | 계획서 완성             |
| 2025-10-21 | Phase 1    | ✅ 완료 | 100%   | 컴포넌트 분리 완료      |
| 2025-10-21 | Phase 2    | ✅ 완료 | 100%   | 스타일 시스템 구축 완료 |
| 2025-10-21 | Phase 3    | ✅ 완료 | 100%   | API 연동 준비 완료 ⭐   |
| 미정       | Phase 4-10 | ☐ 대기  | 0%     | 추후 진행               |

---

**최종 업데이트**: 2025-10-21
**문서 버전**: v1.1
**상태**: 🚀 **Phase 3 완료! (7시간 / 23시간 = 30.4%) - Phase 4 준비 중**
