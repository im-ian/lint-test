import test from 'node:test';
import assert from 'node:assert/strict';
import { assertRuleIds, lint } from './helpers.mjs';

// border 대신 shadow 계열 클래스를 사용한 React/Tailwind 코드는 허용하는지 확인합니다.
test('allows Tailwind shadow classes without border classes', () => {
  const messages = lint(
    `
      export function Card() {
        return <div className="rounded-lg bg-white p-4 shadow-sm" />;
      }
    `,
    'no-tailwind-border'
  );

  assert.equal(messages.length, 0);
});

// className 문자열에 border와 border 색상 클래스가 있으면 각각 보고하는지 확인합니다.
test('reports Tailwind border classes in className strings', () => {
  const messages = lint(
    `
      export function Card() {
        return <div className="rounded-lg border border-slate-200 bg-white p-4" />;
      }
    `,
    'no-tailwind-border'
  );

  assertRuleIds(messages, [
    'product-rules/no-tailwind-border',
    'product-rules/no-tailwind-border'
  ]);
});

// 반응형/상태 variant가 붙은 md:hover:border 같은 클래스도 잡는지 확인합니다.
test('reports Tailwind border classes with variants', () => {
  const messages = lint(
    `
      export function Card() {
        return <div className="rounded-lg md:hover:border focus:border-red-500 shadow-sm" />;
      }
    `,
    'no-tailwind-border'
  );

  assertRuleIds(messages, [
    'product-rules/no-tailwind-border',
    'product-rules/no-tailwind-border'
  ]);
});

// JSX 표현식 안의 문자열과 템플릿 문자열에 들어간 border 클래스도 잡는지 확인합니다.
test('reports Tailwind border classes in expression values', () => {
  const messages = lint(
    `
      export function Card() {
        return (
          <>
            <div className={'rounded-lg border-t shadow-sm'} />
            <div className={\`rounded-lg border-[1px] shadow-sm\`} />
          </>
        );
      }
    `,
    'no-tailwind-border'
  );

  assertRuleIds(messages, [
    'product-rules/no-tailwind-border',
    'product-rules/no-tailwind-border'
  ]);
});
