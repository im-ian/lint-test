import test from 'node:test';
import assert from 'node:assert/strict';
import { assertRuleIds, lint } from './helpers.mjs';

const options = [
  {
    patterns: [
      {
        match: '해줘',
        suggest: '해 주세요'
      },
      {
        match: '당장',
        suggest: '지금'
      },
      {
        match: 'ㅋㅋ',
        suggest: '삭제'
      }
    ]
  }
];

test('allows product copy that matches the configured tone', () => {
  const messages = lint(
    `
      export const message = '지금 다시 시도해 주세요.';
    `,
    'no-discouraged-copy',
    options
  );

  assert.equal(messages.length, 0);
});

test('reports discouraged wording in string literals', () => {
  const messages = lint(
    `
      export const message = '다시 시도해줘 ㅋㅋ';
    `,
    'no-discouraged-copy',
    options
  );

  assertRuleIds(messages, [
    'product-rules/no-discouraged-copy',
    'product-rules/no-discouraged-copy'
  ]);
});

test('reports discouraged wording in template literals', () => {
  const messages = lint(
    `
      export const message = \`지금 당장 확인해 주세요.\`;
    `,
    'no-discouraged-copy',
    options
  );

  assertRuleIds(messages, ['product-rules/no-discouraged-copy']);
});

test('reports discouraged wording in JSX text', () => {
  const messages = lint(
    `
      export function Example() {
        return <Text>지금 당장 확인해줘</Text>;
      }
    `,
    'no-discouraged-copy',
    options
  );

  assertRuleIds(messages, [
    'product-rules/no-discouraged-copy',
    'product-rules/no-discouraged-copy'
  ]);
});
