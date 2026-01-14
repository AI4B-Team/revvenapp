import React from 'react';
import { Upload, Mic, Bot } from 'lucide-react';

const MCSettings: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Settings</h1>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <Upload className="w-5 h-5 text-purple-600" />
            Custom Scripts & Frameworks
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload your sales scripts, playbooks, and methodologies to train AI on your approach
          </p>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors">
            Upload Files
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <Mic className="w-5 h-5 text-purple-600" />
            Voice Settings
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Customize AI voice tone, speed, and personality
          </p>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors">
            Configure Voice
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
            <Bot className="w-5 h-5 text-purple-600" />
            AI Behavior
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Adjust how aggressive, consultative, or direct the AI should be
          </p>
          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium transition-colors">
            Tune AI
          </button>
        </div>
      </div>
    </div>
  );
};

export default MCSettings;
