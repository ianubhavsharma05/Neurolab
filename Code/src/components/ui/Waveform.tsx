import React from 'react';
import { motion } from 'framer-motion';

interface WaveformProps {
  data: number[];
  width?: number;
  height?: number;
}

const Waveform: React.FC<WaveformProps> = ({ data = [], width = 600, height = 120 }) => {
  const barWidth = data?.length > 0 ? width / data.length : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-3 overflow-hidden">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {data.map((val, i) => {
          const barH = Math.abs(val) * height * 0.8;
          return (
            <motion.rect
              key={i}
              x={i * barWidth}
              y={(height - barH) / 2}
              width={Math.max(barWidth - 1, 1)}
              height={barH}
              rx={1}
              fill="hsl(var(--primary))"
              opacity={0.6 + Math.abs(val) * 0.4}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.003, duration: 0.2 }}
              style={{ transformOrigin: 'center' }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default Waveform;
