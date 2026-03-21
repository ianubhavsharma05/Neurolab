import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const BrainModel3D: React.FC = () => {
  return (
    <div className="relative w-full aspect-square flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotateY: [0, 360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <Brain className="w-32 h-32 text-primary drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
      </motion.div>
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.5em] animate-pulse">Neural Scan Protocol Active</p>
      </div>
    </div>
  );
};

export default BrainModel3D;
