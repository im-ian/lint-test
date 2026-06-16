# lint-test

React Native 코드와 서비스 문구를 대상으로 커스텀 ESLint 규칙을 실험하는 작은 모노레포입니다.

## 구조

- `packages/eslint-plugin-product-rules/src`: TypeScript로 작성한 ESLint 플러그인 원본입니다.
- `apps/react-native-case`: React Native에서 `react-native`의 기본 `Image`를 금지하는 예시입니다.
- `apps/copy-tone-case`: 텍스트 문구의 어투를 검사하는 예시입니다.
- `apps/react-tailwind-case`: React/Tailwind에서 `border` 대신 `shadow-*`를 쓰게 하는 예시입니다.
- `eslint.config.mjs`: 실제 프로젝트에서 룰을 켜는 위치입니다.

룰 작성에는 `@typescript-eslint/utils`의 `ESLintUtils.RuleCreator`, `TSESTree`, `AST_NODE_TYPES`를 사용합니다.

## 실행

```bash
npm install
npm run ast:examples
npm run build:plugin
npm run test:rules
npm run lint:pass
npm run lint:fail-demo
```

`lint:fail-demo`는 일부러 실패하도록 만든 명령입니다. 어떤 코드가 어떤 룰에 걸리는지 확인할 때 사용합니다.

`ast:examples`는 샘플 TSX 코드가 어떤 AST 노드로 보이는지 요약해서 출력합니다.

## 확인할 파일

`packages/eslint-plugin-product-rules/src/rules/no-react-native-image.ts`는 다음 케이스를 잡습니다.

- `import { Image } from 'react-native'`
- `import { Image as RNImage } from 'react-native'`
- `import * as RN from 'react-native'` 후 `<RN.Image />`

`packages/eslint-plugin-product-rules/src/rules/no-discouraged-copy.ts`는 문자열, 템플릿 문자열, JSX 텍스트 안의 금지 표현을 잡습니다. 실제 금지 표현 목록은 `eslint.config.mjs`에서 바꿀 수 있습니다.

`packages/eslint-plugin-product-rules/src/rules/no-tailwind-border.ts`는 React `className` 안의 `border`, `border-*`, `md:hover:border` 같은 Tailwind border 클래스를 잡습니다. 시각적 경계는 `shadow-*` 또는 arbitrary shadow utility로 표현하도록 안내합니다.

`docs/ast-examples.md`와 `scripts/ast-examples.mjs`는 룰이 참고하는 AST 노드를 학습용으로 보여줍니다.

## 흐름

ESLint는 소스 코드를 AST라는 트리로 파싱합니다. 커스텀 룰은 그 트리를 순회하면서 관심 있는 노드만 검사합니다.

예를 들어 `no-react-native-image` 룰은 `ImportDeclaration` 노드에서 `react-native`의 `Image` import를 기록하고, `JSXOpeningElement` 노드에서 그 컴포넌트를 실제로 쓰는지 확인합니다.
