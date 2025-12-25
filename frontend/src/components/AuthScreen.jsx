import { useState } from 'react';
import { Mail, Phone, Loader2 } from 'lucide-react';

const AuthScreen = ({ onSendOTP, onVerifyOTP, onSwitchToRegister, isLoading, loadingMessage }) => {
  const [step, setStep] = useState('mobile');
  const [otpMethod, setOtpMethod] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');

  const handleSendOTP = async () => {
    if (otpMethod === 'mobile' && mobile.length >= 10) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(otp);
      await onSendOTP(mobile, '', 'mobile');
      setStep('otp');
    } else if (otpMethod === 'email' && email) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOTP(otp);
      await onSendOTP('', email, 'email');
      setStep('otp');
    } else {
      alert(`Please enter a valid ${otpMethod === 'mobile' ? '10-digit mobile number' : 'email address'}`);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpMethod === 'mobile') {
      await onVerifyOTP(mobile, '', otp, 'mobile');
    } else {
      await onVerifyOTP('', email, otp, 'email');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-3xl font-bold text-violet-700">DPay</h1>
          </div>
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-4" />
            <p className="text-violet-600">{loadingMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-violet-700">DPay</h1>
        </div>

        <p className="text-sm text-violet-600 mb-6 text-center">
          {step === 'mobile' ? 'Login to access DPay services' : 'Enter OTP to continue'}
        </p>

        {step === 'mobile' ? (
          <>
            {/* OTP Method Selection */}
            <div className="mb-4">
              <div className="flex border border-violet-300 rounded-xl overflow-hidden mb-4">
                <button
                  onClick={() => setOtpMethod('mobile')}
                  className={`flex-1 py-3 text-center font-medium transition ${
                    otpMethod === 'mobile' 
                      ? 'bg-violet-600 text-white' 
                      : 'bg-violet-50 text-violet-700'
                  }`}
                >
                  Mobile OTP
                </button>
                <button
                  onClick={() => setOtpMethod('email')}
                  className={`flex-1 py-3 text-center font-medium transition ${
                    otpMethod === 'email' 
                      ? 'bg-violet-600 text-white' 
                      : 'bg-violet-50 text-violet-700'
                  }`}
                >
                  Email OTP
                </button>
              </div>
              
              {otpMethod === 'mobile' ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-violet-500" />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter mobile number"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              ) : (
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-violet-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              )}
            </div>
            
            <button
              onClick={handleSendOTP}
              className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
            >
              Send OTP
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-violet-500 mb-2">New to DPay?</p>
              <button
                onClick={onSwitchToRegister}
                className="text-violet-600 hover:text-violet-700 font-medium border border-violet-300 px-4 py-2 rounded-lg hover:bg-violet-50 transition"
              >
                Create Account
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-violet-600 mb-2">
              OTP sent to {otpMethod === 'mobile' ? `+91 ${mobile}` : email}
            </p>
            <p className="text-xs text-violet-400 mb-4">
              For demo: Use OTP <span className="font-bold">{generatedOTP}</span>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="w-full mb-4 px-4 py-3 rounded-xl border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 text-center text-lg"
            />
            <button
              onClick={handleVerifyOTP}
              className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
            >
              Login to DPay
            </button>
            <button
              onClick={() => {
                setStep('mobile');
                setOtp('');
              }}
              className="w-full mt-3 py-2 text-violet-600 font-medium hover:text-violet-700"
            >
              Change {otpMethod === 'mobile' ? 'Number' : 'Email'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;