import * as React from "react"
import { Input } from "./input"
import { Label } from "./label"
import { cn } from "../../lib/utils"
import { AlertCircle, CheckCircle } from "lucide-react"

interface AccessibleFormFieldProps {
  id: string
  label: string
  type?: "text" | "email" | "password" | "tel" | "url" | "search"
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  success?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  ariaDescribedBy?: string
  className?: string
  children?: React.ReactNode
}

/**
 * 접근성을 개선한 폼 필드 컴포넌트
 * WCAG 2.1 AA 가이드라인을 준수
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 접근성이 개선된 폼 필드 렌더링만 담당
 * - Open/Closed: 새로운 폼 필드 타입 추가 가능
 * - Liskov Substitution: 기본 Input과 호환 가능
 * - Interface Segregation: 필요한 접근성 props만 노출
 * - Dependency Inversion: 외부 유효성 검사 도구와 통합 가능
 */
export function AccessibleFormField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  required = false,
  disabled = false,
  autoComplete,
  ariaDescribedBy,
  className,
  children,
}: AccessibleFormFieldProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasInteracted, setHasInteracted] = React.useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
    setHasInteracted(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    setHasInteracted(true)
    onBlur?.()
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const getAriaDescribedBy = () => {
    const describedBy = []
    if (ariaDescribedBy) describedBy.push(ariaDescribedBy)
    if (error) describedBy.push(`${id}-error`)
    if (success) describedBy.push(`${id}-success`)
    return describedBy.length > 0 ? describedBy.join(" ") : undefined
  }

  const getInputState = () => {
    if (error) return "error"
    if (success) return "success"
    if (isFocused) return "focused"
    return "default"
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label 
        htmlFor={id}
        className={cn(
          "text-sm font-medium",
          error && "text-destructive",
          success && "text-green-600",
          disabled && "text-muted-foreground"
        )}
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="필수 입력">
            *
          </span>
        )}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-describedby={getAriaDescribedBy()}
          aria-invalid={error ? "true" : "false"}
          aria-required={required}
          className={cn(
            "pr-10",
            error && "border-destructive focus-visible:ring-destructive",
            success && "border-green-500 focus-visible:ring-green-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        
        {/* 상태 아이콘 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {error && (
            <AlertCircle 
              className="h-4 w-4 text-destructive" 
              aria-hidden="true"
            />
          )}
          {success && !error && (
            <CheckCircle 
              className="h-4 w-4 text-green-500" 
              aria-hidden="true"
            />
          )}
        </div>
      </div>
      
      {/* 에러 메시지 */}
      {error && (
        <div
          id={`${id}-error`}
          className="text-sm text-destructive flex items-center gap-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
      
      {/* 성공 메시지 */}
      {success && !error && (
        <div
          id={`${id}-success`}
          className="text-sm text-green-600 flex items-center gap-1"
          role="status"
          aria-live="polite"
        >
          <CheckCircle className="h-3 w-3" />
          {success}
        </div>
      )}
      
      {/* 추가 설명 */}
      {children && (
        <div className="text-sm text-muted-foreground">
          {children}
        </div>
      )}
    </div>
  )
}

interface AccessibleFormProps {
  onSubmit: (data: FormData) => void
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}

/**
 * 접근성을 개선한 폼 컴포넌트
 * 키보드 네비게이션과 스크린 리더 지원
 */
export function AccessibleForm({
  onSubmit,
  children,
  className,
  ariaLabel,
}: AccessibleFormProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onSubmit(formData)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-6", className)}
      aria-label={ariaLabel}
      noValidate
    >
      {children}
    </form>
  )
}
