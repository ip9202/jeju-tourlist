"use client";

import React, { useState, useEffect } from "react";
import { BadgeCollection, BadgeProgressList } from "@/components/badge";
import { BadgeInfo, UserBadgeInfo, BadgeProgress } from "@/types/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp } from "lucide-react";

/**
 * UserBadgeSection - 사용자 배지 섹션 컴포넌트
 * 
 * @description
 * - 사용자의 배지 컬렉션을 표시
 * - 배지별 진행률 표시
 * - 다음 배지까지 필요한 활동량 표시
 * - 배지 획득 히스토리
 * - 반응형 디자인 적용
 */
interface UserBadgeSectionProps {
  userId: string;
  className?: string;
}

export function UserBadgeSection({ userId, className }: UserBadgeSectionProps) {
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadgeInfo[]>([]);
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 배지 데이터 로드
  useEffect(() => {
    const loadBadgeData = async () => {
      try {
        setLoading(true);
        
        // 배지 목록 조회
        const badgesResponse = await fetch('/api/badges');
        const badgesData = await badgesResponse.json();
        
        if (badgesData.success) {
          setBadges(badgesData.data);
        }

        // 사용자 배지 조회
        const userBadgesResponse = await fetch(`/api/badges/users/${userId}`);
        const userBadgesData = await userBadgesResponse.json();
        
        if (userBadgesData.success) {
          setUserBadges(userBadgesData.data.badges || []);
        }

        // 배지 진행률 조회
        const progressResponse = await fetch(`/api/badges/users/${userId}/progress`);
        const progressData = await progressResponse.json();
        
        if (progressData.success) {
          setBadgeProgress(progressData.data || []);
        }

      } catch (err) {
        console.error('배지 데이터 로드 오류:', err);
        setError('배지 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadBadgeData();
    }
  }, [userId]);

  // 통계 계산
  const earnedBadges = userBadges.length;
  const totalBadges = badges.length;
  const completionRate = totalBadges > 0 ? Math.round((earnedBadges / totalBadges) * 100) : 0;
  
  const nextBadge = badgeProgress
    .filter(p => !p.isEarned)
    .sort((a, b) => a.progressPercentage - b.progressPercentage)[0];

  const recentBadges = userBadges
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            배지 컬렉션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            배지 컬렉션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          배지 컬렉션
        </CardTitle>
        
        {/* 배지 통계 */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Badge variant="secondary">{earnedBadges}/{totalBadges}</Badge>
            <span>획득</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>{completionRate}% 완료</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="collection" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collection">전체 배지</TabsTrigger>
            <TabsTrigger value="progress">진행률</TabsTrigger>
            <TabsTrigger value="history">획득 히스토리</TabsTrigger>
          </TabsList>

          {/* 전체 배지 탭 */}
          <TabsContent value="collection" className="mt-6">
            <BadgeCollection
              badges={badges}
              userBadges={userBadges}
              showProgress={false}
              columns={3}
            />
          </TabsContent>

          {/* 진행률 탭 */}
          <TabsContent value="progress" className="mt-6">
            <div className="space-y-6">
              {/* 다음 목표 배지 */}
              {nextBadge && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-blue-900">다음 목표</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{nextBadge.badge.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{nextBadge.badge.name}</h4>
                      <p className="text-sm text-gray-600">
                        {nextBadge.badge.requiredAnswers - nextBadge.currentProgress}개 더 답변하면 획득!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 진행률 리스트 */}
              <BadgeProgressList progresses={badgeProgress} />
            </div>
          </TabsContent>

          {/* 획득 히스토리 탭 */}
          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              {recentBadges.length > 0 ? (
                recentBadges.map((userBadge) => (
                  <div
                    key={userBadge.id}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                  >
                    <span className="text-2xl">{userBadge.badge.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-medium">{userBadge.badge.name}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(userBadge.earnedAt).toLocaleDateString('ko-KR')} 획득
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        +{userBadge.badge.bonusPoints}P
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>아직 획득한 배지가 없습니다.</p>
                  <p className="text-sm mt-1">답변을 작성하여 첫 번째 배지를 획득해보세요!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
