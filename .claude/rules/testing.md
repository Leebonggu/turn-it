---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "utils/**/*.ts"
  - "components/**/*.tsx"
  - "hooks/**/*.ts"
---

# 테스트 규칙

- 모든 새 코드에는 테스트를 함께 작성한다
- 유틸리티 함수는 TDD로 진행 (테스트 먼저 → 실패 확인 → 구현 → 통과 확인)
- 테스트 파일 위치: `__tests__/` 또는 소스 옆 `__tests__/` 디렉토리
- 테스트 프레임워크: Jest + @testing-library/react-native
- jest 버전: v29 (react-native 0.83 ESM 호환 문제로 v30 사용 불가)
- 테스트 실행: `npx jest --no-cache`
- 컴포넌트 테스트 시 접근성 속성(accessibilityRole 등)도 검증
