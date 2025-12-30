import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useToast } from '@/hooks/use-toast';
import { Shield, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register, isAuthenticated, redirectIntent, clearRedirectIntent } = useAuthStore();
  const { notifyNewLogin } = useNotificationStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Handle redirect after successful auth
  useEffect(() => {
    if (isAuthenticated) {
      handlePostAuthRedirect();
    }
  }, [isAuthenticated]);

  const handlePostAuthRedirect = () => {
    const intent = redirectIntent;
    clearRedirectIntent();

    // Check if user is admin
    if (user?.role === 'admin') {
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

    if (password.length < 4) {
      toast({ title: "Invalid Password", description: "Password must be at least 4 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      // Redirect handled by useEffect
    } catch {
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({ title: "Missing Fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    if (password.length < 4) {
      toast({ title: "Invalid Password", description: "Password must be at least 4 characters.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      // Redirect handled by useEffect
    } catch {
      toast({ title: "Registration Failed", description: "Could not create account. Please try again.", variant: "destructive" });
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
        return isSignUp ? 'Join Trusty Trade today' : 'Sign in to your account';
    }
  };

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
              Demo: Use any email and password (min 4 chars)
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
