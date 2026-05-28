import heroBanner from "../assets/resources/banner hero.png";
import smallStar from "../assets/resources/small star icon.svg";
import bigStar from "../assets/resources/big star icon.svg";
import versace from "../assets/resources/versace.svg";
import zara from "../assets/resources/zara.svg";
import gucci from "../assets/resources/gucci.svg";
import prada from "../assets/resources/prada.svg";
import calvinKlein from "../assets/resources/calvin klein.svg";
import findClothes from "../assets/resources/FIND CLOTHES THAT MATCHES YOUR STYLE.png";

function Hero() {
  return (
    <section className="mt-6">
      <div className="max-w-[1240px] mx-auto">
        <div className="bg-[#F2F0F1] px-4 pt-9 sm:px-8 sm:pt-12">
          <img src={findClothes} alt="Find clothes that matches your style" className="h-[93px] w-[315px]" />

          <p className="font-satoshi text-[14px] leading-[20px] text-black/60 mt-5 max-w-[350px] sm:text-[16px] sm:leading-[24px] sm:max-w-[560px]">
            Browse through our diverse range of meticulously crafted garments,
            designed to bring out your individuality and cater to your sense of
            style.
          </p>

          <button className="mt-6 h-[52px] w-full max-w-[360px] rounded-full bg-black text-white font-satoshi text-[16px] font-medium sm:max-w-[210px]">
            Shop Now
          </button>

          <div className="mt-6 flex flex-wrap items-start gap-y-4 text-center sm:text-left">
            <div className="w-1/2 border-r border-black/10 pr-3 sm:w-auto sm:pr-8">
              <p className="font-satoshi text-[24px] font-bold leading-none sm:text-[40px]">
                200+
              </p>
              <p className="font-satoshi text-[12px] text-black/60 mt-1 sm:text-[14px]">
                International Brands
              </p>
            </div>

            <div className="w-1/2 pl-3 sm:w-auto sm:px-8 sm:border-r sm:border-black/10">
              <p className="font-satoshi text-[24px] font-bold leading-none sm:text-[40px]">
                2,000+
              </p>
              <p className="font-satoshi text-[12px] text-black/60 mt-1 sm:text-[14px]">
                High-Quality Products
              </p>
            </div>

            <div className="w-full sm:w-auto sm:pl-8">
              <p className="font-satoshi text-[24px] font-bold leading-none sm:text-[40px]">
                30,000+
              </p>
              <p className="font-satoshi text-[12px] text-black/60 mt-1 sm:text-[14px]">
                Happy Customers
              </p>
            </div>
          </div>

          <div className="relative mt-7 sm:mt-10">
            <img
              src={smallStar}
              alt="decorative star"
              className="absolute left-3 top-[37%] w-7 sm:left-8 sm:w-9"
            />
            <img
              src={bigStar}
              alt="decorative star"
              className="absolute right-4 top-[20%] w-11 sm:right-10 sm:w-[62px]"
            />

            <img
              src={heroBanner}
              alt="models wearing trendy outfits"
              className="w-full object-cover sm:max-h-[560px] sm:object-contain"
            />
          </div>
        </div>
      </div>

      <div className="bg-black py-5 px-5 sm:px-8">
        <div className="max-w-[1240px] mx-auto grid grid-cols-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between gap-y-4">
          <img src={versace} alt="Versace" className="h-[23px] w-[116px]" />
          <img src={zara} alt="Zara" className="h-[26px] w-[63px] justify-self-center" />
          <img src={gucci} alt="Gucci" className="h-[25px] w-[109px] justify-self-end" />
          <img src={prada} alt="Prada" className="h-[21px] w-[127px] col-span-1" />
          <img
            src={calvinKlein}
            alt="Calvin Klein"
            className="h-[21px] w-[134px] col-span-2 justify-self-center sm:justify-self-auto"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;
