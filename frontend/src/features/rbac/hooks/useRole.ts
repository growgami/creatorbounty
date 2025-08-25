'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';

export type UserRole = 'admin' | 'creator' | null;

interface UseRoleReturn {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAdmin: boolean;
  isCreator: boolean;
  clearRole: () => void;
}

/**
 * Hook for managing user role state and URL navigation
 * Gets role from authenticated user with localStorage as cache
 */
export const useRole = (): UseRoleReturn => {
  const { user } = useAuth();
  const [role, setRoleState] = useState<UserRole>(null);
  const router = useRouter();

  // Sync role from authenticated user
  useEffect(() => {
    if (user?.role) {
      setRoleState(user.role);
      // Update localStorage cache
      localStorage.setItem('userRole', user.role);
    } else {
      // No authenticated user, clear role
      setRoleState(null);
      localStorage.removeItem('userRole');
    }
  }, [user]);

  const setRole = useCallback((newRole: UserRole) => {
    // Note: Role is now determined by authentication, not manual selection
    // This method is kept for backward compatibility but doesn't change auth role
    if (newRole && newRole !== role) {
      // Map role to URL path
      const rolePath = newRole === 'admin' ? 'admin' : 'creator';
      
      // Navigate to role-specific bounty page
      const targetUrl = `/${rolePath}`;
      router.push(targetUrl);
    }
  }, [router, role]);

  const clearRole = useCallback(() => {
    // Clear cached role, but actual role clearing requires logout
    setRoleState(null);
    localStorage.removeItem('userRole');
    // Navigate back to home page
    router.push('/');
  }, [router]);

  return {
    role,
    setRole,
    isAdmin: role === 'admin',
    isCreator: role === 'creator',
    clearRole
  };
};