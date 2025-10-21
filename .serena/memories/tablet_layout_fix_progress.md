# 태블릿 반응형 레이아웃 수정 진행 상황

## 문제

- 태블릿 뷰포트 1023px에서 질문 카드가 **왼쪽에만 모여있고 오른쪽이 빈 공간**으로 표시됨
- 디자인 프리뷰에서는 카드가 페이지 전체 너비를 채움

## 원인 파악

1. 그리드 구조: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5`
   - md (768px~)에서 3열로 설정됨
   - lg (1024px~)에서 4열로 변경되고 aside가 표시됨

2. 실제 문제:
   - md에서 `grid-cols-3`이 아니라 `grid-cols-2`여야 함
   - main 컨테이너에 `max-w-7xl` 제한이 있어서 그리드 너비가 제한됨
   - 패딩 `px-4 sm:px-6`이 그리드를 752px로 축소시킴

## 적용한 수정 사항 (apps/web/src/app/questions/page.tsx)

### 1. Line 259: 그리드 컬럼 수정

```
변경 전: grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
변경 후: grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4
```

### 2. Line 225: main 컨테이너 수정

```
변경 전: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
변경 후: max-w-full lg:max-w-7xl mx-auto px-3 md:px-4 lg:px-8
```

## 다음 단계

1. 서버 재시작 후 페이지 로드
2. 뷰포트 1023px 확인
3. main className이 `max-w-full lg:max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-8` 인지 검증
4. 카드가 페이지 전체 너비를 채우는지 확인

## 수정 파일

- /Users/ip9202/develop/vibe/jeju-tourlist/apps/web/src/app/questions/page.tsx
