import request from "supertest";
import express from "express";
import healthRoutes from "../routes/health";

const app = express();
app.use(express.json());
app.use("/health", healthRoutes);

describe("Health Routes", () => {
  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: "healthy",
          environment: "test",
        },
        message: "서버가 정상적으로 작동 중입니다",
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe("GET /health/detailed", () => {
    it("should return detailed health status in development", async () => {
      // 개발 환경으로 설정
      process.env.NODE_ENV = "development";

      const response = await request(app).get("/health/detailed").expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          status: "healthy",
          environment: "development",
        },
        message: "상세 서버 상태 정보",
      });
      expect(response.body.data.uptime).toBeDefined();
      expect(response.body.data.memory).toBeDefined();
    });

    it("should return forbidden in production", async () => {
      // 프로덕션 환경으로 설정
      process.env.NODE_ENV = "production";

      const response = await request(app).get("/health/detailed").expect(403);

      expect(response.body).toMatchObject({
        success: false,
        error: "Forbidden",
        message: "상세 헬스 체크는 개발 환경에서만 사용 가능합니다",
      });
    });
  });
});
