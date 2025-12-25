import { useState } from 'react';
import { X, Copy, Check, Scissors, Star, Award, Trophy, Users, Gift } from 'lucide-react';

const RewardsModal = ({ userProfile, referrals, scratchCards, onCopyReferralCode, onScratchCard, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReferral = () => {
    onCopyReferralCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarned = referrals.reduce((sum, ref) => sum + ref.reward, 0);
  const referralsCount = referrals.length;
  const availableScratchCards = scratchCards.filter(card => !card.isClaimed).length;
  const unscratchCards = scratchCards.filter(card => !card.isScratched && !card.isClaimed);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Rewards & Scratch Cards</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center">
            <Award className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-violet-800 mb-2">Earn Rewards!</h3>
          <p className="text-sm text-violet-600 mb-6">
            Refer friends and get scratch cards for payments
          </p>
          
          <div className="mb-6 space-y-4">
            {/* Scratch Cards Section */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-amber-700 flex items-center gap-2">
                  <Scissors className="w-4 h-4" />
                  Scratch Cards
                </p>
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                  {availableScratchCards} available
                </span>
              </div>
              <p className="text-xs text-amber-600 mb-3">
                Get 1 scratch card for every 3 successful payments
              </p>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white border border-amber-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <Scissors className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-800">Available Cards</p>
                        <p className="text-xs text-amber-600">Win ₹10 to ₹100 cashback</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-amber-700">{availableScratchCards}</span>
                  </div>
                </div>
                
                {unscratchCards.length > 0 && (
                  <button
                    onClick={() => onScratchCard(unscratchCards[0]._id)}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium hover:from-amber-600 hover:to-yellow-600 transition flex items-center justify-center gap-2"
                  >
                    <Scissors className="w-4 h-4" />
                    Scratch Now!
                  </button>
                )}
              </div>
            </div>
            
            {/* Referral Section */}
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-violet-600 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Your Referral Code
                </p>
                <button
                  onClick={handleCopyReferral}
                  className="flex items-center gap-1 px-3 py-1 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-violet-200">
                <code className="text-violet-800 font-mono text-lg font-bold">
                  {userProfile?.referralCode || 'DPREF123'}
                </code>
              </div>
              <p className="text-xs text-violet-500 mt-2">
                Share this code with friends when they sign up
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-sm text-green-600 mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-green-700">₹{totalEarned}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-sm text-blue-600 mb-1">Referrals</p>
                <p className="text-2xl font-bold text-blue-700">{referralsCount}</p>
              </div>
            </div>
            
            {referrals.length > 0 && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Recent Referrals</p>
                <div className="space-y-3">
                  {referrals.slice(0, 3).map((referral) => (
                    <div key={referral._id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-800">{referral.referredUserId?.username || 'User'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(referral.date).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+₹{referral.reward}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          referral.status === 'paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {referral.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardsModal;