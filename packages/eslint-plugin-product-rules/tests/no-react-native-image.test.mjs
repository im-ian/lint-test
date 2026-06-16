import test from 'node:test';
import assert from 'node:assert/strict';
import { assertRuleIds, lint } from './helpers.mjs';

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
