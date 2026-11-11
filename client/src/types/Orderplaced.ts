

export interface ConfettiPiece {
    left: string;
    top: string;
    w: number;
    h: number;
    color: string;
    rotate: number;
    delay: number;
  };

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";