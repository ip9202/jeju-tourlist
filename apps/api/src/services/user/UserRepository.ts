import {
  User,
  AuthProvider,
  UserRole,
  UpdateUserData,
} from "@jeju-tourlist/types";

/**
 * 사용자 리포지토리 인터페이스
 * Interface Segregation Principle: 필요한 메서드만 노출
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByProviderAndProviderId(
    provider: AuthProvider,
    providerId: string
  ): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, updateData: Partial<UpdateUserData>): Promise<User>;
  delete(id: string): Promise<void>;
  exists(email: string): Promise<boolean>;
}

export interface CreateUserData {
  email: string;
  name: string;
  profileImage?: string;
  provider: AuthProvider;
  providerId: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * 사용자 리포지토리 구현체
 * 현재는 메모리 기반 구현, 나중에 Prisma로 교체 예정
 */
export class UserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> userId
  private providerIndex: Map<string, string> = new Map(); // provider:providerId -> userId

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email);
    if (!userId) {
      return null;
    }
    return this.users.get(userId) || null;
  }

  async findByProviderAndProviderId(
    provider: AuthProvider,
    providerId: string
  ): Promise<User | null> {
    const key = `${provider}:${providerId}`;
    const userId = this.providerIndex.get(key);
    if (!userId) {
      return null;
    }
    return this.users.get(userId) || null;
  }

  async create(userData: CreateUserData): Promise<User> {
    const id = this.generateId();
    const now = new Date();

    const user: User = {
      id,
      email: userData.email,
      name: userData.name,
      profileImage: userData.profileImage,
      provider: userData.provider,
      providerId: userData.providerId,
      role: userData.role || UserRole.USER,
      isActive: userData.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);
    this.emailIndex.set(userData.email, id);
    this.providerIndex.set(`${userData.provider}:${userData.providerId}`, id);

    return user;
  }

  async update(id: string, updateData: Partial<UpdateUserData>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser: User = {
      ...user,
      ...updateData,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);

    // 이메일이 변경된 경우 인덱스 업데이트
    if (updateData.name && updateData.name !== user.name) {
      // 이름 변경은 인덱스에 영향 없음
    }

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }

    this.users.delete(id);
    this.emailIndex.delete(user.email);
    this.providerIndex.delete(`${user.provider}:${user.providerId}`);
  }

  async exists(email: string): Promise<boolean> {
    return this.emailIndex.has(email);
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 개발/테스트용 메서드
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async clear(): Promise<void> {
    this.users.clear();
    this.emailIndex.clear();
    this.providerIndex.clear();
  }
}
