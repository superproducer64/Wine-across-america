import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const steps = ["Basics", "Structure", "Aromas", "Score", "Notes"];

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1 }}
    >
      <h2 className="text-[3.5vw] text-[#C4847A] mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
        Guided Tasting Flow
      </h2>

      <div className="flex items-center gap-[2vw]">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <motion.div 
              className={`w-[12vw] py-[1.5vw] text-center border rounded-lg backdrop-blur-sm transition-colors duration-500
                ${phase >= index ? 'border-[#C4847A] bg-[#C4847A]/10 text-white' : 'border-white/10 bg-white/5 text-white/30'}
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="text-[1.2vw] font-medium tracking-wide uppercase">{step}</div>
            </motion.div>
            
            {index < steps.length - 1 && (
              <motion.div 
                className="w-[2vw] h-[2px]"
                initial={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                animate={{ backgroundColor: phase > index ? '#C4847A' : 'rgba(255,255,255,0.1)' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}
