type Translator = (key: string) => string;

export function GoodTailwindCard({ t }: { t: Translator }) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm shadow-slate-200/80">
      <h2 className="text-sm font-semibold text-slate-900">{t('payment.method.title')}</h2>
      <p className="mt-1 text-sm text-slate-600">{t('shadow.allowed.description')}</p>
    </section>
  );
}
