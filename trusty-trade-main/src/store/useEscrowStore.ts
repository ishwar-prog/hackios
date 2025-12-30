import { create } from 'zustand'
import { escrowAccounts, type EscrowAccount, type EscrowStatus } from '@/data/products'

interface EscrowStore {
  escrowAccounts: Record<string, EscrowAccount>
  loading: boolean
  error: string | null
  
  // Actions
  createEscrowAccount: (orderId: string, amount: number) => EscrowAccount
  releaseEscrow: (orderId: string) => Promise<void>
  refundEscrow: (orderId: string) => Promise<void>
  getEscrowStatus: (orderId: string) => EscrowStatus | null
  getEscrowAccount: (orderId: string) => EscrowAccount | null
}

export const useEscrowStore = create<EscrowStore>((set, get) => ({
  escrowAccounts: escrowAccounts.reduce((acc, account) => {
    acc[account.orderId] = account
    return acc
  }, {} as Record<string, EscrowAccount>),
  loading: false,
  error: null,

  createEscrowAccount: (orderId: string, amount: number) => {
    const newAccount: EscrowAccount = {
      id: `ESC-${Date.now()}`,
      orderId,
      amount,
      status: 'held',
      createdAt: new Date(),
    }

    set(state => ({
      escrowAccounts: {
        ...state.escrowAccounts,
        [orderId]: newAccount
      }
    }))

    return newAccount
  },

  releaseEscrow: async (orderId: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call to release escrow
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => {
        const account = state.escrowAccounts[orderId]
        if (account) {
          return {
            escrowAccounts: {
              ...state.escrowAccounts,
              [orderId]: {
                ...account,
                status: 'released',
                releasedAt: new Date()
              }
            },
            loading: false
          }
        }
        return { loading: false }
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to release escrow',
        loading: false 
      })
      throw error
    }
  },

  refundEscrow: async (orderId: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call to refund escrow
      await new Promise(resolve => setTimeout(resolve, 500))
      
      set(state => {
        const account = state.escrowAccounts[orderId]
        if (account) {
          return {
            escrowAccounts: {
              ...state.escrowAccounts,
              [orderId]: {
                ...account,
                status: 'refunded',
                refundedAt: new Date()
              }
            },
            loading: false
          }
        }
        return { loading: false }
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to refund escrow',
        loading: false 
      })
      throw error
    }
  },

  getEscrowStatus: (orderId: string) => {
    const { escrowAccounts } = get()
    return escrowAccounts[orderId]?.status || null
  },

  getEscrowAccount: (orderId: string) => {
    const { escrowAccounts } = get()
    return escrowAccounts[orderId] || null
  }
}))

// Helper function to get escrow timeline steps
export const getEscrowTimelineSteps = (status: EscrowStatus) => {
  const steps = [
    { 
      key: 'paid', 
      label: 'Payment Received', 
      description: 'Funds secured in escrow',
      completed: true 
    },
    { 
      key: 'shipped', 
      label: 'Item Shipped', 
      description: 'Seller has shipped the item',
      completed: ['shipped', 'delivered', 'released', 'refunded'].includes(status)
    },
    { 
      key: 'delivered', 
      label: 'Item Delivered', 
      description: 'Item delivered for verification',
      completed: ['delivered', 'released', 'refunded'].includes(status)
    },
    { 
      key: 'verified', 
      label: 'Verification Complete', 
      description: status === 'released' ? 'Payment released to seller' : 
                   status === 'refunded' ? 'Refund processed to buyer' :
                   'Awaiting buyer verification',
      completed: ['released', 'refunded'].includes(status)
    }
  ]

  return steps
}