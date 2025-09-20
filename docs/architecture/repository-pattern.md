# Repository 패턴 설계 문서

## 📋 개요

Repository 패턴은 데이터 접근 로직을 캡슐화하고 도메인 계층과 데이터 액세스 계층을 분리하는 디자인 패턴입니다.
"동네물어봐" 프로젝트에서는 SOLID 원칙을 준수하여 Repository 패턴을 구현했습니다.

## 🎯 목적

### 1. 관심사의 분리 (Separation of Concerns)

- **비즈니스 로직**과 **데이터 접근 로직**을 명확히 분리
- 도메인 모델이 데이터베이스 구현에 의존하지 않도록 함
- 테스트 가능한 코드 구조 제공

### 2. 확장성 (Extensibility)

- 다양한 데이터 소스 지원 (PostgreSQL, MongoDB, Redis 등)
- ORM 변경 시에도 비즈니스 로직 수정 불필요
- 새로운 데이터 접근 방식 추가 용이

### 3. 재사용성 (Reusability)

- 공통된 데이터 접근 패턴을 BaseRepository로 추상화
- 중복 코드 제거 및 일관된 인터페이스 제공
- 모든 엔티티에 동일한 접근 방식 적용

## 🏗️ 아키텍처 구조

```
packages/database/src/repositories/
├── base.repository.ts          # 추상 기본 Repository
├── user.repository.ts          # 사용자 Repository
├── question.repository.ts      # 질문 Repository
├── answer.repository.ts        # 답변 Repository
├── category.repository.ts      # 카테고리 Repository
└── index.ts                   # Repository Factory
```

### 계층 구조

```
┌─────────────────────────────────────┐
│           Service Layer             │ ← 비즈니스 로직
├─────────────────────────────────────┤
│         Repository Layer            │ ← 데이터 접근 추상화
├─────────────────────────────────────┤
│            ORM Layer               │ ← Prisma ORM
├─────────────────────────────────────┤
│          Database Layer            │ ← PostgreSQL
└─────────────────────────────────────┘
```

## 📐 SOLID 원칙 적용

### 1. Single Responsibility Principle (SRP)

각 Repository는 단일 엔티티의 데이터 접근만 담당합니다.

```typescript
// ✅ 좋은 예: UserRepository는 사용자 데이터만 담당
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    /* ... */
  }
  async create(data: CreateUserData): Promise<User> {
    /* ... */
  }
  // 사용자 관련 메서드만 포함
}

// ❌ 나쁜 예: 여러 엔티티 혼재
export class UserRepository {
  async findUserById(id: string): Promise<User | null> {
    /* ... */
  }
  async findQuestionById(id: string): Promise<Question | null> {
    /* ... */
  } // SRP 위반
}
```

### 2. Open/Closed Principle (OCP)

BaseRepository를 확장하여 새로운 기능을 추가할 수 있습니다.

```typescript
// BaseRepository를 확장하여 기능 추가
export class UserRepository extends BaseRepository<
  User,
  CreateUserData,
  UpdateUserData
> {
  // 기본 CRUD 기능은 BaseRepository에서 상속

  // 사용자 특화 기능 추가
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { email } });
  }
}
```

### 3. Liskov Substitution Principle (LSP)

모든 Repository는 해당 인터페이스로 완전히 치환 가능합니다.

```typescript
// 인터페이스를 통한 의존성 주입
function createUserService(userRepo: IUserRepository) {
  // UserRepository, MockUserRepository 등 어떤 구현체든 사용 가능
  return new UserService(userRepo);
}
```

### 4. Interface Segregation Principle (ISP)

클라이언트가 필요한 메서드만 의존하도록 인터페이스를 분리했습니다.

```typescript
// 기본 CRUD 인터페이스
export interface IBaseRepository<T, CreateData, UpdateData> {
  findById(id: string): Promise<T | null>;
  create(data: CreateData): Promise<T>;
  update(id: string, data: UpdateData): Promise<T>;
  delete(id: string): Promise<void>;
}

// 사용자 특화 인터페이스
export interface IUserRepository
  extends IBaseRepository<User, CreateUserData, UpdateUserData> {
  findByEmail(email: string): Promise<User | null>;
  findByProvider(provider: string, providerId: string): Promise<User | null>;
}
```

### 5. Dependency Inversion Principle (DIP)

상위 레벨 모듈이 하위 레벨 모듈에 의존하지 않고, 추상화에 의존합니다.

```typescript
// Service는 구체 클래스가 아닌 인터페이스에 의존
export class UserService {
  constructor(private userRepository: IUserRepository) {} // 추상화에 의존

  async createUser(userData: CreateUserData): Promise<User> {
    return await this.userRepository.create(userData);
  }
}
```

## 💡 주요 구현 특징

### 1. BaseRepository 추상 클래스

```typescript
export abstract class BaseRepository<T, CreateData, UpdateData, SearchOptions> {
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  // 공통 CRUD 메서드 구현
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: CreateData): Promise<T>;
  abstract update(id: string, data: UpdateData): Promise<T>;
  abstract delete(id: string): Promise<void>;

  // 공통 유틸리티 메서드
  protected handleError(error: unknown, operation: string): never {
    // 통일된 에러 처리 로직
  }

  protected paginate<U>(
    data: U[],
    total: number,
    pagination: PaginationParams
  ): PaginatedResult<U> {
    // 페이지네이션 로직
  }
}
```

### 2. Repository Factory 패턴

```typescript
export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private prisma: PrismaClient;

  public readonly userRepository: IUserRepository;
  public readonly questionRepository: IQuestionRepository;
  public readonly answerRepository: IAnswerRepository;
  public readonly categoryRepository: ICategoryRepository;

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.userRepository = new UserRepository(this.prisma);
    this.questionRepository = new QuestionRepository(this.prisma);
    this.answerRepository = new AnswerRepository(this.prisma);
    this.categoryRepository = new CategoryRepository(this.prisma);
  }

  public static getInstance(prisma: PrismaClient): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(prisma);
    }
    return RepositoryFactory.instance;
  }
}
```

## 🔧 사용 예시

### 1. 기본 사용법

```typescript
// Repository 인스턴스 생성
const userRepository = new UserRepository(prisma);

// 사용자 조회
const user = await userRepository.findById("user123");

// 사용자 생성
const newUser = await userRepository.create({
  email: "test@example.com",
  name: "홍길동",
  nickname: "길동이",
  provider: "kakao",
  providerId: "kakao123",
});

// 페이지네이션 검색
const userList = await userRepository.findManyPaginated({
  query: "홍길동",
  pagination: { page: 1, limit: 10 },
});
```

### 2. 의존성 주입

```typescript
export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async createUserWithProfile(
    userData: CreateUserData,
    profileData: CreateUserProfileData
  ): Promise<User> {
    // 트랜잭션을 사용한 복합 작업
    const user = await this.userRepository.create(userData);
    await this.userRepository.createProfile({
      ...profileData,
      userId: user.id,
    });
    return user;
  }
}

// Service 생성 시 Repository 주입
const userService = new UserService(repositoryFactory.userRepository);
```

### 3. 테스트에서의 활용

```typescript
// Mock Repository 구현
class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = {
      ...data,
      id: "mock-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // 기타 메서드 구현...
}

// 테스트에서 Mock 사용
describe("UserService", () => {
  it("should create user", async () => {
    const mockUserRepo = new MockUserRepository();
    const userService = new UserService(mockUserRepo);

    const user = await userService.createUser(testUserData);
    expect(user.email).toBe(testUserData.email);
  });
});
```

## 📊 성능 고려사항

### 1. 쿼리 최적화

```typescript
// N+1 문제 방지를 위한 include 사용
async findByIdWithDetails(id: string): Promise<QuestionDetails | null> {
  return await this.prisma.question.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, nickname: true } },
      category: { select: { id: true, name: true, color: true } },
      _count: { select: { answers: true, likes: true } }
    }
  });
}
```

### 2. 페이지네이션

```typescript
async findManyPaginated(options: UserSearchOptions): Promise<PaginatedResult<User>> {
  const { pagination = { page: 1, limit: 20 } } = options;
  const { page, limit } = pagination;

  const [data, total] = await this.prisma.$transaction([
    this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      // ... 기타 옵션
    }),
    this.prisma.user.count({ /* ... */ })
  ]);

  return this.paginate(data, total, { page, limit });
}
```

### 3. 인덱스 활용

```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  nickname String @unique

  // 검색에 자주 사용되는 필드에 인덱스 추가
  @@index([email])
  @@index([provider, providerId])
  @@index([isActive])
}
```

## 🚀 확장 가능성

### 1. 새로운 데이터 소스 추가

```typescript
// MongoDB Repository 구현 예시
export class MongoUserRepository implements IUserRepository {
  constructor(private mongoClient: MongoClient) {}

  async findById(id: string): Promise<User | null> {
    // MongoDB 구현
  }

  // 기타 메서드들도 MongoDB에 맞게 구현
}
```

### 2. 캐싱 레이어 추가

```typescript
// Decorator 패턴으로 캐싱 기능 추가
export class CachedUserRepository implements IUserRepository {
  constructor(
    private userRepository: IUserRepository,
    private cacheService: ICacheService
  ) {}

  async findById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;
    let user = await this.cacheService.get<User>(cacheKey);

    if (!user) {
      user = await this.userRepository.findById(id);
      if (user) {
        await this.cacheService.set(cacheKey, user, 300); // 5분 TTL
      }
    }

    return user;
  }
}
```

## 🧪 테스트 전략

### 1. 단위 테스트

```typescript
describe("UserRepository", () => {
  let userRepository: UserRepository;
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    userRepository = new UserRepository(prisma);
  });

  describe("findById", () => {
    it("should return user when exists", async () => {
      // Given
      const userId = "existing-user-id";

      // When
      const user = await userRepository.findById(userId);

      // Then
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
    });

    it("should return null when not exists", async () => {
      // Given
      const userId = "non-existing-user-id";

      // When
      const user = await userRepository.findById(userId);

      // Then
      expect(user).toBeNull();
    });
  });
});
```

### 2. 통합 테스트

```typescript
describe("UserRepository Integration", () => {
  it("should create and retrieve user", async () => {
    // Given
    const userData = {
      email: "test@example.com",
      name: "테스트 사용자",
      nickname: "tester",
      provider: "kakao",
      providerId: "kakao123",
    };

    // When
    const createdUser = await userRepository.create(userData);
    const retrievedUser = await userRepository.findById(createdUser.id);

    // Then
    expect(retrievedUser).toEqual(createdUser);
  });
});
```

## 📋 체크리스트

### Repository 구현 시 확인사항

- [ ] IRepository 인터페이스 완전 구현
- [ ] BaseRepository 적절히 확장
- [ ] SOLID 원칙 준수
- [ ] 에러 처리 로직 포함
- [ ] 페이지네이션 지원
- [ ] 적절한 인덱스 사용
- [ ] JSDoc 문서화 완료
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] 성능 테스트 통과

## 🔍 참고 자료

- [Repository Pattern - Martin Fowler](https://martinfowler.com/eaaCatalog/repository.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)
