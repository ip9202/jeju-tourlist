import { Router } from "express";
import { ResponseHelper } from "../utils/response";
import { env } from "@jeju-tourlist/config";

const router: Router = Router();

// 헬스 체크 라우트 (SRP: 단일 책임 원칙)
router.get("/", (req, res) => {
  ResponseHelper.success(
    res,
    {
      status: "healthy",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
    "서버가 정상적으로 작동 중입니다"
  );
});

// 상세 헬스 체크 (개발 환경에서만)
router.get("/detailed", (req, res) => {
  if (env.NODE_ENV !== "development") {
    return ResponseHelper.forbidden(
      res,
      "상세 헬스 체크는 개발 환경에서만 사용 가능합니다"
    );
  }

  ResponseHelper.success(
    res,
    {
      status: "healthy",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    "상세 서버 상태 정보"
  );
});

export default router;
