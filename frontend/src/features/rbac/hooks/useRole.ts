'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
 * Handles both role state management and automatic URL routing
 */
export const useRole = (): UseRoleReturn => {
  const [role, setRoleState] = useState<UserRole>(null);
  const router = useRouter();

  // Load role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole;
    if (savedRole && (savedRole === 'admin' || savedRole === 'creator')) {
      setRoleState(savedRole);
    }
  }, []);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    
    // Persist role to localStorage
    if (newRole) {
      localStorage.setItem('userRole', newRole);
      
      // Map role to URL path
      const rolePath = newRole === 'admin' ? 'admin' : 'creator';
      
      // Navigate to role-specific bounty page with preserved params
      const targetUrl = `/${rolePath}`;
      
      router.push(targetUrl);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [router]);

  const clearRole = useCallback(() => {
    setRoleState(null);
    localStorage.removeItem('userRole');
    // Navigate back to role selection page
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