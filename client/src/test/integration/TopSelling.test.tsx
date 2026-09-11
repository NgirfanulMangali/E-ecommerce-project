import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

import TopSelling from "../../components/TopSelling";

describe("TopSelling - integration", () => {
    it("fetches products from the API and displays TOP_SELLING products", async () => {
        render(<TopSelling />);
      
        expect(
          await screen.findByText("cotton-on-4495")
        ).toBeInTheDocument();
      });
      
    it("displays View All when there are more than two TOP_SELLING products", async () => {
        render(<TopSelling />);
      
        expect(
          await screen.findByText("cotton-on-4495")
        ).toBeInTheDocument();
      
        expect(
          screen.getByRole("button", {
            name: "View All",
          })
        ).toBeInTheDocument();
      });

  it("shows more products after clicking View All", async () => {
    const user = userEvent.setup();

    render(<TopSelling />);

    const viewAllButton = await screen.findByRole("button", {
      name: "View All",
    });

    const initialProducts = screen.getAllByRole("article").length;

    await user.click(viewAllButton);

    await waitFor(() => {
      expect(screen.getAllByRole("article").length).toBeGreaterThan(
        initialProducts
      );
    });
  });

  it("shows pagination when there are more than ten TOP_SELLING products", async () => {
    const user = userEvent.setup();

    render(<TopSelling />);

    const viewAllButton = await screen.findByRole("button", {
      name: "View All",
    });

    await user.click(viewAllButton);

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });
  });
});