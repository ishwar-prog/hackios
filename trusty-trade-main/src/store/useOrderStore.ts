import { create } from 'zustand'
import { orders, type Order, type OrderStatus, products, allProducts } from '@/data/products'
import { useNotificationStore } from './useNotificationStore'
import { useAuthStore } from './useAuthStore'

interface OrderStore {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
  
  // Actions
  createOrder: (productId: string, amount: number) => Promise<Order>
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  verifyOrder: (orderId: string) => Promise<void>
  getOrdersByBuyer: (buyerId: string) => Order[]
  getOrdersBySeller: (sellerId: string) => Order[]
  getOrder: (orderId: string) => Order | undefined
  setCurrentOrder: (order: Order | null) => void
  calculateVerificationTimeLeft: (order: Order) => number | null
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: orders,
  currentOrder: null,
  loading: false,
  error: null,

  createOrder: async (productId: string, amount: number) => {
    set({ loading: true, error: null })
    
    try {
      // Find the product from all products
      const product = allProducts.find(p => p.id === productId)
      if (!product) {
        throw new Error('Product not found')
      }

      const { user } = useAuthStore.getState()
      const buyerId = user?.id || 'buyer-1'

      // Create new order
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        productId,
        buyerId,
        sellerId: product.sellerId,
        status: 'paid',
        amount,
        escrowStatus: 'held',
        createdAt: new Date(),
        // Legacy compatibility
        product,
        orderDate: new Date().toISOString().split('T')[0],
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      set(state => ({
        orders: [...state.orders, newOrder],
        currentOrder: newOrder,
        loading: false
      }))

      return newOrder
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create order',
        loading: false 
      })
      throw error
    }
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const { notifyOrderShipped, notifyOrderDelivered, notifyEscrowReleased } = useNotificationStore.getState()
    
    set(state => ({
      orders: state.orders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status }
          
          // Update escrow status based on order status
          if (status === 'verified') {
            updatedOrder.escrowStatus = 'released'
            updatedOrder.verifiedAt = new Date()
            // Notify escrow released
            notifyEscrowReleased(orderId, order.amount)
          } else if (status === 'disputed') {
            updatedOrder.escrowStatus = 'disputed'
          } else if (status === 'refunded') {
            updatedOrder.escrowStatus = 'refunded'
          }
          
          // Update timestamps and trigger notifications
          if (status === 'shipped' && !order.shippedAt) {
            updatedOrder.shippedAt = new Date()
            updatedOrder.shippedDate = new Date().toISOString().split('T')[0]
            notifyOrderShipped(orderId, order.product.name)
          } else if (status === 'delivered' && !order.deliveredAt) {
            updatedOrder.deliveredAt = new Date()
            updatedOrder.deliveredDate = new Date().toISOString().split('T')[0]
            // Set verification deadline (5 days from delivery)
            const deadline = new Date()
            deadline.setDate(deadline.getDate() + 5)
            updatedOrder.verificationDeadline = deadline
            notifyOrderDelivered(orderId, order.product.name)
          }
          
          return updatedOrder
        }
        return order
      })
    }))
  },

  verifyOrder: async (orderId: string) => {
    set({ loading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      get().updateOrderStatus(orderId, 'verified')
      set({ loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to verify order',
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
    return orders.find(order => order.id === orderId)
  },

  setCurrentOrder: (order: Order | null) => {
    set({ currentOrder: order })
  },

  calculateVerificationTimeLeft: (order: Order) => {
    if (!order.verificationDeadline || order.status !== 'delivered') {
      return null
    }
    
    const now = new Date()
    const deadline = new Date(order.verificationDeadline)
    const timeLeft = deadline.getTime() - now.getTime()
    
    // Return days left (can be negative if expired)
    return Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
  }
}))

// NOTE: Auto-verify removed - orders must go through buyer verification flow
// Buyers must manually verify orders via the Verification page