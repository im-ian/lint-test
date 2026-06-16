import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import productRules from '../dist/index.js';

export function lint(code, ruleName, ruleOptions = []) {
  const linter = new Linter({ configType: 'flat' });

  return linter.verify(
    code,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          ecmaFeatures: {
            jsx: true
          },
          ecmaVersion: 'latest',
          sourceType: 'module'
        }
      },
      plugins: {
        'product-rules': productRules
      },
      rules: {
        [`product-rules/${ruleName}`]: ['error', ...ruleOptions]
      }
    },
    {
      filename: 'example.tsx'
    }
  );
}

export function assertRuleIds(messages, expectedRuleIds) {
  assert.deepEqual(
    messages.map((message) => message.ruleId),
    expectedRuleIds
  );
}
