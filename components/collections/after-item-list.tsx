import type { CollectionAfterItemPage } from "@/lib/collections/types";

export function AfterItemList({ page }: { page: CollectionAfterItemPage }) {
  if (!page.body.trim()) return null;
  return (
    <section aria-label={page.title} className="mt-10 border-t pt-10">
      <div
        className="mx-auto max-w-3xl space-y-4 leading-7 [&_a]:underline [&_h2]:text-2xl [&_h3]:text-xl [&_img]:h-auto [&_img]:max-w-full [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </section>
  );
}
