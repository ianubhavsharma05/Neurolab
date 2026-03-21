import React from 'react';
import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number;
  size?: number;
  label?: string;
  mode?: 'risk' | 'precision';
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 200, label = 'Risk Score', mode = 'risk' }) => {
  const radius = (size - 20) / 2;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  
  const getColor = (s: number) => {
    if (mode === 'risk') {
      if (s < 33) return 'hsl(145, 65%, 42%)'; // Green (Low risk)
      if (s < 66) return 'hsl(38, 92%, 50%)'; // Yellow (Moderate risk)
      return 'hsl(0, 80%, 55%)'; // Red (High risk)
    } else {
      if (s >= 80) return 'hsl(145, 65%, 42%)'; // Green (High precision)
      if (s >= 50) return 'hsl(38, 92%, 50%)'; // Yellow (Moderate precision)
      return 'hsl(0, 80%, 55%)'; // Red (Low precision)
    }
  };

  const getLabel = (s: number) => {
    if (mode === 'risk') {
      if (s < 33) return 'Low Risk';
      if (s < 66) return 'Moderate';
      return 'High Risk';
    } else {
      if (s >= 80) return 'Precision: High';
      if (s >= 50) return 'Precision: Med';
      return 'Precision: Low';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        <path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <motion.path
          d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <text x={size / 2} y={size / 2 - 5} textAnchor="middle" className="fill-white font-display text-3xl font-bold">
          {Math.round(score)}%
        </text>
        <text x={size / 2} y={size / 2 + 18} textAnchor="middle" className="fill-white/40 text-[10px] font-mono uppercase tracking-widest">
          {getLabel(score)}
        </text>
      </svg>
      <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] font-medium">{label}</span>
    </div>
  );
};

export default RiskGauge;
