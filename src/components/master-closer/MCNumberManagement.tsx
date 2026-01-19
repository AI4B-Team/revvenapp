import React from 'react';
import { Phone, Plus, Shield, TrendingUp, Globe, CheckCircle, AlertCircle } from 'lucide-react';

const MCNumberManagement: React.FC = () => {
  const numbers = [
    { number: '+1 555-123-4567', type: 'Local', location: 'San Francisco, CA', status: 'active', spamScore: 95, calls: 234 },
    { number: '+1 555-234-5678', type: 'Toll-Free', location: 'United States', status: 'active', spamScore: 88, calls: 189 },
    { number: '+1 555-345-6789', type: 'Local', location: 'New York, NY', status: 'warning', spamScore: 72, calls: 156 }
  ];

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Phone Numbers</h1>
          <p className="text-muted-foreground">Manage your calling numbers and spam protection</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all shadow-sm">
          <Plus className="w-5 h-5" />
          Buy Number
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Phone, value: '3', label: 'Active Numbers', color: 'text-emerald-500' },
          { icon: Shield, value: '85%', label: 'Avg Spam Score', color: 'text-emerald-500' },
          { icon: TrendingUp, value: '579', label: 'Total Calls', color: 'text-blue-500' },
          { icon: Globe, value: '2', label: 'Countries', color: 'text-purple-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
            <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Your Numbers</h2>
        </div>
        <div className="divide-y divide-border">
          {numbers.map((num, idx) => (
            <div key={idx} className="p-6 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-foreground mb-1">{num.number}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{num.type}</span>
                      <span>•</span>
                      <span>{num.location}</span>
                      <span>•</span>
                      <span>{num.calls} calls</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className={`w-5 h-5 ${num.spamScore >= 85 ? 'text-emerald-500' : 'text-yellow-500'}`} />
                      <span className="text-2xl font-bold text-foreground">{num.spamScore}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Spam Score</div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    num.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {num.status === 'active' ? (
                      <><CheckCircle className="w-4 h-4" />Active</>
                    ) : (
                      <><AlertCircle className="w-4 h-4" />Warning</>
                    )}
                  </span>

                  <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted text-foreground">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MCNumberManagement;
