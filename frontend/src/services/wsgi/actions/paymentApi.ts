import { apiRequest } from '../wsgiApiClient';
import { PaymentRequest, TransactionStatus, Balance } from '../wsgiApiClient';

// Payment API methods
export const paymentApi = {
  async sendNativePayment(paymentData: PaymentRequest): Promise<{ transaction_hash: string }> {
    return apiRequest<{ transaction_hash: string }>('/api/payment/send-native', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  async sendTokenPayment(paymentData: PaymentRequest): Promise<{ transaction_hash: string }> {
    return apiRequest<{ transaction_hash: string }>('/api/payment/send-token', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    return apiRequest<TransactionStatus>(`/api/payment/transaction-status/${txHash}`);
  },

  async getBalance(): Promise<Balance> {
    return apiRequest<Balance>('/api/payment/balance');
  },

  async healthCheck(): Promise<{ status: string; network: string }> {
    return apiRequest<{ status: string; network: string }>('/api/payment/health');
  },
};

export type { PaymentRequest, TransactionStatus, Balance };
