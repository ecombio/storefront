import Link from "next/link";
import { Suspense } from "react";

import { ProductStrip } from "@/components/blog/product-strip";
import { Prose } from "@/components/ui/prose";
import type { BodySegment } from "@/lib/blog/shortcodes";

type AccordionSegment = Extract<BodySegment, { type: "accordion" }>;
type OtherSegment = Exclude<BodySegment, { type: "accordion" }>;

type Block =
  | { items: AccordionSegment[]; kind: "accordions" }
  | { kind: "single"; segment: OtherSegment };

// Consecutive accordions (ignoring blank space between them) become one connected list.
function groupSegments(segments: BodySegment[]): Block[] {
  const blocks: Block[] = [];
  for (const segment of segments) {
    const last = blocks.at(-1);
    if (segment.type === "accordion") {
      if (last?.kind === "accordions") last.items.push(segment);
      else blocks.push({ items: [segment], kind: "accordions" });
      continue;
    }
    if (segment.type === "html" && !segment.html.trim() && last?.kind === "accordions") continue;
    blocks.push({ kind: "single", segment });
  }
  return blocks;
}

function AccordionList({ id, items }: { id: string; items: AccordionSegment[] }) {
  return (
    <div className="border-t">
      {items.map((item, index) => (
        <details className="group border-b" key={`${id}-${index}`}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium text-base [&::-webkit-details-marker]:hidden">
            {item.title}
            <span aria-hidden className="relative size-3 shrink-0">
              <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
              <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-opacity group-open:opacity-0" />
            </span>
          </summary>
          <Prose className="w-full pb-6 text-muted-foreground text-sm leading-6 [&_a]:text-foreground [&_a]:underline">
            <div
              // oxlint-disable-next-line react/no-danger -- Shopify sanitizes article HTML.
              dangerouslySetInnerHTML={{ __html: item.html }}
            />
          </Prose>
        </details>
      ))}
    </div>
  );
}

export function ArticleBody({ segments }: { segments: BodySegment[] }) {
  const blocks = groupSegments(segments);
  return (
    <div className="grid gap-6">
      {blocks.map((block, index) => {
        if (block.kind === "accordions") {
          const id = `accordion-group-${index}`;
          return <AccordionList id={id} items={block.items} key={id} />;
        }
        const { segment } = block;
        const key = `${segment.type}-${index}`;
        switch (segment.type) {
          case "html":
            return (
              <Prose className="w-full" key={key}>
                <div
                  // oxlint-disable-next-line react/no-danger -- Shopify sanitizes article HTML.
                  dangerouslySetInnerHTML={{ __html: segment.html }}
                />
              </Prose>
            );
          case "button":
            return (
              <Link
                className="justify-self-start bg-foreground px-6 py-3 font-medium text-background text-xs"
                href={segment.href}
                key={key}
              >
                {segment.label}
              </Link>
            );
          case "products":
            return (
              <Suspense fallback={null} key={key}>
                <ProductStrip handles={segment.handles} href={segment.href} title={segment.title} />
              </Suspense>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
