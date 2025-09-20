/**
 * Socket.io 이벤트 핸들러
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: Socket 이벤트 처리만 담당
 * - Open/Closed: 새로운 이벤트 추가 시 기존 코드 수정 없이 확장
 * - Liskov Substitution: ISocketEventHandler 인터페이스 완전 구현
 * - Interface Segregation: 이벤트별로 핸들러 분리
 * - Dependency Inversion: 서비스 클래스들의 인터페이스에 의존
 */

import { TypedSocket, ISocketEventHandler } from "../../types/socket";
import { NotificationManager } from "./notificationManager";
import { StatsManager } from "./statsManager";
import { RoomManager } from "./roomManager";
import { ConnectionManager } from "./connectionManager";

/**
 * Socket.io 이벤트 핸들러 클래스
 */
export class SocketEventHandler implements ISocketEventHandler {
  constructor(
    private notificationManager: NotificationManager,
    private statsManager: StatsManager,
    private roomManager: RoomManager,
    private connectionManager: ConnectionManager
  ) {}

  /**
   * 질문 관련 이벤트 핸들러 등록
   * @param socket 소켓 인스턴스
   */
  public handleQuestionEvents(socket: TypedSocket): void {
    // 새 질문 등록
    socket.on("new_question", async data => {
      try {
        const { questionId, content, hashtags, location } = data;
        const userId = socket.data.userId;
        const userName = socket.data.userName;

        if (!userId) {
          socket.emit("error", { message: "사용자 인증이 필요합니다" });
          return;
        }

        console.log(`❓ 새 질문: ${questionId} by ${userName}`);

        // 통계 업데이트
        this.statsManager.addQuestion(location, hashtags);

        // 질문 브로드캐스트
        const broadcastData = {
          questionId,
          content,
          hashtags,
          author: {
            id: userId,
            name: userName || "익명",
            avatar: socket.data.userAvatar,
          },
          location,
          timestamp: Date.now(),
        };

        // 위치 기반 브로드캐스트
        if (location) {
          socket
            .to(`location:${location}`)
            .emit("question_broadcast", broadcastData);
        }

        // 해시태그 기반 브로드캐스트 (향후 구현)
        hashtags.forEach(hashtag => {
          socket
            .to(`hashtag:${hashtag}`)
            .emit("question_broadcast", broadcastData);
        });

        // 질문 알림 전송
        this.notificationManager.sendQuestionNotification({
          questionId,
          authorId: userId,
          content,
          hashtags,
          location,
        });

        // 연결 상태 업데이트
        this.connectionManager.updateUserActivity(userId);
      } catch (error) {
        console.error("❌ 질문 이벤트 처리 실패:", error);
        socket.emit("error", { message: "질문 처리에 실패했습니다" });
      }
    });

    // 질문 수정
    socket.on("question_updated", async data => {
      try {
        const { questionId, content, hashtags } = data;
        const userId = socket.data.userId;

        if (!userId) {
          socket.emit("error", { message: "사용자 인증이 필요합니다" });
          return;
        }

        console.log(`✏️  질문 수정: ${questionId} by ${userId}`);

        // 질문이 속한 룸의 사용자들에게 알림
        socket.to(`question:${questionId}`).emit("question_broadcast", {
          questionId,
          content,
          hashtags,
          author: {
            id: userId,
            name: socket.data.userName || "익명",
            avatar: socket.data.userAvatar,
          },
          timestamp: Date.now(),
          isUpdate: true,
        });

        this.connectionManager.updateUserActivity(userId);
      } catch (error) {
        console.error("❌ 질문 수정 이벤트 처리 실패:", error);
        socket.emit("error", { message: "질문 수정 처리에 실패했습니다" });
      }
    });
  }

  /**
   * 답변 관련 이벤트 핸들러 등록
   * @param socket 소켓 인스턴스
   */
  public handleAnswerEvents(socket: TypedSocket): void {
    // 새 답변 등록
    socket.on("new_answer", async data => {
      try {
        const { questionId, answerId, content, userId: targetUserId } = data;
        const userId = socket.data.userId;
        const userName = socket.data.userName;

        if (!userId) {
          socket.emit("error", { message: "사용자 인증이 필요합니다" });
          return;
        }

        console.log(`💬 새 답변: ${answerId} for ${questionId} by ${userName}`);

        // 통계 업데이트 (질문 생성 시간 필요 - 임시로 현재 시간 사용)
        this.statsManager.addAnswer(Date.now() - 10 * 60 * 1000); // 10분 전 질문으로 가정

        // 답변 브로드캐스트
        const broadcastData = {
          questionId,
          answerId,
          content,
          author: {
            id: userId,
            name: userName || "익명",
            avatar: socket.data.userAvatar,
          },
          timestamp: Date.now(),
        };

        // 질문 룸의 모든 사용자에게 브로드캐스트
        socket
          .to(`question:${questionId}`)
          .emit("answer_broadcast", broadcastData);

        // 답변 알림 전송
        this.notificationManager.sendAnswerNotification({
          answerId,
          questionId,
          questionAuthorId: targetUserId,
          answerAuthorId: userId,
          content,
        });

        // 질문에 답변이 달렸음을 통계에 반영
        this.statsManager.markQuestionAnswered(questionId);

        this.connectionManager.updateUserActivity(userId);
      } catch (error) {
        console.error("❌ 답변 이벤트 처리 실패:", error);
        socket.emit("error", { message: "답변 처리에 실패했습니다" });
      }
    });

    // 답변 수정
    socket.on("answer_updated", async data => {
      try {
        const { answerId, content } = data;
        const userId = socket.data.userId;

        if (!userId) {
          socket.emit("error", { message: "사용자 인증이 필요합니다" });
          return;
        }

        console.log(`✏️  답변 수정: ${answerId} by ${userId}`);

        // 답변이 속한 질문 룸의 사용자들에게 알림
        socket.broadcast.emit("answer_broadcast", {
          questionId: "question_id", // 실제 구현에서는 DB에서 조회
          answerId,
          content,
          author: {
            id: userId,
            name: socket.data.userName || "익명",
            avatar: socket.data.userAvatar,
          },
          timestamp: Date.now(),
          isUpdate: true,
        });

        this.connectionManager.updateUserActivity(userId);
      } catch (error) {
        console.error("❌ 답변 수정 이벤트 처리 실패:", error);
        socket.emit("error", { message: "답변 수정 처리에 실패했습니다" });
      }
    });

    // 답변 채택
    socket.on("answer_accepted", async data => {
      try {
        const { answerId, questionId } = data;
        const userId = socket.data.userId; // 질문 작성자

        if (!userId) {
          socket.emit("error", { message: "사용자 인증이 필요합니다" });
          return;
        }

        console.log(`✅ 답변 채택: ${answerId} by ${userId}`);

        // 답변 채택 알림 (답변 작성자 ID 필요 - 임시로 데이터에서 추출)
        this.notificationManager.sendAnswerAcceptedNotification({
          answerId,
          questionId,
          answerAuthorId: "answer_author_id", // 실제 구현에서는 DB에서 조회
          questionAuthorId: userId,
        });

        // 질문 룸의 모든 사용자에게 채택 알림
        socket.to(`question:${questionId}`).emit("notification", {
          type: "accepted",
          title: "답변이 채택되었습니다",
          message: "이 질문의 답변이 채택되어 해결되었습니다.",
          data: { questionId, answerId },
        });

        this.connectionManager.updateUserActivity(userId);
      } catch (error) {
        console.error("❌ 답변 채택 이벤트 처리 실패:", error);
        socket.emit("error", { message: "답변 채택 처리에 실패했습니다" });
      }
    });
  }

  /**
   * 타이핑 관련 이벤트 핸들러 등록
   * @param socket 소켓 인스턴스
   */
  public handleTypingEvents(socket: TypedSocket): void {
    // 타이핑 시작
    socket.on("typing_start", async data => {
      try {
        const { questionId, userId, userName } = data;

        if (!socket.data.userId) {
          return;
        }

        console.log(`⌨️  타이핑 시작: ${userName} in ${questionId}`);

        // 해당 질문의 다른 사용자들에게 타이핑 상태 알림
        socket.to(`question:${questionId}`).emit("user_typing", {
          questionId,
          userId,
          userName,
          isTyping: true,
        });

        this.connectionManager.updateUserActivity(socket.data.userId);
      } catch (error) {
        console.error("❌ 타이핑 시작 이벤트 처리 실패:", error);
      }
    });

    // 타이핑 중지
    socket.on("typing_stop", async data => {
      try {
        const { questionId, userId } = data;

        if (!socket.data.userId) {
          return;
        }

        console.log(`⌨️  타이핑 중지: ${userId} in ${questionId}`);

        // 해당 질문의 다른 사용자들에게 타이핑 중지 알림
        socket.to(`question:${questionId}`).emit("user_typing", {
          questionId,
          userId,
          userName: socket.data.userName,
          isTyping: false,
        });

        this.connectionManager.updateUserActivity(socket.data.userId);
      } catch (error) {
        console.error("❌ 타이핑 중지 이벤트 처리 실패:", error);
      }
    });
  }

  /**
   * 사용자 관련 이벤트 핸들러 등록
   * @param socket 소켓 인스턴스
   */
  public handleUserEvents(socket: TypedSocket): void {
    // 사용자 온라인 상태
    socket.on("user_online", async data => {
      try {
        const { userId, location } = data;

        if (!socket.data.userId) {
          socket.emit("error", { message: "사용자 인증이 필요합니다" });
          return;
        }

        console.log(`🟢 사용자 온라인: ${userId} at ${location}`);

        // 통계에 활성 사용자 추가
        this.statsManager.addActiveUser(userId, location);

        // 알림 관리자에 사용자 소켓 등록
        this.notificationManager.registerUserSocket(userId, socket.id);

        // 위치 기반 룸 참여
        if (location) {
          await this.roomManager.joinRoom(
            socket,
            `location:${location}`,
            userId
          );
        }

        this.connectionManager.updateUserActivity(userId);
      } catch (error) {
        console.error("❌ 사용자 온라인 이벤트 처리 실패:", error);
        socket.emit("error", { message: "온라인 상태 처리에 실패했습니다" });
      }
    });

    // 사용자 오프라인 상태
    socket.on("user_offline", async data => {
      try {
        const { userId } = data;

        if (!socket.data.userId) {
          return;
        }

        console.log(`🔴 사용자 오프라인: ${userId}`);

        // 통계에서 활성 사용자 제거
        this.statsManager.removeActiveUser(userId, socket.data.location);

        // 알림 관리자에서 사용자 소켓 해제
        this.notificationManager.unregisterUserSocket(userId, socket.id);
      } catch (error) {
        console.error("❌ 사용자 오프라인 이벤트 처리 실패:", error);
      }
    });

    // 연결 해제 시 자동 정리
    socket.on("disconnect", async () => {
      try {
        const userId = socket.data.userId;
        if (!userId) return;

        console.log(`👋 사용자 연결 해제: ${userId}`);

        // 각 서비스에서 사용자 정리
        this.statsManager.removeActiveUser(userId, socket.data.location);
        this.notificationManager.unregisterUserSocket(userId, socket.id);

        // 참여한 모든 룸에서 나가기
        if (socket.data.joinedRooms) {
          socket.data.joinedRooms.forEach(async roomId => {
            await this.roomManager.leaveRoom(socket, roomId, userId);
          });
        }
      } catch (error) {
        console.error("❌ 연결 해제 정리 실패:", error);
      }
    });
  }

  /**
   * 모든 이벤트 핸들러 등록
   * @param socket 소켓 인스턴스
   */
  public registerAllHandlers(socket: TypedSocket): void {
    this.handleQuestionEvents(socket);
    this.handleAnswerEvents(socket);
    this.handleTypingEvents(socket);
    this.handleUserEvents(socket);

    console.log(`🎯 모든 이벤트 핸들러 등록 완료: ${socket.id}`);
  }
}
