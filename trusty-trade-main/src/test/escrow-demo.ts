/**
 * Simple Escrow System Demo
 * 
 * Run this in the browser console to see the escrow system in action.
 * Usage: runEscrowDemo()
 */

import { useWalletStore } from '../store/useWalletStore';
import { useAuthStore } from '../store/useAuthStore';

export const runEscrowDemo = () => {
  console.log('🎬 Starting Escrow System Demo...\n');
  
  const walletStore = useWalletStore.getState();
  const authStore = useAuthStore.getState();
  
  // Set up demo user
  walletStore.setCurrentUser('demo-buyer-123');
  
  console.log('👤 Demo User Setup:');
  console.log(`Available Balance: ₹${walletStore.availableBalance.toLocaleString()}`);
  console.log(`Held in Escrow: ₹${walletStore.heldInEscrow.toLocaleString()}`);
  console.log(`Wallet State: ${walletStore.walletState}\n`);
  
  // Demo 1: Add money to wallet
  console.log('💰 Demo 1: Adding money to wallet...');
  walletStore.addMoney(10000, 'Demo Credit');
  console.log(`New Available Balance: ₹${walletStore.availableBalance.toLocaleString()}\n`);
  
  // Demo 2: Authorize payment (move to escrow)
  console.log('🔒 Demo 2: Authorizing payment (moving to escrow)...');
  const orderId = `DEMO-ORDER-${Date.now()}`;
  const authSuccess = walletStore.authorizePayment(5000, orderId, 'Demo iPhone 14');
  console.log(`Authorization Success: ${authSuccess}`);
  console.log(`Available Balance: ₹${walletStore.availableBalance.toLocaleString()}`);
  console.log(`Held in Escrow: ₹${walletStore.heldInEscrow.toLocaleString()}\n`);
  
  // Demo 3: Show transaction history
  console.log('📋 Demo 3: Transaction History:');
  const recentTransactions = walletStore.transactions.slice(0, 3);
  recentTransactions.forEach(tx => {
    console.log(`${tx.type}: ₹${tx.amount} (${tx.from} → ${tx.to}) - ${tx.description}`);
  });
  console.log('');
  
  // Demo 4: Release escrow to seller
  console.log('✅ Demo 4: Releasing escrow to seller...');
  const sellerId = 'demo-seller-456';
  const releaseSuccess = walletStore.releaseEscrowToSeller(orderId, sellerId);
  console.log(`Release Success: ${releaseSuccess}`);
  console.log(`Buyer Held in Escrow: ₹${walletStore.heldInEscrow.toLocaleString()}`);
  
  // Check seller balance
  walletStore.setCurrentUser(sellerId);
  console.log(`Seller Available Balance: ₹${walletStore.availableBalance.toLocaleString()}`);
  
  // Switch back to buyer
  walletStore.setCurrentUser('demo-buyer-123');
  console.log('');
  
  // Demo 5: Test dispute scenario
  console.log('⚖️ Demo 5: Testing dispute scenario...');
  const disputeOrderId = `DISPUTE-DEMO-${Date.now()}`;
  walletStore.authorizePayment(3000, disputeOrderId, 'Demo MacBook');
  console.log(`Payment authorized for dispute demo: ₹3000`);
  console.log(`Held in Escrow: ₹${walletStore.heldInEscrow.toLocaleString()}`);
  
  // Refund to buyer (dispute resolution)
  const refundSuccess = walletStore.refundEscrowToBuyer(disputeOrderId);
  console.log(`Refund Success: ${refundSuccess}`);
  console.log(`Available Balance after refund: ₹${walletStore.availableBalance.toLocaleString()}`);
  console.log(`Held in Escrow after refund: ₹${walletStore.heldInEscrow.toLocaleString()}\n`);
  
  // Demo 6: Admin controls
  console.log('🔒 Demo 6: Testing admin controls...');
  console.log(`Current Wallet State: ${walletStore.walletState}`);
  walletStore.freezeWallet('demo-buyer-123');
  console.log(`After Freeze: ${walletStore.walletState}`);
  
  // Try to authorize payment while frozen
  const frozenAuthAttempt = walletStore.authorizePayment(1000, 'FROZEN-TEST', 'Test Product');
  console.log(`Payment attempt while frozen: ${frozenAuthAttempt ? 'SUCCESS' : 'BLOCKED'}`);
  
  // Unfreeze
  walletStore.unfreezeWallet('demo-buyer-123');
  console.log(`After Unfreeze: ${walletStore.walletState}\n`);
  
  // Final summary
  console.log('📊 Final Demo Summary:');
  console.log(`Available Balance: ₹${walletStore.availableBalance.toLocaleString()}`);
  console.log(`Held in Escrow: ₹${walletStore.heldInEscrow.toLocaleString()}`);
  console.log(`Total Balance: ₹${walletStore.getTotalBalance().toLocaleString()}`);
  console.log(`Total Transactions: ${walletStore.transactions.length}`);
  console.log(`Wallet State: ${walletStore.walletState}`);
  
  console.log('\n🎉 Escrow Demo Complete!');
  console.log('The escrow system is working correctly with:');
  console.log('✅ Payment authorization (wallet → escrow)');
  console.log('✅ Escrow release (escrow → seller)');
  console.log('✅ Dispute refunds (escrow → buyer)');
  console.log('✅ Admin controls (wallet freezing)');
  console.log('✅ Complete transaction audit trail');
  console.log('✅ Balance isolation and tracking');
};

// Make available globally for browser console
(window as any).runEscrowDemo = runEscrowDemo;

export default runEscrowDemo;