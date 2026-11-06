import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard } from "lucide-react";

interface ShippingAddress {
  id: string;
  label: string;
  isDefault: boolean;
  recipient: string;
  street: string;
  city: string;
  phone: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  isDefault: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

// Data sementara — ganti dengan data dari backend/service/cart kamu
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

const ITEMS: OrderItem[] = [
  {
    id: "1",
    name: "Air Force 1 GORE-TEX Vibram",
    size: "9",
    price: 150,
    quantity: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    name: "Nike Dunk Low Retro SE",
    size: "10",
    price: 120,
    quantity: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    name: "Air Jordan 1 Low SE",
    size: "8",
    price: 130,
    quantity: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=200&h=200&fit=crop",
  },
];

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

  const subtotal = ITEMS.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + SHIPPING_FEE;

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    try {
      // TODO: panggil service order, mis. orderService.create({ items, addressId, paymentId })
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full relative">
        {/* Header */}
        <header className="flex items-center gap-4 px-5 pt-5 pb-4">
          <button
            onClick={() => navigate(-1)}
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

          {/* Order items */}
          <section className="mt-6">
            <SectionHeader title={`Order Items (${ITEMS.length})`} />
            <ul className="flex flex-col gap-3">
              {ITEMS.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 bg-neutral-50 border border-neutral-100 rounded-2xl p-3"
                >
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-neutral-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Size: {item.size}
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 mt-1">
                      {currency.format(item.price)}
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
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-900">Total</span>
              <span className="text-xl font-bold text-neutral-900">
                {currency.format(total)}
              </span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing}
              className="w-full bg-neutral-900 text-white rounded-full py-3.5 text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:bg-neutral-400"
            >
              {isPlacing ? "Placing order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;