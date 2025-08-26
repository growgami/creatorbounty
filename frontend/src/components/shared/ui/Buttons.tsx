import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseClasses = `
    rounded-xl
    font-medium
    font-space-grotesk
    transition-all
    duration-200
    ease-in-out
    cursor-pointer
    border
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-white
      text-black
      border-white
      hover:bg-gray-100
      hover:scale-101
      focus:ring-white
    `,
    secondary: `
      bg-transparent
      text-white
      border-white
      hover:bg-white
      hover:text-black
      hover:scale-101
      focus:ring-white
    `,
    outline: `
      bg-transparent
      text-white
      border-white
      border-opacity-50
      hover:border-opacity-100
      hover:bg-white
      hover:text-black
      hover:scale-101
      focus:ring-white
    `
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
