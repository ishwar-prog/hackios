import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { firebaseAuthService } from '@/services/firebaseAuth'

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
  emailVerificationRequired: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  updateProfile: (updates: Partial<User> & { phone?: string }) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  setRedirectIntent: (intent: RedirectIntent) => void
  clearRedirectIntent: () => void
  resetPassword: (email: string) => Promise<void>
  resendVerificationEmail: () => Promise<void>
  checkEmailVerification: () => Promise<boolean>
  initializeAuth: () => Promise<void>
  startEmailVerificationPolling: () => void
  stopEmailVerificationPolling: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => {
      let verificationPollingInterval: NodeJS.Timeout | null = null;
      let authStateUnsubscribe: (() => void) | null = null;

      return {
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        redirectIntent: { type: 'none' },
        emailVerificationRequired: false,

        initializeAuth: async () => {
          set({ loading: true })
          try {
            // Set up auth state listener
            authStateUnsubscribe = firebaseAuthService.onAuthStateChanged((user) => {
              // Check if user is admin - admins bypass email verification completely
              const isAdmin = user?.role === 'admin';
              
              set({ 
                user,
                isAuthenticated: !!user,
                emailVerificationRequired: user && !isAdmin ? user.verificationStatus !== 'verified' : false,
                loading: false 
              });
            });
          } catch (error) {
            set({ loading: false })
          }
        },

        login: async (email: string, password: string) => {
          set({ loading: true, error: null })
          
          try {
            const user = await firebaseAuthService.login(email, password)
            const emailVerified = await firebaseAuthService.isEmailVerified()
            
            // Check if user is admin - admins bypass email verification completely
            const isAdmin = user?.role === 'admin';
            
            set({ 
              user,
              isAuthenticated: true,
              emailVerificationRequired: !isAdmin && !emailVerified,
              loading: false 
            })

            // Start polling for email verification if needed (not for admins)
            if (!isAdmin && !emailVerified) {
              get().startEmailVerificationPolling();
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
            const user = await firebaseAuthService.register(name, email, password)
            
            set({ 
              user,
              isAuthenticated: true,
              emailVerificationRequired: true, // Always true for new registrations
              loading: false 
            })

            // Start polling for email verification
            get().startEmailVerificationPolling();
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Registration failed',
              loading: false 
            })
            throw error
          }
        },

        logout: async () => {
          set({ loading: true })
          try {
            // Stop polling and cleanup
            get().stopEmailVerificationPolling();
            if (authStateUnsubscribe) {
              authStateUnsubscribe();
              authStateUnsubscribe = null;
            }

            await firebaseAuthService.logout()
            set({ 
              user: null,
              isAuthenticated: false,
              emailVerificationRequired: false,
              error: null,
              redirectIntent: { type: 'none' },
              loading: false
            })
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Logout failed',
              loading: false 
            })
          }
        },

        setUser: (user: User | null) => {
          // Check if user is admin - admins bypass email verification completely
          const isAdmin = user?.role === 'admin';
          
          set({ 
            user,
            isAuthenticated: !!user,
            emailVerificationRequired: user && !isAdmin ? user.verificationStatus !== 'verified' : false
          })
        },

        updateProfile: async (updates: Partial<User> & { phone?: string }) => {
          set({ loading: true, error: null })
          
          try {
            await firebaseAuthService.updateProfile(updates)
            
            const { user } = get()
            if (user) {
              const updatedUser = { ...user, ...updates }
              set({ 
                user: updatedUser,
                emailVerificationRequired: updates.email ? true : get().emailVerificationRequired,
                loading: false 
              })

              // Start polling if email was changed
              if (updates.email) {
                get().startEmailVerificationPolling();
              }
            }
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Profile update failed',
              loading: false 
            })
            throw error
          }
        },

        changePassword: async (currentPassword: string, newPassword: string) => {
          set({ loading: true, error: null })
          try {
            await firebaseAuthService.changePassword(currentPassword, newPassword)
            set({ loading: false })
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Password change failed',
              loading: false 
            })
            throw error
          }
        },

        resetPassword: async (email: string) => {
          set({ loading: true, error: null })
          try {
            await firebaseAuthService.resetPassword(email)
            set({ loading: false })
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Password reset failed',
              loading: false 
            })
            throw error
          }
        },

        resendVerificationEmail: async () => {
          set({ loading: true, error: null })
          try {
            await firebaseAuthService.resendVerificationEmail()
            set({ loading: false })
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to resend verification email',
              loading: false 
            })
            throw error
          }
        },

        checkEmailVerification: async () => {
          try {
            const verified = await firebaseAuthService.checkAndUpdateEmailVerification()
            set({ emailVerificationRequired: !verified })
            
            if (verified) {
              // Stop polling when verified
              get().stopEmailVerificationPolling();
              
              // Update user verification status
              const { user } = get();
              if (user) {
                set({ 
                  user: { ...user, verificationStatus: 'verified' }
                });
              }
            }
            
            return verified
          } catch (error) {
            console.error('Error checking email verification:', error);
            return false;
          }
        },

        startEmailVerificationPolling: () => {
          // Clear existing interval
          if (verificationPollingInterval) {
            clearInterval(verificationPollingInterval);
          }

          // Poll every 3 seconds for email verification
          verificationPollingInterval = setInterval(async () => {
            const verified = await get().checkEmailVerification();
            if (verified) {
              get().stopEmailVerificationPolling();
            }
          }, 3000);
        },

        stopEmailVerificationPolling: () => {
          if (verificationPollingInterval) {
            clearInterval(verificationPollingInterval);
            verificationPollingInterval = null;
          }
        },

        setRedirectIntent: (intent: RedirectIntent) => {
          set({ redirectIntent: intent })
        },

        clearRedirectIntent: () => {
          set({ redirectIntent: { type: 'none' } })
        }
      }
    },
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        redirectIntent: state.redirectIntent
      })
    }
  )
)