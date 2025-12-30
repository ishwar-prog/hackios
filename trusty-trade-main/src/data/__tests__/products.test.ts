import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { products, orders, disputes, escrowAccounts, allProducts } from '../products'
import type { Product, Order, Dispute, EscrowAccount } from '../products'

/**
 * Feature: escrow-marketplace-buyer, Property 15: Data Store Synchronization
 * Validates: Requirements 1.5
 */
describe('Data Model Validation', () => {
  describe('Product Data Integrity', () => {
    it('should have valid product structure for all products', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...products),
          (product: Product) => {
            // Validate required fields exist
            expect(product.id).toBeDefined()
            expect(product.name).toBeDefined()
            expect(product.price).toBeGreaterThan(0)
            expect(product.condition).toMatch(/^(excellent|good|fair|poor)$/)
            expect(product.images.length).toBeGreaterThan(0)
            expect(product.seller).toBeDefined()
            expect(product.seller.id).toBeDefined()
            expect(product.seller.rating).toBeGreaterThanOrEqual(0)
            expect(product.seller.rating).toBeLessThanOrEqual(5)
            
            // Validate escrow protection is always true for our marketplace
            expect(product.escrowProtected).toBe(true)
            expect(product.openBoxDelivery).toBe(true)
            expect(product.returnEligible).toBe(true)
            
            // Validate image consistency
            expect(product.image).toBe(product.images[0])
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should have consistent seller data across products', () => {
      const sellerMap = new Map<string, any>()
      
      products.forEach(product => {
        const sellerId = product.seller.id
        if (sellerMap.has(sellerId)) {
          const existingSeller = sellerMap.get(sellerId)
          // Same seller should have consistent data across products
          expect(product.seller.name).toBe(existingSeller.name)
          expect(product.seller.rating).toBe(existingSeller.rating)
          expect(product.seller.totalSales).toBe(existingSeller.totalSales)
        } else {
          sellerMap.set(sellerId, product.seller)
        }
      })
    })
  })

  describe('Order Data Integrity', () => {
    it('should have valid order structure for all orders', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...orders),
          (order: Order) => {
            // Validate required fields
            expect(order.id).toBeDefined()
            expect(order.productId).toBeDefined()
            expect(order.amount).toBeGreaterThan(0)
            expect(order.status).toMatch(/^(pending_payment|paid|shipped|delivered|verified|disputed|completed|refunded)$/)
            expect(order.escrowStatus).toMatch(/^(held|released|refunded|disputed)$/)
            
            // Validate product reference exists (using allProducts which includes additionalProducts)
            const productExists = allProducts.some(p => p.id === order.productId)
            expect(productExists).toBe(true)
            
            // Validate order amount matches product price
            const product = allProducts.find(p => p.id === order.productId)
            if (product) {
              expect(order.amount).toBe(product.price)
            }
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should have consistent escrow status with order status', () => {
      orders.forEach(order => {
        if (order.status === 'verified') {
          expect(order.escrowStatus).toBe('released')
        } else if (order.status === 'refunded') {
          expect(order.escrowStatus).toBe('refunded')
        } else if (order.status === 'disputed') {
          expect(order.escrowStatus).toBe('disputed')
        } else {
          expect(order.escrowStatus).toBe('held')
        }
      })
    })
  })

  describe('Dispute Data Integrity', () => {
    it('should have valid dispute structure for all disputes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...disputes),
          (dispute: Dispute) => {
            // Validate required fields
            expect(dispute.id).toBeDefined()
            expect(dispute.orderId).toBeDefined()
            expect(dispute.issueType).toMatch(/^(not_as_described|damaged|not_working|missing_parts|counterfeit|other)$/)
            expect(dispute.status).toMatch(/^(open|investigating|resolved_refund|resolved_partial|resolved_favor_seller|closed)$/)
            expect(dispute.description).toBeDefined()
            expect(Array.isArray(dispute.evidence)).toBe(true)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Escrow Account Data Integrity', () => {
    it('should have valid escrow account structure', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...escrowAccounts),
          (account: EscrowAccount) => {
            // Validate required fields
            expect(account.id).toBeDefined()
            expect(account.orderId).toBeDefined()
            expect(account.amount).toBeGreaterThan(0)
            expect(account.status).toMatch(/^(held|released|refunded|disputed)$/)
            
            // Validate order reference exists
            const orderExists = orders.some(o => o.id === account.orderId)
            expect(orderExists).toBe(true)
            
            return true
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should have escrow amounts matching order amounts', () => {
      escrowAccounts.forEach(account => {
        const order = orders.find(o => o.id === account.orderId)
        if (order) {
          expect(account.amount).toBe(order.amount)
          expect(account.status).toBe(order.escrowStatus)
        }
      })
    })
  })

  describe('Cross-Reference Data Integrity', () => {
    it('should maintain referential integrity between all entities', () => {
      // Every order should reference a valid product (using allProducts)
      orders.forEach(order => {
        const product = allProducts.find(p => p.id === order.productId)
        expect(product).toBeDefined()
        
        // Legacy compatibility check
        if (order.product) {
          expect(order.product.id).toBe(order.productId)
        }
      })
      
      // Every dispute should reference a valid order
      disputes.forEach(dispute => {
        const order = orders.find(o => o.id === dispute.orderId)
        expect(order).toBeDefined()
      })
      
      // Every escrow account should reference a valid order
      escrowAccounts.forEach(account => {
        const order = orders.find(o => o.id === account.orderId)
        expect(order).toBeDefined()
      })
    })
  })
})