import { Suspense } from "react";

import { ProductCard } from "@/components/product-card/product-card";
import { ProductsGridSkeleton } from "@/components/product/products-grid";
import { PRODUCTS_PER_PAGE } from "@/lib/collections";
import { loadMoreCollectionProductsAction } from "@/lib/collections/action";
import { ALL_PRODUCTS_HANDLE } from "@/lib/collections/server";
import { type CollectionAfterItemPage, type CollectionResultsData } from "@/lib/collections/types";
import { loadMoreSearchProductsAction } from "@/lib/search/action";

import { AfterItemList } from "./after-item-list";
import { InfiniteProductGrid } from "./infinite-product-grid";

function Fallback() {
  return (
    <ProductsGridSkeleton
      count={PRODUCTS_PER_PAGE}
      className="sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    />
  );
}

async function Render({
  afterItemPagePromise,
  collectionResultsDataPromise,
}: {
  afterItemPagePromise?: Promise<CollectionAfterItemPage | undefined>;
  collectionResultsDataPromise: Promise<CollectionResultsData>;
}) {
  const [{ collection, dataSearch, result }, afterItemPage] = await Promise.all([
    collectionResultsDataPromise,
    afterItemPagePromise ?? Promise.resolve(undefined),
  ]);
  const after = afterItemPage ? <AfterItemList page={afterItemPage} /> : null;
  const products = result.products;
  if (products.length === 0) {
    return (
      <div className="py-10 text-center">
        <h2 className="mb-2 text-2xl">No products found</h2>
        <p className="text-muted-foreground">No products available</p>
      </div>
    );
  }
  const cards = products.map((product) => (
    <ProductCard key={product.id} product={product} outOfStockText="Out of Stock" />
  ));

  // /collections/all pagination must use the same search backend as its initial page.
  if (collection === ALL_PRODUCTS_HANDLE) {
    return (
      <InfiniteProductGrid
        key={dataSearch}
        initialProducts={products}
        initialPageInfo={result.pageInfo}
        outOfStockText="Out of Stock"
        loadMore={loadMoreSearchProductsAction}
        loadMoreParams={{}}
      >
        {cards}
      </InfiniteProductGrid>
    );
  }
  return (
    <InfiniteProductGrid
      key={dataSearch}
      initialProducts={products}
      initialPageInfo={result.pageInfo}
      outOfStockText="Out of Stock"
      loadMore={loadMoreCollectionProductsAction}
      after={after}
      loadMoreParams={{
        collection,
      }}
    >
      {cards}
    </InfiniteProductGrid>
  );
}

export function CollectionResultsGrid({
  afterItemPagePromise,
  collectionResultsDataPromise,
}: {
  afterItemPagePromise?: Promise<CollectionAfterItemPage | undefined>;
  collectionResultsDataPromise: Promise<CollectionResultsData>;
}) {
  return (
    <Suspense fallback={<Fallback />}>
      <Render
        afterItemPagePromise={afterItemPagePromise}
        collectionResultsDataPromise={collectionResultsDataPromise}
      />
    </Suspense>
  );
}
