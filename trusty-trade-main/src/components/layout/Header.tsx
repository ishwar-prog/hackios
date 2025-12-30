import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X, Bell, Heart, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';
import { useState, useMemo } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { unreadCount } = useNotificationStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { toast } = useToast();

  // Auth-gated navigation: logged-out users only see Browse
  // Admin users only see Browse + Admin Dashboard (no buy/sell/orders/wallet)
  const navLinks = useMemo(() => {
    const baseLinks = [{ href: '/', label: 'Browse' }];
    
    // Admin role: restricted navigation
    if (isAuthenticated && user?.role === 'admin') {
      return [
        ...baseLinks,
        { href: '/admin/dashboard', label: 'Admin Dashboard' },
      ];
    }
    
    // Regular authenticated user: full navigation
    if (isAuthenticated) {
      return [
        ...baseLinks,
        { href: '/orders', label: 'My Orders' },
        { href: '/sell', label: 'Sell' },
        { href: '/wallet', label: 'Wallet' },
        { href: '/help', label: 'Help' },
      ];
    }
    
    return baseLinks;
  }, [isAuthenticated, user?.role]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast({ title: "Logged Out", description: "You have been logged out successfully." });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/reboxed-logo.svg" alt="ReBoxed" className="h-9 w-9 rounded-lg object-contain" />
          <span className="text-xl font-bold text-foreground">ReBoxed</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <AnimatedThemeToggle />
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/wishlist">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">{wishlistItems.length}</span>}
            </Link>
          </Button>
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="icon" asChild><Link to="/profile"><User className="h-5 w-5" /></Link></Button>
              <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
            </>
          ) : (
            <Button variant="default" size="sm" asChild><Link to="/login"><LogIn className="h-4 w-4 mr-2" />Sign In</Link></Button>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          <AnimatedThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-border mt-2">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" className="justify-start" asChild><Link to="/profile" onClick={() => setMobileMenuOpen(false)}><User className="h-4 w-4 mr-2" />Profile</Link></Button>
                  <Button variant="outline" size="sm" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}><LogOut className="h-4 w-4 mr-2" />Logout</Button>
                </>
              ) : (
                <Button variant="default" size="sm" asChild><Link to="/login" onClick={() => setMobileMenuOpen(false)}><LogIn className="h-4 w-4 mr-2" />Sign In</Link></Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
