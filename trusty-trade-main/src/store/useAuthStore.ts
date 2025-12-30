import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  role: 'buyer' | 'seller' | 'admin'
  avatar?: string
  joinDate: Date
  verificationStatus: 'verified' | 'pending' | 'unverified'
}

export type RedirectIntent = 
  | { type: 'checkout'; productId: string }
  | { type: 'sell' }
  | { type: 'none' }

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  redirectIntent: RedirectIntent
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  updateProfile: (updates: Partial<User>) => Promise<void>
  setRedirectIntent: (intent: RedirectIntent) => void
  clearRedirectIntent: () => void
}

// Mock user data for demo
const createMockUser = (name: string, email: string): User => ({
  id: `user-${Date.now()}`,
  name,
  email,
  role: 'buyer',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  joinDate: new Date(),
  verificationStatus: 'verified'
})

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null, // Start logged out
      isAuthenticated: false,
      loading: false,
      error: null,
      redirectIntent: { type: 'none' },

      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Check for admin login
          if (email === 'admin@trustytrade.com' && password === 'admin123') {
            const adminUser = createMockUser('Admin', email)
            adminUser.role = 'admin'
            set({ 
              user: adminUser,
              isAuthenticated: true,
              loading: false 
            })
            return
          }
          
          // Regular user login
          if (email && password.length >= 4) {
            const user = createMockUser(email.split('@')[0], email)
            set({ 
              user,
              isAuthenticated: true,
              loading: false 
            })
          } else {
            throw new Error('Invalid credentials')
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            loading: false 
          })
          throw error
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ loading: true, error: null })
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          if (name && email && password.length >= 4) {
            const user = createMockUser(name, email)
            set({ 
              user,
              isAuthenticated: true,
              loading: false 
            })
          } else {
            throw new Error('Please fill all fields correctly')
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed',
            loading: false 
          })
          throw error
        }
      },

      logout: () => {
        set({ 
          user: null,
          isAuthenticated: false,
          error: null,
          redirectIntent: { type: 'none' }
        })
      },

      setUser: (user: User | null) => {
        set({ 
          user,
          isAuthenticated: !!user 
        })
      },

      updateProfile: async (updates: Partial<User>) => {
        set({ loading: true, error: null })
        
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const { user } = get()
          if (user) {
            const updatedUser = { ...user, ...updates }
            set({ 
              user: updatedUser,
              loading: false 
            })
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Profile update failed',
            loading: false 
          })
          throw error
        }
      },

      setRedirectIntent: (intent: RedirectIntent) => {
        set({ redirectIntent: intent })
      },

      clearRedirectIntent: () => {
        set({ redirectIntent: { type: 'none' } })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)