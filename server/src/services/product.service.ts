import { prisma } from "../lib/prisma";

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? "http://localhost:5000";

function toPublicImageUrl(imageUrl: string): string {
    const match = imageUrl.match(/images\/(.+)$/i);
    if (!match) return imageUrl;
    return `${PUBLIC_BASE_URL}/images/${match[1]}`;
}

export async function getAllProducts() {
    const products = await prisma.product.findMany();

    return products.map((product) => ({
        ...product,
        price: Number(product.price),
        imageUrl: toPublicImageUrl(product.imageUrl),
    }));
}

