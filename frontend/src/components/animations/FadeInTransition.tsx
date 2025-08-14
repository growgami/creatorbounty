'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FadeInTransitionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

/**
 * FadeInTransition Component
 * Provides smooth fade-in animations with optional directional movement
 * Similar to the reference HTML animations but using Framer Motion
 */
const FadeInTransition: React.FC<FadeInTransitionProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  className = ''
}) => {
  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return { y: 20, opacity: 0 };
      case 'down':
        return { y: -20, opacity: 0 };
      case 'left':
        return { x: 20, opacity: 0 };
      case 'right':
        return { x: -20, opacity: 0 };
      case 'none':
      default:
        return { opacity: 0 };
    }
  };

  const getAnimateTransform = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { y: 0, opacity: 1 };
      case 'left':
      case 'right':
        return { x: 0, opacity: 1 };
      case 'none':
      default:
        return { opacity: 1 };
    }
  };

  return (
    <motion.div
      initial={getInitialTransform()}
      animate={getAnimateTransform()}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeInTransition;

// Additional utility components for common animations

export const SlideUp: React.FC<Omit<FadeInTransitionProps, 'direction'>> = ({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  className = '' 
}) => (
  <FadeInTransition 
    direction="up" 
    delay={delay} 
    duration={duration} 
    className={className}
  >
    {children}
  </FadeInTransition>
);

export const FadeIn: React.FC<Omit<FadeInTransitionProps, 'direction'>> = ({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  className = '' 
}) => (
  <FadeInTransition 
    direction="none" 
    delay={delay} 
    duration={duration} 
    className={className}
  >
    {children}
  </FadeInTransition>
);

export const ModalDrop: React.FC<FadeInTransitionProps> = ({ 
  children, 
  delay = 0, 
  className = '' 
}) => (
  <motion.div
    initial={{ y: -20, scale: 0.95, opacity: 0 }}
    animate={{ y: 0, scale: 1, opacity: 1 }}
    exit={{ y: -20, scale: 0.95, opacity: 0 }}
    transition={{
      duration: 0.4,
      delay,
      ease: [0.34, 1.56, 0.64, 1] // cubic-bezier matching the reference
    }}
    className={className}
  >
    {children}
  </motion.div>
);


