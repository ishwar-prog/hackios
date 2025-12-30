import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
  items: string[] // Product IDs
  
  // Actions
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => void
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToWishlist: (productId: string) => {
        set(state => {
          if (!state.items.includes(productId)) {
            return { items: [...state.items, productId] }
          }
          return state
        })
      },

      removeFromWishlist: (productId: string) => {
        set(state => ({
          items: state.items.filter(id => id !== productId)
        }))
      },

      isInWishlist: (productId: string) => {
        return get().items.includes(productId)
      },

      toggleWishlist: (productId: string) => {
        const { items } = get()
        if (items.includes(productId)) {
          set({ items: items.filter(id => id !== productId) })
        } else {
          set({ items: [...items, productId] })
        }
      },

      clearWishlist: () => {
        set({ items: [] })
      }
    }),
    {
      name: 'wishlist-storage'
    }
  )
)
