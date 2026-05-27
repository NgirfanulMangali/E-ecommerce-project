import star5 from "../assets/resources/Star 5.png";
import leftArrow from "../assets/resources/panah ke kiri.png";
import rightArrow from "../assets/resources/panah ke kanan.png";

function Testimonials() {
  return (
    <section className="bg-[#F7F7F7] py-10 sm:py-16">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
              TESTIMONIALS
            </p>
            <h2 className="mt-3 text-[28px] font-bold text-black sm:text-[40px]">
              OUR HAPPY CUSTOMERS
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_16px_40px_rgba(0,0,0,0.06)]"
            >
              <img src={leftArrow} alt="Previous testimonial" className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
            >
              <img src={rightArrow} alt="Next testimonial" className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[32px] bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.08)] sm:p-10">
            <div className="flex items-center justify-between">
              <img src={star5} alt="5 star rating" className="h-6 w-auto" />
              <span className="text-sm font-medium text-black/60">5.0 Rating</span>
            </div>

            <p className="mt-8 text-base leading-8 text-black/75 sm:text-lg">
              “I’m blown away by the quality and style of the clothes I received from
              ShopCo. From casual wear to elegant dresses, every piece I’ve bought has
              exceeded my expectations.”
            </p>

            <div className="mt-10 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
                S
              </div>
              <div>
                <p className="font-semibold text-base text-black">Sarah M.</p>
                <p className="text-sm text-black/50">Verified Buyer</p>
              </div>
            </div>
          </div>

           
         </div>
      </div>
    </section>
  );
}

export default Testimonials;
