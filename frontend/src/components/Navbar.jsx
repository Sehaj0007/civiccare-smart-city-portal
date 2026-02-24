import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import cityscapeLogo from '../assets/cityscape_logo.png';


export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrollY > 50 
        ? 'bg-[#0a0f0a]/95 backdrop-blur-xl shadow-lg shadow-[#7ED957]/10' 
        : 'bg-[#0a0f0a]/80 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <span className="text-4xl transition-transform duration-300 group-hover:scale-110 inline-block">
                <img src={cityscapeLogo} alt="CivicCare Logo" className="w-10 h-10" />
              </span>
              <div className="absolute -inset-2 bg-[#7ED957]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-white">Civic</span>
              <span className="text-[#7ED957]">Care</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' ? (
                  <>
                    <Link
                      to="/admin-dashboard"
                      className="text-gray-300 hover:text-[#7ED957] transition-colors duration-300 font-medium relative group"
                    >
                      Dashboard
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#7ED957] group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/raise-complaint"
                      className="text-gray-300 hover:text-[#7ED957] transition-colors duration-300 font-medium relative group"
                    >
                      Raise Complaint
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#7ED957] group-hover:w-full transition-all duration-300"></span>
                    </Link>
                    <Link
                      to="/my-complaints"
                      className="text-gray-300 hover:text-[#7ED957] transition-colors duration-300 font-medium relative group"
                    >
                      My Complaints
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#7ED957] group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-4 border-l border-[#7ED957]/30 pl-6 ml-2">
                  <span className="text-gray-300 font-medium">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-all duration-300 font-semibold hover:shadow-lg hover:shadow-red-500/30"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-[#7ED957] transition-colors duration-300 font-medium relative group"
                >
                  User Login
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#7ED957] group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/admin-login"
                  className="px-6 py-2.5 border border-[#7ED957] text-[#7ED957] rounded-lg hover:bg-[#7ED957] hover:text-[#0a0f0a] transition-all duration-300 font-semibold"
                >
                  Admin Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-[#7ED957] p-2 hover:bg-[#7ED957]/10 rounded-lg transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0f140f]/98 backdrop-blur-xl border-t border-[#7ED957]/20">
          <div className="px-6 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 text-sm font-medium text-[#7ED957] border-b border-[#7ED957]/20 mb-3">
                  Hello, {user?.name}
                </div>
                {user?.role === 'ADMIN' ? (
                  <Link
                    to="/admin-dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block text-gray-300 hover:text-[#7ED957] hover:bg-[#7ED957]/10 px-4 py-3 rounded-lg transition-all duration-300"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/raise-complaint"
                      onClick={() => setIsOpen(false)}
                      className="block text-gray-300 hover:text-[#7ED957] hover:bg-[#7ED957]/10 px-4 py-3 rounded-lg transition-all duration-300"
                    >
                      Raise Complaint
                    </Link>
                    <Link
                      to="/my-complaints"
                      onClick={() => setIsOpen(false)}
                      className="block text-gray-300 hover:text-[#7ED957] hover:bg-[#7ED957]/10 px-4 py-3 rounded-lg transition-all duration-300"
                    >
                      My Complaints
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left block bg-red-500/90 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-all duration-300 mt-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-gray-300 hover:text-[#7ED957] hover:bg-[#7ED957]/10 px-4 py-3 rounded-lg transition-all duration-300"
                >
                  User Login
                </Link>
                <Link
                  to="/admin-login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center border border-[#7ED957] text-[#7ED957] hover:bg-[#7ED957] hover:text-[#0a0f0a] px-4 py-3 rounded-lg transition-all duration-300"
                >
                  Admin Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};