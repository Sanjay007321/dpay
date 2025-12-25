import { useState } from 'react';
import { X, ChevronRight, AlertCircle, Check, ShieldCheck } from 'lucide-react';

const LOAN_CATEGORIES = [
  { id: 'home', name: 'Home Loan', icon: '🏠', color: 'bg-blue-100 text-blue-600' },
  { id: 'education', name: 'Educational Loan', icon: '🎓', color: 'bg-green-100 text-green-600' },
  { id: 'agriculture', name: 'Agriculture Loan', icon: '🌱', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'gold', name: 'Gold Loan', icon: '💰', color: 'bg-amber-100 text-amber-600' },
  { id: 'healthcare', name: 'Healthcare Loan', icon: '🏥', color: 'bg-red-100 text-red-600' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️', color: 'bg-purple-100 text-purple-600' },
  { id: 'personal', name: 'Personal Loan', icon: '💳', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'business', name: 'Business Loan', icon: '📈', color: 'bg-cyan-100 text-cyan-600' }
];

const LOANS_DATA = {
  home: [
    { bank: 'HDFC Bank', interest: '8.4% p.a.', amount: 'Up to ₹5 Cr', tenure: 'Up to 30 years', processing: '0.5%' },
    { bank: 'SBI', interest: '8.5% p.a.', amount: 'Up to ₹10 Cr', tenure: 'Up to 30 years', processing: '0.35% + GST' },
    { bank: 'ICICI Bank', interest: '8.6% p.a.', amount: 'Up to ₹5 Cr', tenure: 'Up to 30 years', processing: '0.5%' },
    { bank: 'Axis Bank', interest: '8.7% p.a.', amount: 'Up to ₹5 Cr', tenure: 'Up to 30 years', processing: '0.5%' },
    { bank: 'Kotak Mahindra Bank', interest: '8.8% p.a.', amount: 'Up to ₹10 Cr', tenure: 'Up to 25 years', processing: '0.5%' }
  ],
  education: [
    { bank: 'SBI', interest: '8.15% p.a.', amount: 'Up to ₹1.5 Cr', tenure: 'Up to 15 years', processing: 'Nil' },
    { bank: 'HDFC Bank', interest: '9.5% p.a.', amount: 'Up to ₹50 Lakh', tenure: 'Up to 15 years', processing: '1%' },
    { bank: 'Axis Bank', interest: '10% p.a.', amount: 'Up to ₹75 Lakh', tenure: 'Up to 15 years', processing: '1%' },
    { bank: 'ICICI Bank', interest: '9.75% p.a.', amount: 'Up to ₹1 Cr', tenure: 'Up to 15 years', processing: '1%' }
  ],
  personal: [
    { bank: 'HDFC Bank', interest: '10.5% p.a.', amount: 'Up to ₹40 Lakh', tenure: 'Up to 7 years', processing: '2%' },
    { bank: 'SBI', interest: '10.25% p.a.', amount: 'Up to ₹20 Lakh', tenure: 'Up to 6 years', processing: '1%' },
    { bank: 'ICICI Bank', interest: '10.75% p.a.', amount: 'Up to ₹50 Lakh', tenure: 'Up to 7 years', processing: '2%' },
    { bank: 'Axis Bank', interest: '11% p.a.', amount: 'Up to ₹40 Lakh', tenure: 'Up to 7 years', processing: '2%' }
  ],
  business: [
    { bank: 'SBI', interest: '9.2% p.a.', amount: 'Up to ₹50 Cr', tenure: 'Up to 15 years', processing: '0.5%' },
    { bank: 'HDFC Bank', interest: '9.5% p.a.', amount: 'Up to ₹50 Cr', tenure: 'Up to 15 years', processing: '1%' },
    { bank: 'ICICI Bank', interest: '9.8% p.a.', amount: 'Up to ₹100 Cr', tenure: 'Up to 20 years', processing: '1%' },
    { bank: 'Axis Bank', interest: '10% p.a.', amount: 'Up to ₹50 Cr', tenure: 'Up to 15 years', processing: '1%' }
  ],
  gold: [
    { bank: 'Muthoot Finance', interest: '12% p.a.', amount: 'Up to ₹5 Cr', tenure: 'Up to 3 years', processing: '1%' },
    { bank: 'Manappuram Finance', interest: '12.5% p.a.', amount: 'Up to ₹10 Cr', tenure: 'Up to 3 years', processing: '1%' },
    { bank: 'HDFC Bank', interest: '9.5% p.a.', amount: 'Up to ₹1 Cr', tenure: 'Up to 3 years', processing: '1%' },
    { bank: 'ICICI Bank', interest: '10% p.a.', amount: 'Up to ₹1 Cr', tenure: 'Up to 3 years', processing: '1%' }
  ],
  agriculture: [
    { bank: 'Bank of Baroda', interest: '7% p.a.', amount: 'Up to ₹50 Lakh', tenure: 'Up to 7 years', processing: 'Nil' },
    { bank: 'PNB', interest: '7.3% p.a.', amount: 'Up to ₹1 Cr', tenure: 'Up to 10 years', processing: 'Nil' },
    { bank: 'Canara Bank', interest: '7.5% p.a.', amount: 'Up to ₹50 Lakh', tenure: 'Up to 7 years', processing: '0.5%' },
    { bank: 'Union Bank of India', interest: '7.25% p.a.', amount: 'Up to ₹75 Lakh', tenure: 'Up to 10 years', processing: 'Nil' }
  ]
};

const LoansModal = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const renderCategoryScreen = () => (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
        <p className="text-sm text-violet-700 mb-3">Select Loan Category</p>
        <div className="grid grid-cols-2 gap-3">
          {LOAN_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className={`p-4 rounded-xl border-2 transition flex flex-col items-center ${category.color.replace('text-', 'border-').replace('bg-', 'hover:bg-')} border-gray-200 hover:border-current`}
            >
              <span className="text-2xl mb-2">{category.icon}</span>
              <span className="text-sm font-medium text-center">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <p className="font-medium text-blue-700">Why DPay Loans?</p>
        </div>
        <ul className="text-sm text-blue-600 space-y-2">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Lowest interest rates from top banks</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Quick approval within 24 hours</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>100% digital process</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Minimal documentation</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderLoanDetails = () => {
    const loans = LOANS_DATA[selectedCategory.id] || [];
    
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-violet-600 hover:text-violet-700"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedCategory.color}`}>
              <span className="text-lg">{selectedCategory.icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-violet-800">{selectedCategory.name}</h3>
              <p className="text-xs text-violet-600">Available offers from top providers</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {loans.map((loan, index) => (
              <div key={index} className="p-4 rounded-xl border border-gray-200 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{loan.bank}</p>
                    <p className="text-sm text-gray-600">Loan</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-1">
                      {loan.interest}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-medium text-gray-800">{loan.amount}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50">
                    <p className="text-xs text-gray-500">Tenure</p>
                    <p className="font-medium text-gray-800">{loan.tenure}</p>
                  </div>
                </div>
                
                {loan.processing && (
                  <div className="mt-3 p-2 rounded-lg bg-blue-50">
                    <p className="text-xs text-blue-600">Processing Fee: {loan.processing}</p>
                  </div>
                )}
                
                <button
                  onClick={() => alert(`Application started for ${loan.bank} ${selectedCategory.name} loan`)}
                  className="w-full mt-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-700 mb-1">Important Information</p>
              <ul className="text-xs text-amber-600 space-y-1">
                <li>• Interest rates are subject to change</li>
                <li>• Final approval is at the discretion of the bank</li>
                <li>• Processing fee is non-refundable</li>
                <li>• Terms and conditions apply</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Loans</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {!selectedCategory ? renderCategoryScreen() : renderLoanDetails()}
      </div>
    </div>
  );
};

export default LoansModal;