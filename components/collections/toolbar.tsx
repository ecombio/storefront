import { ChevronDownIcon, SlidersHorizontalIcon } from "lucide-react";
import type { ReactNode } from "react";

import { ProductsGridSkeleton } from "@/components/product/products-grid";
import { PRODUCTS_PER_PAGE } from "@/lib/collections";
import type { Filter, PriceRange } from "@/lib/filters/types";

import { CollectionActiveFilterCountBadge } from "./collection-browse-provider";
import { FilterPendingScope } from "./filter-pending-context";
import { FilterSidebarToggle, ViewToggle } from "./filter-sidebar-layout";
import { FilterSidebarSheet } from "./filter-sidebar-sheet";
import { CollectionFilters } from "./filters";
import { CollectionsSortSelect } from "./sort-select";

interface BrowseToolbarProps {
  facetsPromise: Promise<{ filters: Filter[]; priceRange?: PriceRange }>;
  hideFilterTriggerOnDesktop?: boolean;
  resultCount?: ReactNode;
  sortExclude?: string[];
}

export function BrowseToolbar({
  facetsPromise,
  hideFilterTriggerOnDesktop,
  resultCount,
  sortExclude,
}: BrowseToolbarProps) {
  return (
    <ToolbarLayout
      filterSheet={
        <FilterSidebarSheet
          label="Filters"
          trigger={
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 text-sm font-medium"
            >
              <SlidersHorizontalIcon className="size-4" />
              <span>Filters</span>
              <CollectionActiveFilterCountBadge />
            </button>
          }
        >
          <FilterPendingScope>
            <CollectionFilters facetsPromise={facetsPromise} />
          </FilterPendingScope>
        </FilterSidebarSheet>
      }
      hideFilterSheetOnDesktop={hideFilterTriggerOnDesktop}
      resultCount={resultCount}
      sortSelect={<CollectionsSortSelect exclude={sortExclude} />}
    />
  );
}

interface BrowseFallbackProps {
  resultCount?: ReactNode;
}

export function BrowseFallback({ resultCount }: BrowseFallbackProps) {
  return (
    <>
      <ToolbarLayout
        filterSheet={
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 text-sm font-medium"
          >
            <SlidersHorizontalIcon className="size-4" />
            <span>Filters</span>
          </button>
        }
        resultCount={resultCount}
        sortSelect={
          <div className="flex h-9 w-fit items-center justify-between gap-2 rounded-md bg-transparent px-0 py-2 text-sm whitespace-nowrap">
            <span>Sort</span>
            <ChevronDownIcon className="size-4 text-muted-foreground opacity-50" />
          </div>
        }
      />
      <ProductsGridSkeleton
        count={PRODUCTS_PER_PAGE}
        className="sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      />
    </>
  );
}

interface ToolbarLayoutProps {
  filterSheet: ReactNode;
  hideFilterSheetOnDesktop?: boolean;
  resultCount?: ReactNode;
  sortSelect: ReactNode;
}

function ToolbarLayout({
  filterSheet,
  hideFilterSheetOnDesktop,
  resultCount,
  sortSelect,
}: ToolbarLayoutProps) {
  return (
    <div className="flex items-center gap-5">
      <div className={hideFilterSheetOnDesktop ? "lg:hidden" : undefined}>{filterSheet}</div>
      {hideFilterSheetOnDesktop ? <FilterSidebarToggle /> : null}
      <div className="ml-auto flex items-center gap-5">
        {resultCount !== undefined && (
          <div className="hidden items-center text-sm text-muted-foreground sm:flex">
            {resultCount}
          </div>
        )}
        {sortSelect}
        {hideFilterSheetOnDesktop ? <ViewToggle /> : null}
      </div>
    </div>
  );
}
