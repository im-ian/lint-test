import test from 'node:test';
import assert from 'node:assert/strict';
import { assertRuleIds, lint } from './helpers.mjs';

// react-native의 Image가 아닌 디자인 시스템/다른 라이브러리 이미지는 허용하는지 확인합니다.
test('allows app image components and non-react-native Image imports', () => {
  const messages = lint(
    `
      import { Image as ExpoImage } from 'expo-image';
      import { AppImage } from './design-system/Image';

      export function Example() {
        return (
          <>
            <ExpoImage source={{ uri: 'https://example.com/a.png' }} />
            <AppImage source={{ uri: 'https://example.com/b.png' }} />
          </>
        );
      }
    `,
    'no-react-native-image'
  );

  assert.equal(messages.length, 0);
});

// import { Image } from 'react-native'와 <Image /> 사용을 모두 잡는지 확인합니다.
test('reports direct Image imports and JSX usage from react-native', () => {
  const messages = lint(
    `
      import { Image, View } from 'react-native';

      export function Example() {
        return (
          <View>
            <Image source={{ uri: 'https://example.com/a.png' }} />
          </View>
        );
      }
    `,
    'no-react-native-image'
  );

  assertRuleIds(messages, [
    'product-rules/no-react-native-image',
    'product-rules/no-react-native-image'
  ]);
});

// import { Image as RNImage }처럼 alias를 붙여도 실제 JSX 사용까지 잡는지 확인합니다.
test('reports aliased Image imports from react-native', () => {
  const messages = lint(
    `
      import { Image as RNImage } from 'react-native';

      export function Example() {
        return <RNImage source={{ uri: 'https://example.com/a.png' }} />;
      }
    `,
    'no-react-native-image'
  );

  assertRuleIds(messages, [
    'product-rules/no-react-native-image',
    'product-rules/no-react-native-image'
  ]);
});

// import * as RN 형태로 가져온 뒤 <RN.Image />로 쓰는 경우를 잡는지 확인합니다.
test('reports namespace Image usage from react-native', () => {
  const messages = lint(
    `
      import * as RN from 'react-native';

      export function Example() {
        return <RN.Image source={{ uri: 'https://example.com/a.png' }} />;
      }
    `,
    'no-react-native-image'
  );

  assertRuleIds(messages, ['product-rules/no-react-native-image']);
});
