import React from 'react';

interface BulkActionBarProps {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
  onClear: () => void;
  className?: string;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onApprove,
  onReject,
  onClear,
  className = ''
}) => {
  return (
    <div className={`sticky top-0 z-10 bg-[#101010] border border-cyan-400/30 rounded-lg p-4 mb-6 backdrop-blur-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-white font-space-grotesk">
            {selectedCount} selected
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors font-space-grotesk"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors font-space-grotesk"
            >
              Reject
            </button>
            <button
              onClick={onClear}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors font-space-grotesk"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;