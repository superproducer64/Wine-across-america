import React from 'react';
import { motion } from 'framer-motion';

export function Scene4() {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-[10vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="w-[40%]">
        <motion.h2 
          className="text-[4vw] text-[#C4847A] leading-tight mb-6" 
          style={{ fontFamily: 'Playfair Display, serif' }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Visual Structure
        </motion.h2>
        <motion.p 
          className="text-[1.2vw] text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Evaluate Acidity, Body, Alcohol, Tannin, and Intensity with precise radar charts.
        </motion.p>
      </div>

      <div className="w-[45%] relative aspect-square flex items-center justify-center">
        {/* Mock Radar Chart */}
        <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] overflow-visible">
          {/* Grid */}
          {[20, 40, 60, 80, 100].map(r => (
            <motion.polygon 
              key={r}
              points="50,10 90,35 75,85 25,85 10,35"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
              style={{ transformOrigin: '50px 50px', transform: `scale(${r/100})` }}
            />
          ))}
          {/* Data Polygon */}
          <motion.polygon 
            points="50,10 90,35 75,85 25,85 10,35"
            fill="rgba(196, 132, 122, 0.3)"
            stroke="#C4847A"
            strokeWidth="1.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.1, 0.9, 1], opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            style={{ transformOrigin: '50px 50px' }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
