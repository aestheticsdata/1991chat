import { AboutContent } from "@components/AboutContent";

export const metadata = { title: "About — 1991chat" };

/** Public. Centers the card; the shell layout supplies the surrounding frame
 *  (sidebar when signed in, header when signed out). */
export default function AboutPage() {
  return (
    <div className="grid flex-1 place-items-center overflow-y-auto p-4">
      <AboutContent />
    </div>
  );
}
