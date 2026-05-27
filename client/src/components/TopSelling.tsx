import tshirt1 from "../assets/clothes product/formal/mens/trendyol-1120-5421125-6.webp";
import shirt2 from "../assets/clothes product/party/mens/moc-4891-0451063-4.webp";
import top3 from "../assets/clothes product/Gym/mens/under-armour-5012-7244953-2.webp";
import top4 from "../assets/clothes product/formal/womens/platini-5279-4699025-1.webp";
import smallStar from "../assets/resources/small star icon.svg";

const products = [
  {
    id: 1,
    name: "Vertical Striped Shirt",
    price: 212000,
    originalPrice: 224000,
    discountPercent: 5,
    rating: 5,
    image: tshirt1,
  },
  {
    id: 2,
    name: "Courage Graphic T-Shirt",
    price: 145000,
    originalPrice: 152000,
    discountPercent: 5,
    rating: 4,
    image: shirt2,
  },
  {
    id: 3,
    name: "Training Top",
    price: 199000,
    originalPrice: 209000,
    discountPercent: 5,
    rating: 4.5,
    image: top3,
  },
  {
    id: 4,
    name: "Office Essentials",
    price: 179000,
    originalPrice: 189000,
    discountPercent: 5,
    rating: 4.8,
    image: top4,
  },
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function StarRating({ rating }: { rating: number }) {
  const filled = Math.round(rating); // simplify: show rounded stars
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-[2px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <img
            key={i}
            src={smallStar}
            alt=""
            className="w-3.5 h-3.5"
            style={
              i < filled
                ? {
                    // Convert black star SVG into a yellow-ish star.
                    filter:
                      "invert(85%) sepia(90%) saturate(600%) hue-rotate(10deg) brightness(110%)",
                  }
                : { opacity: 0.2 }
            }
          />
        ))}
      </div>
      <span className="font-satoshi text-[12px] text-black/50">
        {rating.toFixed(1)}/5
      </span>
    </div>
  );
}

function TopSelling() {
  return (
    <section className="px-4 pt-10 pb-10 bg-white">
      <div className="max-w-[1240px] mx-auto">
        <h2 className="text-center font-satoshi font-bold text-[36px] leading-[36px] tracking-[-0.02em]">
          TOP SELLING
        </h2>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5">
          {products.map((product) => (
            <article key={product.id}>
              <div className="bg-[#F0EEED] rounded-[14px] px-3 py-4 h-[180px] sm:h-[220px] flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full object-contain"
                />
              </div>

              <h3 className="mt-3 font-satoshi font-semibold text-[12px] leading-[16px] sm:text-[18px] sm:leading-[24px]">
                {product.name}
              </h3>

              <div className="mt-2">
                <StarRating rating={product.rating} />
                <p className="mt-2 font-satoshi text-[12px] text-black/60">
                  -{product.discountPercent}%
                </p>
              </div>

              <div className="mt-1 flex items-end gap-2">
                <p className="font-satoshi font-bold text-[16px] sm:text-[20px] leading-[24px]">
                  {formatRupiah(product.price)}
                </p>
                <p className="font-satoshi text-[12px] text-black/35 line-through leading-[16px]">
                  {formatRupiah(product.originalPrice)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <button className="mt-8 w-full h-[46px] rounded-full border border-black/10 font-satoshi text-[14px]">
          View All
        </button>
      </div>
    </section>
  );
}

export default TopSelling;
