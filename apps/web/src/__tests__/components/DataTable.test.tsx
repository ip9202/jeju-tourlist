import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataTable } from '@/components/ui/data-table'

// Mock data for testing
const mockData = [
  {
    id: '1',
    name: '김제주',
    email: 'kim@jeju.com',
    points: 15420,
    status: 'active'
  },
  {
    id: '2',
    name: '이여행',
    email: 'lee@travel.com',
    points: 12850,
    status: 'inactive'
  }
]

const mockColumns = [
  {
    accessorKey: 'name',
    header: '이름',
    cell: ({ row }: any) => row.getValue('name')
  },
  {
    accessorKey: 'email',
    header: '이메일',
    cell: ({ row }: any) => row.getValue('email')
  },
  {
    accessorKey: 'points',
    header: '포인트',
    cell: ({ row }: any) => row.getValue('points')
  },
  {
    accessorKey: 'status',
    header: '상태',
    cell: ({ row }: any) => row.getValue('status')
  }
]

/**
 * DataTable 컴포넌트 테스트
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: DataTable 컴포넌트 테스트만 담당
 * - Open/Closed: 새로운 테스트 케이스 추가 가능
 * - Liskov Substitution: 다양한 테이블 데이터와 호환 가능
 * - Interface Segregation: 필요한 테스트 기능만 구현
 * - Dependency Inversion: 외부 테스트 라이브러리와 통합 가능
 */
describe('DataTable', () => {
  it('renders table with data correctly', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        searchKey="name"
        searchPlaceholder="이름으로 검색..."
      />
    )

    // 테이블 헤더 확인
    expect(screen.getByText('이름')).toBeInTheDocument()
    expect(screen.getByText('이메일')).toBeInTheDocument()
    expect(screen.getByText('포인트')).toBeInTheDocument()
    expect(screen.getByText('상태')).toBeInTheDocument()

    // 테이블 데이터 확인
    expect(screen.getByText('김제주')).toBeInTheDocument()
    expect(screen.getByText('kim@jeju.com')).toBeInTheDocument()
    expect(screen.getByText('15420')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('displays search input when searchKey is provided', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        searchKey="name"
        searchPlaceholder="이름으로 검색..."
      />
    )

    const searchInput = screen.getByPlaceholderText('이름으로 검색...')
    expect(searchInput).toBeInTheDocument()
  })

  it('filters data based on search input', async () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        searchKey="name"
        searchPlaceholder="이름으로 검색..."
      />
    )

    const searchInput = screen.getByPlaceholderText('이름으로 검색...')
    
    // 검색어 입력
    fireEvent.change(searchInput, { target: { value: '김' } })
    
    await waitFor(() => {
      expect(screen.getByText('김제주')).toBeInTheDocument()
      expect(screen.queryByText('이여행')).not.toBeInTheDocument()
    })
  })

  it('shows column toggle button when showColumnToggle is true', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        showColumnToggle={true}
      />
    )

    const columnToggleButton = screen.getByText('컬럼')
    expect(columnToggleButton).toBeInTheDocument()
  })

  it('shows pagination when showPagination is true', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        showPagination={true}
      />
    )

    expect(screen.getByText('이전')).toBeInTheDocument()
    expect(screen.getByText('다음')).toBeInTheDocument()
  })

  it('displays empty state when no data', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
      />
    )

    expect(screen.getByText('데이터가 없습니다.')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        className="custom-table"
      />
    )

    expect(container.firstChild).toHaveClass('custom-table')
  })

  it('handles pagination correctly', async () => {
    // 더 많은 데이터로 테스트
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `사용자${i + 1}`,
      email: `user${i + 1}@example.com`,
      points: 1000 + i,
      status: 'active'
    }))

    render(
      <DataTable
        columns={mockColumns}
        data={largeData}
        showPagination={true}
        pageSize={10}
      />
    )

    // 첫 번째 페이지에 10개 항목이 표시되는지 확인
    expect(screen.getByText('사용자1')).toBeInTheDocument()
    expect(screen.getByText('사용자10')).toBeInTheDocument()
    expect(screen.queryByText('사용자11')).not.toBeInTheDocument()

    // 다음 페이지 버튼 클릭
    const nextButton = screen.getByText('다음')
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('사용자11')).toBeInTheDocument()
      expect(screen.queryByText('사용자1')).not.toBeInTheDocument()
    })
  })

  it('handles column visibility toggle', async () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        showColumnToggle={true}
      />
    )

    // 컬럼 토글 버튼 클릭
    const columnToggleButton = screen.getByText('컬럼')
    fireEvent.click(columnToggleButton)

    // 드롭다운 메뉴가 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('name')).toBeInTheDocument()
      expect(screen.getByText('email')).toBeInTheDocument()
      expect(screen.getByText('points')).toBeInTheDocument()
      expect(screen.getByText('status')).toBeInTheDocument()
    })
  })

  it('displays correct row count in pagination info', () => {
    render(
      <DataTable
        columns={mockColumns}
        data={mockData}
        showPagination={true}
      />
    )

    expect(screen.getByText(/2개 중 2개 행이 선택됨/)).toBeInTheDocument()
  })
})
