import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, MapPin, CreditCard } from "lucide-react";

import { cartService } from "../services/cart.service";
import type { Cart } from "../types/cart";
import type { ShippingAddress, PaymentMethod } from "../types/Checkout";

// Data sementara — ganti dengan data dari backend nanti
const ADDRESS: ShippingAddress = {
  id: "addr-1",
  label: "Home",
  isDefault: true,
  recipient: "John Doe",
  street: "123 Main Street",
  city: "New York, NY 10001",
  phone: "+1 234 567 8901",
};

const PAYMENT: PaymentMethod = {
  id: "pay-1",
  brand: "Visa",
  last4: "4242",
  isDefault: true,
};

const SHIPPING_FEE = 10;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

interface SectionHeaderProps {
  title: string;
  onChange?: () => void;
}

function SectionHeader({ title, onChange }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[15px] font-semibold text-neutral-900">{title}</h2>
      {onChange && (
        <button
          onClick={onChange}
          className="text-sm font-medium text-neutral-900"
        >
          Change
        </button>
      )}
    </div>
  );
}

function DefaultBadge() {
  return (
    <span className="text-[10px] font-medium bg-neutral-900 text-white rounded-full px-2 py-0.5">
      Default
    </span>
  );
}

export function Checkout() {
  const navigate = useNavigate();
  const [isPlacing, setIsPlacing] = useState(false);

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Ambil data keranjang dari server saat halaman checkout dibuka
  useEffect(() => {
    let active = true;

    async function loadCart() {
      try {
        const result = await cartService.getCart();
        if (active) setCart(result);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load your cart.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadCart();

    return () => {
      active = false;
    };
  }, []);

  const items = cart?.items ?? [];
  const subtotal = cart?.totalPrice ?? 0;
  const total = items.length > 0 ? subtotal + SHIPPING_FEE : 0;

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    try {
      // TODO: panggil service order, mis. orderService.create({ addressId, paymentId })
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      setIsPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white px-5 py-10">
        <p className="text-neutral-500">Loading your order...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white px-5 py-10">
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
        <Link to="/cart" className="mt-4 inline-block text-sm font-medium underline">
          Back to cart
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white px-5 py-10">
        <p className="font-bold">Your cart is empty</p>
        <Link
          to="/products"
          className="mt-4 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full relative">
        {/* Header */}
        <header className="flex items-center gap-4 px-5 pt-5 pb-4">
          <button
            onClick={() => navigate("/cart")}
            aria-label="Go back"
            className="text-neutral-900"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-lg font-medium text-neutral-900">Checkout</h1>
        </header>

        <main className="px-5 pb-36">
          {/* Shipping address */}
          <section className="mt-3">
            <SectionHeader title="Shipping Address" onChange={() => {}} />
            <div className="flex items-start gap-3 bg-neutral-50 border border-neutral-100 rounded-2xl p-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-neutral-900 flex items-center justify-center">
                <MapPin size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-900">
                    {ADDRESS.label}
                  </span>
                  {ADDRESS.isDefault && <DefaultBadge />}
                </div>
                <p className="text-sm text-neutral-900 mt-1">
                  {ADDRESS.recipient}
                </p>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {ADDRESS.street}
                  <br />
                  {ADDRESS.city}
                </p>
                <p className="text-xs text-neutral-500 mt-1">{ADDRESS.phone}</p>
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="mt-6">
            <SectionHeader title="Payment Method" onChange={() => {}} />
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-100 rounded-2xl p-4">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-neutral-900 flex items-center justify-center">
                <CreditCard size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900">
                  {PAYMENT.brand}
                </p>
                <p className="text-xs text-neutral-500 tracking-wide">
                  •••• •••• •••• {PAYMENT.last4}
                </p>
              </div>
              {PAYMENT.isDefault && <DefaultBadge />}
            </div>
          </section>

          {/* Order items — sekarang dari cart */}
          <section className="mt-6">
            <SectionHeader title={`Order Items (${cart?.totalItems ?? items.length})`} />
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center gap-3 bg-neutral-50 border border-neutral-100 rounded-2xl p-3"
                >
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {currency.format(item.product.price)} each
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 mt-1">
                      {currency.format(item.lineTotal)}
                    </p>
                  </div>
                  <span className="self-end text-xs text-neutral-500">
                    x{item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </main>

        {/* Sticky footer */}
        <div className="fixed bottom-0 inset-x-0">
          <div className="w-full bg-white border-t border-neutral-100 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-1 text-sm text-neutral-500">
              <span>Subtotal</span>
              <span>{currency.format(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between mb-2 text-sm text-neutral-500">
              <span>Shipping</span>
              <span>{currency.format(SHIPPING_FEE)}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-900">Total</span>
              <span className="text-xl font-bold text-neutral-900">
                {currency.format(total)}
              </span>
            </div>
            <Link to="/orderplaced">
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing}
              className="w-full bg-neutral-900 text-white rounded-full py-3.5 text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:bg-neutral-400"
            >
                {isPlacing ? "Placing order..." : "Place Order"}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;