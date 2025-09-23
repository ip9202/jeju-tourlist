"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { 
  Activity, 
  Download, 
  Clock, 
  MemoryStick,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { collectPerformanceMetrics, getMemoryUsage, analyzeBundleSize } from "../../lib/performance"

interface PerformanceMetrics {
  domContentLoaded: number
  loadComplete: number
  firstContentfulPaint: number | null
  largestContentfulPaint: number | null
  dnsLookup: number
  tcpConnection: number
  request: number
  response: number
}

interface MemoryMetrics {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

interface BundleMetrics {
  totalSize: number
  scriptCount: number
  scripts: Array<{
    name: string
    size: number
    loadTime: number
  }>
}

/**
 * 성능 모니터링 컴포넌트
 * 실시간 성능 메트릭을 표시하고 최적화 권장사항을 제공
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 성능 모니터링 기능만 담당
 * - Open/Closed: 새로운 성능 메트릭 추가 가능
 * - Liskov Substitution: 다양한 모니터링 도구와 호환 가능
 * - Interface Segregation: 필요한 성능 정보만 노출
 * - Dependency Inversion: 외부 성능 모니터링 서비스와 통합 가능
 */
export function PerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null)
  const [memory, setMemory] = React.useState<MemoryMetrics | null>(null)
  const [bundle, setBundle] = React.useState<BundleMetrics | null>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    // 페이지 로드 후 메트릭 수집
    const timer = setTimeout(() => {
      const performanceMetrics = collectPerformanceMetrics()
      const memoryMetrics = getMemoryUsage()
      const bundleMetrics = analyzeBundleSize()

      setMetrics(performanceMetrics)
      setMemory(memoryMetrics)
      setBundle(bundleMetrics)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const getPerformanceScore = (fcp: number | null, lcp: number | null) => {
    if (!fcp || !lcp) return { score: 0, level: "unknown", color: "secondary" }
    
    let score = 100
    if (fcp > 1800) score -= 30
    else if (fcp > 1000) score -= 15
    
    if (lcp > 4000) score -= 40
    else if (lcp > 2500) score -= 20
    
    if (score >= 90) return { score, level: "excellent", color: "default" }
    if (score >= 70) return { score, level: "good", color: "secondary" }
    if (score >= 50) return { score, level: "needs-improvement", color: "destructive" }
    return { score, level: "poor", color: "destructive" }
  }

  const performanceScore = metrics ? getPerformanceScore(metrics.firstContentfulPaint, metrics.largestContentfulPaint) : null

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Activity className="h-4 w-4 mr-2" />
        성능 모니터
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">성능 모니터</CardTitle>
              <CardDescription>실시간 성능 메트릭</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 성능 점수 */}
          {performanceScore && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">성능 점수</span>
              <Badge variant={performanceScore.color as any}>
                {performanceScore.score}/100
              </Badge>
            </div>
          )}

          {/* 로딩 시간 */}
          {metrics && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                로딩 시간
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>DOM 로드:</span>
                  <span>{formatTime(metrics.domContentLoaded)}</span>
                </div>
                <div className="flex justify-between">
                  <span>완전 로드:</span>
                  <span>{formatTime(metrics.loadComplete)}</span>
                </div>
                {metrics.firstContentfulPaint && (
                  <div className="flex justify-between">
                    <span>FCP:</span>
                    <span>{formatTime(metrics.firstContentfulPaint)}</span>
                  </div>
                )}
                {metrics.largestContentfulPaint && (
                  <div className="flex justify-between">
                    <span>LCP:</span>
                    <span>{formatTime(metrics.largestContentfulPaint)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 네트워크 시간 */}
          {metrics && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Download className="h-4 w-4" />
                네트워크
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span>DNS 조회:</span>
                  <span>{formatTime(metrics.dnsLookup)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TCP 연결:</span>
                  <span>{formatTime(metrics.tcpConnection)}</span>
                </div>
                <div className="flex justify-between">
                  <span>요청:</span>
                  <span>{formatTime(metrics.request)}</span>
                </div>
                <div className="flex justify-between">
                  <span>응답:</span>
                  <span>{formatTime(metrics.response)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 메모리 사용량 */}
          {memory && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MemoryStick className="h-4 w-4" />
                메모리
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>사용 중:</span>
                  <span>{formatBytes(memory.usedJSHeapSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span>전체:</span>
                  <span>{formatBytes(memory.totalJSHeapSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span>한계:</span>
                  <span>{formatBytes(memory.jsHeapSizeLimit)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <div 
                    className="bg-primary h-1 rounded-full" 
                    style={{ 
                      width: `${(memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 번들 크기 */}
          {bundle && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                번들 크기
              </h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>전체 크기:</span>
                  <span>{formatBytes(bundle.totalSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span>스크립트 수:</span>
                  <span>{bundle.scriptCount}개</span>
                </div>
              </div>
            </div>
          )}

          {/* 권장사항 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">권장사항</h4>
            <div className="space-y-1 text-xs">
              {performanceScore && performanceScore.score < 70 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  성능 개선이 필요합니다
                </div>
              )}
              {performanceScore && performanceScore.score >= 70 && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  성능이 양호합니다
                </div>
              )}
              <div className="text-muted-foreground">
                • 이미지 최적화 사용
              </div>
              <div className="text-muted-foreground">
                • 코드 분할 적용
              </div>
              <div className="text-muted-foreground">
                • 불필요한 리소스 제거
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
