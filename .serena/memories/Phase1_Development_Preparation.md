# Phase 1: 콘텐츠 삭제 - 접근 제어 강화 (개발 준비 완료)

## 📋 현황 분석

### ✅ 이미 구현된 것

1. **Prisma Schema**
   - AuditLog 모델 정의 완료 (packages/database/prisma/schema.prisma)
   - User, Question, Answer, AnswerComment 모델에 필요한 필드 구성 완료
   - QuestionStatus, AnswerStatus, AnswerCommentStatus enum 정의됨

2. **AuditLogService**
   - 파일: apps/api/src/services/auditLog/AuditLogService.ts
   - 메서드:
     - logDelete(): 삭제 작업 기록
     - logRestore(): 복구 작업 기록
     - logPermanentlyDelete(): 영구 삭제 작업 기록
     - getAuditLogs(): 특정 대상의 감시 로그 조회
     - getAuditLogsByUser(): 사용자별 감시 로그 조회
     - getAuditLogsByDateRange(): 기간별 감시 로그 조회
     - getOldDeletedDataAuditLogs(): 30일 이상 경과 데이터 조회

### 📝 Phase 1에서 구현할 것

1. **Repository 레벨 필터링** (필수)
   - QuestionRepository: getQuestion(), listQuestions() 등에서 DELETED 상태 제외
   - AnswerRepository: 동일하게 DELETED 상태 제외
   - AnswerCommentRepository: 동일하게 DELETED 상태 제외

2. **Service 레벨 통합** (필수)
   - QuestionService에 AuditLogService 주입 및 deleteQuestion() 수정
   - AnswerService에 AuditLogService 주입 및 deleteAnswer() 수정
   - AnswerCommentService에 AuditLogService 주입 및 deleteComment() 수정

3. **Controller 레벨 필터링** (선택사항)
   - API 응답 시 DELETED 상태 확인

4. **캐시 레벨 필터링** (선택사항)
   - Redis 캐시에서 DELETED 데이터 제외

5. **관리자 API** (선택사항)
   - GET /api/admin/deleted-questions: 삭제된 질문 조회
   - POST /api/admin/restore-question/:id: 질문 복구

### 🔧 구현 순서

1. QuestionRepository 필터링
2. AnswerRepository 필터링
3. AnswerCommentRepository 필터링
4. QuestionService AuditLogService 통합
5. AnswerService AuditLogService 통합
6. AnswerCommentService AuditLogService 통합
7. Controller 필터링 검증
8. 테스트 작성 및 실행
9. Lint/Type Check 통과
10. Git 커밋

## 📊 파일 위치

### 수정 대상 파일

- `apps/api/src/services/question/QuestionRepository.ts`
- `apps/api/src/services/question/QuestionService.ts`
- `apps/api/src/services/answer/AnswerRepository.ts`
- `apps/api/src/services/answer/AnswerService.ts`
- `apps/api/src/services/answerComment/AnswerCommentRepository.ts`
- `apps/api/src/services/answerComment/AnswerCommentService.ts`
- `apps/api/src/controllers/` (필요시)

### 참고 파일

- `packages/database/prisma/schema.prisma` (AuditLog 모델 정의)
- `apps/api/src/services/auditLog/AuditLogService.ts` (이미 구현됨)

## 🎯 SOLID 원칙 준수

- **SRP**: 각 Service는 자신의 데이터만 관리
- **OCP**: 기존 로직 수정 최소화, 확장성 중심
- **LSP**: 메서드 시그니처 일관성 유지
- **ISP**: 필요한 메서드만 노출
- **DIP**: 서비스 간 명확한 의존성 주입

## ✅ Phase 1 완료 기준

- [ ] 모든 Repository에 DELETED 상태 필터링
- [ ] 모든 Service에 AuditLogService 통합
- [ ] Controller 레벨 필터링 (선택)
- [ ] 단위 테스트 100% 통과
- [ ] Lint/Error 0개
- [ ] TypeScript 컴파일 에러 0개
- [ ] Git 커밋

**개발 준비 상태**: ✅ 완료
**예상 소요 시간**: 1일
**시작 날짜**: 2025-10-25
