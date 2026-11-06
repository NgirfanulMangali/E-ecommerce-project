

export interface ShippingAddress {
    id: string;
    label: string;
    isDefault: boolean;
    recipient: string;
    street: string;
    city: string;
    phone: string;
  }

  export interface PaymentMethod {
    id: string;
    brand: string;
    last4: string;
    isDefault: boolean;
  }

  export interface OrderItem {
    id: string;
    name: string;
    size: string;
    price: number;
    quantity: number;
    imageUrl: string;
  }