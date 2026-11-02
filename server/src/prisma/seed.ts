import { prisma } from "../lib/prisma.js";
import express from "express";
import path from "node:path";

const app = express();

app.use("/images", express.static(path.join(process.cwd(), "public/images")));

async function main() {

    
      await prisma.product.createMany({
        data: [
          {
            name: "edwin-jeans",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/edwin-jeans-5704-3336525-1.webp",
            stock: 20,
            categoryId: "cat_formal",
            type: "NEW_ARRIVAL",
          },
          {
            name: "fitleasure",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/fitleasure-7254-4849614-1.webp",
            stock: 10,
            categoryId: "cat_formal",
            type: "NEW_ARRIVAL",
          },
          {
            name: "fitwear-6255",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/fitwear-6255-9774904-1.webp",
            stock: 20,
            categoryId: "cat_gym",
            type: "NEW_ARRIVAL",
          },
          {
            name: "g2000-7483",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/g2000-7483-8226404-1.webp",
            stock: 10,
            categoryId: "cat_gym",
            type: "NEW_ARRIVAL",
          },
          {
            name: "hush-puppies",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/hush-puppies-6418-3150784-1.WebP",
            stock: 20,
            categoryId: "cat_party",
            type: "NEW_ARRIVAL",
          },
          {
            name: "moc-4891",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/moc-4891-0451063-2.webp",
            stock: 10,
            categoryId: "cat_party",
            type: "NEW_ARRIVAL",
          },
          {
            name: "nike-2015",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/nike-2015-5049034-1.webp",
            stock: 20,
            categoryId: "cat_casual",
            type: "NEW_ARRIVAL",
          },
          {
            name: "platini-5279-",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/platini-5279-4699025-1",
            stock: 10,
            categoryId: "cat_casual",
            type: "NEW_ARRIVAL",
          },
          {
            name: "trendyol-1120",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/trendyol-1120-5421125-6.webp",
            stock: 20,
            categoryId: "cat_formal",
            type: "NEW_ARRIVAL",
          },
          {
            name: "trendyol-1595",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/trendyol-1595-6080394-1.webp",
            stock: 10,
            categoryId: "cat_formal",
            type: "NEW_ARRIVAL",
          },
          {
            name: "trendyol-5087",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 150000,
            imageUrl: "/images/trendyol-5087-7780805-4.webp",
            stock: 20,
            categoryId: "cat_formal",
            type: "NEW_ARRIVAL",
          },
          {
            name: "under-armour-7310",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
            price: 250000,
            imageUrl: "/images/under-armour-7310-7244953-1.webp",
            stock: 10,
            categoryId: "cat_formal",
            type: "NEW_ARRIVAL",
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