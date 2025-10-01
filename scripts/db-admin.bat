@echo off
REM Prisma Studio 데이터베이스 웹 어드민 실행 스크립트 (Windows)
REM 제주 여행 Q&A 커뮤니티 - 동네물어봐

echo ======================================
echo 🗄️  Prisma Studio 데이터베이스 관리 도구
echo ======================================
echo.
echo 📊 실행 중...
echo 🌐 브라우저에서 http://localhost:5555 를 열어주세요
echo.
echo 💡 팁: Ctrl+C 로 종료할 수 있습니다
echo.

REM Prisma Studio 실행 (packages\database 디렉토리에서)
cd packages\database
npx prisma studio
