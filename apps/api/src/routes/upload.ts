import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomBytes } from "crypto";
// import { authMiddleware } from "../middleware/auth"; // TODO: 인증 구현 후 활성화

const router = Router();

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = randomBytes(16).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

// 파일 필터 (이미지만 허용)
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("이미지 파일만 업로드 가능합니다."));
  }
};

// Multer 설정
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

/**
 * 파일 업로드
 * POST /api/upload
 */
router.post(
  "/",
  // authMiddleware, // 임시로 인증 제거 (개발 환경)
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "파일이 업로드되지 않았습니다.",
          timestamp: new Date().toISOString(),
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      res.status(200).json({
        success: true,
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          url: fileUrl,
        },
        message: "파일이 성공적으로 업로드되었습니다.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("파일 업로드 에러:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "파일 업로드 중 오류가 발생했습니다.",
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export default router;
