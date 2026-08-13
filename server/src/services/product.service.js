"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = getAllProducts;
const prisma_1 = require("../lib/prisma");
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? "http://localhost:5000";
function toPublicImageUrl(imageUrl) {
    const match = imageUrl.match(/images\/(.+)$/i);
    if (!match)
        return imageUrl;
    return `${PUBLIC_BASE_URL}/images/${match[1]}`;
}
async function getAllProducts() {
    const products = await prisma_1.prisma.product.findMany();
    return products.map((product) => ({
        ...product,
        price: Number(product.price),
        imageUrl: toPublicImageUrl(product.imageUrl),
    }));
}
