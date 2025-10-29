import { Request, Response } from "express";
import { UserRepository } from "../services/user/UserRepository";
import { AuthService } from "../services/auth/AuthService";
import { UpdateUserData } from "@jeju-tourlist/types";

/**
 * 사용자 컨트롤러
 * Single Responsibility Principle: 사용자 관련 HTTP 요청 처리만 담당
 */
export class UserController {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly prisma?: any
  ) {}

  /**
   * 현재 사용자 정보 조회
   * GET /api/users/me
   */
  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "인증이 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: req.user,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get current user error:", error);

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "사용자 정보 조회에 실패했습니다.",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 사용자 프로필 조회
   * GET /api/users/:id/profile
   */
  getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_USER_ID",
            message: "사용자 ID가 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 현재는 기본 사용자 정보만 반환 (프로필 정보는 향후 구현)
      const user = await this.userRepository.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "사용자를 찾을 수 없습니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 공개 정보만 반환
      const publicProfile = {
        id: user.id,
        name: user.name,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      };

      res.status(200).json({
        success: true,
        data: publicProfile,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get user profile error:", error);

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "사용자 프로필 조회에 실패했습니다.",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 사용자 프로필 수정
   * PUT /api/users/me
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "인증이 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updateData: Partial<UpdateUserData> = req.body;

      // 수정 가능한 필드만 허용
      const allowedFields: (keyof UpdateUserData)[] = ["name", "profileImage"];
      const filteredData: Partial<UpdateUserData> = {};

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          (filteredData as any)[field] = updateData[field];
        }
      }

      if (Object.keys(filteredData).length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: "NO_VALID_FIELDS",
            message: "수정할 수 있는 유효한 필드가 없습니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const updatedUser = await this.userRepository.update(
        (req.user as any).id,
        filteredData
      );

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: "프로필이 성공적으로 수정되었습니다.",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Update profile error:", error);

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "프로필 수정에 실패했습니다.",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 사용자 탈퇴
   * DELETE /api/users/me
   */
  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "인증이 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // 사용자 계정 삭제
      await this.userRepository.delete((req.user as any).id);

      res.status(200).json({
        success: true,
        message: "계정이 성공적으로 삭제되었습니다.",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Delete account error:", error);

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "계정 삭제에 실패했습니다.",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 사용자 활동 통계 조회
   * GET /api/users/me/stats
   */
  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "인증이 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const userId = (req.user as any).id;

      // Prisma를 사용한 실제 데이터베이스 쿼리
      if (this.prisma) {
        try {
          // 질문 개수
          const questionsCount = await this.prisma.question.count({
            where: { authorId: userId },
          });

          // 답변 관련 데이터 조회
          const answers = await this.prisma.answer.findMany({
            where: { authorId: userId },
            select: {
              id: true,
              isAccepted: true,
              likeCount: true,
            },
          });

          const answersCount = answers.length;
          const acceptedAnswersCount = answers.filter(
            (answer: (typeof answers)[0]) => answer.isAccepted
          ).length;
          const likesReceived = answers.reduce(
            (sum: number, answer: (typeof answers)[0]) =>
              sum + (answer.likeCount || 0),
            0
          );

          // 포인트 계산: 채택된 답변 100점 + 좋아요 1점씩
          const points = acceptedAnswersCount * 100 + likesReceived;

          const stats = {
            questionsCount,
            answersCount,
            acceptedAnswersCount,
            likesReceived,
            points,
            joinDate: (req.user as any).createdAt,
            lastActive: (req.user as any).updatedAt,
          };

          res.status(200).json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString(),
          });
          return;
        } catch (dbError: any) {
          console.error("Database query error:", dbError);
          // Prisma 쿼리 실패 시 기본값 반환
        }
      }

      // Prisma가 없거나 쿼리 실패 시 기본값 반환
      const stats = {
        questionsCount: 0,
        answersCount: 0,
        acceptedAnswersCount: 0,
        likesReceived: 0,
        points: 0,
        joinDate: (req.user as any).createdAt,
        lastActive: (req.user as any).updatedAt,
      };

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get user stats error:", error);

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "사용자 통계 조회에 실패했습니다.",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * 사용자 목록 조회 (관리자용)
   * GET /api/users
   */
  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user || (req.user as any).role !== "admin") {
        res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "관리자 권한이 필요합니다.",
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      // 현재는 모든 사용자 반환 (페이징과 검색은 향후 구현)
      const users = await this.userRepository.getAllUsers();

      // 검색 필터링
      let filteredUsers = users;
      if (search) {
        filteredUsers = users.filter(
          user =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      // 페이징
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      res.status(200).json({
        success: true,
        data: {
          users: paginatedUsers,
          pagination: {
            page,
            limit,
            total: filteredUsers.length,
            totalPages: Math.ceil(filteredUsers.length / limit),
            hasNext: endIndex < filteredUsers.length,
            hasPrev: page > 1,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Get users error:", error);

      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "사용자 목록 조회에 실패했습니다.",
        },
        timestamp: new Date().toISOString(),
      });
    }
  };
}
