import React from 'react';
import { motion } from 'framer-motion';

interface HeatmapProps {
  data: number[][];
  size?: number;
}

const Heatmap: React.FC<HeatmapProps> = ({ data, size = 300 }) => {
  const rows = data.length;
  const cols = data[0]?.length || 0;
  const cellW = size / cols;
  const cellH = size / rows;

  const getColor = (val: number) => {
    // Proper heat colormap: dark blue -> cyan -> yellow -> red
    const clamped = Math.max(0, Math.min(1, val));
    if (clamped < 0.25) {
      // Dark blue to cyan
      const t = clamped / 0.25;
      return `rgba(${Math.round(0 + t * 100)}, ${Math.round(50 + t * 150)}, ${Math.round(200 - t * 100)}, 0.8)`;
    } else if (clamped < 0.5) {
      // Cyan to yellow
      const t = (clamped - 0.25) / 0.25;
      return `rgba(${Math.round(100 + t * 155)}, ${Math.round(200 - t * 50)}, ${Math.round(100 - t * 100)}, 0.8)`;
    } else if (clamped < 0.75) {
      // Yellow to orange
      const t = (clamped - 0.5) / 0.25;
      return `rgba(255, ${Math.round(150 - t * 100)}, 0, 0.8)`;
    } else {
      // Orange to red
      const t = (clamped - 0.75) / 0.25;
      return `rgba(255, ${Math.round(50 - t * 50)}, 0, 0.8)`;
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-border" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {data.map((row, i) =>
          row.map((val, j) => (
            <motion.rect
              key={`${i}-${j}`}
              x={j * cellW}
              y={i * cellH}
              width={cellW}
              height={cellH}
              fill={getColor(val)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (i * cols + j) * 0.005, duration: 0.3 }}
            />
          ))
        )}
      </svg>
      <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs bg-card/80 backdrop-blur-sm rounded px-2 py-1">
        <span className="text-muted-foreground">Low</span>
        <div className="w-16 h-2 rounded-full" style={{ background: 'linear-gradient(to right, rgba(0,50,200,0.8), rgba(100,200,100,0.8), rgba(255,150,0,0.8), rgba(255,0,0,0.8))' }} />
        <span className="text-muted-foreground">High</span>
      </div>
    </div>
  );
};

export default Heatmap;
