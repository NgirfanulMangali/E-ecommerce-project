import { prisma } from "../lib/prisma.js";
import { HttpError, type CartResponse } from "../types/cart.type.js";

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? "http://localhost:5000";

function toPublicImageUrl(imageUrl: string): string {
  const match = imageUrl.match(/images\/(.+)$/i);
  if (!match) return imageUrl;
  return `${PUBLIC_BASE_URL}/images/${match[1]}`;
}

const cartInclude = {
  items: {
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "asc" as const,
    },
  },
};

function toCartResponse(
  userId: string,
  cart: {
    id: string;
    userId: string;
    items: Array<{
      id: string;
      productId: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        description: string;
        price: unknown;
        imageUrl: string;
        stock: number;
      };
    }>;
  } | null
): CartResponse {
  if (!cart) {
    return {
      id: null,
      userId,
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };
  }

  const items = cart.items.map((item) => {
    const price = Number(item.product.price);
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price,
        imageUrl: toPublicImageUrl(item.product.imageUrl),
        stock: item.product.stock,
      },
      lineTotal: price * item.quantity,
    };
  });

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
}

export async function getCartByUserId(userId: string): Promise<CartResponse> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });

  return toCartResponse(userId, cart);
}

export async function addProductToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<CartResponse> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new HttpError("Product not found", 404);
  }

  const cart = await prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (nextQuantity > product.stock) {
    throw new HttpError("Not enough stock", 400);
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: nextQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  return getCartByUserId(userId);
}
