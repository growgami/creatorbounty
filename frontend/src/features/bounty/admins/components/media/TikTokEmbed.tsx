import React, { useState } from 'react';
import { TikTokEmbed as ReactTikTokEmbed } from 'react-social-media-embed';
import { ExternalLink, AlertCircle, Loader } from 'lucide-react';

interface TikTokEmbedProps {
  url: string;
  className?: string;
  showExternalLink?: boolean;
  width?: number;
}

/**
 * TikTok Video Embed Component
 * Displays TikTok videos using react-social-media-embed library with fallback handling
 */
const TikTokEmbed: React.FC<TikTokEmbedProps> = ({
  url,
  className = '',
  showExternalLink = true,
  width = 325
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle embed load success
  const handleEmbedLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle embed load error
  const handleEmbedError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Validate TikTok URL format
  const isValidTikTokUrl = (tiktokUrl: string): boolean => {
    const tiktokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)/i;
    return tiktokRegex.test(tiktokUrl);
  };

  if (!isValidTikTokUrl(url)) {
    return (
      <div className={`bg-[#0a0a0a] border border-white/10 rounded-lg p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-medium mb-2">Invalid TikTok URL</h3>
            <p className="text-gray-400 text-sm mb-4">
              Please provide a valid TikTok video URL.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>Open Link</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`bg-[#0a0a0a] border border-white/10 rounded-lg p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-medium mb-2">Unable to Load Video</h3>
            <p className="text-gray-400 text-sm mb-4">
              The TikTok video could not be embedded. You can view it directly on TikTok.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>View on TikTok</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden ${className}`}>
      {/* Video Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">TikTok Video</h4>
            <p className="text-gray-400 text-sm">Embedded content</p>
          </div>
          {showExternalLink && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="text-sm">View on TikTok</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <Loader className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="text-gray-400">Loading TikTok video...</span>
          </div>
        </div>
      )}

      {/* TikTok Embed */}
      <div className="flex justify-center p-4">
        <ReactTikTokEmbed
          url={url}
          width={width}
          onLoad={handleEmbedLoad}
          onError={handleEmbedError}
        />
      </div>
    </div>
  );
};

export default TikTokEmbed;
