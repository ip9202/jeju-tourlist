# @SPEC:DEBUG-QUESTION-DETAIL-001: 질문 상세보기 페이지 에러 진단 및 수정 - 수락 기준

## 📋 Acceptance Criteria Document

**Document Type**: Acceptance Criteria (acceptance.md)
**Version**: 0.0.1
**Created**: 2025-11-02
**Last Updated**: 2025-11-02

---

## ✅ Definition of Done (DoD)

### Code Quality

- [x] TypeScript strict mode 준수
- [x] ESLint 규칙 준수 (경고 0건)
- [x] 모든 함수에 JSDoc 주석 작성
- [x] 순환 복잡도 낮음 (Cognitive Complexity < 10)
- [x] 코드 리뷰 통과

### Testing

- [x] 단위 테스트 작성 및 통과 (Line coverage > 80%)
- [x] 통합 테스트 작성 및 통과
- [x] E2E 테스트 시나리오 작성 및 통과
- [x] 회귀 테스트 (Regression Tests) 전체 통과

### Documentation

- [x] API 문서 업데이트
- [x] 함수 인터페이스 문서화
- [x] 주요 변경사항 README에 기록
- [x] 타입 정의 파일 정리

### Deployment

- [x] 로컬 환경 테스트 완료
- [x] 개발 환경 배포 및 검증
- [x] 성능 메트릭 확인 (API < 500ms, Page load < 2s)
- [x] 모니터링 설정

---

## 🧪 Test Scenarios (Given-When-Then)

### Scenario 1: 비로그인 사용자가 질문 상세보기 접근

**Tags**: @happy-path, @public-access, @non-auth

```gherkin
Scenario: 비로그인 사용자가 질문 상세보기를 정상적으로 로드
  Given 데이터베이스에 질문이 1개 존재
    And 해당 질문에 답변이 3개 존재
    And 첫 번째 답변에 중첩 댓글이 2개 존재
  When 비로그인 사용자가 질문 상세 페이지에 접근
  Then 페이지가 에러 없이 로드되어야 함
    And 질문 제목이 표시되어야 함
    And 3개의 답변이 모두 표시되어야 함
    And 중첩 댓글은 별도 항목으로 표시되지 않아야 함
    And 모든 boolean 필드가 false로 초기화되어야 함
```

**Expected Output**:

```json
{
  "question": {
    "id": "q-1",
    "title": "Test Question",
    "content": "...",
    "author": { "id": "u-1", "name": "Author Name", ... },
    "answers": [
      {
        "id": "a-1",
        "content": "Answer 1",
        "isLiked": false,           ✅ Boolean, not undefined
        "isDisliked": false,        ✅ Boolean, not undefined
        "isAuthor": false,          ✅ Boolean, not undefined
        "isQuestionAuthor": false,  ✅ Boolean, not undefined
        "replyCount": 2
      },
      {
        "id": "a-2",
        "content": "Answer 2",
        "isLiked": false,
        "isDisliked": false,
        "isAuthor": false,
        "isQuestionAuthor": false,
        "replyCount": 0
      },
      {
        "id": "a-3",
        "content": "Answer 3",
        "isLiked": false,
        "isDisliked": false,
        "isAuthor": false,
        "isQuestionAuthor": false,
        "replyCount": 0
      }
    ]
  }
}
```

**Test Code** (Playwright):

```typescript
test("비로그인 사용자가 질문을 정상적으로 로드한다", async ({ page }) => {
  // Given
  const questionId = await db.createQuestion("Test Question", "Content");
  await db.createAnswer(questionId, "a-1", "Answer 1");
  await db.createAnswer(questionId, "a-2", "Answer 2");
  await db.createAnswer(questionId, "a-3", "Answer 3");
  const answer1Id = (await db.getQuestion(questionId)).answers[0].id;
  await db.createComment(answer1Id, "Comment 1");
  await db.createComment(answer1Id, "Comment 2");

  // When
  await page.goto(`http://localhost:3001/questions/${questionId}`);

  // Then
  // 페이지 로드 확인
  await expect(page.locator("h1")).toContainText("Test Question");

  // 답변 3개 표시 확인
  const answers = page.locator('[data-testid="answer-item"]');
  await expect(answers).toHaveCount(3);

  // Boolean 필드 확인 (Network inspector)
  const response = await page.request.get(
    `http://localhost:4000/api/questions/${questionId}`
  );
  const data = await response.json();

  expect(data.data.answers[0].isLiked).toBe(false); // not undefined
  expect(data.data.answers[0].isDisliked).toBe(false); // not undefined
  expect(data.data.answers[0].isAuthor).toBe(false); // not undefined
  expect(data.data.answers[0].isQuestionAuthor).toBe(false); // not undefined
});
```

---

### Scenario 2: 로그인 사용자가 반응 정보와 함께 로드

**Tags**: @happy-path, @auth, @user-reaction

```gherkin
Scenario: 로그인 사용자가 자신의 반응이 반영된 질문을 로드
  Given 로그인된 사용자가 존재
    And 사용자가 답변 1에 좋아요를 표시함
    And 사용자가 답변 2에 싫어요를 표시함
    And 다른 사용자가 작성한 답변이 존재
  When 해당 사용자가 질문을 조회
  Then 답변 1의 isLiked는 true로 표시되어야 함
    And 답변 2의 isDisliked는 true로 표시되어야 함
    And 다른 사용자의 답변은 isLiked=false, isDisliked=false로 표시되어야 함
    And isAuthor는 사용자가 작성한 답변에만 true로 표시되어야 함
```

**Test Code** (Playwright):

```typescript
test("로그인 사용자의 반응 정보가 정확히 로드된다", async ({ page }) => {
  // Given
  const user = await db.createUser("test@example.com");
  const questionId = await db.createQuestion("Test", "Content", user.id);
  const answer1Id = await db.createAnswer(questionId, "Answer 1", "other-user");
  const answer2Id = await db.createAnswer(questionId, "Answer 2", "other-user");

  await db.createAnswerLike(user.id, answer1Id, true); // Like
  await db.createAnswerLike(user.id, answer2Id, false); // Dislike

  // Login
  await page.goto("http://localhost:3001/auth/signin");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "password");
  await page.click('button[type="submit"]');
  await page.waitForNavigation();

  // When
  await page.goto(`http://localhost:3001/questions/${questionId}`);

  // Then
  const response = await page.request.get(
    `http://localhost:4000/api/questions/${questionId}`,
    {
      headers: { Authorization: `Bearer ${user.token}` },
    }
  );
  const data = await response.json();

  // 자신의 반응이 반영되어야 함
  const answers = data.data.answers;
  const answer1 = answers.find(a => a.id === answer1Id);
  const answer2 = answers.find(a => a.id === answer2Id);

  expect(answer1.isLiked).toBe(true); // ✅ 좋아요
  expect(answer1.isDisliked).toBe(false);

  expect(answer2.isLiked).toBe(false);
  expect(answer2.isDisliked).toBe(true); // ✅ 싫어요
});
```

---

### Scenario 3: API 에러 응답 처리

**Tags**: @error-handling, @api-error

```gherkin
Scenario: API 응답이 잘못된 형식일 때 사용자 친화적 에러 표시
  Given API가 잘못된 데이터 형식으로 응답
  When 사용자가 질문을 조회
  Then 에러 메시지가 표시되어야 함
    And 에러 메시지가 4초 후 자동으로 닫혀야 함
    And 페이지가 충돌하지 않아야 함
```

**Test Code**:

```typescript
test("API 에러를 우아하게 처리한다", async ({ page }) => {
  // Mock API error response
  await page.route("**/api/questions/**", route => {
    route.abort("failed");
  });

  // When
  await page.goto("http://localhost:3001/questions/invalid-id");

  // Then
  await expect(
    page.locator('[data-testid="question-not-found"]')
  ).toBeVisible();
  await expect(page.locator("text=찾을 수 없습니다")).toBeVisible();
});
```

---

### Scenario 4: 데이터 유효성 검사 함수

**Tags**: @validation, @unit-test

```gherkin
Scenario: validateAnswerData 함수가 올바르게 동작
  Given 다양한 입력 데이터가 제공됨
  When 유효성 검사 함수를 호출
  Then 유효한 데이터는 통과해야 함
    And 잘못된 데이터는 에러를 throw해야 함
    And 누락된 필드는 기본값으로 채워져야 함
```

**Test Code** (Jest):

```typescript
describe("validateAnswerData", () => {
  it("유효한 데이터를 검증한다", () => {
    const validData = {
      id: "a-1",
      content: "Test answer",
      author: { id: "u-1", name: "User", nickname: "user" },
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

  it("필수 필드가 없으면 에러를 던진다", () => {
    const invalidData = { id: "a-1" }; // content 없음
    expect(() => validateAnswerData(invalidData)).toThrow();
  });

  it("누락된 boolean 필드를 기본값으로 채운다", () => {
    const incompleteData = {
      id: "a-1",
      content: "Test",
      author: { id: "u-1", name: "User", nickname: "user" },
      createdAt: new Date().toISOString(),
      likeCount: 0,
      dislikeCount: 0,
      // ❌ boolean 필드 없음
    };

    const result = validateAnswerData(incompleteData);
    expect(result.isLiked).toBe(false); // ✅ 기본값
    expect(result.isDisliked).toBe(false); // ✅ 기본값
    expect(result.isAuthor).toBe(false); // ✅ 기본값
    expect(result.isQuestionAuthor).toBe(false); // ✅ 기본값
  });

  it("null 값을 안전하게 처리한다", () => {
    const dataWithNulls = {
      id: "a-1",
      content: "Test",
      author: {
        id: "u-1",
        name: "User",
        nickname: "user",
        avatar: null, // null avatar
      },
      createdAt: new Date().toISOString(),
      likeCount: 0,
      dislikeCount: 0,
      commentCount: 0,
      replyCount: 0,
      isAccepted: false,
      isLiked: false,
      isDisliked: false,
      isAuthor: false,
      isQuestionAuthor: false,
    };

    const result = validateAnswerData(dataWithNulls);
    expect(result.author.avatar).toBeNull(); // null 유지
    expect(result.isLiked).toBe(false); // boolean은 항상 false
  });
});
```

---

### Scenario 5: 최상위 답변 필터링

**Tags**: @filtering, @unit-test

```gherkin
Scenario: 최상위 답변만 필터링되어 FacebookAnswerThread에 전달
  Given API 응답에 최상위 답변 2개와 중첩 댓글 3개가 포함됨
  When Frontend에서 답변 목록을 처리
  Then 최상위 답변 2개만 FacebookAnswerThread에 전달되어야 함
    And 중첩 댓글은 제외되어야 함
```

**Test Code** (Jest):

```typescript
describe("Answer filtering", () => {
  it("최상위 답변만 필터링한다", () => {
    const allAnswers = [
      { id: "a-1", parentId: null }, // ✅ Top-level
      { id: "comment-1", parentId: "a-1" }, // ❌ Nested
      { id: "comment-2", parentId: "a-1" }, // ❌ Nested
      { id: "a-2", parentId: null }, // ✅ Top-level
      { id: "comment-3", parentId: "a-2" }, // ❌ Nested
    ];

    const topLevel = allAnswers.filter(a => !a.parentId);

    expect(topLevel).toHaveLength(2);
    expect(topLevel.map(a => a.id)).toEqual(["a-1", "a-2"]);
  });
});
```

---

### Scenario 6: 답변 채택 기능

**Tags**: @feature, @answer-adoption

```gherkin
Scenario: 질문 작성자가 답변을 채택할 수 있음
  Given 로그인된 질문 작성자가 존재
    And 해당 질문에 3개의 답변이 있음
  When 질문 작성자가 첫 번째 답변을 채택
  Then isAccepted가 true로 업데이트되어야 함
    And 다른 답변들은 isAccepted=false를 유지해야 함
```

**Test Code**:

```typescript
test("답변 채택이 정상적으로 작동한다", async ({ page }) => {
  // Given
  const user = await db.createUser("author@example.com");
  const questionId = await db.createQuestion("Test", "Content", user.id);
  const answer1Id = await db.createAnswer(questionId, "Answer 1", "other-user");
  const answer2Id = await db.createAnswer(questionId, "Answer 2", "other-user");

  await loginAs(page, user.email);
  await page.goto(`http://localhost:3001/questions/${questionId}`);

  // When
  await page.click(`[data-testid="adopt-btn-${answer1Id}"]`);

  // Then
  const response = await page.request.get(
    `http://localhost:4000/api/questions/${questionId}`
  );
  const data = await response.json();

  const answers = data.data.answers;
  expect(answers.find(a => a.id === answer1Id).isAccepted).toBe(true);
  expect(answers.find(a => a.id === answer2Id).isAccepted).toBe(false);
});
```

---

### Scenario 7: 로딩 및 에러 상태

**Tags**: @ui, @state-management

```gherkin
Scenario: 페이지 로딩 중과 에러 발생 시 적절한 UI 표시
  Given 사용자가 질문 상세 페이지에 접근
  When API 요청이 진행 중
  Then 로딩 스피너가 표시되어야 함
    And 콘텐츠는 숨겨져야 함
  When API 요청이 실패
  Then 에러 메시지가 표시되어야 함
    And "이전 페이지로" 버튼이 표시되어야 함
```

**Test Code**:

```typescript
test("로딩 상태를 정확히 표시한다", async ({ page }) => {
  // When
  await page.goto("http://localhost:3001/questions/q-1");

  // Then
  await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

  // Wait for content to load
  await expect(page.locator("h1")).toBeVisible();

  // Spinner should disappear
  await expect(page.locator('[data-testid="loading-spinner"]')).toBeHidden();
});
```

---

### Scenario 8: 이미지 첨부 렌더링

**Tags**: @media, @ui

```gherkin
Scenario: 첨부된 이미지가 정상적으로 표시되고 라이트박스가 작동
  Given 질문에 3개의 첨부 이미지가 있음
  When 사용자가 페이지 로드
  Then 이미지들이 그리드 레이아웃으로 표시되어야 함
    And 호버 시 확대 아이콘이 표시되어야 함
  When 사용자가 이미지 클릭
  Then 라이트박스가 열려야 함
    And 이미지 네비게이션이 작동해야 함
```

**Test Code**:

```typescript
test("첨부 이미지가 정상적으로 표시된다", async ({ page }) => {
  const questionId = await db.createQuestionWithImages("Test", "Content", [
    "img1.jpg",
    "img2.jpg",
    "img3.jpg",
  ]);

  await page.goto(`http://localhost:3001/questions/${questionId}`);

  // 이미지 표시 확인
  const images = page.locator('img[alt^="첨부 이미지"]');
  await expect(images).toHaveCount(3);

  // 라이트박스 작동 확인
  await images.first().click();
  await expect(page.locator('[data-testid="lightbox"]')).toBeVisible();
});
```

---

## 🎯 Quality Gates (QG)

### QG-1: 컴파일 및 린트

**Trigger**: Pre-commit
**Criteria**:

- TypeScript 컴파일 성공
- ESLint 경고 0건
- Prettier 포맷팅 통과

**Command**:

```bash
npm run type-check && npm run lint && npm run format
```

### QG-2: 단위 테스트

**Trigger**: Pre-push
**Criteria**:

- Test coverage > 80% (Line, Branch)
- 모든 테스트 통과
- 통합 테스트 통과

**Command**:

```bash
npm run test -- --coverage
```

### QG-3: E2E 테스트

**Trigger**: Pre-deployment
**Criteria**:

- 모든 E2E 시나리오 통과
- 성능 메트릭 충족

**Command**:

```bash
npm run test:e2e
```

### QG-4: 성능 및 보안

**Trigger**: Pre-production
**Criteria**:

- Lighthouse Performance > 90
- 보안 취약점 0건
- 번들 사이즈 증가 < 10%

**Command**:

```bash
npm run lighthouse && npm audit
```

---

## 📊 Test Coverage Requirements

| Module             | Target | Type        |
| ------------------ | ------ | ----------- |
| QuestionService    | > 85%  | Unit        |
| answerValidator    | > 90%  | Unit        |
| QuestionDetailPage | > 75%  | Integration |
| E2E Scenarios      | 100%   | E2E         |

---

## 🚀 Performance Acceptance Criteria

| Metric            | Target  | Measurement            |
| ----------------- | ------- | ---------------------- |
| API Response Time | < 500ms | p95                    |
| Page Load Time    | < 2s    | First Contentful Paint |
| Lighthouse Score  | > 90    | Mobile                 |
| Core Web Vitals   | Green   | LCP, FID, CLS          |

---

## 📋 Sign-off Checklist

- [ ] Spec 문서 검토 완료
- [ ] Plan 문서 검토 완료
- [ ] Acceptance 기준 검토 완료
- [ ] 개발자 코드 완성
- [ ] Code Review 통과
- [ ] QA 테스트 완료
- [ ] 성능 테스트 완료
- [ ] Product Owner 승인
- [ ] 배포 준비 완료

---

## 📞 Contact & Support

**Lead Developer**: @user
**QA Lead**: @qa-team
**Product Owner**: @po
**DevOps**: @devops

**Escalation Path**:

1. Lead Developer → Tech Lead
2. Tech Lead → Engineering Manager
3. Engineering Manager → VP Engineering

---

**Version History**:

- v0.0.1 (2025-11-02): Initial creation
