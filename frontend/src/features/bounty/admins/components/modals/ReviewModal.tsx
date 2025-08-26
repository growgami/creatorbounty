'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ExternalLink, CheckCircle, Loader } from 'lucide-react';
import { ModalDrop } from '@/components/effects/animations/FadeInTransition';
import ConfettiAnimation from '../../../../../components/effects/animations/ConfettiAnimation';
import ConfirmationModal from '@/features/bounty/admins/components/modals/ConfirmationModal';
import EnhancedToast from '@/components/shared/notifications/Toast';
import { usePayments } from '@/features/bounty/admins/hooks/usePayments';
import { paymentApi } from '@/services/wsgi/actions/paymentApi';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission?: {
    id: string;
    creator: string;
    avatar: string;
    submitted: string;
    status?: string;
    txHash?: string;
  } | null;
  onConfirm?: (txHash?: string) => void;
  onReject?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  submission,
  onConfirm,
  onReject
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);
  
  // Toast state for error handling
  const [toastData, setToastData] = useState({
    isVisible: false,
    variant: 'error' as 'success' | 'error',
    message: ''
  });
  
  const { sendNativePayment } = usePayments();
  
  // Payment amount constant
  const PAYMENT_AMOUNT = 0.0000000000000000000000000000000000000000001;

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

  const handleConfirm = () => {
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setLoadingText('Preparing transaction...');
    
    try {
      // In a real implementation, we would get the recipient address from the submission data
      // For now, using a placeholder address - this would need to be replaced with actual creator wallet address
      const recipientAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Placeholder
      
      // Send XPL tokens as bounty payment
      const result = await sendNativePayment({
        recipient: recipientAddress,
        amount: PAYMENT_AMOUNT
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
              onConfirm?.(result.transaction_hash);
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

  const handleReject = () => {
    setShowRejectConfirmation(true);
  };

  const handleRejectAction = () => {
    setShowRejectConfirmation(false);
    onReject?.();
    setShowConfetti(false);
    onClose();
  };

  const handleRejectCancel = () => {
    setShowRejectConfirmation(false);
  };

  // Reset confetti state when modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      setShowConfetti(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <ModalDrop className="bg-[#101010] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
        {!loading ? (
          <div className="flex h-[80vh]">
            {/* Video Section */}
            <div className="w-2/5 bg-black flex items-center justify-center rounded-l-2xl">
              <div className="text-white text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 opacity-70">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10,8 16,12 10,16 10,8"></polygon>
                </svg>
                <p className="text-sm opacity-70 font-space-grotesk">TikTok Video Player</p>
              </div>
            </div>

            {/* Content Section */}
            <div className="w-3/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Image 
                    src={submission?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'} 
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    alt="Creator avatar"
                  />
                  <div>
                    <p className="font-medium text-white font-space-grotesk">{submission?.creator || '@creator_username'}</p>
                    <p className="text-sm text-gray-400 font-space-grotesk">Submitted {submission?.submitted || '2 hours ago'}</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4 text-white font-space-grotesk">Verification Checklist</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-cyan-400" strokeWidth={1.8} />
                      <span className="text-sm text-gray-300 font-space-grotesk">Contains hashtag #PlasmaTestnet</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-cyan-400" strokeWidth={1.8} />
                      <span className="text-sm text-gray-300 font-space-grotesk">Length ≥ 10 seconds</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-cyan-400" strokeWidth={1.8} />
                      <span className="text-sm text-gray-300 font-space-grotesk">Account age ≥ 30 days</span>
                    </div>
                  </div>
                </div>

                <div>
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium font-space-grotesk flex items-center gap-1">
                    View on TikTok <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button 
                  onClick={handleConfirm}
                  className="flex-1 bg-cyan-500 text-white py-3 px-6 rounded-full font-medium hover:bg-cyan-600 transition-colors font-space-grotesk"
                >
                  Confirm & Pay
                </button>
                <button 
                  onClick={handleReject}
                  className="flex-1 border border-white/20 py-3 px-6 rounded-full font-medium hover:bg-white/5 transition-colors text-white font-space-grotesk"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center h-[80vh] flex flex-col items-center justify-center">
            <Loader className="animate-spin w-8 h-8 text-cyan-400 mx-auto mb-4" />
            <p className="text-gray-300 font-space-grotesk">{loadingText}</p>
          </div>
        )}
        
        {/* Confetti Animation */}
        <ConfettiAnimation 
          isActive={showConfetti} 
          onComplete={() => setShowConfetti(false)} 
        />
        
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          title="Confirm Payment"
          message={`Are you sure you want to approve this submission and pay ${PAYMENT_AMOUNT} XPL to ${submission?.creator || 'this creator'}?`}
          confirmText="Confirm & Pay"
          cancelText="Cancel"
          type="approve"
          isLoading={loading}
          onConfirm={handleConfirmAction}
          onCancel={() => setShowConfirmation(false)}
        />
        
        {/* Reject Confirmation Modal */}
        <ConfirmationModal
          isOpen={showRejectConfirmation}
          title="Reject Submission"
          message={`Are you sure you want to reject this submission from ${submission?.creator || 'this creator'}? This action cannot be undone.`}
          confirmText="Reject Submission"
          cancelText="Cancel"
          type="reject"
          onConfirm={handleRejectAction}
          onCancel={handleRejectCancel}
        />

        {/* Enhanced Toast for Error Messages */}
        <EnhancedToast
          isVisible={toastData.isVisible}
          variant={toastData.variant}
          message={toastData.message}
          onHide={hideToast}
        />
      </ModalDrop>
    </div>
  );
};

export default ReviewModal;
