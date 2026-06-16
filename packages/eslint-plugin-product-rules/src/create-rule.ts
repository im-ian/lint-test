import { ESLintUtils } from '@typescript-eslint/utils';

export const createRule = ESLintUtils.RuleCreator(
  (ruleName) => `https://github.com/im-ian/lint-test/tree/main/docs/rules/${ruleName}.md`
);
