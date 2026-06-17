import React from 'react';
import { motion } from 'framer-motion';

export function Scene1() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h1 className="text-[6vw] font-bold text-[#C4847A] tracking-wider" style={{ fontFamily: 'Playfair Display, serif' }}>
          POUR ACROSS
        </h1>
        <h1 className="text-[6vw] font-bold text-[#C4847A] tracking-wider -mt-4" style={{ fontFamily: 'Playfair Display, serif' }}>
          AMERICA
        </h1>
        <motion.p 
          className="mt-6 text-[1.5vw] tracking-[0.2em] text-[#FDFBF7]/80 uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          Premium Wine Intelligence
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
