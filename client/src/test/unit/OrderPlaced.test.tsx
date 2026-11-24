import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import OrderPlaced from "../../components/Orderplaced";
import type { OrderStatus } from "../../types/Orderplaced";

type Props = Parameters<typeof OrderPlaced>[0];

function renderOrderPlaced(props: Partial<Props> = {}) {
  const order = props.order ?? { id: "ORD-12345", status: "PENDING" as const };

  return render(
    <MemoryRouter initialEntries={["/orderplaced"]}>
      <Routes>
        <Route
          path="/orderplaced"
          element={<OrderPlaced {...props} order={order} />}
        />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("OrderPlaced", () => {
  describe("konten", () => {
    it("menampilkan judul dan pesan terima kasih", () => {
      renderOrderPlaced();

      expect(
        screen.getByRole("heading", { name: "Order Placed!" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Your order has been placed successfully/),
      ).toBeInTheDocument();
    });

    it("menampilkan Order ID dari props", () => {
      renderOrderPlaced({ order: { id: "ORD-98765", status: "PENDING" } });

      expect(screen.getByText("Order ID").nextElementSibling).toHaveTextContent(
        "ORD-98765",
      );
    });

    it.each<[OrderStatus, string]>([
      ["PENDING", "Pending"],
      ["PAID", "Paid"],
      ["SHIPPED", "Shipped"],
      ["COMPLETED", "Completed"],
      ["CANCELLED", "Cancelled"],
    ])("status %s ditampilkan sebagai '%s'", (status, label) => {
      renderOrderPlaced({ order: { id: "ORD-1", status } });

      expect(screen.getByText("Status").nextElementSibling).toHaveTextContent(
        label,
      );
    });
  });

  describe("confetti dekoratif", () => {
    it("merender 14 potongan confetti di dalam container aria-hidden", () => {
      const { container } = renderOrderPlaced();

      const pieces = container.querySelectorAll(".op-confetti");
      expect(pieces).toHaveLength(14);
      expect(pieces[0].parentElement).toHaveAttribute("aria-hidden", "true");
    });

    it("memakai posisi dan ukuran tetap dari data CONFETTI", () => {
      const { container } = renderOrderPlaced();

      const first = container.querySelector(".op-confetti") as HTMLElement;
      expect(first.style.left).toBe("3%");
      expect(first.style.top).toBe("40%");
      expect(first.style.width).toBe("8px");
      expect(first.style.height).toBe("4px");
      expect(first.style.animationDelay).toBe("0s");
      expect(first.style.getPropertyValue("--r")).toBe("20deg");
    });

    it("tidak mengekspos ikon SVG ke accessibility tree", () => {
      renderOrderPlaced();

      expect(screen.queryAllByRole("img")).toHaveLength(0);
    });

    it("menyertakan aturan prefers-reduced-motion di style animasi", () => {
      const { container } = renderOrderPlaced();

      expect(container.querySelector("style")?.textContent).toContain(
        "prefers-reduced-motion: reduce",
      );
    });
  });

  describe("tombol aksi", () => {
    it("Continue Shopping adalah link ke '/'", () => {
      renderOrderPlaced();

      expect(
        screen.getByRole("link", { name: "Continue Shopping" }),
      ).toHaveAttribute("href", "/");
    });

    it("klik Continue Shopping memanggil onContinueShopping", async () => {
      const user = userEvent.setup();
      const onContinueShopping = vi.fn();
      renderOrderPlaced({ onContinueShopping });

      await user.click(
        screen.getByRole("button", { name: "Continue Shopping" }),
      );

      expect(onContinueShopping).toHaveBeenCalledTimes(1);
    });

    it("klik Continue Shopping berpindah ke halaman '/'", async () => {
      const user = userEvent.setup();
      renderOrderPlaced();

      await user.click(
        screen.getByRole("button", { name: "Continue Shopping" }),
      );

      expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it("klik Track Order memanggil onTrackOrder tanpa berpindah halaman", async () => {
      const user = userEvent.setup();
      const onTrackOrder = vi.fn();
      renderOrderPlaced({ onTrackOrder });

      await user.click(screen.getByRole("button", { name: "Track Order" }));

      expect(onTrackOrder).toHaveBeenCalledTimes(1);
      expect(
        screen.getByRole("heading", { name: "Order Placed!" }),
      ).toBeInTheDocument();
    });

    it("tidak error saat callback opsional tidak diberikan", async () => {
      const user = userEvent.setup();
      renderOrderPlaced();

      await expect(
        user.click(screen.getByRole("button", { name: "Track Order" })),
      ).resolves.toBeUndefined();
    });

    it("kedua tombol bertipe 'button'", () => {
      renderOrderPlaced();

      expect(
        screen.getByRole("button", { name: "Continue Shopping" }),
      ).toHaveAttribute("type", "button");
      expect(
        screen.getByRole("button", { name: "Track Order" }),
      ).toHaveAttribute("type", "button");
    });
  });
});