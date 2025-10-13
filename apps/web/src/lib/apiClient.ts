/**
 * API 클라이언트
 * 간단한 fetch 래퍼
 */

import { AUTH_CONSTANTS, API_CONSTANTS } from "./constants";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY)
        : null;

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async get<T = any>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error("API GET error:", error);
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async post<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return await response.json();
    } catch (error) {
      console.error("API POST error:", error);
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async put<T = any>(path: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return await response.json();
    } catch (error) {
      console.error("API PUT error:", error);
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async delete<T = any>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      return await response.json();
    } catch (error) {
      console.error("API DELETE error:", error);
      return {
        success: false,
        message: "네트워크 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const api = new ApiClient(API_CONSTANTS.BASE_URL);
