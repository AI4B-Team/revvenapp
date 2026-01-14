import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Bot, User, Crown, Briefcase, Users, Check, ArrowRight } from 'lucide-react';

interface TransferDestination {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  available: boolean;
  description: string;
  avatarColor: string;
}

interface MCTransferModalProps {
  open: boolean;
  onClose: () => void;
  onTransfer: (destination: TransferDestination) => void;
}

const transferDestinations: TransferDestination[] = [
  {
    id: 'ai-agent',
    name: 'AI Voice Agent',
    role: 'Automated',
    icon: Bot,
    available: true,
    description: 'AI handles the call with your configured persona and objection handling',
    avatarColor: 'bg-purple-500'
  },
  {
    id: 'manager',
    name: 'Sales Manager',
    role: 'Michael Torres',
    icon: Crown,
    available: true,
    description: 'Escalate to manager for complex negotiations or approvals',
    avatarColor: 'bg-amber-500'
  },
  {
    id: 'specialist',
    name: 'Product Specialist',
    role: 'Emily Chen',
    icon: Briefcase,
    available: true,
    description: 'Technical expert for deep product questions',
    avatarColor: 'bg-blue-500'
  },
  {
    id: 'senior-closer',
    name: 'Senior Closer',
    role: 'James Wilson',
    icon: User,
    available: false,
    description: 'Experienced closer for high-value deals',
    avatarColor: 'bg-emerald-500'
  },
  {
    id: 'team-queue',
    name: 'Team Queue',
    role: '3 Available',
    icon: Users,
    available: true,
    description: 'Next available team member will take over',
    avatarColor: 'bg-slate-500'
  }
];

const MCTransferModal: React.FC<MCTransferModalProps> = ({ open, onClose, onTransfer }) => {
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = () => {
    const destination = transferDestinations.find(d => d.id === selectedDestination);
    if (destination) {
      setIsTransferring(true);
      // Simulate transfer delay
      setTimeout(() => {
        onTransfer(destination);
        setIsTransferring(false);
        setSelectedDestination(null);
        onClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    if (!isTransferring) {
      setSelectedDestination(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-purple-500" />
            Transfer Call
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {transferDestinations.map((destination) => {
            const Icon = destination.icon;
            const isSelected = selectedDestination === destination.id;
            
            return (
              <button
                key={destination.id}
                onClick={() => destination.available && setSelectedDestination(destination.id)}
                disabled={!destination.available || isTransferring}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : destination.available
                    ? 'border-border hover:border-purple-300 hover:bg-muted/50'
                    : 'border-border bg-muted/30 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className={`w-12 h-12 ${destination.avatarColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{destination.name}</span>
                    {!destination.available && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{destination.role}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{destination.description}</p>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={isTransferring}
            className="flex-1 px-4 py-3 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedDestination || isTransferring}
            className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTransferring ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Transfer
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MCTransferModal;
