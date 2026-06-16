type Translator = (key: string) => string;

export function GoodI18nScreen({ t }: { t: Translator }) {
  return (
    <main aria-label={t('payment.result.region')}>
      <h1>{t('payment.complete.title')}</h1>
      <input placeholder={t('payment.receipts.search.placeholder')} />
      <button>{t('payment.receipt.view')}</button>
    </main>
  );
}
