import { useEffect, useState } from "react";
import { getProducts } from "../services/product.service";
import type { Product } from "../types/product";
import ProductCard from "./ProductCard";


function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();

        setProducts(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="px-4 pt-10 pb-8 bg-white">
      <div className="max-w-[1240px] mx-auto">
        <h2 className="text-center font-satoshi font-bold text-[36px] leading-[36px] tracking-[-0.02em]">
          NEW ARRIVALS
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
             />
          ))}
        </div>

        <button className="mt-8 w-full h-[46px] rounded-full border border-black/10 font-satoshi text-[14px]">
          View All
        </button>
      </div>
    </section>
  );
}

export default NewArrivals;