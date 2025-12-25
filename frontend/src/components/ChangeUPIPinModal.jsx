import { X, Key, Shield } from 'lucide-react';

const ChangeUPIPinModal = ({
  oldPin,
  newPin,
  confirmNewPin,
  onOldPinChange,
  onNewPinChange,
  onConfirmNewPinChange,
  onSubmit,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-700">Change UPI PIN</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-violet-700 mb-2">
              Old UPI PIN
            </label>
            <input
              type="password"
              value={oldPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                onOldPinChange(value);
              }}
              placeholder="Enter old PIN"
              maxLength="4"
              className="w-full px-4 py-3 text-center text-2xl font-mono rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-violet-700 mb-2">
              New UPI PIN
            </label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                onNewPinChange(value);
              }}
              placeholder="Enter new PIN"
              maxLength="4"
              className="w-full px-4 py-3 text-center text-2xl font-mono rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-violet-700 mb-2">
              Confirm New PIN
            </label>
            <input
              type="password"
              value={confirmNewPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                onConfirmNewPinChange(value);
              }}
              placeholder="Confirm new PIN"
              maxLength="4"
              className="w-full px-4 py-3 text-center text-2xl font-mono rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Your new UPI PIN must be exactly 4 digits and different from your current PIN.
            </p>
          </div>
          
          <button
            onClick={onSubmit}
            disabled={!oldPin || !newPin || !confirmNewPin}
            className={`w-full py-3 rounded-xl font-semibold transition ${
              !oldPin || !newPin || !confirmNewPin
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            Change UPI PIN
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-2 text-violet-600 font-medium hover:text-violet-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeUPIPinModal;