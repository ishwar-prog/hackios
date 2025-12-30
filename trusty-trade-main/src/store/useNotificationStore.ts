import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 
  | 'order' 
  | 'escrow' 
  | 'wallet' 
  | 'dispute' 
  | 'verification' 
  | 'delivery'
  | 'payment'
  | 'security'
  | 'product'
  | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  orderId?: string
  productId?: string
  read: boolean
  timestamp: Date
  priority: 'high' | 'medium' | 'low'
  actionUrl?: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  getByOrderId: (orderId: string) => Notification[]
  
  // Notification triggers for specific events
  notifyOrderPlaced: (orderId: string, productName: string, amount: number) => void
  notifyPaymentSuccess: (orderId: string, amount: number) => void
  notifyOrderShipped: (orderId: string, productName: string) => void
  notifyOrderDelivered: (orderId: string, productName: string) => void
  notifyProductListed: (productId: string, productName: string) => void
  notifyProductDeleted: (productId: string, productName: string) => void
  notifyProductSold: (productId: string, productName: string, buyerName: string) => void
  notifyProductPickedUp: (orderId: string, productName: string) => void
  notifyDisputeRaised: (orderId: string, productName: string) => void
  notifyDisputeReceived: (orderId: string, productName: string) => void
  notifyNewLogin: (device: string, location: string) => void
  notifyEscrowHeld: (orderId: string, amount: number) => void
  notifyEscrowReleased: (orderId: string, amount: number) => void
}

const calculateUnreadCount = (notifications: Notification[]): number => {
  return notifications.filter(n => !n.read).length
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [], // Start with empty - no dummy data
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          read: false,
          timestamp: new Date()
        }
        set(state => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }))
      },

      markAsRead: (id: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id)
          if (notification && !notification.read) {
            const updatedNotifications = state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            )
            return {
              notifications: updatedNotifications,
              unreadCount: calculateUnreadCount(updatedNotifications)
            }
          }
          return state
        })
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        }))
      },

      deleteNotification: (id: string) => {
        set(state => {
          const updatedNotifications = state.notifications.filter(n => n.id !== id)
          return {
            notifications: updatedNotifications,
            unreadCount: calculateUnreadCount(updatedNotifications)
          }
        })
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      getByOrderId: (orderId: string) => {
        return get().notifications.filter(n => n.orderId === orderId)
      },

      // Event-specific notification triggers
      notifyOrderPlaced: (orderId, productName, amount) => {
        get().addNotification({
          type: 'order',
          title: 'Order Placed Successfully',
          message: `Your order for ${productName} (₹${amount.toLocaleString()}) has been placed. Payment is secured in escrow.`,
          orderId,
          priority: 'high',
          actionUrl: '/orders'
        })
      },

      notifyPaymentSuccess: (orderId, amount) => {
        get().addNotification({
          type: 'payment',
          title: 'Payment Successful',
          message: `Your payment of ₹${amount.toLocaleString()} has been processed and secured in escrow.`,
          orderId,
          priority: 'medium',
          actionUrl: '/orders'
        })
      },

      notifyOrderShipped: (orderId, productName) => {
        get().addNotification({
          type: 'delivery',
          title: 'Order Shipped',
          message: `Your ${productName} has been shipped and is on its way to you.`,
          orderId,
          priority: 'medium',
          actionUrl: '/orders'
        })
      },

      notifyOrderDelivered: (orderId, productName) => {
        get().addNotification({
          type: 'delivery',
          title: 'Order Delivered',
          message: `Your ${productName} has been delivered. Please verify within 5 days to release payment.`,
          orderId,
          priority: 'high',
          actionUrl: `/verify/${orderId}`
        })
      },

      notifyProductListed: (productId, productName) => {
        get().addNotification({
          type: 'product',
          title: 'Product Listed Successfully',
          message: `Your ${productName} is now live on the marketplace.`,
          productId,
          priority: 'medium',
          actionUrl: `/product/${productId}`
        })
      },

      notifyProductDeleted: (productId, productName) => {
        get().addNotification({
          type: 'product',
          title: 'Product Removed',
          message: `Your product '${productName}' has been removed successfully.`,
          productId,
          priority: 'medium',
        })
      },

      notifyProductSold: (productId, productName, buyerName) => {
        get().addNotification({
          type: 'order',
          title: 'Product Sold!',
          message: `${buyerName} has purchased your ${productName}. Payment is secured in escrow.`,
          productId,
          priority: 'high',
          actionUrl: '/seller'
        })
      },

      notifyProductPickedUp: (orderId, productName) => {
        get().addNotification({
          type: 'delivery',
          title: 'Product Picked Up',
          message: `Your ${productName} has been picked up by the courier and is on its way.`,
          orderId,
          priority: 'medium',
          actionUrl: '/orders'
        })
      },

      notifyDisputeRaised: (orderId, productName) => {
        get().addNotification({
          type: 'dispute',
          title: 'Dispute Submitted',
          message: `Your dispute for ${productName} has been submitted. Our team will review it within 24-48 hours.`,
          orderId,
          priority: 'high',
          actionUrl: `/dispute/${orderId}`
        })
      },

      notifyDisputeReceived: (orderId, productName) => {
        get().addNotification({
          type: 'dispute',
          title: 'Dispute Alert',
          message: `A buyer has raised a dispute for ${productName}. Please respond within 48 hours.`,
          orderId,
          priority: 'high',
          actionUrl: `/dispute/${orderId}`
        })
      },

      notifyNewLogin: (device, location) => {
        get().addNotification({
          type: 'security',
          title: 'New Login Detected',
          message: `Someone logged into your account from ${device} in ${location}.`,
          priority: 'high',
          actionUrl: '/security'
        })
      },

      notifyEscrowHeld: (orderId, amount) => {
        get().addNotification({
          type: 'escrow',
          title: 'Funds Secured in Escrow',
          message: `₹${amount.toLocaleString()} is now held securely until product verification.`,
          orderId,
          priority: 'medium',
          actionUrl: '/orders'
        })
      },

      notifyEscrowReleased: (orderId, amount) => {
        get().addNotification({
          type: 'escrow',
          title: 'Payment Released',
          message: `₹${amount.toLocaleString()} has been released to the seller after successful verification.`,
          orderId,
          priority: 'medium',
          actionUrl: '/orders'
        })
      }
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount
      })
    }
  )
)
