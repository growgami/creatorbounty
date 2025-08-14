'use client';

import React from 'react';

interface AnimatedGridBackgroundProps {
  className?: string;
}

const AnimatedGridBackground: React.FC<AnimatedGridBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {/* Static Grid Background */}
      <div className="grid grid-cols-4 lg:grid-cols-4 md:grid-cols-2 grid-rows-3 gap-0.5 h-full w-full">
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i}
            className="bg-[#111] opacity-75"
          />
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: repeat(6, 1fr);
          }
        }
        @media (max-width: 600px) {
          .grid {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(12, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedGridBackground;