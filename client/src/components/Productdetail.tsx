import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import type { ColorOption, SizeOption, ProductDetail as ProductDetailType } from "../types/Product.type";
import { productService, ApiError } from "../services/Productdetail.service";

// UI-only until the backend exposes real variants — see types/product.type.ts
const COLORS: ColorOption[] = [
  { id: "olive", hex: "#5C6B47", name: "Olive" },
  { id: "forest", hex: "#2F4A3C", name: "Forest" },
  { id: "navy", hex: "#242C42", name: "Navy" },
];

const SIZES: SizeOption[] = [
  { id: "s", label: "Small" },
  { id: "m", label: "Medium" },
  { id: "l", label: "Large" },
  { id: "xl", label: "X-Large" },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].id);
  const [selectedSize, setSelectedSize] = useState<string>(SIZES[2].id);
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await productService.getById(productId, controller.signal);
        setProduct(data);
        setQuantity(1);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProduct();
    return () => controller.abort();
  }, [productId]);

  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () =>
    setQuantity((q) => Math.min(product?.stock ?? 99, q + 1));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center">
        <div className="w-full max-w-sm px-5 pt-5 pb-8 animate-pulse">
          <div className="h-4 w-40 bg-neutral-100 rounded mb-4" />
          <div className="rounded-2xl bg-neutral-100 aspect-square mb-3" />
          <div className="flex gap-3 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-16 h-16 rounded-xl bg-neutral-100" />
            ))}
          </div>
          <div className="h-5 w-2/3 bg-neutral-100 rounded mb-3" />
          <div className="h-4 w-1/3 bg-neutral-100 rounded mb-3" />
          <div className="h-8 w-1/2 bg-neutral-100 rounded" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="w-full max-w-sm px-5 text-center">
          <p className="text-sm text-neutral-500 mb-3">
            {error ?? "Product not found."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-semibold text-neutral-900 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-sm px-5 pt-5 pb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] text-neutral-400 mb-4">
          <Link to="/" className="hover:text-neutral-700">
            Home
          </Link>
          <ChevronRight size={13} className="text-neutral-300" />
          <span>Shop</span>
          <ChevronRight size={13} className="text-neutral-300" />
          <span className="text-neutral-700">{product.type}</span>
        </nav>

        {/* Hero image */}
        <div className="rounded-2xl overflow-hidden bg-neutral-100 aspect-square mb-6">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title & rating */}
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
          {product.name}
        </h1>

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xl font-bold text-neutral-900">
            {currency.format(product.price)}
          </span>
          {isOutOfStock ? (
            <span className="text-xs font-medium text-neutral-500 bg-neutral-100 rounded-full px-2 py-0.5">
              Out of stock
            </span>
          ) : (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
              {product.stock} in stock
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-400 leading-relaxed mt-3">
          {product.description}
        </p>

        <hr className="border-neutral-100 my-5" />

        {/* Colors */}
        <div>
          <span className="text-sm font-medium text-neutral-900">Select Colors</span>
          <div className="flex items-center gap-3 mt-3">
            {COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center ring-1 ring-inset ring-black/5"
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
              >
                {selectedColor === color.id && (
                  <Check size={15} className="text-white" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-neutral-100 my-5" />

        {/* Sizes */}
        <div>
          <span className="text-sm font-medium text-neutral-900">Choose Size</span>
          <div className="flex items-center gap-2 mt-3">
            {SIZES.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSize === size.id
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-500"
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-neutral-100 my-5" />

        {/* Quantity + Add to cart */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-neutral-100 rounded-full px-4 py-3">
            <button onClick={decrement} aria-label="Decrease quantity" className="text-neutral-500">
              <Minus size={16} />
            </button>
            <span className="text-sm font-semibold text-neutral-900 w-4 text-center">
              {quantity}
            </span>
            <button onClick={increment} aria-label="Increase quantity" className="text-neutral-500">
              <Plus size={16} />
            </button>
          </div>

          <button
            disabled={isOutOfStock}
            className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 text-white rounded-full py-3.5 text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={16} />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;