import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { firebaseAuthService } from '@/services/firebaseAuth';
import { Mail, Phone, MapPin, Shield, Package, Star, Clock, Bell, Lock, Edit3, CheckCircle2, AlertCircle, Smartphone, QrCode, Wallet, Eye, EyeOff, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link } from 'react-router-dom';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  walletBalance: number;
  walletStatus: 'active' | 'frozen' | 'limited';
  emailVerified: boolean;
  joinDate: Date;
}

const Profile = () => {
  const { toast } = useToast();
  const { user, updateProfile, changePassword, resetPassword, logout, loading } = useAuthStore();
  
  // Profile data state
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  
  // Password change state
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  
  // Email reset state
  const [emailResetModalOpen, setEmailResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      const firebaseProfile = await firebaseAuthService.getUserProfile();
      if (firebaseProfile) {
        const profileData: ProfileData = {
          name: firebaseProfile.name,
          email: firebaseProfile.email,
          phone: firebaseProfile.phone || '',
          role: firebaseProfile.role,
          walletBalance: firebaseProfile.walletBalance,
          walletStatus: firebaseProfile.walletStatus,
          emailVerified: firebaseProfile.emailVerified,
          joinDate: firebaseProfile.createdAt?.toDate() || new Date()
        };
        setProfileData(profileData);
        setFormData({ 
          name: profileData.name, 
          email: profileData.email, 
          phone: profileData.phone 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error Loading Profile", 
        description: "Could not load profile data.",
        variant: "destructive" 
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData) return;
    
    try {
      const updates: any = {};
      
      if (formData.name !== profileData.name) updates.name = formData.name;
      if (formData.phone !== profileData.phone) updates.phone = formData.phone;
      if (formData.email !== profileData.email) updates.email = formData.email;
      
      if (Object.keys(updates).length > 0) {
        await updateProfile(updates);
        
        if (updates.email) {
          toast({ 
            title: "Email Updated", 
            description: "Please check your new email to verify the change.",
            variant: "default"
          });
        } else {
          toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
        }
        
        // Reload profile data
        await loadProfileData();
      }
      
      setIsEditing(false);
    } catch (error: any) {
      toast({ 
        title: "Update Failed", 
        description: error.message || "Could not update profile.",
        variant: "destructive" 
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({ title: "Password Mismatch", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    
    if (passwordData.new.length < 6) {
      toast({ title: "Password Too Short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    try {
      await changePassword(passwordData.current, passwordData.new);
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
      setPasswordModalOpen(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast({ 
        title: "Password Change Failed", 
        description: error.message || "Could not change password.",
        variant: "destructive" 
      });
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({ title: "Missing Email", description: "Please enter your email address.", variant: "destructive" });
      return;
    }

    try {
      await resetPassword(resetEmail);
      toast({ 
        title: "Reset Email Sent", 
        description: "Check your email for password reset instructions.",
        variant: "default"
      });
      setEmailResetModalOpen(false);
      setResetEmail('');
    } catch (error: any) {
      toast({ 
        title: "Reset Failed", 
        description: error.message || "Could not send reset email.",
        variant: "destructive" 
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged Out", description: "You have been logged out successfully." });
    } catch (error: any) {
      toast({ 
        title: "Logout Failed", 
        description: error.message || "Could not log out.",
        variant: "destructive" 
      });
    }
  };

  if (!user || !profileData) {
    return (
      <Layout showTrustBanner={false}>
        <div className="container py-8 max-w-4xl">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: 'Wallet Balance', value: `$${profileData.walletBalance.toFixed(2)}`, icon: Wallet },
    { label: 'Account Status', value: profileData.walletStatus, icon: Shield },
    { label: 'Member Since', value: profileData.joinDate.toLocaleDateString(), icon: Clock },
    { label: 'Role', value: profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1), icon: Package }
  ];

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and security</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"} disabled={loading}>
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
            <Button onClick={handleLogout} variant="outline" disabled={loading}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start gap-6">
                <div className="h-20 w-20 rounded-full bg-gradient-trust flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-foreground">{profileData.name}</h2>
                    <Badge className={profileData.emailVerified ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>
                      {profileData.emailVerified ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Unverified
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    ReBoxed {profileData.role} since {profileData.joinDate.toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">
                        Status: {profileData.walletStatus.charAt(0).toUpperCase() + profileData.walletStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  {isEditing ? (
                    <div className="flex-1">
                      <Input 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className="bg-background"
                      />
                      {formData.email !== profileData.email && (
                        <p className="text-xs text-warning mt-1">Changing email will require re-verification</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-foreground">{profileData.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  {isEditing ? (
                    <Input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      placeholder="Enter phone number"
                      className="flex-1 bg-background"
                    />
                  ) : (
                    <span className="text-foreground">{profileData.phone || 'Not provided'}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  {isEditing ? (
                    <Input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="flex-1 bg-background"
                    />
                  ) : (
                    <span className="text-foreground">{profileData.name}</span>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="flex gap-3 mt-6">
                  <Button onClick={handleSaveProfile} className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false);
                    setFormData({ 
                      name: profileData.name, 
                      email: profileData.email, 
                      phone: profileData.phone 
                    });
                  }} className="flex-1">
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            {/* Security Settings */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Password</p>
                      <p className="text-sm text-muted-foreground">Change your account password</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setPasswordModalOpen(true)}>
                    Change Password
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Password Reset</p>
                      <p className="text-sm text-muted-foreground">Send password reset email</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEmailResetModalOpen(true)}>
                    Reset via Email
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Stats</h3>
              <div className="space-y-4">
                {stats.map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <stat.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`border rounded-xl p-6 ${profileData.emailVerified ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Verification Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  {profileData.emailVerified ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-warning" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  {profileData.phone ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-warning" />
                  )}
                </div>
              </div>
              {!profileData.emailVerified && (
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link to="/login">Complete Verification</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Current Password</Label>
              <div className="relative mt-1.5">
                <Input 
                  type={showPasswords.current ? 'text' : 'password'} 
                  value={passwordData.current} 
                  onChange={e => setPasswordData({...passwordData, current: e.target.value})} 
                  className="pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>New Password</Label>
              <div className="relative mt-1.5">
                <Input 
                  type={showPasswords.new ? 'text' : 'password'} 
                  value={passwordData.new} 
                  onChange={e => setPasswordData({...passwordData, new: e.target.value})} 
                  className="pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <div className="relative mt-1.5">
                <Input 
                  type={showPasswords.confirm ? 'text' : 'password'} 
                  value={passwordData.confirm} 
                  onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} 
                  className="pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={emailResetModalOpen} onOpenChange={setEmailResetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password via Email</DialogTitle>
            <DialogDescription>Enter your email to receive reset instructions</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Email Address</Label>
            <Input 
              type="email" 
              value={resetEmail} 
              onChange={e => setResetEmail(e.target.value)} 
              placeholder="you@example.com"
              className="mt-1.5"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEmailResetModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;