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
      name: 'draft-product-storage',
      // Only persist form data, NOT images - images are too large for localStorage
      // Images will be kept in memory only and user will need to re-upload after page refresh
      partialize: (state) => ({
        draft: state.draft,
        images: [] // Don't persist images to avoid localStorage size limit errors
      })
    }
  )
)
