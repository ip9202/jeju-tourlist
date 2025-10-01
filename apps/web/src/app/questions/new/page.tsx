"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Heading, Text } from "@jeju-tourlist/ui";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

interface FormErrors {
  title?: string;
  content?: string;
  file?: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
}

export default function NewQuestionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [validation, setValidation] = useState<{
    title: string;
    content: string;
  }>({ title: "", content: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    hashtags: "",
    file: null as File | null,
  });

  // 카테고리 목록 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("[DEBUG] 카테고리 로드 실패:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // 제목 검증
    if (!formData.title.trim()) {
      newErrors.title = "제목을 입력해주세요";
    } else if (formData.title.trim().length < 5) {
      newErrors.title = "제목을 5자 이상 입력해주세요";
    }

    // 내용 검증
    if (!formData.content.trim()) {
      newErrors.content = "답변을 입력해주세요";
    } else if (formData.content.trim().length < 10) {
      newErrors.content = "내용을 10자 이상 입력해주세요";
    }

    // 파일 크기 검증
    if (formData.file && formData.file.size > 5 * 1024 * 1024) {
      newErrors.file = "파일 크기는 5MB를 초과할 수 없습니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 실시간 검증
    if (field === "title") {
      const newValidation = { ...validation };
      if (value.length > 0 && value.length < 5) {
        newValidation.title = "제목을 5자 이상 입력해주세요";
      } else {
        newValidation.title = "";
      }
      setValidation(newValidation);
    }

    if (field === "content") {
      const newValidation = { ...validation };
      if (value.length > 0 && value.length < 10) {
        newValidation.content = "내용을 10자 이상 입력해주세요";
      } else {
        newValidation.content = "";
      }
      setValidation(newValidation);
    }

    // 에러 상태 초기화
    if (field === "title" || field === "content") {
      const newErrors = { ...errors };
      delete newErrors[field as keyof FormErrors];
      setErrors(newErrors);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));

    if (file && file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        file: "파일 크기는 5MB를 초과할 수 없습니다",
      }));
    } else {
      setErrors(prev => ({ ...prev, file: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("[DEBUG] handleSubmit 시작");
    console.log("[DEBUG] isSubmitting:", isSubmitting);

    if (isSubmitting) {
      console.log("[DEBUG] 이미 제출 중 - 무시");
      e.preventDefault();
      return; // 이미 제출 중이면 무시
    }

    if (!validateForm()) {
      console.log("[DEBUG] 유효성 검사 실패");
      return;
    }

    setIsSubmitting(true);
    console.log("[DEBUG] 제출 시작");

    try {
      // 파일 업로드 처리
      let attachments: string[] = [];
      if (formData.file) {
        console.log("[DEBUG] 파일 업로드 시작:", formData.file.name);
        const fileFormData = new FormData();
        fileFormData.append("file", formData.file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: fileFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          attachments = [uploadResult.data.url];
          console.log("[DEBUG] 파일 업로드 성공:", uploadResult.data.url);
        } else {
          console.error("[DEBUG] 파일 업로드 실패");
          throw new Error("파일 업로드에 실패했습니다.");
        }
      }

      // API 호출을 위한 데이터 준비
      const requestData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId || null,
        tags: formData.hashtags
          ? formData.hashtags
              .split(",")
              .map(tag => tag.trim())
              .filter(tag => tag)
          : [],
        attachments,
        authorId: "temp-user-id", // 임시 사용자 ID (인증 구현 전)
      };

      console.log("[DEBUG] 요청 데이터:", requestData);
      console.log("[DEBUG] API URL: /api/questions");

      // API 호출 (Next.js rewrites를 통해 프록시됨)
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("[DEBUG] 응답 상태:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[DEBUG] 에러 응답:", errorData);
        throw new Error(errorData.message || "질문 작성에 실패했습니다.");
      }

      const result = await response.json();
      console.log("[DEBUG] 질문 작성 성공:", result);

      // 성공 시 질문 상세 페이지로 이동
      alert("질문이 저장되었습니다!");
      router.push(`/questions/${result.data.id}`);
    } catch (error) {
      console.error("[DEBUG] 질문 작성 실패:", error);
      setErrors(prev => ({
        ...prev,
        content:
          error instanceof Error
            ? error.message
            : "질문 작성 중 오류가 발생했습니다.",
      }));
      alert(
        `에러 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    } finally {
      setIsSubmitting(false);
      console.log("[DEBUG] handleSubmit 종료");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/questions"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            질문 목록으로 돌아가기
          </Link>
          <Heading level={1} className="text-3xl font-bold text-gray-900">
            새로운 질문 작성
          </Heading>
          <Text className="text-gray-600 mt-2">
            제주 여행에 대한 질문을 작성해주세요.
          </Text>
        </div>

        {/* 질문 작성 폼 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 입력 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                질문 제목 *
              </label>
              <Input
                id="title"
                data-testid="question-title"
                value={formData.title}
                onChange={e => handleInputChange("title", e.target.value)}
                placeholder="질문 제목을 입력해주세요"
                className={`w-full ${errors.title ? "border-red-500" : ""}`}
                disabled={isSubmitting}
              />
              {errors.title && (
                <div
                  className="mt-2 flex items-center text-red-600"
                  data-testid="title-error"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">{errors.title}</span>
                </div>
              )}
              {validation.title && (
                <div
                  className="mt-2 flex items-center text-orange-600"
                  data-testid="title-validation"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">{validation.title}</span>
                </div>
              )}
              {formData.title.length > 0 &&
                !errors.title &&
                !validation.title && (
                  <div className="mt-2 flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">제목이 적절합니다</span>
                  </div>
                )}
            </div>

            {/* 내용 입력 */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                질문 내용 *
              </label>
              <Textarea
                id="content"
                data-testid="question-content"
                value={formData.content}
                onChange={e => handleInputChange("content", e.target.value)}
                placeholder="질문 내용을 자세히 입력해주세요"
                rows={8}
                className={`w-full ${errors.content ? "border-red-500" : ""}`}
                disabled={isSubmitting}
              />
              {errors.content && (
                <div
                  className="mt-2 flex items-center text-red-600"
                  data-testid="content-error"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">{errors.content}</span>
                </div>
              )}
              {validation.content && (
                <div
                  className="mt-2 flex items-center text-orange-600"
                  data-testid="content-validation"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">{validation.content}</span>
                </div>
              )}
            </div>

            {/* 카테고리 선택 */}
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                카테고리
              </label>
              {isLoadingCategories ? (
                <div className="px-3 py-2 text-gray-500">
                  카테고리 로딩 중...
                </div>
              ) : (
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={e =>
                    handleInputChange("categoryId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                >
                  <option value="">카테고리 선택 (선택사항)</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                      {category.description ? ` - ${category.description}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* 해시태그 입력 */}
            <div>
              <label
                htmlFor="hashtags"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                해시태그
              </label>
              <Input
                id="hashtags"
                value={formData.hashtags}
                onChange={e => handleInputChange("hashtags", e.target.value)}
                placeholder="#제주여행 #가족여행 (쉼표로 구분)"
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            {/* 파일 업로드 */}
            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                첨부 파일 (선택사항)
              </label>
              <input
                type="file"
                id="file"
                data-testid="file-upload"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              />
              {errors.file && (
                <div
                  className="mt-2 flex items-center text-red-600"
                  data-testid="file-error"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">{errors.file}</span>
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="default"
                data-testid="submit-question"
                disabled={isSubmitting}
                className="min-w-[120px] bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {isSubmitting ? "작성 중..." : "질문 작성"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
