import React from 'react';
import { motion } from 'framer-motion';

export function Scene7() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#1F1518]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="text-center"
      >
        <h1 className="text-[5vw] font-bold text-[#C4847A] tracking-wider mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          POUR ACROSS AMERICA
        </h1>
        <motion.div 
          className="h-[1px] w-0 bg-[#C4847A] mx-auto mb-8"
          animate={{ w: "100%" }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <motion.p 
          className="text-[1.8vw] text-white/80 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          Master your palate.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
