import React from 'react';
import { Shield } from 'lucide-react';
import UserMenu from '@/components/layouts/UserMenu';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({
  className = ''
}) => {
  return (
    <nav className={`relative z-10 mb-12 ${className}`}>
      <div className="flex bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-3 shadow-sm items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-black">
            <Shield className="w-5 h-5" strokeWidth={3} />
          </span>
          <span className="text-base font-semibold tracking-tight hidden sm:block text-white font-space-grotesk">CreatorBounty</span>
        </a>
        <ul className="hidden sm:flex items-center gap-8 text-sm font-medium">
          <li><a href="#" className="text-white hover:text-gray-300 font-space-grotesk">Campaigns</a></li>
          <li><a href="#" className="text-gray-400 hover:text-gray-300 font-space-grotesk">Analytics</a></li>
          <li><a href="#" className="text-gray-400 hover:text-gray-300 font-space-grotesk">Settings</a></li>
        </ul>
        <div className="flex items-center space-x-3">
          <UserMenu userInitial="A" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
