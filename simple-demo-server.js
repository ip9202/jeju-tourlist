const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const server = http.createServer((req, res) => {
  let filePath = req.url === '/' ? '/demo.html' : req.url;
  filePath = path.join(__dirname, filePath);
  
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
  }
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - 파일을 찾을 수 없습니다</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`서버 오류: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 데모 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`🌐 브라우저에서 http://localhost:${PORT} 를 열어보세요!`);
  console.log(`📱 제주도 여행 Q&A 커뮤니티 - 동네물어봐`);
});
