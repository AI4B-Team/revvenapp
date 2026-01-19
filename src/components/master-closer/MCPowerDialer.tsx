import React, { useState } from 'react';
import { Phone, Play, Pause, SkipForward, Users, TrendingUp, Clock, Target } from 'lucide-react';

const MCPowerDialer: React.FC = () => {
  const [isDialing, setIsDialing] = useState(false);

  const callQueue = [
    { id: '1', name: 'John Smith', company: 'Acme Corp', phone: '+1 555-123-4567', status: 'ready' },
    { id: '2', name: 'Sarah Johnson', company: 'TechStart', phone: '+1 555-234-5678', status: 'ready' },
    { id: '3', name: 'Mike Wilson', company: 'Growth Inc', phone: '+1 555-345-6789', status: 'ready' }
  ];

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Power Dialer</h1>
          <p className="text-muted-foreground">Multi-line calling with local presence</p>
        </div>
        <button 
          onClick={() => setIsDialing(!isDialing)} 
          className={`flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg ${
            isDialing 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-emerald-500 hover:bg-emerald-600'
          } text-white`}
        >
          {isDialing ? (
            <><Pause className="w-6 h-6" />Pause Dialing</>
          ) : (
            <><Play className="w-6 h-6" />Start Dialing</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Phone, value: '47', label: 'Calls Today', color: 'text-emerald-500' },
          { icon: Users, value: '23', label: 'Contacts Reached', color: 'text-blue-500' },
          { icon: Target, value: '12', label: 'Conversations', color: 'text-purple-500' },
          { icon: Clock, value: '2:34', label: 'Avg Call Time', color: 'text-orange-500' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
            <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Call Queue</h2>
            <p className="text-sm text-muted-foreground mt-1">{callQueue.length} contacts ready to call</p>
          </div>
          <div className="divide-y divide-border">
            {callQueue.map((contact, idx) => (
              <div key={contact.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">{contact.company} • {contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-sm font-medium">
                      Ready
                    </span>
                    <button className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </button>
                    <button className="p-2 hover:bg-muted rounded-lg">
                      <SkipForward className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Dialer Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Lines Active</label>
              <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground">
                <option>1 Line</option>
                <option>2 Lines</option>
                <option>3 Lines</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Local Presence</label>
              <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground">
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Dial Timeout</label>
              <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-emerald-500 bg-background text-foreground">
                <option>30 seconds</option>
                <option>45 seconds</option>
                <option>60 seconds</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCPowerDialer;
