import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router";


type OrderPlacedProps = {
  orderId: string;
  estimatedDelivery: string;
  onContinueShopping?: () => void;
  onTrackOrder?: () => void;
};

type ConfettiPiece = {
  left: string;
  top: string;
  w: number;
  h: number;
  color: string;
  rotate: number;
  delay: number;
};

// Posisi confetti dibuat tetap supaya tampilan konsisten di setiap render.
const CONFETTI: ConfettiPiece[] = [
  { left: "3%", top: "40%", w: 8, h: 4, color: "#d1d5db", rotate: 20, delay: 0 },
  { left: "92%", top: "34%", w: 8, h: 14, color: "#f9a8d4", rotate: -20, delay: 0.1 },
  { left: "88%", top: "55%", w: 8, h: 14, color: "#f472b6", rotate: 25, delay: 0.2 },
  { left: "2%", top: "62%", w: 8, h: 8, color: "#86efac", rotate: 40, delay: 0.15 },
  { left: "10%", top: "52%", w: 4, h: 4, color: "#e5e7eb", rotate: 0, delay: 0.3 },
  { left: "62%", top: "28%", w: 6, h: 8, color: "#7dd3fc", rotate: 35, delay: 0.05 },
  { left: "78%", top: "62%", w: 6, h: 10, color: "#a5f3fc", rotate: -30, delay: 0.25 },
  { left: "35%", top: "68%", w: 8, h: 4, color: "#fde68a", rotate: 15, delay: 0.35 },
  { left: "52%", top: "74%", w: 4, h: 8, color: "#fcd34d", rotate: -15, delay: 0.1 },
  { left: "20%", top: "76%", w: 10, h: 6, color: "#bae6fd", rotate: 10, delay: 0.4 },
  { left: "70%", top: "82%", w: 8, h: 8, color: "#fda4af", rotate: 45, delay: 0.2 },
  { left: "90%", top: "86%", w: 8, h: 4, color: "#d1d5db", rotate: 0, delay: 0.3 },
  { left: "6%", top: "88%", w: 6, h: 4, color: "#cbd5e1", rotate: -10, delay: 0.45 },
  { left: "45%", top: "58%", w: 4, h: 4, color: "#fbcfe8", rotate: 0, delay: 0.5 },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-12 w-12 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" className="op-check" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h11v10H3z" />
      <path d="M14 10h4l3 3v3h-7" />
      <circle cx="7.5" cy="17.5" r="1.8" />
      <circle cx="17.5" cy="17.5" r="1.8" />
    </svg>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="truncate text-sm font-semibold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

export default function OrderPlaced({
  orderId,
  estimatedDelivery,
  onContinueShopping,
  onTrackOrder,
}: OrderPlacedProps) {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-neutral-50 px-4 pb-6 pt-16 font-sans">
      {/* Animasi: badge muncul, centang tergambar, confetti jatuh */}
      <style>{`
        @keyframes op-pop {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes op-draw {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes op-fall {
          from { transform: translateY(-24px) rotate(var(--r)); opacity: 0; }
          to { transform: translateY(0) rotate(var(--r)); opacity: 1; }
        }
        .op-badge { animation: op-pop 0.5s ease-out both; }
        .op-check { stroke-dasharray: 24; stroke-dashoffset: 24; animation: op-draw 0.4s 0.35s ease-out forwards; }
        .op-confetti { animation: op-fall 0.7s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .op-badge, .op-confetti { animation: none; }
          .op-check { animation: none; stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Confetti dekoratif */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {CONFETTI.map((p, i) => (
          <span
            key={i}
            className="op-confetti absolute block rounded-[1px]"
            style={
              {
                left: p.left,
                top: p.top,
                width: p.w,
                height: p.h,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                "--r": `${p.rotate}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Konten utama */}
      <section className="relative flex flex-col items-center text-center">
        <div className="op-badge flex h-36 w-36 items-center justify-center rounded-full bg-neutral-900 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.45)]">
          <CheckIcon />
        </div>

        <h1 className="mt-10 text-2xl font-semibold text-neutral-900">Order Placed!</h1>
        <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-neutral-600">
          Your order has been placed successfully. Thank you for shopping with us!
        </p>

        <div className="mt-8 w-full space-y-4 rounded-2xl border border-neutral-200 bg-neutral-100/70 p-4 text-left">
          <InfoRow icon={<ReceiptIcon />} label="Order ID" value={orderId} />
          <InfoRow icon={<TruckIcon />} label="Estimated Delivery" value={estimatedDelivery} />
        </div>
      </section>

      {/* Tombol aksi menempel di bawah */}
      <div className="relative mt-auto space-y-3 pt-10">
        <Link to="/">
        <button
          type="button"
          onClick={onContinueShopping}
          className="w-full rounded-xl bg-black py-3.5 text-sm font-semibold text-white transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Continue Shopping
        </button>
        </Link>
        <button
          type="button"
          onClick={onTrackOrder}
          className="w-full rounded-xl border border-neutral-400 bg-transparent py-3.5 text-sm font-medium text-neutral-900 transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Track Order
        </button>
      </div>
    </main>
  );
}