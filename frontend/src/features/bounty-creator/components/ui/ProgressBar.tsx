import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100 percentage
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Progress Bar Component
 * Displays campaign completion progress with visual indicators
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  // Ensure progress is within bounds
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  // Size configurations
  const sizeConfig = {
    sm: { height: 'h-2', text: 'text-xs' },
    md: { height: 'h-3', text: 'text-sm' },
    lg: { height: 'h-4', text: 'text-base' }
  };
  
  const config = sizeConfig[size];
  
  // Progress color based on completion
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };
  
  const progressColor = getProgressColor(normalizedProgress);
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className={`font-medium text-gray-300 ${config.text}`}>
            Campaign Progress
          </span>
          <span className={`font-semibold text-white ${config.text}`}>
            {normalizedProgress}%
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-700 rounded-full ${config.height} overflow-hidden`}>
        <div
          className={`${config.height} ${progressColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${normalizedProgress}%` }}
        >
          {/* Animated shine effect for active progress */}
          {normalizedProgress > 0 && normalizedProgress < 100 && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </div>
      </div>
      
      {/* Progress milestones */}
      {size !== 'sm' && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Start</span>
          <span className="text-xs text-gray-500">Complete</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
