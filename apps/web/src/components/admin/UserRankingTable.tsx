import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { DataTable } from "../ui/data-table"

export interface UserRanking {
  id: string
  rank: number
  name: string
  email: string
  avatar?: string
  points: number
  questionsCount: number
  answersCount: number
  likesReceived: number
  joinDate: string
  lastActive: string
  status: "active" | "inactive" | "banned"
}

/**
 * 사용자 랭킹 테이블 컴포넌트
 * 관리자 페이지에서 사용자 통계를 표시하는 고급 테이블
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 사용자 랭킹 데이터 표시만 담당
 * - Open/Closed: 새로운 컬럼 추가 가능
 * - Liskov Substitution: DataTable과 호환 가능
 * - Interface Segregation: 필요한 props만 노출
 * - Dependency Inversion: 외부 데이터 소스에 의존
 */
export function UserRankingTable({ data }: { data: UserRanking[] }) {
  const columns: ColumnDef<UserRanking>[] = [
    {
      accessorKey: "rank",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            순위
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const rank = row.getValue("rank") as number
        return (
          <div className="flex items-center">
            <Badge 
              variant={rank <= 3 ? "default" : "secondary"}
              className="w-8 h-8 rounded-full flex items-center justify-center"
            >
              {rank}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: "사용자",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "points",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            포인트
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const points = row.getValue("points") as number
        return (
          <div className="text-right font-medium">
            {points.toLocaleString()}점
          </div>
        )
      },
    },
    {
      accessorKey: "questionsCount",
      header: "질문",
      cell: ({ row }) => {
        const count = row.getValue("questionsCount") as number
        return <div className="text-center">{count}개</div>
      },
    },
    {
      accessorKey: "answersCount",
      header: "답변",
      cell: ({ row }) => {
        const count = row.getValue("answersCount") as number
        return <div className="text-center">{count}개</div>
      },
    },
    {
      accessorKey: "likesReceived",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            받은 좋아요
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const likes = row.getValue("likesReceived") as number
        return <div className="text-center">{likes}개</div>
      },
    },
    {
      accessorKey: "status",
      header: "상태",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge 
            variant={
              status === "active" ? "default" : 
              status === "inactive" ? "secondary" : 
              "destructive"
            }
          >
            {status === "active" ? "활성" : 
             status === "inactive" ? "비활성" : "차단"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "lastActive",
      header: "최근 활동",
      cell: ({ row }) => {
        const lastActive = row.getValue("lastActive") as string
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(lastActive).toLocaleDateString("ko-KR")}
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">메뉴 열기</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>작업</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.id)}
              >
                사용자 ID 복사
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>프로필 보기</DropdownMenuItem>
              <DropdownMenuItem>메시지 보내기</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                {user.status === "banned" ? "차단 해제" : "사용자 차단"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="사용자 이름으로 검색..."
      showColumnToggle={true}
      showPagination={true}
      pageSize={20}
      className="w-full"
    />
  )
}
