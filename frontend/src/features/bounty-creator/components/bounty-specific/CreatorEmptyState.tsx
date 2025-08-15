'use client';

import React from 'react';
import { Video, Sparkles } from 'lucide-react';

interface CreatorEmptyStateProps {
  className?: string;
}

const CreatorEmptyState: React.FC<CreatorEmptyStateProps> = ({ 
  className = ''
}) => {
  return (
    <div className={`bg-[#1a1a1a] border border-white/10 rounded-2xl p-12 text-center ${className}`}>
      {/* Illustration */}
      <div className="mb-8">
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Main video icon */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
            <Video className="w-12 h-12 text-cyan-400" />
          </div>
          
          {/* Sparkles decoration */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          
          {/* Additional sparkles */}
          <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-gradient-to-r from-pink-400/30 to-purple-400/30 rounded-full flex items-center justify-center">
            <Sparkles className="w-2 h-2 text-pink-400" />
          </div>
        </div>
        
        {/* Emoji */}
        <div className="text-4xl mb-4">🎥</div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto mb-8">
        <h3 className="text-xl font-semibold text-white mb-3 font-space-grotesk">
          Ready to earn?
        </h3>
        <p className="text-gray-400 font-space-grotesk leading-relaxed">
          Use the &quot;Submit Your Entry&quot; button above to showcase Plasma Testnet and start earning rewards!
        </p>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-cyan-400/10 blur-xl"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full bg-purple-400/10 blur-lg"></div>
      </div>
    </div>
  );
};

export default CreatorEmptyState;
