import React, { useState, useEffect } from 'react';
import { X, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { SubmissionFormData, ValidationResult, Requirement } from '../types/types';
import Button from '@/components/ui/Buttons';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmissionFormData) => Promise<void>;
  requirements: Requirement[];
  campaignTitle: string;
}

/**
 * Submission Modal Component
 * Allows creators to submit their TikTok content for bounty campaigns
 */
const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  requirements,
  campaignTitle
}) => {
  const [formData, setFormData] = useState<SubmissionFormData>({
    tiktokUrl: '',
    agreedToTerms: false
  });
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: false,
    errors: [],
    warnings: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ tiktokUrl: '', agreedToTerms: false });
      setValidation({ isValid: false, errors: [], warnings: [] });
      setIsSubmitting(false);
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  // Validate TikTok URL
  const validateTikTokUrl = (url: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!url.trim()) {
      errors.push('TikTok URL is required');
    } else {
      // Basic TikTok URL validation
      const tiktokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)/i;
      if (!tiktokRegex.test(url)) {
        errors.push('Please enter a valid TikTok URL');
      }
    }

    if (!formData.agreedToTerms) {
      errors.push('You must agree to the terms and conditions');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, tiktokUrl: url }));
    
    // Validate on change
    const validationResult = validateTikTokUrl(url);
    setValidation(validationResult);
  };

  // Handle terms checkbox change
  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const agreed = e.target.checked;
    setFormData(prev => ({ ...prev, agreedToTerms: agreed }));
    
    // Re-validate
    const validationResult = validateTikTokUrl(formData.tiktokUrl);
    setValidation(validationResult);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalValidation = validateTikTokUrl(formData.tiktokUrl);
    setValidation(finalValidation);
    
    if (!finalValidation.isValid) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Submission failed:', error);
      setValidation({
        isValid: false,
        errors: ['Submission failed. Please try again.'],
        warnings: []
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="transition-all duration-300 ease-in-out rounded-2xl relative overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
        
        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Submit Your Entry</h2>
            <p className="text-sm text-gray-400 mt-1">{campaignTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Success State */}
        {submitSuccess && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Submission Successful!</h3>
            <p className="text-gray-400">Your entry has been submitted for review. You&apos;ll be notified once it&apos;s processed.</p>
          </div>
        )}

        {/* Form Content */}
        {!submitSuccess && (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Requirements Checklist */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Requirements Checklist</h3>
              <div className="bg-[#0a0a0a] border border-white/5 rounded-lg p-4">
                <div className="space-y-2">
                  {requirements.map((req) => (
                    <div key={req.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0" />
                      <span className="text-sm text-gray-300">{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TikTok URL Input */}
            <div className="mb-6">
              <label htmlFor="tiktok-url" className="block text-sm font-medium text-white mb-2">
                TikTok Video URL *
              </label>
              <div className="relative">
                <input
                  id="tiktok-url"
                  type="url"
                  value={formData.tiktokUrl}
                  onChange={handleUrlChange}
                  placeholder="https://www.tiktok.com/@username/video/..."
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {validation.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {validation.errors.map((error, index) => (
                    <div key={index} className="flex items-center space-x-2 text-red-400 text-sm">
                      <AlertCircle size={14} />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="mb-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={handleTermsChange}
                  className="mt-1 w-4 h-4 text-blue-600 bg-[#0a0a0a] border-white/10 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-300">
                  I confirm that my content meets all requirements and I agree to the{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 underline">
                    terms and conditions
                  </a>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                size="md"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!validation.isValid || isSubmitting}
                variant="primary"
                size="md"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Entry'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubmissionModal;
