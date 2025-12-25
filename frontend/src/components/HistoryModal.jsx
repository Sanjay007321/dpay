import { X, History, Clock, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const HistoryModal = ({ transactions, userProfile, pendingTransactions, bankStatus, onClose }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'slow': return 'bg-yellow-100 text-yellow-700';
      case 'down': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Transaction History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6 p-4 rounded-xl bg-violet-50 border border-violet-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-violet-600 mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-violet-800">₹{userProfile?.balance?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-violet-600 mb-1">Bank Status</p>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(bankStatus?.status)}`}>
                <span className="capitalize">{bankStatus?.status || 'unknown'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {pendingTransactions.length > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-700">Pending Transactions</p>
              <span className="ml-auto bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                {pendingTransactions.length}
              </span>
            </div>
            <p className="text-xs text-amber-600">
              {pendingTransactions.length} transaction(s) pending due to bank server issues
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction._id || transaction.id} className="p-4 rounded-xl border border-violet-200 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-violet-800">{transaction.description}</p>
                    <p className="text-sm text-violet-500">
                      {formatDate(transaction.date)} • {transaction.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {transaction.type === 'credit' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <p className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                      </p>
                    </div>
                    <p className="text-sm text-violet-500">Balance: ₹{transaction.balance}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-violet-300 mx-auto mb-3" />
              <p className="text-violet-600">No transactions yet</p>
              <p className="text-sm text-violet-400 mt-1">Your transactions will appear here</p>
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
  );
};

export default HistoryModal;