import React, { useState } from 'react';
import { BountyCreationRequest } from '@/models/Bounty';
import { useCreateBounty } from '@/features/bounty/admins/hooks/bounty-actions/useCreateBounty';
import InputField from '../forms/InputField';
import Button from '@/components/shared/ui/Buttons';

interface BountyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  bountyPool: string;
  tokenSymbol: string;
  totalSubmissions: string;
  endDate: string;
  requirements: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  bountyPool?: string;
  tokenSymbol?: string;
  totalSubmissions?: string;
  endDate?: string;
}

const BountyForm: React.FC<BountyFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const mutation = useCreateBounty();
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    bountyPool: '',
    tokenSymbol: '',
    totalSubmissions: '',
    endDate: '',
    requirements: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.bountyPool || parseFloat(formData.bountyPool) <= 0) {
      newErrors.bountyPool = 'Bounty pool must be greater than 0';
    }

    if (!formData.tokenSymbol.trim()) {
      newErrors.tokenSymbol = 'Token symbol is required';
    }

    if (!formData.totalSubmissions || parseInt(formData.totalSubmissions) <= 0) {
      newErrors.totalSubmissions = 'Total submissions must be greater than 0';
    }

    if (formData.endDate) {
      const endDate = new Date(formData.endDate);
      const now = new Date();
      if (endDate <= now) {
        newErrors.endDate = 'End date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const bountyData: BountyCreationRequest = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      bountyPool: parseFloat(formData.bountyPool),
      tokenSymbol: formData.tokenSymbol.trim(),
      totalSubmissions: parseInt(formData.totalSubmissions),
      status: 'active', // Always set to active when creating
      endDate: formData.endDate || undefined,
      requirements: formData.requirements.trim() 
        ? formData.requirements.split('\n').map(req => req.trim()).filter(req => req.length > 0)
        : undefined
    };

    mutation.mutate(bountyData, {
      onSuccess: () => {
        onSuccess?.();
        handleClose();
      }
    });
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      bountyPool: '',
      tokenSymbol: '',
      totalSubmissions: '',
      endDate: '',
      requirements: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative bg-black/70 backdrop-blur-md rounded-2xl p-6 border border-zinc-800/40 shadow-lg"
          style={{
            backgroundImage: 'url(https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/2fdcc9de-94c9-4f1c-80d4-900440428d32_800w.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay',
            filter: 'contrast(1.1)',
          }}>
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Create New Bounty</h2>
            <p className="text-white/70">Fill in the details to create a new bounty campaign</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Bounty Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter bounty title"
              required
              error={errors.title}
            />

            <InputField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the bounty requirements and objectives"
              required
              multiline
              rows={4}
              error={errors.description}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Bounty Pool"
                name="bountyPool"
                type="number"
                value={formData.bountyPool}
                onChange={handleInputChange}
                placeholder="0.00"
                required
                min={0}
                step={0.01}
                error={errors.bountyPool}
              />

              <InputField
                label="Token Symbol"
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleInputChange}
                placeholder="e.g., USDC, ETH"
                required
                error={errors.tokenSymbol}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Total Submissions"
                name="totalSubmissions"
                type="number"
                value={formData.totalSubmissions}
                onChange={handleInputChange}
                placeholder="Enter total number of submissions allowed"
                required
                min={1}
                error={errors.totalSubmissions}
              />

              <InputField
                label="End Date (Optional)"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleInputChange}
                error={errors.endDate}
              />
            </div>

            <InputField
              label="Requirements (Optional)"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder="Enter each requirement on a new line"
              multiline
              rows={3}
            />

            {/* Error Display */}
            {mutation.isError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">{(mutation.error as Error)?.message || 'An error occurred while creating the bounty'}</p>
              </div>
            )}

            {/* Success Display */}
            {mutation.isSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-green-400 text-sm">Bounty created successfully!</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={mutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending}
                className="flex-1"
              >
                {mutation.isPending ? 'Creating...' : 'Create Bounty'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BountyForm;