#!/usr/bin/env node

/**
 * 번들 크기 분석 스크립트
 * webpack-bundle-analyzer를 사용하여 번들 크기를 분석
 * 
 * SOLID 원칙 적용:
 * - Single Responsibility: 번들 분석 기능만 담당
 * - Open/Closed: 새로운 분석 도구 추가 가능
 * - Liskov Substitution: 다양한 번들러와 호환 가능
 * - Interface Segregation: 필요한 분석 기능만 노출
 * - Dependency Inversion: 외부 분석 도구와 통합 가능
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 분석 결과를 저장할 디렉토리
const ANALYSIS_DIR = path.join(__dirname, '../analysis');
const BUNDLE_ANALYSIS_FILE = path.join(ANALYSIS_DIR, 'bundle-analysis.json');

/**
 * 번들 분석 실행
 */
function analyzeBundle() {
  console.log('🔍 번들 크기 분석을 시작합니다...');
  
  try {
    // .next 디렉토리가 있는지 확인
    const nextDir = path.join(__dirname, '../.next');
    if (!fs.existsSync(nextDir)) {
      console.log('⚠️  .next 디렉토리가 없습니다. 먼저 빌드를 실행하세요.');
      console.log('   npm run build');
      return;
    }

    // 분석 디렉토리 생성
    if (!fs.existsSync(ANALYSIS_DIR)) {
      fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
    }

    // webpack-bundle-analyzer 실행
    console.log('📊 webpack-bundle-analyzer를 실행합니다...');
    execSync('npx webpack-bundle-analyzer .next/static/chunks/*.js --mode static --report analysis/bundle-report.html --no-open', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    // 번들 크기 정보 수집
    const bundleInfo = collectBundleInfo();
    
    // 결과를 JSON 파일로 저장
    fs.writeFileSync(BUNDLE_ANALYSIS_FILE, JSON.stringify(bundleInfo, null, 2));
    
    console.log('✅ 번들 분석이 완료되었습니다!');
    console.log(`📄 분석 결과: ${BUNDLE_ANALYSIS_FILE}`);
    console.log(`🌐 HTML 리포트: analysis/bundle-report.html`);
    
    // 크기 경고 표시
    displaySizeWarnings(bundleInfo);
    
  } catch (error) {
    console.error('❌ 번들 분석 중 오류가 발생했습니다:', error.message);
    process.exit(1);
  }
}

/**
 * 번들 크기 정보 수집
 */
function collectBundleInfo() {
  const chunksDir = path.join(__dirname, '../.next/static/chunks');
  const chunks = fs.readdirSync(chunksDir).filter(file => file.endsWith('.js'));
  
  const bundleInfo = {
    timestamp: new Date().toISOString(),
    chunks: [],
    totalSize: 0,
    recommendations: []
  };

  chunks.forEach(chunk => {
    const chunkPath = path.join(chunksDir, chunk);
    const stats = fs.statSync(chunkPath);
    const sizeKB = Math.round(stats.size / 1024);
    
    bundleInfo.chunks.push({
      name: chunk,
      size: stats.size,
      sizeKB: sizeKB,
      lastModified: stats.mtime
    });
    
    bundleInfo.totalSize += stats.size;
  });

  // 크기순으로 정렬
  bundleInfo.chunks.sort((a, b) => b.size - a.size);
  
  // 권장사항 생성
  generateRecommendations(bundleInfo);
  
  return bundleInfo;
}

/**
 * 크기 기반 권장사항 생성
 */
function generateRecommendations(bundleInfo) {
  const totalSizeMB = bundleInfo.totalSize / (1024 * 1024);
  
  if (totalSizeMB > 1) {
    bundleInfo.recommendations.push({
      type: 'warning',
      message: `전체 번들 크기가 ${totalSizeMB.toFixed(2)}MB로 큽니다. 코드 분할을 고려하세요.`
    });
  }
  
  // 큰 청크 식별
  const largeChunks = bundleInfo.chunks.filter(chunk => chunk.sizeKB > 100);
  if (largeChunks.length > 0) {
    bundleInfo.recommendations.push({
      type: 'info',
      message: `큰 청크가 ${largeChunks.length}개 있습니다: ${largeChunks.map(c => c.name).join(', ')}`
    });
  }
  
  // 동적 import 권장
  bundleInfo.recommendations.push({
    type: 'suggestion',
    message: '성능 향상을 위해 React.lazy()와 동적 import를 사용하세요.'
  });
  
  // Tree shaking 권장
  bundleInfo.recommendations.push({
    type: 'suggestion',
    message: '사용하지 않는 코드를 제거하기 위해 Tree shaking을 확인하세요.'
  });
}

/**
 * 크기 경고 표시
 */
function displaySizeWarnings(bundleInfo) {
  const totalSizeMB = bundleInfo.totalSize / (1024 * 1024);
  
  console.log('\n📈 번들 크기 요약:');
  console.log(`   전체 크기: ${totalSizeMB.toFixed(2)}MB`);
  console.log(`   청크 수: ${bundleInfo.chunks.length}개`);
  
  if (bundleInfo.recommendations.length > 0) {
    console.log('\n💡 권장사항:');
    bundleInfo.recommendations.forEach(rec => {
      const icon = rec.type === 'warning' ? '⚠️' : rec.type === 'info' ? 'ℹ️' : '💡';
      console.log(`   ${icon} ${rec.message}`);
    });
  }
  
  // 큰 청크 상위 5개 표시
  console.log('\n🔝 큰 청크 Top 5:');
  bundleInfo.chunks.slice(0, 5).forEach((chunk, index) => {
    console.log(`   ${index + 1}. ${chunk.name}: ${chunk.sizeKB}KB`);
  });
}

/**
 * 메인 실행
 */
if (require.main === module) {
  analyzeBundle();
}

module.exports = { analyzeBundle, collectBundleInfo };
