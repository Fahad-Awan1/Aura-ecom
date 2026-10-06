"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** `color` is the colour name (see Product.colors) */
export type CartItem = { slug: string; size: string; color: string; qty: number };

export type Toast = { id: number; title: string; image?: string };

type ShopState = {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  chatOpen: boolean;
  toasts: Toast[];
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (index: number, qty: number) => void;
  removeFromCart: (index: number) => void;
  toggleWishlist: (slug: string) => void;
  setCartOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
};

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      cartOpen: false,
      menuOpen: false,
      searchOpen: false,
      chatOpen: false,
      toasts: [],
      addToCart: (item, qty = 1) =>
        set((s) => {
          const i = s.cart.findIndex((c) => c.slug === item.slug && c.size === item.size && c.color === item.color);
          if (i === -1) return { cart: [...s.cart, { ...item, qty }] };
          const cart = [...s.cart];
          cart[i] = { ...cart[i], qty: cart[i].qty + qty };
          return { cart };
        }),
      setQty: (index, qty) =>
        set((s) => ({
          cart: qty <= 0 ? s.cart.filter((_, i) => i !== index) : s.cart.map((c, i) => (i === index ? { ...c, qty } : c)),
        })),
      removeFromCart: (index) => set((s) => ({ cart: s.cart.filter((_, i) => i !== index) })),
      toggleWishlist: (slug) =>
        set((s) => ({
          wishlist: s.wishlist.includes(slug) ? s.wishlist.filter((w) => w !== slug) : [...s.wishlist, slug],
        })),
      setCartOpen: (cartOpen) => set({ cartOpen }),
      setMenuOpen: (menuOpen) => set({ menuOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setChatOpen: (chatOpen) => set({ chatOpen }),
      toast: (t) => {
        const id = Date.now() + Math.random();
        set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
        window.setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 3200);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
    }),
    {
      name: "aura-shop",
      // rehydrated on the client after mount (see SmoothScroll) so SSR markup matches
      skipHydration: true,
      partialize: (s) => ({ cart: s.cart, wishlist: s.wishlist }),
    },
  ),
);
