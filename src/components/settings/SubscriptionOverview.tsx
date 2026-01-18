import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Users, Package, ExternalLink, Settings, Info } from 'lucide-react';
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
}

export default function SubscriptionOverview({ onCancelClick }: SubscriptionOverviewProps) {
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Mock data
  const planData = {
    name: 'Pro',
    price: 49,
    billingCycle: 'month',
  };

  const creditsData = {
    packs: 2,
    pricePerPack: 15,
  };

  const seatsData = {
    total: 4,
    used: 3,
  };

  const teamCredits = {
    used: 62333,
    total: 98000,
    refillDate: 'Jan 18',
  };

  const creditPercentage = (teamCredits.used / teamCredits.total) * 100;

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

        {/* Three Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Plan Card */}
          <div className="border border-gray-300 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Zap className="w-4 h-4" />
              Current Plan
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold text-gray-900">{planData.name}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              ${planData.price}/{planData.billingCycle}
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

          {/* Credits Pack Card */}
          <div className="border border-gray-300 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <Package className="w-4 h-4" />
              Credits Pack
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold text-gray-900">{creditsData.packs} packs</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              ${creditsData.pricePerPack}/Pack/month
            </p>
            <Button 
              size="sm" 
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
              onClick={() => setIsCreditsModalOpen(true)}
            >
              Add Credits Pack
            </Button>
          </div>

          {/* Seats Card */}
          <div className="border border-gray-300 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50">
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
              <Progress value={(seatsData.used / seatsData.total) * 100} className="h-1.5 mb-1" />
              <p className="text-xs text-gray-500">{seatsData.used} of {seatsData.total} seats being used</p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Settings className="w-4 h-4" />
                Manage Seats
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Invite Teammate
              </Button>
            </div>
          </div>
        </div>

        {/* Team Shared Credits */}
        <div className="border border-gray-300 rounded-xl p-5">
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
                Your monthly credits will be refilled on {teamCredits.refillDate}.{' '}
                <span className="text-brand-green cursor-pointer hover:underline">Read more</span>
              </p>
            </div>
            <Button 
              className="bg-brand-green hover:bg-brand-green/90 text-white"
              onClick={() => setIsCreditsModalOpen(true)}
            >
              Add Credits
            </Button>
          </div>
          
          {/* Credits Progress Bar */}
          <div className="mt-4">
            <Progress value={creditPercentage} className="h-2" />
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