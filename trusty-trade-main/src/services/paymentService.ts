/**
 * Payment Service - Firebase-ready modular payment handling
 * Wallet-only payments, no card support
 */

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface WalletPaymentData {
  amount: number;
  orderId: string;
  productName: string;
  buyerId: string;
}

// Firebase-ready payment service
class PaymentService {
  private static instance: PaymentService;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Process wallet payment
  async processWalletPayment(
    data: WalletPaymentData,
    walletBalance: number,
    debitFn: (amount: number, orderId: string, productName: string) => boolean
  ): Promise<PaymentResult> {
    // Validate sufficient balance
    if (walletBalance < data.amount) {
      return {
        success: false,
        error: `Insufficient wallet balance. You need ₹${data.amount.toLocaleString()} but have ₹${walletBalance.toLocaleString()}`,
      };
    }

    // Process debit
    const success = debitFn(data.amount, data.orderId, data.productName);

    if (!success) {
      return {
        success: false,
        error: 'Payment failed. Please try again.',
      };
    }

    return {
      success: true,
      transactionId: `TXN-${Date.now()}`,
    };
  }

  // Validate payment amount
  validateAmount(amount: number): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Invalid payment amount' };
    }
    if (amount > 10000000) {
      return { valid: false, error: 'Amount exceeds maximum limit' };
    }
    return { valid: true };
  }

  // Calculate service fee (5%)
  calculateServiceFee(amount: number): number {
    return Math.round(amount * 0.05);
  }

  // Calculate total with fee
  calculateTotal(amount: number): number {
    return amount + this.calculateServiceFee(amount);
  }
}

export const paymentService = PaymentService.getInstance();
