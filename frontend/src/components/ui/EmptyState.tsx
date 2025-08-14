import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

/**
 * Empty State Component
 * Reusable component for displaying empty states with icon, title, and description
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  iconBgColor = "bg-gray-600/20",
  iconColor = "text-gray-400",
  className = ""
}) => {
  return (
    <div className={`bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 ${className}`}>
      <div className="text-center text-gray-400">
        <div className="mb-4">
          <div className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
        </div>
        <h3 className="text-lg text-white mb-2 font-space-grotesk">{title}</h3>
        <p className="font-space-grotesk">{description}</p>
      </div>
    </div>
  );
};

export default EmptyState;
