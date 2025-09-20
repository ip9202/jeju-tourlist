/**
 * Socket.io 테스트 컴포넌트
 * Phase 7.1.2 테스트용 임시 컴포넌트
 */

"use client";

import React, { useState } from "react";
import {
  useSocketContext,
  useSocketConnection,
  useSocketNotifications,
} from "../contexts/SocketContext";

export function SocketTest() {
  const { socket, connect, disconnect } = useSocketContext();
  const { isConnected, status, error } = useSocketConnection();
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    clearNotifications,
  } = useSocketNotifications();

  const [testMessage, setTestMessage] = useState("");
  const [testRoomId, setTestRoomId] = useState("test-room");
  const [testUserId, setTestUserId] = useState("user-123");

  /**
   * 테스트 메시지 전송
   */
  const sendTestMessage = () => {
    if (!socket || !isConnected) {
      alert("Socket이 연결되지 않았습니다.");
      return;
    }

    socket.emit("new_question", {
      questionId: "test-question-" + Date.now(),
      content: testMessage,
      hashtags: ["테스트"],
      location: "제주시",
    });

    setTestMessage("");
  };

  /**
   * 룸 참여 테스트
   */
  const joinTestRoom = () => {
    if (!socket || !isConnected) {
      alert("Socket이 연결되지 않았습니다.");
      return;
    }

    socket.joinRoom(testRoomId, testUserId);
  };

  /**
   * 룸 나가기 테스트
   */
  const leaveTestRoom = () => {
    if (!socket || !isConnected) {
      alert("Socket이 연결되지 않았습니다.");
      return;
    }

    socket.leaveRoom(testRoomId, testUserId);
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">🧪 Socket.io 테스트</h2>

      {/* 연결 상태 */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">연결 상태</h3>
        <div className="space-y-2 text-sm">
          <div>
            상태:{" "}
            <span
              className={`px-2 py-1 rounded text-white ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {status}
            </span>
          </div>
          {error && <div className="text-red-600">에러: {error}</div>}
        </div>

        <div className="mt-4 space-x-2">
          <button
            onClick={connect}
            disabled={isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            연결
          </button>
          <button
            onClick={disconnect}
            disabled={!isConnected}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
          >
            연결 해제
          </button>
        </div>
      </div>

      {/* 메시지 전송 테스트 */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">메시지 전송 테스트</h3>
        <div className="space-y-2">
          <input
            type="text"
            value={testMessage}
            onChange={e => setTestMessage(e.target.value)}
            placeholder="테스트 메시지 입력"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={sendTestMessage}
            disabled={!isConnected || !testMessage.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            메시지 전송
          </button>
        </div>
      </div>

      {/* 룸 관리 테스트 */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">룸 관리 테스트</h3>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <input
              type="text"
              value={testRoomId}
              onChange={e => setTestRoomId(e.target.value)}
              placeholder="룸 ID"
              className="flex-1 p-2 border rounded"
            />
            <input
              type="text"
              value={testUserId}
              onChange={e => setTestUserId(e.target.value)}
              placeholder="사용자 ID"
              className="flex-1 p-2 border rounded"
            />
          </div>
          <div className="space-x-2">
            <button
              onClick={joinTestRoom}
              disabled={!isConnected}
              className="px-4 py-2 bg-purple-500 text-white rounded disabled:bg-gray-400"
            >
              룸 참여
            </button>
            <button
              onClick={leaveTestRoom}
              disabled={!isConnected}
              className="px-4 py-2 bg-orange-500 text-white rounded disabled:bg-gray-400"
            >
              룸 나가기
            </button>
          </div>
        </div>
      </div>

      {/* 실시간 알림 */}
      <div className="p-4 bg-gray-50 rounded">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">
            실시간 알림 ({unreadCount}개 읽지 않음)
          </h3>
          <button
            onClick={clearNotifications}
            className="px-3 py-1 bg-gray-500 text-white text-sm rounded"
          >
            모두 지우기
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-gray-500 text-sm">알림이 없습니다.</div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-2 border rounded text-sm ${
                  notification.read
                    ? "bg-gray-100"
                    : "bg-yellow-50 border-yellow-200"
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <div className="font-medium">{notification.title}</div>
                <div className="text-gray-600">{notification.message}</div>
                <div className="text-xs text-gray-500">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
