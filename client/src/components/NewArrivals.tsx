import { useEffect, useState } from "react";
import { getProducts } from "../services/product.service";
import type { Product } from "../types/product";
import ProductCard from "./ProductCard";

const PREVIEW_COUNT = 2;
const PAGE_SIZE = 10;

function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();

        setProducts(data.filter((product) => product.type === "NEW_ARRIVAL"));
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const visibleProducts = showAll
    ? products.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
      )
    : products.slice(0, PREVIEW_COUNT);
  const hasMore = products.length > PREVIEW_COUNT;

  const handleViewAll = () => {
    setShowAll(true);
    setCurrentPage(1);
  };

  return (
    <section className="px-4 pt-10 pb-8 bg-white">
      <div className="max-w-[1240px] mx-auto">
        <h2 className="text-center font-satoshi font-bold text-[36px] leading-[36px] tracking-[-0.02em]">
          NEW ARRIVALS
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              type="NEW_ARRIVAL"
             />
          ))}
        </div>

        {hasMore && !showAll && (
          <button
            type="button"
            onClick={handleViewAll}
            className="mt-8 w-full h-[46px] rounded-full border border-black/10 font-satoshi text-[14px]"
          >
            View All
          </button>
        )}

        {showAll && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => page - 1)}
              disabled={currentPage === 1}
              className="h-[46px] px-6 rounded-full border border-black/10 font-satoshi text-[14px] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-satoshi text-[14px] text-black/60">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={currentPage === totalPages}
              className="h-[46px] px-6 rounded-full border border-black/10 font-satoshi text-[14px] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default NewArrivals;