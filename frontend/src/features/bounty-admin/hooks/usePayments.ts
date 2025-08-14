'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaymentRequest, TransactionStatus, Balance, ApiError } from '@/services/wsgi-api/wsgiApiClient';
import { paymentApi } from '@/services/wsgi-api/paymentApi';

export const usePayments = () => {
  const queryClient = useQueryClient();

  // Mutation for sending native payments
  const sendNativePaymentMutation = useMutation({
    mutationFn: (paymentData: PaymentRequest) => paymentApi.sendNativePayment(paymentData),
    onSuccess: () => {
      // Invalidate and refetch balance after successful payment
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });

  // Mutation for sending token payments
  const sendTokenPaymentMutation = useMutation({
    mutationFn: (paymentData: PaymentRequest) => paymentApi.sendTokenPayment(paymentData),
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

  return {
    // Mutations
    sendNativePayment: sendNativePaymentMutation.mutateAsync,
    sendTokenPayment: sendTokenPaymentMutation.mutateAsync,
    isSending: sendNativePaymentMutation.isPending || sendTokenPaymentMutation.isPending,
    sendError: sendNativePaymentMutation.error || sendTokenPaymentMutation.error,
    
    // Queries
    useTransactionStatus,
    useBalance,
    useHealthCheck,
    
    // Manual refetch
    refetchBalance: () => queryClient.invalidateQueries({ queryKey: ['balance'] }),
  };
};
