/**
 * The "À propos" card — OVH mentions hébergeur. Rendered inside the app shell
 * when signed in, or under the public header when signed out.
 */
export function AboutContent() {
  return (
    <section className="w-96 max-w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
      <h1 className="mb-1 text-xl font-semibold">À propos</h1>
      <p className="mb-5 text-sm text-neutral-500">1991chat — AI chat (System Design exercise)</p>
      <div className="space-y-2 text-sm text-neutral-600">
        <p>Site hébergé chez OVH SAS</p>
        <p>Siège social : 2 rue Kellermann — 59100 Roubaix — France</p>
        <p>Code APE 2620Z</p>
        <p>N° TVA : FR 22 424 761 419</p>
      </div>
    </section>
  );
}
