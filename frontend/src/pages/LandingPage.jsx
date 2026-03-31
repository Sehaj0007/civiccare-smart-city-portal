import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cityscapeLogo from '../assets/cityscape_logo.png';

export const LandingPage = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const heroSlides = [
    {
      title: "Smart City Solutions",
      description: "Report civic issues instantly and track their resolution in real-time. Your voice matters in building a better city."
    },
    {
      title: "Transparent Governance",
      description: "Monitor complaint progress with complete transparency. Know exactly who's handling your concern and when."
    },
    {
      title: "Community Powered",
      description: "Join thousands of citizens making a difference. Together, we create cleaner, safer, and smarter cities."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white">
      {/* Hero Section */}
      <div id="home" className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#7ED957]/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#7ED957]/5 rounded-full blur-3xl animate-pulse-slower"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `linear-gradient(#7ED957 1px, transparent 1px), linear-gradient(90deg, #7ED957 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-32 relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 bg-[#7ED957]/10 border border-[#7ED957]/30 rounded-full text-[#7ED957] text-sm font-semibold animate-fade-in">
                  Smart City Initiative
                </span>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold leading-tight animate-slide-up">
                <span className="text-white">CIVIC</span>
                {/* <br /> */}
                <span className="text-[#7ED957] animate-glow">&nbsp;CARE</span>
              </h1>

              <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 w-2 h-2 bg-[#7ED957] rounded-full"></div>
                  <p className="text-xl text-gray-300 leading-relaxed">
                    {heroSlides[activeSlide].title}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1.5 w-2 h-2 bg-[#7ED957] rounded-full"></div>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    {heroSlides[activeSlide].description}
                  </p>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="flex gap-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      activeSlide === index ? 'w-12 bg-[#7ED957]' : 'w-8 bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <Link
                  to="/register"
                  className="group relative px-8 py-4 bg-[#7ED957] text-[#0a0f0a] rounded-lg font-bold text-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#7ED957]/50 hover:scale-105"
                >
                  <span className="relative z-10">Register Now</span>
                  <div className="absolute inset-0 bg-[#9EF76E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Link>
              </div>
            </div>

            {/* Right Content - Decorative Circle */}
            <div className="relative hidden md:block">
              <div className="relative w-full h-[500px]">
                {/* Main Circle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[450px] h-[450px]">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-[#7ED957]/30 animate-spin-slow"></div>
                    
                    {/* Middle Ring */}
                    <div className="absolute inset-8 rounded-full border-2 border-[#7ED957]/20 animate-spin-reverse"></div>
                    
                    {/* Inner Circle with Icon */}
                    <div className="absolute inset-16 rounded-full bg-gradient-to-br from-[#7ED957]/20 to-[#7ED957]/5 backdrop-blur-xl flex items-center justify-center">
                      <div className="absolute inset-16 rounded-full bg-gradient-to-br from-[#7ED957]/20 to-[#7ED957]/5 backdrop-blur-xl flex items-center justify-center">
                      <img src={cityscapeLogo} alt="CivicCare Logo" className="w-32 h-32 animate-float" />
                    </div>
                    </div>

                    {/* Floating Icons */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-16 h-16 bg-[#7ED957]/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-[#7ED957]/20 animate-float" style={{ animationDelay: '0s' }}>
                      <span className="text-3xl">📝</span>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 w-16 h-16 bg-[#7ED957]/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-[#7ED957]/20 animate-float" style={{ animationDelay: '1s' }}>
                      <span className="text-3xl">📊</span>
                    </div>
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-4 w-16 h-16 bg-[#7ED957]/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-[#7ED957]/20 animate-float" style={{ animationDelay: '2s' }}>
                      <span className="text-3xl">👥</span>
                    </div>
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-4 w-16 h-16 bg-[#7ED957]/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-[#7ED957]/20 animate-float" style={{ animationDelay: '3s' }}>
                      <span className="text-3xl">🔧</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0a] via-[#0f140f] to-[#0a0f0a]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-white">Key </span>
              <span className="text-[#7ED957]">Features</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful tools designed to make civic engagement seamless and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: '📝',
                title: 'Raise Complaints',
                desc: 'Submit civic complaints with images and detailed descriptions for faster resolution'
              },
              {
                emoji: '📊',
                title: 'Real-Time Tracking',
                desc: 'Track your complaint status in real-time with instant push notifications'
              },
              {
                emoji: '👥',
                title: 'Transparent Process',
                desc: 'Know who is handling your complaint and monitor progress at every step'
              },
              {
                emoji: '🔧',
                title: 'Admin Management',
                desc: 'Efficiently assign complaints to teams or escalate to ward offices'
              },
              {
                emoji: '📈',
                title: 'Analytics Dashboard',
                desc: 'View comprehensive statistics and performance metrics for all departments'
              },
              {
                emoji: '🏙️',
                title: 'Services',
                desc: 'Report issues across all civic needs from Waste to Security management'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative bg-[#0f140f] p-8 rounded-2xl border border-[#7ED957]/10 hover:border-[#7ED957]/30 transition-all duration-500 hover:transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Hover Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#7ED957]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="text-5xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                    {feature.emoji}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-[#7ED957] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#7ED957]/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complaint Categories */}
      <div id="categories" className="py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#7ED957]/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#7ED957]/30 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-white">Complaint </span>
              <span className="text-[#7ED957]">Categories</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Comprehensive coverage of all civic infrastructure aspects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { emoji: '🗑️', title: 'Waste Management', desc: 'Garbage collection, recycling, and proper disposal' },
              { emoji: '🚗', title: 'Potholes / Roads', desc: 'Road damage, potholes, and maintenance issues' },
              { emoji: '⚡', title: 'Electricity', desc: 'Streetlights, power faults, and electrical problems' },
              { emoji: '🏗️', title: 'Public Property', desc: 'Benches, public toilets, and signage maintenance' },
              { emoji: '📱', title: 'E-Waste', desc: 'Electronic waste collection and safe disposal' },
              { emoji: '🔒', title: 'Security', desc: 'Safety concerns and suspicious activity reporting' },
              { emoji: '\u{1F4A7}', title: 'Water Supply', desc: 'Leakage, low pressure, contamination, and pipeline issues' },
              { emoji: '\u{1F6B0}', title: 'Drainage & Sewage', desc: 'Blocked drains, sewage overflow, and waterlogging complaints' },
              { emoji: '\u{1F333}', title: 'Parks & Greenery', desc: 'Tree trimming, park maintenance, and damaged public garden spaces' },
              { emoji: '\u{1F6A6}', title: 'Traffic Signals', desc: 'Faulty traffic lights, road markings, and junction safety issues' },
              { emoji: '\u{1F415}', title: 'Stray Animals', desc: 'Report stray animal concerns, rescue needs, and nuisance incidents' },
              { emoji: '\u{1F3E5}', title: 'Public Health', desc: 'Unsanitary areas, mosquito breeding, and local health risk complaints' },
            ].map((cat, idx) => (
              <div 
                key={idx} 
                className="group relative bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] p-8 rounded-2xl border border-[#7ED957]/10 hover:border-[#7ED957]/40 transition-all duration-500 hover:transform hover:-translate-y-2 text-center overflow-hidden"
              >
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: 'linear-gradient(90deg, #7ED957, transparent, #7ED957)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 3s infinite',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  padding: '2px'
                }}></div>

                <div className="text-6xl mb-4 transform transition-all duration-300 group-hover:scale-110 inline-block">
                  {cat.emoji}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-[#7ED957] transition-colors duration-300">
                  {cat.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div id="impact" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7ED957]/5 via-transparent to-[#7ED957]/5"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-white">Our </span>
              <span className="text-[#7ED957]">Impact</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '10,000+', label: 'Complaints Resolved', icon: '✓' },
              { number: '5,000+', label: 'Active Citizens', icon: '👥' },
              { number: '98%', label: 'Satisfaction Rate', icon: '⭐' }
            ].map((stat, idx) => (
              <div 
                key={idx} 
                className="group relative bg-gradient-to-br from-[#0f140f] to-[#1a1f1a] p-10 rounded-2xl border border-[#7ED957]/20 hover:border-[#7ED957]/50 transition-all duration-500 text-center overflow-hidden"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#7ED957]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{stat.icon}</div>
                  <div className="text-6xl font-bold mb-4 text-[#7ED957] group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-xl text-gray-300 font-medium">{stat.label}</div>
                </div>

                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7ED957] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7ED957]/10 via-transparent to-[#7ED957]/5"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7ED957]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Ready to Make a </span>
            <span className="text-[#7ED957]">Difference?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join thousands of citizens working together to make our city better, cleaner, and safer for everyone.
          </p>
          <Link
            to="/register"
            className="inline-block group relative px-12 py-5 bg-[#7ED957] text-[#0a0f0a] rounded-xl font-bold text-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#7ED957]/50 hover:scale-105"
          >
            <span className="relative z-10">Get Started Today</span>
            <div className="absolute inset-0 bg-[#9EF76E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#7ED957]/10 py-16 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">
                  <img src={cityscapeLogo} alt="CivicCare Logo" className="w-10 h-10" />
                </span>
                <span className="text-3xl font-bold">
                  <span className="text-white">Civic</span>
                  <span className="text-[#7ED957]">Care</span>
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Making our cities smarter and more responsive to citizen needs through technology and transparency.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-[#7ED957]">Quick Links</h4>
              <div className="flex flex-col gap-3">
                <a href="#home" className="text-gray-400 hover:text-[#7ED957] transition-colors duration-200">Home</a>
                <a href="#features" className="text-gray-400 hover:text-[#7ED957] transition-colors duration-200">Features</a>
                <a href="#categories" className="text-gray-400 hover:text-[#7ED957] transition-colors duration-200">Categories</a>
                <a href="#impact" className="text-gray-400 hover:text-[#7ED957] transition-colors duration-200">Impact</a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-[#7ED957]">Legal</h4>
              <div className="flex flex-col gap-3">
                <Link
                  to="/privacy-policy"
                  className="text-gray-400 hover:text-[#7ED957] transition-colors duration-200"
                >
                  Privacy Policy
                </Link>

                <Link
                  to="/terms-and-conditions"
                  className="text-gray-400 hover:text-[#7ED957] transition-colors duration-200"
                >
                  Terms of Service
                </Link>

                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-[#7ED957] transition-colors duration-200"
                >
                  Contact
                </Link>
              </div>

            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-[#7ED957]/10 text-center">
            <p className="text-gray-500">
              © 2026 CivicCare. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(126, 217, 87, 0.5); }
          50% { text-shadow: 0 0 40px rgba(126, 217, 87, 0.8), 0 0 60px rgba(126, 217, 87, 0.6); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }

        @keyframes pulse-slower {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.15; }
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};
