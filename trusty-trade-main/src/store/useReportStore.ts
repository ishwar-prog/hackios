import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ReportReason = 
  | 'scam'
  | 'fake_product'
  | 'harassment'
  | 'inappropriate_content'
  | 'suspicious_activity'
  | 'other'

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

export interface Report {
  id: string
  reporterId: string
  reporterName: string
  reportedUserId: string
  reportedUserName: string
  reportedUserType: 'buyer' | 'seller'
  reason: ReportReason
  description: string
  evidence: string[] // Image URLs
  orderId?: string
  productId?: string
  status: ReportStatus
  adminNotes?: string
  createdAt: Date
  resolvedAt?: Date
}

interface ReportStore {
  reports: Report[]
  
  // Actions
  submitReport: (report: Omit<Report, 'id' | 'status' | 'createdAt'>) => void
  updateReportStatus: (reportId: string, status: ReportStatus, adminNotes?: string) => void
  getReportsByUser: (userId: string) => Report[]
  getReportsByStatus: (status: ReportStatus) => Report[]
  getPendingReportsCount: () => number
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: [
        {
          id: 'RPT-001',
          reporterId: 'buyer-1',
          reporterName: 'John Doe',
          reportedUserId: 'seller-99',
          reportedUserName: 'SuspiciousSeller',
          reportedUserType: 'seller',
          reason: 'fake_product',
          description: 'This seller is listing counterfeit products. The iPhone they sold me was a fake.',
          evidence: [],
          orderId: 'ORD-FAKE-001',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000)
        },
        {
          id: 'RPT-002',
          reporterId: 'buyer-2',
          reporterName: 'Jane Smith',
          reportedUserId: 'seller-88',
          reportedUserName: 'BadActor',
          reportedUserType: 'seller',
          reason: 'scam',
          description: 'Seller never shipped the item and stopped responding.',
          evidence: [],
          status: 'reviewed',
          createdAt: new Date(Date.now() - 172800000)
        }
      ],

      submitReport: (report) => {
        const newReport: Report = {
          ...report,
          id: `RPT-${Date.now()}`,
          status: 'pending',
          createdAt: new Date()
        }
        set(state => ({
          reports: [newReport, ...state.reports]
        }))
      },

      updateReportStatus: (reportId, status, adminNotes) => {
        set(state => ({
          reports: state.reports.map(report => {
            if (report.id === reportId) {
              return {
                ...report,
                status,
                adminNotes,
                resolvedAt: status === 'resolved' || status === 'dismissed' ? new Date() : undefined
              }
            }
            return report
          })
        }))
      },

      getReportsByUser: (userId) => {
        return get().reports.filter(r => r.reportedUserId === userId)
      },

      getReportsByStatus: (status) => {
        return get().reports.filter(r => r.status === status)
      },

      getPendingReportsCount: () => {
        return get().reports.filter(r => r.status === 'pending').length
      }
    }),
    {
      name: 'report-storage'
    }
  )
)
