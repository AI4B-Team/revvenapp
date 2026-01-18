import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, Users, Package, ExternalLink, Settings, Info, LayoutGrid, Plus, UserPlus, AlertTriangle, RotateCcw, Calendar } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import CreditsPackModal from './CreditsPackModal';
import { useNavigate } from 'react-router-dom';

interface SubscriptionOverviewProps {
  onCancelClick: () => void;
  isPendingCancellation?: boolean;
  cancellationDate?: string;
  onReactivate?: () => void;
}

export default function SubscriptionOverview({ 
  onCancelClick, 
  isPendingCancellation = false,
  cancellationDate = 'February 18, 2026',
  onReactivate
}: SubscriptionOverviewProps) {
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const navigate = useNavigate();

  // Mock data
  const planData = {
    name: 'Pro',
    price: 47,
    billingCycle: 'month',
  };

  const creditsData = {
    packs: 2,
    pricePerPack: 15,
  };

  const seatsData = {
    total: 3,
    used: 2,
  };

  const workspacesData = {
    total: 3,
    used: 2,
  };

  const teamCredits = {
    used: 10000,
    total: 98000,
    refillDate: 'Jan 18',
  };

  const creditPercentage = (teamCredits.used / teamCredits.total) * 100;

  const handleReactivate = async () => {
    setIsReactivating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsReactivating(false);
    onReactivate?.();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header with Manage Billing */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            Manage Billing
          </Button>
        </div>

        {/* Subscription Cards Container */}
        <div className="border border-gray-200 rounded-xl p-5 space-y-4">
          {/* Top Row - Current Plan & Credits Pack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Plan Card - Conditionally styled based on cancellation status */}
            {isPendingCancellation ? (
              <div className="border-2 border-amber-400 rounded-xl p-5 bg-gradient-to-br from-amber-50 to-orange-50 relative">
                <div className="absolute top-3 right-3">
                  <span className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Canceling
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-700 mb-3">
                  <Calendar className="w-4 h-4" />
                  Subscription Ending
                </div>
                <div className="mb-1">
                  <span className="text-2xl font-bold text-gray-900">{planData.name}</span>
                </div>
                <p className="text-sm text-amber-700 mb-2">
                  Access until <span className="font-semibold">{cancellationDate}</span>
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  After this date, your account will be downgraded to the Free plan with limited features.
                </p>
                <div className="bg-white/60 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Changed your mind?</span> You can reactivate your subscription anytime before {cancellationDate}.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white gap-2"
                  onClick={handleReactivate}
                  disabled={isReactivating}
                >
                  <RotateCcw className={`w-4 h-4 ${isReactivating ? 'animate-spin' : ''}`} />
                  {isReactivating ? 'Reactivating...' : 'Reactivate Subscription'}
                </Button>
              </div>
            ) : (
              <div className="border-2 border-brand-green rounded-xl p-5 bg-gradient-to-br from-brand-green/5 to-brand-green/10 relative">
                <div className="absolute top-3 right-3">
                  <span className="bg-brand-green text-white text-xs font-medium px-2 py-1 rounded-full">Current</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Zap className="w-4 h-4 text-brand-green" />
                  Current Plan
                </div>
                <div className="mb-1">
                  <span className="text-2xl font-bold text-gray-900">{planData.name}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  ${planData.price}/Month
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-brand-green hover:bg-brand-green/90 text-white"
                    onClick={() => navigate('/pricing')}
                  >
                    Change Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onCancelClick}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Credits Pack Card - Different color */}
            <div className="border border-amber-200 rounded-xl p-5 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center gap-2 text-sm text-amber-700 mb-3">
                <Package className="w-4 h-4" />
                Credits Pack
              </div>
              <div className="mb-1">
                <span className="text-2xl font-bold text-gray-900">{creditsData.packs} Packs</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                ${creditsData.pricePerPack}/Pack/Month
              </p>
              <Button 
                size="sm" 
                className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                onClick={() => setIsCreditsModalOpen(true)}
                disabled={isPendingCancellation}
              >
                Add Credits Pack
              </Button>
            </div>
          </div>

          {/* Bottom Row - Workspaces & Seats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Workspaces Card - First */}
            <div className="border border-gray-400 rounded-xl p-5 bg-white">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <LayoutGrid className="w-4 h-4" />
                <span>Spaces</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Separate environments for different projects or clients</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="mb-1">
                <span className="text-2xl font-bold text-gray-900">{workspacesData.total}</span>
              </div>
              <div className="mb-4">
                <Progress value={(workspacesData.used / workspacesData.total) * 100} className="h-1.5 mb-1 [&>div]:bg-brand-green" />
                <p className="text-xs text-gray-500">{workspacesData.used} of {workspacesData.total} Spaces In Use</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Settings className="w-4 h-4" />
                  Manage Spaces
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2" disabled={isPendingCancellation}>
                  <Plus className="w-4 h-4" />
                  Add Space
                </Button>
              </div>
            </div>

            {/* Seats Card */}
            <div className="border border-gray-400 rounded-xl p-5 bg-white">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Users className="w-4 h-4" />
                <span>Seats</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of team members who can access your workspace</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="mb-1">
                <span className="text-2xl font-bold text-gray-900">{seatsData.total}</span>
              </div>
              <div className="mb-4">
                <Progress value={(seatsData.used / seatsData.total) * 100} className="h-1.5 mb-1 [&>div]:bg-brand-green" />
                <p className="text-xs text-gray-500">{seatsData.used} of {seatsData.total} Seats Being Used</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Settings className="w-4 h-4" />
                  Manage Seats
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2" disabled={isPendingCancellation}>
                  <UserPlus className="w-4 h-4" />
                  Invite Members
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Team Shared Credits - Different background color */}
        <div className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-brand-blue/5 to-brand-blue/10">
          <h4 className="text-base font-semibold text-gray-900 mb-4">Team Shared Credits</h4>
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                Credits Left
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-green" />
                <span className="text-xl font-bold text-brand-green">
                  {teamCredits.used.toLocaleString()}/{teamCredits.total.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {isPendingCancellation 
                  ? `Use your remaining credits before ${cancellationDate}.`
                  : <>Your monthly credits will be refilled on {teamCredits.refillDate}.{' '}
                    <span className="text-brand-green cursor-pointer hover:underline">Read More</span></>
                }
              </p>
            </div>
            <Button 
              className="bg-brand-green hover:bg-brand-green/90 text-white"
              onClick={() => setIsCreditsModalOpen(true)}
              disabled={isPendingCancellation}
            >
              Add Credits
            </Button>
          </div>
          
          {/* Credits Progress Bar - Green */}
          <div className="mt-4">
            <Progress value={creditPercentage} className="h-2 [&>div]:bg-brand-green" />
          </div>
        </div>
      </div>

      <CreditsPackModal 
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
        currentPacks={creditsData.packs}
      />
    </>
  );
}