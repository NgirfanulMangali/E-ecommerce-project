
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

import { cartService } from "../services/cart.service";
import type { Cart } from "../types/cart";

const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value);

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCart() {
      try {
        const result = await cartService.getCart();

        if (active) {
          setCart(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load your cart.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      active = false;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-4 py-10">
        <p className="text-neutral-500">Loading your cart...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-4 py-10">
        <h1 className="text-3xl font-black uppercase">
          Your cart
        </h1>

        <p role="alert" className="mt-5 text-sm text-red-600">
          {error}
        </p>

        <p className="mt-2 text-sm text-neutral-500">
          Please check your login session and try again.
        </p>
      </main>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = cart?.totalPrice ?? 0;
  const isEmpty = items.length === 0;

  return (
    <div className="mx-auto min-h-screen max-w-md bg-white pb-28 font-sans text-black">
      <div className="border-t border-neutral-200 px-4 pt-4">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm text-neutral-500"
        >
          <Link to="/" className="hover:text-black">
            Home
          </Link>

          <ChevronRight size={14} />

          <span className="text-black">Cart</span>
        </nav>

        <h1 className="mt-4 text-[32px] font-black uppercase leading-none tracking-tight">
          Your cart
        </h1>

        {isEmpty ? (
          <div className="mt-6 rounded-2xl border border-neutral-200 p-6 text-center">
            <ShoppingBag
              size={40}
              className="mx-auto mb-3 text-neutral-400"
            />

            <p className="font-bold">Your cart is empty</p>

            <p className="mt-1 text-sm text-neutral-500">
              Add something to see your order summary.
            </p>

            <Link
              to="/products"
              className="mt-5 inline-flex rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Cart items */}
            <ul className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 p-3.5">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <h2 className="truncate text-base font-bold">
                        {item.product.name}
                      </h2>

                      <p className="mt-1 text-xs text-neutral-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-lg font-bold">
                        {formatPrice(item.lineTotal)}
                      </p>

                      <p className="text-xs text-neutral-500">
                        {formatPrice(item.product.price)} each
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Order Summary */}
            <section
              aria-labelledby="order-summary"
              className="rounded-2xl border border-neutral-200 p-4"
            >
              <h2
                id="order-summary"
                className="text-xl font-bold"
              >
                Order Summary
              </h2>

              <dl className="mt-4 space-y-3 text-base">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">
                    Total items
                  </dt>
                  <dd className="font-bold">
                    {cart?.totalItems ?? 0}
                  </dd>
                </div>

                <div className="flex justify-between border-t border-neutral-200 pt-3">
                  <dt className="font-medium">Subtotal</dt>
                  <dd className="text-xl font-bold">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </div>

      {/* Checkout bar: visual only for now */}
      {!isEmpty && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-neutral-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          <div className="mx-auto max-w-md">
            <Link
              to="/checkout"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-black text-base font-medium text-white"
            >
              Go to Checkout
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
