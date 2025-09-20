/**
 * Socket.io 실시간 통계 관리 서비스
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: 실시간 통계 수집 및 브로드캐스트만 담당
 * - Open/Closed: 새로운 통계 항목 추가 시 기존 코드 수정 없이 확장
 * - Liskov Substitution: IStatsManager 인터페이스 완전 구현
 * - Interface Segregation: 통계 관리 기능만 인터페이스에 포함
 * - Dependency Inversion: 추상화된 인터페이스에 의존
 */

import { TypedServer, IStatsManager } from "../../types/socket";

/**
 * 실시간 통계 데이터 인터페이스
 */
interface RealtimeStatsData {
  activeUsers: number;
  questionsToday: number;
  answersToday: number;
  responseRate: number;
  averageResponseTime: number; // 분 단위
  topLocations: Array<{ location: string; count: number }>;
  topHashtags: Array<{ hashtag: string; count: number }>;
  lastUpdated: number;
}

/**
 * 일일 통계 카운터
 */
interface DailyCounters {
  questionsCount: number;
  answersCount: number;
  questionsWithAnswers: number;
  totalResponseTime: number; // 분 단위 누적
  responseCount: number;
  lastReset: number; // 마지막 리셋 시간 (자정)
}

/**
 * 위치별 활동 통계
 */
interface LocationStats {
  [location: string]: {
    questions: number;
    answers: number;
    activeUsers: number;
  };
}

/**
 * 해시태그별 통계
 */
interface HashtagStats {
  [hashtag: string]: {
    count: number;
    lastUsed: number;
  };
}

/**
 * Socket.io 통계 관리 클래스
 */
export class StatsManager implements IStatsManager {
  private activeUsers: Set<string> = new Set();
  private dailyCounters: DailyCounters = {
    questionsCount: 0,
    answersCount: 0,
    questionsWithAnswers: 0,
    totalResponseTime: 0,
    responseCount: 0,
    lastReset: this.getMidnightTimestamp(),
  };
  private locationStats: LocationStats = {};
  private hashtagStats: HashtagStats = {};
  private broadcastInterval?: NodeJS.Timeout;

  constructor(private io: TypedServer) {
    this.startStatsCollection();
    this.startDailyReset();
  }

  /**
   * 활성 사용자 수 업데이트
   */
  public async updateActiveUsers(): Promise<void> {
    try {
      const currentActiveUsers = await this.getCurrentActiveUsers();
      this.activeUsers = new Set(currentActiveUsers);

      console.log(`👥 활성 사용자 업데이트: ${this.activeUsers.size}명`);
    } catch (error) {
      console.error("❌ 활성 사용자 업데이트 실패:", error);
    }
  }

  /**
   * 일일 통계 업데이트
   */
  public async updateDailyStats(): Promise<void> {
    try {
      // 자정이 지났는지 확인
      const currentMidnight = this.getMidnightTimestamp();

      if (this.dailyCounters.lastReset < currentMidnight) {
        this.resetDailyCounters();
      }

      console.log("📊 일일 통계 업데이트 완료");
    } catch (error) {
      console.error("❌ 일일 통계 업데이트 실패:", error);
    }
  }

  /**
   * 실시간 통계 브로드캐스트
   */
  public async broadcastStats(): Promise<void> {
    try {
      const stats = await this.getRealtimeStats();
      this.io.emit("stats_update", stats);

      console.log("📡 실시간 통계 브로드캐스트:", stats);
    } catch (error) {
      console.error("❌ 통계 브로드캐스트 실패:", error);
    }
  }

  /**
   * 실시간 통계 조회
   */
  public async getRealtimeStats(): Promise<RealtimeStatsData> {
    const responseRate =
      this.dailyCounters.questionsCount > 0
        ? (this.dailyCounters.questionsWithAnswers /
            this.dailyCounters.questionsCount) *
          100
        : 0;

    const averageResponseTime =
      this.dailyCounters.responseCount > 0
        ? this.dailyCounters.totalResponseTime /
          this.dailyCounters.responseCount
        : 0;

    const topLocations = this.getTopLocations(5);
    const topHashtags = this.getTopHashtags(5);

    return {
      activeUsers: this.activeUsers.size,
      questionsToday: this.dailyCounters.questionsCount,
      answersToday: this.dailyCounters.answersCount,
      responseRate: Math.round(responseRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      topLocations,
      topHashtags,
      lastUpdated: Date.now(),
    };
  }

  /**
   * 사용자 활동 추가
   * @param userId 사용자 ID
   * @param location 위치 (선택)
   */
  public addActiveUser(userId: string, location?: string): void {
    this.activeUsers.add(userId);

    if (location) {
      if (!this.locationStats[location]) {
        this.locationStats[location] = {
          questions: 0,
          answers: 0,
          activeUsers: 0,
        };
      }
      this.locationStats[location].activeUsers++;
    }
  }

  /**
   * 사용자 활동 제거
   * @param userId 사용자 ID
   * @param location 위치 (선택)
   */
  public removeActiveUser(userId: string, location?: string): void {
    this.activeUsers.delete(userId);

    if (location && this.locationStats[location]) {
      this.locationStats[location].activeUsers = Math.max(
        0,
        this.locationStats[location].activeUsers - 1
      );
    }
  }

  /**
   * 새 질문 통계 추가
   * @param location 위치
   * @param hashtags 해시태그
   */
  public addQuestion(location?: string, hashtags: string[] = []): void {
    this.dailyCounters.questionsCount++;

    if (location) {
      if (!this.locationStats[location]) {
        this.locationStats[location] = {
          questions: 0,
          answers: 0,
          activeUsers: 0,
        };
      }
      this.locationStats[location].questions++;
    }

    // 해시태그 통계 업데이트
    hashtags.forEach(hashtag => {
      if (!this.hashtagStats[hashtag]) {
        this.hashtagStats[hashtag] = {
          count: 0,
          lastUsed: Date.now(),
        };
      }
      this.hashtagStats[hashtag].count++;
      this.hashtagStats[hashtag].lastUsed = Date.now();
    });

    console.log(
      `❓ 질문 통계 추가 - 위치: ${location}, 해시태그: ${hashtags.join(", ")}`
    );
  }

  /**
   * 새 답변 통계 추가
   * @param questionCreatedAt 질문 생성 시간
   * @param location 위치
   */
  public addAnswer(questionCreatedAt: number, location?: string): void {
    this.dailyCounters.answersCount++;

    // 응답 시간 계산 (분 단위)
    const responseTime = (Date.now() - questionCreatedAt) / (1000 * 60);
    this.dailyCounters.totalResponseTime += responseTime;
    this.dailyCounters.responseCount++;

    if (location && this.locationStats[location]) {
      this.locationStats[location].answers++;
    }

    console.log(
      `💬 답변 통계 추가 - 응답시간: ${Math.round(responseTime)}분, 위치: ${location}`
    );
  }

  /**
   * 질문에 답변이 달렸을 때 호출
   * @param questionId 질문 ID
   */
  public markQuestionAnswered(questionId: string): void {
    this.dailyCounters.questionsWithAnswers++;
    console.log(`✅ 질문 답변 완료 통계: ${questionId}`);
  }

  /**
   * 상위 위치 조회
   * @param limit 개수 제한
   */
  private getTopLocations(
    limit: number
  ): Array<{ location: string; count: number }> {
    return Object.entries(this.locationStats)
      .map(([location, stats]) => ({
        location,
        count: stats.questions + stats.answers,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 상위 해시태그 조회
   * @param limit 개수 제한
   */
  private getTopHashtags(
    limit: number
  ): Array<{ hashtag: string; count: number }> {
    return Object.entries(this.hashtagStats)
      .map(([hashtag, stats]) => ({
        hashtag,
        count: stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * 현재 활성 사용자 수 조회 (Socket.io 기준)
   */
  private async getCurrentActiveUsers(): Promise<string[]> {
    const connectedSockets = await this.io.fetchSockets();
    const userIds = connectedSockets
      .map(socket => socket.data.userId)
      .filter(userId => userId !== undefined) as string[];

    // 중복 제거
    const uniqueUserIds = Array.from(new Set(userIds));
    return uniqueUserIds;
  }

  /**
   * 일일 카운터 리셋
   */
  private resetDailyCounters(): void {
    this.dailyCounters = {
      questionsCount: 0,
      answersCount: 0,
      questionsWithAnswers: 0,
      totalResponseTime: 0,
      responseCount: 0,
      lastReset: this.getMidnightTimestamp(),
    };

    // 위치별 통계 리셋
    Object.keys(this.locationStats).forEach(location => {
      this.locationStats[location].questions = 0;
      this.locationStats[location].answers = 0;
    });

    console.log("🔄 일일 통계 카운터 리셋");
  }

  /**
   * 오늘 자정 타임스탬프 조회
   */
  private getMidnightTimestamp(): number {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return midnight.getTime();
  }

  /**
   * 통계 수집 시작
   */
  private startStatsCollection(): void {
    // 5분마다 통계 업데이트 및 브로드캐스트
    this.broadcastInterval = setInterval(
      async () => {
        await this.updateActiveUsers();
        await this.updateDailyStats();
        await this.broadcastStats();
      },
      5 * 60 * 1000
    );

    console.log("📊 실시간 통계 수집 시작");
  }

  /**
   * 일일 리셋 타이머 시작
   */
  private startDailyReset(): void {
    // 매시간 자정 체크
    setInterval(
      () => {
        const currentMidnight = this.getMidnightTimestamp();

        if (this.dailyCounters.lastReset < currentMidnight) {
          this.resetDailyCounters();
        }
      },
      60 * 60 * 1000
    ); // 1시간마다 체크

    console.log("🕛 일일 리셋 타이머 시작");
  }

  /**
   * 통계 수집 중지
   */
  public stop(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = undefined;
    }
    console.log("📊 통계 수집 중지");
  }

  /**
   * 상세 통계 조회 (관리자용)
   */
  public getDetailedStats(): {
    activeUsers: number;
    dailyCounters: DailyCounters;
    locationStats: LocationStats;
    hashtagStats: { [hashtag: string]: { count: number; lastUsed: string } };
  } {
    // 해시태그 통계를 읽기 쉬운 형태로 변환
    const readableHashtagStats: {
      [hashtag: string]: { count: number; lastUsed: string };
    } = {};
    Object.entries(this.hashtagStats).forEach(([hashtag, stats]) => {
      readableHashtagStats[hashtag] = {
        count: stats.count,
        lastUsed: new Date(stats.lastUsed).toISOString(),
      };
    });

    return {
      activeUsers: this.activeUsers.size,
      dailyCounters: this.dailyCounters,
      locationStats: this.locationStats,
      hashtagStats: readableHashtagStats,
    };
  }
}
