import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WalletStatus = 'ACTIVE' | 'LIMITED' | 'FROZEN'

export interface WalletTransaction {
  id: string
  type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'refund'
  amount: number
  description: string
  orderId?: string
  timestamp: string // Store as ISO string for proper serialization
  balanceAfter: number
}

interface WalletStore {
  balance: number
  status: WalletStatus
  transactions: WalletTransaction[]
  
  // Actions
  addMoney: (amount: number, method: string) => void
  debitForPurchase: (amount: number, orderId: string, productName: string) => boolean
  holdInEscrow: (amount: number, orderId: string) => void
  releaseFromEscrow: (amount: number, orderId: string, toSeller: boolean) => void
  refund: (amount: number, orderId: string, reason: string) => void
  setStatus: (status: WalletStatus) => void
  getTransactionsByOrder: (orderId: string) => WalletTransaction[]
}

const initialTransactions: WalletTransaction[] = [
  {
    id: 'TXN-INIT',
    type: 'credit',
    amount: 5000,
    description: 'Welcome bonus - Demo account',
    timestamp: '2024-01-01T00:00:00.000Z',
    balanceAfter: 5000
  }
]

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      balance: 5000,
      status: 'ACTIVE' as WalletStatus,
      transactions: initialTransactions,

      addMoney: (amount: number, method: string) => {
        const { balance, transactions } = get()
        const newBalance = balance + amount
        const newTransaction: WalletTransaction = {
          id: `TXN-${Date.now()}`,
          type: 'credit',
          amount,
          description: `Added via ${method}`,
          timestamp: new Date().toISOString(),
          balanceAfter: newBalance
        }
        set({
          balance: newBalance,
          transactions: [newTransaction, ...transactions]
        })
      },

      debitForPurchase: (amount: number, orderId: string, productName: string) => {
        const { balance, status, transactions } = get()
        
        if (status === 'FROZEN') return false
        if (balance < amount) return false
        
        const newBalance = balance - amount
        const newTransaction: WalletTransaction = {
          id: `TXN-${Date.now()}`,
          type: 'debit',
          amount,
          description: `Purchase: ${productName}`,
          orderId,
          timestamp: new Date().toISOString(),
          balanceAfter: newBalance
        }
        
        set({
          balance: newBalance,
          transactions: [newTransaction, ...transactions]
        })
        return true
      },

      holdInEscrow: (amount: number, orderId: string) => {
        const { balance, transactions } = get()
        const newTransaction: WalletTransaction = {
          id: `TXN-${Date.now()}`,
          type: 'escrow_hold',
          amount,
          description: 'Funds held in escrow',
          orderId,
          timestamp: new Date().toISOString(),
          balanceAfter: balance
        }
        set({ transactions: [newTransaction, ...transactions] })
      },

      releaseFromEscrow: (amount: number, orderId: string, toSeller: boolean) => {
        const { balance, transactions } = get()
        const newTransaction: WalletTransaction = {
          id: `TXN-${Date.now()}`,
          type: 'escrow_release',
          amount,
          description: toSeller ? 'Escrow released to seller' : 'Escrow released - refund processed',
          orderId,
          timestamp: new Date().toISOString(),
          balanceAfter: balance
        }
        set({ transactions: [newTransaction, ...transactions] })
      },

      refund: (amount: number, orderId: string, reason: string) => {
        const { balance, transactions } = get()
        const newBalance = balance + amount
        const newTransaction: WalletTransaction = {
          id: `TXN-${Date.now()}`,
          type: 'refund',
          amount,
          description: `Refund: ${reason}`,
          orderId,
          timestamp: new Date().toISOString(),
          balanceAfter: newBalance
        }
        set({
          balance: newBalance,
          transactions: [newTransaction, ...transactions]
        })
      },

      setStatus: (status: WalletStatus) => {
        set({ status })
      },

      getTransactionsByOrder: (orderId: string) => {
        return get().transactions.filter(t => t.orderId === orderId)
      }
    }),
    {
      name: 'wallet-storage',
      version: 1, // Add version for migration support
    }
  )
)
