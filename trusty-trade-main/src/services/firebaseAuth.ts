import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  User as FirebaseUser,
  onAuthStateChanged,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/store/useAuthStore';

// Admin email whitelist
const ADMIN_EMAILS = ['admin@trustytrade.com'];

export interface FirebaseUserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'admin';
  walletBalance: number;
  walletStatus: 'active' | 'frozen' | 'limited';
  emailVerified: boolean;
  createdAt: any;
  updatedAt: any;
}

class FirebaseAuthService {
  // Convert Firebase user to app user format
  private async convertFirebaseUser(firebaseUser: FirebaseUser): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = userDoc.data() as FirebaseUserProfile;
      
      return {
        id: firebaseUser.uid,
        name: userData.name || firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: userData.role,
        avatar: firebaseUser.photoURL || undefined,
        joinDate: userData.createdAt?.toDate() || new Date(),
        verificationStatus: firebaseUser.emailVerified ? 'verified' : 'pending'
      };
    } catch (error) {
      console.error('Error converting Firebase user:', error);
      return null;
    }
  }

  // Create user profile in Firestore
  private async createUserProfile(firebaseUser: FirebaseUser, name: string): Promise<void> {
    const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');
    
    const userProfile: FirebaseUserProfile = {
      uid: firebaseUser.uid,
      name,
      email: firebaseUser.email || '',
      role: isAdmin ? 'admin' : 'buyer',
      walletBalance: 0,
      walletStatus: 'active',
      emailVerified: firebaseUser.emailVerified,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
  }

  // Register new user
  async register(name: string, email: string, password: string): Promise<User> {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(firebaseUser, { displayName: name });
      
      // Create user profile in Firestore
      await this.createUserProfile(firebaseUser, name);
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      
      const user = await this.convertFirebaseUser(firebaseUser);
      if (!user) throw new Error('Failed to create user profile');
      
      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Sign in user
  async login(email: string, password: string): Promise<User> {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      
      const user = await this.convertFirebaseUser(firebaseUser);
      if (!user) throw new Error('User profile not found');
      
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  // Sign out user
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Password reset failed');
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<Pick<User, 'name' | 'email'>> & { phone?: string }): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');

    try {
      const updateData: any = {
        updatedAt: serverTimestamp()
      };

      // Update name
      if (updates.name) {
        await updateProfile(currentUser, { displayName: updates.name });
        updateData.name = updates.name;
      }

      // Update phone
      if (updates.phone !== undefined) {
        updateData.phone = updates.phone;
      }

      // Update email (requires re-verification)
      if (updates.email && updates.email !== currentUser.email) {
        await updateEmail(currentUser, updates.email);
        await sendEmailVerification(currentUser);
        updateData.email = updates.email;
        updateData.emailVerified = false;
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', currentUser.uid), updateData);
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.message || 'Profile update failed');
    }
  }

  // Change password (requires current password for security)
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) throw new Error('No authenticated user');

    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, newPassword);
    } catch (error: any) {
      console.error('Password change error:', error);
      throw new Error(error.message || 'Password change failed');
    }
  }

  // Get user profile data from Firestore
  async getUserProfile(): Promise<FirebaseUserProfile | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      return userDoc.exists() ? userDoc.data() as FirebaseUserProfile : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Set up auth state listener
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Always reload user to get fresh emailVerified status
        await firebaseUser.reload();
        
        // Update Firestore with current emailVerified status
        try {
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            emailVerified: firebaseUser.emailVerified,
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Error updating emailVerified status:', error);
        }
        
        const user = await this.convertFirebaseUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Get current user
  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();
        if (firebaseUser) {
          // Always reload user to get fresh emailVerified status
          await firebaseUser.reload();
          const user = await this.convertFirebaseUser(firebaseUser);
          resolve(user);
        } else {
          resolve(null);
        }
      });
    });
  }

  // Check if email is verified (with reload)
  async isEmailVerified(): Promise<boolean> {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    
    // Always reload to get fresh status
    await currentUser.reload();
    return currentUser.emailVerified;
  }

  // Check email verification status and update store
  async checkAndUpdateEmailVerification(): Promise<boolean> {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    
    // Reload user to get fresh emailVerified status
    await currentUser.reload();
    
    // Update Firestore with current status
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        emailVerified: currentUser.emailVerified,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating emailVerified status:', error);
    }
    
    return currentUser.emailVerified;
  }

  // Resend verification email
  async resendVerificationEmail(): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    try {
      await sendEmailVerification(currentUser);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.message || 'Failed to resend verification email');
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();