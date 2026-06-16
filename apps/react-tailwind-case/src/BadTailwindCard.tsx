export function BadTailwindCard() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 focus:border-red-500">
      <h2 className="text-sm font-semibold text-slate-900">결제 수단</h2>
      <p className="mt-1 text-sm text-slate-600">border 대신 shadow를 사용해야 합니다.</p>
    </section>
  );
}
