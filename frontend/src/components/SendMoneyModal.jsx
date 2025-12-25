import { useState } from 'react';
import { X, User, Phone, Wallet, MessageSquare, Activity } from 'lucide-react';

const SendMoneyModal = ({ userProfile, banks, onSendMoney, onClose }) => {
  const [sendToUPI, setSendToUPI] = useState('');
  const [sendToMobile, setSendToMobile] = useState('');
  const [sendToName, setSendToName] = useState('');
  const [sendMoneyAmount, setSendMoneyAmount] = useState('');
  const [sendMoneyDescription, setSendMoneyDescription] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('upi');

  const getBankStatus = (bankName) => {
    return banks.find(bank => bank.name === bankName);
  };

  const receiverBank = getBankStatus(userProfile?.bankName || ''); // In real app, get from receiver UPI
  const senderBank = getBankStatus(userProfile?.bankName || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!sendMoneyAmount || parseFloat(sendMoneyAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (selectedMethod === 'upi' && !sendToUPI) {
      alert('Please enter UPI ID');
      return;
    }

    if (selectedMethod === 'mobile' && (!sendToMobile || sendToMobile.length !== 10)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    const data = {
      amount: parseFloat(sendMoneyAmount),
      description: sendMoneyDescription || `Payment to ${sendToName || sendToUPI || sendToMobile}`,
      receiverUPI: selectedMethod === 'upi' ? sendToUPI : '',
      receiverMobile: selectedMethod === 'mobile' ? sendToMobile : '',
      receiverName: sendToName
    };

    onSendMoney(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Send Money</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Method Selection */}
            <div className="flex border border-violet-300 rounded-xl overflow-hidden mb-4">
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`flex-1 py-3 text-center font-medium transition ${
                  selectedMethod === 'upi' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-violet-50 text-violet-700'
                }`}
              >
                UPI ID
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('mobile')}
                className={`flex-1 py-3 text-center font-medium transition ${
                  selectedMethod === 'mobile' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-violet-50 text-violet-700'
                }`}
              >
                Mobile
              </button>
            </div>
            
            {/* Receiver Name */}
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <label className="block text-sm font-medium text-violet-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Receiver Name (Optional)
              </label>
              <input
                type="text"
                value={sendToName}
                onChange={(e) => setSendToName(e.target.value)}
                placeholder="Enter receiver name"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            {/* UPI ID or Mobile */}
            {selectedMethod === 'upi' ? (
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
                <label className="block text-sm font-medium text-violet-700 mb-2">
                  Send to UPI ID
                </label>
                <input
                  type="text"
                  value={sendToUPI}
                  onChange={(e) => setSendToUPI(e.target.value)}
                  placeholder="e.g., username@dpay"
                  className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-xs text-violet-500 mt-1">Enter receiver's UPI ID</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
                <label className="block text-sm font-medium text-violet-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Send to Mobile Number
                </label>
                <input
                  type="tel"
                  value={sendToMobile}
                  onChange={(e) => setSendToMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-xs text-violet-500 mt-1">Enter receiver's mobile number</p>
              </div>
            )}
            
            {/* Amount */}
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <label className="block text-sm font-medium text-violet-700 mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Amount (₹)
              </label>
              <input
                type="number"
                value={sendMoneyAmount}
                onChange={(e) => setSendMoneyAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            
            {/* Description */}
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <label className="block text-sm font-medium text-violet-700 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Description (Optional)
              </label>
              <input
                type="text"
                value={sendMoneyDescription}
                onChange={(e) => setSendMoneyDescription(e.target.value)}
                placeholder="e.g., For groceries"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            
            {/* Bank Server Status */}
            {userProfile && (sendToUPI || sendToMobile) && sendMoneyAmount && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Bank Server Status
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-amber-600">Your Bank</p>
                      <p className="text-sm font-medium text-amber-800">{userProfile.bankName}</p>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      senderBank?.status === 'active' ? 'bg-green-100 text-green-700' :
                      senderBank?.status === 'slow' ? 'bg-yellow-100 text-yellow-700' :
                      senderBank?.status === 'down' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      <span className="capitalize">{senderBank?.status || 'unknown'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-amber-600">Receiver's Bank</p>
                      <p className="text-sm font-medium text-amber-800">{receiverBank?.name || 'Unknown'}</p>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      receiverBank?.status === 'active' ? 'bg-green-100 text-green-700' :
                      receiverBank?.status === 'slow' ? 'bg-yellow-100 text-yellow-700' :
                      receiverBank?.status === 'down' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      <span className="capitalize">{receiverBank?.status || 'unknown'}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-amber-500 mt-2">
                  Transaction will be processed based on server availability
                </p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
            >
              Send Money
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMoneyModal;