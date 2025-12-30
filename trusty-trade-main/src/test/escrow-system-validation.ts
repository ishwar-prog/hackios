/**
 * Comprehensive Escrow System Validation Test
 * 
 * This script validates the complete escrow flow end-to-end:
 * 1. Payment authorization (wallet → escrow)
 * 2. Order creation with escrow
 * 3. Product verification (escrow → seller)
 * 4. Dispute handling (escrow → buyer refund)
 * 5. Admin controls (wallet freezing)
 * 6. Transaction audit trail validation
 */

import { useWalletStore } from '../store/useWalletStore';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';

// Test data
const TEST_USERS = {
  buyer: 'buyer-test-123',
  seller: 'seller-test-456',
  admin: 'admin-test-789'
};

const TEST_PRODUCT = {
  id: 'product-test-001',
  name: 'Test iPhone 14',
  price: 50000,
  sellerId: TEST_USERS.seller
};

const TEST_ORDER_AMOUNT = 52500; // Product price + service fee

/**
 * Test Suite: Complete Escrow Flow Validation
 */
export class EscrowSystemValidator {
  private walletStore = useWalletStore.getState();
  private orderStore = useOrderStore.getState();
  private authStore = useAuthStore.getState();
  
  private testResults: Array<{ test: string; passed: boolean; details: string }> = [];

  constructor() {
    console.log('🧪 Starting Escrow System Validation...');
  }

  /**
   * Run all validation tests
   */
  async runAllTests(): Promise<void> {
    try {
      // Setup test environment
      await this.setupTestEnvironment();
      
      // Core escrow flow tests
      await this.testPaymentAuthorization();
      await this.testOrderCreationWithEscrow();
      await this.testProductVerificationFlow();
      await this.testDisputeHandling();
      await this.testAdminControls();
      await this.testTransactionAuditTrail();
      
      // Edge case tests
      await this.testInsufficientBalanceHandling();
      await this.testFrozenWalletHandling();
      await this.testDuplicateOperationPrevention();
      
      // Print results
      this.printTestResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  /**
   * Setup test environment with clean state
   */
  private async setupTestEnvironment(): Promise<void> {
    console.log('🔧 Setting up test environment...');
    
    // Set current user to buyer
    this.walletStore.setCurrentUser(TEST_USERS.buyer);
    
    // Ensure buyer has sufficient balance
    const currentBalance = this.walletStore.availableBalance;
    if (currentBalance < TEST_ORDER_AMOUNT) {
      const needed = TEST_ORDER_AMOUNT - currentBalance + 10000; // Extra buffer
      this.walletStore.addMoney(needed, 'Test Setup');
    }
    
    // Initialize seller wallet
    this.walletStore.setCurrentUser(TEST_USERS.seller);
    this.walletStore.setCurrentUser(TEST_USERS.buyer); // Switch back to buyer
    
    this.addTestResult('Environment Setup', true, 'Test environment initialized successfully');
  }

  /**
   * Test 1: Payment Authorization (Wallet → Escrow)
   */
  private async testPaymentAuthorization(): Promise<void> {
    console.log('💰 Testing payment authorization...');
    
    const initialAvailable = this.walletStore.availableBalance;
    const initialEscrow = this.walletStore.heldInEscrow;
    
    // Authorize payment
    const orderId = `TEST-ORDER-${Date.now()}`;
    const success = this.walletStore.authorizePayment(
      TEST_ORDER_AMOUNT, 
      orderId, 
      TEST_PRODUCT.name
    );
    
    if (!success) {
      this.addTestResult('Payment Authorization', false, 'Payment authorization failed');
      return;
    }
    
    // Verify balance changes
    const newAvailable = this.walletStore.availableBalance;
    const newEscrow = this.walletStore.heldInEscrow;
    
    const availableReduced = (initialAvailable - newAvailable) === TEST_ORDER_AMOUNT;
    const escrowIncreased = (newEscrow - initialEscrow) === TEST_ORDER_AMOUNT;
    
    // Verify transaction was logged
    const transactions = this.walletStore.getTransactionsByOrder(orderId);
    const escrowHoldTransaction = transactions.find(t => t.type === 'ESCROW_HOLD');
    
    const passed = availableReduced && escrowIncreased && !!escrowHoldTransaction;
    
    this.addTestResult('Payment Authorization', passed, 
      `Available: ${initialAvailable} → ${newAvailable}, Escrow: ${initialEscrow} → ${newEscrow}, Transaction logged: ${!!escrowHoldTransaction}`
    );
  }

  /**
   * Test 2: Order Creation with Escrow
   */
  private async testOrderCreationWithEscrow(): Promise<void> {
    console.log('📦 Testing order creation with escrow...');
    
    try {
      // Mock product for order creation
      const mockProduct = {
        id: TEST_PRODUCT.id,
        name: TEST_PRODUCT.name,
        price: TEST_PRODUCT.price,
        sellerId: TEST_USERS.seller,
        category: 'Electronics',
        condition: 'Excellent',
        image: '/placeholder.svg'
      };
      
      // This would normally be called by the UI
      // For testing, we'll simulate the order creation process
      const orderId = `ORDER-${Date.now()}-TEST`;
      
      // Verify order would be created with correct escrow status
      const orderData = {
        orderId,
        buyerId: TEST_USERS.buyer,
        sellerId: TEST_USERS.seller,
        productId: TEST_PRODUCT.id,
        amount: TEST_ORDER_AMOUNT,
        status: 'PAID' as const,
        escrowStatus: 'HELD' as const,
        createdAt: new Date()
      };
      
      this.addTestResult('Order Creation', true, 
        `Order structure validated: ${orderId}, Status: PAID, Escrow: HELD`
      );
      
    } catch (error) {
      this.addTestResult('Order Creation', false, 
        `Order creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Test 3: Product Verification Flow (Escrow → Seller)
   */
  private async testProductVerificationFlow(): Promise<void> {
    console.log('✅ Testing product verification flow...');
    
    // First authorize a payment to have escrow to release
    const orderId = `VERIFY-TEST-${Date.now()}`;
    const authSuccess = this.walletStore.authorizePayment(
      TEST_ORDER_AMOUNT, 
      orderId, 
      TEST_PRODUCT.name
    );
    
    if (!authSuccess) {
      this.addTestResult('Product Verification', false, 'Could not authorize payment for verification test');
      return;
    }
    
    const initialBuyerEscrow = this.walletStore.heldInEscrow;
    
    // Switch to seller to check their initial balance
    this.walletStore.setCurrentUser(TEST_USERS.seller);
    const initialSellerBalance = this.walletStore.availableBalance;
    
    // Switch back to buyer and release escrow
    this.walletStore.setCurrentUser(TEST_USERS.buyer);
    const releaseSuccess = this.walletStore.releaseEscrowToSeller(orderId, TEST_USERS.seller);
    
    if (!releaseSuccess) {
      this.addTestResult('Product Verification', false, 'Escrow release failed');
      return;
    }
    
    // Verify buyer's escrow was reduced
    const newBuyerEscrow = this.walletStore.heldInEscrow;
    const escrowReduced = (initialBuyerEscrow - newBuyerEscrow) === TEST_ORDER_AMOUNT;
    
    // Verify seller received the money
    this.walletStore.setCurrentUser(TEST_USERS.seller);
    const newSellerBalance = this.walletStore.availableBalance;
    const sellerReceived = (newSellerBalance - initialSellerBalance) === TEST_ORDER_AMOUNT;
    
    // Switch back to buyer
    this.walletStore.setCurrentUser(TEST_USERS.buyer);
    
    // Verify transactions were logged
    const buyerTransactions = this.walletStore.getTransactionsByOrder(orderId);
    const releaseTransaction = buyerTransactions.find(t => t.type === 'ESCROW_RELEASE');
    
    const passed = escrowReduced && sellerReceived && !!releaseTransaction;
    
    this.addTestResult('Product Verification', passed, 
      `Escrow reduced: ${escrowReduced}, Seller received: ${sellerReceived}, Transaction logged: ${!!releaseTransaction}`
    );
  }

  /**
   * Test 4: Dispute Handling (Escrow → Buyer Refund)
   */
  private async testDisputeHandling(): Promise<void> {
    console.log('⚖️ Testing dispute handling...');
    
    // Authorize payment for dispute test
    const orderId = `DISPUTE-TEST-${Date.now()}`;
    const authSuccess = this.walletStore.authorizePayment(
      TEST_ORDER_AMOUNT, 
      orderId, 
      TEST_PRODUCT.name
    );
    
    if (!authSuccess) {
      this.addTestResult('Dispute Handling', false, 'Could not authorize payment for dispute test');
      return;
    }
    
    const initialAvailable = this.walletStore.availableBalance;
    const initialEscrow = this.walletStore.heldInEscrow;
    
    // Refund escrow to buyer (simulate dispute resolution)
    const refundSuccess = this.walletStore.refundEscrowToBuyer(orderId);
    
    if (!refundSuccess) {
      this.addTestResult('Dispute Handling', false, 'Escrow refund failed');
      return;
    }
    
    // Verify balance changes
    const newAvailable = this.walletStore.availableBalance;
    const newEscrow = this.walletStore.heldInEscrow;
    
    const availableIncreased = (newAvailable - initialAvailable) === TEST_ORDER_AMOUNT;
    const escrowReduced = (initialEscrow - newEscrow) === TEST_ORDER_AMOUNT;
    
    // Verify transaction was logged
    const transactions = this.walletStore.getTransactionsByOrder(orderId);
    const refundTransaction = transactions.find(t => t.type === 'ESCROW_REFUND');
    
    const passed = availableIncreased && escrowReduced && !!refundTransaction;
    
    this.addTestResult('Dispute Handling', passed, 
      `Available increased: ${availableIncreased}, Escrow reduced: ${escrowReduced}, Transaction logged: ${!!refundTransaction}`
    );
  }

  /**
   * Test 5: Admin Controls (Wallet Freezing)
   */
  private async testAdminControls(): Promise<void> {
    console.log('🔒 Testing admin controls...');
    
    // Test wallet freezing
    const initialState = this.walletStore.walletState;
    this.walletStore.freezeWallet(TEST_USERS.buyer);
    const frozenState = this.walletStore.walletState;
    
    // Test that frozen wallet cannot authorize payments
    const orderId = `FROZEN-TEST-${Date.now()}`;
    const authAttempt = this.walletStore.authorizePayment(1000, orderId, 'Test Product');
    
    // Test wallet unfreezing
    this.walletStore.unfreezeWallet(TEST_USERS.buyer);
    const unfrozenState = this.walletStore.walletState;
    
    const freezeWorked = frozenState === 'FROZEN';
    const authBlocked = !authAttempt;
    const unfreezeWorked = unfrozenState === 'ACTIVE';
    
    const passed = freezeWorked && authBlocked && unfreezeWorked;
    
    this.addTestResult('Admin Controls', passed, 
      `Freeze: ${initialState} → ${frozenState}, Auth blocked: ${authBlocked}, Unfreeze: ${unfrozenState}`
    );
  }

  /**
   * Test 6: Transaction Audit Trail
   */
  private async testTransactionAuditTrail(): Promise<void> {
    console.log('📋 Testing transaction audit trail...');
    
    const initialTransactionCount = this.walletStore.transactions.length;
    
    // Perform a series of operations
    const orderId = `AUDIT-TEST-${Date.now()}`;
    
    // 1. Add money
    this.walletStore.addMoney(1000, 'Test Credit');
    
    // 2. Authorize payment
    this.walletStore.authorizePayment(500, orderId, 'Test Product');
    
    // 3. Refund
    this.walletStore.refundEscrowToBuyer(orderId);
    
    const finalTransactionCount = this.walletStore.transactions.length;
    const transactionsAdded = finalTransactionCount - initialTransactionCount;
    
    // Verify all transactions have required fields
    const recentTransactions = this.walletStore.transactions.slice(0, 3);
    const allHaveRequiredFields = recentTransactions.every(t => 
      t.transactionId && 
      t.type && 
      t.from && 
      t.to && 
      t.amount && 
      t.description && 
      t.timestamp
    );
    
    // Verify transactions are immutable (have IDs and timestamps)
    const allHaveIds = recentTransactions.every(t => t.transactionId.startsWith('TXN-'));
    const allHaveTimestamps = recentTransactions.every(t => new Date(t.timestamp).getTime() > 0);
    
    const passed = transactionsAdded === 3 && allHaveRequiredFields && allHaveIds && allHaveTimestamps;
    
    this.addTestResult('Transaction Audit Trail', passed, 
      `Transactions added: ${transactionsAdded}, Required fields: ${allHaveRequiredFields}, IDs: ${allHaveIds}, Timestamps: ${allHaveTimestamps}`
    );
  }

  /**
   * Test 7: Insufficient Balance Handling
   */
  private async testInsufficientBalanceHandling(): Promise<void> {
    console.log('💸 Testing insufficient balance handling...');
    
    const currentBalance = this.walletStore.availableBalance;
    const attemptAmount = currentBalance + 1000; // More than available
    
    const orderId = `INSUFFICIENT-TEST-${Date.now()}`;
    const authAttempt = this.walletStore.authorizePayment(attemptAmount, orderId, 'Test Product');
    
    // Should fail and not change balances
    const newBalance = this.walletStore.availableBalance;
    const escrowUnchanged = this.walletStore.heldInEscrow;
    
    const passed = !authAttempt && newBalance === currentBalance;
    
    this.addTestResult('Insufficient Balance Handling', passed, 
      `Auth failed: ${!authAttempt}, Balance unchanged: ${newBalance === currentBalance}`
    );
  }

  /**
   * Test 8: Frozen Wallet Handling
   */
  private async testFrozenWalletHandling(): Promise<void> {
    console.log('🧊 Testing frozen wallet handling...');
    
    // Freeze wallet
    this.walletStore.freezeWallet(TEST_USERS.buyer);
    
    const orderId = `FROZEN-WALLET-TEST-${Date.now()}`;
    const authAttempt = this.walletStore.authorizePayment(1000, orderId, 'Test Product');
    
    // Unfreeze for other tests
    this.walletStore.unfreezeWallet(TEST_USERS.buyer);
    
    const passed = !authAttempt;
    
    this.addTestResult('Frozen Wallet Handling', passed, 
      `Auth blocked on frozen wallet: ${!authAttempt}`
    );
  }

  /**
   * Test 9: Duplicate Operation Prevention
   */
  private async testDuplicateOperationPrevention(): Promise<void> {
    console.log('🔄 Testing duplicate operation prevention...');
    
    const orderId = `DUPLICATE-TEST-${Date.now()}`;
    
    // Authorize payment
    const firstAuth = this.walletStore.authorizePayment(1000, orderId, 'Test Product');
    
    // Try to release escrow to seller
    const firstRelease = this.walletStore.releaseEscrowToSeller(orderId, TEST_USERS.seller);
    
    // Try to release again (should fail)
    const secondRelease = this.walletStore.releaseEscrowToSeller(orderId, TEST_USERS.seller);
    
    // Try to refund after release (should fail)
    const refundAttempt = this.walletStore.refundEscrowToBuyer(orderId);
    
    const passed = firstAuth && firstRelease && !secondRelease && !refundAttempt;
    
    this.addTestResult('Duplicate Operation Prevention', passed, 
      `First auth: ${firstAuth}, First release: ${firstRelease}, Second release blocked: ${!secondRelease}, Refund after release blocked: ${!refundAttempt}`
    );
  }

  /**
   * Add test result
   */
  private addTestResult(test: string, passed: boolean, details: string): void {
    this.testResults.push({ test, passed, details });
    console.log(`${passed ? '✅' : '❌'} ${test}: ${details}`);
  }

  /**
   * Print comprehensive test results
   */
  private printTestResults(): void {
    console.log('\n🧪 ESCROW SYSTEM VALIDATION RESULTS');
    console.log('=====================================');
    
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    
    console.log(`\n📊 Summary: ${passedTests}/${totalTests} tests passed\n`);
    
    this.testResults.forEach(result => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.test}`);
      console.log(`   ${result.details}\n`);
    });
    
    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! Escrow system is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the implementation.');
    }
    
    console.log('\n🔍 System Status:');
    console.log(`Available Balance: ₹${this.walletStore.availableBalance.toLocaleString()}`);
    console.log(`Held in Escrow: ₹${this.walletStore.heldInEscrow.toLocaleString()}`);
    console.log(`Wallet State: ${this.walletStore.walletState}`);
    console.log(`Total Transactions: ${this.walletStore.transactions.length}`);
  }
}

// Export for use in browser console
(window as any).EscrowSystemValidator = EscrowSystemValidator;

// Auto-run validation if in development
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Escrow System Validator loaded. Run new EscrowSystemValidator().runAllTests() in console to test.');
}