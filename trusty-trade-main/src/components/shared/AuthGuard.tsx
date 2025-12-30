import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Route guard component that redirects unauthenticated users to login.
 * Use this to wrap protected pages/routes.
 */
export const AuthGuard = ({ children, redirectTo = '/login' }: AuthGuardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please sign in to access this page.",
      });
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo, toast]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
