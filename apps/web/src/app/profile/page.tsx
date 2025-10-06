"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ProtectedRoute } from "../../components/auth/ProtectedRoute";
import { Button } from "../../components/ui/button";
import { SubPageHeader } from "../../components/layout/SubPageHeader";
import { Header } from "@/components/layout/Header";
import { User, Settings, Edit3, Save, X } from "lucide-react";

/**
 * 사용자 프로필 페이지
 * Single Responsibility Principle: 사용자 프로필 관리만 담당
 */
export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    profileImage: user?.profileImage || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name,
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || "",
      profileImage: user?.profileImage || "",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        await refreshUser();
        setIsEditing(false);
      } else {
        const error = await response.json();
        alert(`프로필 수정 실패: ${error.message}`);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("프로필 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        {/* 간결한 헤더 */}
        <SubPageHeader
          title="프로필"
          showBackButton={true}
          showHomeButton={true}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 프로필 정보 */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-8 w-8 text-indigo-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">프로필</h1>
              </div>
              {!isEditing && (
                <Button onClick={handleEdit} variant="outline">
                  <Edit3 className="w-4 h-4 mr-2" />
                  수정
                </Button>
              )}
            </div>
          </div>

          {/* 프로필 정보 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start space-x-6">
              {/* 프로필 이미지 */}
              <div className="flex-shrink-0">
                {isEditing ? (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-indigo-600" />
                    )}
                  </div>
                )}
              </div>

              {/* 프로필 정보 */}
              <div className="flex-1">
                <div className="space-y-4">
                  {/* 이름 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이름
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={e =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : (
                      <p className="text-lg text-gray-900">{user?.name}</p>
                    )}
                  </div>

                  {/* 이메일 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이메일
                    </label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>

                  {/* 로그인 방식 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      로그인 방식
                    </label>
                    <p className="text-gray-900 capitalize">{user?.provider}</p>
                  </div>

                  {/* 가입일 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      가입일
                    </label>
                    <p className="text-gray-900">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("ko-KR")
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* 편집 버튼들 */}
                {isEditing && (
                  <div className="flex space-x-3 mt-6">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "저장 중..." : "저장"}
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      취소
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 활동 통계 */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">활동 통계</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600">질문</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600">답변</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600">받은 좋아요</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600">포인트</div>
              </div>
            </div>
          </div>

          {/* 설정 */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">설정</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    알림 설정
                  </h3>
                  <p className="text-sm text-gray-600">
                    새 질문과 답변에 대한 알림을 받습니다
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  설정
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    개인정보 보호
                  </h3>
                  <p className="text-sm text-gray-600">
                    프로필 공개 범위를 설정합니다
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  설정
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
