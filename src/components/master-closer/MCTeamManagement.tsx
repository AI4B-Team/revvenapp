import React from 'react';
import { Users, UserPlus } from 'lucide-react';

const MCTeamManagement: React.FC = () => {
  const teamMembers = [
    { name: 'John Smith', calls: 45, closeRate: 72, aiUsage: 95, avatar: 'JS' },
    { name: 'Sarah Williams', calls: 38, closeRate: 68, aiUsage: 88, avatar: 'SW' },
    { name: 'Mike Johnson', calls: 41, closeRate: 65, aiUsage: 92, avatar: 'MJ' }
  ];

  return (
    <div className="p-8 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="space-y-4">
        {teamMembers.map((member, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-6 flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white">
                {member.avatar}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.calls} calls this week</p>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{member.closeRate}%</div>
                <div className="text-xs text-muted-foreground">Close Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{member.aiUsage}%</div>
                <div className="text-xs text-muted-foreground">AI Usage</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MCTeamManagement;