import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface CancelSubscriptionSectionProps {
  onCancelClick: () => void;
  isPendingCancellation?: boolean;
  cancellationDate?: string;
  onReactivate?: () => void;
}

export default function CancelSubscriptionSection({
  onCancelClick,
  isPendingCancellation = false,
  cancellationDate = 'February 18, 2026',
  onReactivate,
}: CancelSubscriptionSectionProps) {
  const [isReactivating, setIsReactivating] = useState(false);

  const handleReactivate = async () => {
    setIsReactivating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsReactivating(false);
    onReactivate?.();
  };

  return isPendingCancellation ? (
    <div className="border border-red-200 rounded-xl p-5 bg-gradient-to-br from-red-50 to-red-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-gray-900">Cancellation Pending</h4>
        <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Ending Soon
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Your subscription will end on{' '}
        <span className="font-semibold text-red-700">{cancellationDate}</span>. After this date, you'll lose access to
        premium features.
      </p>
      <div className="border border-red-200 rounded-lg p-4 mb-4 bg-white/60">
        <p className="text-sm font-medium text-gray-900 mb-3">What you'll lose:</p>
        <ul className="space-y-2">
          <li className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-red-500">✕</span>
            100,000 monthly credits (reduced to 10,000)
          </li>
          <li className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-red-500">✕</span>
            Priority support
          </li>
          <li className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-red-500">✕</span>
            Advanced analytics
          </li>
          <li className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-red-500">✕</span>
            White-label options
          </li>
        </ul>
      </div>
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          className="bg-brand-green hover:bg-brand-green/90 text-white gap-2"
          onClick={handleReactivate}
          disabled={isReactivating}
        >
          <RotateCcw className={`w-4 h-4 ${isReactivating ? 'animate-spin' : ''}`} />
          {isReactivating ? 'Reactivating...' : 'Reactivate Subscription'}
        </Button>
        <span className="text-sm text-gray-500">Access continues until {cancellationDate}</span>
      </div>
    </div>
  ) : (
    <div className="border border-red-200 rounded-xl p-5 bg-gradient-to-br from-red-50 to-red-100">
      <h4 className="text-base font-semibold text-gray-900 mb-2">Cancel Subscription</h4>
      <p className="text-sm text-gray-600 mb-4">
        If you cancel your subscription, you'll lose access to all premium features at the end of your current billing
        period. Your account will be downgraded to the free plan.
      </p>
      <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-white/60">
        <p className="text-sm font-medium text-gray-900 mb-3">What you'll lose:</p>
        <ul className="space-y-2">
          <li className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-red-500">✕</span>
            100,000 monthly credits (reduced to 10,000)
          </li>
          <li className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-red-500">✕</span>
            Priority support
          </li>
          <li className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-red-500">✕</span>
            Advanced analytics
          </li>
          <li className="text-sm text-gray-600 flex items-center gap-2">
            <span className="text-red-500">✕</span>
            White-label options
          </li>
        </ul>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="destructive" size="sm" onClick={onCancelClick}>
          Cancel Subscription
        </Button>
        <span className="text-sm text-gray-500">Access continues until Feb 1, 2026</span>
      </div>
    </div>
  );
}
