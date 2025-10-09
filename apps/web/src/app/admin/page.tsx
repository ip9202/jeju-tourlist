"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserRankingTable,
  UserRanking,
} from "@/components/admin/UserRankingTable";
import {
  QuestionStatsTable,
  QuestionStats,
} from "@/components/admin/QuestionStatsTable";
import {
  Users,
  MessageSquare,
  TrendingUp,
  Activity,
  BarChart3,
  Settings,
} from "lucide-react";

/**
 * 관리자 대시보드 페이지
 * 사용자 랭킹, 질문 통계, 시스템 현황을 종합적으로 표시
 *
 * SOLID 원칙 적용:
 * - Single Responsibility: 관리자 대시보드 표시만 담당
 * - Open/Closed: 새로운 통계 섹션 추가 가능
 * - Liskov Substitution: 각 컴포넌트와 호환 가능
 * - Interface Segregation: 필요한 데이터만 전달
 * - Dependency Inversion: 외부 데이터 소스에 의존
 */
export default function AdminDashboard() {
  // 임시 데이터 - 실제로는 API에서 가져와야 함
  const userRankingData: UserRanking[] = [
    {
      id: "1",
      rank: 1,
      name: "김제주",
      email: "kim@jeju.com",
      avatar: "/avatars/kim-jeju.jpg",
      points: 15420,
      questionsCount: 23,
      answersCount: 156,
      likesReceived: 892,
      joinDate: "2024-01-15",
      lastActive: "2024-01-23",
      status: "active",
    },
    {
      id: "2",
      rank: 2,
      name: "이여행",
      email: "lee@travel.com",
      avatar: "/avatars/lee-travel.jpg",
      points: 12850,
      questionsCount: 18,
      answersCount: 134,
      likesReceived: 756,
      joinDate: "2024-01-20",
      lastActive: "2024-01-23",
      status: "active",
    },
    {
      id: "3",
      rank: 3,
      name: "박관광",
      email: "park@tour.com",
      avatar: "/avatars/park-tour.jpg",
      points: 11200,
      questionsCount: 31,
      answersCount: 98,
      likesReceived: 623,
      joinDate: "2024-01-10",
      lastActive: "2024-01-22",
      status: "active",
    },
    {
      id: "4",
      rank: 4,
      name: "최제주도",
      email: "choi@jeju.com",
      avatar: "/avatars/choi-jeju.jpg",
      points: 9850,
      questionsCount: 15,
      answersCount: 87,
      likesReceived: 445,
      joinDate: "2024-01-25",
      lastActive: "2024-01-23",
      status: "active",
    },
    {
      id: "5",
      rank: 5,
      name: "정여행자",
      email: "jung@traveler.com",
      avatar: "/avatars/jung-traveler.jpg",
      points: 8750,
      questionsCount: 12,
      answersCount: 76,
      likesReceived: 398,
      joinDate: "2024-01-18",
      lastActive: "2024-01-21",
      status: "inactive",
    },
  ];

  const questionStatsData: QuestionStats[] = [
    {
      id: "q1",
      title: "제주도 3박4일 여행 코스 추천해주세요",
      author: {
        id: "1",
        name: "김제주",
        avatar: "/avatars/kim-jeju.jpg",
      },
      category: "여행코스",
      tags: ["제주도", "3박4일", "여행코스", "추천"],
      views: 1250,
      answersCount: 8,
      likes: 45,
      createdAt: "2024-01-20",
      updatedAt: "2024-01-23",
      status: "open",
      priority: "high",
    },
    {
      id: "q2",
      title: "제주도 렌터카 추천 업체는?",
      author: {
        id: "2",
        name: "이여행",
        avatar: "/avatars/lee-travel.jpg",
      },
      category: "교통",
      tags: ["렌터카", "교통", "추천"],
      views: 890,
      answersCount: 12,
      likes: 32,
      createdAt: "2024-01-19",
      updatedAt: "2024-01-22",
      status: "resolved",
      priority: "medium",
    },
    {
      id: "q3",
      title: "제주도 날씨는 어떤가요?",
      author: {
        id: "3",
        name: "박관광",
        avatar: "/avatars/park-tour.jpg",
      },
      category: "날씨",
      tags: ["날씨", "기후", "제주도"],
      views: 2100,
      answersCount: 15,
      likes: 67,
      createdAt: "2024-01-18",
      updatedAt: "2024-01-23",
      status: "open",
      priority: "high",
    },
    {
      id: "q4",
      title: "제주도 맛집 추천해주세요",
      author: {
        id: "4",
        name: "최제주도",
        avatar: "/avatars/choi-jeju.jpg",
      },
      category: "맛집",
      tags: ["맛집", "음식", "추천", "제주도"],
      views: 1750,
      answersCount: 22,
      likes: 89,
      createdAt: "2024-01-17",
      updatedAt: "2024-01-23",
      status: "resolved",
      priority: "medium",
    },
    {
      id: "q5",
      title: "제주도 숙소 예약 어디서 하나요?",
      author: {
        id: "5",
        name: "정여행자",
        avatar: "/avatars/jung-traveler.jpg",
      },
      category: "숙소",
      tags: ["숙소", "예약", "제주도"],
      views: 650,
      answersCount: 5,
      likes: 18,
      createdAt: "2024-01-16",
      updatedAt: "2024-01-20",
      status: "closed",
      priority: "low",
    },
  ];

  const stats = {
    totalUsers: 1234,
    activeUsers: 892,
    totalQuestions: 567,
    totalAnswers: 2341,
    totalViews: 45678,
    todayQuestions: 12,
    todayAnswers: 45,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
          <p className="text-muted-foreground">
            제주 여행 Q&A 커뮤니티 현황을 한눈에 확인하세요
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            설정
          </Button>
          <Button size="sm">
            <BarChart3 className="mr-2 h-4 w-4" />
            상세 분석
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              활성 사용자 {stats.activeUsers.toLocaleString()}명
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 질문</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalQuestions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              오늘 {stats.todayQuestions}개 질문
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 답변</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalAnswers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              오늘 {stats.todayAnswers}개 답변
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 조회수</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">평균 조회수 증가 중</p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">사용자 랭킹</TabsTrigger>
          <TabsTrigger value="questions">질문 통계</TabsTrigger>
          <TabsTrigger value="analytics">분석</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>사용자 랭킹</CardTitle>
              <CardDescription>
                포인트와 활동량을 기준으로 한 사용자 랭킹입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRankingTable data={userRankingData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>질문 통계</CardTitle>
              <CardDescription>
                인기 질문과 답변 현황을 확인할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuestionStatsTable data={questionStatsData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>주간 활동 현황</CardTitle>
                <CardDescription>
                  최근 7일간의 사용자 활동을 보여줍니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  차트 컴포넌트가 여기에 표시됩니다
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>인기 카테고리</CardTitle>
                <CardDescription>
                  가장 많이 질문되는 카테고리입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">여행코스</span>
                    <Badge variant="secondary">45%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">맛집</span>
                    <Badge variant="secondary">32%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">교통</span>
                    <Badge variant="secondary">18%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">숙소</span>
                    <Badge variant="secondary">5%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
