---
paths:
  - "components/**/*.tsx"
  - "app/**/*.tsx"
  - "theme/**/*.ts"
---

# 디자인 시스템 규칙

## 필수

- 모든 스타일 값은 `theme/`의 토큰을 사용한다. 하드코딩된 색상/간격/폰트 값 금지.
- import 예시: `import { colors, spacing, fontSize } from '../theme'`

## 토큰 체계

| 토큰 | 파일 | 용도 |
|------|------|------|
| `colors` | `theme/colors.ts` | 색상 (primary, bg, text, status) |
| `spacing` | `theme/spacing.ts` | 간격 (xs:4 ~ 4xl:48) |
| `fontSize` | `theme/typography.ts` | 폰트 크기 (xs:12 ~ 4xl:32) |
| `fontWeight` | `theme/typography.ts` | 폰트 두께 (semibold, bold) |
| `radius` | `theme/radius.ts` | 모서리 (sm:4, md:12, lg:16, xl:20) |
| `shadows` | `theme/shadows.ts` | 그림자 (card) |

## 컴포넌트 규칙

- `StyleSheet.create` 사용, 인라인 스타일은 동적 값만 허용
- 접근성: 터치 가능한 요소에 `accessibilityRole` 필수
- 새 UI 패턴은 `components/ui/`에 공통 컴포넌트로 추출
