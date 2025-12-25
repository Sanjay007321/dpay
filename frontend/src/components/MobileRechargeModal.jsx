import { useState } from 'react';
import { X, Phone, Battery, Zap, Wifi, Tv, Flame } from 'lucide-react';

const RECHARGE_PLANS = {
  airtel: [
    { id: 1, amount: 179, validity: '28 days', data: '1.5GB/day', description: 'Popular Plan' },
    { id: 2, amount: 299, validity: '28 days', data: '2GB/day', description: 'Unlimited Calls' },
    { id: 3, amount: 399, validity: '56 days', data: '1.5GB/day', description: 'Long Term' },
    { id: 4, amount: 499, validity: '56 days', data: '2GB/day', description: 'Best Value' },
    { id: 5, amount: 799, validity: '84 days', data: '1.5GB/day', description: 'Quarterly' }
  ],
  jio: [
    { id: 1, amount: 155, validity: '28 days', data: '1.5GB/day', description: 'Basic Plan' },
    { id: 2, amount: 299, validity: '28 days', data: '2GB/day', description: 'Popular Plan' },
    { id: 3, amount: 395, validity: '56 days', data: '1.5GB/day', description: 'Long Term' },
    { id: 4, amount: 666, validity: '84 days', data: '1.5GB/day', description: 'Quarterly' },
    { id: 5, amount: 999, validity: '84 days', data: '2.5GB/day', description: 'Premium' }
  ],
  vi: [
    { id: 1, amount: 199, validity: '28 days', data: '1.5GB/day', description: 'Basic Plan' },
    { id: 2, amount: 299, validity: '28 days', data: '2GB/day', description: 'Popular Plan' },
    { id: 3, amount: 399, validity: '56 days', data: '1.5GB/day', description: 'Long Term' },
    { id: 4, amount: 599, validity: '84 days', data: '1.5GB/day', description: 'Quarterly' }
  ],
  bsnl: [
    { id: 1, amount: 199, validity: '28 days', data: '2GB/day', description: 'STV 199' },
    { id: 2, amount: 299, validity: '28 days', data: '3GB/day', description: 'STV 299' },
    { id: 3, amount: 399, validity: '56 days', data: '2GB/day', description: 'STV 399' },
    { id: 4, amount: 549, validity: '84 days', data: '2GB/day', description: 'STV 549' }
  ],
  mtnl: [
    { id: 1, amount: 199, validity: '28 days', data: '1GB/day', description: 'Basic Plan' },
    { id: 2, amount: 299, validity: '28 days', data: '1.5GB/day', description: 'Popular Plan' },
    { id: 3, amount: 399, validity: '56 days', data: '1GB/day', description: 'Long Term' }
  ]
};

const MobileRechargeModal = ({ telecomOperators, onRecharge, onClose }) => {
  const [rechargeMobile, setRechargeMobile] = useState('');
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState('mobile'); // mobile -> operator -> plan

  const handleMobileSubmit = () => {
    if (rechargeMobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setStep('operator');
  };

  const handleOperatorSelect = (operator) => {
    setSelectedOperator(operator);
    setSelectedPlan(null);
    setStep('plan');
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleRecharge = () => {
    if (!rechargeMobile || !selectedOperator || !selectedPlan) {
      alert('Please complete all steps');
      return;
    }

    onRecharge({
      mobile: rechargeMobile,
      operator: selectedOperator.name,
      plan: selectedPlan.description,
      amount: selectedPlan.amount
    });
  };

  const renderStep = () => {
    switch(step) {
      case 'mobile':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <label className="block text-sm font-medium text-violet-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Mobile Number
              </label>
              <input
                type="tel"
                value={rechargeMobile}
                onChange={(e) => setRechargeMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                maxLength="10"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <p className="text-xs text-violet-500 mt-1">Enter mobile number to recharge</p>
            </div>
            
            <button
              onClick={handleMobileSubmit}
              disabled={rechargeMobile.length !== 10}
              className={`w-full py-3 rounded-xl font-semibold transition ${
                rechargeMobile.length !== 10
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              Continue
            </button>
          </div>
        );

      case 'operator':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <label className="block text-sm font-medium text-violet-700 mb-3">
                Select Operator
              </label>
              <div className="grid grid-cols-2 gap-3">
                {telecomOperators.map((operator) => (
                  <button
                    key={operator.id}
                    type="button"
                    onClick={() => handleOperatorSelect(operator)}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
                      selectedOperator?.id === operator.id
                        ? 'border-violet-600 bg-violet-100'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${operator.color}`}>
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{operator.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setStep('mobile')}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep('plan')}
                disabled={!selectedOperator}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  !selectedOperator
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 'plan':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <label className="block text-sm font-medium text-blue-700 mb-3">
                Select Plan - {selectedOperator.name}
              </label>
              <div className="space-y-3">
                {RECHARGE_PLANS[selectedOperator.id]?.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full p-4 rounded-xl border-2 transition text-left ${
                      selectedPlan?.id === plan.id
                        ? 'border-blue-600 bg-blue-100'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xl font-bold text-blue-800">₹{plan.amount}</p>
                        <p className="text-sm text-blue-600">{plan.validity}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          plan.description === 'Popular Plan'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {plan.description}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Data: {plan.data}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {selectedPlan && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-green-700">Selected Plan</p>
                  <p className="text-lg font-bold text-green-800">₹{selectedPlan.amount}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-green-600">Operator</p>
                    <p className="font-medium text-green-700">{selectedOperator.name}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-green-600">Validity</p>
                    <p className="font-medium text-green-700">{selectedPlan.validity}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-green-600">Daily Data</p>
                    <p className="font-medium text-green-700">{selectedPlan.data}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setStep('operator')}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button
                onClick={handleRecharge}
                disabled={!selectedPlan}
                className={`flex-1 py-3 rounded-xl font-semibold transition ${
                  !selectedPlan
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                Recharge for ₹{selectedPlan?.amount || '0'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Mobile Recharge</h2>
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

export default MobileRechargeModal;