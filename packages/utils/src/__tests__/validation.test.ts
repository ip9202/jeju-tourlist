/**
 * 유틸리티 함수 단위 테스트
 *
 * @description
 * - 유틸리티 함수들의 모든 기능에 대한 단위 테스트
 * - SRP: 각 테스트는 단일 기능만 검증
 * - OCP: 새로운 유틸리티 함수 추가 시 기존 테스트 수정 없이 확장
 */

import { describe, it, expect } from "@jest/globals";
import {
  validateEmail,
  validatePassword,
  sanitizeHtml,
  formatDate,
  slugify,
  debounce,
  throttle,
  generateId,
  isValidUrl,
  parseJsonSafely,
} from "../index";

describe("Validation Utils", () => {
  describe("validateEmail", () => {
    it("유효한 이메일 형식을 검증해야 함", () => {
      // Given
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.kr",
        "test+tag@example.org",
        "123@test.com",
      ];

      // When & Then
      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it("유효하지 않은 이메일 형식을 거부해야 함", () => {
      // Given
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "test@",
        "test..test@example.com",
        "",
        "test@.com",
        "test@example.",
      ];

      // When & Then
      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it("null이나 undefined 입력 시 false를 반환해야 함", () => {
      // When & Then
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("강력한 비밀번호를 검증해야 함", () => {
      // Given
      const strongPasswords = [
        "Password123!",
        "MyStr0ng#Pass",
        "ComplexP@ssw0rd",
      ];

      // When & Then
      strongPasswords.forEach((password) => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    it("약한 비밀번호를 거부해야 함", () => {
      // Given
      const weakPasswords = [
        "123456", // 숫자만
        "password", // 소문자만
        "PASSWORD", // 대문자만
        "Pass123", // 특수문자 없음
        "Pass!", // 숫자 없음
        "123!", // 대소문자 없음
        "", // 빈 문자열
      ];

      // When & Then
      weakPasswords.forEach((password) => {
        expect(validatePassword(password)).toBe(false);
      });
    });

    it("최소 길이 미만의 비밀번호를 거부해야 함", () => {
      // Given
      const shortPasswords = ["Ab1!", "Test1", "My#2"];

      // When & Then
      shortPasswords.forEach((password) => {
        expect(validatePassword(password)).toBe(false);
      });
    });
  });
});

describe("String Utils", () => {
  describe("sanitizeHtml", () => {
    it("HTML 태그를 안전하게 제거해야 함", () => {
      // Given
      const htmlInput = "<script>alert('xss')</script><p>Safe content</p>";
      const expected = "Safe content";

      // When
      const result = sanitizeHtml(htmlInput);

      // Then
      expect(result).toBe(expected);
    });

    it("XSS 공격을 방지해야 함", () => {
      // Given
      const xssInputs = [
        "<img src=x onerror=alert('xss')>",
        "<svg onload=alert('xss')>",
        "<iframe src=javascript:alert('xss')>",
        "<a href=javascript:alert('xss')>Click</a>",
      ];

      // When & Then
      xssInputs.forEach((input) => {
        const result = sanitizeHtml(input);
        expect(result).not.toContain("<script");
        expect(result).not.toContain("onerror");
        expect(result).not.toContain("onload");
        expect(result).not.toContain("javascript:");
      });
    });

    it("안전한 HTML은 유지해야 함", () => {
      // Given
      const safeHtml = "<p>안전한 <strong>텍스트</strong>입니다.</p>";
      const expected = "안전한 텍스트입니다.";

      // When
      const result = sanitizeHtml(safeHtml);

      // Then
      expect(result).toBe(expected);
    });
  });

  describe("slugify", () => {
    it("한글과 영문을 URL 친화적 문자열로 변환해야 함", () => {
      // Given
      const input = "제주도 맛집 추천해주세요!";
      const expected = "제주도-맛집-추천해주세요";

      // When
      const result = slugify(input);

      // Then
      expect(result).toBe(expected);
    });

    it("특수문자와 공백을 하이픈으로 변환해야 함", () => {
      // Given
      const input = "Hello, World! How are you?";
      const expected = "hello-world-how-are-you";

      // When
      const result = slugify(input);

      // Then
      expect(result).toBe(expected);
    });

    it("연속된 하이픈을 하나로 합쳐야 함", () => {
      // Given
      const input = "Test---Multiple---Hyphens";
      const expected = "test-multiple-hyphens";

      // When
      const result = slugify(input);

      // Then
      expect(result).toBe(expected);
    });
  });
});

describe("Date Utils", () => {
  describe("formatDate", () => {
    it("한국 시간으로 날짜를 포맷해야 함", () => {
      // Given
      const date = new Date("2024-01-15T10:30:00Z");
      const expected = "2024-01-15 19:30:00"; // UTC+9

      // When
      const result = formatDate(date);

      // Then
      expect(result).toBe(expected);
    });

    it("상대적 시간을 포맷해야 함", () => {
      // Given
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // When
      const result = formatDate(oneHourAgo, { relative: true });

      // Then
      expect(result).toContain("1시간 전");
    });

    it("사용자 정의 포맷을 적용해야 함", () => {
      // Given
      const date = new Date("2024-01-15T10:30:00Z");
      const format = "YYYY년 MM월 DD일";

      // When
      const result = formatDate(date, { format });

      // Then
      expect(result).toContain("2024년 01월 15일");
    });
  });
});

describe("Function Utils", () => {
  describe("debounce", () => {
    it("연속된 호출을 지연시켜야 함", (done) => {
      // Given
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      // When
      debouncedFn();
      debouncedFn();
      debouncedFn();

      // Then
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 150);
    });

    it("지연 시간 후에 함수를 실행해야 함", (done) => {
      // Given
      let executed = false;
      const debouncedFn = debounce(() => {
        executed = true;
      }, 50);

      // When
      debouncedFn();

      // Then
      setTimeout(() => {
        expect(executed).toBe(true);
        done();
      }, 100);
    });
  });

  describe("throttle", () => {
    it("지정된 간격으로만 함수를 실행해야 함", (done) => {
      // Given
      let callCount = 0;
      const throttledFn = throttle(() => {
        callCount++;
      }, 100);

      // When
      throttledFn();
      throttledFn();
      throttledFn();

      // Then
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 50);
    });
  });
});

describe("ID Utils", () => {
  describe("generateId", () => {
    it("고유한 ID를 생성해야 함", () => {
      // Given
      const id1 = generateId();
      const id2 = generateId();

      // When & Then
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe("string");
      expect(id1.length).toBeGreaterThan(0);
    });

    it("지정된 길이의 ID를 생성해야 함", () => {
      // Given
      const length = 10;

      // When
      const id = generateId(length);

      // Then
      expect(id.length).toBe(length);
    });
  });
});

describe("URL Utils", () => {
  describe("isValidUrl", () => {
    it("유효한 URL을 검증해야 함", () => {
      // Given
      const validUrls = [
        "https://example.com",
        "http://localhost:3000",
        "https://api.example.com/v1/users",
        "https://example.com/path?query=value",
      ];

      // When & Then
      validUrls.forEach((url) => {
        expect(isValidUrl(url)).toBe(true);
      });
    });

    it("유효하지 않은 URL을 거부해야 함", () => {
      // Given
      const invalidUrls = [
        "not-a-url",
        "ftp://example.com",
        "javascript:alert('xss')",
        "",
        "https://",
      ];

      // When & Then
      invalidUrls.forEach((url) => {
        expect(isValidUrl(url)).toBe(false);
      });
    });
  });
});

describe("JSON Utils", () => {
  describe("parseJsonSafely", () => {
    it("유효한 JSON을 파싱해야 함", () => {
      // Given
      const validJson = '{"name": "test", "age": 25}';
      const expected = { name: "test", age: 25 };

      // When
      const result = parseJsonSafely(validJson);

      // Then
      expect(result).toEqual(expected);
    });

    it("유효하지 않은 JSON에 대해 기본값을 반환해야 함", () => {
      // Given
      const invalidJson = '{"name": "test", "age":}';
      const defaultValue = {};

      // When
      const result = parseJsonSafely(invalidJson, defaultValue);

      // Then
      expect(result).toEqual(defaultValue);
    });

    it("null이나 undefined 입력에 대해 기본값을 반환해야 함", () => {
      // Given
      const defaultValue = {};

      // When
      const result1 = parseJsonSafely(null, defaultValue);
      const result2 = parseJsonSafely(undefined, defaultValue);

      // Then
      expect(result1).toEqual(defaultValue);
      expect(result2).toEqual(defaultValue);
    });
  });
});
