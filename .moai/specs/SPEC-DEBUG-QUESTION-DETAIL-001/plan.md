# @SPEC:DEBUG-QUESTION-DETAIL-001: 질문 상세보기 페이지 에러 진단 및 수정 - 구현 계획

## 📋 Implementation Planning Document

**Document Type**: Implementation Plan (plan.md)
**Version**: 0.0.1
**Created**: 2025-11-02
**Last Updated**: 2025-11-02

---

## 🎯 Implementation Goals

### Primary Goals (필수 - P0)

1. **Backend 응답 정규화**: 모든 답변에 일관된 boolean 기본값 설정
2. **Frontend 데이터 필터링**: 최상위 답변만 선택하여 FacebookAnswerThread로 전달
3. **타입 안전성 강화**: 런타임 데이터 검증 함수 구현

### Secondary Goals (권장 - P1)

4. **에러 핸들링 개선**: 에러 메시지 및 에러 바운더리 강화
5. **테스트 커버리지**: Unit test 및 E2E test 작성

### Final Goals (추가 - P2)

6. **성능 최적화**: 캐싱 및 메모리 최적화
7. **문서화**: API 문서 및 타입 정의 정리

---

## 📐 Architecture & Data Flow

### Current Architecture (문제점)

```
┌─────────────────────────────────────────────────────────┐
│ Frontend: QuestionDetailPage                             │
│  ├─ API Call: GET /api/questions/:id                    │
│  └─ State: answers = [ans1, comment1, ans2, ...]        │
│      (❌ Flat 구조: 답변과 댓글 섞임)                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Backend: QuestionService.getQuestionById()               │
│  ├─ Query: SELECT * FROM answers WHERE questionId = id  │
│  ├─ Processing: Flatten nested comments into answers    │
│  └─ Return: { answers: [ans1, comment1, ans2, ...] }   │
│      (❌ Boolean 기본값 없음)                             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ FacebookAnswerThread Component                          │
│  └─ 예상 구조: Top-level answers only                   │
│      (❌ Flat 배열 수신 → 렌더링 오류)                   │
└─────────────────────────────────────────────────────────┘
```

### Target Architecture (개선)

```
┌─────────────────────────────────────────────────────────┐
│ Frontend: QuestionDetailPage                             │
│  ├─ API Call: GET /api/questions/:id                    │
│  ├─ Data Validation: validateAnswerData()               │
│  ├─ Filter: topLevelAnswers = answers.filter(...)       │
│  └─ State: answers = [ans1, ans2] (✅ Top-level only)  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Backend: QuestionService.getQuestionById()               │
│  ├─ Query: SELECT * FROM answers WHERE questionId = id  │
│  ├─ Processing: Set default boolean values              │
│  ├─ Load user reactions if authenticated                │
│  └─ Return: { answers: [ans1, ans2] with defaults }    │
│      (✅ Boolean fields: isLiked=false, isDisliked=...)│
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ FacebookAnswerThread Component                          │
│  └─ Top-level answers with full nested structure        │
│      (✅ 올바른 구조 수신 → 정상 렌더링)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Three-Phase Implementation Strategy

### ⏱️ Timeline

- **Phase 1**: 2-3 hours (Backend 수정)
- **Phase 2**: 1-2 hours (Frontend 수정)
- **Phase 3**: 2-3 hours (테스트 작성)
- **Total**: 5-8 hours

---

## Phase 1: Backend 응답 정규화 (QuestionService.ts)

### Objective

모든 답변에 일관된 boolean 기본값 설정 및 사용자 반응 데이터 로드

### Files to Modify

- `apps/api/src/services/question/QuestionService.ts` (Line 69-185)

### Implementation Steps

#### Step 1.1: 현재 getQuestionById() 분석

```typescript
// 현재 코드 (문제점)
async getQuestionById(id: string, incrementView: boolean, userId?: string) {
  const question = await this.prisma.question.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, nickname: true, avatar: true } },
      category: true,
      answers: {
        where: { status: 'ACTIVE' },
        include: {
          author: { ... },
          comments: { ... },  // ❌ Nested comments로드
        },
      },
    },
  });

  // ❌ Flatten 로직: comments를 answers 배열에 추가
  const flattenedAnswers = [];
  question.answers.forEach(answer => {
    flattenedAnswers.push(answer);
    answer.comments.forEach(comment => {
      flattenedAnswers.push({
        ...comment,
        parentId: answer.id,  // 부모 ID 추가
      });
    });
  });

  return {
    ...question,
    answers: flattenedAnswers,  // ❌ Flat 배열
  };
}
```

#### Step 1.2: 개선된 구현

```typescript
async getQuestionById(
  id: string,
  incrementView: boolean,
  userId?: string
): Promise<QuestionDetailResponse> {
  // 1. 질문 조회
  const question = await this.prisma.question.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, nickname: true, avatar: true } },
      category: true,
      answers: {
        where: { status: 'ACTIVE' },
        include: {
          author: { ... },
          comments: { ... },
        },
      },
    },
  });

  if (!question) {
    throw new Error('질문을 찾을 수 없습니다.');
  }

  // 2. 사용자 반응 데이터 로드 (있으면)
  let userReactions: Map<string, UserReaction> = new Map();
  if (userId) {
    userReactions = await this.loadUserReactions(userId, question.answers);
  }

  // 3. 답변 정규화: boolean 기본값 설정
  const normalizedAnswers = question.answers.map(answer => {
    const userReaction = userReactions.get(answer.id);

    return {
      ...answer,
      isAccepted: answer.id === question.acceptedAnswerId,
      isLiked: userReaction?.isLike ?? false,        // ✅ 기본값: false
      isDisliked: !userReaction?.isLike ?? false,    // ✅ 기본값: false
      isAuthor: answer.authorId === userId ?? false, // ✅ 기본값: false
      isQuestionAuthor: question.authorId === userId ?? false, // ✅ 기본값: false
      replyCount: answer.comments?.length ?? 0,     // ✅ 댓글 개수
    };
  });

  // 4. 조회수 증가 (필요 시)
  if (incrementView) {
    await this.prisma.question.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return {
    ...question,
    answers: normalizedAnswers,  // ✅ 정규화된 답변만 반환
  };
}

// Helper 함수: 사용자 반응 데이터 로드
private async loadUserReactions(
  userId: string,
  answers: Answer[]
): Promise<Map<string, UserReaction>> {
  const answerIds = answers.map(a => a.id);
  const reactions = await this.prisma.answerLike.findMany({
    where: {
      userId,
      answerId: { in: answerIds },
    },
  });

  const map = new Map();
  reactions.forEach(reaction => {
    map.set(reaction.answerId, reaction);
  });
  return map;
}
```

#### Step 1.3: TypeScript 타입 정의 추가

```typescript
// apps/api/src/types/question.ts
export interface QuestionDetailResponse {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar?: string | null;
  };
  category?: {
    id: string;
    name: string;
  } | null;
  answers: AnswerDetailResponse[];
  // ... 기타 필드
}

export interface AnswerDetailResponse {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar?: string | null;
  };
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  replyCount: number; // ✅ 댓글 개수
  isAccepted: boolean; // ✅ 채택 여부
  isLiked: boolean; // ✅ 사용자가 좋아요 했는지
  isDisliked: boolean; // ✅ 사용자가 싫어요 했는지
  isAuthor: boolean; // ✅ 사용자가 작성자인지
  isQuestionAuthor: boolean; // ✅ 사용자가 질문 작성자인지
  parentId?: string | null;
}
```

### Testing

```typescript
// apps/api/src/services/question/__tests__/QuestionService.test.ts

describe("QuestionService.getQuestionById", () => {
  it("should return answers with boolean default values", async () => {
    // Given: 질문과 답변이 있음
    const question = await createTestQuestion();
    const answer = await createTestAnswer(question.id);

    // When: 비로그인 사용자가 질문을 조회할 때
    const result = await service.getQuestionById(question.id, false, undefined);

    // Then: 모든 boolean 필드가 기본값을 가져야 함
    expect(result.answers[0]).toMatchObject({
      isLiked: false, // ✅ undefined가 아님
      isDisliked: false, // ✅ undefined가 아님
      isAuthor: false, // ✅ undefined가 아님
      isQuestionAuthor: false, // ✅ undefined가 아님
    });
  });

  it("should load user reactions when userId provided", async () => {
    // Given: 로그인 사용자가 답변에 좋아요 표시
    const user = await createTestUser();
    const question = await createTestQuestion();
    const answer = await createTestAnswer(question.id);
    await createTestAnswerLike(user.id, answer.id, true); // isLike: true

    // When: 해당 사용자가 질문을 조회할 때
    const result = await service.getQuestionById(question.id, false, user.id);

    // Then: 사용자의 반응이 반영되어야 함
    expect(result.answers[0]).toMatchObject({
      isLiked: true, // ✅ 좋아요
      isDisliked: false, // ✅ 자동 해제
    });
  });

  it("should return only top-level answers", async () => {
    // Given: 답변과 중첩 댓글이 있음
    const question = await createTestQuestion();
    const answer = await createTestAnswer(question.id);
    const comment = await createTestComment(answer.id);

    // When: 질문을 조회할 때
    const result = await service.getQuestionById(question.id, false);

    // Then: 최상위 답변만 반환되어야 함 (댓글은 제외)
    expect(result.answers).toHaveLength(1);
    expect(result.answers[0].id).toBe(answer.id);
  });
});
```

---

## Phase 2: Frontend 데이터 필터링 (page.tsx)

### Objective

최상위 답변 필터링 및 데이터 유효성 검사

### Files to Modify

- `apps/web/src/app/questions/[id]/page.tsx` (Line 109-139, 700-734)

### Implementation Steps

#### Step 2.1: 데이터 검증 함수 추가

```typescript
// apps/web/src/lib/validators/answerValidator.ts

export interface ValidatedAnswer {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    nickname: string;
    avatar?: string | null;
  };
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  replyCount: number;
  isAccepted: boolean;
  isLiked: boolean;
  isDisliked: boolean;
  isAuthor: boolean;
  isQuestionAuthor: boolean;
  parentId?: string | null;
}

/**
 * 런타임 데이터 검증 함수
 * @throws Error if data structure is invalid
 */
export function validateAnswerData(data: unknown): ValidatedAnswer {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid answer data: not an object");
  }

  const answer = data as Record<string, unknown>;

  // 필수 필드 검증
  if (!answer.id || typeof answer.id !== "string") {
    throw new Error("Invalid answer: missing or invalid id field");
  }

  if (!answer.content || typeof answer.content !== "string") {
    throw new Error("Invalid answer: missing or invalid content field");
  }

  if (!answer.author || typeof answer.author !== "object") {
    throw new Error("Invalid answer: missing or invalid author field");
  }

  // 안전한 값 추출 (Null coalescing)
  return {
    id: answer.id as string,
    content: answer.content as string,
    author: {
      id: (answer.author as any).id ?? "",
      name: (answer.author as any).name ?? "Unknown",
      nickname: (answer.author as any).nickname ?? "unknown",
      avatar: (answer.author as any).avatar ?? null,
    },
    createdAt: (answer.createdAt as string) ?? new Date().toISOString(),
    likeCount: (answer.likeCount as number) ?? 0,
    dislikeCount: (answer.dislikeCount as number) ?? 0,
    commentCount: (answer.commentCount as number) ?? 0,
    replyCount: (answer.replyCount as number) ?? 0,
    isAccepted: (answer.isAccepted as boolean) ?? false,
    isLiked: (answer.isLiked as boolean) ?? false, // ✅ 기본값: false
    isDisliked: (answer.isDisliked as boolean) ?? false, // ✅ 기본값: false
    isAuthor: (answer.isAuthor as boolean) ?? false, // ✅ 기본값: false
    isQuestionAuthor: (answer.isQuestionAuthor as boolean) ?? false, // ✅ 기본값: false
    parentId: (answer.parentId as string) ?? null,
  };
}
```

#### Step 2.2: 페이지 컴포넌트 수정

```typescript
// apps/web/src/app/questions/[id]/page.tsx

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);  // ✅ 최상위 답변만
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ... 기타 state

  useEffect(() => {
    const loadQuestion = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await api.get(`/api/questions/${params.id}`);

        if (!result.success) {
          throw new Error(
            result.error || result.message || '질문을 불러올 수 없습니다'
          );
        }

        // ✅ Step 1: 유효성 검사
        const rawAnswers = result.data.answers || [];
        let validatedAnswers: Answer[] = [];

        try {
          validatedAnswers = rawAnswers.map(validateAnswerData);
        } catch (validationError) {
          console.error('[DEBUG] 답변 데이터 검증 실패:', validationError);
          throw new Error('데이터 형식이 올바르지 않습니다.');
        }

        // ✅ Step 2: 최상위 답변만 필터링 (parentId가 null인 것)
        const topLevelAnswers = validatedAnswers.filter(
          answer => !answer.parentId
        );

        setQuestion(result.data);
        setAnswers(topLevelAnswers);  // ✅ 필터링된 답변만 저장
      } catch (err) {
        console.error('[DEBUG] 질문 로드 실패:', err);
        setError(
          err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadQuestion();
    }
  }, [params.id]);

  // ... 핸들러 함수들 (기존 코드)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 질문 상세 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {/* ... 기존 코드 */}
        </div>

        {/* 답변 섹션 - FacebookAnswerThread 사용 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Heading
              level={2}
              className="text-xl font-bold text-gray-900 flex items-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              답변 {answers.length}개
            </Heading>
          </div>

          {/* 에러 메시지 배너 */}
          {answerError && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-3">
              {/* ... 기존 코드 */}
            </div>
          )}

          {/* Facebook 스타일 답변 스레드 */}
          {question && (
            <>
              <FacebookAnswerThread
                question={{
                  id: question.id,
                  title: question.title,
                  content: question.content,
                  author: {
                    id: question.author.id,
                    name: question.author.name,
                    avatar: question.author.avatar || undefined,
                  },
                  createdAt: question.createdAt,
                  likeCount: question.likeCount,
                  answerCount: question.answerCount,
                  viewCount: question.viewCount,
                  tags: question.tags,
                }}
                answers={answers.map(answer => ({
                  id: answer.id,
                  content: answer.content,
                  author: {
                    id: answer.author.id,
                    name: answer.author.name,
                    avatar: answer.author.avatar || undefined,
                  },
                  createdAt: answer.createdAt,
                  likeCount: answer.likeCount,
                  dislikeCount: answer.dislikeCount || 0,
                  isLiked: answer.isLiked ?? false,        // ✅ Null coalescing
                  isDisliked: answer.isDisliked ?? false,  // ✅ Null coalescing
                  isAccepted: answer.isAccepted,
                  parentId: answer.parentId || undefined,
                  replyCount: answer.replyCount || 0,
                }))}
                currentUser={
                  user
                    ? {
                        id: user.id,
                        name: user.name || user.email,
                      }
                    : undefined
                }
                onSubmitAnswer={handleAnswerSubmit}
                onLike={handleAnswerLike}
                onDislike={handleAnswerDislike}
                onAdopt={handleAnswerAdopt}
                onUnadopt={handleAnswerUnadopt}
                onReply={() => {}}
                isLoading={isSubmitting}
                maxDepth={2}
              />
              {!user && (
                <div className="text-center py-8 bg-blue-50 rounded-lg border border-blue-200">
                  <Text className="text-gray-600 mb-4">
                    답변을 작성하려면 로그인이 필요합니다.
                  </Text>
                  <Button onClick={() => router.push("/auth/signin")}>
                    로그인하기
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 이미지 라이트박스 */}
      {lightboxOpen && question?.attachments && (
        <ImageLightbox
          images={question.attachments}
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onPrevious={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
          onNext={() =>
            setCurrentImageIndex(prev =>
              Math.min(question.attachments.length - 1, prev + 1)
            )
          }
        />
      )}
    </div>
  );
}
```

### Testing

```typescript
// apps/web/src/lib/validators/__tests__/answerValidator.test.ts

describe("validateAnswerData", () => {
  it("should validate correct answer data", () => {
    const validData = {
      id: "ans-1",
      content: "Test answer",
      author: {
        id: "user-1",
        name: "John Doe",
        nickname: "johndoe",
      },
      createdAt: new Date().toISOString(),
      likeCount: 5,
      dislikeCount: 1,
      commentCount: 2,
      replyCount: 2,
      isAccepted: false,
      isLiked: false,
      isDisliked: false,
      isAuthor: false,
      isQuestionAuthor: false,
    };

    const result = validateAnswerData(validData);
    expect(result).toEqual(validData);
  });

  it("should throw error for invalid answer data", () => {
    expect(() => validateAnswerData(null)).toThrow();
    expect(() => validateAnswerData({ id: "ans-1" })).toThrow(); // missing content
    expect(() => validateAnswerData({ content: "test" })).toThrow(); // missing id
  });

  it("should apply default values for missing boolean fields", () => {
    const incompleteData = {
      id: "ans-1",
      content: "Test answer",
      author: {
        id: "user-1",
        name: "John Doe",
        nickname: "johndoe",
      },
      createdAt: new Date().toISOString(),
      likeCount: 5,
      // ❌ boolean 필드 없음
    };

    const result = validateAnswerData(incompleteData);
    expect(result.isLiked).toBe(false); // ✅ 기본값
    expect(result.isDisliked).toBe(false); // ✅ 기본값
    expect(result.isAuthor).toBe(false); // ✅ 기본값
    expect(result.isQuestionAuthor).toBe(false); // ✅ 기본값
  });
});
```

---

## Phase 3: 통합 테스트 및 검증

### Objective

E2E 테스트 및 회귀 테스트 작성

### Test Files to Create

- `tests/e2e/question-detail.spec.ts` (Playwright)
- `apps/api/src/services/question/__tests__/QuestionService.test.ts` (Jest)
- `apps/web/src/lib/validators/__tests__/answerValidator.test.ts` (Jest)

### E2E Test Scenarios

```typescript
// tests/e2e/question-detail.spec.ts

import { test, expect } from "@playwright/test";

test.describe("Question Detail Page", () => {
  test("should load question without errors", async ({ page }) => {
    // Given: 질문이 데이터베이스에 존재
    const questionId = await createTestQuestion();

    // When: 사용자가 질문 상세 페이지에 접근
    await page.goto(`http://localhost:3001/questions/${questionId}`);

    // Then: 페이지가 정상 로드되어야 함
    await expect(page).not.toHaveTitle(/Error/);
    await expect(page.locator("h1")).toBeVisible();
  });

  it("should display answers without nesting errors", async ({ page }) => {
    // Given: 질문과 여러 답변이 있음
    const questionId = await createTestQuestion();
    const answer1 = await createTestAnswer(questionId, "Answer 1");
    const answer2 = await createTestAnswer(questionId, "Answer 2");

    // When: 사용자가 질문을 조회
    await page.goto(`http://localhost:3001/questions/${questionId}`);
    await page.waitForSelector('[data-testid="answer-item"]');

    // Then: 모든 답변이 개별 항목으로 표시되어야 함
    const answers = await page.locator('[data-testid="answer-item"]').count();
    expect(answers).toBe(2);
  });

  it("should display error message gracefully", async ({ page }) => {
    // Given: 존재하지 않는 질문 ID
    const invalidId = "non-existent-id";

    // When: 사용자가 존재하지 않는 질문에 접근
    await page.goto(`http://localhost:3001/questions/${invalidId}`);

    // Then: 에러 메시지가 표시되어야 함
    await expect(
      page.locator('[data-testid="question-not-found"]')
    ).toBeVisible();
  });

  it("should toggle like/dislike without errors", async ({ page }) => {
    // Given: 로그인된 사용자와 답변이 있음
    await loginAsTestUser(page);
    const questionId = await createTestQuestion();
    const answerId = await createTestAnswer(questionId);

    // When: 사용자가 좋아요 버튼 클릭
    await page.goto(`http://localhost:3001/questions/${questionId}`);
    await page.locator(`[data-testid="like-btn-${answerId}"]`).click();

    // Then: 좋아요 카운트가 증가해야 함
    await expect(
      page.locator(`[data-testid="like-count-${answerId}"]`)
    ).toContainText("1");
  });
});
```

---

## 🔄 Quality Gates & Checkpoints

### Pre-commit Checklist

- [ ] TypeScript 컴파일 성공 (`npm run type-check`)
- [ ] ESLint 경고 0건 (`npm run lint`)
- [ ] 단위 테스트 통과 (`npm run test`)
- [ ] E2E 테스트 통과 (`npm run test:e2e`)

### Pre-deployment Checklist

- [ ] 브라우저 콘솔 에러 0건
- [ ] Lighthouse Performance > 90
- [ ] 모든 시나리오 수동 테스트 완료
- [ ] 배포 전 레이아웃 검수

---

## 📊 Success Metrics

| Metric        | Target  | Current | Status |
| ------------- | ------- | ------- | ------ |
| Load Time     | < 2s    | ?       | TBD    |
| API Response  | < 500ms | ?       | TBD    |
| Error Rate    | 0%      | ?       | TBD    |
| Test Coverage | > 80%   | ?       | TBD    |
| Lighthouse    | > 90    | ?       | TBD    |

---

## 🚨 Risk Assessment

| Risk                   | Severity | Mitigation                     |
| ---------------------- | -------- | ------------------------------ |
| Data migration issues  | Medium   | Comprehensive data validation  |
| Performance regression | Medium   | Load testing before deployment |
| Breaking changes       | Medium   | Backward compatibility testing |
| Database query impact  | Low      | Index verification             |

---

## 📚 Dependencies & Constraints

### Dependencies

- Express.js API server running on port 4000
- PostgreSQL database on port 5433
- Prisma ORM client
- React 18 + Next.js 14

### Constraints

- No breaking changes to existing API contracts
- Must maintain backward compatibility
- All changes must be TypeScript strict mode compliant
- E2E tests must pass before deployment

---

## 🔗 Related Documentation

- API Response Schema: `docs/API-QUESTION-DETAIL.md`
- Component API: `apps/web/src/components/question/facebook/FacebookAnswerThread.tsx`
- Backend Models: `packages/database/prisma/schema.prisma`
- Type Definitions: `packages/types/src/index.ts`
