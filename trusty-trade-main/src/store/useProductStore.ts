import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { allProducts as initialProducts, type Product, type Seller } from '@/data/products'
import { USD_TO_INR } from './useCurrencyStore'

export interface NewProductInput {
  name: string
  category: string
  brand: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  price: number // Price in INR
  originalPrice?: number // Original price in INR
  description: string
  location: string
  purchaseYear: string
  usageDuration: string
  warrantyRemaining: boolean
  warrantyDuration?: string
  accessoriesIncluded: string
  conditionNotes: string
  images: string[]
}

// Convert initial products from USD to INR
const convertedProducts: Product[] = initialProducts.map(p => ({
  ...p,
  price: p.price * USD_TO_INR,
  originalPrice: p.originalPrice ? p.originalPrice * USD_TO_INR : undefined
}))

interface ProductStore {
  products: Product[]
  selectedProduct: Product | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchProducts: () => Promise<void>
  getProduct: (id: string) => Product | undefined
  setSelectedProduct: (product: Product | null) => void
  addProduct: (input: NewProductInput, sellerId: string, sellerName: string) => Product
  updateProduct: (productId: string, updates: Partial<Product>) => void
  deleteProduct: (productId: string) => void
  getProductsBySeller: (sellerId: string) => Product[]
  rateSeller: (productId: string, rating: number) => void
  filterProducts: (filters: {
    category?: string
    condition?: string
    priceRange?: [number, number]
    searchQuery?: string
  }) => Product[]
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: convertedProducts,
      selectedProduct: null,
      loading: false,
      error: null,

      fetchProducts: async () => {
        set({ loading: true, error: null })
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          const { products } = get()
          if (products.length === 0) {
            set({ products: convertedProducts, loading: false })
          } else {
            set({ loading: false })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch products',
            loading: false 
          })
        }
      },

      getProduct: (id: string) => {
        const { products } = get()
        return products.find(product => product.id === id)
      },

      setSelectedProduct: (product: Product | null) => {
        set({ selectedProduct: product })
      },

      addProduct: (input: NewProductInput, sellerId: string, sellerName: string) => {
        const newProduct: Product = {
          id: `prod-${Date.now()}`,
          name: input.name,
          description: input.description,
          price: input.price, // Already in INR
          originalPrice: input.originalPrice, // Already in INR
          condition: input.condition,
          images: input.images,
          image: input.images[0] || '/placeholder.svg',
          specifications: {
            'Brand': input.brand,
            'Location': input.location,
            'Purchase Year': input.purchaseYear,
            'Usage Duration': input.usageDuration,
            'Warranty': input.warrantyRemaining ? input.warrantyDuration || 'Yes' : 'No',
            'Accessories': input.accessoriesIncluded,
            'Condition Notes': input.conditionNotes
          },
          sellerId,
          category: input.category,
          brand: input.brand,
          model: input.name,
          createdAt: new Date(),
          updatedAt: new Date(),
          seller: {
            id: sellerId,
            name: sellerName,
            rating: 4.5,
            totalSales: 0,
            completedSales: 0,
            onTimeShipping: 100,
            disputeResolution: 100,
            joinDate: new Date(),
            verificationStatus: 'verified',
            responseTime: 'within 24 hours'
          },
          escrowProtected: true,
          openBoxDelivery: true,
          returnEligible: true
        }

        set(state => ({
          products: [newProduct, ...state.products]
        }))

        return newProduct
      },

      updateProduct: (productId: string, updates: Partial<Product>) => {
        set(state => ({
          products: state.products.map(p => 
            p.id === productId ? { ...p, ...updates, updatedAt: new Date() } : p
          )
        }))
      },

      deleteProduct: (productId: string) => {
        set(state => ({
          products: state.products.filter(p => p.id !== productId)
        }))
      },

      getProductsBySeller: (sellerId: string) => {
        return get().products.filter(p => p.sellerId === sellerId)
      },

      rateSeller: (productId: string, rating: number) => {
        set(state => ({
          products: state.products.map(p => {
            if (p.id === productId) {
              const currentRating = p.seller.rating
              const totalSales = p.seller.totalSales || 1
              // Calculate new average rating
              const newRating = ((currentRating * totalSales) + rating) / (totalSales + 1)
              return {
                ...p,
                seller: {
                  ...p.seller,
                  rating: Math.round(newRating * 10) / 10,
                  totalSales: totalSales + 1
                }
              }
            }
            return p
          })
        }))
      },

      filterProducts: (filters) => {
        const { products } = get()
        
        return products.filter(product => {
          if (filters.category && product.category !== filters.category) {
            return false
          }
          
          if (filters.condition && product.condition !== filters.condition) {
            return false
          }
          
          if (filters.priceRange) {
            const [min, max] = filters.priceRange
            if (product.price < min || product.price > max) {
              return false
            }
          }
          
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase()
            const searchableText = [
              product.name,
              product.description,
              product.brand,
              product.model,
              product.category
            ].join(' ').toLowerCase()
            
            if (!searchableText.includes(query)) {
              return false
            }
          }
          
          return true
        })
      }
    }),
    {
      name: 'product-storage',
      partialize: (state) => ({
        products: state.products
      })
    }
  )
)
