import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const LoginPage = ({ isAdmin = false }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const normalizedEmail = formData.email.trim().toLowerCase();
    const result = await login(normalizedEmail, formData.password, isAdmin);

    if (result.success) {
      navigate(isAdmin ? '/admin-dashboard' : '/my-complaints');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center p-4 pt-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#7ED957]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#7ED957]/5 rounded-full blur-3xl animate-pulse-slower"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(#7ED957 1px, transparent 1px), linear-gradient(90deg, #7ED957 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] rounded-2xl shadow-2xl shadow-[#7ED957]/10 p-8 w-full max-w-md border border-[#7ED957]/20 backdrop-blur-xl animate-fadeIn">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <span className="text-6xl animate-bounce-gentle">🏛️</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">Civic</span>
            <span className="text-[#7ED957]">Care</span>
          </h1>
          <h2 className="text-xl font-semibold text-gray-400">
            {isAdmin ? 'Admin Login' : 'Citizen Login'}
          </h2>
          
          {/* Decorative Line */}
          <div className="mt-4 w-20 h-1 bg-gradient-to-r from-transparent via-[#7ED957] to-transparent mx-auto"></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 backdrop-blur-xl animate-shake">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#7ED957]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 placeholder-gray-500"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-[#7ED957]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-[#0a0f0a] border-2 border-[#7ED957]/30 text-white rounded-xl focus:outline-none focus:border-[#7ED957] focus:ring-2 focus:ring-[#7ED957]/20 transition-all duration-200 placeholder-gray-500"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#7ED957] to-[#9EF76E] text-[#0a0f0a] py-3 rounded-xl font-bold hover:from-[#9EF76E] hover:to-[#7ED957] disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 transition-all duration-300 flex justify-center items-center shadow-lg hover:shadow-[#7ED957]/30 hover:scale-105 transform disabled:scale-100 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Logging in...</span>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                Login
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            )}
          </button>
        </form>

        {/* Register Link for Citizens */}
        {!isAdmin && (
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#7ED957]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] text-gray-400">
                  Don't have an account?
                </span>
              </div>
            </div>
            
            <Link 
              to="/register" 
              className="mt-4 inline-block text-[#7ED957] hover:text-[#9EF76E] font-semibold transition-colors duration-200 group"
            >
              Register here
              <svg className="w-4 h-4 inline-block ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        )}

        {/* Admin Access Link for Citizen Login */}
        {!isAdmin && (
          <div className="mt-6 text-center">
            <Link 
              to="/admin-login" 
              className="text-sm text-gray-500 hover:text-[#7ED957] transition-colors duration-200"
            >
              Admin Access →
            </Link>
          </div>
        )}

        {/* Citizen Access Link for Admin Login */}
        {isAdmin && (
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-gray-500 hover:text-[#7ED957] transition-colors duration-200"
            >
              ← Citizen Login
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.1;
          }
        }

        @keyframes pulse-slower {
          0%, 100% {
            opacity: 0.03;
          }
          50% {
            opacity: 0.08;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
