import { prisma } from "../lib/prisma";

async function main() {

    const products = await prisma.product.createMany({

        data: [
            {
                name: "cotton-on-4495",
                description: 'Experience next-level comfort with this innovative Cool Touch Multi-Way Stretch Check Suit Blazer. The sophisticated peak lapel design meets cutting-edge cooling technology, while the multi-way stretch fabric ensures unrestricted movement. Featuring slanted pockets and a half lining, this smart-fit blazer keeps you looking sharp and feeling fresh through your busiest days. The subtle check pattern adds refined character to your formal ensemble.',
                price: 60.00,
                categoryId: "cmqyv8rcn00009tjyu04mwlp1",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/cotton-on-4495.webp",
                stock: 15
            },
            {
                name: "gap-6494",
                description: "The Nike-2015 Women's Long-Sleeve Shirt is a sharp, professional wardrobe staple engineered for the modern career-driven individual. It features a tailored, contouring fit that transitions effortlessly from the corporate desk to evening dinners.",
                price: 45.99,
                categoryId: "cmqyv8rcn00009tjyu04mwlp1",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/gap-6494.webp",
                stock: 12
            },
            {
                name: "lacoste-6694",
                description: "Material Component: 100% Cotton ;Fabric Type: Knitted ;Back Length: 70.0 cm ;Oversize Fit: Extra loose, wide cut. If you do not prefer it too loose, it is recommended to buy 1 size smaller than your own size ;Colors may vary due to light differences in studio shots",
                price: 45.99,
                categoryId: "cmqyv8rcn00009tjyu04mwlp1",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/lacoste-6694.webp",
                stock: 14
            },
             {
                name: "mango-man-7169",
                description: 'Experience next-level comfort with this innovative Cool Touch Multi-Way Stretch Check Suit Blazer. The sophisticated peak lapel design meets cutting-edge cooling technology, while the multi-way stretch fabric ensures unrestricted movement. Featuring slanted pockets and a half lining, this smart-fit blazer keeps you looking sharp and feeling fresh through your busiest days. The subtle check pattern adds refined character to your formal ensemble.',
                price: 80.00,
                categoryId: "cmqyv8rco00019tjy2ak1gpu1",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/mango-man-7169.webp",
                stock: 15
            },
            {
                name: "trendyshop-3975",
                description: "The Nike-2015 Women's Long-Sleeve Shirt is a sharp, professional wardrobe staple engineered for the modern career-driven individual. It features a tailored, contouring fit that transitions effortlessly from the corporate desk to evening dinners.",
                price: 55.99,
                categoryId: "cmqyv8rco00019tjy2ak1gpu1",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/trendyshop-3975.webp",
                stock: 12
            },
            {
                name: "twenty-eight-shoes-7518",
                description: "Material Component: 100% Cotton ;Fabric Type: Knitted ;Back Length: 70.0 cm ;Oversize Fit: Extra loose, wide cut. If you do not prefer it too loose, it is recommended to buy 1 size smaller than your own size ;Colors may vary due to light differences in studio shots",
                price: 85.99,
                categoryId: "cmqyv8rco00019tjy2ak1gpu1",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/twenty-eight-shoes-7518.webp",
                stock: 14
            },
            {
                name: "adidas-0898",
                description: 'Experience next-level comfort with this innovative Cool Touch Multi-Way Stretch Check Suit Blazer. The sophisticated peak lapel design meets cutting-edge cooling technology, while the multi-way stretch fabric ensures unrestricted movement. Featuring slanted pockets and a half lining, this smart-fit blazer keeps you looking sharp and feeling fresh through your busiest days. The subtle check pattern adds refined character to your formal ensemble.',
                price: 70.00,
                categoryId: "cmqyv8rco00029tjydu1sfi53",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/adidas-0898.webp",
                stock: 15
            },
            {
                name: "nike-9982",
                description: "The Nike-2015 Women's Long-Sleeve Shirt is a sharp, professional wardrobe staple engineered for the modern career-driven individual. It features a tailored, contouring fit that transitions effortlessly from the corporate desk to evening dinners.",
                price: 65.99,
                categoryId: "cmqyv8rco00029tjydu1sfi53",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/nike-9982.webp",
                stock: 12
            },
            {
                name: "under-armour-0350",
                description: "Material Component: 100% Cotton ;Fabric Type: Knitted ;Back Length: 70.0 cm ;Oversize Fit: Extra loose, wide cut. If you do not prefer it too loose, it is recommended to buy 1 size smaller than your own size ;Colors may vary due to light differences in studio shots",
                price: 25.99,
                categoryId: "cmqyv8rco00029tjydu1sfi53",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/under-armour-0350.webp",
                stock: 14
            },
             {
                name: "avva-3846",
                description: 'Experience next-level comfort with this innovative Cool Touch Multi-Way Stretch Check Suit Blazer. The sophisticated peak lapel design meets cutting-edge cooling technology, while the multi-way stretch fabric ensures unrestricted movement. Featuring slanted pockets and a half lining, this smart-fit blazer keeps you looking sharp and feeling fresh through your busiest days. The subtle check pattern adds refined character to your formal ensemble.',
                price: 90.00,
                categoryId: "cmqyv8rco00039tjyjtvoia1g",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/avva-3846.webp",
                stock: 15
            },
            {
                name: "levi-s-2778",
                description: "The Nike-2015 Women's Long-Sleeve Shirt is a sharp, professional wardrobe staple engineered for the modern career-driven individual. It features a tailored, contouring fit that transitions effortlessly from the corporate desk to evening dinners.",
                price: 95.99,
                categoryId: "cmqyv8rco00039tjyjtvoia1g",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/levi-s-2778.webp",
                stock: 12
            },
            {
                name: "tommy-hilfiger-7934",
                description: "Material Component: 100% Cotton ;Fabric Type: Knitted ;Back Length: 70.0 cm ;Oversize Fit: Extra loose, wide cut. If you do not prefer it too loose, it is recommended to buy 1 size smaller than your own size ;Colors may vary due to light differences in studio shots",
                price: 96.99,
                categoryId: "cmqyv8rco00039tjyjtvoia1g",
                type: "TOP_SELLING",
                imageUrl: "../../public/images/topselling/tommy-hilfiger-7934.webp",
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