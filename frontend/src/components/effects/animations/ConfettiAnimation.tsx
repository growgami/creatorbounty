'use client';

import React, { useEffect, useRef } from 'react';
import type { CreateTypes } from 'canvas-confetti';

interface ConfettiAnimationProps {
  isActive: boolean;
  onComplete: () => void;
  className?: string;
}

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ 
  isActive, 
  onComplete,
  className = ''
}) => {
  const confettiRef = useRef<CreateTypes | null>(null);

  useEffect(() => {
    const loadConfetti = async () => {
      const confettiModule = await import('canvas-confetti');
      confettiRef.current = confettiModule.default as unknown as CreateTypes;
    };
    
    loadConfetti();
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isActive && confettiRef.current) {
      // Fire confetti
      confettiRef.current({
        particleCount: 150,
        angle: 90,
        spread: 90,
        startVelocity: 45,
        decay: 0.9,
        gravity: 1,
        ticks: 200,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        shapes: ['square', 'circle'],
      });

      // Complete animation after 3 seconds
      timeoutId = setTimeout(() => {
        onComplete();
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isActive, onComplete]);

  if (!isActive) {
    return null;
  }

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      <canvas className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default ConfettiAnimation;
