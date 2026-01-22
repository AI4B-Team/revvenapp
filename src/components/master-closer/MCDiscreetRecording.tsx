import React, { useState } from 'react';
import { EyeOff, Mic, MicOff, Shield, Clock, AlertTriangle, Settings, Download, Play, Pause, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Recording {
  id: string;
  name: string;
  date: string;
  duration: string;
  size: string;
  encrypted: boolean;
}

const MCDiscreetRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [settings, setSettings] = useState({
    autoEncrypt: true,
    silentMode: true,
    autoTranscribe: true,
    saveLocally: false,
  });

  const recordings: Recording[] = [
    { id: '1', name: 'Client Meeting - TechCorp', date: 'Today, 2:30 PM', duration: '24:35', size: '12.4 MB', encrypted: true },
    { id: '2', name: 'Sales Call - StartupXYZ', date: 'Today, 11:00 AM', duration: '18:42', size: '9.2 MB', encrypted: true },
    { id: '3', name: 'Discovery Session', date: 'Yesterday', duration: '32:18', size: '15.8 MB', encrypted: true },
    { id: '4', name: 'Product Demo', date: 'Yesterday', duration: '45:22', size: '22.1 MB', encrypted: true },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Discreet Recording</h1>
            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              <EyeOff className="w-3 h-3 mr-1" />
              Silent Mode
            </Badge>
          </div>
          <p className="text-muted-foreground">Background recording with privacy protection</p>
        </div>
        <Button variant="outline" size="icon">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Legal Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 dark:text-yellow-400">Legal Reminder</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Recording laws vary by jurisdiction. Please ensure you have proper consent before recording any conversation. 
              Many jurisdictions require all-party consent for recording.
            </p>
          </div>
        </div>
      </div>

      {/* Recording Control */}
      <div className="bg-card border border-border rounded-xl p-8">
        <div className="text-center">
          <div 
            className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 transition-all cursor-pointer ${
              isRecording 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-muted hover:bg-muted/80'
            }`}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? (
              <MicOff className="w-16 h-16 text-white" />
            ) : (
              <Mic className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          
          {isRecording ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-lg font-semibold text-red-500">Recording</span>
              </div>
              <p className="font-mono text-2xl text-foreground mb-4">12:34:56</p>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Lock className="w-3 h-3 mr-1" />
                  Encrypted
                </Badge>
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  <EyeOff className="w-3 h-3 mr-1" />
                  Silent
                </Badge>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-2">Tap to Start Recording</h3>
              <p className="text-muted-foreground">Recording will run silently in the background</p>
            </>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Recording Settings
        </h2>
        <div className="space-y-4">
          {[
            { key: 'autoEncrypt', label: 'Auto-encrypt recordings', description: 'All recordings are encrypted immediately', icon: Shield },
            { key: 'silentMode', label: 'Silent mode', description: 'No audio or visual indicators during recording', icon: EyeOff },
            { key: 'autoTranscribe', label: 'Auto-transcribe', description: 'Automatically transcribe after recording ends', icon: Mic },
            { key: 'saveLocally', label: 'Save locally first', description: 'Store recordings locally before cloud sync', icon: Download },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <setting.icon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{setting.label}</p>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
              </div>
              <Switch 
                checked={settings[setting.key as keyof typeof settings]}
                onCheckedChange={(checked) => setSettings({ ...settings, [setting.key]: checked })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Recordings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold text-foreground mb-4">Recent Recordings</h2>
        <div className="space-y-3">
          {recordings.map((recording) => (
            <div key={recording.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 bg-foreground rounded-full flex items-center justify-center text-background hover:opacity-80 transition-opacity">
                  <Play className="w-4 h-4 ml-0.5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{recording.name}</h3>
                    {recording.encrypted && (
                      <Lock className="w-3 h-3 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{recording.date}</span>
                    <span>•</span>
                    <span>{recording.duration}</span>
                    <span>•</span>
                    <span>{recording.size}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Recordings', value: '48', icon: Mic },
          { label: 'Storage Used', value: '2.4 GB', icon: Download },
          { label: 'Encrypted', value: '100%', icon: Shield },
        ].map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MCDiscreetRecording;
