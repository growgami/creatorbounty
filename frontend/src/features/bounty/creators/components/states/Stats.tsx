import React from 'react';
import { TrendingUp, Users, Shield } from 'lucide-react';
import { useCreatorStats } from '../../hooks/useCreatorStats';
import { SlideUp } from '@/components/effects/animations/FadeInTransition';

interface StatsProps {
  delay?: number;
}

export const Stats: React.FC<StatsProps> = ({ delay = 0.6 }) => {
  const { platformStats, isLoading, isError, error } = useCreatorStats();

  if (isLoading) return <div>Loading stats...</div>;
  if (isError) return <div>Error loading stats: {error?.message}</div>;

  return (
    <SlideUp delay={delay}>
      <div className="mt-12 pt-8 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-cyan-500/20 rounded-full mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white font-space-grotesk">{platformStats?.activeCampaigns || 0}</div>
            <div className="text-sm text-gray-400 font-space-grotesk">Active Campaigns</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mx-auto mb-3">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white font-space-grotesk">{platformStats?.totalCreators || '0'}</div>
            <div className="text-sm text-gray-400 font-space-grotesk">Total Creators</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mx-auto mb-3">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white font-space-grotesk">{platformStats?.xplRewardsPaid || '0'}</div>
            <div className="text-sm text-gray-400 font-space-grotesk">XPL Rewards Paid</div>
          </div>
        </div>
      </div>
    </SlideUp>
  );
};

export default Stats;