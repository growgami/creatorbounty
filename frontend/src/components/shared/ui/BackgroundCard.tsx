import React from 'react';

interface BackgroundCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'hover' | 'subtle';
}

/**
 * BackgroundCard Component
 * Reusable card with background image and consistent styling
 */
const BackgroundCard: React.FC<BackgroundCardProps> = ({
  children,
  className = '',
  onClick,
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'hover':
        return 'hover:shadow-md hover:border-white/20 hover:scale-[1.02] hover:shadow-lg transition-all duration-150';
      case 'subtle':
        return 'hover:shadow-sm hover:border-white/15 transition-all duration-200';
      default:
        return 'shadow-sm';
    }
  };

  const baseStyles = `
    bg-black/20 
    bg-[url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/2fdcc9de-94c9-4f1c-80d4-900440428d32_800w.jpg)] 
    bg-cover 
    border 
    border-zinc-800/30 
    rounded-2xl 
    p-6
    ${getVariantStyles()}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div 
      className={baseStyles}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default BackgroundCard;