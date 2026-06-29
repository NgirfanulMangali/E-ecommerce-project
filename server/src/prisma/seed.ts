import { prisma } from "../lib/prisma";

async function main() {

    const products = await prisma.product.createMany({

        data: [
            {
                name: "Fitleasure",
                description: 'Experience next-level comfort with this innovative Cool Touch Multi-Way Stretch Check Suit Blazer. The sophisticated peak lapel design meets cutting-edge cooling technology, while the multi-way stretch fabric ensures unrestricted movement. Featuring slanted pockets and a half lining, this smart-fit blazer keeps you looking sharp and feeling fresh through your busiest days. The subtle check pattern adds refined character to your formal ensemble.',
                price: 60.00,
                categoryId: "cmqyv8rco00039tjyjtvoia1g",
                type: "NEW_ARRIVAL",
                imageUrl: "../../public/images/fitleasure-7254-4849614-1.webp",
                stock: 15
            },
            {
                name: "Moc-4891",
                description: "The Nike-2015 Women's Long-Sleeve Shirt is a sharp, professional wardrobe staple engineered for the modern career-driven individual. It features a tailored, contouring fit that transitions effortlessly from the corporate desk to evening dinners.",
                price: 45.99,
                categoryId: "cmqyv8rco00039tjyjtvoia1g",
                type: "NEW_ARRIVAL",
                imageUrl: "../../public/images/moc-4891-0451063-2.webp",
                stock: 12
            },
            {
                name: "Trendyol-1595",
                description: "Material Component: 100% Cotton ;Fabric Type: Knitted ;Back Length: 70.0 cm ;Oversize Fit: Extra loose, wide cut. If you do not prefer it too loose, it is recommended to buy 1 size smaller than your own size ;Colors may vary due to light differences in studio shots",
                price: 45.99,
                categoryId: "cmqyv8rco00039tjyjtvoia1g",
                type: "NEW_ARRIVAL",
                imageUrl: "../../public/images/trendyol-1595-6080394-1.webp.webp",
                stock: 14
            }
        ]
    })
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });