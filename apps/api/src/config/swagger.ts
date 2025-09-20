import swaggerJsdoc from "swagger-jsdoc";
import { SwaggerOptions } from "swagger-ui-express";

/**
 * Swagger 설정
 *
 * @description
 * - API 문서화를 위한 Swagger/OpenAPI 설정
 * - JSDoc 주석을 기반으로 자동 문서 생성
 * - SOLID 원칙 중 SRP(단일 책임 원칙) 준수
 */

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "동네물어봐 API",
      version: "1.0.0",
      description: "제주 여행 Q&A 커뮤니티 API 문서",
      contact: {
        name: "동네물어봐 개발팀",
        email: "dev@dongnemuleoboa.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "개발 서버",
      },
      {
        url: "https://api.dongnemuleoboa.com",
        description: "프로덕션 서버",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "요청 성공 여부",
            },
            data: {
              type: "object",
              description: "응답 데이터",
            },
            error: {
              type: "string",
              description: "에러 메시지",
            },
            message: {
              type: "string",
              description: "응답 메시지",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "응답 시간",
            },
          },
        },
        PaginatedResponse: {
          allOf: [
            { $ref: "#/components/schemas/ApiResponse" },
            {
              type: "object",
              properties: {
                pagination: {
                  type: "object",
                  properties: {
                    page: {
                      type: "integer",
                      description: "현재 페이지",
                    },
                    limit: {
                      type: "integer",
                      description: "페이지당 항목 수",
                    },
                    total: {
                      type: "integer",
                      description: "전체 항목 수",
                    },
                    totalPages: {
                      type: "integer",
                      description: "전체 페이지 수",
                    },
                    hasNext: {
                      type: "boolean",
                      description: "다음 페이지 존재 여부",
                    },
                    hasPrev: {
                      type: "boolean",
                      description: "이전 페이지 존재 여부",
                    },
                  },
                },
              },
            },
          ],
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "사용자 ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "이메일",
            },
            name: {
              type: "string",
              description: "이름",
            },
            nickname: {
              type: "string",
              description: "닉네임",
            },
            avatar: {
              type: "string",
              format: "uri",
              description: "프로필 이미지 URL",
            },
            role: {
              type: "string",
              enum: ["user", "admin", "moderator"],
              description: "사용자 역할",
            },
            isActive: {
              type: "boolean",
              description: "활성 상태",
            },
            points: {
              type: "integer",
              description: "포인트",
            },
            level: {
              type: "integer",
              description: "레벨",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
            },
          },
        },
        Question: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "질문 ID",
            },
            title: {
              type: "string",
              description: "질문 제목",
            },
            content: {
              type: "string",
              description: "질문 내용",
            },
            authorId: {
              type: "string",
              description: "작성자 ID",
            },
            author: {
              $ref: "#/components/schemas/User",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
              },
              description: "태그 목록",
            },
            location: {
              type: "string",
              description: "위치",
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "CLOSED", "DELETED", "HIDDEN"],
              description: "질문 상태",
            },
            isResolved: {
              type: "boolean",
              description: "해결 여부",
            },
            isPinned: {
              type: "boolean",
              description: "고정 여부",
            },
            viewCount: {
              type: "integer",
              description: "조회수",
            },
            likeCount: {
              type: "integer",
              description: "좋아요 수",
            },
            answerCount: {
              type: "integer",
              description: "답변 수",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
            },
            resolvedAt: {
              type: "string",
              format: "date-time",
              description: "해결일",
            },
          },
        },
        Answer: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "답변 ID",
            },
            content: {
              type: "string",
              description: "답변 내용",
            },
            authorId: {
              type: "string",
              description: "작성자 ID",
            },
            author: {
              $ref: "#/components/schemas/User",
            },
            questionId: {
              type: "string",
              description: "질문 ID",
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "DELETED", "HIDDEN"],
              description: "답변 상태",
            },
            isAccepted: {
              type: "boolean",
              description: "채택 여부",
            },
            likeCount: {
              type: "integer",
              description: "좋아요 수",
            },
            dislikeCount: {
              type: "integer",
              description: "싫어요 수",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일",
            },
            acceptedAt: {
              type: "string",
              format: "date-time",
              description: "채택일",
            },
          },
        },
        CreateQuestion: {
          type: "object",
          required: ["title", "content"],
          properties: {
            title: {
              type: "string",
              minLength: 5,
              maxLength: 200,
              description: "질문 제목",
            },
            content: {
              type: "string",
              minLength: 10,
              maxLength: 5000,
              description: "질문 내용",
            },
            categoryId: {
              type: "string",
              description: "카테고리 ID",
            },
            tags: {
              type: "array",
              items: {
                type: "string",
                minLength: 1,
                maxLength: 30,
              },
              maxItems: 10,
              description: "태그 목록",
            },
            location: {
              type: "string",
              maxLength: 100,
              description: "위치",
            },
            latitude: {
              type: "number",
              minimum: -90,
              maximum: 90,
              description: "위도",
            },
            longitude: {
              type: "number",
              minimum: -180,
              maximum: 180,
              description: "경도",
            },
          },
        },
        CreateAnswer: {
          type: "object",
          required: ["content", "questionId"],
          properties: {
            content: {
              type: "string",
              minLength: 10,
              maxLength: 5000,
              description: "답변 내용",
            },
            questionId: {
              type: "string",
              description: "질문 ID",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              description: "에러 메시지",
            },
            message: {
              type: "string",
              description: "상세 에러 메시지",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "에러 발생 시간",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiOptions: SwaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6 }
  `,
  customSiteTitle: "동네물어봐 API 문서",
  customfavIcon: "/favicon.ico",
};
