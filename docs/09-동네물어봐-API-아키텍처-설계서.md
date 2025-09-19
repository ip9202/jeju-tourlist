# "동네물어봐" API 아키텍처 설계서

## 📋 목차
1. [API 아키텍처 개요](#-api-아키텍처-개요)
2. [RESTful API 설계](#-restful-api-설계)
3. [GraphQL 통합](#-graphql-통합)
4. [API Gateway 구성](#-api-gateway-구성)
5. [인증 및 인가 시스템](#-인증-및-인가-시스템)
6. [API 버저닝 전략](#-api-버저닝-전략)
7. [실시간 API 설계](#-실시간-api-설계)
8. [API 문서화](#-api-문서화)
9. [성능 최적화](#-성능-최적화)
10. [모니터링 및 분석](#-모니터링-및-분석)

---

## 🏗️ API 아키텍처 개요

### 설계 원칙

#### 1. API 우선 설계 (API-First Design)

```mermaid
graph TB
    subgraph "클라이언트 레이어"
        WEB[웹 애플리케이션]
        MOBILE[모바일 앱]
        ADMIN[관리자 대시보드]
        PARTNER[제휴업체 API]
    end

    subgraph "API Gateway"
        GATEWAY[Kong/AWS API Gateway]
        AUTH[인증 서비스]
        RATE[Rate Limiting]
        CACHE[응답 캐시]
        LOG[로깅 & 모니터링]
    end

    subgraph "API 서비스 레이어"
        REST[REST API v1/v2]
        GRAPHQL[GraphQL API]
        WEBSOCKET[WebSocket API]
        WEBHOOK[Webhook API]
    end

    subgraph "비즈니스 로직 레이어"
        USER_SVC[사용자 서비스]
        QA_SVC[Q&A 서비스]
        NOTIF_SVC[알림 서비스]
        SEARCH_SVC[검색 서비스]
        LOC_SVC[위치 서비스]
    end

    subgraph "데이터 레이어"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis)]
        ELASTICSEARCH[(Elasticsearch)]
    end

    WEB --> GATEWAY
    MOBILE --> GATEWAY
    ADMIN --> GATEWAY
    PARTNER --> GATEWAY

    GATEWAY --> AUTH
    GATEWAY --> RATE
    GATEWAY --> CACHE
    GATEWAY --> LOG

    GATEWAY --> REST
    GATEWAY --> GRAPHQL
    GATEWAY --> WEBSOCKET
    GATEWAY --> WEBHOOK

    REST --> USER_SVC
    REST --> QA_SVC
    GRAPHQL --> NOTIF_SVC
    WEBSOCKET --> SEARCH_SVC
    WEBHOOK --> LOC_SVC

    USER_SVC --> POSTGRES
    QA_SVC --> POSTGRES
    NOTIF_SVC --> REDIS
    SEARCH_SVC --> ELASTICSEARCH
    LOC_SVC --> POSTGRES
```

#### 2. API 설계 철학

```typescript
// API 설계 원칙
interface APIDesignPrinciples {
  consistency: {
    namingConvention: 'snake_case' | 'camelCase' | 'kebab-case';
    responseFormat: 'consistent_envelope' | 'resource_based';
    errorHandling: 'rfc7807_problem_details';
    dateFormat: 'iso8601';
  };

  restful: {
    resourceOriented: boolean;
    httpVerbsUsage: 'strict' | 'pragmatic';
    stateless: boolean;
    cacheable: boolean;
  };

  performance: {
    pagination: 'cursor_based' | 'offset_based';
    filtering: 'query_parameters' | 'request_body';
    sorting: 'multiple_fields_support';
    fieldSelection: 'sparse_fieldsets';
  };

  security: {
    authentication: 'bearer_token' | 'api_key';
    authorization: 'rbac' | 'abac';
    inputValidation: 'strict';
    outputSanitization: 'enabled';
  };

  versioning: {
    strategy: 'url_path' | 'header' | 'query_parameter';
    deprecationPolicy: 'gradual_sunset';
    backwardCompatibility: 'maintained';
  };
}

const dongneAPIDesign: APIDesignPrinciples = {
  consistency: {
    namingConvention: 'camelCase',
    responseFormat: 'consistent_envelope',
    errorHandling: 'rfc7807_problem_details',
    dateFormat: 'iso8601'
  },

  restful: {
    resourceOriented: true,
    httpVerbsUsage: 'strict',
    stateless: true,
    cacheable: true
  },

  performance: {
    pagination: 'cursor_based',
    filtering: 'query_parameters',
    sorting: 'multiple_fields_support',
    fieldSelection: 'sparse_fieldsets'
  },

  security: {
    authentication: 'bearer_token',
    authorization: 'rbac',
    inputValidation: 'strict',
    outputSanitization: 'enabled'
  },

  versioning: {
    strategy: 'url_path',
    deprecationPolicy: 'gradual_sunset',
    backwardCompatibility: 'maintained'
  }
};
```

---

## 🔗 RESTful API 설계

### 리소스 모델링

#### 1. 핵심 리소스 정의

```typescript
// API 리소스 스키마
interface APIResource {
  name: string;
  path: string;
  methods: HTTPMethod[];
  relationships: ResourceRelationship[];
  filters: FilterOption[];
  sorting: SortOption[];
  pagination: PaginationConfig;
}

const apiResources: APIResource[] = [
  {
    name: 'users',
    path: '/api/v1/users',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    relationships: [
      { name: 'questions', type: 'one-to-many' },
      { name: 'answers', type: 'one-to-many' },
      { name: 'badges', type: 'one-to-many' }
    ],
    filters: ['regionCode', 'isLocalVerified', 'verificationLevel'],
    sorting: ['createdAt', 'lastActiveAt', 'pointBalance'],
    pagination: { type: 'cursor', defaultSize: 20, maxSize: 100 }
  },

  {
    name: 'questions',
    path: '/api/v1/questions',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    relationships: [
      { name: 'user', type: 'many-to-one' },
      { name: 'answers', type: 'one-to-many' },
      { name: 'hashtags', type: 'many-to-many' }
    ],
    filters: ['regionCode', 'category', 'status', 'urgency', 'hashtags'],
    sorting: ['createdAt', 'popularity', 'answerCount', 'viewCount'],
    pagination: { type: 'cursor', defaultSize: 20, maxSize: 50 }
  },

  {
    name: 'answers',
    path: '/api/v1/answers',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    relationships: [
      { name: 'question', type: 'many-to-one' },
      { name: 'user', type: 'many-to-one' }
    ],
    filters: ['questionId', 'userId', 'isAccepted'],
    sorting: ['createdAt', 'likeCount', 'qualityScore'],
    pagination: { type: 'cursor', defaultSize: 10, maxSize: 50 }
  }
];
```

#### 2. API 엔드포인트 명세

```yaml
# OpenAPI 3.0 스펙 (주요 엔드포인트)
openapi: 3.0.3
info:
  title: 동네물어봐 API
  description: 제주도 지역 기반 Q&A 커뮤니티 API
  version: 1.0.0
  contact:
    name: API Support
    email: api@dongnemuleoboa.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.dongnemuleoboa.com/v1
    description: Production server
  - url: https://staging-api.dongnemuleoboa.com/v1
    description: Staging server

paths:
  /auth/login:
    post:
      summary: 사용자 로그인
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                  example: user@example.com
                password:
                  type: string
                  format: password
                  minLength: 8
              required: [email, password]
      responses:
        '200':
          description: 로그인 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '422':
          $ref: '#/components/responses/ValidationError'

  /auth/social/{provider}:
    post:
      summary: 소셜 로그인
      tags: [Authentication]
      parameters:
        - name: provider
          in: path
          required: true
          schema:
            type: string
            enum: [kakao, naver, google]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                accessToken:
                  type: string
                  description: 소셜 제공업체의 액세스 토큰
              required: [accessToken]
      responses:
        '200':
          description: 소셜 로그인 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'

  /users:
    get:
      summary: 사용자 목록 조회
      tags: [Users]
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/Cursor'
        - $ref: '#/components/parameters/Limit'
        - name: regionCode
          in: query
          schema:
            type: string
          description: 지역 코드 필터
        - name: isLocalVerified
          in: query
          schema:
            type: boolean
          description: 현지인 인증 여부
      responses:
        '200':
          description: 사용자 목록
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedUsers'

    post:
      summary: 새 사용자 등록
      tags: [Users]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: 사용자 생성 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /users/{userId}:
    get:
      summary: 사용자 상세 조회
      tags: [Users]
      security:
        - bearerAuth: []
      parameters:
        - name: userId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: 사용자 정보
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          $ref: '#/components/responses/NotFound'

  /questions:
    get:
      summary: 질문 목록 조회
      tags: [Questions]
      parameters:
        - $ref: '#/components/parameters/Cursor'
        - $ref: '#/components/parameters/Limit'
        - name: regionCode
          in: query
          schema:
            type: string
          description: 지역 코드 필터
        - name: category
          in: query
          schema:
            type: string
          description: 카테고리 필터
        - name: hashtags
          in: query
          schema:
            type: array
            items:
              type: string
          style: form
          explode: false
          description: 해시태그 필터 (쉼표 구분)
        - name: status
          in: query
          schema:
            type: string
            enum: [open, answered, closed]
            default: open
        - name: sort
          in: query
          schema:
            type: string
            enum: [newest, oldest, popularity, mostAnswers, urgent]
            default: newest
        - name: location
          in: query
          schema:
            type: string
          description: "위도,경도,반경(km) 형식 (예: 33.4996,126.5312,5)"
      responses:
        '200':
          description: 질문 목록
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedQuestions'

    post:
      summary: 새 질문 등록
      tags: [Questions]
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateQuestionRequest'
      responses:
        '201':
          description: 질문 생성 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Question'

  /questions/{questionId}/answers:
    get:
      summary: 질문의 답변 목록 조회
      tags: [Answers]
      parameters:
        - name: questionId
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - $ref: '#/components/parameters/Cursor'
        - $ref: '#/components/parameters/Limit'
        - name: sort
          in: query
          schema:
            type: string
            enum: [newest, oldest, mostLiked, accepted]
            default: newest
      responses:
        '200':
          description: 답변 목록
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PaginatedAnswers'

    post:
      summary: 답변 등록
      tags: [Answers]
      security:
        - bearerAuth: []
      parameters:
        - name: questionId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateAnswerRequest'
      responses:
        '201':
          description: 답변 생성 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Answer'

  /search:
    get:
      summary: 통합 검색
      tags: [Search]
      parameters:
        - name: q
          in: query
          required: true
          schema:
            type: string
            minLength: 2
          description: 검색 키워드
        - name: type
          in: query
          schema:
            type: string
            enum: [all, questions, users, hashtags]
            default: all
        - name: regionCode
          in: query
          schema:
            type: string
        - name: category
          in: query
          schema:
            type: string
        - $ref: '#/components/parameters/Cursor'
        - $ref: '#/components/parameters/Limit'
      responses:
        '200':
          description: 검색 결과
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SearchResults'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  parameters:
    Cursor:
      name: cursor
      in: query
      schema:
        type: string
      description: 페이지네이션 커서

    Limit:
      name: limit
      in: query
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20
      description: 페이지 크기

  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        nickname:
          type: string
          minLength: 2
          maxLength: 20
        regionCode:
          type: string
        isLocalVerified:
          type: boolean
        verificationLevel:
          type: integer
          minimum: 0
          maximum: 3
        pointBalance:
          type: integer
          minimum: 0
        profileImageUrl:
          type: string
          format: uri
          nullable: true
        bio:
          type: string
          maxLength: 500
          nullable: true
        stats:
          type: object
          properties:
            questionCount:
              type: integer
            answerCount:
              type: integer
            acceptedAnswerCount:
              type: integer
        badges:
          type: array
          items:
            $ref: '#/components/schemas/Badge'
        createdAt:
          type: string
          format: date-time
        lastActiveAt:
          type: string
          format: date-time

    Question:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
          minLength: 10
          maxLength: 200
        content:
          type: string
          minLength: 20
          maxLength: 2000
        hashtags:
          type: array
          items:
            type: string
          maxItems: 5
        regionCode:
          type: string
        category:
          type: string
        urgency:
          type: string
          enum: [normal, urgent, emergency]
        status:
          type: string
          enum: [open, answered, closed, hidden]
        location:
          $ref: '#/components/schemas/GeoPoint'
        images:
          type: array
          items:
            type: string
            format: uri
          maxItems: 5
        user:
          $ref: '#/components/schemas/UserSummary'
        stats:
          type: object
          properties:
            viewCount:
              type: integer
            likeCount:
              type: integer
            answerCount:
              type: integer
        acceptedAnswer:
          $ref: '#/components/schemas/AnswerSummary'
          nullable: true
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Answer:
      type: object
      properties:
        id:
          type: string
          format: uuid
        questionId:
          type: string
          format: uuid
        content:
          type: string
          minLength: 10
          maxLength: 1000
        images:
          type: array
          items:
            type: string
            format: uri
          maxItems: 3
        isAccepted:
          type: boolean
        likeCount:
          type: integer
        qualityScore:
          type: number
          minimum: 0
          maximum: 1
        user:
          $ref: '#/components/schemas/UserSummary'
        createdAt:
          type: string
          format: date-time
        acceptedAt:
          type: string
          format: date-time
          nullable: true

    GeoPoint:
      type: object
      properties:
        lat:
          type: number
          minimum: -90
          maximum: 90
        lng:
          type: number
          minimum: -180
          maximum: 180
      required: [lat, lng]

    PaginatedQuestions:
      allOf:
        - $ref: '#/components/schemas/PaginationMeta'
        - type: object
          properties:
            data:
              type: array
              items:
                $ref: '#/components/schemas/Question'

    ErrorResponse:
      type: object
      properties:
        type:
          type: string
          format: uri
        title:
          type: string
        status:
          type: integer
        detail:
          type: string
        instance:
          type: string
        errors:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              code:
                type: string
              message:
                type: string

  responses:
    Unauthorized:
      description: 인증 실패
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            type: "https://api.dongnemuleoboa.com/errors/unauthorized"
            title: "Unauthorized"
            status: 401
            detail: "Authentication credentials were not provided or are invalid"

    ValidationError:
      description: 입력 데이터 검증 실패
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            type: "https://api.dongnemuleoboa.com/errors/validation"
            title: "Validation Error"
            status: 422
            detail: "The request contains invalid parameters"
            errors:
              - field: "email"
                code: "format"
                message: "Invalid email format"
```

#### 3. 실제 API 구현

```typescript
// Express.js 라우터 구현
import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { QuestionController } from '../controllers/QuestionController';

const router = express.Router();

// 질문 목록 조회
router.get('/questions',
  // Rate limiting: 분당 60회
  rateLimit({ max: 60, windowMs: 60 * 1000 }),

  // 입력 검증
  [
    query('cursor').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('regionCode').optional().isString().matches(/^[A-Z]{2}-[0-9]{2}(-[0-9]{2})?$/),
    query('category').optional().isString().isIn(['맛집', '카페', '숙소', '액티비티', '교통']),
    query('hashtags').optional().isString(),
    query('status').optional().isIn(['open', 'answered', 'closed']),
    query('sort').optional().isIn(['newest', 'oldest', 'popularity', 'mostAnswers', 'urgent']),
    query('location').optional().matches(/^-?\d+\.?\d*,-?\d+\.?\d*,\d+$/)
  ],

  // 검증 오류 처리
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        type: 'https://api.dongnemuleoboa.com/errors/validation',
        title: 'Validation Error',
        status: 422,
        detail: 'The request contains invalid parameters',
        errors: errors.array()
      });
    }
    next();
  },

  QuestionController.getQuestions
);

// 새 질문 등록
router.post('/questions',
  // 인증 필수
  authenticate,

  // Rate limiting: 시간당 10회
  rateLimit({ max: 10, windowMs: 60 * 60 * 1000 }),

  // 입력 검증
  [
    body('title')
      .isString()
      .isLength({ min: 10, max: 200 })
      .withMessage('제목은 10-200자 사이여야 합니다'),

    body('content')
      .isString()
      .isLength({ min: 20, max: 2000 })
      .withMessage('내용은 20-2000자 사이여야 합니다'),

    body('hashtags')
      .optional()
      .isArray({ max: 5 })
      .withMessage('해시태그는 최대 5개까지 가능합니다'),

    body('regionCode')
      .isString()
      .matches(/^[A-Z]{2}-[0-9]{2}(-[0-9]{2})?$/)
      .withMessage('올바른 지역 코드 형식이 아닙니다'),

    body('category')
      .isString()
      .isIn(['맛집', '카페', '숙소', '액티비티', '교통'])
      .withMessage('올바른 카테고리를 선택해주세요'),

    body('urgency')
      .optional()
      .isIn(['normal', 'urgent', 'emergency'])
      .withMessage('올바른 긴급도를 선택해주세요'),

    body('location')
      .optional()
      .isObject()
      .custom((value) => {
        if (typeof value.lat !== 'number' || typeof value.lng !== 'number') {
          throw new Error('위치 정보는 lat, lng 숫자 값이 필요합니다');
        }
        if (value.lat < -90 || value.lat > 90) {
          throw new Error('위도는 -90~90 사이 값이어야 합니다');
        }
        if (value.lng < -180 || value.lng > 180) {
          throw new Error('경도는 -180~180 사이 값이어야 합니다');
        }
        return true;
      }),

    body('images')
      .optional()
      .isArray({ max: 5 })
      .withMessage('이미지는 최대 5개까지 업로드 가능합니다')
  ],

  QuestionController.createQuestion
);

// 질문 상세 조회
router.get('/questions/:questionId',
  // 파라미터 검증
  param('questionId').isUUID().withMessage('올바른 질문 ID 형식이 아닙니다'),

  QuestionController.getQuestionDetail
);

// 질문 수정
router.put('/questions/:questionId',
  authenticate,

  // 권한 확인 (작성자 또는 관리자만)
  authorize(['owner', 'admin']),

  param('questionId').isUUID(),

  [
    body('title').optional().isLength({ min: 10, max: 200 }),
    body('content').optional().isLength({ min: 20, max: 2000 }),
    body('hashtags').optional().isArray({ max: 5 }),
    body('category').optional().isIn(['맛집', '카페', '숙소', '액티비티', '교통'])
  ],

  QuestionController.updateQuestion
);

// 질문 삭제
router.delete('/questions/:questionId',
  authenticate,
  authorize(['owner', 'admin']),
  param('questionId').isUUID(),
  QuestionController.deleteQuestion
);

export default router;
```

```typescript
// QuestionController 구현
export class QuestionController {
  static async getQuestions(req: Request, res: Response): Promise<void> {
    try {
      const {
        cursor,
        limit = 20,
        regionCode,
        category,
        hashtags,
        status = 'open',
        sort = 'newest',
        location
      } = req.query;

      // 해시태그 파싱
      const hashtagArray = hashtags ?
        (hashtags as string).split(',').map(tag => tag.trim()) :
        undefined;

      // 위치 파싱
      let locationFilter;
      if (location) {
        const [lat, lng, radius] = (location as string).split(',').map(Number);
        locationFilter = { lat, lng, radius };
      }

      const questions = await QuestionService.getQuestions({
        cursor,
        limit: Number(limit),
        regionCode: regionCode as string,
        category: category as string,
        hashtags: hashtagArray,
        status: status as QuestionStatus,
        sort: sort as SortOption,
        location: locationFilter
      });

      res.json({
        data: questions.items,
        meta: {
          hasNext: questions.hasNext,
          nextCursor: questions.nextCursor,
          total: questions.total
        }
      });

    } catch (error) {
      console.error('Get questions error:', error);
      res.status(500).json({
        type: 'https://api.dongnemuleoboa.com/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred'
      });
    }
  }

  static async createQuestion(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const questionData = req.body;

      // 해시태그 정규화
      if (questionData.hashtags) {
        questionData.hashtags = questionData.hashtags.map((tag: string) =>
          tag.startsWith('#') ? tag.slice(1) : tag
        );
      }

      // 스팸 검사
      const isSpam = await SpamDetectionService.checkContent(
        questionData.title + ' ' + questionData.content
      );

      if (isSpam) {
        return res.status(422).json({
          type: 'https://api.dongnemuleoboa.com/errors/spam',
          title: 'Spam Detected',
          status: 422,
          detail: 'The content appears to be spam'
        });
      }

      const question = await QuestionService.createQuestion({
        ...questionData,
        userId
      });

      // 실시간 알림 발송
      await NotificationService.notifyNewQuestion(question);

      res.status(201).json(question);

    } catch (error) {
      console.error('Create question error:', error);
      res.status(500).json({
        type: 'https://api.dongnemuleoboa.com/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Failed to create question'
      });
    }
  }

  static async getQuestionDetail(req: Request, res: Response): Promise<void> {
    try {
      const { questionId } = req.params;
      const userId = req.user?.id;

      const question = await QuestionService.getQuestionById(questionId, {
        includeAnswers: true,
        includeUserStats: true,
        viewerId: userId
      });

      if (!question) {
        return res.status(404).json({
          type: 'https://api.dongnemuleoboa.com/errors/not-found',
          title: 'Question Not Found',
          status: 404,
          detail: `Question with ID ${questionId} was not found`
        });
      }

      // 조회수 증가 (비동기)
      if (userId !== question.user.id) {
        QuestionService.incrementViewCount(questionId, userId).catch(
          error => console.error('Failed to increment view count:', error)
        );
      }

      res.json(question);

    } catch (error) {
      console.error('Get question detail error:', error);
      res.status(500).json({
        type: 'https://api.dongnemuleoboa.com/errors/internal',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Failed to retrieve question'
      });
    }
  }
}
```

---

## 🔗 GraphQL 통합

### GraphQL 스키마 설계

#### 1. 타입 정의

```graphql
# GraphQL 스키마 정의
scalar DateTime
scalar Upload
scalar JSON

type Query {
  # 사용자 쿼리
  me: User
  user(id: ID!): User
  users(
    filter: UserFilter
    sort: UserSort
    pagination: PaginationInput
  ): UserConnection!

  # 질문 쿼리
  question(id: ID!): Question
  questions(
    filter: QuestionFilter
    sort: QuestionSort
    pagination: PaginationInput
  ): QuestionConnection!

  # 검색 쿼리
  search(
    query: String!
    type: SearchType = ALL
    filter: SearchFilter
    pagination: PaginationInput
  ): SearchResult!

  # 통계 쿼리
  regionStats(regionCode: String!): RegionStats!
  trendingHashtags(timeRange: String = "24h"): [TrendingHashtag!]!
}

type Mutation {
  # 인증 관련
  login(input: LoginInput!): AuthPayload!
  socialLogin(input: SocialLoginInput!): AuthPayload!
  logout: Boolean!
  refreshToken(refreshToken: String!): AuthPayload!

  # 사용자 관리
  updateProfile(input: UpdateProfileInput!): User!
  uploadProfileImage(file: Upload!): String!
  verifyLocalResident(input: LocalVerificationInput!): VerificationResult!

  # 질문 관리
  createQuestion(input: CreateQuestionInput!): Question!
  updateQuestion(id: ID!, input: UpdateQuestionInput!): Question!
  deleteQuestion(id: ID!): Boolean!
  likeQuestion(id: ID!): Question!
  unlikeQuestion(id: ID!): Question!

  # 답변 관리
  createAnswer(input: CreateAnswerInput!): Answer!
  updateAnswer(id: ID!, input: UpdateAnswerInput!): Answer!
  deleteAnswer(id: ID!): Boolean!
  acceptAnswer(id: ID!): Answer!
  likeAnswer(id: ID!): Answer!
  unlikeAnswer(id: ID!): Answer!

  # 알림 관리
  markNotificationAsRead(id: ID!): Notification!
  markAllNotificationsAsRead: Int!
}

type Subscription {
  # 실시간 알림
  notificationAdded(userId: ID!): Notification!

  # 질문 관련 실시간 업데이트
  questionUpdated(questionId: ID!): Question!
  answerAdded(questionId: ID!): Answer!
  answerAccepted(questionId: ID!): Answer!

  # 타이핑 상태
  userTyping(questionId: ID!): TypingEvent!

  # 온라인 상태
  userOnlineStatus(regionCode: String): OnlineStatusEvent!
}

# 사용자 타입
type User {
  id: ID!
  email: String!
  nickname: String!
  regionCode: String!
  isLocalVerified: Boolean!
  verificationLevel: Int!
  pointBalance: Int!
  profileImageUrl: String
  bio: String

  # 통계
  stats: UserStats!

  # 배지
  badges: [Badge!]!

  # 관계
  questions(
    filter: QuestionFilter
    sort: QuestionSort
    pagination: PaginationInput
  ): QuestionConnection!

  answers(
    filter: AnswerFilter
    sort: AnswerSort
    pagination: PaginationInput
  ): AnswerConnection!

  # 메타 정보
  createdAt: DateTime!
  lastActiveAt: DateTime!
}

type UserStats {
  questionCount: Int!
  answerCount: Int!
  acceptedAnswerCount: Int!
  totalEarnedPoints: Int!
  averageResponseTime: Float
}

# 질문 타입
type Question {
  id: ID!
  title: String!
  content: String!
  hashtags: [String!]!
  regionCode: String!
  category: String!
  urgency: QuestionUrgency!
  status: QuestionStatus!

  # 위치 정보
  location: GeoPoint
  locationDescription: String

  # 미디어
  images: [String!]!

  # 관계
  user: User!
  answers(
    sort: AnswerSort
    pagination: PaginationInput
  ): AnswerConnection!
  acceptedAnswer: Answer

  # 상호작용
  stats: QuestionStats!
  isLikedByViewer: Boolean

  # 메타 정보
  createdAt: DateTime!
  updatedAt: DateTime!
}

type QuestionStats {
  viewCount: Int!
  likeCount: Int!
  answerCount: Int!
  popularityScore: Float!
}

# 답변 타입
type Answer {
  id: ID!
  content: String!
  images: [String!]!
  isAccepted: Boolean!
  qualityScore: Float!

  # 관계
  question: Question!
  user: User!

  # 상호작용
  likeCount: Int!
  isLikedByViewer: Boolean

  # 메타 정보
  createdAt: DateTime!
  acceptedAt: DateTime
}

# 입력 타입들
input CreateQuestionInput {
  title: String!
  content: String!
  hashtags: [String!]
  regionCode: String!
  category: String!
  urgency: QuestionUrgency = NORMAL
  location: GeoPointInput
  locationDescription: String
  images: [Upload!]
}

input QuestionFilter {
  regionCode: String
  category: String
  status: QuestionStatus
  urgency: QuestionUrgency
  hashtags: [String!]
  userId: ID
  hasAnswers: Boolean
  isAccepted: Boolean
  dateRange: DateRangeInput
  location: LocationFilterInput
}

input LocationFilterInput {
  center: GeoPointInput!
  radius: Float! # 킬로미터
}

input GeoPointInput {
  lat: Float!
  lng: Float!
}

type GeoPoint {
  lat: Float!
  lng: Float!
}

# 페이지네이션
input PaginationInput {
  first: Int
  after: String
  last: Int
  before: String
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type QuestionConnection {
  edges: [QuestionEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type QuestionEdge {
  node: Question!
  cursor: String!
}

# 열거형
enum QuestionUrgency {
  NORMAL
  URGENT
  EMERGENCY
}

enum QuestionStatus {
  OPEN
  ANSWERED
  CLOSED
  HIDDEN
}

enum SearchType {
  ALL
  QUESTIONS
  USERS
  HASHTAGS
}
```

#### 2. GraphQL 리졸버 구현

```typescript
// GraphQL 리졸버 구현
import { IResolvers } from '@graphql-tools/utils';
import { Context } from '../types/context';
import { QuestionService } from '../services/QuestionService';
import { UserService } from '../services/UserService';
import { SearchService } from '../services/SearchService';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

export const resolvers: IResolvers<any, Context> = {
  Query: {
    // 현재 사용자 조회
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return UserService.getUserById(context.user.id);
    },

    // 질문 목록 조회
    questions: async (parent, { filter, sort, pagination }, context) => {
      const options = {
        filter: filter || {},
        sort: sort || { field: 'CREATED_AT', direction: 'DESC' },
        pagination: pagination || { first: 20 }
      };

      const result = await QuestionService.getQuestions(options);

      return {
        edges: result.items.map((question, index) => ({
          node: question,
          cursor: Buffer.from(`${question.createdAt}_${question.id}`).toString('base64')
        })),
        pageInfo: {
          hasNextPage: result.hasNext,
          hasPreviousPage: false, // 간단한 구현
          startCursor: result.items.length > 0 ?
            Buffer.from(`${result.items[0].createdAt}_${result.items[0].id}`).toString('base64') :
            null,
          endCursor: result.items.length > 0 ?
            Buffer.from(`${result.items[result.items.length - 1].createdAt}_${result.items[result.items.length - 1].id}`).toString('base64') :
            null
        },
        totalCount: result.total
      };
    },

    // 통합 검색
    search: async (parent, { query, type, filter, pagination }, context) => {
      const searchOptions = {
        query,
        type: type || 'ALL',
        filter: filter || {},
        pagination: pagination || { first: 20 }
      };

      return SearchService.search(searchOptions);
    },

    // 트렌딩 해시태그
    trendingHashtags: async (parent, { timeRange }, context) => {
      return SearchService.getTrendingHashtags(timeRange);
    }
  },

  Mutation: {
    // 질문 생성
    createQuestion: async (parent, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      // 입력 검증
      if (input.title.length < 10 || input.title.length > 200) {
        throw new Error('제목은 10-200자 사이여야 합니다');
      }

      if (input.content.length < 20 || input.content.length > 2000) {
        throw new Error('내용은 20-2000자 사이여야 합니다');
      }

      // 사용자 권한 확인 (일일 질문 제한 등)
      const dailyQuestionCount = await QuestionService.getDailyQuestionCount(context.user.id);
      if (dailyQuestionCount >= 10) {
        throw new ForbiddenError('일일 질문 등록 한도를 초과했습니다');
      }

      // 이미지 업로드 처리
      let imageUrls: string[] = [];
      if (input.images && input.images.length > 0) {
        imageUrls = await Promise.all(
          input.images.map(async (upload) => {
            const { createReadStream, filename, mimetype } = await upload;
            return ImageUploadService.uploadImage(createReadStream(), filename, mimetype);
          })
        );
      }

      const questionData = {
        ...input,
        userId: context.user.id,
        images: imageUrls
      };

      const question = await QuestionService.createQuestion(questionData);

      // 실시간 알림 발송 (비동기)
      NotificationService.notifyNewQuestion(question).catch(
        error => console.error('Failed to send notifications:', error)
      );

      return question;
    },

    // 답변 채택
    acceptAnswer: async (parent, { id }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const answer = await AnswerService.getAnswerById(id);
      if (!answer) {
        throw new Error('답변을 찾을 수 없습니다');
      }

      const question = await QuestionService.getQuestionById(answer.questionId);
      if (question.userId !== context.user.id) {
        throw new ForbiddenError('질문 작성자만 답변을 채택할 수 있습니다');
      }

      if (question.acceptedAnswerId) {
        throw new Error('이미 채택된 답변이 있습니다');
      }

      const acceptedAnswer = await AnswerService.acceptAnswer(id);

      // 포인트 지급 및 알림 (비동기)
      Promise.all([
        PointService.awardAcceptedAnswerPoints(answer.userId, id),
        NotificationService.notifyAnswerAccepted(answer.userId, id)
      ]).catch(error => console.error('Failed to process answer acceptance:', error));

      return acceptedAnswer;
    }
  },

  Subscription: {
    // 실시간 알림 구독
    notificationAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['NOTIFICATION_ADDED']),
        (payload, variables) => {
          return payload.notificationAdded.userId === variables.userId;
        }
      )
    },

    // 새 답변 구독
    answerAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['ANSWER_ADDED']),
        (payload, variables) => {
          return payload.answerAdded.questionId === variables.questionId;
        }
      )
    },

    // 타이핑 상태 구독
    userTyping: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(['USER_TYPING']),
        (payload, variables) => {
          return payload.userTyping.questionId === variables.questionId;
        }
      )
    }
  },

  // 필드 리졸버
  Question: {
    user: async (parent) => {
      return UserService.getUserById(parent.userId);
    },

    answers: async (parent, { sort, pagination }) => {
      const options = {
        questionId: parent.id,
        sort: sort || { field: 'CREATED_AT', direction: 'DESC' },
        pagination: pagination || { first: 10 }
      };

      const result = await AnswerService.getAnswers(options);

      return {
        edges: result.items.map(answer => ({
          node: answer,
          cursor: Buffer.from(`${answer.createdAt}_${answer.id}`).toString('base64')
        })),
        pageInfo: {
          hasNextPage: result.hasNext,
          hasPreviousPage: false,
          startCursor: result.items[0] ?
            Buffer.from(`${result.items[0].createdAt}_${result.items[0].id}`).toString('base64') :
            null,
          endCursor: result.items[result.items.length - 1] ?
            Buffer.from(`${result.items[result.items.length - 1].createdAt}_${result.items[result.items.length - 1].id}`).toString('base64') :
            null
        },
        totalCount: result.total
      };
    },

    acceptedAnswer: async (parent) => {
      if (!parent.acceptedAnswerId) return null;
      return AnswerService.getAnswerById(parent.acceptedAnswerId);
    },

    isLikedByViewer: async (parent, args, context) => {
      if (!context.user) return false;
      return QuestionService.isLikedByUser(parent.id, context.user.id);
    }
  },

  User: {
    stats: async (parent) => {
      return UserService.getUserStats(parent.id);
    },

    badges: async (parent) => {
      return BadgeService.getUserBadges(parent.id);
    },

    questions: async (parent, { filter, sort, pagination }) => {
      const options = {
        filter: { ...filter, userId: parent.id },
        sort: sort || { field: 'CREATED_AT', direction: 'DESC' },
        pagination: pagination || { first: 20 }
      };

      const result = await QuestionService.getQuestions(options);

      return {
        edges: result.items.map(question => ({
          node: question,
          cursor: Buffer.from(`${question.createdAt}_${question.id}`).toString('base64')
        })),
        pageInfo: {
          hasNextPage: result.hasNext,
          hasPreviousPage: false,
          startCursor: result.items[0] ?
            Buffer.from(`${result.items[0].createdAt}_${result.items[0].id}`).toString('base64') :
            null,
          endCursor: result.items[result.items.length - 1] ?
            Buffer.from(`${result.items[result.items.length - 1].createdAt}_${result.items[result.items.length - 1].id}`).toString('base64') :
            null
        },
        totalCount: result.total
      };
    }
  }
};

// Context 생성 함수
export const createContext = async ({ req, connection }: { req?: any; connection?: any }): Promise<Context> => {
  if (connection) {
    // WebSocket 연결 (Subscription)
    return {
      user: connection.context.user,
      isAuthenticated: !!connection.context.user
    };
  }

  // HTTP 요청
  let user = null;
  const authorization = req.headers.authorization;

  if (authorization) {
    try {
      const token = authorization.replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      user = await UserService.getUserById(decoded.userId);
    } catch (error) {
      // 토큰이 유효하지 않은 경우 무시
    }
  }

  return {
    user,
    isAuthenticated: !!user,
    req
  };
};
```

---

## 🚪 API Gateway 구성

### Kong Gateway 설정

#### 1. 서비스 및 라우트 구성

```yaml
# Kong Gateway 설정
services:
  - name: dongne-api-v1
    url: http://api-service:3000
    plugins:
      - name: cors
        config:
          origins:
            - https://dongnemuleoboa.com
            - https://admin.dongnemuleoboa.com
            - https://staging.dongnemuleoboa.com
          methods:
            - GET
            - POST
            - PUT
            - DELETE
            - OPTIONS
          headers:
            - Accept
            - Accept-Version
            - Content-Length
            - Content-MD5
            - Content-Type
            - Date
            - Authorization
          exposed_headers:
            - X-RateLimit-Limit
            - X-RateLimit-Remaining
            - X-RateLimit-Reset
          credentials: true
          max_age: 3600

      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
          day: 10000
          policy: redis
          redis_host: redis-cluster
          redis_port: 6379
          redis_password: "${REDIS_PASSWORD}"

      - name: request-transformer
        config:
          add:
            headers:
              - "X-Request-ID:$(uuid)"
              - "X-Forwarded-For:$(remote_addr)"
          remove:
            headers:
              - "X-Internal-Secret"

      - name: response-transformer
        config:
          add:
            headers:
              - "X-API-Version:v1"
              - "X-Response-Time:$(upstream_response_time)"
          remove:
            headers:
              - "X-Internal-Info"

      - name: prometheus
        config:
          per_consumer: true

routes:
  # 인증 관련 라우트
  - name: auth-routes
    service: dongne-api-v1
    paths:
      - /api/v1/auth
    methods:
      - GET
      - POST
    plugins:
      - name: rate-limiting
        config:
          minute: 10  # 인증은 더 엄격한 제한
          hour: 100

  # 공개 API 라우트
  - name: public-routes
    service: dongne-api-v1
    paths:
      - /api/v1/questions
      - /api/v1/search
      - /api/v1/regions
      - /api/v1/hashtags
    methods:
      - GET
    plugins:
      - name: rate-limiting
        config:
          minute: 200  # 공개 API는 더 관대한 제한
          hour: 2000

  # 인증 필요 라우트
  - name: authenticated-routes
    service: dongne-api-v1
    paths:
      - /api/v1/users
      - /api/v1/notifications
      - /api/v1/profile
    methods:
      - GET
      - POST
      - PUT
      - DELETE
    plugins:
      - name: jwt
        config:
          secret_is_base64: false
          key_claim_name: kid
          claims_to_verify:
            - exp
            - iat

  # GraphQL 라우트
  - name: graphql-route
    service: dongne-api-v1
    paths:
      - /api/v1/graphql
    methods:
      - POST
      - GET
    plugins:
      - name: rate-limiting
        config:
          minute: 50
          hour: 500
      - name: request-size-limiting
        config:
          allowed_payload_size: 1  # 1MB

  # WebSocket 라우트
  - name: websocket-route
    service: dongne-api-v1
    paths:
      - /api/v1/ws
    protocols:
      - ws
      - wss

# 플러그인 설정
plugins:
  # 글로벌 로깅
  - name: file-log
    config:
      path: /var/log/kong/access.log
      reopen: true

  # 보안 헤더
  - name: response-transformer
    config:
      add:
        headers:
          - "X-Content-Type-Options:nosniff"
          - "X-Frame-Options:DENY"
          - "X-XSS-Protection:1; mode=block"
          - "Strict-Transport-Security:max-age=31536000; includeSubDomains"

  # IP 제한 (선택적)
  - name: ip-restriction
    config:
      allow:
        - 0.0.0.0/0  # 모든 IP 허용 (필요시 제한)
      deny: []

consumers:
  # 일반 사용자
  - username: web-client
    custom_id: web-client
    plugins:
      - name: rate-limiting
        config:
          minute: 60
          hour: 600

  # 모바일 앱
  - username: mobile-client
    custom_id: mobile-client
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000

  # 관리자 대시보드
  - username: admin-client
    custom_id: admin-client
    plugins:
      - name: rate-limiting
        config:
          minute: 200
          hour: 2000

  # 제휴업체 API
  - username: partner-api
    custom_id: partner-api
    plugins:
      - name: rate-limiting
        config:
          minute: 500
          hour: 5000
      - name: key-auth
        config:
          key_names:
            - apikey
```

#### 2. 커스텀 플러그인 구현

```lua
-- Kong 커스텀 플러그인: 지역별 Rate Limiting
local RegionalRateLimitHandler = {}

RegionalRateLimitHandler.PRIORITY = 900
RegionalRateLimitHandler.VERSION = "1.0.0"

local redis = require "resty.redis"
local cjson = require "cjson"

function RegionalRateLimitHandler:access(conf)
  local red = redis:new()
  red:set_timeouts(1000, 1000, 1000)

  local ok, err = red:connect(conf.redis_host, conf.redis_port)
  if not ok then
    kong.log.err("failed to connect to redis: ", err)
    return
  end

  if conf.redis_password then
    red:auth(conf.redis_password)
  end

  -- 지역 코드 추출
  local region_code = kong.request.get_query_arg("regionCode") or "default"
  local client_ip = kong.client.get_ip()
  local current_time = ngx.now()
  local window_size = conf.window_size or 60 -- 1분

  -- Redis 키 생성
  local redis_key = string.format("rate_limit:%s:%s:%d",
    region_code,
    client_ip,
    math.floor(current_time / window_size)
  )

  -- 현재 요청 수 조회
  local current_requests = red:get(redis_key) or 0
  current_requests = tonumber(current_requests)

  -- 지역별 제한 설정
  local limit = conf.default_limit
  if conf.regional_limits and conf.regional_limits[region_code] then
    limit = conf.regional_limits[region_code]
  end

  -- Rate limit 체크
  if current_requests >= limit then
    kong.response.exit(429, {
      message = "Too Many Requests",
      region = region_code,
      limit = limit,
      reset_time = (math.floor(current_time / window_size) + 1) * window_size
    })
  end

  -- 요청 수 증가
  red:incr(redis_key)
  red:expire(redis_key, window_size)

  -- 헤더 추가
  kong.response.set_header("X-RateLimit-Limit-" .. region_code, limit)
  kong.response.set_header("X-RateLimit-Remaining-" .. region_code, limit - current_requests - 1)
  kong.response.set_header("X-RateLimit-Reset-" .. region_code, (math.floor(current_time / window_size) + 1) * window_size)

  red:close()
end

return RegionalRateLimitHandler
```

### API Gateway 모니터링

```typescript
// API Gateway 메트릭 수집
export class APIGatewayMetrics {
  private prometheus: PrometheusRegistry;
  private metrics: GatewayMetrics;

  constructor() {
    this.prometheus = new PrometheusRegistry();
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.metrics = {
      requestTotal: new Counter({
        name: 'api_requests_total',
        help: 'Total number of API requests',
        labelNames: ['method', 'route', 'status', 'version', 'client_type'],
        registers: [this.prometheus]
      }),

      requestDuration: new Histogram({
        name: 'api_request_duration_seconds',
        help: 'Duration of API requests in seconds',
        labelNames: ['method', 'route', 'status', 'version'],
        buckets: [0.1, 0.5, 1, 2, 5, 10],
        registers: [this.prometheus]
      }),

      activeConnections: new Gauge({
        name: 'api_active_connections',
        help: 'Number of active connections',
        labelNames: ['service'],
        registers: [this.prometheus]
      }),

      rateLimitHits: new Counter({
        name: 'api_rate_limit_hits_total',
        help: 'Number of rate limit hits',
        labelNames: ['route', 'client_ip', 'region'],
        registers: [this.prometheus]
      }),

      errorRate: new Gauge({
        name: 'api_error_rate',
        help: 'API error rate percentage',
        labelNames: ['service', 'version'],
        registers: [this.prometheus]
      })
    };
  }

  recordRequest(
    method: string,
    route: string,
    status: number,
    duration: number,
    version: string = 'v1',
    clientType: string = 'unknown'
  ): void {
    this.metrics.requestTotal
      .labels(method, route, status.toString(), version, clientType)
      .inc();

    this.metrics.requestDuration
      .labels(method, route, status.toString(), version)
      .observe(duration);
  }

  recordRateLimitHit(route: string, clientIp: string, region: string): void {
    this.metrics.rateLimitHits
      .labels(route, clientIp, region)
      .inc();
  }

  updateActiveConnections(service: string, count: number): void {
    this.metrics.activeConnections
      .labels(service)
      .set(count);
  }

  async getMetrics(): Promise<string> {
    return this.prometheus.metrics();
  }

  // 실시간 대시보드 데이터
  async getDashboardData(): Promise<DashboardData> {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    return {
      requests: {
        total: await this.getRequestCount(oneHourAgo, now),
        rate: await this.getRequestRate(oneHourAgo, now),
        byStatus: await this.getRequestsByStatus(oneHourAgo, now)
      },
      performance: {
        averageResponseTime: await this.getAverageResponseTime(oneHourAgo, now),
        p95ResponseTime: await this.getPercentileResponseTime(oneHourAgo, now, 95),
        errorRate: await this.getErrorRate(oneHourAgo, now)
      },
      rateLimiting: {
        hits: await this.getRateLimitHits(oneHourAgo, now),
        topClients: await this.getTopRateLimitedClients(oneHourAgo, now)
      },
      regional: {
        requestsByRegion: await this.getRequestsByRegion(oneHourAgo, now),
        popularEndpoints: await this.getPopularEndpoints(oneHourAgo, now)
      }
    };
  }

  private async getRequestCount(from: number, to: number): Promise<number> {
    // Prometheus 쿼리 또는 내부 카운터 조회
    return 0; // 구현 필요
  }

  private async getRequestRate(from: number, to: number): Promise<number> {
    const count = await this.getRequestCount(from, to);
    const duration = (to - from) / 1000; // 초
    return count / duration;
  }
}

// API Gateway 헬스 체크
export class APIGatewayHealthCheck {
  private healthChecks: Map<string, HealthCheck> = new Map();

  constructor() {
    this.initializeHealthChecks();
  }

  private initializeHealthChecks(): void {
    // 백엔드 서비스 헬스 체크
    this.healthChecks.set('user-service', {
      name: 'user-service',
      url: 'http://user-service:3000/health',
      timeout: 5000,
      interval: 30000,
      retries: 3,
      status: 'unknown'
    });

    this.healthChecks.set('qa-service', {
      name: 'qa-service',
      url: 'http://qa-service:3000/health',
      timeout: 5000,
      interval: 30000,
      retries: 3,
      status: 'unknown'
    });

    // 의존성 서비스 헬스 체크
    this.healthChecks.set('postgresql', {
      name: 'postgresql',
      url: 'postgresql://user:pass@postgres:5432/dbname',
      timeout: 3000,
      interval: 60000,
      retries: 2,
      status: 'unknown'
    });

    this.healthChecks.set('redis', {
      name: 'redis',
      url: 'redis://redis:6379',
      timeout: 3000,
      interval: 30000,
      retries: 2,
      status: 'unknown'
    });

    // 정기적인 헬스 체크 시작
    this.startHealthChecks();
  }

  private startHealthChecks(): void {
    for (const [name, check] of this.healthChecks) {
      setInterval(async () => {
        await this.performHealthCheck(name);
      }, check.interval);

      // 초기 헬스 체크
      this.performHealthCheck(name);
    }
  }

  private async performHealthCheck(serviceName: string): Promise<void> {
    const check = this.healthChecks.get(serviceName);
    if (!check) return;

    let attempts = 0;
    let isHealthy = false;

    while (attempts < check.retries && !isHealthy) {
      try {
        const startTime = Date.now();

        if (check.url.startsWith('http')) {
          const response = await fetch(check.url, {
            method: 'GET',
            timeout: check.timeout,
            headers: {
              'User-Agent': 'APIGateway-HealthCheck/1.0'
            }
          });

          isHealthy = response.ok;
        } else if (check.url.startsWith('postgresql')) {
          // PostgreSQL 연결 테스트
          isHealthy = await this.testPostgreSQLConnection(check.url);
        } else if (check.url.startsWith('redis')) {
          // Redis 연결 테스트
          isHealthy = await this.testRedisConnection(check.url);
        }

        const responseTime = Date.now() - startTime;

        check.status = isHealthy ? 'healthy' : 'unhealthy';
        check.lastCheck = new Date();
        check.responseTime = responseTime;

        if (isHealthy) {
          check.consecutiveFailures = 0;
        } else {
          check.consecutiveFailures = (check.consecutiveFailures || 0) + 1;
        }

      } catch (error) {
        check.status = 'unhealthy';
        check.lastError = error.message;
        check.consecutiveFailures = (check.consecutiveFailures || 0) + 1;
      }

      attempts++;
      if (!isHealthy && attempts < check.retries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 서비스가 계속 실패하면 알림
    if (check.consecutiveFailures >= 3) {
      await this.sendHealthCheckAlert(serviceName, check);
    }
  }

  async getOverallHealth(): Promise<OverallHealth> {
    const services = Array.from(this.healthChecks.values());
    const healthyServices = services.filter(s => s.status === 'healthy').length;
    const totalServices = services.length;

    return {
      status: healthyServices === totalServices ? 'healthy' :
              healthyServices > totalServices / 2 ? 'degraded' : 'unhealthy',
      services: services.map(service => ({
        name: service.name,
        status: service.status,
        responseTime: service.responseTime,
        lastCheck: service.lastCheck,
        consecutiveFailures: service.consecutiveFailures
      })),
      timestamp: new Date()
    };
  }

  private async sendHealthCheckAlert(
    serviceName: string,
    check: HealthCheck
  ): Promise<void> {
    const alertData = {
      service: serviceName,
      status: check.status,
      consecutiveFailures: check.consecutiveFailures,
      lastError: check.lastError,
      timestamp: new Date()
    };

    // 슬랙, 이메일 등으로 알림 발송
    console.error(`Health check alert for ${serviceName}:`, alertData);
  }
}
```

---

## 🔐 인증 및 인가 시스템

### JWT 기반 인증

#### 1. 토큰 관리 시스템

```typescript
// JWT 토큰 매니저
export class JWTTokenManager {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry: string = '15m';
  private refreshTokenExpiry: string = '7d';

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET!;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;

    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT secrets must be provided');
    }
  }

  // 액세스 토큰 생성
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        nickname: payload.nickname,
        regionCode: payload.regionCode,
        roles: payload.roles || ['user'],
        permissions: payload.permissions || [],
        verificationLevel: payload.verificationLevel || 0,
        type: 'access'
      },
      this.accessTokenSecret,
      {
        expiresIn: this.accessTokenExpiry,
        issuer: 'dongnemuleoboa.com',
        audience: 'dongnemuleoboa-api',
        subject: payload.userId,
        jwtid: this.generateJTI()
      }
    );
  }

  // 리프레시 토큰 생성
  generateRefreshToken(userId: string): string {
    return jwt.sign(
      {
        userId,
        type: 'refresh',
        tokenFamily: this.generateTokenFamily()
      },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'dongnemuleoboa.com',
        audience: 'dongnemuleoboa-api',
        subject: userId,
        jwtid: this.generateJTI()
      }
    );
  }

  // 토큰 검증
  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'dongnemuleoboa.com',
        audience: 'dongnemuleoboa-api'
      }) as any;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
        nickname: decoded.nickname,
        regionCode: decoded.regionCode,
        roles: decoded.roles,
        permissions: decoded.permissions,
        verificationLevel: decoded.verificationLevel,
        jti: decoded.jti,
        exp: decoded.exp,
        iat: decoded.iat
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid token');
      }
      throw error;
    }
  }

  // 리프레시 토큰 검증
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'dongnemuleoboa.com',
        audience: 'dongnemuleoboa-api'
      }) as any;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return {
        userId: decoded.userId,
        tokenFamily: decoded.tokenFamily,
        jti: decoded.jti,
        exp: decoded.exp,
        iat: decoded.iat
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw error;
    }
  }

  // 토큰 갱신
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    // 리프레시 토큰 검증
    const refreshPayload = this.verifyRefreshToken(refreshToken);

    // 토큰 재사용 공격 방지 (Token Family 체크)
    const isValidFamily = await this.validateTokenFamily(
      refreshPayload.userId,
      refreshPayload.tokenFamily
    );

    if (!isValidFamily) {
      // 토큰 재사용 감지 - 모든 리프레시 토큰 무효화
      await this.revokeAllUserTokens(refreshPayload.userId);
      throw new AuthenticationError('Token reuse detected');
    }

    // 사용자 정보 조회
    const user = await UserService.getUserById(refreshPayload.userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // 기존 토큰 무효화
    await this.revokeRefreshToken(refreshPayload.jti);

    // 새 토큰 생성
    const newAccessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      regionCode: user.regionCode,
      roles: user.roles,
      permissions: user.permissions,
      verificationLevel: user.verificationLevel
    });

    const newRefreshToken = this.generateRefreshToken(user.id);

    // 새 리프레시 토큰 저장
    await this.storeRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.getTokenExpirySeconds(this.accessTokenExpiry)
    };
  }

  // 토큰 무효화
  async revokeRefreshToken(jti: string): Promise<void> {
    await redis.sadd('revoked_tokens', jti);
    await redis.expire('revoked_tokens', 7 * 24 * 60 * 60); // 7일
  }

  // 사용자의 모든 토큰 무효화
  async revokeAllUserTokens(userId: string): Promise<void> {
    const userTokens = await redis.smembers(`user_tokens:${userId}`);
    if (userTokens.length > 0) {
      await redis.sadd('revoked_tokens', ...userTokens);
    }
    await redis.del(`user_tokens:${userId}`);
  }

  // 토큰이 무효화되었는지 확인
  async isTokenRevoked(jti: string): Promise<boolean> {
    const result = await redis.sismember('revoked_tokens', jti);
    return result === 1;
  }

  private generateJTI(): string {
    return uuidv4();
  }

  private generateTokenFamily(): string {
    return uuidv4();
  }

  private async validateTokenFamily(
    userId: string,
    tokenFamily: string
  ): Promise<boolean> {
    const storedFamily = await redis.get(`token_family:${userId}`);
    return storedFamily === tokenFamily;
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const decoded = jwt.decode(token) as any;

    // 토큰 패밀리 저장
    await redis.set(`token_family:${userId}`, decoded.tokenFamily, 'EX', 7 * 24 * 60 * 60);

    // 사용자 토큰 목록에 추가
    await redis.sadd(`user_tokens:${userId}`, decoded.jti);
    await redis.expire(`user_tokens:${userId}`, 7 * 24 * 60 * 60);
  }

  private getTokenExpirySeconds(expiry: string): number {
    const match = expiry.match(/(\d+)([smhd])/);
    if (!match) return 900; // 기본 15분

    const [, value, unit] = match;
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return parseInt(value) * multipliers[unit as keyof typeof multipliers];
  }
}
```

#### 2. 소셜 로그인 통합

```typescript
// 소셜 로그인 서비스
export class SocialAuthService {
  private providers: Map<string, SocialProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // 카카오 로그인
    this.providers.set('kakao', {
      name: 'kakao',
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      redirectUri: process.env.KAKAO_REDIRECT_URI!,
      authUrl: 'https://kauth.kakao.com/oauth/authorize',
      tokenUrl: 'https://kauth.kakao.com/oauth/token',
      userInfoUrl: 'https://kapi.kakao.com/v2/user/me',
      scope: ['profile_nickname', 'profile_image', 'account_email']
    });

    // 네이버 로그인
    this.providers.set('naver', {
      name: 'naver',
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
      redirectUri: process.env.NAVER_REDIRECT_URI!,
      authUrl: 'https://nid.naver.com/oauth2.0/authorize',
      tokenUrl: 'https://nid.naver.com/oauth2.0/token',
      userInfoUrl: 'https://openapi.naver.com/v1/nid/me',
      scope: ['profile']
    });

    // 구글 로그인
    this.providers.set('google', {
      name: 'google',
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI!,
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scope: ['profile', 'email']
    });
  }

  // 소셜 로그인 URL 생성
  generateAuthUrl(provider: string, state?: string): string {
    const providerConfig = this.providers.get(provider);
    if (!providerConfig) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: providerConfig.clientId,
      redirect_uri: providerConfig.redirectUri,
      response_type: 'code',
      scope: providerConfig.scope.join(' '),
      state: state || this.generateState()
    });

    return `${providerConfig.authUrl}?${params.toString()}`;
  }

  // 인가 코드로 토큰 교환
  async exchangeCodeForToken(
    provider: string,
    code: string,
    state?: string
  ): Promise<SocialTokenResponse> {
    const providerConfig = this.providers.get(provider);
    if (!providerConfig) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const tokenData = {
      grant_type: 'authorization_code',
      client_id: providerConfig.clientId,
      client_secret: providerConfig.clientSecret,
      redirect_uri: providerConfig.redirectUri,
      code
    };

    try {
      const response = await fetch(providerConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(tokenData)
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokenResponse = await response.json();

      return {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expires_in,
        tokenType: tokenResponse.token_type || 'Bearer'
      };

    } catch (error) {
      console.error(`Token exchange error for ${provider}:`, error);
      throw new AuthenticationError('Failed to exchange authorization code');
    }
  }

  // 사용자 정보 조회
  async getUserInfo(
    provider: string,
    accessToken: string
  ): Promise<SocialUserInfo> {
    const providerConfig = this.providers.get(provider);
    if (!providerConfig) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    try {
      const response = await fetch(providerConfig.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`User info request failed: ${response.statusText}`);
      }

      const userData = await response.json();

      // 프로바이더별 데이터 정규화
      return this.normalizeUserInfo(provider, userData);

    } catch (error) {
      console.error(`User info request error for ${provider}:`, error);
      throw new AuthenticationError('Failed to retrieve user information');
    }
  }

  // 소셜 로그인 처리
  async handleSocialLogin(
    provider: string,
    code: string,
    state?: string
  ): Promise<AuthenticationResult> {
    // 1. 토큰 교환
    const tokenResponse = await this.exchangeCodeForToken(provider, code, state);

    // 2. 사용자 정보 조회
    const socialUserInfo = await this.getUserInfo(provider, tokenResponse.accessToken);

    // 3. 기존 계정 찾기 또는 새 계정 생성
    let user = await this.findOrCreateUser(provider, socialUserInfo);

    // 4. 소셜 계정 연동 정보 업데이트
    await this.updateSocialConnection(user.id, provider, {
      providerId: socialUserInfo.id,
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      expiresAt: tokenResponse.expiresIn ?
        new Date(Date.now() + tokenResponse.expiresIn * 1000) :
        null
    });

    // 5. JWT 토큰 생성
    const jwtTokenManager = new JWTTokenManager();
    const accessToken = jwtTokenManager.generateAccessToken({
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      regionCode: user.regionCode,
      roles: user.roles,
      permissions: user.permissions,
      verificationLevel: user.verificationLevel
    });

    const refreshToken = jwtTokenManager.generateRefreshToken(user.id);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: 900 // 15분
    };
  }

  private normalizeUserInfo(provider: string, userData: any): SocialUserInfo {
    switch (provider) {
      case 'kakao':
        return {
          id: userData.id.toString(),
          email: userData.kakao_account?.email,
          nickname: userData.properties?.nickname,
          profileImage: userData.properties?.profile_image,
          name: userData.kakao_account?.profile?.nickname,
          provider: 'kakao'
        };

      case 'naver':
        return {
          id: userData.response.id,
          email: userData.response.email,
          nickname: userData.response.nickname,
          profileImage: userData.response.profile_image,
          name: userData.response.name,
          provider: 'naver'
        };

      case 'google':
        return {
          id: userData.id,
          email: userData.email,
          nickname: userData.name,
          profileImage: userData.picture,
          name: userData.name,
          provider: 'google'
        };

      default:
        throw new Error(`Unsupported provider for normalization: ${provider}`);
    }
  }

  private async findOrCreateUser(
    provider: string,
    socialInfo: SocialUserInfo
  ): Promise<User> {
    // 1. 소셜 계정으로 기존 사용자 찾기
    let user = await UserService.findBySocialAccount(provider, socialInfo.id);

    if (user) {
      return user;
    }

    // 2. 이메일로 기존 사용자 찾기
    if (socialInfo.email) {
      user = await UserService.findByEmail(socialInfo.email);
      if (user) {
        // 기존 계정에 소셜 계정 연결
        return user;
      }
    }

    // 3. 새 사용자 생성
    const newUser = await UserService.createUser({
      email: socialInfo.email || `${provider}_${socialInfo.id}@dongnemuleoboa.com`,
      nickname: socialInfo.nickname || `${provider}_user_${socialInfo.id.slice(-8)}`,
      profileImageUrl: socialInfo.profileImage,
      regionCode: 'KR-49', // 기본값: 제주도
      socialProviders: {
        [provider]: {
          id: socialInfo.id,
          connectedAt: new Date()
        }
      },
      verificationLevel: 0,
      isLocalVerified: false
    });

    return newUser;
  }

  private async updateSocialConnection(
    userId: string,
    provider: string,
    connectionData: SocialConnectionData
  ): Promise<void> {
    await SocialConnectionService.upsertConnection({
      userId,
      provider,
      providerId: connectionData.providerId,
      accessToken: connectionData.accessToken,
      refreshToken: connectionData.refreshToken,
      expiresAt: connectionData.expiresAt,
      updatedAt: new Date()
    });
  }

  private generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
```

#### 3. 권한 관리 시스템

```typescript
// RBAC (Role-Based Access Control) 시스템
export class RBACManager {
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();

  constructor() {
    this.initializePermissions();
    this.initializeRoles();
  }

  private initializePermissions(): void {
    const permissions: Permission[] = [
      // 질문 관련 권한
      { name: 'question:read', description: '질문 조회' },
      { name: 'question:create', description: '질문 작성' },
      { name: 'question:update', description: '질문 수정' },
      { name: 'question:delete', description: '질문 삭제' },
      { name: 'question:moderate', description: '질문 관리' },

      // 답변 관련 권한
      { name: 'answer:read', description: '답변 조회' },
      { name: 'answer:create', description: '답변 작성' },
      { name: 'answer:update', description: '답변 수정' },
      { name: 'answer:delete', description: '답변 삭제' },
      { name: 'answer:accept', description: '답변 채택' },

      // 사용자 관련 권한
      { name: 'user:read', description: '사용자 정보 조회' },
      { name: 'user:update', description: '사용자 정보 수정' },
      { name: 'user:delete', description: '사용자 삭제' },
      { name: 'user:verify', description: '사용자 인증' },

      // 관리 권한
      { name: 'admin:dashboard', description: '관리자 대시보드' },
      { name: 'admin:moderate', description: '콘텐츠 관리' },
      { name: 'admin:analytics', description: '분석 조회' },
      { name: 'admin:system', description: '시스템 관리' }
    ];

    permissions.forEach(permission => {
      this.permissions.set(permission.name, permission);
    });
  }

  private initializeRoles(): void {
    const roles: Role[] = [
      {
        name: 'guest',
        description: '비회원',
        permissions: [
          'question:read',
          'answer:read'
        ]
      },
      {
        name: 'user',
        description: '일반 사용자',
        permissions: [
          'question:read',
          'question:create',
          'answer:read',
          'answer:create',
          'user:read',
          'user:update'
        ]
      },
      {
        name: 'verified_user',
        description: '인증된 사용자',
        permissions: [
          'question:read',
          'question:create',
          'question:update', // 본인 질문만
          'answer:read',
          'answer:create',
          'answer:update',   // 본인 답변만
          'answer:accept',   // 본인 질문의 답변만
          'user:read',
          'user:update'
        ]
      },
      {
        name: 'local_resident',
        description: '현지인',
        permissions: [
          'question:read',
          'question:create',
          'question:update',
          'answer:read',
          'answer:create',
          'answer:update',
          'answer:accept',
          'user:read',
          'user:update',
          'user:verify' // 다른 사용자 추천
        ]
      },
      {
        name: 'moderator',
        description: '운영진',
        permissions: [
          'question:read',
          'question:create',
          'question:update',
          'question:delete',
          'question:moderate',
          'answer:read',
          'answer:create',
          'answer:update',
          'answer:delete',
          'answer:accept',
          'user:read',
          'user:update',
          'user:verify',
          'admin:moderate'
        ]
      },
      {
        name: 'admin',
        description: '관리자',
        permissions: Array.from(this.permissions.keys()) // 모든 권한
      }
    ];

    roles.forEach(role => {
      this.roles.set(role.name, role);
    });
  }

  // 사용자 권한 확인
  hasPermission(
    userRoles: string[],
    permission: string,
    context?: PermissionContext
  ): boolean {
    // 관리자는 모든 권한 가짐
    if (userRoles.includes('admin')) {
      return true;
    }

    // 사용자의 모든 역할에서 권한 수집
    const userPermissions = new Set<string>();
    userRoles.forEach(roleName => {
      const role = this.roles.get(roleName);
      if (role) {
        role.permissions.forEach(perm => userPermissions.add(perm));
      }
    });

    // 기본 권한 확인
    if (!userPermissions.has(permission)) {
      return false;
    }

    // 컨텍스트 기반 권한 확인
    if (context) {
      return this.checkContextualPermission(permission, context, userRoles);
    }

    return true;
  }

  private checkContextualPermission(
    permission: string,
    context: PermissionContext,
    userRoles: string[]
  ): boolean {
    switch (permission) {
      case 'question:update':
      case 'question:delete':
        // 본인 질문이거나 관리자/운영진인 경우
        return context.resourceOwnerId === context.userId ||
               userRoles.some(role => ['admin', 'moderator'].includes(role));

      case 'answer:update':
      case 'answer:delete':
        // 본인 답변이거나 관리자/운영진인 경우
        return context.resourceOwnerId === context.userId ||
               userRoles.some(role => ['admin', 'moderator'].includes(role));

      case 'answer:accept':
        // 질문 작성자인 경우
        return context.questionOwnerId === context.userId;

      case 'user:verify':
        // 현지인 이상이거나 관리자/운영진인 경우
        return userRoles.some(role =>
          ['local_resident', 'moderator', 'admin'].includes(role)
        );

      default:
        return true;
    }
  }

  // 사용자 역할 업그레이드
  async upgradeUserRole(
    userId: string,
    newRole: string,
    reason: string,
    upgradedBy: string
  ): Promise<void> {
    const role = this.roles.get(newRole);
    if (!role) {
      throw new Error(`Invalid role: ${newRole}`);
    }

    await UserService.updateUserRole(userId, newRole, {
      reason,
      upgradedBy,
      upgradedAt: new Date()
    });

    // 역할 변경 로그
    await AuditLogService.log({
      action: 'role_upgrade',
      userId,
      details: {
        newRole,
        reason,
        upgradedBy
      },
      timestamp: new Date()
    });
  }

  // 권한 확인 미들웨어
  requirePermission(
    permission: string,
    options?: {
      context?: (req: Request) => PermissionContext,
      errorMessage?: string
    }
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({
          type: 'https://api.dongnemuleoboa.com/errors/unauthorized',
          title: 'Unauthorized',
          status: 401,
          detail: 'Authentication required'
        });
      }

      const context = options?.context ? options.context(req) : undefined;
      const hasPermission = this.hasPermission(
        req.user.roles,
        permission,
        context
      );

      if (!hasPermission) {
        return res.status(403).json({
          type: 'https://api.dongnemuleoboa.com/errors/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: options?.errorMessage || 'Insufficient permissions'
        });
      }

      next();
    };
  }
}

// 사용 예시
const rbac = new RBACManager();

// 라우터에서 권한 확인
router.put('/questions/:questionId',
  authenticate,
  rbac.requirePermission('question:update', {
    context: (req) => ({
      userId: req.user!.id,
      resourceOwnerId: req.question.userId // 미들웨어에서 설정
    }),
    errorMessage: '본인의 질문만 수정할 수 있습니다'
  }),
  QuestionController.updateQuestion
);
```

이 API 아키텍처 설계서는 "동네물어봐" 서비스의 안정적이고 확장 가능한 API 시스템을 구축하기 위한 포괄적인 가이드를 제공합니다. RESTful API와 GraphQL의 조합, 견고한 인증/인가 시스템, 그리고 API Gateway를 통한 중앙화된 관리로 서비스의 성장과 함께 확장할 수 있는 유연한 API 인프라를 제공합니다.