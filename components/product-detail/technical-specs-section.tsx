import { ChevronDown } from "lucide-react";

import { getTechnicalSpecs } from "@/lib/product/server";

export async function TechnicalSpecsSection({ handle }: { handle: string }) {
  const html = await getTechnicalSpecs({ handle });

  return (
    <details open className="group" data-slot="technical-specifications">
      <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        <h2 className="text-2xl font-semibold">Technical Specifications</h2>
        <ChevronDown className="size-5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-5">
        {html ? (
          <div
            className="prose prose-sm max-w-none text-foreground/80"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="text-sm text-foreground/60">
            Technical specifications aren't available for this product yet.
          </p>
        )}
      </div>
    </details>
  );
}
