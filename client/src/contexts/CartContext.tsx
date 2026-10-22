
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
  } from "react";
  
  import { cartService } from "../services/cart.service";
  import type { Cart } from "../types/cart";
  
  interface CartContextValue {
    cart: Cart | null;
    loading: boolean;
    addToCart: (
      productId: string,
      quantity: number,
    ) => Promise<void>;
    refreshCart: () => Promise<void>;
  }
  
  const CartContext = createContext<CartContextValue | undefined>(
    undefined,
  );
  
  export function CartProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
  
    const refreshCart = useCallback(async () => {
      try {
        const result = await cartService.getCart();
        setCart(result);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    }, []);
  
    useEffect(() => {
      // Memuat keranjang ketika aplikasi dibuka.
      // GET /cart memerlukan autentikasi.
      void refreshCart();
    }, [refreshCart]);
  
    const addToCart = async (
      productId: string,
      quantity: number,
    ) => {
      setLoading(true);
  
      try {
        // Backend menyimpan item dan mengembalikan
        // kondisi keranjang terbaru.
        const updatedCart = await cartService.addItem(
          productId,
          quantity,
        );
  
        setCart(updatedCart);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <CartContext.Provider
        value={{ cart, loading, addToCart, refreshCart }}
      >
        {children}
      </CartContext.Provider>
    );
  }
  
  export function useCart() {
    const context = useContext(CartContext);
  
    if (!context) {
      throw new Error(
        "useCart must be used inside CartProvider",
      );
    }
  
    return context;
  }
  