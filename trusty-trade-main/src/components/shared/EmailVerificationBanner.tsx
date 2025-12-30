import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Mail, X } from 'lucide-react';

export const EmailVerificationBanner = () => {
  const { 
    user, 
    emailVerificationRequired, 
    resendVerificationEmail, 
    checkEmailVerification,
    loading 
  } = useAuthStore();
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(false);

  if (!emailVerificationRequired || dismissed || !user) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      toast({
        title: "Verification Email Sent",
        description: "Please check your email for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Send",
        description: error.message || "Could not send verification email.",
        variant: "destructive"
      });
    }
  };

  const handleCheckVerification = async () => {
    const isVerified = await checkEmailVerification();
    if (isVerified) {
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified.",
      });
    } else {
      toast({
        title: "Not Verified Yet",
        description: "Please check your email and click the verification link.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-warning/10 border-b border-warning/20">
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-warning shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Email verification required
              </p>
              <p className="text-xs text-muted-foreground">
                Please verify your email address to access all marketplace features
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResendVerification}
              disabled={loading}
              className="text-xs"
            >
              <Mail className="h-3 w-3 mr-1" />
              {loading ? 'Sending...' : 'Resend'}
            </Button>
            
            <Button
              size="sm"
              onClick={handleCheckVerification}
              className="text-xs"
            >
              I've Verified
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-xs p-1 h-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};