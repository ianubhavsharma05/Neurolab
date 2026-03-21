import React from 'react';
import { motion } from 'framer-motion';

interface StaggeredHeadingProps {
  text: string;
  className?: string;
}

const StaggeredHeading: React.FC<StaggeredHeadingProps> = ({ text, className }) => {
  const letters = text.split('');
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.1 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      textShadow: '0 0 30px rgba(0,245,155,0.5)',
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 120,
      },
    },
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.8,
      textShadow: '0 0 0px rgba(0,245,155,0)',
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 120,
      },
    },
  };

  return (
    <motion.h1
      style={{ overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={className}
    >
      {letters.map((letter, index) => (
        <motion.span
          variants={child}
          whileTap={{ scale: 1.35, textShadow: '0 0 50px rgba(0,245,155,1)', cursor: 'pointer' }}
          whileHover={{ scale: 1.15 }}
          key={index}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.h1>
  );
};

export default StaggeredHeading;
