import { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { useAuthStore } from "@/store/useAuthStore";
import { firebaseAuthService } from "@/services/firebaseAuth";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import SimpleOrders from "./pages/SimpleOrders";
import Verification from "./pages/Verification";
import Dispute from "./pages/Dispute";
import Profile from "./pages/Profile";
import SellerDashboard from "./pages/SellerDashboard";
import Help from "./pages/Help";
import Security from "./pages/Security";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Test from "./pages/Test";
import Navigation from "./pages/Navigation";
import NotFound from "./pages/NotFound";
import Sell from "./pages/Sell";
import Wallet from "./pages/Wallet";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import BuyerProtection from "./pages/BuyerProtection";
import HowEscrowWorks from "./pages/HowEscrowWorks";
import ReturnPolicy from "./pages/ReturnPolicy";
import MarketplaceRules from "./pages/MarketplaceRules";
import VerificationGuide from "./pages/VerificationGuide";

const queryClient = new QueryClient();

const App = () => {
  const { setUser, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state (this sets up the auth state listener internally)
    initializeAuth();
  }, [initializeAuth]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="trusty-trade-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/buyer-protection" element={<BuyerProtection />} />
              <Route path="/how-escrow-works" element={<HowEscrowWorks />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              <Route path="/marketplace-rules" element={<MarketplaceRules />} />
              <Route path="/verification-guide" element={<VerificationGuide />} />
              
              {/* Auth-gated routes */}
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/orders" element={<AuthGuard><Orders /></AuthGuard>} />
              <Route path="/simple-orders" element={<AuthGuard><SimpleOrders /></AuthGuard>} />
              <Route path="/verify/:id" element={<AuthGuard><Verification /></AuthGuard>} />
              <Route path="/dispute/:id" element={<AuthGuard><Dispute /></AuthGuard>} />
              <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
              <Route path="/seller" element={<AuthGuard><SellerDashboard /></AuthGuard>} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/wallet" element={<AuthGuard><Wallet /></AuthGuard>} />
              <Route path="/wishlist" element={<AuthGuard><Wishlist /></AuthGuard>} />
              <Route path="/help" element={<AuthGuard><Help /></AuthGuard>} />
              <Route path="/security" element={<AuthGuard><Security /></AuthGuard>} />
              <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />
              <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
              
              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              
              {/* Dev/test routes */}
              <Route path="/test" element={<Test />} />
              <Route path="/nav" element={<Navigation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
