import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain, ArrowRight } from 'lucide-react';
import StaggeredHeading from '@/components/ui/StaggeredHeading';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 1000], [0, 400]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -250]);
  const yText = useTransform(scrollY, [0, 800], [0, 250]);
  const opacityText = useTransform(scrollY, [0, 400], [1, 0]);

  const copy = language === 'hi'
    ? {
        badge: 'सिस्टम v2.4 ऑनलाइन',
        heading1: 'डायग्नोस्टिक का',
        heading2: 'भविष्य',
        heading3: 'इंटेलिजेंस',
        description: 'मेडिकल एक्सपर्ट सिस्टम और एडवांस एआई को मिलाकर मल्टीमॉडल सिंक्रोनाइज़्ड विश्लेषण के माध्यम से डिमेंशिया डिटेक्शन को नया रूप देना।',
        primaryButton: isAuthenticated ? 'इंटेलिजेंस हब खोलें' : 'असेसमेंट शुरू करें',
        secondaryButton: 'मुख्य क्षमताएं',
        innovation: 'स्ट्रक्चरल इनोवेशन',
        matrixTitle: 'कॉग्निटिव हेल्थ मैट्रिक्स में बदलाव',
        stats: [
          { val: '98.4%', label: 'डायग्नोस्टिक प्रिसिशन', desc: 'क्लिनिकल वैलिडेशन सेट्स में सत्यापित सटीकता।' },
          { val: '320k', label: 'डेटा पॉइंट्स', desc: 'हर सत्र में वोकल और स्ट्रक्चरल मार्कर्स का विश्लेषण।' },
        ],
        features: [
          'अर्ली डिटेक्शन सिनैप्टिक मैपिंग',
          'मल्टीमॉडल डेटा फ्यूजन इंजन',
          'पेशेंट-केंद्रित इंटेलिजेंस लॉग्स',
          'प्रेडिक्टिव कॉग्निटिव ट्राजेक्टरी',
        ],
      }
    : {
        badge: 'System v2.4 Online',
        heading1: 'Future of',
        heading2: 'Diagnostic',
        heading3: 'Intelligence',
        description: 'Fusing medical expert systems with advanced AI to redefine dementia detection through multimodal synchronized analysis.',
        primaryButton: isAuthenticated ? 'Enter Intelligence Hub' : 'Initialize Assessment',
        secondaryButton: 'Core Theory',
        innovation: 'Structural Innovation',
        matrixTitle: 'Revolutionizing Cognitive Health Matrix',
        stats: [
          { val: '98.4%', label: 'Diagnostic Precision', desc: 'Validated accuracy across clinical validation sets.' },
          { val: '320k', label: 'Data Points', desc: 'Vocal and structural markers analyzed per session.' },
        ],
        features: [
          'Early Detection Synaptic Mapping',
          'Multimodal Data Fusion Engine',
          'Patient-Centric Intelligence Logs',
          'Predictive Cognitive Trajectories',
        ],
      };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            style={{ y: yText, opacity: opacityText }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="max-w-6xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 shadow-[0_0_15px_rgba(0,245,155,0.2)] hover:shadow-[0_0_30px_rgba(0,245,155,0.4)] transition-shadow">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">{copy.badge}</span>
            </div>
            
            <div className="space-y-2">
              <StaggeredHeading 
                text={copy.heading1} 
                className="text-7xl md:text-9xl font-display font-bold text-white leading-[0.95] tracking-tighter drop-shadow-2xl"
              />
              <StaggeredHeading 
                text={copy.heading2} 
                className="text-7xl md:text-9xl font-display font-bold text-gradient leading-[0.95] tracking-tighter drop-shadow-2xl"
              />
              <StaggeredHeading 
                text={copy.heading3} 
                className="text-7xl md:text-9xl font-display font-bold text-white leading-[0.95] tracking-tighter drop-shadow-2xl"
              />
            </div>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mt-6 mb-16 font-light leading-relaxed border-l border-white/10 pl-8">
              {copy.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to={isAuthenticated ? '/dashboard' : '/login'}>
                <button className="bg-primary hover:bg-white text-black font-bold rounded-full px-12 h-16 text-lg transition-all duration-500 shadow-[0_0_40px_rgba(0,245,155,0.3)] group flex items-center gap-3">
                  {copy.primaryButton}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/about">
                <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full px-12 h-16 text-lg transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  {copy.secondaryButton}
                </button>
              </Link>
            </div>
            <motion.div
              style={{ x: "-50%" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ delay: 0.8, duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              className="absolute left-1/2 -bottom-40 w-full max-w-5xl pointer-events-none -z-10"
            >
              <img src="/brain-3d.png" alt="Brain Visualization" className="w-full h-auto object-contain blur-[2px]" />
            </motion.div>
          </motion.div>
        </div>

        {/* Dynamic Background Elements for Parallax */}
        <motion.div style={{ y: y1 }} className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[180px] rounded-full animate-pulse pointer-events-none" />
        <motion.div style={{ y: y2 }} className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />
      </section>
    </div>
  );
};

export default Home;
