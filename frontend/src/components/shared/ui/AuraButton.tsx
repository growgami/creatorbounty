'use client';

import React, { useId } from 'react';

interface AuraButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
  disabled?: boolean;
}

const AuraButton: React.FC<AuraButtonProps> = ({ 
  children, 
  onClick, 
  className = '',
  size = 'md',
  variant = 'default',
  disabled = false
}) => {
  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-sm',
    lg: 'h-14 px-8 text-base'
  };

  const buttonId = `aura-button-${useId()}`;

  return (
    <>
      <button
        id={buttonId}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`
          inline-flex gap-2 rounded-full font-semibold text-[#0d0d0d] items-center 
          bg-transparent border-none relative transition-transform 
          duration-300 ease-in-out transform scale-100 
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-101 focus-visible:scale-110'}
          ${sizeClasses[size]} ${className}
        `}
        style={{
          '--black-700': 'hsla(0 0% 12% / 1)',
          '--border-radius': '9999px',
          '--transition': '0.3s ease-in-out',
          '--offset': '2px',
          '--active': '0',
          position: 'relative',
          borderRadius: '9999px',
          backgroundColor: 'transparent'
        } as React.CSSProperties}
      >
        <span 
          className={`font-space-grotesk relative z-10 ${variant === 'white' ? 'text-gray-800' : 'text-white'}`}
        >
          {children}
        </span>
        
        {/* Rotating Border */}
        <span 
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{
            '--size-border': 'calc(100% + 2px)',
            width: 'var(--size-border)',
            height: 'var(--size-border)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: -10
          } as React.CSSProperties & { '--size-border': string }}
        >
          <span 
            className={`absolute block w-full h-8 ${variant === 'white' ? 'bg-blue-600' : 'bg-white'}`}
            style={{
              content: '""',
              top: '30%',
              left: '50%',
              transformOrigin: 'left',
              maskImage: 'linear-gradient(transparent 0%, white 120%)',
              animation: 'rotate 2s linear infinite',
              transform: 'rotate(0deg)'
            }}
          />
        </span>
      </button>

      <style jsx>{`
        #${buttonId}::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background-color: ${variant === 'white' ? 'hsla(0 0% 95% / 1)' : 'var(--black-700)'};
          border-radius: var(--border-radius);
          box-shadow: 
            inset 0 0.5px ${variant === 'white' ? 'hsl(0, 0%, 100%)' : 'hsl(0, 0%, 100%)'}, 
            inset 0 -1px 2px 0 ${variant === 'white' ? 'hsl(0, 0%, 85%)' : 'hsl(0, 0%, 0%)'}, 
            0px 4px 10px -4px hsla(0 0% 0% / calc(1 - var(--active, 0))), 
            0 0 0 calc(var(--active, 0) * 0.375rem) ${variant === 'white' ? 'hsl(220 100% 60% / 0.75)' : 'hsl(260 97% 50% / 0.75)'};
          transition: all var(--transition);
          z-index: 0;
        }
        
        #${buttonId}::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background-color: ${variant === 'white' ? 'hsla(220 100% 60% / 0.75)' : 'hsla(260 97% 61% / 0.75)'};
          background-image: ${variant === 'white' 
            ? `radial-gradient(at 51% 89%, hsla(220, 100%, 70%, 1) 0px, transparent 50%), 
               radial-gradient(at 100% 100%, hsla(220, 100%, 60%, 1) 0px, transparent 50%), 
               radial-gradient(at 22% 91%, hsla(220, 100%, 60%, 1) 0px, transparent 50%)`
            : `radial-gradient(at 51% 89%, hsla(266, 45%, 74%, 1) 0px, transparent 50%), 
               radial-gradient(at 100% 100%, hsla(266, 36%, 60%, 1) 0px, transparent 50%), 
               radial-gradient(at 22% 91%, hsla(266, 36%, 60%, 1) 0px, transparent 50%)`};
          background-position: top;
          opacity: var(--active, 0);
          border-radius: var(--border-radius);
          transition: opacity var(--transition);
          z-index: 2;
        }
        
        #${buttonId}:is(:hover, :focus-visible):not(:disabled) {
          --active: 1;
        }
        
        #${buttonId}:active {
          transform: scale(1);
        }
        
        @keyframes rotate {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default AuraButton;