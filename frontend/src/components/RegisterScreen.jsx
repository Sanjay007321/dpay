import { useState } from 'react';
import { Building, Eye, EyeOff, Upload, User, Mail, Phone, Calendar, CreditCard, Loader2 } from 'lucide-react';

const RegisterScreen = ({ onRegister, onSwitchToLogin, banks, isLoading, loadingMessage }) => {
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    mobile: '',
    dob: '',
    bankName: '',
    accountNumber: '',
    atmCardNumber: '',
    upiPin: '',
    referralCode: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showUpiPin, setShowUpiPin] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'atmCardNumber') {
      // Format ATM card number with spaces
      const cleaned = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setRegisterData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === 'upiPin') {
      // Allow only 4 digits
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setRegisterData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === 'mobile') {
      // Allow only 10 digits
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setRegisterData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result;
        setPhotoPreview(photoData);
        setRegisterData(prev => ({ ...prev, photo: photoData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onRegister(registerData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-4" />
            <p className="text-violet-600">{loadingMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4 overflow-y-auto">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-violet-700">Create Account</h1>
        </div>

        <p className="text-sm text-violet-600 mb-4">Register to use DPay services</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-violet-500" />
              <input
                type="text"
                name="username"
                value={registerData.username}
                onChange={handleChange}
                placeholder="Full Name *"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            <p className="text-xs text-violet-500 mt-1 ml-1">Required</p>
          </div>
          
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-violet-500" />
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleChange}
                placeholder="Email Address (Optional)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <p className="text-xs text-violet-500 mt-1 ml-1">Optional</p>
          </div>
          
          <div>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-5 h-5 text-violet-500" />
              <input
                type="tel"
                name="mobile"
                value={registerData.mobile}
                onChange={handleChange}
                placeholder="Mobile Number *"
                maxLength="10"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
            <p className="text-xs text-violet-500 mt-1 ml-1">Required - 10 digits</p>
          </div>
          
          <div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-violet-500" />
              <input
                type="date"
                name="dob"
                value={registerData.dob}
                onChange={handleChange}
                placeholder="Date of Birth (Optional)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className="text-xs text-violet-500 mt-1 ml-1">Optional</p>
          </div>
          
          <div>
            <div className="relative">
              <Building className="absolute left-3 top-3.5 w-5 h-5 text-violet-500 pointer-events-none" />
              <select
                name="bankName"
                value={registerData.bankName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none bg-white"
                required
              >
                <option value="">Select Bank *</option>
                {banks.map((bank, index) => (
                  <option key={index} value={bank.name}>
                    {bank.name} - {bank.status === 'active' ? '✅' : 
                             bank.status === 'slow' ? '⚠️' : 
                             bank.status === 'down' ? '❌' : '❓'}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-violet-500 mt-1 ml-1">Required - Check bank server status</p>
          </div>
          
          <div>
            <input
              type="text"
              name="accountNumber"
              value={registerData.accountNumber}
              onChange={handleChange}
              placeholder="Bank Account Number *"
              className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
            <p className="text-xs text-violet-500 mt-1 ml-1">Required</p>
          </div>
          
          <div>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-violet-500" />
              <input
                type="text"
                name="atmCardNumber"
                value={registerData.atmCardNumber}
                onChange={handleChange}
                placeholder="ATM Card Number (16 digits) *"
                maxLength="19"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
                required
              />
            </div>
            <p className="text-xs text-violet-500 mt-1 ml-1">Required - 16 digit card number</p>
          </div>
          
          <div>
            <div className="relative">
              <input
                type={showUpiPin ? "text" : "password"}
                name="upiPin"
                value={registerData.upiPin}
                onChange={handleChange}
                placeholder="Set 4-digit UPI PIN *"
                maxLength="4"
                className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowUpiPin(!showUpiPin)}
                className="absolute right-3 top-3.5 text-violet-500"
              >
                {showUpiPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-violet-500 mt-1 ml-1">Required - 4 digits for transactions</p>
          </div>
          
          <div>
            <input
              type="text"
              name="referralCode"
              value={registerData.referralCode}
              onChange={handleChange}
              placeholder="Referral Code (Optional)"
              className="w-full px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-violet-500 mt-1 ml-1">Optional - Enter if referred by a friend</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-violet-700">
              Profile Photo (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-violet-300 hover:border-violet-500 cursor-pointer transition">
                <Upload className="w-5 h-5 text-violet-600" />
                <span className="text-sm text-violet-600">Choose Photo (Optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            {photoPreview && (
              <div className="mt-3 flex justify-center">
                <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-violet-300" />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition mt-4"
          >
            Create Account
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-violet-600 hover:text-violet-700 font-medium text-sm"
            >
              Already have an account? Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterScreen;