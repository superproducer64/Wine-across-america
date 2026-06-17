import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 1 }}
    >
      <h2 className="text-[3vw] text-white mb-12" style={{ fontFamily: 'Playfair Display, serif' }}>
        Side-by-Side Comparison
      </h2>

      <div className="flex items-center gap-[4vw] w-full max-w-[70vw]">
        {/* Left Card */}
        <motion.div 
          className="flex-1 bg-[#1F1518]/80 border border-[#C4847A]/30 p-8 rounded-xl backdrop-blur"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-[1vw] text-[#C4847A] uppercase">Left Bank Bordeaux</div>
          <div className="text-[2vw] font-serif text-white my-4">94 pts</div>
          <div className="h-[2px] bg-white/10 w-full mb-4" />
          <div className="text-[1vw] text-white/60">High Tannin • Medium Acidity</div>
        </motion.div>

        {/* VS */}
        <motion.div 
          className="w-[4vw] h-[4vw] rounded-full bg-[#C4847A] flex items-center justify-center text-[1.5vw] font-bold text-[#1F1518]"
          initial={{ scale: 0, rotate: -180 }}
          animate={phase >= 1 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{ type: 'spring' }}
        >
          VS
        </motion.div>

        {/* Right Card */}
        <motion.div 
          className="flex-1 bg-[#1F1518]/80 border border-[#C4847A]/30 p-8 rounded-xl backdrop-blur"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-[1vw] text-[#C4847A] uppercase">Napa Valley Cab</div>
          <div className="text-[2vw] font-serif text-white my-4">96 pts</div>
          <div className="h-[2px] bg-white/10 w-full mb-4" />
          <div className="text-[1vw] text-white/60">Med-High Tannin • Low Acidity</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
