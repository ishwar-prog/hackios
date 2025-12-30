import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { useSecurityStore, type TwoFactorMethod } from '@/store/useSecurityStore';
import { Mail, Phone, MapPin, Shield, Package, Star, Clock, Bell, Lock, Edit3, CheckCircle2, AlertCircle, Smartphone, QrCode, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Link } from 'react-router-dom';

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: 'John Smith', email: 'john.smith@email.com', phone: '+1 (555) 123-4567', address: '123 Main St, San Francisco, CA 94102' });

  const { isTwoFactorEnabled, twoFactorMethod, enableTwoFactor, disableTwoFactor, isEmailNotificationsEnabled, setEmailNotifications } = useSecurityStore();
  const [twoFAModalOpen, setTwoFAModalOpen] = useState(false);
  const [twoFASetupStep, setTwoFASetupStep] = useState<'select' | 'verify'>('select');
  const [selectedTwoFAMethod, setSelectedTwoFAMethod] = useState<TwoFactorMethod | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [disableTwoFAConfirm, setDisableTwoFAConfirm] = useState(false);
  const [emailNotifModalOpen, setEmailNotifModalOpen] = useState(false);
  const [disableNotifConfirm, setDisableNotifConfirm] = useState(false);

  const handleSave = () => { setIsEditing(false); toast({ title: "Profile Updated" }); };

  const handleEnable2FA = async () => {
    if (!otpInput || otpInput.length !== 6) { toast({ title: "Invalid OTP", variant: "destructive" }); return; }
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 2000));
    if (selectedTwoFAMethod) { enableTwoFactor(selectedTwoFAMethod); setTwoFAModalOpen(false); setTwoFASetupStep('select'); setSelectedTwoFAMethod(null); setOtpInput(''); toast({ title: "2FA Enabled" }); }
    setIsVerifying(false);
  };

  const handleDisable2FA = () => { disableTwoFactor(); setDisableTwoFAConfirm(false); toast({ title: "2FA Disabled" }); };
  const handleEnableNotif = () => { setEmailNotifications(true); setEmailNotifModalOpen(false); toast({ title: "Notifications Enabled" }); };
  const handleDisableNotif = () => { setEmailNotifications(false); setDisableNotifConfirm(false); toast({ title: "Notifications Disabled" }); };

  const stats = [{ label: 'Orders Completed', value: '12', icon: Package }, { label: 'Average Rating', value: '4.9', icon: Star }, { label: 'Member Since', value: 'Jan 2023', icon: Clock }, { label: 'Escrow Protected', value: '$8,247', icon: Shield }];


  return (
    <Layout showTrustBanner={false}>
      <div className="container py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1><p className="text-muted-foreground">Manage your account settings</p></div>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}><Edit3 className="h-4 w-4 mr-2" />{isEditing ? 'Cancel' : 'Edit Profile'}</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start gap-6">
                <div className="h-20 w-20 rounded-full bg-gradient-trust flex items-center justify-center text-primary-foreground text-2xl font-bold">JS</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2"><h2 className="text-2xl font-bold text-foreground">{formData.name}</h2><Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="h-3 w-3 mr-1" />Verified</Badge></div>
                  <p className="text-muted-foreground mb-4">Trusted SafeTrade buyer since January 2023</p>
                  <div className="flex items-center gap-4"><div className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /><span className="font-semibold text-foreground">Trust Score: 98%</span></div><div className="flex items-center gap-1">{[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-warning text-warning" />)}<span className="text-sm text-muted-foreground ml-1">(4.9)</span></div></div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-muted-foreground" />{isEditing ? <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground" /> : <span className="text-foreground">{formData.email}</span>}</div>
                <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" />{isEditing ? <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground" /> : <span className="text-foreground">{formData.phone}</span>}</div>
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-muted-foreground" />{isEditing ? <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground" /> : <span className="text-foreground">{formData.address}</span>}</div>
              </div>
              {isEditing && <div className="flex gap-3 mt-6"><Button onClick={handleSave} className="flex-1">Save Changes</Button><Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button></div>}
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3"><Bell className="h-5 w-5 text-primary" /><div><p className="font-medium text-foreground">Email Notifications</p><p className="text-sm text-muted-foreground">Order updates and security alerts</p></div></div>
                  {isEmailNotificationsEnabled ? (
                    <div className="flex items-center gap-2"><Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="h-3 w-3 mr-1" />Enabled</Badge><Button variant="outline" size="sm" onClick={() => setDisableNotifConfirm(true)}>Disable</Button></div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setEmailNotifModalOpen(true)}>Configure</Button>
                  )}
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3"><Lock className="h-5 w-5 text-primary" /><div><p className="font-medium text-foreground">Two-Factor Authentication</p><p className="text-sm text-muted-foreground">Add extra security to your account</p></div></div>
                  {isTwoFactorEnabled ? <div className="flex items-center gap-2"><Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="h-3 w-3 mr-1" />Enabled</Badge><Button variant="outline" size="sm" onClick={() => setDisableTwoFAConfirm(true)}>Disable</Button></div> : <Button variant="outline" size="sm" onClick={() => setTwoFAModalOpen(true)}>Enable</Button>}
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3"><Wallet className="h-5 w-5 text-primary" /><div><p className="font-medium text-foreground">Wallet</p><p className="text-sm text-muted-foreground">Manage your wallet balance</p></div></div>
                  <Button variant="outline" size="sm" asChild><Link to="/wallet">Manage</Link></Button>
                </div>
              </div>
            </div>
          </div>


          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Stats</h3>
              <div className="space-y-4">{stats.map(stat => <div key={stat.label} className="flex items-center justify-between"><div className="flex items-center gap-3"><stat.icon className="h-5 w-5 text-primary" /><span className="text-sm text-muted-foreground">{stat.label}</span></div><span className="font-semibold text-foreground">{stat.value}</span></div>)}</div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4"><Shield className="h-5 w-5 text-primary" /><h3 className="font-semibold text-foreground">Verification Status</h3></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Email</span><CheckCircle2 className="h-4 w-4 text-success" /></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Phone</span><CheckCircle2 className="h-4 w-4 text-success" /></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Identity</span><CheckCircle2 className="h-4 w-4 text-success" /></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Address</span><AlertCircle className="h-4 w-4 text-warning" /></div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">Complete Verification</Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      <Dialog open={twoFAModalOpen} onOpenChange={(open) => { setTwoFAModalOpen(open); if (!open) { setTwoFASetupStep('select'); setSelectedTwoFAMethod(null); setOtpInput(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Enable Two-Factor Authentication</DialogTitle><DialogDescription>{twoFASetupStep === 'select' ? 'Choose your preferred 2FA method' : 'Enter the verification code'}</DialogDescription></DialogHeader>
          {twoFASetupStep === 'select' ? (
            <div className="space-y-4 py-4">
              <Button variant="outline" className="w-full justify-start h-auto p-4" onClick={() => { setSelectedTwoFAMethod('authenticator'); setTwoFASetupStep('verify'); }}><QrCode className="h-8 w-8 mr-4 text-primary" /><div className="text-left"><p className="font-medium">Authenticator App</p><p className="text-sm text-muted-foreground">Use Google Authenticator or similar</p></div></Button>
              <Button variant="outline" className="w-full justify-start h-auto p-4" onClick={() => { setSelectedTwoFAMethod('sms'); setTwoFASetupStep('verify'); }}><Smartphone className="h-8 w-8 mr-4 text-primary" /><div className="text-left"><p className="font-medium">SMS OTP</p><p className="text-sm text-muted-foreground">Receive codes via text message</p></div></Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {selectedTwoFAMethod === 'authenticator' && <div className="bg-muted p-6 rounded-lg text-center"><QrCode className="h-32 w-32 mx-auto mb-4 text-foreground" /><p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app</p><p className="text-xs font-mono mt-2 bg-background p-2 rounded">JBSWY3DPEHPK3PXP</p></div>}
              {selectedTwoFAMethod === 'sms' && <div className="bg-muted p-4 rounded-lg text-center"><p className="text-sm text-muted-foreground">A verification code has been sent to your phone ending in ****4567</p></div>}
              <div><Label>Enter 6-digit code</Label><Input placeholder="000000" maxLength={6} value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))} className="text-center text-2xl tracking-widest" /></div>
              <p className="text-xs text-muted-foreground text-center">Keep your backup codes safe in case you lose access to your device.</p>
              <div className="flex gap-3"><Button className="flex-1" onClick={handleEnable2FA} disabled={isVerifying}>{isVerifying ? 'Verifying...' : 'Enable 2FA'}</Button><Button variant="outline" onClick={() => setTwoFASetupStep('select')}>Back</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={disableTwoFAConfirm} onOpenChange={setDisableTwoFAConfirm}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Disable 2FA?</DialogTitle><DialogDescription>Your account will be less secure.</DialogDescription></DialogHeader><DialogFooter className="gap-2"><Button variant="outline" onClick={() => setDisableTwoFAConfirm(false)}>Cancel</Button><Button variant="destructive" onClick={handleDisable2FA}>Disable</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={emailNotifModalOpen} onOpenChange={setEmailNotifModalOpen}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Enable Email Notifications</DialogTitle><DialogDescription>You'll receive important updates about your orders.</DialogDescription></DialogHeader><div className="py-4 space-y-2"><p className="text-sm text-muted-foreground">• Order status updates</p><p className="text-sm text-muted-foreground">• Security alerts</p><p className="text-sm text-muted-foreground">• Payment confirmations</p></div><DialogFooter><Button onClick={handleEnableNotif} className="w-full">Enable Notifications</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={disableNotifConfirm} onOpenChange={setDisableNotifConfirm}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Disable Notifications?</DialogTitle><DialogDescription>You won't receive email updates about your orders.</DialogDescription></DialogHeader><DialogFooter className="gap-2"><Button variant="outline" onClick={() => setDisableNotifConfirm(false)}>Cancel</Button><Button variant="destructive" onClick={handleDisableNotif}>Disable</Button></DialogFooter></DialogContent></Dialog>
    </Layout>
  );
};

export default Profile;