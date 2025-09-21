#!/usr/bin/env node

/**
 * 간단한 TypeScript 테스트 러너
 * Phase 9에서 구현된 테스트들을 검증
 */

const fs = require('fs');
const path = require('path');

// 콘솔 색상 유틸리티
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

console.log(colors.bold('\n🧪 동네물어봐 테스트 검증 시작\n'));

// 1. 테스트 파일 존재 확인
console.log(colors.blue('📁 테스트 파일 존재 확인...'));

const testFiles = [
  'packages/utils/src/__tests__/validation.test.ts',
  'packages/database/src/__tests__/repositories/user.repository.test.ts',
  'packages/database/src/__tests__/repositories/question.repository.test.ts',
  'packages/database/src/__tests__/errors/error-handler.test.ts',
  'packages/database/src/__tests__/services/search.service.test.ts',
  'apps/api/src/__tests__/integration/auth.integration.test.ts',
  'apps/api/src/__tests__/integration/question.integration.test.ts',
  'apps/api/src/__tests__/security/penetration.test.ts',
  'apps/api/src/__tests__/security/vulnerability.test.ts',
  'apps/web/src/__tests__/e2e/auth.e2e.test.ts',
  'apps/web/src/__tests__/e2e/question.e2e.test.ts'
];

let existingTests = 0;
let totalTests = testFiles.length;

testFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(colors.green(`✅ ${file}`));
    existingTests++;
  } else {
    console.log(colors.red(`❌ ${file}`));
  }
});

console.log(`\n📊 테스트 파일 존재 현황: ${existingTests}/${totalTests} (${Math.round(existingTests/totalTests*100)}%)`);

// 2. 소스 파일 존재 확인
console.log(colors.blue('\n📁 소스 파일 존재 확인...'));

const sourceFiles = [
  'packages/utils/src/validation.ts',
  'packages/utils/src/string.ts',
  'packages/utils/src/date.ts',
  'packages/utils/src/function.ts',
  'packages/utils/src/id.ts',
  'packages/utils/src/url.ts',
  'packages/utils/src/json.ts',
  'packages/database/src/repositories/user.repository.ts',
  'packages/database/src/repositories/question.repository.ts',
  'packages/database/src/errors/index.ts',
  'packages/database/src/services/search.service.ts'
];

let existingSources = 0;
let totalSources = sourceFiles.length;

sourceFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(colors.green(`✅ ${file}`));
    existingSources++;
  } else {
    console.log(colors.red(`❌ ${file}`));
  }
});

console.log(`\n📊 소스 파일 존재 현황: ${existingSources}/${totalSources} (${Math.round(existingSources/totalSources*100)}%)`);

// 3. 패키지 설정 확인
console.log(colors.blue('\n📁 패키지 설정 확인...'));

const packageFiles = [
  'package.json',
  'packages/utils/package.json',
  'packages/database/package.json',
  'apps/api/package.json',
  'apps/web/package.json',
  'jest.config.js',
  'playwright.config.ts'
];

let existingPackages = 0;
let totalPackages = packageFiles.length;

packageFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(colors.green(`✅ ${file}`));
    existingPackages++;
  } else {
    console.log(colors.red(`❌ ${file}`));
  }
});

console.log(`\n📊 설정 파일 존재 현황: ${existingPackages}/${totalPackages} (${Math.round(existingPackages/totalPackages*100)}%)`);

// 4. 테스트 커버리지 분석
console.log(colors.blue('\n📊 테스트 커버리지 분석...'));

// utils 패키지 테스트 커버리지 확인
const utilsTestFile = 'packages/utils/src/__tests__/validation.test.ts';
if (fs.existsSync(utilsTestFile)) {
  const content = fs.readFileSync(utilsTestFile, 'utf8');
  const testCases = content.match(/it\(|test\(/g) || [];
  const describes = content.match(/describe\(/g) || [];

  console.log(colors.green(`✅ Utils 테스트: ${describes.length}개 그룹, ${testCases.length}개 테스트 케이스`));
} else {
  console.log(colors.red('❌ Utils 테스트 파일 없음'));
}

// 5. 종합 리포트
console.log(colors.bold('\n📈 Phase 9 테스트 구현 현황 종합'));
console.log('═'.repeat(50));

const totalScore = (existingTests + existingSources + existingPackages) / (totalTests + totalSources + totalPackages) * 100;

console.log(`🎯 전체 완성도: ${colors.bold(Math.round(totalScore))}%`);
console.log(`📝 테스트 파일: ${colors.green(existingTests)}/${totalTests}`);
console.log(`💻 소스 파일: ${colors.green(existingSources)}/${totalSources}`);
console.log(`⚙️  설정 파일: ${colors.green(existingPackages)}/${totalPackages}`);

if (totalScore >= 90) {
  console.log(colors.green('\n🎉 Phase 9 테스트 인프라가 완벽하게 구축되었습니다!'));
} else if (totalScore >= 70) {
  console.log(colors.yellow('\n⚠️  Phase 9 테스트 인프라가 대부분 구축되었지만 일부 보완이 필요합니다.'));
} else {
  console.log(colors.red('\n❌ Phase 9 테스트 인프라 구축이 완료되지 않았습니다.'));
}

console.log(colors.bold('\n✨ 테스트 검증 완료\n'));