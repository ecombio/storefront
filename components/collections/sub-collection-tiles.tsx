"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import type { CollectionWithThumbnail } from "@/lib/collections/types";

const ARROW =
  "absolute top-8 z-10 hidden size-8 cursor-pointer items-center justify-center rounded-full border bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground sm:flex";

export function SubCollectionTiles({ collections }: { collections: CollectionWithThumbnail[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update, collections.length]);

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  if (collections.length === 0) return null;

  return (
    <nav aria-label="Shop by type" className="relative mb-6">
      {canPrev && (
        <button
          type="button"
          aria-label="Scroll left"
          className={`${ARROW} left-0`}
          onClick={() => scrollByPage(-1)}
        >
          <ChevronLeftIcon className="size-4" />
        </button>
      )}
      <div
        ref={trackRef}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-1 [scrollbar-width:none] sm:px-10 [&>*:first-child]:ml-auto [&>*:last-child]:mr-auto [&::-webkit-scrollbar]:hidden"
      >
        {collections.map((collection) => (
          <Link
            key={collection.handle}
            href={collection.path}
            className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2 rounded-lg text-center text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:w-28"
          >
            <div className="relative size-24 overflow-hidden rounded-lg bg-muted sm:size-28">
              {collection.thumbnail ? (
                <Image
                  alt=""
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  fill
                  sizes="112px"
                  src={collection.thumbnail.url}
                />
              ) : (
                <ImagePlaceholder className="size-full" />
              )}
            </div>
            <span className="leading-tight group-hover:underline">{collection.title}</span>
          </Link>
        ))}
      </div>
      {canNext && (
        <button
          type="button"
          aria-label="Scroll right"
          className={`${ARROW} right-0`}
          onClick={() => scrollByPage(1)}
        >
          <ChevronRightIcon className="size-4" />
        </button>
      )}
    </nav>
  );
}
