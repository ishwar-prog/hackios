import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { useAdminStore } from '@/store/useAdminStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail, Lock, Eye, EyeOff, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    login, 
    register, 
    resetPassword,
    resendVerificationEmail,
    isAuthenticated, 
    user, 
    redirectIntent, 
    clearRedirectIntent,
    emailVerificationRequired,
    checkEmailVerification
  } = useAuthStore();
  const { adminLogin } = useAdminStore();
  const { notifyNewLogin } = useNotificationStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Handle redirect after successful auth
  useEffect(() => {
    if (isAuthenticated && !emailVerificationRequired) {
      handlePostAuthRedirect();
    }
  }, [isAuthenticated, emailVerificationRequired]);

  const handlePostAuthRedirect = () => {
    const intent = redirectIntent;
    clearRedirectIntent();

    // Check if user is admin
    if (user?.role === 'admin') {
      // Also authenticate with admin store for backward compatibility
      adminLogin('admin@reboxed.in', 'admin123');
      toast({ title: "Welcome, Admin!", description: "Redirecting to admin dashboard..." });
      navigate('/admin/dashboard');
      return;
    }

    // Trigger login notification for regular users
    notifyNewLogin('Chrome on Windows', 'Your Location');

    switch (intent.type) {
      case 'checkout':
        toast({ title: "Welcome!", description: "Continuing to checkout..." });
        navigate(`/checkout/${intent.productId}`);
        break;
      case 'sell':
        toast({ title: "Welcome!", description: "Continuing to list your product..." });
        navigate('/sell');
        break;
      default:
        toast({ title: "Welcome!", description: "You have been logged in successfully." });
        navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({ title: "Missing Fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Invalid Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      
      // Check email verification after login
      if (!(await checkEmailVerification())) {
        toast({ 
          title: "Email Verification Required", 
          description: "Please check your email and verify your account before continuing.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Login Failed", 
        description: error.message || "Invalid email or password.", 
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({ title: "Missing Fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Invalid Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      toast({ 
        title: "Account Created!", 
        description: "Please check your email to verify your account.",
        variant: "default"
      });
    } catch (error: any) {
      toast({ 
        title: "Registration Failed", 
        description: error.message || "Could not create account. Please try again.", 
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({ title: "Missing Email", description: "Please enter your email address.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(resetEmail);
      toast({ 
        title: "Reset Email Sent", 
        description: "Check your email for password reset instructions.",
        variant: "default"
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      toast({ 
        title: "Reset Failed", 
        description: error.message || "Could not send reset email.", 
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    try {
      await resendVerificationEmail();
      toast({ 
        title: "Verification Email Sent", 
        description: "Please check your email for the verification link.",
        variant: "default"
      });
    } catch (error: any) {
      toast({ 
        title: "Failed to Send", 
        description: error.message || "Could not send verification email.", 
        variant: "destructive" 
      });
    }
    setIsLoading(false);
  };

  // Show intent message if redirected
  const getIntentMessage = () => {
    switch (redirectIntent.type) {
      case 'checkout':
        return 'Sign in to complete your purchase';
      case 'sell':
        return 'Sign in to list your product';
      default:
        return isSignUp ? 'Join ReBoxed today' : 'Sign in to your account';
    }
  };

  // Show email verification banner if needed
  if (isAuthenticated && emailVerificationRequired) {
    return (
      <Layout showTrustBanner={false}>
        <div className="container py-16 max-w-md">
          <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10 border border-warning/20 mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Verify Your Email
            </h1>
            <p className="text-muted-foreground">
              We've sent a verification link to <strong>{user?.email}</strong>
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
              <p className="text-sm text-center text-muted-foreground">
                Please check your email and click the verification link to access all marketplace features.
              </p>
            </div>

            <Button 
              onClick={handleResendVerification} 
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <Button 
              onClick={() => checkEmailVerification()} 
              className="w-full"
            >
              Check Verification Status
            </Button>

            <div className="text-center">
              <button 
                onClick={() => {
                  useAuthStore.getState().logout();
                }} 
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign out and use different account
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (showForgotPassword) {
    return (
      <Layout showTrustBanner={false}>
        <div className="container py-16 max-w-md">
          <div className="text-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-trust mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Reset Password
            </h1>
            <p className="text-muted-foreground">Enter your email to receive reset instructions</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="resetEmail">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="resetEmail" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={resetEmail} 
                    onChange={e => setResetEmail(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowForgotPassword(false)} 
                className="text-sm text-primary hover:underline font-medium"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showTrustBanner={false}>
      <div className="container py-16 max-w-md">
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-trust mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground">{getIntentMessage()}</p>
        </div>

        {redirectIntent.type !== 'none' && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-center text-muted-foreground">
              {redirectIntent.type === 'checkout' && '🛒 Your cart is waiting! Sign in to continue.'}
              {redirectIntent.type === 'sell' && '📦 Your listing draft is saved! Sign in to publish.'}
            </p>
          </div>
        )}

        <div className="bg-card rounded-xl border border-border p-6">
          <form onSubmit={isSignUp ? handleSignUp : handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="name">Full Name</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    placeholder="John Smith" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="pl-10" 
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="pl-10" 
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="pl-10 pr-10" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be at least 6 characters
                </p>
              )}
            </div>
            
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Please wait...
                </>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <button 
                onClick={() => setShowForgotPassword(true)} 
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="text-primary hover:underline font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Demo Admin: admin@trustytrade.com / admin123
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
