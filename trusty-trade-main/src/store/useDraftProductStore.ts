import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NewProductInput } from './useProductStore'

interface DraftProductStore {
  draft: Partial<NewProductInput> | null
  images: string[]
  
  // Actions
  saveDraft: (data: Partial<NewProductInput>, images: string[]) => void
  clearDraft: () => void
  hasDraft: () => boolean
}

export const useDraftProductStore = create<DraftProductStore>()(
  persist(
    (set, get) => ({
      draft: null,
      images: [],

      saveDraft: (data, images) => {
        set({ draft: data, images })
      },

      clearDraft: () => {
        set({ draft: null, images: [] })
      },

      hasDraft: () => {
        const { draft } = get()
        return draft !== null && Object.keys(draft).length > 0
      }
    }),
    {
      name: 'draft-product-storage'
    }
  )
)
