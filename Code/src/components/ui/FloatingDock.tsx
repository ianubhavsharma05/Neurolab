import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Brain, Mic, Activity, BarChart2, Home, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const NAV_ITEMS = [
  { id: 'home', icon: Home, path: '/', labelEn: 'Home', labelHi: 'होम' },
  { id: 'dashboard', icon: ArrowRight, path: '/dashboard', labelEn: 'Hub', labelHi: 'हब' },
  { id: 'mri', icon: Brain, path: '/mri', labelEn: 'MRI', labelHi: 'एमआरआई' },
  { id: 'speech', icon: Mic, path: '/speech', labelEn: 'Voice', labelHi: 'आवाज़' },
  { id: 'cognitive', icon: Activity, path: '/cognitive', labelEn: 'Cognitive', labelHi: 'कॉग्निटिव' },
  { id: 'reports', icon: BarChart2, path: '/reports', labelEn: 'Matrix', labelHi: 'मैट्रिक्स' },
];

const FloatingDock: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      // Show dock when scrolled down 100px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        // Option to keep visible or hide; for 'kree8' style, we usually show it when scrolled
        setIsVisible(true); 
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check immediately
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isAuthenticated && location.pathname !== '/') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        >
          <motion.div 
            layout
            className="flex items-center gap-4 px-6 py-4 rounded-full bg-white/[0.03] backdrop-blur-[24px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
            style={{ WebkitBackdropFilter: 'blur(24px)' }}
          >
            {NAV_ITEMS.map((item, i) => {
              const isActive = location.pathname === item.path;
              const isHovered = hoveredIndex === i;
              const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - i) : 100;
              
              // macOS dock style scale math
              const baseScale = 1;
              const hoverScale = 1.35;
              const neighborScale = 1.15;
              const scale = isHovered ? hoverScale : (distance === 1 ? neighborScale : baseScale);

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative group flex items-center justify-center transition-all"
                >
                  <motion.div
                    animate={{ scale }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer overflow-hidden ${
                      isActive ? 'bg-primary/20 border border-primary/50 text-white' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : ''}`} />
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-primary/10 rounded-full" 
                      />
                    )}
                  </motion.div>
                  
                  {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white whitespace-nowrap"
                    >
                        {language === 'hi' ? item.labelHi : item.labelEn}
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingDock;
