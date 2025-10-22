/**
 * fast-playwright E2E 테스트 헬퍼 함수
 *
 * @description
 * - 브라우저 자동화 유틸리티
 * - 일반적인 테스트 작업 추상화
 * - fast-playwright MCP 도구 사용
 */

/**
 * 테스트 설정
 */
export const TEST_CONFIG = {
  BASE_URL: process.env.E2E_BASE_URL || "http://localhost:3000",
  API_URL: process.env.API_BASE_URL || "http://localhost:4000",
  TIMEOUT: 30000,
  WAIT_TIMEOUT: 5000,
};

/**
 * 테스트 데이터
 */
export const TEST_DATA = {
  // 테스트 계정
  TEST_USER_EMAIL: "ip9202@gmail.com",
  TEST_USER_PASSWORD: "rkdcjfIP00!",

  // 테스트 질문 ID들
  QUESTION_IDS: [
    "q_b169c66a-b082-442b-bb57-778460042594",
    "q_374e7988-44ca-4dbf-9852-f18d379cff02",
  ],

  // 테스트 카테고리
  CATEGORIES: ["맛집", "관광지", "숙박", "교통", "쇼핑", "액티비티"],

  // 뷰포트 크기
  VIEWPORTS: {
    DESKTOP: { width: 1920, height: 1080 },
    TABLET: { width: 768, height: 1024 },
    MOBILE: { width: 375, height: 667 },
  },
};

/**
 * 페이지 네비게이션 헬퍼
 *
 * fast-playwright 도구:
 * - mcp__fast-playwright__browser_navigate
 * - mcp__fast-playwright__browser_wait_for
 */
export const PageNavigation = {
  /**
   * 홈페이지로 이동
   */
  goHome: async () => {
    // browser_navigate(url: TEST_CONFIG.BASE_URL)
    return `Navigate to ${TEST_CONFIG.BASE_URL}`;
  },

  /**
   * 질문 목록 페이지로 이동
   */
  goToQuestions: async () => {
    // browser_navigate(url: ${TEST_CONFIG.BASE_URL}/questions)
    return `Navigate to ${TEST_CONFIG.BASE_URL}/questions`;
  },

  /**
   * 특정 질문 상세 페이지로 이동
   */
  goToQuestion: async (questionId: string) => {
    // browser_navigate(url: ${TEST_CONFIG.BASE_URL}/questions/${questionId})
    return `Navigate to ${TEST_CONFIG.BASE_URL}/questions/${questionId}`;
  },

  /**
   * 로그인 페이지로 이동
   */
  goToLogin: async () => {
    // browser_navigate(url: ${TEST_CONFIG.BASE_URL}/auth/login)
    return `Navigate to ${TEST_CONFIG.BASE_URL}/auth/login`;
  },

  /**
   * 마이페이지로 이동
   */
  goToProfile: async () => {
    // browser_navigate(url: ${TEST_CONFIG.BASE_URL}/profile)
    return `Navigate to ${TEST_CONFIG.BASE_URL}/profile`;
  },
};

/**
 * 인증 헬퍼
 *
 * fast-playwright 도구:
 * - mcp__fast-playwright__browser_click
 * - mcp__fast-playwright__browser_type
 * - mcp__fast-playwright__browser_find_elements
 */
export const Authentication = {
  /**
   * 로그인 수행
   */
  login: async (email: string, _password: string) => {
    // 1. 로그인 폼 찾기
    // browser_find_elements(searchCriteria: { role: 'form', text: 'login' })
    // 2. 이메일 입력
    // browser_type(selectors: [{ role: 'textbox', text: 'Email' }], text: email)
    // 3. 비밀번호 입력
    // browser_type(selectors: [{ role: 'textbox', text: 'Password' }], text: password)
    // 4. 로그인 버튼 클릭
    // browser_click(selectors: [{ role: 'button', text: 'Login' }])
    return `Login with ${email}`;
  },

  /**
   * 로그아웃 수행
   */
  logout: async () => {
    // 1. 프로필 메뉴 찾기
    // browser_find_elements(searchCriteria: { role: 'button', text: 'Profile' })
    // 2. 로그아웃 버튼 클릭
    // browser_click(selectors: [{ role: 'button', text: 'Logout' }])
    return "Logout";
  },

  /**
   * 토큰 설정 (로컬 스토리지)
   */
  setToken: async (token: string) => {
    // browser_evaluate(function: () => localStorage.setItem('token', token))
    return `Set token: ${token.substring(0, 10)}...`;
  },
};

/**
 * 질문 관련 헬퍼
 *
 * fast-playwright 도구:
 * - mcp__fast-playwright__browser_click
 * - mcp__fast-playwright__browser_find_elements
 * - mcp__fast-playwright__browser_snapshot
 */
export const Question = {
  /**
   * 첫 번째 질문 카드 클릭
   */
  clickFirstQuestion: async () => {
    // browser_find_elements(searchCriteria: { role: 'link', text: 'question' })
    // browser_click(selectors: [{ css: '[data-testid="question-card"]:first-child' }])
    return "Click first question card";
  },

  /**
   * 질문 검색
   */
  search: async (query: string) => {
    // 1. 검색 입력 필드 찾기
    // browser_find_elements(searchCriteria: { role: 'textbox', text: 'Search' })
    // 2. 쿼리 입력
    // browser_type(selectors: [{ role: 'textbox', text: 'Search' }], text: query)
    // 3. 검색 버튼 클릭
    // browser_click(selectors: [{ role: 'button', text: 'Search' }])
    return `Search for: ${query}`;
  },

  /**
   * 카테고리 필터
   */
  filterByCategory: async (category: string) => {
    // 1. 카테고리 필터 버튼 찾기
    // browser_click(selectors: [{ role: 'button', text: category }])
    return `Filter by category: ${category}`;
  },

  /**
   * 질문에 좋아요 표시
   */
  likeQuestion: async () => {
    // browser_click(selectors: [{ role: 'button', text: 'Like' }])
    return "Like question";
  },

  /**
   * 질문 북마크
   */
  bookmarkQuestion: async () => {
    // browser_click(selectors: [{ role: 'button', text: 'Bookmark' }])
    return "Bookmark question";
  },
};

/**
 * 답변 관련 헬퍼
 *
 * fast-playwright 도구:
 * - mcp__fast-playwright__browser_click
 * - mcp__fast-playwright__browser_type
 * - mcp__fast-playwright__browser_find_elements
 */
export const Answer = {
  /**
   * 답변 작성 폼 열기
   */
  openAnswerForm: async () => {
    // browser_click(selectors: [{ role: 'button', text: 'Write Answer' }])
    return "Open answer form";
  },

  /**
   * 답변 입력
   */
  typeAnswer: async (content: string) => {
    // browser_find_elements(searchCriteria: { role: 'textbox', text: 'Answer' })
    // browser_type(selectors: [{ role: 'textbox', text: 'Answer' }], text: content)
    return `Type answer: ${content.substring(0, 50)}...`;
  },

  /**
   * 답변 제출
   */
  submitAnswer: async () => {
    // browser_click(selectors: [{ role: 'button', text: 'Submit' }])
    return "Submit answer";
  },

  /**
   * 답변에 좋아요 표시
   */
  likeAnswer: async () => {
    // browser_click(selectors: [{ role: 'button', text: 'Like' }])
    return "Like answer";
  },

  /**
   * 댓글 섹션 펼치기
   */
  expandReplies: async () => {
    // browser_click(selectors: [{ role: 'button', text: 'Show replies' }])
    return "Expand replies section";
  },

  /**
   * 대댓글 작성
   */
  writeReply: async (content: string) => {
    // 1. 댓글 입력 필드 찾기
    // browser_find_elements(searchCriteria: { role: 'textbox', text: 'Reply' })
    // 2. 댓글 입력
    // browser_type(selectors: [{ role: 'textbox' }], text: content)
    // 3. 제출
    // browser_click(selectors: [{ role: 'button', text: 'Reply' }])
    return `Write reply: ${content.substring(0, 50)}...`;
  },
};

/**
 * UI 상호작용 헬퍼
 *
 * fast-playwright 도구:
 * - mcp__fast-playwright__browser_click
 * - mcp__fast-playwright__browser_scroll
 * - mcp__fast-playwright__browser_hover
 * - mcp__fast-playwright__browser_press_key
 */
export const UI = {
  /**
   * 요소로 스크롤
   */
  scrollToElement: async (selector: string) => {
    // browser_evaluate(
    //   function: () => document.querySelector(selector)?.scrollIntoView()
    // )
    return `Scroll to ${selector}`;
  },

  /**
   * 페이지 스크롤
   */
  scrollPage: async (direction: "up" | "down", amount: number = 3) => {
    // browser_evaluate(
    //   function: () => window.scrollBy(0, direction === 'down' ? amount * 100 : -amount * 100)
    // )
    return `Scroll ${direction} by ${amount}`;
  },

  /**
   * 요소 호버
   */
  hover: async (selector: string) => {
    // browser_hover(selectors: [{ css: selector }])
    return `Hover on ${selector}`;
  },

  /**
   * 탭 키 누르기 (포커스 네비게이션)
   */
  pressTab: async (times: number = 1) => {
    // for (let i = 0; i < times; i++) {
    //   browser_press_key(key: 'Tab')
    // }
    return `Press Tab ${times} times`;
  },

  /**
   * 엔터 키 누르기
   */
  pressEnter: async () => {
    // browser_press_key(key: 'Enter')
    return "Press Enter";
  },

  /**
   * Escape 키 누르기
   */
  pressEscape: async () => {
    // browser_press_key(key: 'Escape')
    return "Press Escape";
  },

  /**
   * 모달 열기 확인
   */
  waitForModal: async () => {
    // browser_find_elements(searchCriteria: { role: 'dialog' })
    return "Wait for modal";
  },

  /**
   * 모달 닫기
   */
  closeModal: async () => {
    // browser_click(selectors: [{ role: 'button', text: 'Close' }])
    return "Close modal";
  },
};

/**
 * 검증 헬퍼
 *
 * fast-playwright 도구:
 * - mcp__fast-playwright__browser_find_elements
 * - mcp__fast-playwright__browser_inspect_html
 * - mcp__fast-playwright__browser_evaluate
 */
export const Assertions = {
  /**
   * 요소가 보이는지 확인
   */
  elementVisible: async (selector: string) => {
    // browser_find_elements(searchCriteria: { css: selector })
    // 결과가 있으면 보임
    return `Check if ${selector} is visible`;
  },

  /**
   * 텍스트가 포함되는지 확인
   */
  textExists: async (text: string) => {
    // browser_find_elements(searchCriteria: { text })
    return `Check if text "${text}" exists`;
  },

  /**
   * URL 확인
   */
  urlContains: async (urlPart: string) => {
    // browser_evaluate(function: () => window.location.href.includes(urlPart))
    return `Check if URL contains "${urlPart}"`;
  },

  /**
   * 특정 개수의 요소 확인
   */
  elementCount: async (selector: string, expectedCount: number) => {
    // browser_find_elements(searchCriteria: { css: selector })
    // 반환된 개수와 expectedCount 비교
    return `Check if ${selector} count equals ${expectedCount}`;
  },

  /**
   * 색상 대비 확인 (접근성)
   */
  checkContrast: async (element: string) => {
    // browser_evaluate(
    //   function: () => {
    //     // 색상 대비 계산
    //   }
    // )
    return `Check contrast for ${element}`;
  },

  /**
   * ARIA 라벨 확인
   */
  hasAriaLabel: async (selector: string) => {
    // browser_find_elements(searchCriteria: { css: selector })
    // aria-label 속성 확인
    return `Check if ${selector} has aria-label`;
  },
};

/**
 * 성능 테스트 헬퍼
 *
 * fast-playwright 도구:
 * - mcp__fast-playwright__browser_evaluate
 */
export const Performance = {
  /**
   * 페이지 로드 시간 측정
   */
  measureLoadTime: async () => {
    // browser_evaluate(
    //   function: () => {
    //     const perfData = performance.timing;
    //     return perfData.loadEventEnd - perfData.navigationStart;
    //   }
    // )
    return "Measure page load time";
  },

  /**
   * FCP (First Contentful Paint) 측정
   */
  measureFCP: async () => {
    // browser_evaluate(
    //   function: () => {
    //     const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    //     return fcp?.startTime;
    //   }
    // )
    return "Measure FCP";
  },

  /**
   * LCP (Largest Contentful Paint) 측정
   */
  measureLCP: async () => {
    // browser_evaluate(
    //   function: () => {
    //     const lcp = performance.getEntriesByType('largest-contentful-paint');
    //     return lcp[lcp.length - 1]?.startTime;
    //   }
    // )
    return "Measure LCP";
  },

  /**
   * CLS (Cumulative Layout Shift) 측정
   */
  measureCLS: async () => {
    // browser_evaluate(
    //   function: () => {
    //     let cls = 0;
    //     performance.getEntriesByType('layout-shift').forEach((entry: any) => {
    //       if (!entry.hadRecentInput) {
    //         cls += entry.value;
    //       }
    //     });
    //     return cls;
    //   }
    // )
    return "Measure CLS";
  },
};

/**
 * 반응형 디자인 테스트 헬퍼
 *
 * fast-playwright 도구:
 * - mcp__fast-playwright__browser_resize
 * - mcp__fast-playwright__browser_take_screenshot
 */
export const ResponsiveDesign = {
  /**
   * 뷰포트 크기 변경
   */
  setViewport: async (width: number, height: number) => {
    // browser_resize(width, height)
    return `Set viewport to ${width}x${height}`;
  },

  /**
   * 데스크톱 뷰로 설정
   */
  setDesktopView: async () => {
    // browser_resize(TEST_DATA.VIEWPORTS.DESKTOP.width, TEST_DATA.VIEWPORTS.DESKTOP.height)
    return "Set desktop view (1920x1080)";
  },

  /**
   * 태블릿 뷰로 설정
   */
  setTabletView: async () => {
    // browser_resize(TEST_DATA.VIEWPORTS.TABLET.width, TEST_DATA.VIEWPORTS.TABLET.height)
    return "Set tablet view (768x1024)";
  },

  /**
   * 모바일 뷰로 설정
   */
  setMobileView: async () => {
    // browser_resize(TEST_DATA.VIEWPORTS.MOBILE.width, TEST_DATA.VIEWPORTS.MOBILE.height)
    return "Set mobile view (375x667)";
  },

  /**
   * 스크린샷 캡처
   */
  takeScreenshot: async (name: string) => {
    // browser_take_screenshot(filename: name)
    return `Take screenshot: ${name}`;
  },
};

/**
 * 디버깅 헬퍼
 *
 * fast-playwright 도구:
 * - mcp__fast-playwright__browser_snapshot
 * - mcp__fast-playwright__browser_console_messages
 */
export const Debug = {
  /**
   * 현재 페이지 스냅샷 출력
   */
  printSnapshot: async () => {
    // browser_snapshot()
    return "Print page snapshot";
  },

  /**
   * 콘솔 로그 출력
   */
  printConsoleLogs: async () => {
    // browser_console_messages()
    return "Print console logs";
  },

  /**
   * DOM 상태 출력
   */
  printDOM: async () => {
    // browser_inspect_html(selectors: [{ css: 'body' }])
    return "Print DOM structure";
  },

  /**
   * 현재 URL 출력
   */
  printCurrentURL: async () => {
    // browser_evaluate(function: () => window.location.href)
    return "Print current URL";
  },
};

export default {
  PageNavigation,
  Authentication,
  Question,
  Answer,
  UI,
  Assertions,
  Performance,
  ResponsiveDesign,
  Debug,
};
