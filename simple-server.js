const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '동네물어봐 API 서버',
    version: '1.0.0',
    environment: 'development'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API 라우트
app.get('/api', (req, res) => {
  res.json({
    message: '동네물어봐 API 서버',
    version: '1.0.0',
    environment: 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});
