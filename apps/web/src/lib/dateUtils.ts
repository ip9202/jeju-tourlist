/**
 * 날짜 포맷팅 유틸리티
 * 하이드레이션 에러 방지를 위한 안전한 날짜 처리
 */

/**
 * 클라이언트 사이드에서만 날짜 포맷팅을 수행하는 함수
 * @param dateString - ISO 날짜 문자열
 * @param options - Intl.DateTimeFormatOptions
 * @returns 포맷된 날짜 문자열 또는 기본값
 */
export function safeFormatDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  // 서버 사이드에서는 기본값 반환
  if (typeof window === "undefined") {
    return "날짜 로딩 중...";
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "유효하지 않은 날짜";
    }

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "날짜 오류";
  }
}

/**
 * 상대적 시간 포맷팅 (예: "2시간 전")
 * @param dateString - ISO 날짜 문자열
 * @returns 상대적 시간 문자열
 */
export function safeFormatRelativeTime(dateString: string): string {
  // 서버 사이드에서는 기본값 반환
  if (typeof window === "undefined") {
    return "방금 전";
  }

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 24 * 60)
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    if (diffInMinutes < 7 * 24 * 60)
      return `${Math.floor(diffInMinutes / (24 * 60))}일 전`;

    return date.toLocaleDateString("ko-KR");
  } catch (error) {
    console.error("Relative time formatting error:", error);
    return "방금 전";
  }
}

/**
 * 간단한 날짜 포맷팅 (YYYY.MM.DD)
 * @param dateString - ISO 날짜 문자열
 * @returns 간단한 날짜 문자열
 */
export function safeFormatSimpleDate(dateString: string): string {
  // 서버 사이드에서는 기본값 반환
  if (typeof window === "undefined") {
    return "날짜 로딩 중...";
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "유효하지 않은 날짜";
    }

    return date.toLocaleDateString("ko-KR");
  } catch (error) {
    console.error("Simple date formatting error:", error);
    return "날짜 오류";
  }
}
