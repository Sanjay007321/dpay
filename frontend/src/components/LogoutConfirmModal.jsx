import { LogOut, Shield } from 'lucide-react';

const LogoutConfirmModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-violet-700 mb-2">Logout Confirmation</h2>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to logout from DPay?
          </p>
          
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Your data is securely saved
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;