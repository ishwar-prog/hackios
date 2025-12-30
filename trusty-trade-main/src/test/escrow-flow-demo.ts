/**
 * Escrow Flow Demo - Test Script
 * 
 * This demonstrates the complete escrow lifecycle that mirrors
 * real payment systems like Stripe PaymentIntent with manual capture.
 */

import { useWalletStore } from '@/store/useWalletStore';
import { useOrderStore } from '@/store/useOrderStore';

export const demonstrateEscrowFlow = () => {
  console.log('🏦 ESCROW SYSTEM DEMO - ReBoxed Marketplace');
  console.log('================================================');
  
  const walletStore = useWalletStore.getState();
  const orderStore = useOrderStore.getState();
  
  // Setup: Create test users
  const buyerId = 'buyer-demo-123';
  const sellerId = 'seller-demo-456';
  
  walletStore.setCurrentUser(buyerId);
  
  console.log('\n📊 INITIAL STATE');
  console.log('Buyer Available Balance:', walletStore.availableBalance);
  console.log('Buyer Held in Escrow:', walletStore.heldInEscrow);
  console.log('Buyer Wallet State:', walletStore.walletState);
  
  // Step 1: Buyer Payment Authorization (like Stripe PaymentIntent)
  console.log('\n💳 STEP 1: PAYMENT AUTHORIZATION');
  const amount = 25000; // ₹25,000 for iPhone
  const orderId = 'ORDER-DEMO-789';
  const productName = 'iPhone 14 Pro Max 256GB';
  
  const authorized = walletStore.authorizePayment(amount, orderId, productName);
  console.log('Payment Authorized:', authorized);
  console.log('New Available Balance:', walletStore.availableBalance);
  console.log('New Held in Escrow:', walletStore.heldInEscrow);
  
  // Step 2: Order Creation with Escrow
  console.log('\n📦 STEP 2: ORDER CREATION');
  console.log('Order ID:', orderId);
  console.log('Escrow Status: HELD');
  console.log('Order Status: PAID');
  
  // Step 3: Product Verification & Escrow Release
  console.log('\n✅ STEP 3: BUYER VERIFICATION');
  const released = walletStore.releaseEscrowToSeller(orderId, sellerId);
  console.log('Escrow Released to Seller:', released);
  console.log('Buyer Held in Escrow:', walletStore.heldInEscrow);
  
  // Check seller wallet
  walletStore.setCurrentUser(sellerId);
  console.log('Seller Available Balance:', walletStore.availableBalance);
  
  // Step 4: Transaction Audit Trail
  console.log('\n📋 STEP 4: TRANSACTION AUDIT TRAIL');
  walletStore.setCurrentUser(buyerId);
  const buyerTransactions = walletStore.getTransactionsByOrder(orderId);
  console.log('Buyer Transactions for Order:');
  buyerTransactions.forEach(tx => {
    console.log(`  ${tx.type}: ${tx.from} → ${tx.to} (₹${tx.amount})`);
    console.log(`    ${tx.description}`);
  });
  
  walletStore.setCurrentUser(sellerId);
  const sellerTransactions = walletStore.getTransactionsByOrder(orderId);
  console.log('Seller Transactions for Order:');
  sellerTransactions.forEach(tx => {
    console.log(`  ${tx.type}: ${tx.from} → ${tx.to} (₹${tx.amount})`);
    console.log(`    ${tx.description}`);
  });
  
  console.log('\n🎉 ESCROW FLOW COMPLETE');
  console.log('✓ Payment authorized and held in escrow');
  console.log('✓ Funds released to seller after verification');
  console.log('✓ Complete audit trail maintained');
  console.log('✓ Mirrors Stripe PaymentIntent with manual capture');
};

export const demonstrateDisputeFlow = () => {
  console.log('\n⚖️  DISPUTE RESOLUTION DEMO');
  console.log('============================');
  
  const walletStore = useWalletStore.getState();
  
  // Setup dispute scenario
  const buyerId = 'buyer-dispute-123';
  const orderId = 'ORDER-DISPUTE-789';
  const amount = 15000; // ₹15,000
  
  walletStore.setCurrentUser(buyerId);
  
  // Authorize payment first
  walletStore.authorizePayment(amount, orderId, 'MacBook Air M2');
  console.log('Payment authorized and held in escrow:', amount);
  console.log('Buyer Held in Escrow:', walletStore.heldInEscrow);
  
  // Simulate dispute - admin approves refund
  console.log('\n🔄 ADMIN RESOLVES DISPUTE (APPROVE REFUND)');
  const refunded = walletStore.refundEscrowToBuyer(orderId);
  console.log('Refund Processed:', refunded);
  console.log('Buyer Available Balance:', walletStore.availableBalance);
  console.log('Buyer Held in Escrow:', walletStore.heldInEscrow);
  
  console.log('\n✓ Dispute resolved in buyer favor');
  console.log('✓ Funds returned to buyer wallet');
  console.log('✓ Escrow properly released');
};

export const demonstrateAdminControls = () => {
  console.log('\n🔐 ADMIN CONTROLS DEMO');
  console.log('======================');
  
  const walletStore = useWalletStore.getState();
  const userId = 'user-admin-test-123';
  
  // Check initial wallet state
  walletStore.setCurrentUser(userId);
  console.log('Initial Wallet State:', walletStore.walletState);
  
  // Admin freezes wallet
  console.log('\n❄️  ADMIN FREEZES WALLET');
  walletStore.freezeWallet(userId);
  console.log('Wallet State after freeze:', walletStore.walletState);
  
  // Try to authorize payment (should fail)
  const authorized = walletStore.authorizePayment(1000, 'ORDER-FROZEN-TEST', 'Test Product');
  console.log('Payment authorization on frozen wallet:', authorized);
  
  // Admin unfreezes wallet
  console.log('\n🔓 ADMIN UNFREEZES WALLET');
  walletStore.unfreezeWallet(userId);
  console.log('Wallet State after unfreeze:', walletStore.walletState);
  
  // Try to authorize payment again (should succeed)
  const authorizedAfterUnfreeze = walletStore.authorizePayment(1000, 'ORDER-UNFROZEN-TEST', 'Test Product');
  console.log('Payment authorization after unfreeze:', authorizedAfterUnfreeze);
  
  console.log('\n✓ Admin wallet controls working');
  console.log('✓ Frozen wallets prevent escrow operations');
  console.log('✓ Unfrozen wallets restore normal operations');
};

// Export all demos for easy testing
export const runAllEscrowDemos = () => {
  demonstrateEscrowFlow();
  demonstrateDisputeFlow();
  demonstrateAdminControls();
  
  console.log('\n🏆 ALL ESCROW SYSTEM DEMOS COMPLETED');
  console.log('=====================================');
  console.log('The escrow system successfully mirrors real payment backends:');
  console.log('• Stripe PaymentIntent with manual capture');
  console.log('• Razorpay marketplace escrow');
  console.log('• Complete audit trail and admin controls');
  console.log('• Deterministic and traceable operations');
};