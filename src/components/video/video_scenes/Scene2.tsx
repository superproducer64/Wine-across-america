import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-between px-[10vw]"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[40%]">
        <motion.h2 
          className="text-[4vw] text-[#C4847A] leading-tight" 
          style={{ fontFamily: 'Playfair Display, serif' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Intelligent<br/>Label Scanning
        </motion.h2>
        <motion.p 
          className="mt-6 text-[1.2vw] text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 1 ? 1 : 0 }}
        >
          GPT-4o Vision instantly reads and catalogs your wine labels.
        </motion.p>
      </div>

      <div className="w-[45%] relative aspect-[3/4] bg-black/40 border border-[#C4847A]/30 rounded-xl overflow-hidden backdrop-blur-sm">
        <motion.img 
          src={`${import.meta.env.BASE_URL}images/wine-bottle.jpg`}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 4 }}
        />
        
        {/* Scanning effect */}
        {phase >= 1 && (
          <motion.div 
            className="absolute left-0 right-0 h-[2px] bg-[#C4847A] shadow-[0_0_15px_#C4847A]"
            initial={{ top: '10%' }}
            animate={{ top: '90%' }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          />
        )}

        {/* Scanned Data */}
        {phase >= 2 && (
          <motion.div 
            className="absolute bottom-8 left-8 right-8 bg-[#1F1518]/90 backdrop-blur border border-[#C4847A]/50 p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-[1.5vw] font-serif text-[#C4847A] uppercase tracking-wider mb-2">Château Margaux</div>
            <div className="flex justify-between text-white/80 text-[1vw]">
              <span>Bordeaux Blend</span>
              <span>2015</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
