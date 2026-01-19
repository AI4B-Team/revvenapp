import React from 'react';
import { DollarSign, Users, TrendingUp, Clock } from 'lucide-react';

const MCCRMPipeline: React.FC = () => {
  const stages = [
    { 
      name: 'New Leads', 
      deals: [
        { name: 'Acme Corp', value: '$45K', contact: 'John Smith' }, 
        { name: 'TechStart', value: '$32K', contact: 'Sarah Lee' }
      ] 
    },
    { 
      name: 'Qualified', 
      deals: [
        { name: 'Growth Inc', value: '$67K', contact: 'Mike Johnson' }
      ] 
    },
    { 
      name: 'Proposal', 
      deals: [
        { name: 'Scale Co', value: '$89K', contact: 'Lisa Chen' }, 
        { name: 'Build LLC', value: '$54K', contact: 'Tom Davis' }
      ] 
    },
    { 
      name: 'Negotiation', 
      deals: [
        { name: 'Big Corp', value: '$120K', contact: 'Emma Wilson' }
      ] 
    },
    { 
      name: 'Closed Won', 
      deals: [
        { name: 'Winner Co', value: '$76K', contact: 'Alex Turner' }
      ] 
    }
  ];

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">CRM Pipeline</h1>
        <p className="text-muted-foreground">Manage your deals through the sales process</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: DollarSign, value: '$483K', label: 'Pipeline Value', color: 'text-emerald-500' },
          { icon: Users, value: '8', label: 'Active Deals', color: 'text-blue-500' },
          { icon: TrendingUp, value: '67%', label: 'Win Rate', color: 'text-emerald-500' },
          { icon: Clock, value: '21 days', label: 'Avg Sales Cycle', color: 'text-purple-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
            <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.name} className="flex-shrink-0 w-80 bg-card rounded-xl border border-border shadow-sm">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-foreground">{stage.name}</h3>
              <p className="text-sm text-muted-foreground">{stage.deals.length} deals</p>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
              {stage.deals.map((deal, idx) => (
                <div 
                  key={idx} 
                  className="p-4 bg-muted/50 rounded-lg border border-border hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all cursor-pointer"
                >
                  <h4 className="font-semibold text-foreground mb-1">{deal.name}</h4>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{deal.value}</div>
                  <p className="text-sm text-muted-foreground">{deal.contact}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MCCRMPipeline;
