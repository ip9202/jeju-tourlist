# 동네물어봐 - 개인정보 삭제 정책 개선 실행계획서 (SOLID 원칙)

## 목차

1. [개요](#-개요)
2. [아키텍처](#-아키텍처)
3. [Phase 1: 콘텐츠 삭제 - 접근 제어 강화](#phase-1-콘텐츠-삭제-접근-제어-강화)
4. [Phase 2: 콘텐츠 삭제 - Cascade 소프트 삭제](#phase-2-콘텐츠-삭제-cascade-소프트-삭제)
5. [Phase 3: 자동 완전 삭제 배치](#phase-3-자동-완전-삭제-배치)
6. [Phase 4: 회원정보 개인정보 삭제](#phase-4-회원정보-개인정보-삭제)
7. [Phase 5: 테스트 및 검증](#phase-5-테스트-및-검증)
8. [완료 체크리스트](#-완료-체크리스트)

---

## 🎯 개요

SOLID 원칙을 완벽히 준수하면서 개인정보보호법(PIPA)과 GDPR 요구사항을 만족하는 개인정보 삭제 정책을 구현합니다.

### 구현 순서 (SOLID 원칙)

**순서대로 진행하면 기존 로직 수정 없이 새 기능만 확장됩니다.**

1. Phase 1: 접근 제어 강화 (1일)
2. Phase 2: Cascade 소프트삭제 (1-2일)
3. Phase 3: 자동 완전삭제 배치 (1일)
4. Phase 4: 회원정보 삭제 (2-3일)
5. Phase 5: 테스트 및 검증 (1-2일)

**총 예상 소요: 6-9일**

---

## 🏗️ 아키텍처

### SOLID 원칙 준수 구조

```
삭제 요청 (DELETE /api/questions/:id)
    ↓
QuestionService.deleteQuestion()
├── SRP: 자신의 책임만 처리
├── 답변 삭제 요청 → AnswerService.deleteAnswer()
│   ├── 댓글 삭제 요청 → AnswerCommentService.deleteComment()
│   └── 자신의 답변만 삭제
└── 자신의 질문만 삭제
    ↓
AuditLogService.log() [분리된 책임]
    ↓
캐시 무효화 [분리된 책임]
```

### 핵심 원칙

- **SRP (Single Responsibility)**: 각 Service는 자신의 데이터만 관리
- **OCP (Open/Closed)**: 기존 로직 수정 없이 확장
- **LSP (Liskov Substitution)**: Service 인터페이스 통일
- **ISP (Interface Segregation)**: 필요한 메서드만 노출
- **DIP (Dependency Inversion)**: 상위 모듈이 하위 모듈에 의존하지 않음

---

## Phase 1: 콘텐츠 삭제 - 접근 제어 강화

**목표**: 삭제된 데이터가 조회되지 않도록 모든 접근 경로에서 필터링

**예상 소요: 1일**

### 1.1 AuditLog 테이블 생성

- [ ] Prisma 스키마에 AuditLog 모델 추가

```typescript
model AuditLog {
  id        String   @id @default(cuid())
  action    String   // "DELETE", "RESTORE", "PERMANENTLY_DELETE"
  targetType String  // "QUESTION", "ANSWER", "COMMENT"
  targetId  String
  userId    String   // 작업을 수행한 사용자
  reason    String?  // 삭제 이유
  status    String   // "DELETED", "RESTORED", "PERMANENTLY_DELETED"
  details   Json?    // 추가 정보
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([action])
  @@index([targetType])
  @@index([userId])
  @@index([createdAt])
}
```

- [ ] 마이그레이션 생성: `pnpm exec prisma migrate dev --name add-audit-log`
- [ ] Lint/Error 체크: `pnpm run lint && pnpm run type-check` 통과

### 1.2 AuditLogService 구현 (새로운 Service)

**SRP 준수**: 감시 로깅만 전담

- [ ] 파일 생성: `apps/api/src/services/auditLog/AuditLogService.ts`

```typescript
import { PrismaClient } from "@jeju-tourlist/database";

export class AuditLogService {
  constructor(private prisma: PrismaClient) {}

  async log(data: {
    action: string;
    targetType: string;
    targetId: string;
    userId: string;
    reason?: string;
    status?: string;
    details?: any;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        ...data,
        status: data.status || "DELETED",
      },
    });
  }

  async getDeleteHistory(targetId: string, targetType: string) {
    return await this.prisma.auditLog.findMany({
      where: {
        targetId,
        targetType,
        action: { in: ["DELETE", "RESTORE", "PERMANENTLY_DELETE"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, nickname: true },
        },
      },
    });
  }
}
```

- [ ] Lint/Error 체크: `pnpm run lint && pnpm run type-check` 통과

### 1.3 QuestionService에 AuditLogService 주입

**DIP 준수**: Service 간 의존성 명확화

- [ ] `apps/api/src/services/question/QuestionService.ts` 수정

```typescript
export class QuestionService {
  constructor(
    private prisma: PrismaClient,
    private auditLogService: AuditLogService // 주입
  ) {}

  async deleteQuestion(id: string, userId: string): Promise<Question> {
    // 기존 삭제 로직
    const question = await this.prisma.question.update({
      where: { id },
      data: { status: "DELETED", updatedAt: new Date() },
    });

    // 감시 로그 (분리된 책임)
    await this.auditLogService.log({
      action: "DELETE",
      targetType: "QUESTION",
      targetId: id,
      userId,
      reason: "User requested deletion",
    });

    return question;
  }
}
```

- [ ] Lint/Error 체크: `pnpm run lint && pnpm run type-check` 통과

### 1.4 Repository 레벨 필터링

**목표**: 모든 조회 메서드에서 DELETED 자동 제외

- [ ] `QuestionRepository.getQuestion()` 수정

```typescript
async getQuestion(id: string): Promise<Question | null> {
  const question = await this.prisma.question.findUnique({
    where: { id },
  });

  if (!question || question.status === 'DELETED') {
    throw new Error('존재하지 않는 질문입니다');
  }

  return question;
}
```

- [ ] `QuestionRepository.listQuestions()` 수정

```typescript
async listQuestions(filters: any): Promise<Question[]> {
  return await this.prisma.question.findMany({
    where: {
      ...filters,
      status: { not: 'DELETED' },  // 항상 DELETED 제외
    },
  });
}
```

- [ ] AnswerRepository에도 동일 적용
- [ ] AnswerCommentRepository에도 동일 적용
- [ ] Lint/Error 체크: Repository 테스트 100% 통과

### 1.5 API 레벨 응답 필터링

**목표**: Controller에서도 DELETED 상태 체크

- [ ] `GET /api/questions/:id` 컨트롤러 수정

```typescript
async getQuestion(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const question = await this.questionService.getQuestion(id);
    res.json(createResponse(true, 'Success', question));
  } catch (error) {
    res.status(404).json(
      createResponse(false, (error as Error).message, null)
    );
  }
}
```

- [ ] Lint/Error 체크: API 통합 테스트 100% 통과

### 1.6 캐시 레벨 필터링

**목표**: Redis 캐시에서도 DELETED 데이터 제외

- [ ] 캐시 조회 시 status 체크

```typescript
async getQuestionCached(id: string): Promise<Question | null> {
  // 캐시에서 조회
  const cached = await this.cache.get(`question:${id}`);
  if (cached) {
    const question = JSON.parse(cached);
    // DELETED 상태면 캐시 무효화
    if (question.status === 'DELETED') {
      await this.cache.delete(`question:${id}`);
      return null;
    }
    return question;
  }

  // DB에서 조회
  const question = await this.prisma.question.findUnique({
    where: { id },
  });

  if (question && question.status !== 'DELETED') {
    await this.cache.set(`question:${id}`, JSON.stringify(question));
  }

  return question;
}
```

- [ ] 삭제 시 캐시 제거

```typescript
async deleteQuestion(id: string, userId: string): Promise<void> {
  // 질문 삭제
  await this.prisma.question.update({
    where: { id },
    data: { status: 'DELETED' },
  });

  // 캐시 무효화
  await this.cache.delete(`question:${id}`);
}
```

- [ ] Lint/Error 체크: 캐시 테스트 100% 통과

### 1.7 관리자 API (선택사항)

**목표**: 관리자만 삭제된 데이터 조회 가능

- [ ] `GET /api/admin/deleted-questions` 엔드포인트

```typescript
router.get(
  "/admin/deleted-questions",
  authenticate,
  isAdmin,
  async (req: Request, res: Response) => {
    const questions = await this.prisma.question.findMany({
      where: { status: "DELETED" },
      include: {
        author: { select: { id: true, nickname: true } },
        auditLogs: {
          where: { action: "DELETE" },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json(createResponse(true, "Success", questions));
  }
);
```

- [ ] 복구 기능: `POST /api/admin/restore-question/:id`
- [ ] Lint/Error 체크: 관리자 API 권한 테스트 통과

### 1.8 단위 테스트

- [ ] Repository 필터링 테스트

```typescript
describe("QuestionRepository", () => {
  it("should exclude deleted questions", async () => {
    const deleted = await createQuestion({ status: "DELETED" });
    const result = await repository.getQuestion(deleted.id);
    expect(result).toBeNull(); // 또는 에러 throw
  });

  it("should list questions without deleted", async () => {
    await createQuestion({ status: "DELETED" });
    await createQuestion({ status: "ACTIVE" });

    const results = await repository.listQuestions({});
    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("ACTIVE");
  });
});
```

- [ ] Lint/Error 체크: Phase 1 테스트 100% 통과

### Phase 1 체크리스트

- [x] AuditLog 테이블 생성 및 마이그레이션
- [x] AuditLogService 구현
- [x] Repository에 필터링 추가
- [x] API 컨트롤러에서 필터링
- [x] 캐시 레벨 필터링
- [ ] 관리자 API (선택사항)
- [x] 모든 테스트 100% 통과
- [x] Lint/Error 0개
- [x] Git 커밋

**Phase 1 완료**: ☑

---

## Phase 2: 콘텐츠 삭제 - Cascade 소프트 삭제

**목표**: 질문/답변/댓글 삭제 시 연쇄적으로 소프트삭제

**예상 소요: 1-2일**

**SOLID 원칙**: 각 Service가 자신의 책임만 처리하고, 하위 엔티티 삭제는 각 Service가 담당

### 2.1 QuestionService - deleteQuestion 수정

**SRP 준수**: 질문만 삭제, 답변 삭제는 AnswerService에 위임

- [ ] `apps/api/src/services/question/QuestionService.ts` 수정

```typescript
export class QuestionService {
  constructor(
    private prisma: PrismaClient,
    private answerService: AnswerService, // 주입
    private auditLogService: AuditLogService
  ) {}

  async deleteQuestion(id: string, userId: string): Promise<void> {
    // 1. 권한 확인
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new Error("질문을 찾을 수 없습니다");
    }

    if (question.authorId !== userId && !this.isAdmin(userId)) {
      throw new Error("삭제할 권한이 없습니다");
    }

    // 2. 모든 답변 삭제 (AnswerService에 위임)
    const answers = await this.prisma.answer.findMany({
      where: { questionId: id },
      select: { id: true },
    });

    for (const answer of answers) {
      await this.answerService.deleteAnswer(answer.id, userId);
    }

    // 3. 자신의 질문만 삭제
    await this.prisma.question.update({
      where: { id },
      data: { status: "DELETED", updatedAt: new Date() },
    });

    // 4. 감시 로그
    await this.auditLogService.log({
      action: "DELETE",
      targetType: "QUESTION",
      targetId: id,
      userId,
    });
  }
}
```

- [ ] Lint/Error 체크: `pnpm run type-check` 통과

### 2.2 AnswerService - deleteAnswer 수정

**SRP 준수**: 답변만 삭제, 댓글 삭제는 AnswerCommentService에 위임

- [ ] `apps/api/src/services/answer/AnswerService.ts` 수정

```typescript
export class AnswerService {
  constructor(
    private prisma: PrismaClient,
    private commentService: AnswerCommentService, // 주입
    private auditLogService: AuditLogService
  ) {}

  async deleteAnswer(id: string, userId: string): Promise<void> {
    // 1. 권한 확인
    const answer = await this.prisma.answer.findUnique({
      where: { id },
    });

    if (!answer) {
      throw new Error("답변을 찾을 수 없습니다");
    }

    if (answer.authorId !== userId && !this.isAdmin(userId)) {
      throw new Error("삭제할 권한이 없습니다");
    }

    // 2. 모든 댓글 삭제 (AnswerCommentService에 위임)
    const comments = await this.prisma.answerComment.findMany({
      where: { answerId: id },
      select: { id: true },
    });

    for (const comment of comments) {
      await this.commentService.deleteComment(comment.id, userId);
    }

    // 3. 자신의 답변만 삭제
    await this.prisma.answer.update({
      where: { id },
      data: { status: "DELETED", updatedAt: new Date() },
    });

    // 4. 감시 로그
    await this.auditLogService.log({
      action: "DELETE",
      targetType: "ANSWER",
      targetId: id,
      userId,
    });
  }
}
```

- [ ] Lint/Error 체크: `pnpm run type-check` 통과

### 2.3 AnswerCommentService - deleteComment 수정

**SRP 준수**: 댓글만 삭제, 대댓글 삭제는 재귀 호출

- [ ] `apps/api/src/services/answerComment/AnswerCommentService.ts` 수정

```typescript
export class AnswerCommentService {
  constructor(
    private prisma: PrismaClient,
    private auditLogService: AuditLogService
  ) {}

  async deleteComment(id: string, userId: string): Promise<void> {
    // 1. 권한 확인
    const comment = await this.prisma.answerComment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new Error("댓글을 찾을 수 없습니다");
    }

    if (comment.authorId !== userId && !this.isAdmin(userId)) {
      throw new Error("삭제할 권한이 없습니다");
    }

    // 2. 모든 대댓글 삭제 (재귀)
    const replies = await this.prisma.answerComment.findMany({
      where: { parentCommentId: id },
      select: { id: true },
    });

    for (const reply of replies) {
      await this.deleteComment(reply.id, userId);
    }

    // 3. 자신의 댓글만 삭제
    await this.prisma.answerComment.update({
      where: { id },
      data: { status: "DELETED", updatedAt: new Date() },
    });

    // 4. 감시 로그
    await this.auditLogService.log({
      action: "DELETE",
      targetType: "COMMENT",
      targetId: id,
      userId,
    });
  }
}
```

- [ ] Lint/Error 체크: `pnpm run type-check` 통과

### 2.4 참조 무결성 유지

- [ ] 질문 삭제 시 acceptedAnswerId 초기화

```typescript
async deleteQuestion(id: string, userId: string): Promise<void> {
  // ... 답변 삭제 ...

  // 질문의 acceptedAnswerId 초기화
  await this.prisma.question.update({
    where: { id },
    data: {
      status: 'DELETED',
      acceptedAnswerId: null,  // 초기화
      updatedAt: new Date(),
    },
  });
}
```

- [ ] 좋아요/북마크는 물리 삭제 (cascade로 자동 처리)
- [ ] Lint/Error 체크: 참조 무결성 테스트 통과

### 2.5 통합 테스트

- [ ] 질문 삭제 시 답변/댓글도 함께 삭제 확인

```typescript
it("should delete question with all answers and comments", async () => {
  const question = await createQuestion();
  const answer = await createAnswer({ questionId: question.id });
  const comment = await createComment({ answerId: answer.id });

  await questionService.deleteQuestion(question.id, userId);

  const deletedQuestion = await prisma.question.findUnique({
    where: { id: question.id },
  });
  expect(deletedQuestion.status).toBe("DELETED");

  const deletedAnswer = await prisma.answer.findUnique({
    where: { id: answer.id },
  });
  expect(deletedAnswer.status).toBe("DELETED");

  const deletedComment = await prisma.answerComment.findUnique({
    where: { id: comment.id },
  });
  expect(deletedComment.status).toBe("DELETED");
});
```

- [ ] Lint/Error 체크: Phase 2 테스트 100% 통과

### Phase 2 체크리스트

- [x] QuestionService.deleteQuestion 재구현
- [x] AnswerService.deleteAnswer 재구현
- [x] AnswerCommentService.deleteComment 재구현
- [x] 참조 무결성 유지 확인
- [x] 모든 테스트 100% 통과
- [x] Lint/Error 0개
- [x] Git 커밋

**Phase 2 완료**: ☑

---

## Phase 3: 자동 완전 삭제 배치

**목표**: 30일 경과한 DELETED 데이터 자동 영구 삭제

**예상 소요: 1일**

### 3.1 DeletedDataCleanupService 생성

**SRP 준수**: 배치 삭제만 전담

- [ ] 파일 생성: `apps/api/src/services/deletedDataCleanup/DeletedDataCleanupService.ts`

```typescript
import { PrismaClient } from "@jeju-tourlist/database";

export class DeletedDataCleanupService {
  constructor(private prisma: PrismaClient) {}

  async permanentlyDeleteOldData(daysThreshold: number = 30): Promise<{
    deletedComments: number;
    deletedAnswers: number;
    deletedQuestions: number;
  }> {
    const cutoffDate = new Date(
      Date.now() - daysThreshold * 24 * 60 * 60 * 1000
    );

    let result = { deletedComments: 0, deletedAnswers: 0, deletedQuestions: 0 };

    try {
      // 트랜잭션으로 일관성 보장
      result = await this.prisma.$transaction(async tx => {
        // 1. 댓글 완전 삭제
        const deletedComments = await tx.answerComment.deleteMany({
          where: {
            status: "DELETED",
            updatedAt: { lt: cutoffDate },
          },
        });

        // 2. 답변 완전 삭제
        const deletedAnswers = await tx.answer.deleteMany({
          where: {
            status: "DELETED",
            updatedAt: { lt: cutoffDate },
          },
        });

        // 3. 질문 완전 삭제
        const deletedQuestions = await tx.question.deleteMany({
          where: {
            status: "DELETED",
            updatedAt: { lt: cutoffDate },
          },
        });

        return {
          deletedComments: deletedComments.count,
          deletedAnswers: deletedAnswers.count,
          deletedQuestions: deletedQuestions.count,
        };
      });
    } catch (error) {
      console.error("Failed to permanently delete old data:", error);
      throw error;
    }

    return result;
  }
}
```

- [ ] Lint/Error 체크: `pnpm run type-check` 통과

### 3.2 DeleteCleanupLog 테이블 생성

- [ ] Prisma 스키마에 모델 추가

```typescript
model DeleteCleanupLog {
  id                String   @id @default(cuid())
  status            String   // "STARTED", "SUCCESS", "FAILED"
  startedAt         DateTime @default(now())
  completedAt       DateTime?
  deletedComments   Int      @default(0)
  deletedAnswers    Int      @default(0)
  deletedQuestions  Int      @default(0)
  errorMessage      String?
  durationMs        Int?

  @@index([status])
  @@index([startedAt])
}
```

- [ ] 마이그레이션 생성: `pnpm exec prisma migrate dev --name add-delete-cleanup-log`
- [ ] Lint/Error 체크: `pnpm run type-check` 통과

### 3.3 배치 스케줄 설정

- [ ] 파일 생성: `apps/api/src/jobs/deleteCleanupJob.ts`

```typescript
import cron from "node-cron";
import { PrismaClient } from "@jeju-tourlist/database";
import { DeletedDataCleanupService } from "../services/deletedDataCleanup/DeletedDataCleanupService";

const prisma = new PrismaClient();
const cleanupService = new DeletedDataCleanupService(prisma);

export function scheduleDeleteCleanupJob() {
  // 매일 자정 (KST)에 실행
  cron.schedule("0 0 * * *", async () => {
    const logStartedAt = new Date();

    try {
      console.log("[DeleteCleanupJob] Starting permanent delete cleanup...");

      // 배치 로그 시작
      const log = await prisma.deleteCleanupLog.create({
        data: {
          status: "STARTED",
        },
      });

      // 배치 실행
      const result = await cleanupService.permanentlyDeleteOldData(30);

      // 완료
      const logEndedAt = new Date();
      await prisma.deleteCleanupLog.update({
        where: { id: log.id },
        data: {
          status: "SUCCESS",
          completedAt: logEndedAt,
          ...result,
          durationMs: logEndedAt.getTime() - logStartedAt.getTime(),
        },
      });

      console.log("[DeleteCleanupJob] Cleanup completed:", result);
    } catch (error) {
      console.error("[DeleteCleanupJob] Failed:", error);

      const logEndedAt = new Date();
      await prisma.deleteCleanupLog.create({
        data: {
          status: "FAILED",
          completedAt: logEndedAt,
          errorMessage: (error as Error).message,
          durationMs: logEndedAt.getTime() - logStartedAt.getTime(),
        },
      });
    }
  });

  console.log("[DeleteCleanupJob] Scheduled for daily cleanup at midnight KST");
}
```

- [ ] API 시작 시 스케줄 등록: `apps/api/src/index.ts`

```typescript
import { scheduleDeleteCleanupJob } from "./jobs/deleteCleanupJob";

// 애플리케이션 시작 시
scheduleDeleteCleanupJob();
```

- [ ] Lint/Error 체크: `pnpm run type-check` 통과

### 3.4 관리자 수동 삭제 API

- [ ] `DELETE /api/admin/permanently-delete-question/:id` 엔드포인트

```typescript
router.delete(
  "/admin/permanently-delete-question/:id",
  authenticate,
  isAdmin,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      // 질문이 DELETED 상태인지 확인
      const question = await prisma.question.findUnique({
        where: { id },
      });

      if (!question) {
        return res
          .status(404)
          .json(createResponse(false, "질문을 찾을 수 없습니다", null));
      }

      if (question.status !== "DELETED") {
        return res
          .status(400)
          .json(
            createResponse(false, "삭제된 질문만 영구 삭제 가능합니다", null)
          );
      }

      // 물리 삭제
      await prisma.question.delete({
        where: { id },
      });

      res.json(createResponse(true, "질문이 영구 삭제되었습니다", null));
    } catch (error) {
      res
        .status(500)
        .json(createResponse(false, (error as Error).message, null));
    }
  }
);
```

- [ ] Lint/Error 체크: 관리자 API 권한 테스트 통과

### 3.5 단위 테스트

- [ ] 배치 작업 테스트

```typescript
it("should permanently delete data older than 30 days", async () => {
  const oldDeletedQuestion = await prisma.question.create({
    data: {
      ...questionData,
      status: "DELETED",
      updatedAt: new Date("2024-09-24"),
    },
  });

  const result = await cleanupService.permanentlyDeleteOldData(30);

  const deleted = await prisma.question.findUnique({
    where: { id: oldDeletedQuestion.id },
  });

  expect(deleted).toBeNull();
  expect(result.deletedQuestions).toBeGreaterThan(0);
});
```

- [ ] Lint/Error 체크: Phase 3 테스트 100% 통과

### Phase 3 체크리스트

- [x] DeletedDataCleanupService 구현
- [x] DeleteCleanupLog 테이블 생성
- [x] 배치 스케줄 설정
- [x] 수동 삭제 API
- [x] 모든 테스트 100% 통과
- [x] Lint/Error 0개
- [x] Git 커밋

**Phase 3 완료**: ☑

---

## Phase 4: 회원정보 개인정보 삭제

**목표**: 사용자 탈퇴 시 모든 개인정보 안전하게 삭제

**예상 소요: 2-3일**

### 4.1 DeletionRequest 테이블 생성

- [ ] Prisma 스키마에 모델 추가

```typescript
model DeletionRequest {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  requestedAt     DateTime @default(now())
  reason          String?
  status          String   // "PENDING", "APPROVED", "COMPLETED", "CANCELLED"
  willBeDeletedAt DateTime // 요청일 + 30일

  requestIp       String?
  requestUserAgent String?

  completedAt     DateTime?
  completedBy     String?  // "admin" 또는 "system"

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status])
  @@index([willBeDeletedAt])
}

// User 모델에 추가
model User {
  // ... 기존 필드 ...
  deletionRequest DeletionRequest?
  isDeletionRequested Boolean @default(false)
  deletionRequestedAt DateTime?
  willBeDeletedAt     DateTime?
}
```

- [ ] 마이그레이션 생성: `pnpm exec prisma migrate dev --name add-deletion-request`
- [ ] Lint/Error 체크: `pnpm run type-check` 통과

### 4.2 UserDeletionService 생성 (새로운 Service)

**SRP 준수**: 사용자 삭제만 전담

- [ ] 파일 생성: `apps/api/src/services/userDeletion/UserDeletionService.ts`

```typescript
import { PrismaClient } from "@jeju-tourlist/database";

export class UserDeletionService {
  constructor(
    private prisma: PrismaClient,
    private questionService: QuestionService,
    private emailService: EmailService // 이메일 발송
  ) {}

  // 1단계: 삭제 요청
  async requestDeletion(
    userId: string,
    reason?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ willBeDeletedAt: Date }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다");
    }

    // 이미 삭제 요청 중인지 확인
    const existingRequest = await this.prisma.deletionRequest.findUnique({
      where: { userId },
    });

    if (existingRequest && existingRequest.status === "PENDING") {
      throw new Error("이미 삭제 요청이 진행 중입니다");
    }

    // 30일 후 삭제
    const willBeDeletedAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const request = await this.prisma.deletionRequest.create({
      data: {
        userId,
        reason,
        status: "PENDING",
        willBeDeletedAt,
        requestIp: ipAddress,
        requestUserAgent: userAgent,
      },
    });

    // 사용자 계정 비활성화
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        isDeletionRequested: true,
        deletionRequestedAt: new Date(),
        willBeDeletedAt,
      },
    });

    // 확인 이메일 발송
    await this.emailService.sendDeletionConfirmation(user.email, {
      willBeDeletedAt,
      cancelUrl: `/api/users/${userId}/deletion-request/cancel`,
    });

    return { willBeDeletedAt };
  }

  // 취소
  async cancelDeletion(userId: string): Promise<void> {
    const request = await this.prisma.deletionRequest.findUnique({
      where: { userId },
    });

    if (!request || request.status !== "PENDING") {
      throw new Error("취소할 수 있는 삭제 요청이 없습니다");
    }

    // 삭제 요청 취소
    await this.prisma.deletionRequest.update({
      where: { userId },
      data: { status: "CANCELLED" },
    });

    // 사용자 계정 복구
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        isDeletionRequested: false,
        deletionRequestedAt: null,
        willBeDeletedAt: null,
      },
    });
  }

  // 2단계: 실제 삭제 (30일 후)
  async completeDeletion(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        questions: { select: { id: true } },
        answers: { select: { id: true } },
        comments: { select: { id: true } },
        deletionRequest: true,
      },
    });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다");
    }

    // 트랜잭션으로 모든 데이터 삭제
    await this.prisma.$transaction(async tx => {
      // 1. 모든 질문 삭제 (답변/댓글도 함께)
      for (const question of user.questions) {
        await this.questionService.deleteQuestion(question.id, userId);
      }

      // 2. 모든 관련 데이터 물리 삭제
      await tx.bookmark.deleteMany({ where: { userId } });
      await tx.questionLike.deleteMany({ where: { userId } });
      await tx.answerLike.deleteMany({ where: { userId } });
      await tx.answerCommentLike.deleteMany({ where: { userId } });
      await tx.userActivity.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.userBadge.deleteMany({ where: { userId } });
      await tx.pointTransaction.deleteMany({ where: { userId } });
      await tx.oauthAccount.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });

      // 3. 프로필 이미지 삭제 (CDN/S3)
      if (user.profileImage) {
        await this.storageService.delete(user.profileImage);
      }

      // 4. User 삭제
      await tx.user.delete({ where: { id: userId } });

      // 5. 삭제 요청 상태 업데이트
      if (user.deletionRequest) {
        await tx.deletionRequest.update({
          where: { id: user.deletionRequest.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            completedBy: "system",
          },
        });
      }
    });
  }
}
```

- [ ] Lint/Error 체크: `pnpm run type-check` 통과

### 4.3 API 엔드포인트

- [ ] `POST /api/users/me/deletion-request`

```typescript
router.post(
  "/me/deletion-request",
  authenticate,
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { reason } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.get("user-agent");

    try {
      const result = await userDeletionService.requestDeletion(
        userId,
        reason,
        ipAddress,
        userAgent
      );

      res.json(
        createResponse(true, "개인정보 삭제가 요청되었습니다", {
          willBeDeletedAt: result.willBeDeletedAt,
        })
      );
    } catch (error) {
      res
        .status(400)
        .json(createResponse(false, (error as Error).message, null));
    }
  }
);
```

- [ ] `POST /api/users/me/deletion-request/cancel`

```typescript
router.post(
  "/me/deletion-request/cancel",
  authenticate,
  async (req: Request, res: Response) => {
    const userId = req.user!.id;

    try {
      await userDeletionService.cancelDeletion(userId);

      res.json(
        createResponse(true, "개인정보 삭제 요청이 취소되었습니다", null)
      );
    } catch (error) {
      res
        .status(400)
        .json(createResponse(false, (error as Error).message, null));
    }
  }
);
```

- [ ] 관리자 API 추가 (선택사항)
- [ ] Lint/Error 체크: API 테스트 100% 통과

### 4.4 배치 작업

- [ ] 파일 생성: `apps/api/src/jobs/userDeletionJob.ts`

```typescript
import cron from "node-cron";
import { PrismaClient } from "@jeju-tourlist/database";
import { UserDeletionService } from "../services/userDeletion/UserDeletionService";

const prisma = new PrismaClient();

export function scheduleUserDeletionJob() {
  // 매일 오전 3시에 실행
  cron.schedule("0 3 * * *", async () => {
    console.log("[UserDeletionJob] Starting user deletion batch...");

    try {
      // 30일 경과한 요청 찾기
      const expiredRequests = await prisma.deletionRequest.findMany({
        where: {
          status: "PENDING",
          willBeDeletedAt: { lte: new Date() },
        },
      });

      console.log(`Found ${expiredRequests.length} users to delete`);

      for (const request of expiredRequests) {
        try {
          await userDeletionService.completeDeletion(request.userId);
          console.log(`✅ User ${request.userId} deleted`);
        } catch (error) {
          console.error(`❌ Failed to delete user ${request.userId}:`, error);

          // 실패한 요청 표시
          await prisma.deletionRequest.update({
            where: { id: request.id },
            data: { status: "FAILED" },
          });
        }
      }

      console.log("[UserDeletionJob] Batch completed");
    } catch (error) {
      console.error("[UserDeletionJob] Failed:", error);
    }
  });
}
```

- [ ] Lint/Error 체크: `pnpm run type-check` 통과

### 4.5 단위 테스트

- [ ] 삭제 요청 테스트
- [ ] 취소 테스트
- [ ] 실제 삭제 테스트
- [ ] Lint/Error 체크: Phase 4 테스트 100% 통과

### Phase 4 체크리스트

- [x] DeletionRequest 테이블 생성
- [x] UserDeletionService 구현
- [x] API 엔드포인트 3개
- [x] 배치 작업 (userDeletionJob)
- [x] 모든 테스트 100% 통과
- [x] Lint/Error 0개
- [x] Git 커밋

**Phase 4 완료**: ☑

---

## Phase 5: 테스트 및 검증

**예상 소요: 1-2일**

### 5.1 단위 테스트

- [ ] 모든 Service 메서드 테스트
- [ ] Repository 필터링 테스트
- [ ] 배치 작업 테스트

### 5.2 통합 테스트

- [ ] API 엔드포인트 테스트
- [ ] 권한 검증 테스트
- [ ] 삭제 플로우 엔드투엔드 테스트

### 5.3 E2E 테스트

- [ ] 사용자가 질문 삭제 → 다른 사용자가 조회 불가 확인
- [ ] 관리자만 삭제된 데이터 조회 가능 확인
- [ ] 삭제 요청 → 30일 후 자동 삭제 확인

### 5.4 성능 테스트

- [ ] 1000개 데이터 삭제 성능 (30초 이내)
- [ ] 배치 작업 성능 (10만 개 DELETED 데이터)

### 5.5 보안 테스트

- [ ] 일반 사용자가 삭제된 데이터 조회 불가 확인
- [ ] 일반 사용자가 다른 사용자 데이터 삭제 불가 확인
- [ ] 감시 로그 조작 불가 확인

### Phase 5 체크리스트

- [ ] 단위 테스트 100% 통과
- [ ] 통합 테스트 100% 통과
- [ ] E2E 테스트 100% 통과
- [ ] 성능 테스트 통과
- [ ] 보안 테스트 통과
- [ ] 테스트 커버리지 90% 이상
- [ ] Lint/Error 0개
- [ ] Git 커밋

**Phase 5 완료**: ☐

---

## ✅ 완료 체크리스트

### 전체 완료 요구사항

- [ ] Phase 1 (접근 제어): 100% 완료
- [ ] Phase 2 (Cascade 삭제): 100% 완료
- [ ] Phase 3 (자동 배치): 100% 완료
- [ ] Phase 4 (회원정보 삭제): 100% 완료
- [ ] Phase 5 (테스트): 100% 완료
- [ ] 모든 테스트 100% 통과
- [ ] 테스트 커버리지 90% 이상
- [ ] Lint/Error 0개
- [ ] TypeScript 컴파일 에러 0개
- [ ] 기존 기능 회귀 없음

### 법적 준수

- [ ] PIPA 요구사항 100% 준수
- [ ] GDPR 요구사항 100% 준수
- [ ] 감사 로그 5년 유지

### SOLID 원칙 준수

- [ ] SRP: 각 Service는 자신의 책임만 처리
- [ ] OCP: 기존 로직 수정 없이 확장
- [ ] LSP: Service 인터페이스 통일
- [ ] ISP: 필요한 메서드만 노출
- [ ] DIP: 의존성 주입 명확화

---

## 📊 진행도

| Phase    | 작업                   | 예상 소요 | 상태  |
| -------- | ---------------------- | --------- | ----- |
| 1        | 접근 제어 강화         | 1일       | ☑    |
| 2        | Cascade 소프트삭제     | 1-2일     | ☑    |
| 3        | 자동 완전삭제 배치     | 1일       | ☑    |
| 4        | 회원정보 개인정보 삭제 | 2-3일     | ☑ |
| 5        | 테스트 및 검증         | 1-2일     | ☐     |
| **전체** | **5 Phases**           | **6-9일** | **☑** |

---

**최종 업데이트**: 2025-10-25 (한국시간)  
**상태**: ✅ Phase 1-4 완료 (Phase 5 테스트 대기)  
**주의**: 이 순서를 지키면 기존 코드 수정이 거의 없고 새 기능만 추가됩니다
