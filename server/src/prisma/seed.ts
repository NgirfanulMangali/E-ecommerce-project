import { prisma } from "../lib/prisma.js";
import express from "express";
import path from "node:path";

const app = express();

app.use("/images", express.static(path.join(process.cwd(), "public/images")));

async function main() {

    
      await prisma.product.createMany({
        data: [
          {
            name: "adidas-0898",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/topselling/adidas-0898.webp",
            stock: 20,
            categoryId: "cat_formal",
            type: "TOP_SELLING",
          },
          {
            name: "avva-3846",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/topselling/avva-3846.webp",
            stock: 10,
            categoryId: "cat_formal",
            type: "TOP_SELLING",
          },
          {
            name: "cotton-on-4495",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/topselling/cotton-on-4495.webp",
            stock: 20,
            categoryId: "cat_gym",
            type: "TOP_SELLING",
          },
          {
            name: "gap-6494",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/topselling/gap-6494.webp",
            stock: 10,
            categoryId: "cat_gym",
            type: "TOP_SELLING",
          },
          {
            name: "lacoste-6694",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/topselling/lacoste-6694.webp",
            stock: 20,
            categoryId: "cat_party",
            type: "TOP_SELLING",
          },
          {
            name: "levi-s-2778",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/topselling/levi-s-2778.webp",
            stock: 10,
            categoryId: "cat_party",
            type: "TOP_SELLING",
          },
          {
            name: "mango-man-7169",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/topselling/mango-man-7169.webp",
            stock: 20,
            categoryId: "cat_casual",
            type: "TOP_SELLING",
          },
          {
            name: "nike-9982",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/topselling/nike-9982.webp",
            stock: 10,
            categoryId: "cat_casual",
            type: "TOP_SELLING",
          },
          {
            name: "tommy-hilfiger",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/topselling/tommy-hilfiger-7934.webp",
            stock: 20,
            categoryId: "cat_formal",
            type: "TOP_SELLING",
          },
          {
            name: "trendyshop-3975",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/topselling/trendyshop-3975.webp",
            stock: 10,
            categoryId: "cat_formal",
            type: "TOP_SELLING",
          },
          {
            name: "twenty-eight-shoes",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/topselling/twenty-eight-shoes-7518.webp",
            stock: 20,
            categoryId: "cat_formal",
            type: "TOP_SELLING",
          },
          {
            name: "under-armour-0350",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/topselling/under-armour-0350.webp",
            stock: 10,
            categoryId: "cat_formal",
            type: "TOP_SELLING",
          },
        ],
      });
    
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