"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@jeju-tourlist/ui";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { api } from "@/lib/apiClient";
import Link from "next/link";

// 아이콘 이름을 이모지로 매핑
const getIconEmoji = (iconName: string | null): string => {
  const iconMap: Record<string, string> = {
    "map-pin": "📍",
    utensils: "🍴",
    bed: "🛏️",
    car: "🚗",
    "shopping-bag": "🛍️",
    "help-circle": "❓",
  };
  return iconName ? iconMap[iconName] || "📋" : "📋";
};

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
  const { user, isLoading } = useAuth();
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

  // 로그인 체크
  useEffect(() => {
    if (!isLoading && !user) {
      alert("로그인이 필요합니다.");
      router.push("/auth/signin");
    }
  }, [isLoading, user, router]);

  // 카테고리 목록 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:4000/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error("카테고리 로드 실패:", error);
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

    if (isSubmitting) {
      e.preventDefault();
      return; // 이미 제출 중이면 무시
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 파일 업로드 처리
      let attachments: string[] = [];
      if (formData.file) {
        const fileFormData = new FormData();
        fileFormData.append("file", formData.file);

        const uploadResponse = await fetch("http://localhost:4000/upload", {
          method: "POST",
          body: fileFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          attachments = [uploadResult.data.url];
        } else {
          throw new Error("파일 업로드에 실패했습니다.");
        }
      }

      // 로그인 체크
      if (!user?.id) {
        throw new Error("로그인이 필요합니다.");
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
        authorId: user?.id || "",
      };

      // API 호출 (api 클라이언트 사용 - 자동으로 Authorization 헤더 포함)
      const response = await api.post("/questions", requestData);

      if (!response.success) {
        throw new Error(response.error || "질문 작성에 실패했습니다.");
      }

      // 성공 시 질문 상세 페이지로 이동
      alert("질문이 저장되었습니다!");
      router.push(`/questions/${response.data.id}`);
    } catch (error) {
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 페이지 헤더 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            새로운 질문 작성하기
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            제주 여행에 대한 궁금한 점을 현지 전문가들에게 물어보세요
          </p>
          <Link
            href="/questions"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            질문 목록으로
          </Link>
        </div>

        {/* 질문 작성 폼 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* 제목 입력 */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                질문 제목 *
              </label>
              <input
                id="title"
                data-testid="question-title"
                type="text"
                value={formData.title}
                onChange={e => handleInputChange("title", e.target.value)}
                placeholder="예: 제주도에서 꼭 가봐야 할 맛집 추천해주세요!"
                className={`w-full px-4 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={isSubmitting}
              />
              {errors.title && (
                <div
                  className="mt-2 flex items-center text-red-600"
                  data-testid="title-error"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{errors.title}</span>
                </div>
              )}
              {validation.title && (
                <div
                  className="mt-2 flex items-center text-orange-600"
                  data-testid="title-validation"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{validation.title}</span>
                </div>
              )}
              {formData.title.length > 0 &&
                !errors.title &&
                !validation.title && (
                  <div className="mt-2 flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">제목이 적절합니다</span>
                  </div>
                )}
            </div>

            {/* 내용 입력 */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                질문 내용 *
              </label>
              <textarea
                id="content"
                data-testid="question-content"
                value={formData.content}
                onChange={e => handleInputChange("content", e.target.value)}
                placeholder="질문 내용을 자세히 입력해주세요. 예를 들어, 가족 여행인지, 예산은 어느 정도인지, 특별히 관심 있는 부분이 있는지 등을 포함해주시면 더 정확한 답변을 받을 수 있습니다."
                rows={8}
                className={`w-full px-4 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset resize-none ${
                  errors.content ? "border-red-500" : "border-gray-300"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={isSubmitting}
              />
              {errors.content && (
                <div
                  className="mt-2 flex items-center text-red-600"
                  data-testid="content-error"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{errors.content}</span>
                </div>
              )}
              {validation.content && (
                <div
                  className="mt-2 flex items-center text-orange-600"
                  data-testid="content-validation"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{validation.content}</span>
                </div>
              )}
            </div>

            {/* 카테고리 선택 */}
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                카테고리
              </label>
              {isLoadingCategories ? (
                <div className="px-4 py-3 text-gray-500 bg-gray-50 rounded-lg">
                  카테고리 로딩 중...
                </div>
              ) : (
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={e =>
                    handleInputChange("categoryId", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  <option value="">카테고리 선택 (선택사항)</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {getIconEmoji(category.icon)} {category.name}
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
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                해시태그
              </label>
              <input
                id="hashtags"
                type="text"
                value={formData.hashtags}
                onChange={e => handleInputChange("hashtags", e.target.value)}
                placeholder="#제주여행 #가족여행 #맛집 (쉼표로 구분)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              />
            </div>

            {/* 파일 업로드 */}
            <div>
              <label
                htmlFor="file"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                첨부 파일 (선택사항)
              </label>
              <input
                type="file"
                id="file"
                data-testid="file-upload"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              />
              {errors.file && (
                <div
                  className="mt-2 flex items-center text-red-600"
                  data-testid="file-error"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm">{errors.file}</span>
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-6 py-2"
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="default"
                data-testid="submit-question"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 min-w-[120px]"
              >
                {isSubmitting ? "작성 중..." : "질문 작성"}
              </Button>
            </div>
          </form>
        </div>

        {/* 도움말 섹션 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            💡 좋은 질문을 작성하는 팁
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                구체적으로 작성하세요
              </h4>
              <p className="text-gray-600 text-sm">
                언제, 어디서, 누구와 함께 가는지 등 구체적인 정보를 포함하면 더
                정확한 답변을 받을 수 있습니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                카테고리를 선택하세요
              </h4>
              <p className="text-gray-600 text-sm">
                관련 카테고리를 선택하면 해당 분야 전문가들이 더 빨리 답변해드릴
                수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>
            &copy; 2025 동네물어봐. 제주도 여행 정보를 전문가와 함께 공유하세요.
          </p>
        </div>
      </footer>
    </div>
  );
}
