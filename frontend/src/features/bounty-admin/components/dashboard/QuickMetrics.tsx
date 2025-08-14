import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuickMetrics } from '@/features/bounty-admin/hooks/useQuickMetrics';

interface QuickMetricsProps {
  className?: string;
}

const QuickMetrics: React.FC<QuickMetricsProps> = ({ className = '' }) => {
  const { 
    totalSubmissions, 
    dailySubmissions, 
    acceptanceRatio, 
    submissionData, 
    loading, 
    error 
  } = useQuickMetrics();

  if (loading) {
    return (
      <div className={`rounded-lg p-6 flex items-center justify-center ${className}`}>
        <div className="text-white">Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg p-6 flex items-center justify-center ${className}`}>
        <div className="text-red-500">Error loading metrics: {error}</div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-bold text-white mb-6">Campaign Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="transition-all duration-300 ease-in-out rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
            boxShadow: 'inset 3px 3px 6px rgba(255, 255, 255, 0.04), 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full bg-white/5 blur-lg"></div>
          </div>
          <div className="relative z-10 p-6">
            <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-medium">Total Submissions</p>
            <p className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{totalSubmissions}</p>
          </div>
        </div>
        
        <div className="transition-all duration-300 ease-in-out rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
            boxShadow: 'inset 3px 3px 6px rgba(255, 255, 255, 0.04), 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full bg-white/5 blur-lg"></div>
          </div>
          <div className="relative z-10 p-6">
            <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-medium">Today&apos;s Submissions</p>
            <p className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{dailySubmissions}</p>
          </div>
        </div>
        
        <div className="transition-all duration-300 ease-in-out rounded-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
            boxShadow: 'inset 3px 3px 6px rgba(255, 255, 255, 0.04), 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
            <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full bg-white/5 blur-lg"></div>
          </div>
          <div className="relative z-10 p-6">
            <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-medium">Acceptance Rate</p>
            <p className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{acceptanceRatio}</p>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <h3 className="text-lg font-semibold text-white mb-4">Submissions Trend (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={submissionData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date" 
              stroke="#888" 
              tick={{ fill: '#888' }} 
            />
            <YAxis 
              stroke="#888" 
              tick={{ fill: '#888' }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => [value, 'Submissions']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
              name="Submissions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default QuickMetrics;
