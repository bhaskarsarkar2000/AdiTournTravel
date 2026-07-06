import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = import.meta.env.VITE_API_URL || '/api';

export default function CheckoutLogin({ onLoginSuccess, onClose }) {
  const [method, setMethod] = useState('phone'); // phone or email
  const [step, setStep] = useState('contact'); // contact, otp
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle sending OTP via phone
  const handleSendPhoneOTP = async (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/send-phone-otp`, {
        phone,
        email: email || undefined,
        name: name || 'Guest User'
      });
      setOtpSent(true);
      setStep('otp');
      setTimer(600); // 10 minutes
      toast.success(`OTP sent to +91${phone}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending OTP via email
  const handleSendEmailOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-otp`, { email });
      setOtpSent(true);
      setStep('otp');
      setTimer(600); // 10 minutes
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  // Handle OTP verification via phone
  const handleVerifyPhoneOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/verify-phone-otp`, {
        phone,
        otp: otpCode
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login successful!');
      onLoginSuccess(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification via email
  const handleVerifyEmailOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/verify-otp`, {
        email,
        otp: otpCode
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login successful!');
      onLoginSuccess(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP via phone
  const handleResendPhoneOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/auth/resend-phone-otp`, { phone });
      setTimer(600);
      toast.success(`OTP resent to +91${phone}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP via email
  const handleResendEmailOTP = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/auth/resend-otp`, { email });
      setTimer(600);
      toast.success('OTP resent to your email!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (timer <= 0) {
      if (method === 'phone') {
        handleResendPhoneOTP();
      } else {
        handleResendEmailOTP();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 text-white">
          <button
            onClick={onClose}
            className="float-right text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold mb-2">🔐 Secure Checkout</h2>
          <p className="text-blue-100 text-sm">Login with OTP to proceed with payment</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 'contact' ? (
            <>
              {/* Method Selection */}
              {!otpSent && (
                <div className="mb-6">
                  <p className="text-gray-700 font-semibold mb-3 text-sm">Choose verification method:</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMethod('phone')}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all text-sm ${
                        method === 'phone'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📱 Phone
                    </button>
                    <button
                      onClick={() => setMethod('email')}
                      className={`flex-1 py-2 rounded-lg font-bold transition-all text-sm ${
                        method === 'email'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📧 Email
                    </button>
                  </div>
                </div>
              )}

              {/* Phone Method */}
              {method === 'phone' && (
                <form onSubmit={handleSendPhoneOTP}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Your Name (Optional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                    <div className="flex items-center">
                      <span className="text-gray-600 font-bold px-3 py-2.5 bg-gray-100 rounded-l-lg">+91</span>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.slice(0, 10))}
                        placeholder="10-digit number"
                        maxLength="10"
                        className="flex-1 px-4 py-2.5 border-2 border-gray-300 border-l-0 rounded-r-lg focus:outline-none focus:border-indigo-500 transition-colors"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter 10-digit mobile number starting with 6-9</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP on Phone'}
                  </button>
                </form>
              )}

              {/* Email Method */}
              {method === 'email' && (
                <form onSubmit={handleSendEmailOTP}>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP on Email'}
                  </button>
                </form>
              )}
            </>
          ) : (
            // OTP Verification Step
            <form onSubmit={method === 'phone' ? handleVerifyPhoneOTP : handleVerifyEmailOTP}>
              <div className="mb-4">
                <p className="text-gray-700 font-semibold mb-3">
                  Enter OTP sent to {method === 'phone' ? `+91${phone}` : email}
                </p>
                <div className="flex gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          document.getElementById(`otp-${index - 1}`)?.focus();
                        }
                      }}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 mb-4"
              >
                {loading ? 'Verifying...' : '✓ Verify & Login'}
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-600">
                    Resend OTP in <span className="font-bold text-indigo-600">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Resend OTP?
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('contact');
                  setOtp(['', '', '', '', '', '']);
                  setOtpSent(false);
                }}
                className="w-full text-gray-600 font-semibold mt-4 text-sm hover:text-gray-800"
              >
                ← Back
              </button>
            </form>
          )}

          <p className="text-center text-gray-500 text-xs mt-4">
            🔒 Your data is encrypted and secure
          </p>
        </div>
      </div>
    </div>
  );
}
