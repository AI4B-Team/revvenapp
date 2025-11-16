import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function WhiteLabelTab() {
  return (
    <div className="max-w-2xl">
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 border-0 p-8 relative overflow-hidden">
        {/* Checkmark Icon */}
        <div className="absolute top-6 right-6">
          <div className="bg-green-400 rounded-full p-2">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="pr-16">
          <p className="text-white/90 text-sm mb-4">
            White Label is available on the Agency plan.
          </p>
          
          <h2 className="text-white text-2xl font-semibold mb-2">
            Upgrade to Agency
          </h2>
          
          <p className="text-white/80 text-sm mb-6">
            Upgrade to Agency and get access to White Label.
          </p>
          
          <Button 
            className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
          >
            Change plan
          </Button>
        </div>
      </Card>
    </div>
  );
}
