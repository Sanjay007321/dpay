import { useState } from 'react';
import { X, Zap, Tv, Tag, Flame, Battery, Wifi, ChevronRight } from 'lucide-react';

const BillsModal = ({ billsCategories, onPayBill, onClose }) => {
  const [selectedBillCategory, setSelectedBillCategory] = useState(null);
  const [billNumber, setBillNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [step, setStep] = useState('category'); // category -> details

  const getCategoryIcon = (category) => {
    switch(category.id) {
      case 'electricity': return Zap;
      case 'dth': return Tv;
      case 'fastag': return Tag;
      case 'gas': return Flame;
      case 'water': return Battery;
      case 'broadband': return Wifi;
      default: return Zap;
    }
  };

  const getPlaceholder = (category) => {
    switch(category.id) {
      case 'electricity': return 'Consumer Number';
      case 'dth': return 'DTH Number';
      case 'fastag': return 'Vehicle Number';
      case 'gas': return 'Consumer Number';
      case 'water': return 'Consumer Number';
      case 'broadband': return 'Account Number';
      default: return 'Bill Number';
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedBillCategory(category);
    setStep('details');
  };

  const handleBillPayment = () => {
    if (!billNumber || !billAmount || parseFloat(billAmount) <= 0) {
      alert('Please enter valid bill details');
      return;
    }

    onPayBill({
      billType: selectedBillCategory.name,
      billNumber: billNumber,
      amount: parseFloat(billAmount)
    });
  };

  const renderStep = () => {
    switch(step) {
      case 'category':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <p className="text-sm text-violet-700 mb-3">Select Bill Category</p>
              <div className="grid grid-cols-2 gap-3">
                {billsCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategorySelect(category)}
                      className={`p-4 rounded-xl border-2 transition flex flex-col items-center ${category.color.replace('text-', 'border-').replace('bg-', 'hover:bg-')} border-gray-200 hover:border-current`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium text-center">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Recently Paid Bills</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Electricity Bill</p>
                      <p className="text-xs text-gray-500">Paid on 15 Jan</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-600">₹1,250</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Gas Bill</p>
                      <p className="text-xs text-gray-500">Paid on 10 Jan</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-600">₹850</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'details':
        const Icon = selectedBillCategory?.icon;
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setStep('category')}
                  className="text-violet-600 hover:text-violet-700"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedBillCategory.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-violet-800">{selectedBillCategory.name}</h3>
                  <p className="text-xs text-violet-600">Enter bill details</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-violet-700 mb-2">
                    {getPlaceholder(selectedBillCategory)}
                  </label>
                  <input
                    type="text"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    placeholder={`Enter ${selectedBillCategory.name.toLowerCase()} number`}
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-violet-700 mb-2">
                    Bill Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    placeholder="Enter bill amount"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-sm text-amber-700">
                    <span className="font-medium">Note:</span> Bill amount will be verified before processing payment
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleBillPayment}
              disabled={!billNumber || !billAmount}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                !billNumber || !billAmount
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              Pay Bill
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Pay Bills</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {renderStep()}
      </div>
    </div>
  );
};

export default BillsModal;