import React from 'react';
import { Requirement } from '../../types/types';

interface RequirementsListProps {
  requirements: Requirement[];
  className?: string;
}

/**
 * Requirements List Component
 * Displays a grid of bounty requirements with bullet points
 */
const RequirementsList: React.FC<RequirementsListProps> = ({
  requirements,
  className = ""
}) => {
  return (
    <div 
      className={`transition-all duration-300 ease-in-out rounded-2xl relative overflow-hidden mb-8 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
        boxShadow: 'inset 3px 3px 6px rgba(255, 255, 255, 0.04), 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full bg-white/5 blur-lg"></div>
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requirements.map((requirement) => (
            <div key={requirement.id} className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300">{requirement.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RequirementsList;
