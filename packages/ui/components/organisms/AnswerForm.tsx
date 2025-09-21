/**
 * AnswerForm 컴포넌트
 * 
 * @description
 * - 답변 작성/수정을 위한 폼 컴포넌트
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 * - 접근성(A11y) 고려사항 포함
 * 
 * @example
 * ```tsx
 * <AnswerForm
 *   onSubmit={handleSubmit}
 *   onCancel={handleCancel}
 *   initialData={{
 *     content: '제주도 여행 추천드립니다...',
 *     category: 'travel',
 *     priority: 'normal',
 *     isPublic: true
 *   }}
 * />
 * ```
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Button, Textarea, Select, Checkbox, RadioGroup } from '../atoms';
import { Label } from '../atoms';

/**
 * 답변 폼 컴포넌트 스타일 variants 정의
 */
const answerFormVariants = cva(
  // 기본 스타일
  'bg-card text-card-foreground border border-border rounded-lg shadow-sm p-6',
  {
    variants: {
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      variant: {
        default: 'bg-card',
        highlighted: 'bg-primary-50 border-primary-200',
        featured: 'bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-300',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

/**
 * 답변 폼 데이터 타입 정의
 */
export interface AnswerFormData {
  /**
   * 답변 내용
   */
  content: string;
  
  /**
   * 답변 카테고리
   */
  category: string;
  
  /**
   * 답변 우선순위
   */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  /**
   * 답변 위치
   */
  location?: string;
  
  /**
   * 답변 이미지들
   */
  images?: string[];
  
  /**
   * 답변 첨부파일들
   */
  attachments?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  
  /**
   * 답변 공개 여부
   */
  isPublic: boolean;
  
  /**
   * 답변 알림 여부
   */
  enableNotifications: boolean;
  
  /**
   * 답변 댓글 허용 여부
   */
  allowComments: boolean;
  
  /**
   * 답변 익명 여부
   */
  isAnonymous: boolean;
}

/**
 * 답변 폼 유효성 검사 오류 타입 정의
 */
export interface AnswerFormErrors {
  content?: string;
  category?: string;
  priority?: string;
  location?: string;
  images?: string;
  attachments?: string;
  isPublic?: string;
  enableNotifications?: string;
  allowComments?: string;
  isAnonymous?: string;
}

/**
 * AnswerForm 컴포넌트 Props 타입 정의
 */
export interface AnswerFormProps
  extends React.HTMLAttributes<HTMLFormElement>,
    VariantProps<typeof answerFormVariants> {
  /**
   * 답변 폼 데이터
   */
  data: AnswerFormData;
  
  /**
   * 답변 폼 오류
   */
  errors?: AnswerFormErrors;
  
  /**
   * 답변 폼 제출 핸들러
   */
  onSubmit: (data: AnswerFormData) => void;
  
  /**
   * 답변 폼 취소 핸들러
   */
  onCancel: () => void;
  
  /**
   * 답변 폼 데이터 변경 핸들러
   */
  onChange: (data: Partial<AnswerFormData>) => void;
  
  /**
   * 답변 폼 전체 너비 사용 여부
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * 답변 폼 제출 버튼 텍스트
   * @default '답변 등록'
   */
  submitButtonText?: string;
  
  /**
   * 답변 폼 취소 버튼 텍스트
   * @default '취소'
   */
  cancelButtonText?: string;
  
  /**
   * 답변 폼 제출 버튼 로딩 상태
   * @default false
   */
  isSubmitting?: boolean;
  
  /**
   * 답변 폼 제출 버튼 비활성화 상태
   * @default false
   */
  isSubmitDisabled?: boolean;
  
  /**
   * 답변 폼 취소 버튼 비활성화 상태
   * @default false
   */
  isCancelDisabled?: boolean;
  
  /**
   * 답변 폼 내용 필드 최대 길이
   * @default 5000
   */
  maxContentLength?: number;
  
  /**
   * 답변 폼 이미지 최대 개수
   * @default 5
   */
  maxImages?: number;
  
  /**
   * 답변 폼 첨부파일 최대 개수
   * @default 3
   */
  maxAttachments?: number;
  
  /**
   * 답변 폼 첨부파일 최대 크기 (MB)
   * @default 10
   */
  maxAttachmentSize?: number;
  
  /**
   * 답변 폼 카테고리 옵션들
   */
  categoryOptions?: { value: string; label: string }[];
  
  /**
   * 답변 폼 우선순위 옵션들
   */
  priorityOptions?: { value: string; label: string }[];
  
  /**
   * 답변 폼 위치 옵션들
   */
  locationOptions?: { value: string; label: string }[];
  
  /**
   * 답변 폼 내용 필드 표시 여부
   * @default true
   */
  showContentField?: boolean;
  
  /**
   * 답변 폼 카테고리 필드 표시 여부
   * @default true
   */
  showCategoryField?: boolean;
  
  /**
   * 답변 폼 우선순위 필드 표시 여부
   * @default true
   */
  showPriorityField?: boolean;
  
  /**
   * 답변 폼 위치 필드 표시 여부
   * @default true
   */
  showLocationField?: boolean;
  
  /**
   * 답변 폼 이미지 필드 표시 여부
   * @default true
   */
  showImageField?: boolean;
  
  /**
   * 답변 폼 첨부파일 필드 표시 여부
   * @default true
   */
  showAttachmentField?: boolean;
  
  /**
   * 답변 폼 공개 여부 필드 표시 여부
   * @default true
   */
  showPublicField?: boolean;
  
  /**
   * 답변 폼 알림 여부 필드 표시 여부
   * @default true
   */
  showNotificationField?: boolean;
  
  /**
   * 답변 폼 댓글 허용 여부 필드 표시 여부
   * @default true
   */
  showCommentField?: boolean;
  
  /**
   * 답변 폼 익명 여부 필드 표시 여부
   * @default true
   */
  showAnonymousField?: boolean;
}

/**
 * AnswerForm 컴포넌트
 * 
 * @param props - AnswerForm 컴포넌트 props
 * @returns JSX.Element
 */
const AnswerForm = React.forwardRef<HTMLFormElement, AnswerFormProps>(
  (
    {
      className,
      data,
      errors = {},
      onSubmit,
      onCancel,
      onChange,
      fullWidth = false,
      submitButtonText = '답변 등록',
      cancelButtonText = '취소',
      isSubmitting = false,
      isSubmitDisabled = false,
      isCancelDisabled = false,
      maxContentLength = 5000,
      maxImages = 5,
      maxAttachments = 3,
      maxAttachmentSize = 10,
      categoryOptions = [
        { value: 'travel', label: '여행' },
        { value: 'food', label: '음식' },
        { value: 'accommodation', label: '숙박' },
        { value: 'transportation', label: '교통' },
        { value: 'shopping', label: '쇼핑' },
        { value: 'entertainment', label: '엔터테인먼트' },
        { value: 'culture', label: '문화' },
        { value: 'nature', label: '자연' },
        { value: 'sports', label: '스포츠' },
        { value: 'health', label: '건강' },
        { value: 'education', label: '교육' },
        { value: 'business', label: '비즈니스' },
        { value: 'technology', label: '기술' },
        { value: 'lifestyle', label: '라이프스타일' },
        { value: 'other', label: '기타' },
      ],
      priorityOptions = [
        { value: 'low', label: '낮음' },
        { value: 'normal', label: '보통' },
        { value: 'high', label: '높음' },
        { value: 'urgent', label: '긴급' },
      ],
      locationOptions = [
        { value: 'jeju', label: '제주도' },
        { value: 'seoul', label: '서울' },
        { value: 'busan', label: '부산' },
        { value: 'daegu', label: '대구' },
        { value: 'incheon', label: '인천' },
        { value: 'gwangju', label: '광주' },
        { value: 'daejeon', label: '대전' },
        { value: 'ulsan', label: '울산' },
        { value: 'sejong', label: '세종' },
        { value: 'gyeonggi', label: '경기도' },
        { value: 'gangwon', label: '강원도' },
        { value: 'chungbuk', label: '충청북도' },
        { value: 'chungnam', label: '충청남도' },
        { value: 'jeonbuk', label: '전라북도' },
        { value: 'jeonnam', label: '전라남도' },
        { value: 'gyeongbuk', label: '경상북도' },
        { value: 'gyeongnam', label: '경상남도' },
        { value: 'other', label: '기타' },
      ],
      showContentField = true,
      showCategoryField = true,
      showPriorityField = true,
      showLocationField = true,
      showImageField = true,
      showAttachmentField = true,
      showPublicField = true,
      showNotificationField = true,
      showCommentField = true,
      showAnonymousField = true,
      size,
      variant,
      ...props
    },
    ref
  ) => {
    // 폼 제출 핸들러
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(data);
    };
    
    // 폼 취소 핸들러
    const handleCancel = () => {
      onCancel();
    };
    
    // 폼 데이터 변경 핸들러
    const handleChange = (field: keyof AnswerFormData, value: any) => {
      onChange({ [field]: value });
    };
    
    // 이미지 추가 핸들러
    const handleAddImage = (image: string) => {
      if (image.trim() && data.images && data.images.length < maxImages) {
        const newImages = [...(data.images || []), image.trim()];
        handleChange('images', newImages);
      }
    };
    
    // 이미지 제거 핸들러
    const handleRemoveImage = (index: number) => {
      if (data.images) {
        const newImages = data.images.filter((_, i) => i !== index);
        handleChange('images', newImages);
      }
    };
    
    // 첨부파일 추가 핸들러
    const handleAddAttachment = (attachment: { name: string; url: string; size: number; type: string }) => {
      if (data.attachments && data.attachments.length < maxAttachments && attachment.size <= maxAttachmentSize * 1024 * 1024) {
        const newAttachments = [...(data.attachments || []), attachment];
        handleChange('attachments', newAttachments);
      }
    };
    
    // 첨부파일 제거 핸들러
    const handleRemoveAttachment = (index: number) => {
      if (data.attachments) {
        const newAttachments = data.attachments.filter((_, i) => i !== index);
        handleChange('attachments', newAttachments);
      }
    };
    
    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn(
          answerFormVariants({
            size,
            variant,
            className,
          }),
          fullWidth && 'w-full'
        )}
        {...props}
      >
        {/* 답변 내용 */}
        {showContentField && (
          <div className="mb-4">
            <Label htmlFor="content" className="mb-2 block">
              답변 내용 *
            </Label>
            <Textarea
              id="content"
              value={data.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="답변 내용을 입력하세요"
              maxLength={maxContentLength}
              rows={8}
              className={cn(errors.content && 'border-error-500')}
            />
            {errors.content && (
              <Text as="p" size="sm" className="mt-1 text-error-500">
                {errors.content}
              </Text>
            )}
            <Text as="p" size="xs" className="mt-1 text-muted-foreground">
              {data.content.length}/{maxContentLength}자
            </Text>
          </div>
        )}
        
        {/* 답변 카테고리 */}
        {showCategoryField && (
          <div className="mb-4">
            <Label htmlFor="category" className="mb-2 block">
              답변 카테고리 *
            </Label>
            <Select
              id="category"
              value={data.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={cn(errors.category && 'border-error-500')}
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {errors.category && (
              <Text as="p" size="sm" className="mt-1 text-error-500">
                {errors.category}
              </Text>
            )}
          </div>
        )}
        
        {/* 답변 우선순위 */}
        {showPriorityField && (
          <div className="mb-4">
            <Label className="mb-2 block">
              답변 우선순위 *
            </Label>
            <RadioGroup
              value={data.priority}
              onValueChange={(value) => handleChange('priority', value)}
              className="flex flex-wrap gap-4"
            >
              {priorityOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {errors.priority && (
              <Text as="p" size="sm" className="mt-1 text-error-500">
                {errors.priority}
              </Text>
            )}
          </div>
        )}
        
        {/* 답변 위치 */}
        {showLocationField && (
          <div className="mb-4">
            <Label htmlFor="location" className="mb-2 block">
              답변 위치
            </Label>
            <Select
              id="location"
              value={data.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              className={cn(errors.location && 'border-error-500')}
            >
              <option value="">위치를 선택하세요</option>
              {locationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {errors.location && (
              <Text as="p" size="sm" className="mt-1 text-error-500">
                {errors.location}
              </Text>
            )}
          </div>
        )}
        
        {/* 답변 이미지 */}
        {showImageField && (
          <div className="mb-4">
            <Label htmlFor="images" className="mb-2 block">
              답변 이미지
            </Label>
            <Input
              id="images"
              type="url"
              placeholder="이미지 URL을 입력하세요"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImage(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className={cn(errors.images && 'border-error-500')}
            />
            {errors.images && (
              <Text as="p" size="sm" className="mt-1 text-error-500">
                {errors.images}
              </Text>
            )}
            <Text as="p" size="xs" className="mt-1 text-muted-foreground">
              최대 {maxImages}개
            </Text>
            {data.images && data.images.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {data.images.map((image, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-1 text-sm text-secondary-700"
                  >
                    <span className="truncate max-w-32">{image}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="text-secondary-500 hover:text-secondary-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* 답변 첨부파일 */}
        {showAttachmentField && (
          <div className="mb-4">
            <Label htmlFor="attachments" className="mb-2 block">
              답변 첨부파일
            </Label>
            <Input
              id="attachments"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach((file) => {
                  if (file.size <= maxAttachmentSize * 1024 * 1024) {
                    handleAddAttachment({
                      name: file.name,
                      url: URL.createObjectURL(file),
                      size: file.size,
                      type: file.type,
                    });
                  }
                });
              }}
              className={cn(errors.attachments && 'border-error-500')}
            />
            {errors.attachments && (
              <Text as="p" size="sm" className="mt-1 text-error-500">
                {errors.attachments}
              </Text>
            )}
            <Text as="p" size="xs" className="mt-1 text-muted-foreground">
              최대 {maxAttachments}개, 각 파일은 {maxAttachmentSize}MB 이하
            </Text>
            {data.attachments && data.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {data.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-1 text-sm text-secondary-700"
                  >
                    <span className="truncate max-w-32">{attachment.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-secondary-500 hover:text-secondary-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* 답변 공개 여부 */}
        {showPublicField && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={data.isPublic}
                onCheckedChange={(checked) => handleChange('isPublic', checked)}
              />
              <Label htmlFor="isPublic">답변을 공개합니다</Label>
            </div>
            {errors.isPublic && (
              <Text as="p" size="sm" className="mt-1 text-error-500">
                {errors.isPublic}
              </Text>
            )}
          </div>
        )}
        
        {/* 답변 알림 여부 */}
        {showNotificationField && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableNotifications"
                checked={data.enableNotifications}
                onCheckedChange={(checked) => handleChange('enableNotifications', checked)}
              />
              <Label htmlFor="enableNotifications">댓글 알림을 받습니다</Label>
            </div>
            {errors.enableNotifications && (
              <Text as="p" size="sm" className="mt-1 text-error-500">
                {errors.enableNotifications}
              </Text>
            )}
          </div>
        )}
        
        {/* 답변 댓글 허용 여부 */}
        {showCommentField && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowComments"
                checked={data.allowComments}
                onCheckedChange={(checked) => handleChange('allowComments', checked)}
              />
              <Label htmlFor="allowComments">댓글을 허용합니다</Label>
            </div>
            {errors.allowComments && (
              <Text as="p" size="sm" className="mt-1 text-error-500">
                {errors.allowComments}
              </Text>
            )}
          </div>
        )}
        
        {/* 답변 익명 여부 */}
        {showAnonymousField && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAnonymous"
                checked={data.isAnonymous}
                onCheckedChange={(checked) => handleChange('isAnonymous', checked)}
              />
              <Label htmlFor="isAnonymous">익명으로 답변합니다</Label>
            </div>
            {errors.isAnonymous && (
              <Text as="p" size="sm" className="mt-1 text-error-500">
                {errors.isAnonymous}
              </Text>
            )}
          </div>
        )}
        
        {/* 폼 액션 버튼들 */}
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || isSubmitDisabled}
            className="flex-1"
          >
            {isSubmitting ? '등록 중...' : submitButtonText}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isCancelDisabled}
            className="flex-1"
          >
            {cancelButtonText}
          </Button>
        </div>
      </form>
    );
  }
);

AnswerForm.displayName = 'AnswerForm';

export { AnswerForm, answerFormVariants };
