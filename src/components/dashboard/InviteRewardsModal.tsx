import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Copy, Check, Gift, Info, DollarSign, Users, ArrowLeft } from 'lucide-react';
import { FaFacebook, FaLinkedin, FaXTwitter, FaInstagram, FaThreads } from 'react-icons/fa6';

interface InviteRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteRewardsModalUpdated({ isOpen, onClose }: InviteRewardsModalProps) {
  const [activeTab, setActiveTab] = useState<'invite' | 'rewards'>('invite');
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const referralLink = 'revven.ai/ref/yourusername';
  const earnings = {
    readyToClaim: 120,
    totalEarned: 3420,
    referrals: 23,
    activeSubscriptions: 12
  };

  // Load invite code from localStorage on mount
  useEffect(() => {
    const savedCode = localStorage.getItem('latestInviteCode');
    if (savedCode) {
      setInviteCode(savedCode);
    }
  }, []);

  const generateInviteCode = () => {
    setIsGenerating(true);
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setInviteCode(randomCode);
    localStorage.setItem('latestInviteCode', randomCode);
    setIsGenerating(false);
  };

  const copyInviteCode = () => {
    const shareUrl = `${window.location.origin}/signup?invite=${inviteCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${referralLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToSocial = (platform: 'facebook' | 'linkedin' | 'twitter' | 'instagram' | 'threads') => {
    const text = encodeURIComponent('Join me on REVVEN - AI-powered business automation! 🚀');
    const shareLink = inviteCode 
      ? `${window.location.origin}/signup?invite=${inviteCode}`
      : referralLink;
    const url = encodeURIComponent(shareLink);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing via URL
      threads: `https://www.threads.net/intent/post?text=${text}%20${url}`
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {showInfo ? (
          /* How it works info view */
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowInfo(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">How does it work?</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">How do our referrals work?</h3>
                </div>
                <ul className="space-y-2 text-gray-600 text-sm ml-11">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Share REVVEN with your friends & network via your unique link.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>We share 40% of their monthly subscription up to $50 with you if your referral becomes our customer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Your friends & network will receive a 50% discount for the first 3 months of their REVVEN subscription.</span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">How do I claim my reward?</h3>
                </div>
                <ul className="space-y-2 text-gray-600 text-sm ml-11">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>As soon as you have earned your first reward, you can choose your favorite reward option in the dashboard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>You will receive your first reward after we have processed your input.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>All future rewards will be automatically transferred to you. Nothing else to do!</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Main invite/rewards view */
          <>
            {/* Header with tabs */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('invite')}
                  className={`text-sm font-medium pb-2 transition-colors relative ${
                    activeTab === 'invite'
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Invite
                  {activeTab === 'invite' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`text-sm font-medium pb-2 transition-colors relative ${
                    activeTab === 'rewards'
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Rewards
                  {activeTab === 'rewards' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInfo(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Info className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            {activeTab === 'invite' ? (
              <div>
                {/* Hero Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
                    {/* Placeholder for hero image - replace with actual image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🚀</div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white px-6">
                          Don't Keep REVVEN a Secret!
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Invite Your Friends & Get Paid!
                    </h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Your friends get 50% off the first 3 months, and you'll earn a recurring 50% of any of our plans, as a reward, as long as they're active. The more friends you refer, the more you earn!
                    </p>
                  </div>

                  {/* Invite Code Generation */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Invite Code</h3>
                    
                    {!inviteCode ? (
                      <div className="text-center py-8">
                        <Button
                          onClick={generateInviteCode}
                          disabled={isGenerating}
                          className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:opacity-90 text-white px-8 py-3 text-base font-semibold rounded-xl"
                        >
                          {isGenerating ? 'Generating...' : 'Generate Invite Code'}
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={`${window.location.origin}/signup?invite=${inviteCode}`}
                            readOnly
                            className="flex-1 bg-transparent text-gray-700 font-mono text-sm focus:outline-none"
                          />
                          <button
                            onClick={copyInviteCode}
                            className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            {copiedCode ? (
                              <>
                                <Check className="w-4 h-4" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Share Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Share Your Link</h3>
                    
                    {/* Referral Link */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={`https://${referralLink}`}
                          readOnly
                          className="flex-1 bg-transparent text-gray-700 font-mono text-sm focus:outline-none"
                        />
                        <button
                          onClick={handleCopy}
                          className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Social Share Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button
                        onClick={() => shareToSocial('facebook')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl font-medium transition-all"
                      >
                        <FaFacebook className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-700">Facebook</span>
                      </button>

                      <button
                        onClick={() => shareToSocial('linkedin')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 hover:border-blue-700 hover:bg-blue-50 rounded-xl font-medium transition-all"
                      >
                        <FaLinkedin className="w-5 h-5 text-blue-700" />
                        <span className="text-sm text-gray-700">LinkedIn</span>
                      </button>

                      <button
                        onClick={() => shareToSocial('twitter')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl font-medium transition-all"
                      >
                        <FaXTwitter className="w-5 h-5 text-gray-900" />
                        <span className="text-sm text-gray-700">X/Twitter</span>
                      </button>

                      <button
                        onClick={() => shareToSocial('instagram')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 hover:border-pink-500 hover:bg-pink-50 rounded-xl font-medium transition-all"
                      >
                        <FaInstagram className="w-5 h-5 text-pink-600" />
                        <span className="text-sm text-gray-700">Instagram</span>
                      </button>

                      <button
                        onClick={() => shareToSocial('threads')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 rounded-xl font-medium transition-all col-span-2"
                      >
                        <FaThreads className="w-5 h-5 text-gray-900" />
                        <span className="text-sm text-gray-700">Threads</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Rewards Tab */
              <div className="p-8">
                <div className="space-y-6">
                  {/* Ready to Claim */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Ready to claim</p>
                        <p className="text-4xl font-bold text-green-600">${earnings.readyToClaim}</p>
                      </div>
                      <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                        <Info className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Total Referrals</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">{earnings.referrals}</p>
                      <p className="text-xs text-green-600 mt-1">↑ 8% from last month</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Total Earned</span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">${earnings.totalEarned}</p>
                      <p className="text-xs text-green-600 mt-1">↑ 15% from last month</p>
                    </div>
                  </div>

                  {/* When will I get rewarded */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Gift className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">When will I get rewarded?</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      When someone signs up via your link, their signup will appear here. Rewards will appear after 30 days from purchase.
                    </p>
                  </div>

                  {/* Add Payment Details Button */}
                  {earnings.readyToClaim > 0 && (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg rounded-xl font-semibold">
                      Add payment details
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Example usage component
export function EarnButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <DollarSign className="w-4 h-4" />
        Earn $50
      </button>

      <InviteRewardsModalUpdated
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
