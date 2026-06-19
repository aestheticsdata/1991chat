/**
 * The "About" card — OVH mentions hébergeur. Rendered inside the app shell
 * when signed in, or under the public header when signed out.
 */
import { text } from "@i18n";

export function AboutContent() {
  return (
    <section className="w-96 max-w-full rounded-2xl border border-neutral-200 bg-white p-8 shadow-xs">
      <h1 className="mb-5 text-xl font-semibold">{text.about.heading}</h1>
      <div className="space-y-2 text-sm text-neutral-600">
        <p>{text.about.hosting}</p>
        <p>{text.about.address}</p>
        <p>{text.about.ape}</p>
        <p>{text.about.vat}</p>
      </div>
    </section>
  );
}
