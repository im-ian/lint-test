import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import productRules from './packages/eslint-plugin-product-rules/dist/index.js';

export default [
  {
    ignores: ['node_modules/**', 'package-lock.json']
  },
  {
    files: ['packages/**/*.js', 'eslint.config.mjs'],
    ...js.configs.recommended
  },
  {
    files: ['apps/**/*.{ts,tsx}'],
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
      'product-rules/no-react-native-image': 'error',
      'product-rules/no-tailwind-border': 'error',
      'product-rules/no-discouraged-copy': [
        'warn',
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
              suggest: '삭제하거나 서비스 톤에 맞는 문장'
            },
            {
              match: '실패함',
              suggest: '실패했습니다'
            }
          ]
        }
      ]
    }
  }
];
