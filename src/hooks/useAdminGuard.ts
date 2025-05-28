// 1. FIXED: src/hooks/useAdminGuard.ts - Simplified version to avoid hook order issues
import { useAuth } from './useAuth';

export const useAdminGuard = () => {
  const { user, isAdmin, loading } = useAuth();

  // Don't do any automatic redirects here to avoid hook order issues
  // Let the components handle their own redirects

  console.log('🛡️ Admin Guard Check:', {
    userEmail: user?.email,
    isAdmin,
    loading,
    hasUser: !!user
  });

  return {
    user,
    isAdmin,
    loading,
    hasAccess: isAdmin === true,
    isChecking: loading || (user && isAdmin === null), // Only checking if we have a user but no admin status yet
    isAuthenticated: !!user
  };
};