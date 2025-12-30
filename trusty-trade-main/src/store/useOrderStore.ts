import { create } from 'zustand'
import { orders, type Order, type OrderStatus, products, allProducts } from '@/data/products'
import { useNotificationStore } from './useNotificationStore'
import { useAuthStore } from './useAuthStore'
import { useWalletStore } from './useWalletStore'
import { firestoreService } from '@/services/firestoreService'

// Enhanced order status to mirror real marketplace backends
export type EnhancedOrderStatus = 
  | 'PAID'        // Payment authorized and held in escrow
  | 'SHIPPED'     // Seller has shipped the item
  | 'DELIVERED'   // Item delivered to buyer
  | 'VERIFIED'    // Buyer verified product - escrow released
  | 'DISPUTED'    // Buyer raised dispute - escrow locked
  | 'REFUNDED'    // Dispute resolved in buyer favor - escrow refunded

export type EscrowStatus = 
  | 'HELD'        // Funds locked in escrow
  | 'RELEASED'    // Funds released to seller
  | 'REFUNDED'    // Funds refunded to buyer

export interface EnhancedOrder {
  orderId: string
  buyerId: string
  sellerId: string
  productId: string
  amount: number
  status: EnhancedOrderStatus
  escrowStatus: EscrowStatus
  createdAt: Date
  shippedAt?: Date
  deliveredAt?: Date
  verifiedAt?: Date
  disputedAt?: Date
  resolvedAt?: Date
  verificationDeadline?: Date
  
  // Legacy compatibility
  id: string
  product: any
  orderDate: string
}

interface OrderStore {
  orders: EnhancedOrder[]
  currentOrder: EnhancedOrder | null
  loading: boolean
  error: string | null
  
  // Actions
  createOrderWithEscrow: (productId: string, amount: number) => Promise<EnhancedOrder>
  updateOrderStatus: (orderId: string, status: EnhancedOrderStatus) => void
  verifyOrderAndReleaseEscrow: (orderId: string) => Promise<void>
  raiseDispute: (orderId: string, reason: string) => Promise<void>
  resolveDispute: (orderId: string, approveRefund: boolean, adminNotes?: string) => Promise<void>
  
  // Query operations
  getOrdersByBuyer: (buyerId: string) => EnhancedOrder[]
  getOrdersBySeller: (sellerId: string) => EnhancedOrder[]
  getOrder: (orderId: string) => EnhancedOrder | undefined
  setCurrentOrder: (order: EnhancedOrder | null) => void
  calculateVerificationTimeLeft: (order: EnhancedOrder) => number | null
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [], // Start with empty orders for clean state
  currentOrder: null,
  loading: false,
  error: null,

  createOrderWithEscrow: async (productId: string, amount: number) => {
    set({ loading: true, error: null })
    
    // Track if payment was authorized for rollback
    let paymentAuthorized = false
    let orderId = ''
    
    try {
      // Find the product from all products
      const product = allProducts.find(p => p.id === productId)
      if (!product) {
        throw new Error('Product not found')
      }

      const { user } = useAuthStore.getState()
      const buyerId = user?.id || 'buyer-1'
      
      // Generate order ID first
      orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // ATOMIC TRANSACTION: Authorize payment (like Stripe PaymentIntent)
      const { authorizePayment, refundEscrowToBuyer } = useWalletStore.getState()
      paymentAuthorized = authorizePayment(amount, orderId, product.name)
      
      if (!paymentAuthorized) {
        throw new Error('Payment authorization failed - insufficient funds or frozen wallet')
      }

      // Try to create order in Firestore (optional - gracefully handle failures)
      try {
        await firestoreService.createOrder({
          buyerId,
          sellerId: product.sellerId,
          productId,
          amount,
          escrowStatus: 'held',
          verificationStatus: 'pending',
          orderStatus: 'paid'
        });
      } catch (firestoreError) {
        // Firestore failed - log but continue with local-only order
        // This is a frontend demo, so we don't require Firestore to work
        console.warn('Firestore order creation failed (continuing with local order):', firestoreError)
      }

      // Create new order for local state (this is the source of truth for demo)
      const newOrder: EnhancedOrder = {
        orderId,
        buyerId,
        sellerId: product.sellerId,
        productId,
        amount,
        status: 'PAID',
        escrowStatus: 'HELD',
        createdAt: new Date(),
        
        // Legacy compatibility
        id: orderId,
        product,
        orderDate: new Date().toISOString().split('T')[0],
      }

      set(state => ({
        orders: [...state.orders, newOrder],
        currentOrder: newOrder,
        loading: false
      }))

      // Trigger notifications
      const { notifyOrderPlaced, notifyEscrowHeld } = useNotificationStore.getState()
      notifyOrderPlaced(orderId, product.name, amount)
      notifyEscrowHeld(orderId, amount)

      return newOrder
    } catch (error) {
      // CRITICAL: Rollback payment if it was authorized but order creation failed
      if (paymentAuthorized && orderId) {
        console.log('Rolling back payment authorization due to order creation failure')
        const { refundEscrowToBuyer } = useWalletStore.getState()
        refundEscrowToBuyer(orderId)
      }
      
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create order',
        loading: false 
      })
      throw error
    }
  },

  updateOrderStatus: (orderId: string, status: EnhancedOrderStatus) => {
    const { notifyOrderShipped, notifyOrderDelivered } = useNotificationStore.getState()
    
    set(state => ({
      orders: state.orders.map(order => {
        if (order.orderId === orderId) {
          const updatedOrder = { ...order, status }
          
          // Update timestamps based on status
          if (status === 'SHIPPED' && !order.shippedAt) {
            updatedOrder.shippedAt = new Date()
            notifyOrderShipped(orderId, order.product.name)
          } else if (status === 'DELIVERED' && !order.deliveredAt) {
            updatedOrder.deliveredAt = new Date()
            // Set verification deadline (5 days from delivery)
            const deadline = new Date()
            deadline.setDate(deadline.getDate() + 5)
            updatedOrder.verificationDeadline = deadline
            notifyOrderDelivered(orderId, order.product.name)
          } else if (status === 'DISPUTED' && !order.disputedAt) {
            updatedOrder.disputedAt = new Date()
          }
          
          return updatedOrder
        }
        return order
      })
    }))
  },

  verifyOrderAndReleaseEscrow: async (orderId: string) => {
    set({ loading: true, error: null })
    
    try {
      const order = get().orders.find(o => o.orderId === orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      if (order.escrowStatus !== 'HELD') {
        throw new Error('Escrow is not in HELD status')
      }

      // Release escrow to seller using wallet store
      const { releaseEscrowToSeller } = useWalletStore.getState()
      const escrowReleased = releaseEscrowToSeller(orderId, order.sellerId)
      
      if (!escrowReleased) {
        throw new Error('Failed to release escrow - insufficient escrow balance')
      }

      // Try to update Firestore (optional - gracefully handle failures)
      try {
        await firestoreService.verifyOrderAndReleaseEscrow(orderId)
      } catch (firestoreError) {
        console.warn('Firestore verification update failed (continuing with local state):', firestoreError)
      }
      
      // Update local state (this is the source of truth for demo)
      set(state => ({
        orders: state.orders.map(o => 
          o.orderId === orderId 
            ? { 
                ...o, 
                status: 'VERIFIED', 
                escrowStatus: 'RELEASED',
                verifiedAt: new Date()
              }
            : o
        ),
        loading: false
      }))

      // Trigger notifications
      const { notifyEscrowReleased } = useNotificationStore.getState()
      notifyEscrowReleased(orderId, order.amount)

    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to verify order',
        loading: false 
      })
      throw error
    }
  },

  raiseDispute: async (orderId: string, reason: string) => {
    set({ loading: true, error: null })
    
    try {
      const order = get().orders.find(o => o.orderId === orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      if (order.escrowStatus !== 'HELD') {
        throw new Error('Cannot dispute order - escrow not held')
      }

      // Update order status to disputed (local state first)
      get().updateOrderStatus(orderId, 'DISPUTED')

      // Try to create dispute in Firestore (optional - gracefully handle failures)
      try {
        await firestoreService.createDispute({
          orderId,
          buyerId: order.buyerId,
          sellerId: order.sellerId,
          reason,
          description: reason,
          imageEvidence: [],
          status: 'open'
        })
      } catch (firestoreError) {
        console.warn('Firestore dispute creation failed (continuing with local state):', firestoreError)
      }

      // Trigger notifications
      const { notifyDisputeRaised } = useNotificationStore.getState()
      notifyDisputeRaised(orderId, order.product.name)

      set({ loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to raise dispute',
        loading: false 
      })
      throw error
    }
  },

  resolveDispute: async (orderId: string, approveRefund: boolean, adminNotes?: string) => {
    set({ loading: true, error: null })
    
    try {
      const order = get().orders.find(o => o.orderId === orderId)
      if (!order) {
        throw new Error('Order not found')
      }

      if (order.status !== 'DISPUTED') {
        throw new Error('Order is not in disputed status')
      }

      const { refundEscrowToBuyer, releaseEscrowToSeller } = useWalletStore.getState()

      if (approveRefund) {
        // Refund to buyer
        const refunded = refundEscrowToBuyer(orderId)
        if (!refunded) {
          throw new Error('Failed to refund escrow')
        }

        // Update order status
        set(state => ({
          orders: state.orders.map(o => 
            o.orderId === orderId 
              ? { 
                  ...o, 
                  status: 'REFUNDED', 
                  escrowStatus: 'REFUNDED',
                  resolvedAt: new Date()
                }
              : o
          )
        }))
      } else {
        // Release to seller
        const released = releaseEscrowToSeller(orderId, order.sellerId)
        if (!released) {
          throw new Error('Failed to release escrow to seller')
        }

        // Update order status
        set(state => ({
          orders: state.orders.map(o => 
            o.orderId === orderId 
              ? { 
                  ...o, 
                  status: 'VERIFIED', 
                  escrowStatus: 'RELEASED',
                  resolvedAt: new Date()
                }
              : o
          )
        }))
      }

      // Update Firestore
      // Note: This would need a new method in firestoreService for dispute resolution
      
      set({ loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to resolve dispute',
        loading: false 
      })
      throw error
    }
  },

  getOrdersByBuyer: (buyerId: string) => {
    const { orders } = get()
    return orders.filter(order => order.buyerId === buyerId)
  },

  getOrdersBySeller: (sellerId: string) => {
    const { orders } = get()
    return orders.filter(order => order.sellerId === sellerId)
  },

  getOrder: (orderId: string) => {
    const { orders } = get()
    return orders.find(order => order.orderId === orderId)
  },

  setCurrentOrder: (order: EnhancedOrder | null) => {
    set({ currentOrder: order })
  },

  calculateVerificationTimeLeft: (order: EnhancedOrder) => {
    if (!order.verificationDeadline || order.status !== 'DELIVERED') {
      return null
    }
    
    const now = new Date()
    const deadline = new Date(order.verificationDeadline)
    const timeLeft = deadline.getTime() - now.getTime()
    
    // Return days left (can be negative if expired)
    return Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
  }
}))