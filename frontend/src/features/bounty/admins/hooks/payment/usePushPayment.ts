'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaymentRequest, TransactionStatus, Balance, ApiError } from '@/services/wsgi/wsgiApiClient';
import { paymentApi } from '@/services/wsgi/actions/paymentApi';

// Enhanced PaymentRequest with user validation
interface ValidatedPaymentRequest extends PaymentRequest {
  userId?: string;
  submissionId?: string;
}

// Wallet validation result
interface WalletValidationResult {
  isValid: boolean;
  walletAddress?: string;
  userId?: string;
  error?: string;
}

// Enhanced payment request with validation
interface EnhancedPaymentRequest {
  recipient: string;
  amount: number;
  token_address?: string;
  userId?: string;
  submissionId?: string;
  skipValidation?: boolean; // For direct payments where validation is already done
}

/**
 * Validates user wallet address before payment
 */
const validateUserWallet = async (userId?: string, submissionId?: string): Promise<WalletValidationResult> => {
  try {
    if (userId) {
      // Direct user ID validation
      const response = await fetch(`/api/user/wallet?userId=${userId}`);
      if (!response.ok) {
        return { isValid: false, error: 'Failed to fetch user wallet information' };
      }
      const data = await response.json();
      
      if (!data.wallet_address || data.wallet_address.trim() === '') {
        return { 
          isValid: false, 
          error: 'User has not set their wallet address yet',
          userId 
        };
      }
      
      return { 
        isValid: true, 
        walletAddress: data.wallet_address,
        userId 
      };
    }
    
    if (submissionId) {
      // Validate via submission JOIN with user table
      const response = await fetch(`/api/submissions?submissionId=${submissionId}`);
      if (!response.ok) {
        return { isValid: false, error: 'Failed to fetch submission information' };
      }
      const data = await response.json();
      
      if (!data.submissions || data.submissions.length === 0) {
        return { isValid: false, error: 'Submission not found' };
      }
      
      const submission = data.submissions[0];
      if (!submission.creator_wallet_address || submission.creator_wallet_address.trim() === '') {
        return { 
          isValid: false, 
          error: `Creator ${submission.creator} has not set their wallet address yet`,
          userId: submission.creator_id 
        };
      }
      
      return { 
        isValid: true, 
        walletAddress: submission.creator_wallet_address,
        userId: submission.creator_id 
      };
    }
    
    return { isValid: false, error: 'No user ID or submission ID provided for validation' };
  } catch (error) {
    console.error('Wallet validation error:', error);
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    };
  }
};

export const usePayments = () => {
  const queryClient = useQueryClient();

  // Enhanced mutation for sending native payments with validation
  const sendNativePaymentMutation = useMutation({
    mutationFn: async (paymentData: EnhancedPaymentRequest) => {
      // Skip validation if explicitly requested (for direct payments where validation is already done)
      if (!paymentData.skipValidation) {
        const validation = await validateUserWallet(paymentData.userId, paymentData.submissionId);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Wallet validation failed');
        }
        
        // Ensure the recipient matches the validated wallet address
        if (validation.walletAddress && paymentData.recipient !== validation.walletAddress) {
          console.warn('Recipient address mismatch, using validated wallet address');
          paymentData.recipient = validation.walletAddress;
        }
      }
      
      // Convert to standard PaymentRequest format
      const standardPaymentData: PaymentRequest = {
        recipient: paymentData.recipient,
        amount: paymentData.amount,
        token_address: paymentData.token_address
      };
      
      return paymentApi.sendNativePayment(standardPaymentData);
    },
    onSuccess: () => {
      // Invalidate and refetch balance after successful payment
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });

  // Enhanced mutation for sending token payments with validation
  const sendTokenPaymentMutation = useMutation({
    mutationFn: async (paymentData: EnhancedPaymentRequest) => {
      // Skip validation if explicitly requested
      if (!paymentData.skipValidation) {
        const validation = await validateUserWallet(paymentData.userId, paymentData.submissionId);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Wallet validation failed');
        }
        
        // Ensure the recipient matches the validated wallet address
        if (validation.walletAddress && paymentData.recipient !== validation.walletAddress) {
          console.warn('Recipient address mismatch, using validated wallet address');
          paymentData.recipient = validation.walletAddress;
        }
      }
      
      // Convert to standard PaymentRequest format
      const standardPaymentData: PaymentRequest = {
        recipient: paymentData.recipient,
        amount: paymentData.amount,
        token_address: paymentData.token_address
      };
      
      return paymentApi.sendTokenPayment(standardPaymentData);
    },
    onSuccess: () => {
      // Invalidate and refetch balance after successful payment
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });

  // Query for transaction status
  const useTransactionStatus = (txHash: string) => {
    return useQuery<TransactionStatus, ApiError>({
      queryKey: ['transactionStatus', txHash],
      queryFn: () => paymentApi.getTransactionStatus(txHash),
      enabled: !!txHash,
    });
  };

  // Query for balance
  const useBalance = () => {
    return useQuery<Balance, ApiError>({
      queryKey: ['balance'],
      queryFn: () => paymentApi.getBalance(),
    });
  };

  // Query for health check
  const useHealthCheck = () => {
    return useQuery({
      queryKey: ['paymentHealth'],
      queryFn: () => paymentApi.healthCheck(),
    });
  };

  // Query for wallet validation (useful for pre-validation)
  const useWalletValidation = (userId?: string, submissionId?: string) => {
    return useQuery<WalletValidationResult, ApiError>({
      queryKey: ['walletValidation', userId, submissionId],
      queryFn: () => validateUserWallet(userId, submissionId),
      enabled: !!(userId || submissionId),
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  };

  return {
    // Enhanced Mutations with validation
    sendNativePayment: sendNativePaymentMutation.mutateAsync,
    sendTokenPayment: sendTokenPaymentMutation.mutateAsync,
    isSending: sendNativePaymentMutation.isPending || sendTokenPaymentMutation.isPending,
    sendError: sendNativePaymentMutation.error || sendTokenPaymentMutation.error,
    
    // Validation utilities
    validateWallet: validateUserWallet,
    useWalletValidation,
    
    // Queries
    useTransactionStatus,
    useBalance,
    useHealthCheck,
    
    // Manual refetch
    refetchBalance: () => queryClient.invalidateQueries({ queryKey: ['balance'] }),
  };
};

// Export types for external use
export type { 
  EnhancedPaymentRequest, 
  WalletValidationResult, 
  ValidatedPaymentRequest 
};
