"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createAnalyticsItem, trackAddToCart } from "@/lib/analytics";
import { createEmptyCartSnapshot, type CartSnapshot } from "@/lib/cart";

type CartStoreState = {
  isOpen: boolean;
  cart: CartSnapshot;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  lastAddedItemTitle: string | null;
  lastAddedVariantTitle: string | null;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  clearError: () => void;
};

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T | { message?: string };
  if (!response.ok) {
    const message =
      typeof body === "object" && body && "message" in body
        ? body.message || "購物車操作失敗。"
        : "購物車操作失敗。";
    throw new Error(message);
  }

  return body as T;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      cart: createEmptyCartSnapshot(),
      initialized: false,
      loading: false,
      error: null,
      lastAddedItemTitle: null,
      lastAddedVariantTitle: null,

      initialize: async () => {
        if (get().loading) {
          return;
        }

        set({ loading: true, error: null });

        try {
          const localItems = get().cart.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          }));

          const serverCart = await readJson<CartSnapshot>(
            await fetch("/api/cart", {
              method: "GET",
              cache: "no-store",
            }),
          );

          if (serverCart.totalQuantity === 0 && localItems.length > 0) {
            const mergedCart = await readJson<CartSnapshot>(
              await fetch("/api/cart", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "replace", items: localItems }),
              }),
            );

            set({ cart: mergedCart, initialized: true, loading: false });
            return;
          }

          set({ cart: serverCart, initialized: true, loading: false });
        } catch (error) {
          set({
            loading: false,
            initialized: true,
            error: error instanceof Error ? error.message : "讀取購物車失敗。",
          });
        }
      },

      refresh: async () => {
        set({ loading: true, error: null });

        try {
          const cart = await readJson<CartSnapshot>(
            await fetch("/api/cart", {
              method: "GET",
              cache: "no-store",
            }),
          );

          set({ cart, loading: false, initialized: true });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : "讀取購物車失敗。",
          });
        }
      },

      addItem: async (variantId, quantity = 1) => {
        set({ loading: true, error: null });

        try {
          const cart = await readJson<CartSnapshot>(
            await fetch("/api/cart", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ action: "add", variantId, quantity }),
            }),
          );

          const addedItem = cart.items.find((item) => item.variantId === variantId) ?? null;

          set({
            cart,
            loading: false,
            initialized: true,
            isOpen: true,
            lastAddedItemTitle: addedItem?.productTitle ?? null,
            lastAddedVariantTitle: addedItem?.variantTitle ?? null,
          });

          if (addedItem) {
            trackAddToCart({
              value: addedItem.price * quantity,
              items: [
                createAnalyticsItem({
                  itemId: addedItem.variantId,
                  itemName: addedItem.productTitle,
                  itemVariant: addedItem.variantTitle,
                  price: addedItem.price,
                  quantity,
                  sku: addedItem.sku,
                }),
              ],
              contentName: addedItem.productTitle,
            });
          }
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : "加入購物車失敗。",
          });
          throw error;
        }
      },

      updateQuantity: async (cartItemId, quantity) => {
        set({ loading: true, error: null });

        try {
          const cart = await readJson<CartSnapshot>(
            await fetch("/api/cart", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ action: "update", cartItemId, quantity }),
            }),
          );

          set({ cart, loading: false, initialized: true });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : "更新數量失敗。",
          });
        }
      },

      removeItem: async (cartItemId) => {
        set({ loading: true, error: null });

        try {
          const cart = await readJson<CartSnapshot>(
            await fetch("/api/cart", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ action: "remove", cartItemId }),
            }),
          );

          set({ cart, loading: false, initialized: true });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : "移除商品失敗。",
          });
        }
      },

      clearCart: async () => {
        set({ loading: true, error: null });

        try {
          const cart = await readJson<CartSnapshot>(
            await fetch("/api/cart", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ action: "clear" }),
            }),
          );

          set({ cart, loading: false, initialized: true });
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : "清空購物車失敗。",
          });
        }
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearError: () => set({ error: null }),
    }),
    {
      name: "hanben-cart-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        initialized: state.initialized,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CartStoreState> | undefined;
        return {
          ...currentState,
          cart: persisted?.cart ?? currentState.cart,
          initialized: persisted?.initialized ?? currentState.initialized,
        };
      },
    },
  ),
);