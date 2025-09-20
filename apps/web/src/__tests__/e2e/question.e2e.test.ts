/**
 * 질문 관리 E2E 테스트
 *
 * @description
 * - 질문 작성, 조회, 수정, 삭제 전체 플로우에 대한 E2E 테스트
 * - 실제 브라우저 환경에서의 사용자 상호작용 테스트
 * - SRP: 각 테스트는 특정 질문 시나리오만 검증
 */

import { test, expect, Page } from "@playwright/test";

test.describe("Question Management E2E Tests", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // 테스트 환경 설정
    await page.goto("http://localhost:3000");
    
    // 네트워크 요청 모킹
    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      // 질문 목록 조회
      if (url.includes("/api/questions") && method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              questions: [
                {
                  id: "question-1",
                  title: "제주도 맛집 추천해주세요",
                  content: "가족여행으로 제주도에 왔는데 현지인이 추천하는 맛집이 궁금합니다.",
                  tags: ["맛집", "제주시", "가족여행"],
                  regionCode: "jeju_city",
                  author: {
                    id: "user-1",
                    name: "Test User",
                    avatar: null,
                  },
                  likeCount: 5,
                  answerCount: 3,
                  createdAt: "2024-01-15T10:00:00Z",
                  updatedAt: "2024-01-15T10:00:00Z",
                },
                {
                  id: "question-2",
                  title: "제주도 관광지 추천",
                  content: "제주도에서 꼭 가봐야 할 관광지를 추천해주세요.",
                  tags: ["관광지", "추천"],
                  regionCode: "seogwipo",
                  author: {
                    id: "user-2",
                    name: "Another User",
                    avatar: null,
                  },
                  likeCount: 2,
                  answerCount: 1,
                  createdAt: "2024-01-14T15:30:00Z",
                  updatedAt: "2024-01-14T15:30:00Z",
                },
              ],
              pagination: {
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
              },
            },
          }),
        });
      }
      // 질문 생성
      else if (url.includes("/api/questions") && method === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              question: {
                id: "new-question-123",
                title: "새로운 질문",
                content: "새로운 질문 내용",
                tags: ["테스트"],
                regionCode: "jeju_city",
                author: {
                  id: "user-1",
                  name: "Test User",
                  avatar: null,
                },
                likeCount: 0,
                answerCount: 0,
                createdAt: "2024-01-15T12:00:00Z",
                updatedAt: "2024-01-15T12:00:00Z",
              },
            },
          }),
        });
      }
      // 질문 상세 조회
      else if (url.includes("/api/questions/") && method === "GET" && !url.includes("/answers")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              question: {
                id: "question-1",
                title: "제주도 맛집 추천해주세요",
                content: "가족여행으로 제주도에 왔는데 현지인이 추천하는 맛집이 궁금합니다.",
                tags: ["맛집", "제주시", "가족여행"],
                regionCode: "jeju_city",
                author: {
                  id: "user-1",
                  name: "Test User",
                  avatar: null,
                },
                likeCount: 5,
                answerCount: 3,
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-15T10:00:00Z",
              },
              answers: [
                {
                  id: "answer-1",
                  content: "제주시에 있는 흑돼지 맛집을 추천드립니다.",
                  author: {
                    id: "user-2",
                    name: "Another User",
                    avatar: null,
                  },
                  likeCount: 2,
                  isAccepted: false,
                  createdAt: "2024-01-15T11:00:00Z",
                },
              ],
            },
          }),
        });
      }
      // 질문 수정
      else if (url.includes("/api/questions/") && method === "PUT") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              question: {
                id: "question-1",
                title: "수정된 질문 제목",
                content: "수정된 질문 내용",
                tags: ["수정된", "태그"],
                regionCode: "jeju_city",
                author: {
                  id: "user-1",
                  name: "Test User",
                  avatar: null,
                },
                likeCount: 5,
                answerCount: 3,
                createdAt: "2024-01-15T10:00:00Z",
                updatedAt: "2024-01-15T12:00:00Z",
              },
            },
          }),
        });
      }
      // 질문 삭제
      else if (url.includes("/api/questions/") && method === "DELETE") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "질문이 삭제되었습니다",
          }),
        });
      }
      // 질문 좋아요
      else if (url.includes("/api/questions/") && url.includes("/like") && method === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            message: "좋아요를 눌렀습니다",
            data: {
              likeCount: 6,
            },
          }),
        });
      }
      else {
        await route.continue();
      }
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("사용자가 질문 목록을 볼 수 있어야 함", async () => {
    // Given - 홈페이지로 이동
    await page.goto("http://localhost:3000");

    // Then - 질문 목록이 표시되는지 확인
    await expect(page.locator('[data-testid="question-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="question-item"]')).toHaveCount(2);
    
    // 첫 번째 질문 확인
    await expect(page.locator('[data-testid="question-item"]').first()).toContainText("제주도 맛집 추천해주세요");
    await expect(page.locator('[data-testid="question-item"]').first()).toContainText("Test User");
    await expect(page.locator('[data-testid="question-item"]').first()).toContainText("맛집");
  });

  test("사용자가 질문을 작성할 수 있어야 함", async () => {
    // Given - 질문 작성 페이지로 이동
    await page.goto("http://localhost:3000/questions/new");

    // When - 질문 작성 폼 작성 및 제출
    await page.fill('[data-testid="question-title-input"]', "새로운 질문");
    await page.fill('[data-testid="question-content-textarea"]', "새로운 질문 내용");
    await page.fill('[data-testid="question-tags-input"]', "테스트");
    await page.selectOption('[data-testid="question-region-select"]', "jeju_city");
    await page.click('[data-testid="question-submit-button"]');

    // Then - 질문 작성 성공 확인
    await expect(page.locator('[data-testid="success-message"]')).toContainText("질문이 작성되었습니다");
    await expect(page).toHaveURL("http://localhost:3000/questions/new-question-123");
  });

  test("사용자가 질문 상세를 볼 수 있어야 함", async () => {
    // Given - 질문 상세 페이지로 이동
    await page.goto("http://localhost:3000/questions/question-1");

    // Then - 질문 상세 정보가 표시되는지 확인
    await expect(page.locator('[data-testid="question-title"]')).toContainText("제주도 맛집 추천해주세요");
    await expect(page.locator('[data-testid="question-content"]')).toContainText("가족여행으로 제주도에 왔는데");
    await expect(page.locator('[data-testid="question-author"]')).toContainText("Test User");
    await expect(page.locator('[data-testid="question-tags"]')).toContainText("맛집");
    await expect(page.locator('[data-testid="question-like-count"]')).toContainText("5");
    await expect(page.locator('[data-testid="question-answer-count"]')).toContainText("3");
  });

  test("사용자가 질문에 좋아요를 누를 수 있어야 함", async () => {
    // Given - 질문 상세 페이지로 이동
    await page.goto("http://localhost:3000/questions/question-1");

    // When - 좋아요 버튼 클릭
    await page.click('[data-testid="question-like-button"]');

    // Then - 좋아요 수 증가 확인
    await expect(page.locator('[data-testid="question-like-count"]')).toContainText("6");
    await expect(page.locator('[data-testid="success-message"]')).toContainText("좋아요를 눌렀습니다");
  });

  test("사용자가 질문을 수정할 수 있어야 함", async () => {
    // Given - 질문 상세 페이지로 이동
    await page.goto("http://localhost:3000/questions/question-1");

    // When - 수정 버튼 클릭 및 수정
    await page.click('[data-testid="question-edit-button"]');
    await page.fill('[data-testid="question-title-input"]', "수정된 질문 제목");
    await page.fill('[data-testid="question-content-textarea"]', "수정된 질문 내용");
    await page.fill('[data-testid="question-tags-input"]', "수정된,태그");
    await page.click('[data-testid="question-update-button"]');

    // Then - 수정 성공 확인
    await expect(page.locator('[data-testid="success-message"]')).toContainText("질문이 수정되었습니다");
    await expect(page.locator('[data-testid="question-title"]')).toContainText("수정된 질문 제목");
    await expect(page.locator('[data-testid="question-content"]')).toContainText("수정된 질문 내용");
  });

  test("사용자가 질문을 삭제할 수 있어야 함", async () => {
    // Given - 질문 상세 페이지로 이동
    await page.goto("http://localhost:3000/questions/question-1");

    // When - 삭제 버튼 클릭 및 확인
    await page.click('[data-testid="question-delete-button"]');
    await page.click('[data-testid="confirm-delete-button"]');

    // Then - 삭제 성공 확인
    await expect(page.locator('[data-testid="success-message"]')).toContainText("질문이 삭제되었습니다");
    await expect(page).toHaveURL("http://localhost:3000/");
  });

  test("사용자가 질문을 검색할 수 있어야 함", async () => {
    // Given - 홈페이지로 이동
    await page.goto("http://localhost:3000");

    // When - 검색어 입력 및 검색
    await page.fill('[data-testid="search-input"]', "맛집");
    await page.click('[data-testid="search-button"]');

    // Then - 검색 결과 확인
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="question-item"]')).toContainText("맛집");
  });

  test("사용자가 태그로 필터링할 수 있어야 함", async () => {
    // Given - 홈페이지로 이동
    await page.goto("http://localhost:3000");

    // When - 태그 클릭
    await page.click('[data-testid="tag-맛집"]');

    // Then - 필터링된 결과 확인
    await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-filter"]')).toContainText("맛집");
  });

  test("사용자가 지역별로 필터링할 수 있어야 함", async () => {
    // Given - 홈페이지로 이동
    await page.goto("http://localhost:3000");

    // When - 지역 필터 선택
    await page.selectOption('[data-testid="region-filter"]', "jeju_city");

    // Then - 필터링된 결과 확인
    await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-filter"]')).toContainText("제주시");
  });

  test("사용자가 질문을 북마크할 수 있어야 함", async () => {
    // Given - 질문 상세 페이지로 이동
    await page.goto("http://localhost:3000/questions/question-1");

    // When - 북마크 버튼 클릭
    await page.click('[data-testid="question-bookmark-button"]');

    // Then - 북마크 성공 확인
    await expect(page.locator('[data-testid="question-bookmark-button"]')).toHaveClass(/bookmarked/);
    await expect(page.locator('[data-testid="success-message"]')).toContainText("북마크에 추가되었습니다");
  });

  test("사용자가 질문을 공유할 수 있어야 함", async () => {
    // Given - 질문 상세 페이지로 이동
    await page.goto("http://localhost:3000/questions/question-1");

    // When - 공유 버튼 클릭
    await page.click('[data-testid="question-share-button"]');

    // Then - 공유 모달 표시 확인
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-url"]')).toContainText("localhost:3000/questions/question-1");
  });
});
