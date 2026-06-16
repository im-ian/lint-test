# AST examples

ESLint custom rule은 코드를 문자열로 직접 검색하지 않고 AST 노드를 봅니다. 이 프로젝트에서는 `@typescript-eslint/parser`가 TSX 코드를 AST로 바꾸고, 룰이 필요한 노드만 방문합니다.

## 실행

```bash
npm run ast:examples
```

## React Native Image 예시

샘플 코드:

```tsx
import { Image as RNImage, View } from 'react-native';

export function Example() {
  return (
    <View>
      <RNImage source={{ uri: 'https://example.com/profile.png' }} />
    </View>
  );
}
```

이 코드는 대략 다음 노드로 보입니다.

```json
[
  {
    "type": "ImportDeclaration",
    "module": "react-native"
  },
  {
    "type": "ImportSpecifier",
    "imported": "Image",
    "local": "RNImage"
  },
  {
    "type": "JSXOpeningElement",
    "name": "RNImage"
  }
]
```

그래서 `no-react-native-image` 룰은 다음 순서로 동작합니다.

1. `ImportDeclaration`에서 `source.value === 'react-native'`인지 확인합니다.
2. 그 안의 `ImportSpecifier`에서 `imported.name === 'Image'`를 찾습니다.
3. 로컬 이름이 alias라면 `RNImage`처럼 실제 코드에서 쓰는 이름을 저장합니다.
4. `JSXOpeningElement`에서 `<RNImage />`가 나오면 lint 에러를 보고합니다.

## 문구/어투 예시

샘플 코드:

```tsx
export const retryMessage = '다시 시도해줘';
export const urgentMessage = `지금 당장 확인해 주세요`;

export function Example() {
  return <Text>지금 당장 확인해줘</Text>;
}
```

이 코드는 대략 다음 노드로 보입니다.

```json
[
  {
    "type": "Literal",
    "value": "다시 시도해줘"
  },
  {
    "type": "TemplateElement",
    "value": "지금 당장 확인해 주세요"
  },
  {
    "type": "JSXText",
    "value": "지금 당장 확인해줘"
  }
]
```

그래서 `no-discouraged-copy` 룰은 문자열이 들어있는 노드만 검사합니다.

1. 일반 문자열은 `Literal`에서 검사합니다.
2. 백틱 문자열은 `TemplateElement`에서 검사합니다.
3. JSX 태그 사이 텍스트는 `JSXText`에서 검사합니다.
4. `eslint.config.mjs`에 설정한 `patterns`가 포함되어 있으면 warning을 보고합니다.

전체 AST는 훨씬 큽니다. 이 문서와 스크립트는 룰 작성자가 실제로 관심을 두는 노드만 좁혀서 보여줍니다.
