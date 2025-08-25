import { useSession, signIn, signOut } from 'next-auth/react';
import React from 'react';

// Extend the NextAuth session user type to include our custom fields
interface SessionUser {
  id: string;
  username: string;
  userPfp: string;
  wallet_address?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
  role: 'admin' | 'creator';
  // Index signature for additional properties
  [key: string]: string | number | boolean | null | undefined;
}

// Create a compatible AuthUser interface
interface AuthUser {
  id: string;
  username: string;
  userPfp: string;
  wallet_address?: string;
  name?: string;
  email?: string | null;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
  role: 'admin' | 'creator';
  createdAt: string;
  updatedAt: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const { data: session, status } = useSession();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  
  // Handle localStorage caching with 7-day decay
  React.useEffect(() => {
    if (isAuthenticated && session?.user) {
      // Cache session data in localStorage with expiration
      const sessionData = {
        user: session.user,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      };
      localStorage.setItem('auth-session', JSON.stringify(sessionData));
    } else if (!isAuthenticated) {
      // Check if there's a cached session that hasn't expired
      const cachedSession = localStorage.getItem('auth-session');
      if (cachedSession) {
        const parsedSession = JSON.parse(cachedSession);
        const expirationDate = new Date(parsedSession.expires);
        if (expirationDate < new Date()) {
          // Session expired, remove it
          localStorage.removeItem('auth-session');
        }
      }
    }
  }, [isAuthenticated, session]);
  
  const user = session?.user ? {
    id: (session.user as SessionUser).id,
    username: (session.user as SessionUser).username,
    userPfp: (session.user as SessionUser).userPfp,
    wallet_address: (session.user as SessionUser).wallet_address,
    name: (session.user as SessionUser).name || undefined,
    email: (session.user as SessionUser).email || undefined,
    bio: (session.user as SessionUser).bio,
    followers_count: (session.user as SessionUser).followers_count,
    following_count: (session.user as SessionUser).following_count,
    tweet_count: (session.user as SessionUser).tweet_count,
    role: (session.user as SessionUser).role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } : null;
  
  const login = () => {
    signIn('twitter');
  };
  
  const logout = () => {
    signOut();
    // Clear cached session from localStorage
    localStorage.removeItem('auth-session');
  };
  
  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
};
