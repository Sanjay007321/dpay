import { X, Wallet, User, Building, CreditCard, Shield } from 'lucide-react';

const BalanceModal = ({ userProfile, bankStatus, onClose }) => {
  const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '**** **** **** ****';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 16) return '**** **** **** ****';
    const last4 = cleaned.slice(-4);
    return `**** **** **** ${last4}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'slow': return 'bg-yellow-100 text-yellow-700';
      case 'down': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Account Balance</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-green-600" />
          </div>
          
          <p className="text-sm text-violet-600 mb-2">Available Balance</p>
          <p className="text-4xl font-bold text-violet-800 mb-6">₹{userProfile?.balance?.toFixed(2) || '0.00'}</p>
          
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
              <p className="text-sm text-violet-600 mb-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                Account Holder
              </p>
              <p className="font-semibold text-violet-800">{userProfile?.username}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
              <p className="text-sm text-violet-600 mb-1">UPI ID</p>
              <p className="font-semibold text-violet-800">{userProfile?.upiId}</p>
            </div>
            
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm text-violet-600 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Bank Account
                </p>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(bankStatus?.status)}`}>
                  <span className="capitalize">{bankStatus?.status || 'unknown'}</span>
                </div>
              </div>
              <p className="font-medium text-violet-800">{userProfile?.bankName}</p>
              <p className="text-xs text-violet-500 mt-1">
                Account: ••••{userProfile?.accountNumber?.slice(-4) || '****'}
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-600 mb-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                ATM Card
              </p>
              <p className="font-mono text-blue-800">{formatCardNumber(userProfile?.atmCardNumber)}</p>
              <p className="text-xs text-blue-500 mt-1">VISA Debit Card</p>
            </div>
            
            {userProfile?.appBalance !== 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-sm text-amber-600 mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  App Balance
                </p>
                <p className={`text-xl font-bold ${userProfile.appBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{userProfile.appBalance?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-amber-500 mt-1">
                  {userProfile.appBalance < 0 ? 'Negative balance indicates pending transactions' : 'Available for rewards'}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceModal;