import type { Product } from "../types/product";

type ProductCardProps = {
  product: Product;
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
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
        {formatRupiah(product.price)}
      </p>
    </article>
  );
}

export default ProductCard;