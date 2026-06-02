import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "T-shirt with Tape Details",
        description: "T-shirt premium",
        price: 120000,
        imageUrl: "/client/src/assets/clothes product/formal/mens/trendyol-1120-5421125-6.webp",
        stock: 20,
        categoryId: "Formal",
        isNewArrival: true,
        isTopSelling: false,
      },
      {
        name: "Skinny Fit Jeans",
        description: "Skinny fit jeans",
        price: 240000,
        imageUrl: "/client/src/assets/clothes product/party/mens/moc-4891-0451063-2.webp",
        stock: 15,
        categoryId: "Party",
        isNewArrival: true,
        isTopSelling: false,
      },
      {
        name: "Trendyol",
        description: "Under Armour T-shirt",
        price: 200000,
        imageUrl: "/client/src/assets/clothes product/Casual /mens/trendyol-5087-7780805-4.WebP",
        stock: 10,
        categoryId: "Casual",
        isNewArrival: false,
        isTopSelling: true,
      },
      { 
        name: "Under Armour",
        description: "Under Armour T-shirt",
        price: 200000,
        imageUrl: "/client/src/assets/clothes product/Gym/mens/under-armour-7310-7244953-1.webp",
        stock: 10,
        categoryId: "Gym",
        isNewArrival: false,
        isTopSelling: true,
      }

    ],
  });

}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());