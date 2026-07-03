import type { Product, ProductType } from "../types/product";

type ProductCardProps = {
  product: Product;
  type?: ProductType;
};

const formatUSD = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

function ProductCard({ product }: ProductCardProps) {
  return (
    <article>
      <div className="bg-[#F0EEED] rounded-[14px] px-3 py-4 h-[180px] sm:h-[220px] flex items-center justify-center">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="max-h-full object-contain"
        />
      </div>

      <h3 className="mt-3 font-satoshi font-semibold text-[12px] leading-[16px] sm:text-[18px] sm:leading-[24px]">
        {product.name}
      </h3>

      <p className="mt-1 font-satoshi font-bold text-[24px] leading-[30px]">
        {formatUSD(product.price)}
      </p>
    </article>
    
  );
}

export default ProductCard;