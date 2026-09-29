"use client";

import { cn } from "cn";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useEffect, useState } from "react";

import { AutoPlayVideo } from "@/components/ui/auto-play-video";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import type { Image as ImageType, Video } from "@/lib/media/types";

import { Lightbox, LightboxTrigger } from "./lightbox";

type MediaItem =
  | { type: "image"; image: ImageType }
  | { type: "placeholder" }
  | { type: "video"; video: Video };

function mediaKey(item: MediaItem) {
  if (item.type === "image") return item.image.url;
  if (item.type === "video") return item.video.url;
  return "placeholder";
}

// The LCP image gets a preload link + eager + fetchpriority=high (`preload` alone no longer implies high).
// Everything else stays lazy so the hidden viewport twin (mobile carousel vs desktop gallery) never downloads.
const LCP_IMAGE_PROPS = { preload: true, fetchPriority: "high" } as const;

const LAZY_IMAGE_PROPS = { loading: "lazy" } as const;

// The desktop gallery fills the 6-of-10 column at `lg`.
const GALLERY_SIZES = "(min-width: 1024px) 60vw, 100vw";

// Desktop-only controls: visible on mouse hover, or when a control inside has keyboard focus.
// Touch devices never show them; they see the counter only.
const SHOW_ON_HOVER =
  "opacity-0 transition-opacity group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100";

function MediaImage({
  item,
  title,
  idx,
  sizes,
  priority,
  className,
}: {
  item: Extract<MediaItem, { type: "image" }>;
  title: string;
  idx: number;
  sizes: string;
  priority: boolean;
  className?: string;
}) {
  return (
    <Image
      src={item.image.url}
      alt={item.image.altText || `${title} image ${idx + 1}`}
      fill
      className={cn("object-cover", className)}
      sizes={sizes}
      {...(priority ? LCP_IMAGE_PROPS : LAZY_IMAGE_PROPS)}
      draggable={false}
    />
  );
}

function MediaVideo({
  item,
  sizes,
  priority,
  className,
}: {
  item: Extract<MediaItem, { type: "video" }>;
  sizes: string;
  priority: boolean;
  className?: string;
}) {
  return (
    <AutoPlayVideo
      src={item.video.url}
      previewImage={
        item.video.previewImage
          ? {
              src: item.video.previewImage.url,
              alt: item.video.previewImage.altText || "",
            }
          : null
      }
      sizes={sizes}
      previewImageFetchPriority={priority ? "high" : "auto"}
      previewImageLoading={priority ? "eager" : "lazy"}
      className={cn("h-full w-full scale-[1.04] object-cover", className)}
    />
  );
}

function Carousel({
  mediaItems,
  title,
  hasColorSlot,
  children,
}: {
  mediaItems: MediaItem[];
  title: string;
  hasColorSlot: boolean;
  children?: ReactNode;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [itemCount, setItemCount] = useState(mediaItems.length);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const scrollToImage = (index: number) => {
    if (!container) return;
    container.scrollTo({
      left: index * container.offsetWidth,
      behavior: "smooth",
    });
    setSelectedIndex(index);
  };
  useEffect(() => {
    if (!container) return;

    // Variant/video items arrive via slot children, so count the rendered DOM, not just mediaItems.
    const sync = () => {
      const width = container.offsetWidth;
      if (width === 0) return;
      const total = Math.max(1, container.children.length);
      setItemCount(total);
      setSelectedIndex(Math.min(Math.max(0, Math.round(container.scrollLeft / width)), total - 1));
    };

    // New media set: snap back to the first slide before observers take over.
    container.scrollTo({ left: 0 });
    sync();

    container.addEventListener("scroll", sync, { passive: true });
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(container);
    const mutationObserver = new MutationObserver(sync);
    mutationObserver.observe(container, { childList: true });

    return () => {
      container.removeEventListener("scroll", sync);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [container]);
  return (
    <div className="grid gap-5">
      <div
        ref={setContainer}
        className="relative overflow-x-auto flex snap-x snap-mandatory overscroll-x-contain scrollbar-hide -mx-5 w-[calc(100%+2.5rem)]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
        {mediaItems.map((item, idx) => {
          const priority = !hasColorSlot && idx === 0;
          return (
            <div
              key={mediaKey(item)}
              className="relative shrink-0 w-full snap-start snap-always overflow-hidden aspect-square"
            >
              {item.type === "video" ? (
                <MediaVideo item={item} sizes="100vw" priority={priority} />
              ) : item.type === "placeholder" ? (
                <ImagePlaceholder className="size-full" />
              ) : (
                <MediaImage item={item} title={title} idx={idx} sizes="100vw" priority={priority} />
              )}
            </div>
          );
        })}
      </div>

      {/* Dot indicators – reserve space but hide when there's only one image */}
      <div className={cn("flex justify-center gap-2", itemCount <= 1 && "invisible")}>
        {Array.from({ length: itemCount }, (_, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => scrollToImage(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              idx === selectedIndex
                ? "bg-foreground w-8"
                : "bg-muted-foreground/30 w-1.5 hover:bg-muted-foreground/50",
            )}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// One slide of the desktop gallery: landscape frame, whole image visible.
function GalleryItem({
  item,
  title,
  idx,
  priority,
}: {
  item: MediaItem;
  title: string;
  idx: number;
  priority: boolean;
}) {
  return (
    <div className="relative aspect-[3/2] w-full shrink-0 snap-start snap-always overflow-hidden bg-background">
      {item.type === "video" ? (
        <MediaVideo item={item} sizes={GALLERY_SIZES} priority={priority} />
      ) : item.type === "placeholder" ? (
        <ImagePlaceholder className="size-full" />
      ) : (
        <LightboxTrigger item={item}>
          <MediaImage
            item={item}
            title={title}
            idx={idx}
            sizes={GALLERY_SIZES}
            priority={priority}
            className="object-contain"
          />
        </LightboxTrigger>
      )}
    </div>
  );
}

const ARROW_BUTTON =
  "absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-slate-700 text-white hover:bg-slate-900";

function Gallery({
  mediaItems,
  title,
  hasColorSlot,
  interactive = true,
  children,
}: {
  mediaItems: MediaItem[];
  title: string;
  hasColorSlot: boolean;
  interactive?: boolean;
  children?: ReactNode;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [itemCount, setItemCount] = useState(mediaItems.length);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const goTo = (index: number) => {
    if (!container) return;
    const next = Math.min(Math.max(index, 0), itemCount - 1);
    container.scrollTo({ left: next * container.offsetWidth, behavior: "smooth" });
    setSelectedIndex(next);
  };

  useEffect(() => {
    if (!container) return;

    // The color image arrives via slot children, so count the rendered DOM, not just mediaItems.
    const sync = () => {
      const width = container.offsetWidth;
      if (width === 0) return;
      const total = Math.max(1, container.children.length);
      setItemCount(total);
      setSelectedIndex(Math.min(Math.max(0, Math.round(container.scrollLeft / width)), total - 1));
    };

    container.scrollTo({ left: 0 });
    sync();

    container.addEventListener("scroll", sync, { passive: true });
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(container);
    const mutationObserver = new MutationObserver(sync);
    mutationObserver.observe(container, { childList: true });

    return () => {
      container.removeEventListener("scroll", sync);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [container]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(selectedIndex + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(selectedIndex - 1);
    }
  };

  const gallery = (
    <div className="group relative w-full">
      <div
        ref={setContainer}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} images`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
        {mediaItems.map((item, idx) => (
          <GalleryItem
            key={mediaKey(item)}
            item={item}
            title={title}
            idx={idx}
            priority={!hasColorSlot && idx === 0}
          />
        ))}
      </div>

      {itemCount > 1 && selectedIndex > 0 ? (
        <button
          type="button"
          aria-label="Previous image"
          onClick={() => goTo(selectedIndex - 1)}
          className={cn(ARROW_BUTTON, "left-3", SHOW_ON_HOVER)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {itemCount > 1 && selectedIndex < itemCount - 1 ? (
        <button
          type="button"
          aria-label="Next image"
          onClick={() => goTo(selectedIndex + 1)}
          className={cn(ARROW_BUTTON, "right-3", SHOW_ON_HOVER)}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      {itemCount > 1 ? (
        <div
          className={cn(
            "absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2",
            SHOW_ON_HOVER,
          )}
        >
          {Array.from({ length: itemCount }, (_, idx) => (
            <button
              type="button"
              key={idx}
              aria-label={`Go to image ${idx + 1}`}
              aria-current={idx === selectedIndex}
              onClick={() => goTo(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === selectedIndex
                  ? "w-10 bg-foreground"
                  : "w-8 bg-foreground/25 hover:bg-foreground/50",
              )}
            />
          ))}
        </div>
      ) : null}

      <span className="pointer-events-none absolute bottom-3 left-4 z-10 text-sm tabular-nums">
        {selectedIndex + 1} / {itemCount}
      </span>

      {/* Decorative: the click falls through to the image, which opens the existing lightbox. */}
      {interactive ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute bottom-3 right-3 z-10 text-foreground",
            SHOW_ON_HOVER,
          )}
        >
          <Maximize2 className="size-5" />
        </span>
      ) : null}
    </div>
  );

  return interactive ? <Lightbox label={title}>{gallery}</Lightbox> : gallery;
}

// Desktop gallery slides for the selected color image(s).
export function ColorImageGalleryItems({ images, title }: { images: ImageType[]; title: string }) {
  return images.map((image, idx) => (
    <GalleryItem
      key={image.url}
      item={{ type: "image", image }}
      title={title}
      idx={idx}
      priority={idx === 0}
    />
  ));
}

export function ColorImageCarouselItems({ images, title }: { images: ImageType[]; title: string }) {
  return images.map((image, idx) => (
    <div
      key={image.url}
      className="relative shrink-0 w-full snap-start snap-always overflow-hidden aspect-square"
    >
      <Image
        src={image.url}
        alt={image.altText || `${title} image ${idx + 1}`}
        fill
        className="object-cover"
        sizes="100vw"
        {...(idx === 0 ? LCP_IMAGE_PROPS : LAZY_IMAGE_PROPS)}
        draggable={false}
      />
    </div>
  ));
}

export function ProductMedia({
  otherImages,
  videos,
  title,
  className,
  desktopSlot,
  mobileSlot,
  footer,
}: {
  otherImages: ImageType[];
  videos: Video[];
  title: string;
  className?: string;
  desktopSlot?: ReactNode;
  mobileSlot?: ReactNode;
  footer?: ReactNode;
}) {
  const sharedMediaItems: MediaItem[] = [
    ...videos.map((video): MediaItem => ({ type: "video", video })),
    ...otherImages.map((image): MediaItem => ({ type: "image", image })),
  ];

  const hasColorSlot = !!mobileSlot || !!desktopSlot;
  const isEmpty = sharedMediaItems.length === 0 && !hasColorSlot;
  const mediaItems: MediaItem[] = isEmpty ? [{ type: "placeholder" }] : sharedMediaItems;
  const mediaSetKey = mediaItems.map(mediaKey).join(",");

  return (
    <div className={className}>
      <div className="lg:hidden">
        <Carousel
          key={mediaSetKey}
          mediaItems={mediaItems}
          title={title}
          hasColorSlot={hasColorSlot}
        >
          {mobileSlot}
        </Carousel>
      </div>
      <div className="hidden lg:block">
        <Gallery
          key={mediaSetKey}
          mediaItems={mediaItems}
          title={title}
          hasColorSlot={hasColorSlot}
          interactive={!isEmpty}
        >
          {desktopSlot}
        </Gallery>
      </div>
      {footer}
    </div>
  );
}
