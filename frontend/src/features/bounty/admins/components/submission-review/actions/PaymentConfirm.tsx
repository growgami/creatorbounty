'use client';

import React, { useState } from 'react';
import { Check, Loader } from 'lucide-react';
import EnhancedToast from '@/components/shared/notifications/Toast';
import ConfettiAnimation from '@/components/effects/animations/ConfettiAnimation';
import { usePayments, type WalletValidationResult } from '@/features/bounty/admins/hooks/payment/usePushPayment';
import { paymentApi } from '@/services/wsgi/actions/paymentApi';

interface PaymentConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  submission?: {
    id: string;
    creator: string;
    avatar: string;
    submitted: string;
    status?: string;
    txHash?: string;
    url?: string;
    bountyId?: string;
  } | null;
  creatorWalletAddress?: string;
  paymentAmount?: number;
  onConfirm?: (txHash?: string, paymentAmount?: number) => void;
  onCancel?: () => void;
}

const PaymentConfirm: React.FC<PaymentConfirmProps> = ({
  isOpen,
  onClose,
  submission,
  creatorWalletAddress,
  paymentAmount = 0.000001,
  onConfirm,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>(paymentAmount.toString());
  
  // Toast state for error handling
  const [toastData, setToastData] = useState({
    isVisible: false,
    variant: 'error' as 'success' | 'error',
    message: ''
  });
  
  const { sendNativePayment, validateWallet, useWalletValidation } = usePayments();
  
  // Pre-validate wallet if we have submission info
  const { data: walletValidation, isLoading: validationLoading, error: validationError } = useWalletValidation(
    undefined, // userId (not available in current props)
    submission?.id // submissionId
  );
  
  // Use custom amount input by admin
  const PAYMENT_AMOUNT = parseFloat(customAmount) || 0;

  // Function to handle failed transactions with detailed error reporting
  const handlePaymentFailure = (error: unknown, context: string) => {
    let errorMessage = 'Transaction failed';
    let errorDetails = '';

    // Type guard to check if error has code property
    const hasCode = (err: unknown): err is { code: string | number; message?: string } => {
      return typeof err === 'object' && err !== null && 'code' in err;
    };

    // Type guard to check if error has message property
    const hasMessage = (err: unknown): err is { message: string } => {
      return typeof err === 'object' && err !== null && 'message' in err;
    };

    // Parse different types of blockchain/payment errors
    if (hasCode(error)) {
      switch (error.code) {
        case 4001:
          errorMessage = 'Transaction rejected by user';
          errorDetails = 'You cancelled the transaction in your wallet';
          break;
        case -32603:
          errorMessage = 'Internal JSON-RPC error';
          errorDetails = 'Network connection issue or node error';
          break;
        case 'INSUFFICIENT_FUNDS':
          errorMessage = 'Insufficient funds';
          errorDetails = 'Not enough balance to complete the transaction';
          break;
        case 'NETWORK_ERROR':
          errorMessage = 'Network error';
          errorDetails = 'Unable to connect to blockchain network';
          break;
        case 'GAS_LIMIT':
          errorMessage = 'Gas limit exceeded';
          errorDetails = 'Transaction requires more gas than available';
          break;
        default:
          errorMessage = `Transaction error (${error.code})`;
          errorDetails = error.message || 'Unknown blockchain error';
      }
    } else if (hasMessage(error)) {
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds';
        errorDetails = 'Not enough balance in wallet';
      } else if (error.message.includes('gas')) {
        errorMessage = 'Gas estimation failed';
        errorDetails = 'Unable to estimate transaction gas cost';
      } else if (error.message.includes('nonce')) {
        errorMessage = 'Nonce error';
        errorDetails = 'Transaction ordering issue - please try again';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Transaction timeout';
        errorDetails = 'Transaction took too long to process';
      } else {
        errorMessage = 'Transaction failed';
        errorDetails = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = 'Transaction failed';
      errorDetails = error.message;
    }

    // Show detailed error toast
    const fullErrorMessage = `${errorMessage} in ${context}${errorDetails ? `: ${errorDetails}` : ''}`;
    setToastData({
      isVisible: true,
      variant: 'error',
      message: fullErrorMessage
    });

    // Log detailed error for debugging
    console.error(`Payment failure in ${context}:`, {
      error,
      submissionId: submission?.id,
      timestamp: new Date().toISOString()
    });
  };

  // Function to hide toast
  const hideToast = () => {
    setToastData(prev => ({ ...prev, isVisible: false }));
  };

  const handleConfirmAction = async () => {
    setLoading(true);
    setLoadingText('Validating wallet address...');
    
    try {
      // Validate wallet address before proceeding with payment
      let validationResult: WalletValidationResult;
      
      if (walletValidation) {
        // Use cached validation if available
        validationResult = walletValidation;
      } else {
        // Perform fresh validation
        validationResult = await validateWallet(undefined, submission?.id);
      }
      
      if (!validationResult.isValid) {
        handlePaymentFailure(
          new Error(validationResult.error || 'User wallet validation failed'), 
          'wallet validation'
        );
        setLoading(false);
        return;
      }
      
      setLoadingText('Preparing transaction...');
      
      // Use validated wallet address (takes precedence over prop)
      const recipientAddress = validationResult.walletAddress || creatorWalletAddress;
      
      if (!recipientAddress) {
        handlePaymentFailure(new Error('No valid wallet address found'), 'payment preparation');
        setLoading(false);
        return;
      }
      
      // Send XPL tokens as bounty payment with validation
      const result = await sendNativePayment({
        recipient: recipientAddress,
        amount: PAYMENT_AMOUNT,
        submissionId: submission?.id,
        skipValidation: true // Skip validation since we already validated above
      });
      
      setLoadingText('Transaction sent... waiting for confirmation');
      
      // Poll for transaction status
      const maxRetries = 10;
      let retries = 0;
      
      while (retries < maxRetries) {
        try {
          const status = await paymentApi.getTransactionStatus(result.transaction_hash);
          // Type assertion to bypass TypeScript conflicts
          const statusValue = status.status as string;
          if (statusValue === 'success' || statusValue === 'confirmed') {
            setLoadingText('Transaction confirmed!');
            setShowConfetti(true);
            setTimeout(() => {
              setLoading(false);
              onConfirm?.(result.transaction_hash, PAYMENT_AMOUNT);
              onClose();
            }, 2000);
            return;
          } else if (statusValue === 'failed' || statusValue === 'error') {
            throw new Error('Transaction failed');
          }
          // If pending or not_found, continue polling
        } catch (err) {
          // Continue polling even if status check fails
          console.error('Status check error:', err);
          // If this is the last retry, show error
          if (retries === maxRetries - 1) {
            setLoading(false);
            handlePaymentFailure(err, 'transaction status check');
            return;
          }
        }
        
        retries++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // If we've exhausted retries, treat as timeout error
      setLoading(false);
      handlePaymentFailure(new Error('Transaction status check timeout'), 'transaction confirmation');
      
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      handlePaymentFailure(error, 'payment processing');
      // Don't close the modal on error, let user try again
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  // Format number with k/M/B suffixes to keep button width consistent
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  // Reset confetti state and update amount when modal is opened/closed
  React.useEffect(() => {
    if (!isOpen) {
      setShowConfetti(false);
    } else {
      // Reset to default amount when modal opens
      setCustomAmount(paymentAmount.toString());
    }
  }, [isOpen, paymentAmount]);

  if (!isOpen) return null;

  return (
    <>
      <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleCancel}
        />
        <div className="relative w-full max-w-md">
          <div className="bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
            {!loading ? (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    <Check className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white font-space-grotesk">
                    Confirm Payment
                  </h3>
                </div>
                <p className="text-white/80 mb-4 leading-relaxed font-space-grotesk">
                  Approve this submission and pay to <span className="font-semibold text-cyan-400">{submission?.creator || 'this creator'}</span>:
                </p>
                
                {/* Wallet validation status */}
                <div className="mb-4 p-3 bg-black/20 border border-white/10 rounded-lg">
                  {validationLoading && (
                    <p className="text-sm text-yellow-400 font-space-grotesk flex items-center">
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Validating wallet address...
                    </p>
                  )}
                  {validationError && (
                    <p className="text-sm text-red-400 font-space-grotesk">
                      ⚠️ Wallet validation failed
                    </p>
                  )}
                  {walletValidation && !walletValidation.isValid && (
                    <div className="text-sm text-red-400 font-space-grotesk">
                      <p className="mb-1">⚠️ Payment not possible:</p>
                      <p className="text-xs">{walletValidation.error}</p>
                    </div>
                  )}
                  {walletValidation && walletValidation.isValid && (
                    <div className="text-sm text-green-400 font-space-grotesk">
                      <p className="mb-1">✓ Wallet verified</p>
                      <p className="text-xs text-gray-400 break-all">
                        {walletValidation.walletAddress}
                      </p>
                    </div>
                  )}
                  {!validationLoading && !walletValidation && creatorWalletAddress && (
                    <p className="text-sm text-gray-400 font-space-grotesk break-all">
                      Recipient: {creatorWalletAddress}
                    </p>
                  )}
                </div>
                
                {/* Payment Amount Input */}
                <div className="mb-6">
                  <label htmlFor="paymentAmount" className="block text-sm font-medium text-white mb-2 font-space-grotesk">
                    Payment Amount (XPL)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-space-grotesk text-sm">
                      XPL
                    </span>
                    <input
                      type="number"
                      id="paymentAmount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      step="0.000001"
                      min="0"
                      className="w-full bg-black/20 border border-white/20 rounded-lg pl-12 pr-4 py-3 text-white font-space-grotesk focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      placeholder="0.000001"
                      disabled={loading}
                    />
                  </div>
                  {parseFloat(customAmount) <= 0 && (
                    <p className="text-red-400 text-sm mt-1 font-space-grotesk">
                      Amount must be greater than 0
                    </p>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 border border-white/20 py-3 px-6 rounded-full font-medium hover:bg-white/5 transition-colors text-white font-space-grotesk"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    disabled={
                      loading || 
                      parseFloat(customAmount) <= 0 || 
                      validationLoading ||
                      (walletValidation && !walletValidation.isValid)
                    }
                    className="flex-1 bg-cyan-500 text-white py-4 px-6 rounded-full font-medium hover:bg-cyan-600 transition-colors font-space-grotesk disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold w-20 text-center">
                        {parseFloat(customAmount) > 0 ? `${formatNumber(parseFloat(customAmount))} XPL` : '0 XPL'}
                      </span>
                      <span className="text-sm opacity-80">
                        Confirm & Pay
                      </span>
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Loader className="animate-spin w-8 h-8 text-cyan-400 mx-auto mb-4" />
                <p className="text-gray-300 font-space-grotesk">{loadingText}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Confetti Animation */}
      <ConfettiAnimation 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      {/* Enhanced Toast for Error Messages */}
      <EnhancedToast
        isVisible={toastData.isVisible}
        variant={toastData.variant}
        message={toastData.message}
        onHide={hideToast}
      />
    </>
  );
};

export default PaymentConfirm;