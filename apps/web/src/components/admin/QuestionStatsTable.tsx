import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, MessageCircle, Heart } from "lucide-react"

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

export interface QuestionStats {
  id: string
  title: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  category: string
  tags: string[]
  views: number
  answersCount: number
  likes: number
  createdAt: string
  updatedAt: string
  status: "open" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
}

/**
 * 질문 통계 테이블 컴포넌트
 * 관리자 페이지에서 질문 통계를 표시하는 고급 테이블
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 질문 통계 데이터 표시만 담당
 * - Open/Closed: 새로운 컬럼 추가 가능
 * - Liskov Substitution: DataTable과 호환 가능
 * - Interface Segregation: 필요한 props만 노출
 * - Dependency Inversion: 외부 데이터 소스에 의존
 */
export function QuestionStatsTable({ data }: { data: QuestionStats[] }) {
  const columns: ColumnDef<QuestionStats>[] = [
    {
      accessorKey: "title",
      header: "질문",
      cell: ({ row }) => {
        const question = row.original
        return (
          <div className="max-w-[300px]">
            <div className="font-medium truncate">{question.title}</div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {question.category}
              </Badge>
              {question.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {question.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{question.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "author",
      header: "작성자",
      cell: ({ row }) => {
        const author = row.getValue("author") as QuestionStats["author"]
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback className="text-xs">
                {author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{author.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "views",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <Eye className="mr-2 h-4 w-4" />
            조회수
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const views = row.getValue("views") as number
        return <div className="text-center">{views.toLocaleString()}</div>
      },
    },
    {
      accessorKey: "answersCount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            답변
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const count = row.getValue("answersCount") as number
        return <div className="text-center">{count}개</div>
      },
    },
    {
      accessorKey: "likes",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            <Heart className="mr-2 h-4 w-4" />
            좋아요
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const likes = row.getValue("likes") as number
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
              status === "open" ? "default" : 
              status === "resolved" ? "secondary" : 
              "destructive"
            }
          >
            {status === "open" ? "진행중" : 
             status === "resolved" ? "해결됨" : "종료"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "priority",
      header: "우선순위",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        return (
          <Badge 
            variant={
              priority === "high" ? "destructive" : 
              priority === "medium" ? "default" : 
              "secondary"
            }
          >
            {priority === "high" ? "높음" : 
             priority === "medium" ? "보통" : "낮음"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            작성일
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(date).toLocaleDateString("ko-KR")}
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const question = row.original

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
                onClick={() => navigator.clipboard.writeText(question.id)}
              >
                질문 ID 복사
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>질문 보기</DropdownMenuItem>
              <DropdownMenuItem>작성자 프로필</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                {question.status === "closed" ? "질문 재오픈" : "질문 종료"}
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
      searchKey="title"
      searchPlaceholder="질문 제목으로 검색..."
      showColumnToggle={true}
      showPagination={true}
      pageSize={25}
      className="w-full"
    />
  )
}
