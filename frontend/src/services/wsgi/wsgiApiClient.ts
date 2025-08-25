/**
 * Core API Service Layer
 * Handles HTTP request utilities and common types
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types for API responses
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface PaymentRequest {
  recipient: string; // Matches backend parameter name
  amount: number; // Backend expects number, not string
  token_address?: string; // Optional for ERC-20 tokens
}

export interface TransactionStatus {
  status: 'success' | 'failed' | 'pending' | 'not_found' | string;
  transaction_hash: string;
  block_number?: number;
  confirmations?: number;
  gas_used?: number;
  gas_price?: string;
  from_address?: string;
  to_address?: string;
  from?: string;
  to?: string;
  value: string;
}

export interface Balance {
  native_balance: string;
  token_balances: Record<string, string>;
}

// Generic API error handling
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { ApiError };

