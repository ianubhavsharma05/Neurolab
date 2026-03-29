import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Brain, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const copy = language === 'hi'
    ? {
        subtitle: 'संज्ञानात्मक इंटेलिजेंस प्लेटफॉर्म',
        activeNode: 'सक्रिय उपयोगकर्ता',
        terminateSession: 'सेशन समाप्त करें',
        getStarted: 'शुरू करें',
      }
    : {
        subtitle: 'Cognitive Intelligence Platform',
        activeNode: 'Active Node',
        terminateSession: 'Terminate session',
        getStarted: 'Get Started',
      };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = isAuthenticated ? [
    {
      label: language === 'hi' ? 'इंटेलिजेंस हब' : 'Intelligence Hub',
      path: '/dashboard',
    },
    {
      label: language === 'hi' ? 'एमआरआई विश्लेषण' : 'MRI Analysis',
      path: '/mri',
    },
    {
      label: language === 'hi' ? 'वोकल पैटर्न' : 'Vocal Patterns',
      path: '/speech',
    },
    {
      label: language === 'hi' ? 'सेशन मैट्रिक्स' : 'Session Matrix',
      path: '/reports',
    },
    {
      label: language === 'hi' ? 'क्लीनिकल कमांड' : 'Clinician Command',
      path: '/doctor',
    },
    {
      label: 'System Root',
      path: '/admin',
    },
  ] : [
    {
      label: language === 'hi' ? 'मुख्य क्षमताएं' : 'Core Capabilities',
      path: '/about',
    },
    {
      label: language === 'hi' ? 'सिस्टम ओवरव्यू' : 'System Overview',
      path: '/about',
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#03040a]/80 backdrop-blur-2xl border-b border-white/5">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                <Brain className="w-6 h-6 text-primary group-hover:text-black transition-colors" />
              </div>
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-xl tracking-tighter text-white">
                NEURO <span className="text-primary group-hover:text-white transition-colors">SENSE</span>{' '}
                <span className="text-sm text-primary">AI</span>
              </span>
              <span className="hidden sm:block text-[9px] font-mono uppercase tracking-[0.28em] text-white/35 mt-1">
                {copy.subtitle}
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[11px] font-mono uppercase tracking-[0.2em] transition-all duration-300 hover:text-primary ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-white/40'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] transition-colors ${
                  language === 'en' ? 'bg-primary text-black' : 'text-white/45'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${
                  language === 'hi' ? 'bg-primary text-black' : 'text-white/45'
                }`}
              >
                हिंदी
              </button>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">{copy.activeNode}</span>
                  <span className="text-xs font-semibold text-white/90">{user?.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-full border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 text-white/60 hover:text-red-400 text-[10px] font-mono uppercase tracking-widest transition-all"
                >
                  {copy.terminateSession}
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-black font-bold border-0 rounded-full px-8 h-10 shadow-[0_0_20px_rgba(0,245,155,0.2)]"
                >
                  {copy.getStarted}
                </Button>
              </Link>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-10 space-y-6 pt-6 border-t border-white/5 overflow-hidden"
            >
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] transition-colors ${
                    language === 'en' ? 'bg-primary text-black' : 'text-white/45'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${
                    language === 'hi' ? 'bg-primary text-black' : 'text-white/45'
                  }`}
                >
                  हिंदी
                </button>
              </div>
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-xl font-bold tracking-tighter transition-colors ${
                    location.pathname === item.path ? 'text-primary' : 'text-white/40'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-xl text-primary font-bold tracking-tighter">{copy.getStarted}</Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
