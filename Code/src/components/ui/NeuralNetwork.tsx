import React from 'react';
import { motion } from 'framer-motion';

const NeuralNetwork: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
      <svg className="w-full h-full">
        {Array.from({ length: 45 }).map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          return (
            <React.Fragment key={i}>
              <motion.circle
                cx={`${startX}%`}
                cy={`${startY}%`}
                r={Math.random() * 2 + 1}
                fill="currentColor"
                className="text-primary"
                animate={{
                  opacity: [0.1, 0.6, 0.1],
                  scale: [1, 1.8, 1],
                  x: [0, Math.random() * 80 - 40, 0],
                  y: [0, Math.random() * 80 - 40, 0],
                }}
                transition={{
                  duration: Math.random() * 8 + 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 5,
                }}
              />
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

export default NeuralNetwork;
