import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super_admin'
}

export interface DisputeCase {
  id: string
  orderId: string
  buyerId: string
  buyerName: string
  sellerId: string
  sellerName: string
  productName: string
  amount: number
  issueType: string
  description: string
  evidence: string[]
  status: 'open' | 'investigating' | 'resolved_buyer' | 'resolved_seller' | 'closed'
  adminNotes?: string
  createdAt: Date
  resolvedAt?: Date
  resolution?: string
}

export interface UserRestriction {
  userId: string
  userName: string
  type: 'warning' | 'limited' | 'suspended' | 'banned'
  reason: string
  createdAt: Date
  expiresAt?: Date
}

export interface WalletControl {
  userId: string
  userName: string
  balance: number
  status: 'ACTIVE' | 'LIMITED' | 'FROZEN'
  lastActivity: Date
  restrictions?: string[]
}

export interface UserReport {
  id: string
  reporterId: string
  reporterName: string
  reportedUserId: string
  reportedUserName: string
  reason: 'scam' | 'fake_product' | 'harassment' | 'spam' | 'other'
  description: string
  evidence: string[]
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  createdAt: Date
  adminNotes?: string
}

export interface AdminMessage {
  id: string
  userId: string
  userName: string
  subject: string
  messages: {
    id: string
    sender: 'admin' | 'user'
    content: string
    timestamp: Date
  }[]
  status: 'open' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
}

export interface AdminAction {
  id: string
  adminId: string
  adminName: string
  action: string
  target: string
  targetId: string
  details: string
  timestamp: Date
}

interface AdminStore {
  isAdminAuthenticated: boolean
  adminUser: AdminUser | null
  disputes: DisputeCase[]
  userRestrictions: UserRestriction[]
  walletControls: WalletControl[]
  userReports: UserReport[]
  adminMessages: AdminMessage[]
  adminActions: AdminAction[]
  deletedProductIds: string[] // Track admin-deleted products
  
  // Auth Actions
  adminLogin: (email: string, password: string) => boolean
  adminLogout: () => void
  
  // Dispute Actions
  resolveDispute: (disputeId: string, resolution: 'buyer' | 'seller', notes: string) => void
  updateDisputeStatus: (disputeId: string, status: DisputeCase['status']) => void
  addDispute: (dispute: Omit<DisputeCase, 'id' | 'createdAt' | 'status'>) => void
  
  // User Management Actions
  restrictUser: (restriction: Omit<UserRestriction, 'createdAt'>) => void
  removeRestriction: (userId: string) => void
  getUserRestriction: (userId: string) => UserRestriction | undefined
  
  // Wallet Control Actions
  freezeWallet: (userId: string, userName: string, reason: string) => void
  unfreezeWallet: (userId: string) => void
  limitWallet: (userId: string, restrictions: string[]) => void
  getWalletStatus: (userId: string) => WalletControl | undefined
  
  // User Reports Actions
  addUserReport: (report: Omit<UserReport, 'id' | 'createdAt' | 'status'>) => void
  updateReportStatus: (reportId: string, status: UserReport['status'], notes?: string) => void
  
  // Admin Communication Actions
  createAdminMessage: (userId: string, userName: string, subject: string, priority: AdminMessage['priority']) => string
  addMessageToThread: (messageId: string, sender: 'admin' | 'user', content: string) => void
  resolveMessage: (messageId: string) => void
  
  // Product Management (Admin)
  deleteProductAsAdmin: (productId: string) => void
  isProductDeletedByAdmin: (productId: string) => boolean
  flagSuspiciousListing: (productId: string, reason: string) => void
  
  // Admin Actions Logging
  logAdminAction: (action: string, target: string, targetId: string, details: string) => void
  
  // Stats
  getOpenDisputesCount: () => number
  getFrozenWalletsCount: () => number
  getPendingReportsCount: () => number
  getTotalUsersCount: () => number
  getActiveListingsCount: () => number
}

const ADMIN_EMAIL = 'admin@trustytrade.com'
const ADMIN_PASSWORD = 'admin123'

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      adminUser: null,
      disputes: [
        {
          id: 'DISP-001',
          orderId: 'ORD-2024-007',
          buyerId: 'buyer-1',
          buyerName: 'John Doe',
          sellerId: 'seller-5',
          sellerName: 'Audio Experts',
          productName: 'Sony WH-1000XM5',
          amount: 279,
          issueType: 'not_as_described',
          description: 'The headphones have visible scratches that were not mentioned in the listing. Left ear cup has a crack.',
          evidence: [],
          status: 'open',
          createdAt: new Date(Date.now() - 86400000)
        },
        {
          id: 'DISP-002',
          orderId: 'ORD-2024-008',
          buyerId: 'buyer-2',
          buyerName: 'Jane Smith',
          sellerId: 'seller-3',
          sellerName: 'GameHub Central',
          productName: 'Nintendo Switch OLED',
          amount: 289,
          issueType: 'not_working',
          description: 'Console does not turn on. Tried multiple chargers and outlets.',
          evidence: [],
          status: 'investigating',
          createdAt: new Date(Date.now() - 172800000)
        }
      ],
      userRestrictions: [],
      walletControls: [
        {
          userId: 'user-1',
          userName: 'John Doe',
          balance: 1250.00,
          status: 'ACTIVE',
          lastActivity: new Date(Date.now() - 3600000)
        },
        {
          userId: 'user-2',
          userName: 'Jane Smith',
          balance: 850.50,
          status: 'LIMITED',
          lastActivity: new Date(Date.now() - 7200000),
          restrictions: ['No withdrawals over $100']
        },
        {
          userId: 'user-3',
          userName: 'Suspicious User',
          balance: 2500.00,
          status: 'FROZEN',
          lastActivity: new Date(Date.now() - 86400000),
          restrictions: ['Account under investigation']
        }
      ],
      userReports: [
        {
          id: 'REP-001',
          reporterId: 'user-1',
          reporterName: 'John Doe',
          reportedUserId: 'user-4',
          reportedUserName: 'Scammer123',
          reason: 'scam',
          description: 'This user took my money and never shipped the product.',
          evidence: [],
          status: 'pending',
          createdAt: new Date(Date.now() - 43200000)
        }
      ],
      adminMessages: [
        {
          id: 'MSG-001',
          userId: 'user-1',
          userName: 'John Doe',
          subject: 'Payment Issue',
          messages: [
            {
              id: 'msg-1',
              sender: 'user',
              content: 'I cannot access my wallet. It shows an error.',
              timestamp: new Date(Date.now() - 3600000)
            }
          ],
          status: 'open',
          priority: 'medium',
          createdAt: new Date(Date.now() - 3600000)
        }
      ],
      adminActions: [],
      deletedProductIds: [],

      adminLogin: (email, password) => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          const adminUser: AdminUser = {
            id: 'admin-1',
            email: ADMIN_EMAIL,
            name: 'Admin User',
            role: 'admin'
          }
          set({
            isAdminAuthenticated: true,
            adminUser
          })
          get().logAdminAction('LOGIN', 'system', 'admin-1', 'Admin logged in')
          return true
        }
        return false
      },

      adminLogout: () => {
        get().logAdminAction('LOGOUT', 'system', 'admin-1', 'Admin logged out')
        set({
          isAdminAuthenticated: false,
          adminUser: null
        })
      },

      resolveDispute: (disputeId, resolution, notes) => {
        set(state => ({
          disputes: state.disputes.map(dispute => {
            if (dispute.id === disputeId) {
              const resolvedDispute = {
                ...dispute,
                status: resolution === 'buyer' ? 'resolved_buyer' : 'resolved_seller',
                adminNotes: notes,
                resolvedAt: new Date(),
                resolution: resolution === 'buyer' 
                  ? 'Refund issued to buyer' 
                  : 'Escrow released to seller'
              } as DisputeCase
              return resolvedDispute
            }
            return dispute
          })
        }))
        get().logAdminAction('RESOLVE_DISPUTE', 'dispute', disputeId, `Resolved in favor of ${resolution}`)
      },

      updateDisputeStatus: (disputeId, status) => {
        set(state => ({
          disputes: state.disputes.map(dispute => {
            if (dispute.id === disputeId) {
              return { ...dispute, status }
            }
            return dispute
          })
        }))
        get().logAdminAction('UPDATE_DISPUTE', 'dispute', disputeId, `Status changed to ${status}`)
      },

      addDispute: (disputeData) => {
        const newDispute: DisputeCase = {
          ...disputeData,
          id: `DISP-${Date.now()}`,
          status: 'open',
          createdAt: new Date()
        }
        set(state => ({
          disputes: [newDispute, ...state.disputes]
        }))
      },

      restrictUser: (restriction) => {
        const newRestriction: UserRestriction = {
          ...restriction,
          createdAt: new Date()
        }
        set(state => ({
          userRestrictions: [
            ...state.userRestrictions.filter(r => r.userId !== restriction.userId),
            newRestriction
          ]
        }))
        get().logAdminAction('RESTRICT_USER', 'user', restriction.userId, `Applied ${restriction.type}: ${restriction.reason}`)
      },

      removeRestriction: (userId) => {
        set(state => ({
          userRestrictions: state.userRestrictions.filter(r => r.userId !== userId)
        }))
        get().logAdminAction('REMOVE_RESTRICTION', 'user', userId, 'User restriction removed')
      },

      getUserRestriction: (userId) => {
        return get().userRestrictions.find(r => r.userId === userId)
      },

      freezeWallet: (userId, userName, reason) => {
        set(state => ({
          walletControls: [
            ...state.walletControls.filter(w => w.userId !== userId),
            {
              userId,
              userName,
              balance: state.walletControls.find(w => w.userId === userId)?.balance || 0,
              status: 'FROZEN',
              lastActivity: new Date(),
              restrictions: [reason]
            }
          ]
        }))
        get().logAdminAction('FREEZE_WALLET', 'wallet', userId, reason)
      },

      unfreezeWallet: (userId) => {
        set(state => ({
          walletControls: state.walletControls.map(wallet => 
            wallet.userId === userId 
              ? { ...wallet, status: 'ACTIVE', restrictions: undefined }
              : wallet
          )
        }))
        get().logAdminAction('UNFREEZE_WALLET', 'wallet', userId, 'Wallet unfrozen')
      },

      limitWallet: (userId, restrictions) => {
        set(state => ({
          walletControls: state.walletControls.map(wallet => 
            wallet.userId === userId 
              ? { ...wallet, status: 'LIMITED', restrictions }
              : wallet
          )
        }))
        get().logAdminAction('LIMIT_WALLET', 'wallet', userId, `Restrictions: ${restrictions.join(', ')}`)
      },

      getWalletStatus: (userId) => {
        return get().walletControls.find(w => w.userId === userId)
      },

      addUserReport: (reportData) => {
        const newReport: UserReport = {
          ...reportData,
          id: `REP-${Date.now()}`,
          status: 'pending',
          createdAt: new Date()
        }
        set(state => ({
          userReports: [newReport, ...state.userReports]
        }))
      },

      updateReportStatus: (reportId, status, notes) => {
        set(state => ({
          userReports: state.userReports.map(report => 
            report.id === reportId 
              ? { ...report, status, adminNotes: notes }
              : report
          )
        }))
        get().logAdminAction('UPDATE_REPORT', 'report', reportId, `Status: ${status}`)
      },

      createAdminMessage: (userId, userName, subject, priority) => {
        const messageId = `MSG-${Date.now()}`
        const newMessage: AdminMessage = {
          id: messageId,
          userId,
          userName,
          subject,
          messages: [],
          status: 'open',
          priority,
          createdAt: new Date()
        }
        set(state => ({
          adminMessages: [newMessage, ...state.adminMessages]
        }))
        return messageId
      },

      addMessageToThread: (messageId, sender, content) => {
        set(state => ({
          adminMessages: state.adminMessages.map(msg => 
            msg.id === messageId 
              ? {
                  ...msg,
                  messages: [
                    ...msg.messages,
                    {
                      id: `msg-${Date.now()}`,
                      sender,
                      content,
                      timestamp: new Date()
                    }
                  ]
                }
              : msg
          )
        }))
      },

      resolveMessage: (messageId) => {
        set(state => ({
          adminMessages: state.adminMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'resolved' }
              : msg
          )
        }))
        get().logAdminAction('RESOLVE_MESSAGE', 'message', messageId, 'Message thread resolved')
      },

      deleteProductAsAdmin: (productId) => {
        set(state => ({
          deletedProductIds: [...state.deletedProductIds, productId]
        }))
        get().logAdminAction('DELETE_PRODUCT', 'product', productId, 'Product removed by admin')
      },

      isProductDeletedByAdmin: (productId) => {
        return get().deletedProductIds.includes(productId)
      },

      flagSuspiciousListing: (productId, reason) => {
        get().logAdminAction('FLAG_LISTING', 'product', productId, `Flagged as suspicious: ${reason}`)
      },

      logAdminAction: (action, target, targetId, details) => {
        const { adminUser } = get()
        if (!adminUser) return

        const newAction: AdminAction = {
          id: `ACT-${Date.now()}`,
          adminId: adminUser.id,
          adminName: adminUser.name,
          action,
          target,
          targetId,
          details,
          timestamp: new Date()
        }
        set(state => ({
          adminActions: [newAction, ...state.adminActions].slice(0, 100) // Keep last 100 actions
        }))
      },

      getOpenDisputesCount: () => {
        return get().disputes.filter(d => d.status === 'open' || d.status === 'investigating').length
      },

      getFrozenWalletsCount: () => {
        return get().walletControls.filter(w => w.status === 'FROZEN').length
      },

      getPendingReportsCount: () => {
        return get().userReports.filter(r => r.status === 'pending').length
      },

      getTotalUsersCount: () => {
        return get().walletControls.length + 1000 // Mock additional users
      },

      getActiveListingsCount: () => {
        return 150 - get().deletedProductIds.length // Mock total minus deleted
      }
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminUser: state.adminUser,
        disputes: state.disputes,
        userRestrictions: state.userRestrictions,
        walletControls: state.walletControls,
        userReports: state.userReports,
        adminMessages: state.adminMessages,
        adminActions: state.adminActions,
        deletedProductIds: state.deletedProductIds
      })
    }
  )
)
