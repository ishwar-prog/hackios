# Design Document

## Overview

This design addresses the critical payment transaction integrity issue where payment authorization succeeds but order creation fails, leaving buyer funds stuck in escrow. The solution implements atomic transactions with automatic rollback, comprehensive error handling, and robust retry mechanisms to ensure payment and order creation always happen together or not at all.

## Architecture

### Current Problem Flow
```
1. User clicks "Pay" 
2. ✅ Payment authorized (money moved to escrow)
3. ❌ Firestore order creation fails
4. 💸 Money stuck in escrow, no order exists
5. 😞 User sees error but money is gone
```

### New Atomic Transaction Flow
```
1. User clicks "Pay"
2. 🔍 Pre-validation checks (connectivity, product availability)
3. 🔄 Attempt order creation FIRST (without payment)
4. ✅ If order creation succeeds → Authorize payment
5. ❌ If order creation fails → Show error, no payment
6. 🔄 If payment fails after order creation → Rollback order
```

## Components and Interfaces

### 1. Transaction Manager
**Purpose**: Orchestrates atomic payment transactions with rollback capability

```typescript
interface TransactionManager {
  // Main atomic transaction method
  executePaymentTransaction(request: PaymentTransactionRequest): Promise<PaymentTransactionResult>
  
  // Rollback methods
  rollbackPaymentAuthorization(transactionId: string, reason: string): Promise<void>
  rollbackOrderCreation(orderId: string, reason: string): Promise<void>
  
  // Validation methods
  validatePrePaymentConditions(request: PaymentTransactionRequest): Promise<ValidationResult>
  validatePostPaymentState(orderId: string, transactionId: string): Promise<ValidationResult>
}

interface PaymentTransactionRequest {
  productId: string
  buyerId: string
  amount: number
  productName: string
}

interface PaymentTransactionResult {
  success: boolean
  orderId?: string
  transactionId?: string
  error?: TransactionError
  rollbackPerformed?: boolean
}
```

### 2. Enhanced Order Store
**Purpose**: Modified order creation with transaction support

```typescript
interface EnhancedOrderStore {
  // New atomic method replacing createOrderWithEscrow
  createOrderAtomic(request: PaymentTransactionRequest): Promise<EnhancedOrder>
  
  // Rollback support
  rollbackOrder(orderId: string, reason: string): Promise<void>
  
  // Validation
  validateOrderCreation(request: PaymentTransactionRequest): Promise<ValidationResult>
}
```

### 3. Enhanced Wallet Store
**Purpose**: Payment authorization with rollback support

```typescript
interface EnhancedWalletStore {
  // Modified authorization with rollback tracking
  authorizePaymentWithRollback(amount: number, orderId: string, productName: string): Promise<AuthorizationResult>
  
  // Rollback method
  rollbackAuthorization(transactionId: string, reason: string): Promise<void>
  
  // Validation
  validatePaymentCapability(amount: number): Promise<ValidationResult>
}

interface AuthorizationResult {
  success: boolean
  transactionId?: string
  error?: string
}
```

### 4. Retry Manager
**Purpose**: Handles retry logic with exponential backoff

```typescript
interface RetryManager {
  executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions
  ): Promise<T>
}

interface RetryOptions {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableErrors: string[]
}
```

### 5. Error Handler
**Purpose**: Centralized error handling and user communication

```typescript
interface ErrorHandler {
  handlePaymentError(error: Error, context: PaymentContext): PaymentErrorResponse
  formatUserMessage(error: Error): string
  logTransactionError(error: Error, context: PaymentContext): void
}

interface PaymentErrorResponse {
  userMessage: string
  shouldRetry: boolean
  rollbackRequired: boolean
  logDetails: ErrorLogDetails
}
```

## Data Models

### Transaction Log Entry
```typescript
interface TransactionLogEntry {
  transactionId: string
  orderId?: string
  type: 'PAYMENT_AUTH' | 'PAYMENT_ROLLBACK' | 'ORDER_CREATE' | 'ORDER_ROLLBACK'
  status: 'SUCCESS' | 'FAILED' | 'ROLLED_BACK'
  amount?: number
  reason?: string
  originalTransactionId?: string // For rollbacks
  timestamp: string
  metadata: {
    productId?: string
    buyerId?: string
    errorDetails?: string
    retryAttempt?: number
  }
}
```

### Payment Transaction State
```typescript
interface PaymentTransactionState {
  transactionId: string
  orderId?: string
  paymentAuthorized: boolean
  orderCreated: boolean
  completed: boolean
  rolledBack: boolean
  error?: string
  retryCount: number
  lastAttempt: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property-Based Testing Analysis

Let me analyze the acceptance criteria to determine testable properties:

**Acceptance Criteria Testing Prework:**

1.1 WHEN a buyer initiates payment, THE Payment_System SHALL NOT authorize payment until order creation is confirmed successful
  Thoughts: This is about the order of operations - we can test that payment authorization only happens after successful order creation validation
  Testable: yes - property

1.2 WHEN order creation fails after payment authorization, THE Payment_System SHALL automatically rollback the payment authorization  
  Thoughts: This is about automatic rollback behavior that should work for any order creation failure
  Testable: yes - property

1.3 WHEN payment rollback occurs, THE Escrow_System SHALL return funds to buyer's available balance
  Thoughts: This is about balance consistency - rollback should restore the exact amount that was authorized
  Testable: yes - property

1.4 WHEN payment rollback occurs, THE Transaction_System SHALL log the rollback transaction with clear description
  Thoughts: This is about audit trail completeness - every rollback should create a transaction record
  Testable: yes - property

1.5 THE Payment_System SHALL ensure payment authorization and order creation happen atomically
  Thoughts: This is about atomicity - either both succeed or both fail, never partial success
  Testable: yes - property

2.1 WHEN payment authorization succeeds but order creation fails, THE System SHALL display error message explaining the failure
  Thoughts: This is about UI behavior for a specific error condition
  Testable: yes - example

2.2 WHEN automatic rollback occurs, THE System SHALL notify buyer that funds have been returned to their wallet
  Thoughts: This is about user notification for rollback events
  Testable: yes - example

5.1 WHEN order creation fails due to temporary network issues, THE System SHALL retry the operation up to 3 times
  Thoughts: This is about retry behavior - we can test that exactly 3 attempts are made for retryable errors
  Testable: yes - property

5.2 WHEN retries are exhausted, THE System SHALL rollback payment authorization and notify buyer
  Thoughts: This is about what happens after max retries - should always rollback and notify
  Testable: yes - property

**Property Reflection:**
After reviewing all properties, I can combine some related ones:
- Properties 1.2, 1.3, and 1.4 can be combined into a comprehensive rollback property
- Properties 5.1 and 5.2 can be combined into a retry behavior property
- Property 1.5 (atomicity) is the core property that encompasses the overall behavior

### Core Correctness Properties

**Property 1: Atomic Transaction Guarantee**
*For any* payment transaction request, either both payment authorization and order creation succeed, or neither succeeds (with any partial success being rolled back)
**Validates: Requirements 1.1, 1.5**

**Property 2: Automatic Rollback Completeness**  
*For any* failed order creation after successful payment authorization, the system should automatically rollback the payment, restore buyer balance, and log the rollback transaction
**Validates: Requirements 1.2, 1.3, 1.4**

**Property 3: Retry Behavior Consistency**
*For any* retryable error during order creation, the system should attempt exactly 3 retries with exponential backoff, and rollback payment if all retries fail
**Validates: Requirements 5.1, 5.2**

**Property 4: Balance Conservation**
*For any* payment transaction (successful or rolled back), the total money in the system (available + escrow) should remain constant
**Validates: Requirements 1.3, 4.3**

**Property 5: Audit Trail Completeness**
*For any* payment operation (authorization, rollback, retry), a corresponding transaction log entry should be created with all required fields
**Validates: Requirements 3.1, 3.2, 3.3**

**Property 6: State Consistency Validation**
*For any* completed payment transaction, the system state should be consistent (order exists if and only if payment is authorized)
**Validates: Requirements 4.1, 4.3, 4.4**

## Error Handling

### Error Classification
```typescript
enum PaymentErrorType {
  // Retryable errors
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  FIRESTORE_UNAVAILABLE = 'FIRESTORE_UNAVAILABLE', 
  TEMPORARY_SERVICE_ERROR = 'TEMPORARY_SERVICE_ERROR',
  
  // Non-retryable errors
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  WALLET_FROZEN = 'WALLET_FROZEN',
  PRODUCT_UNAVAILABLE = 'PRODUCT_UNAVAILABLE',
  INVALID_REQUEST = 'INVALID_REQUEST',
  
  // System errors
  FIRESTORE_DOCUMENT_ERROR = 'FIRESTORE_DOCUMENT_ERROR',
  PAYMENT_SYSTEM_ERROR = 'PAYMENT_SYSTEM_ERROR',
  ROLLBACK_FAILED = 'ROLLBACK_FAILED'
}
```

### Error Recovery Strategies
1. **Retryable Errors**: Exponential backoff retry up to 3 attempts
2. **Non-retryable Errors**: Immediate failure with clear user message
3. **System Errors**: Rollback + admin alert + user notification
4. **Rollback Failures**: Critical alert + manual intervention required

### User Error Messages
```typescript
const ERROR_MESSAGES = {
  [PaymentErrorType.NETWORK_TIMEOUT]: "Connection issue detected. Please try again in a moment.",
  [PaymentErrorType.INSUFFICIENT_FUNDS]: "Insufficient wallet balance. Please add funds and try again.",
  [PaymentErrorType.PRODUCT_UNAVAILABLE]: "This product is no longer available for purchase.",
  [PaymentErrorType.FIRESTORE_DOCUMENT_ERROR]: "Unable to process your order. Your payment has been refunded to your wallet.",
  [PaymentErrorType.ROLLBACK_FAILED]: "Payment processing error. Please contact support immediately."
}
```

## Testing Strategy

### Unit Testing Approach
- **Specific Examples**: Test known error scenarios (Firestore failures, network timeouts)
- **Edge Cases**: Test boundary conditions (exactly 3 retries, rollback timing)
- **Error Conditions**: Test all error types and recovery paths
- **Integration Points**: Test Firestore integration, wallet integration

### Property-Based Testing Approach
- **Universal Properties**: Test atomicity, rollback completeness, balance conservation
- **Comprehensive Input Coverage**: Generate random transaction requests, error conditions
- **State Consistency**: Verify system state remains consistent across all operations
- **Audit Trail Validation**: Ensure all operations are properly logged

### Property Test Configuration
- **Minimum 100 iterations** per property test (due to randomization)
- **Test Framework**: Use fast-check for TypeScript property-based testing
- **Tag Format**: **Feature: payment-transaction-integrity, Property {number}: {property_text}**

### Dual Testing Benefits
- **Unit tests** catch specific bugs and validate error handling
- **Property tests** verify universal correctness across all inputs
- **Together** they provide comprehensive coverage of both known issues and edge cases

## Implementation Strategy

### Phase 1: Transaction Manager Implementation
1. Create TransactionManager class with atomic transaction logic
2. Implement pre-validation checks
3. Add rollback mechanisms
4. Create comprehensive error handling

### Phase 2: Store Modifications  
1. Modify useOrderStore to support atomic operations
2. Enhance useWalletStore with rollback capability
3. Add transaction state tracking
4. Implement retry logic

### Phase 3: UI Integration
1. Update Checkout component to use new atomic transaction flow
2. Enhance error messaging and user feedback
3. Add loading states for retry operations
4. Implement rollback notifications

### Phase 4: Testing and Validation
1. Implement property-based tests for all correctness properties
2. Add unit tests for error scenarios
3. Test Firestore failure simulation
4. Validate audit trail completeness

## Monitoring and Observability

### Key Metrics
- **Transaction Success Rate**: Percentage of successful atomic transactions
- **Rollback Rate**: Percentage of transactions requiring rollback
- **Retry Success Rate**: Percentage of retries that eventually succeed
- **Error Distribution**: Breakdown of error types and frequencies

### Alerting
- **Critical**: Rollback failures (immediate admin notification)
- **Warning**: High rollback rate (>5% in 1 hour)
- **Info**: Firestore connectivity issues

### Logging
- **Transaction Logs**: All payment operations with full context
- **Error Logs**: Detailed error information for debugging
- **Performance Logs**: Transaction timing and retry metrics
- **Audit Logs**: Immutable record of all financial operations

This design ensures that the payment transaction integrity issue is completely resolved while maintaining the existing escrow system functionality and providing robust error handling and recovery mechanisms.