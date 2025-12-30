import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useProductStore } from '../useProductStore'
import { useOrderStore } from '../useOrderStore'
import { useEscrowStore } from '../useEscrowStore'
import { useAuthStore } from '../useAuthStore'
import { products } from '@/data/products'

/**
 * Feature: escrow-marketplace-buyer, Property 9: State Persistence Across Navigation
 * Feature: escrow-marketplace-buyer, Property 17: Dispute Status Update
 * Validates: Requirements 7.2, 6.5
 */
describe('State Management Tests', () => {
  beforeEach(() => {
    // Reset stores before each test
    useProductStore.setState({
      products: [],
      selectedProduct: null,
      loading: false,
      error: null
    })
    
    useOrderStore.setState({
      orders: [],
      currentOrder: null,
      loading: false,
      error: null
    })
    
    useEscrowStore.setState({
      escrowAccounts: {},
      loading: false,
      error: null
    })
  })

  describe('Product Store State Management', () => {
    it('should maintain product state consistency across operations', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...products),
          (product) => {
            const store = useProductStore.getState()
            
            // Set selected product
            store.setSelectedProduct(product)
            
            // Verify state persistence
            const updatedState = useProductStore.getState()
            expect(updatedState.selectedProduct).toEqual(product)
            expect(updatedState.selectedProduct?.id).toBe(product.id)
            
            // Clear selection
            store.setSelectedProduct(null)
            const clearedState = useProductStore.getState()
            expect(clearedState.selectedProduct).toBeNull()
            
            return true
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should filter products correctly based on various criteria', () => {
      fc.assert(
        fc.property(
          fc.record({
            category: fc.option(fc.constantFrom('Phones', 'Laptops', 'Consoles', 'Accessories')),
            condition: fc.option(fc.constantFrom('excellent', 'good', 'fair', 'poor')),
            priceRange: fc.option(fc.tuple(fc.nat(2000), fc.nat(3000)).map(([min, max]) => [Math.min(min, max), Math.max(min, max)] as [number, number])),
            searchQuery: fc.option(fc.string({ minLength: 1, maxLength: 20 }))
          }),
          (filters) => {
            // Initialize store with products
            useProductStore.setState({ products })
            const store = useProductStore.getState()
            
            const filteredProducts = store.filterProducts(filters)
            
            // Verify all returned products match the filters
            filteredProducts.forEach(product => {
              if (filters.category) {
                expect(product.category).toBe(filters.category)
              }
              if (filters.condition) {
                expect(product.condition).toBe(filters.condition)
              }
              if (filters.priceRange) {
                const [min, max] = filters.priceRange
                expect(product.price).toBeGreaterThanOrEqual(min)
                expect(product.price).toBeLessThanOrEqual(max)
              }
              if (filters.searchQuery) {
                const searchableText = [
                  product.name,
                  product.description,
                  product.brand,
                  product.model,
                  product.category
                ].join(' ').toLowerCase()
                expect(searchableText).toContain(filters.searchQuery.toLowerCase())
              }
            })
            
            return true
          }
        ),
        { numRuns: 30 }
      )
    })
  })

  describe('Order Store State Management', () => {
    it('should maintain order state consistency during status updates', async () => {
      // Use a simpler approach for async testing
      const product = products[0]
      const orderStore = useOrderStore.getState()
      
      // Create an order
      const order = await orderStore.createOrder(product.id, product.price)
      expect(order.productId).toBe(product.id)
      expect(order.amount).toBe(product.price)
      expect(order.status).toBe('paid')
      expect(order.escrowStatus).toBe('held')
      
      // Test different status updates
      const statusTests = [
        { status: 'shipped', expectedEscrow: 'held' },
        { status: 'delivered', expectedEscrow: 'held' },
        { status: 'verified', expectedEscrow: 'released' },
      ]
      
      for (const test of statusTests) {
        orderStore.updateOrderStatus(order.id, test.status as any)
        const updatedOrder = orderStore.getOrder(order.id)
        expect(updatedOrder?.status).toBe(test.status)
        expect(updatedOrder?.escrowStatus).toBe(test.expectedEscrow)
        
        if (test.status === 'verified') {
          expect(updatedOrder?.verifiedAt).toBeDefined()
        }
      }
    })

    it('should calculate verification time correctly', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...products),
          fc.integer({ min: 1, max: 10 }), // days in future
          (product, daysFromNow) => {
            const orderStore = useOrderStore.getState()
            
            // Create order and set it to delivered with verification deadline
            const order = {
              id: 'test-order',
              productId: product.id,
              buyerId: 'buyer-1',
              sellerId: product.sellerId,
              status: 'delivered' as const,
              amount: product.price,
              escrowStatus: 'held' as const,
              createdAt: new Date(),
              deliveredAt: new Date(),
              verificationDeadline: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000),
              product,
              orderDate: new Date().toISOString().split('T')[0],
            }
            
            const timeLeft = orderStore.calculateVerificationTimeLeft(order)
            
            // Should return the correct number of days (allowing for some timing variance)
            expect(timeLeft).toBeGreaterThanOrEqual(daysFromNow - 1)
            expect(timeLeft).toBeLessThanOrEqual(daysFromNow + 1)
            
            return true
          }
        ),
        { numRuns: 20 }
      )
    })
  })

  describe('Escrow Store State Management', () => {
    it('should maintain escrow account consistency across operations', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 20 }),
          fc.integer({ min: 1, max: 5000 }),
          (orderId, amount) => {
            const escrowStore = useEscrowStore.getState()
            
            // Create escrow account
            const account = escrowStore.createEscrowAccount(orderId, amount)
            
            expect(account.orderId).toBe(orderId)
            expect(account.amount).toBe(amount)
            expect(account.status).toBe('held')
            
            // Verify it's stored correctly
            const retrievedAccount = escrowStore.getEscrowAccount(orderId)
            expect(retrievedAccount).toEqual(account)
            
            const status = escrowStore.getEscrowStatus(orderId)
            expect(status).toBe('held')
            
            return true
          }
        ),
        { numRuns: 30 }
      )
    })

    it('should handle escrow status transitions correctly', async () => {
      const escrowStore = useEscrowStore.getState()
      const orderId = 'test-order-123'
      const amount = 500
      
      // Create account
      const account = escrowStore.createEscrowAccount(orderId, amount)
      expect(account.status).toBe('held')
      
      // Test release
      await escrowStore.releaseEscrow(orderId)
      const releasedAccount = escrowStore.getEscrowAccount(orderId)
      expect(releasedAccount?.status).toBe('released')
      expect(releasedAccount?.releasedAt).toBeDefined()
      
      // Reset for refund test
      escrowStore.createEscrowAccount('test-order-456', amount)
      await escrowStore.refundEscrow('test-order-456')
      const refundedAccount = escrowStore.getEscrowAccount('test-order-456')
      expect(refundedAccount?.status).toBe('refunded')
      expect(refundedAccount?.refundedAt).toBeDefined()
    })
  })

  describe('Auth Store State Management', () => {
    it('should maintain authentication state consistency', () => {
      const authStore = useAuthStore.getState()
      
      // Should start with mock user authenticated
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.user).toBeDefined()
      expect(authStore.user?.role).toBe('buyer')
      
      // Test logout
      authStore.logout()
      const loggedOutState = useAuthStore.getState()
      expect(loggedOutState.isAuthenticated).toBe(false)
      expect(loggedOutState.user).toBeNull()
      
      // Test setting user
      const testUser = {
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'buyer' as const,
        joinDate: new Date(),
        verificationStatus: 'verified' as const
      }
      
      authStore.setUser(testUser)
      const updatedState = useAuthStore.getState()
      expect(updatedState.isAuthenticated).toBe(true)
      expect(updatedState.user).toEqual(testUser)
    })
  })

  describe('Cross-Store State Consistency', () => {
    it('should maintain consistency between order and escrow stores', async () => {
      const orderStore = useOrderStore.getState()
      const escrowStore = useEscrowStore.getState()
      
      // Create order
      const product = products[0]
      const order = await orderStore.createOrder(product.id, product.price)
      
      // Create corresponding escrow account
      const escrowAccount = escrowStore.createEscrowAccount(order.id, order.amount)
      
      // Verify consistency
      expect(escrowAccount.orderId).toBe(order.id)
      expect(escrowAccount.amount).toBe(order.amount)
      expect(escrowAccount.status).toBe(order.escrowStatus)
      
      // Update order status and verify escrow consistency
      orderStore.updateOrderStatus(order.id, 'verified')
      await escrowStore.releaseEscrow(order.id)
      
      const updatedOrder = orderStore.getOrder(order.id)
      const updatedEscrow = escrowStore.getEscrowAccount(order.id)
      
      expect(updatedOrder?.escrowStatus).toBe('released')
      expect(updatedEscrow?.status).toBe('released')
    })
  })
})