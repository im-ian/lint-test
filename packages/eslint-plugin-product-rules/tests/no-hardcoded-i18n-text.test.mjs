import test from 'node:test';
import assert from 'node:assert/strict';
import { assertRuleIds, lint } from './helpers.mjs';

// t('key') 형태의 번역 함수로 화면 문구와 접근성 문구를 넘기면 허용하는지 확인합니다.
test('allows translated JSX text and user-facing attributes', () => {
  const messages = lint(
    `
      export function PaymentComplete({ t }) {
        return (
          <section aria-label={t('payment.summary.region')}>
            <h1>{t('payment.complete.title')}</h1>
            <input placeholder={t('payment.search.placeholder')} />
            <img alt={t('payment.receipt.alt')} />
          </section>
        );
      }
    `,
    'no-hardcoded-i18n-text'
  );

  assert.equal(messages.length, 0);
});

// JSX 태그 사이에 직접 적은 한글/영문 화면 문구를 잡는지 확인합니다.
test('reports hardcoded JSX text', () => {
  const messages = lint(
    `
      export function PaymentComplete() {
        return (
          <section>
            <h1>결제가 완료되었습니다</h1>
            <button>Submit</button>
          </section>
        );
      }
    `,
    'no-hardcoded-i18n-text'
  );

  assertRuleIds(messages, [
    'product-rules/no-hardcoded-i18n-text',
    'product-rules/no-hardcoded-i18n-text'
  ]);
});

// JSX 표현식 안에 문자열로 넣은 화면 문구도 하드코딩으로 잡는지 확인합니다.
test('reports hardcoded string expressions in JSX children', () => {
  const messages = lint(
    `
      export function EmptyState() {
        return (
          <>
            <p>{'결과가 없습니다'}</p>
            <p>{\`No results found\`}</p>
          </>
        );
      }
    `,
    'no-hardcoded-i18n-text'
  );

  assertRuleIds(messages, [
    'product-rules/no-hardcoded-i18n-text',
    'product-rules/no-hardcoded-i18n-text'
  ]);
});

// 사용자에게 노출되는 속성의 하드코딩 문구를 잡는지 확인합니다.
test('reports hardcoded user-facing attribute values', () => {
  const messages = lint(
    `
      export function SearchBox() {
        return (
          <input
            aria-label="검색"
            placeholder="Search users"
            title={\`사용자 검색\`}
          />
        );
      }
    `,
    'no-hardcoded-i18n-text'
  );

  assertRuleIds(messages, [
    'product-rules/no-hardcoded-i18n-text',
    'product-rules/no-hardcoded-i18n-text',
    'product-rules/no-hardcoded-i18n-text'
  ]);
});

// className, testID, data-testid처럼 사용자 문구가 아닌 문자열 속성은 무시하는지 확인합니다.
test('ignores non-user-facing attributes and non-text-only children', () => {
  const messages = lint(
    `
      export function Card() {
        return (
          <section className="rounded-lg shadow-sm" data-testid="payment-card" testID="payment-card">
            {' '}
            <span>{42}</span>
          </section>
        );
      }
    `,
    'no-hardcoded-i18n-text'
  );

  assert.equal(messages.length, 0);
});
