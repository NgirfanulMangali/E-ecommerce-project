import tshirtImage from "../assets/clothes product/formal/mens/trendyol-1120-5421125-1.webp";
import jeansImage from "../assets/clothes product/party/mens/moc-4891-0451063-3.webp";

const products = [
  {
    id: 1,
    name: "T-shirt with Tape Details",
    price: 120000,
    image: tshirtImage,
  },
  {
    id: 2,
    name: "Skinny Fit Jeans",
    price: 240000,
    image: jeansImage,
  },
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

function NewArrivals() {
  return (
    <section className="px-4 pt-10 pb-8 bg-white">
      <div className="max-w-[1240px] mx-auto">
        <h2 className="text-center font-satoshi font-bold text-[36px] leading-[36px] tracking-[-0.02em]">
          NEW ARRIVALS
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

              <p className="mt-1 font-satoshi font-bold text-[24px] leading-[30px]">
                {formatRupiah(product.price)}
              </p>
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

export default NewArrivals;
