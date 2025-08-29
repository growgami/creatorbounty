'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useRole } from '@/features/rbac-landing/hooks/useRole';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface UserMenuProps {
  className?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ 
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { role, clearRole } = useRole();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    clearRole();
    setIsOpen(false);
  };

  const getRoleDisplayName = () => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'creator':
        return 'Creator';
      default:
        return 'User';
    }
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:bg-white/5 rounded-lg px-2 py-1 transition-colors"
      >
        <div className="relative w-8 h-8">
          {user.userPfp ? (
            <Image
              src={user.userPfp}
              alt={`${user.username} profile picture`}
              width={32}
              height={32}
              className="rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-lg z-50 py-2">
          {/* User Info Section */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                {user.userPfp ? (
                  <Image
                    src={user.userPfp}
                    alt={`${user.username} profile picture`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-white font-space-grotesk">
                  {user.name || user.username}
                </p>
                <p className="text-xs text-gray-400 font-space-grotesk">
                  @{user.username}
                </p>
                <p className="text-xs text-blue-400 font-space-grotesk">
                  {getRoleDisplayName()}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/profile');
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors flex items-center space-x-3 font-space-grotesk"
            >
              <User className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center space-x-3 font-space-grotesk"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
