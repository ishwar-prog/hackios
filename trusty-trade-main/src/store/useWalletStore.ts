import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { firestoreService } from '@/services/firestoreService'

export type WalletStatus = 'ACTIVE' | 'LIMITED' | 'FROZEN'

// Transaction types that mirror real payment systems
export type TransactionType = 
  | 'WALLET_CREDIT'     // Money added to wallet
  | 'WALLET_DEBIT'      // Money removed from wallet
  | 'ESCROW_HOLD'       // Money moved to escrow (buyer payment)
  | 'ESCROW_RELEASE'    // Money released from escrow (to seller)
  | 'ESCROW_REFUND'     // Money refunded from escrow (to buyer)

export interface WalletTransaction {
  transactionId: string
  orderId?: string
  type: TransactionType
  from: string          // 'wallet' | 'escrow' | 'external'
  to: string            // 'wallet' | 'escrow' | 'seller'
  amount: number
  description: string
  timestamp: string
  // Read-only ledger - never mutated after creation
}

interface UserWalletData {
  availableBalance: number    // Money available for spending
  heldInEscrow: number       // Money locked in escrow
  walletState: WalletStatus  // Wallet status
  transactions: WalletTransaction[]  // Immutable transaction ledger
}

interface WalletStore {
  userWallets: Record<string, UserWalletData> // userId -> wallet data
  currentUserId: string | null
  
  // Current user computed properties (for UI reactivity)
  availableBalance: number
  heldInEscrow: number
  walletState: WalletStatus
  transactions: WalletTransaction[]
  
  // Actions
  setCurrentUser: (userId: string | null) => void
  getCurrentWallet: () => UserWalletData
  
  // Wallet operations
  addMoney: (amount: number, method: string) => void
  
  // Escrow operations (mirror Stripe PaymentIntent flow)
  authorizePayment: (amount: number, orderId: string, productName: string) => boolean
  releaseEscrowToSeller: (orderId: string, sellerId: string) => boolean
  refundEscrowToBuyer: (orderId: string) => boolean
  
  // Admin operations
  freezeWallet: (userId: string) => void
  unfreezeWallet: (userId: string) => void
  
  // Query operations
  getTransactionsByOrder: (orderId: string) => WalletTransaction[]
  getTotalBalance: () => number // availableBalance + heldInEscrow
  
  // Internal helper (not exposed in public API)
  _addTransaction: (userId: string, transaction: Omit<WalletTransaction, 'transactionId' | 'timestamp'>) => WalletTransaction
}

const createInitialWallet = (): UserWalletData => ({
  availableBalance: 5000,
  heldInEscrow: 0,
  walletState: 'ACTIVE' as WalletStatus,
  transactions: [{
    transactionId: 'TXN-INIT',
    type: 'WALLET_CREDIT',
    from: 'external',
    to: 'wallet',
    amount: 5000,
    description: 'Welcome bonus - Demo account',
    timestamp: '2024-01-01T00:00:00.000Z'
  }]
})

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      userWallets: {},
      currentUserId: null,
      availableBalance: 0,
      heldInEscrow: 0,
      walletState: 'ACTIVE' as WalletStatus,
      transactions: [],

      setCurrentUser: (userId: string | null) => {
        set(state => {
          // Initialize wallet for new user if needed
          let userWallets = { ...state.userWallets }
          if (userId && !userWallets[userId]) {
            userWallets[userId] = createInitialWallet()
          }
          
          // Update computed properties based on current user
          const currentWallet = userId ? (userWallets[userId] || createInitialWallet()) : createInitialWallet()
          
          return {
            ...state,
            currentUserId: userId,
            userWallets,
            availableBalance: currentWallet.availableBalance,
            heldInEscrow: currentWallet.heldInEscrow,
            walletState: currentWallet.walletState,
            transactions: currentWallet.transactions
          }
        })
      },

      getCurrentWallet: () => {
        const { currentUserId, userWallets } = get()
        if (!currentUserId) return createInitialWallet()
        return userWallets[currentUserId] || createInitialWallet()
      },

      getTotalBalance: () => {
        const { availableBalance, heldInEscrow } = get()
        return availableBalance + heldInEscrow
      },

      // Helper function to add transaction to ledger (immutable)
      _addTransaction: (userId: string, transaction: Omit<WalletTransaction, 'transactionId' | 'timestamp'>) => {
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const timestamp = new Date().toISOString()
        
        const fullTransaction: WalletTransaction = {
          ...transaction,
          transactionId,
          timestamp
        }

        set(state => {
          const currentWallet = state.userWallets[userId] || createInitialWallet()
          const updatedWallet = {
            ...currentWallet,
            transactions: [fullTransaction, ...currentWallet.transactions]
          }

          const newState = {
            ...state,
            userWallets: {
              ...state.userWallets,
              [userId]: updatedWallet
            }
          }

          // Update current user state if this is the current user
          if (userId === state.currentUserId) {
            newState.transactions = updatedWallet.transactions
          }

          return newState
        })

        return fullTransaction
      },

      addMoney: (amount: number, method: string) => {
        const { currentUserId } = get()
        if (!currentUserId) return

        set(state => {
          const currentWallet = state.userWallets[currentUserId] || createInitialWallet()
          const newAvailableBalance = currentWallet.availableBalance + amount

          const updatedWallet = {
            ...currentWallet,
            availableBalance: newAvailableBalance
          }

          const newState = {
            ...state,
            userWallets: {
              ...state.userWallets,
              [currentUserId]: updatedWallet
            },
            availableBalance: newAvailableBalance
          }

          return newState
        })

        // Add transaction to ledger
        get()._addTransaction(currentUserId, {
          type: 'WALLET_CREDIT',
          from: 'external',
          to: 'wallet',
          amount,
          description: `Added via ${method}`
        })
      },

      // ESCROW OPERATIONS - Mirror Stripe PaymentIntent with manual capture
      
      authorizePayment: (amount: number, orderId: string, productName: string) => {
        const { currentUserId } = get()
        if (!currentUserId) return false

        const currentWallet = get().userWallets[currentUserId] || createInitialWallet()
        
        // Check wallet state and balance
        if (currentWallet.walletState === 'FROZEN') return false
        if (currentWallet.availableBalance < amount) return false
        
        // Move money from available balance to escrow (like Stripe authorize)
        set(state => {
          const wallet = state.userWallets[currentUserId]!
          const newAvailableBalance = wallet.availableBalance - amount
          const newHeldInEscrow = wallet.heldInEscrow + amount

          const updatedWallet = {
            ...wallet,
            availableBalance: newAvailableBalance,
            heldInEscrow: newHeldInEscrow
          }

          return {
            ...state,
            userWallets: {
              ...state.userWallets,
              [currentUserId]: updatedWallet
            },
            availableBalance: newAvailableBalance,
            heldInEscrow: newHeldInEscrow
          }
        })

        // Add transaction to ledger
        get()._addTransaction(currentUserId, {
          orderId,
          type: 'ESCROW_HOLD',
          from: 'wallet',
          to: 'escrow',
          amount,
          description: `Payment authorized for ${productName} - funds held in escrow`
        })

        return true
      },

      releaseEscrowToSeller: (orderId: string, sellerId: string) => {
        const { currentUserId, userWallets } = get()
        if (!currentUserId) return false

        // Find the escrow hold transaction for this order
        const currentWallet = userWallets[currentUserId] || createInitialWallet()
        const escrowTransaction = currentWallet.transactions.find(
          t => t.orderId === orderId && t.type === 'ESCROW_HOLD'
        )

        if (!escrowTransaction) return false
        if (currentWallet.heldInEscrow < escrowTransaction.amount) return false

        // Release escrow to seller
        set(state => {
          const buyerWallet = state.userWallets[currentUserId]!
          const sellerWallet = state.userWallets[sellerId] || createInitialWallet()

          const updatedBuyerWallet = {
            ...buyerWallet,
            heldInEscrow: buyerWallet.heldInEscrow - escrowTransaction.amount
          }

          const updatedSellerWallet = {
            ...sellerWallet,
            availableBalance: sellerWallet.availableBalance + escrowTransaction.amount
          }

          const newState = {
            ...state,
            userWallets: {
              ...state.userWallets,
              [currentUserId]: updatedBuyerWallet,
              [sellerId]: updatedSellerWallet
            }
          }

          // Update current user state if buyer is current user
          if (currentUserId === state.currentUserId) {
            newState.heldInEscrow = updatedBuyerWallet.heldInEscrow
          }

          return newState
        })

        // Add transactions to both user ledgers
        get()._addTransaction(currentUserId, {
          orderId,
          type: 'ESCROW_RELEASE',
          from: 'escrow',
          to: 'seller',
          amount: escrowTransaction.amount,
          description: `Escrow released to seller - order verified`
        })

        get()._addTransaction(sellerId, {
          orderId,
          type: 'WALLET_CREDIT',
          from: 'escrow',
          to: 'wallet',
          amount: escrowTransaction.amount,
          description: `Payment received from escrow - order verified`
        })

        return true
      },

      refundEscrowToBuyer: (orderId: string) => {
        const { currentUserId } = get()
        if (!currentUserId) return false

        // Find the escrow hold transaction for this order
        const currentWallet = get().userWallets[currentUserId] || createInitialWallet()
        const escrowTransaction = currentWallet.transactions.find(
          t => t.orderId === orderId && t.type === 'ESCROW_HOLD'
        )

        if (!escrowTransaction) return false
        if (currentWallet.heldInEscrow < escrowTransaction.amount) return false

        // Refund escrow back to buyer's available balance
        set(state => {
          const wallet = state.userWallets[currentUserId]!
          const newAvailableBalance = wallet.availableBalance + escrowTransaction.amount
          const newHeldInEscrow = wallet.heldInEscrow - escrowTransaction.amount

          const updatedWallet = {
            ...wallet,
            availableBalance: newAvailableBalance,
            heldInEscrow: newHeldInEscrow
          }

          return {
            ...state,
            userWallets: {
              ...state.userWallets,
              [currentUserId]: updatedWallet
            },
            availableBalance: newAvailableBalance,
            heldInEscrow: newHeldInEscrow
          }
        })

        // Add transaction to ledger
        get()._addTransaction(currentUserId, {
          orderId,
          type: 'ESCROW_REFUND',
          from: 'escrow',
          to: 'wallet',
          amount: escrowTransaction.amount,
          description: `Escrow refunded - dispute resolved in buyer favor`
        })

        return true
      },

      // ADMIN OPERATIONS
      
      freezeWallet: (userId: string) => {
        set(state => {
          const wallet = state.userWallets[userId]
          if (!wallet) return state

          const updatedWallet = { ...wallet, walletState: 'FROZEN' as WalletStatus }
          const newState = {
            ...state,
            userWallets: {
              ...state.userWallets,
              [userId]: updatedWallet
            }
          }

          // Update current user state if this is the current user
          if (userId === state.currentUserId) {
            newState.walletState = 'FROZEN'
          }

          return newState
        })
      },

      unfreezeWallet: (userId: string) => {
        set(state => {
          const wallet = state.userWallets[userId]
          if (!wallet) return state

          const updatedWallet = { ...wallet, walletState: 'ACTIVE' as WalletStatus }
          const newState = {
            ...state,
            userWallets: {
              ...state.userWallets,
              [userId]: updatedWallet
            }
          }

          // Update current user state if this is the current user
          if (userId === state.currentUserId) {
            newState.walletState = 'ACTIVE'
          }

          return newState
        })
      },

      getTransactionsByOrder: (orderId: string) => {
        const { currentUserId, userWallets } = get()
        if (!currentUserId) return []
        const currentWallet = userWallets[currentUserId] || createInitialWallet()
        return currentWallet.transactions.filter(t => t.orderId === orderId)
      }
    }),
    {
      name: 'wallet-storage',
      version: 4, // Increment version for migration
      migrate: (persistedState: any, version: number) => {
        // Handle migration from old wallet structure
        if (version < 4) {
          return {
            userWallets: {},
            currentUserId: null,
            availableBalance: 0,
            heldInEscrow: 0,
            walletState: 'ACTIVE' as WalletStatus,
            transactions: []
          }
        }
        return persistedState
      }
    }
  )
)
