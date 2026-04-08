import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import cityscapeLogo from '../assets/cityscape_logo.png';

export const SupervisorLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, error: authError } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError('');

    // Validate inputs
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password, false, true);

      if (result.success) {
        navigate('/supervisor-dashboard');
      } else {
        setLocalError(result.error || 'Login failed');
      }
    } catch (err) {
      setLocalError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f0a] to-[#1a1f1a] flex items-center justify-center pt-32 pb-12 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7ED957]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#7ED957]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 p-3 bg-[#7ED957]/10 border border-[#7ED957]/30 rounded-xl">
            <img src={cityscapeLogo} alt="CivicCare Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Supervisor <span className="text-[#7ED957]">Portal</span>
          </h1>
          <p className="text-gray-400 text-lg">Access your supervision dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] border-2 border-[#7ED957]/20 rounded-2xl shadow-2xl shadow-[#7ED957]/10 p-8 backdrop-blur-xl">
          {/* Error Alert */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl flex items-start gap-3 animate-shake">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold text-red-400">Login Failed</p>
                <p className="text-red-300 text-sm mt-1">{displayError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 placeholder-gray-600"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 placeholder-gray-600"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7ED957] transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#7ED957] to-[#9EF76E] text-[#0a0f0a] rounded-xl font-bold text-lg hover:from-[#9EF76E] hover:to-[#7ED957] transition-all duration-300 shadow-lg hover:shadow-[#7ED957]/30 disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:shadow-none"
            >
              {isLoading ? 'Logging in...' : 'Access Supervisor Portal'}
            </button>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-[#7ED957]/5 border border-[#7ED957]/20 rounded-xl">
              <p className="text-sm text-gray-300 text-center">
                <span className="font-semibold text-[#7ED957]">Supervisor Account?</span>
                <br />
                Enter your assigned supervisor credentials to access your dashboard.
              </p>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-400">
            Not a supervisor?{' '}
            <Link to="/login" className="text-[#7ED957] hover:underline font-semibold">
              Citizen Login
            </Link>
          </p>
          <p className="text-gray-400">
            Administrator?{' '}
            <Link to="/admin-login" className="text-white hover:text-[#7ED957] hover:underline font-semibold">
              Admin Portal
            </Link>
          </p>
          <p className="text-gray-500 text-sm">
            <Link to="/" className="text-[#7ED957] hover:underline">
              {'<- Back to Home'}
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};


