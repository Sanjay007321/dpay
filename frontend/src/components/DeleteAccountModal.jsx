import { Trash2, AlertCircle, Shield } from 'lucide-react';

const DeleteAccountModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-violet-700 mb-2">Delete Account</h2>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete your DPay account? This action cannot be undone.
          </p>
          
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-700 font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                All your data will be permanently deleted:
              </p>
              <ul className="text-xs text-red-600 space-y-1 text-left">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  Profile information
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  Transaction history
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  UPI ID and linked bank account
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  All rewards and cashback
                </li>
              </ul>
            </div>
            
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <Shield className="w-4 h-4 flex-shrink-0" />
                For security reasons, this process takes 7 days. You can cancel deletion anytime during this period.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-8">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Delete Account
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            By confirming, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;