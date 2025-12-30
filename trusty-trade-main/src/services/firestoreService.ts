import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Product, Order, Dispute } from '@/data/products';

// Firestore document interfaces
export interface FirestoreProduct {
  productId: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  images: string[]; // Storage URLs
  specifications: Record<string, string>;
  brand: string;
  model: string;
  location?: string;
  status: 'listed' | 'sold' | 'returned';
  createdAt: any;
  updatedAt: any;
}

export interface FirestoreOrder {
  orderId: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  amount: number;
  escrowStatus: 'held' | 'released' | 'refunded' | 'disputed';
  verificationStatus: 'pending' | 'verified' | 'disputed';
  orderStatus: 'paid' | 'shipped' | 'delivered' | 'completed' | 'returned';
  createdAt: any;
  shippedAt?: any;
  deliveredAt?: any;
  verifiedAt?: any;
  verificationDeadline?: any;
  trackingNumber?: string;
  disputeId?: string;
}

export interface FirestoreDispute {
  disputeId: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  reason: string;
  description: string;
  imageEvidence: string[]; // Storage URLs
  status: 'open' | 'reviewing' | 'approved' | 'rejected';
  adminDecision?: string;
  adminNotes?: string;
  createdAt: any;
  resolvedAt?: any;
}

export interface FirestoreWalletTransaction {
  transactionId: string;
  userId: string;
  orderId?: string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  timestamp: any;
}

export interface FirestoreNotification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'dispute' | 'wallet' | 'system';
  relatedOrderId?: string;
  relatedProductId?: string;
  read: boolean;
  createdAt: any;
}

class FirestoreService {
  // Products
  async createProduct(productData: Omit<FirestoreProduct, 'productId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update with the generated ID
      await updateDoc(docRef, { productId: docRef.id });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async getProducts(filters?: { category?: string; status?: string }): Promise<FirestoreProduct[]> {
    try {
      let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as FirestoreProduct);
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  async getProduct(productId: string): Promise<FirestoreProduct | null> {
    try {
      const docSnap = await getDoc(doc(db, 'products', productId));
      return docSnap.exists() ? docSnap.data() as FirestoreProduct : null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, updates: Partial<FirestoreProduct>): Promise<void> {
    try {
      await updateDoc(doc(db, 'products', productId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Orders
  async createOrder(orderData: Omit<FirestoreOrder, 'orderId' | 'createdAt'>): Promise<string> {
    try {
      const batch = writeBatch(db);
      
      // Create order
      const orderRef = doc(collection(db, 'orders'));
      batch.set(orderRef, {
        ...orderData,
        orderId: orderRef.id,
        createdAt: serverTimestamp()
      });

      // Create wallet transaction (debit buyer)
      const transactionRef = doc(collection(db, 'walletTransactions'));
      batch.set(transactionRef, {
        transactionId: transactionRef.id,
        userId: orderData.buyerId,
        orderId: orderRef.id,
        amount: -orderData.amount,
        type: 'debit',
        reason: 'Order payment',
        timestamp: serverTimestamp()
      });

      // Update product status to sold
      batch.update(doc(db, 'products', orderData.productId), {
        status: 'sold',
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      return orderRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrders(userId: string, role: 'buyer' | 'seller'): Promise<FirestoreOrder[]> {
    try {
      const field = role === 'buyer' ? 'buyerId' : 'sellerId';
      const q = query(
        collection(db, 'orders'),
        where(field, '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as FirestoreOrder);
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }

  async updateOrder(orderId: string, updates: Partial<FirestoreOrder>): Promise<void> {
    try {
      await updateDoc(doc(db, 'orders', orderId), updates);
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Disputes
  async createDispute(disputeData: Omit<FirestoreDispute, 'disputeId' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'disputes'), {
        ...disputeData,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(docRef, { disputeId: docRef.id });
      
      // Update related order
      await updateDoc(doc(db, 'orders', disputeData.orderId), {
        disputeId: docRef.id,
        verificationStatus: 'disputed',
        escrowStatus: 'disputed'
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating dispute:', error);
      throw error;
    }
  }

  async getDisputes(adminOnly: boolean = false): Promise<FirestoreDispute[]> {
    try {
      let q = query(collection(db, 'disputes'), orderBy('createdAt', 'desc'));
      
      if (!adminOnly && auth.currentUser) {
        q = query(q, where('buyerId', '==', auth.currentUser.uid));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as FirestoreDispute);
    } catch (error) {
      console.error('Error getting disputes:', error);
      throw error;
    }
  }

  async resolveDispute(disputeId: string, decision: 'approved' | 'rejected', adminNotes?: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Update dispute
      batch.update(doc(db, 'disputes', disputeId), {
        status: decision,
        adminDecision: decision,
        adminNotes,
        resolvedAt: serverTimestamp()
      });

      // Get dispute to find related order
      const disputeDoc = await getDoc(doc(db, 'disputes', disputeId));
      if (disputeDoc.exists()) {
        const dispute = disputeDoc.data() as FirestoreDispute;
        
        // Update order based on decision
        if (decision === 'approved') {
          batch.update(doc(db, 'orders', dispute.orderId), {
            escrowStatus: 'refunded',
            verificationStatus: 'disputed'
          });
        } else {
          batch.update(doc(db, 'orders', dispute.orderId), {
            escrowStatus: 'released',
            verificationStatus: 'verified'
          });
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw error;
    }
  }

  // Wallet Transactions
  async getWalletBalance(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'walletTransactions'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      let balance = 0;
      
      snapshot.docs.forEach(doc => {
        const transaction = doc.data() as FirestoreWalletTransaction;
        balance += transaction.amount;
      });

      return balance;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  async getWalletTransactions(userId: string): Promise<FirestoreWalletTransaction[]> {
    try {
      const q = query(
        collection(db, 'walletTransactions'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as FirestoreWalletTransaction);
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      throw error;
    }
  }

  // Notifications
  async createNotification(notificationData: Omit<FirestoreNotification, 'notificationId' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        createdAt: serverTimestamp()
      });
      
      await updateDoc(docRef, { notificationId: docRef.id });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getNotifications(userId: string): Promise<FirestoreNotification[]> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as FirestoreNotification);
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Real-time listeners
  onProductsChange(callback: (products: FirestoreProduct[]) => void): () => void {
    const q = query(
      collection(db, 'products'),
      where('status', '==', 'listed'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => doc.data() as FirestoreProduct);
      callback(products);
    });
  }

  onNotificationsChange(userId: string, callback: (notifications: FirestoreNotification[]) => void): () => void {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => doc.data() as FirestoreNotification);
      callback(notifications);
    });
  }
}

export const firestoreService = new FirestoreService();