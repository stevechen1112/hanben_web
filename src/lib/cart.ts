export const CART_SESSION_COOKIE = "hb_cart_session";

export interface CartSyncItem {
  variantId: string;
  quantity: number;
}

export interface CartLineItem {
  cartItemId: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  variantId: string;
  variantTitle: string;
  sku: string | null;
  imageUrl: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  subtotal: number;
  availableQuantity: number | null;
  trackInventory: boolean;
}

export interface CartSnapshot {
  id: string | null;
  customerId: string | null;
  items: CartLineItem[];
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  updatedAt: string | null;
}

export function createEmptyCartSnapshot(): CartSnapshot {
  return {
    id: null,
    customerId: null,
    items: [],
    itemCount: 0,
    totalQuantity: 0,
    subtotal: 0,
    updatedAt: null,
  };
}