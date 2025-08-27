'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Star, DollarSign, ArrowRight } from 'lucide-react';
import BackgroundCard from '@/components/shared/ui/BackgroundCard';

interface AnalyticsWidgetProps {
  className?: string;
}

const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ className = '' }) => {
  const router = useRouter();

  const handleAnalyticsClick = () => {
    router.push('/analytics');
  };

  return (
    <div className={`w-80 ${className}`}>
      <BackgroundCard
        variant="hover"
        onClick={handleAnalyticsClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white font-space-grotesk">This Week&apos;s Highlights</h3>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </div>

        {/* Stats */}
        <div className="space-y-4">
          {/* Top Creator */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 font-space-grotesk">Top Creator</p>
              <p className="text-white font-semibold font-space-grotesk">@demoStar</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white font-space-grotesk">12</p>
              <p className="text-xs text-gray-400 font-space-grotesk">subs</p>
            </div>
          </div>

          {/* Average CPA */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 font-space-grotesk">Avg CPA</p>
              <p className="text-white font-semibold font-space-grotesk">Cost Per Acquisition</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white font-space-grotesk">42</p>
              <p className="text-xs text-gray-400 font-space-grotesk">XPL</p>
            </div>
          </div>

          {/* Total Paid */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400 font-space-grotesk">Total Paid</p>
              <p className="text-white font-semibold font-space-grotesk">This Week</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white font-space-grotesk">3.4K</p>
              <p className="text-xs text-gray-400 font-space-grotesk">XPL</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 font-space-grotesk">View full analytics</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"></div>
      </BackgroundCard>
    </div>
  );
};

export default AnalyticsWidget;
