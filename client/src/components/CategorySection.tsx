import casualBanner from "../assets/resources/banner of casual.png";
import formalBanner from "../assets/resources/banner of formal.png";
import partyBanner from "../assets/resources/banner of party.png";
import gymBanner from "../assets/resources/banner of gym.png";

const categories = [
  { id: 1, image: casualBanner, name: "Casual" },
  { id: 2, image: formalBanner, name: "Formal" },
  { id: 3, image: partyBanner, name: "Party" },
  { id: 4, image: gymBanner, name: "Gym" },
];

function CategorySection() {
  return (
    <section className="px-4 pb-10 bg-white">
      <div className="max-w-310 mx-auto rounded-[22px] bg-[#F0F0F0] p-5 sm:p-8">
        <h2 className="text-center font-satoshi font-bold text-[32px] leading-[32px] tracking-[-0.02em]">
          BROWSE BY DRESS STYLE
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {categories.map((category) => (
            <article
              key={category.id}
              className="relative h-47.5 rounded-[20px] bg-white overflow-hidden"
            >

              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategorySection;
