import React from 'react';
import { motion } from 'framer-motion';

export function Scene6() {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center px-[10vw]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="w-[50%] pr-[5vw]">
        <motion.div 
          className="bg-gradient-to-br from-[#2a1d21] to-[#1F1518] border border-[#C4847A]/40 p-[3vw] rounded-2xl shadow-2xl"
          initial={{ y: 50, opacity: 0, rotateX: 20 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          transition={{ duration: 1.2, type: 'spring' }}
          style={{ perspective: 1000 }}
        >
          <div className="text-[#C4847A] font-serif text-[1.5vw] uppercase tracking-widest mb-2">Professional Review</div>
          <h3 className="text-[3vw] font-serif text-white leading-tight mb-6">Opus One 2018</h3>
          
          <div className="flex gap-4 mb-8">
            {['Blackberry', 'Cassis', 'Leather', 'Graphite'].map((aroma, i) => (
              <span key={i} className="px-4 py-2 bg-[#C4847A]/20 text-[#C4847A] text-[1vw] rounded-full border border-[#C4847A]/30">
                {aroma}
              </span>
            ))}
          </div>

          <p className="text-[1.2vw] text-white/80 leading-relaxed italic">
            "An extraordinary expression of terroir. The structural balance between the refined tannins and vibrant acidity ensures incredible aging potential."
          </p>
        </motion.div>
      </div>
      
      <div className="w-[40%]">
        <motion.h2 
          className="text-[4vw] text-white font-serif leading-tight mb-4"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          Sommelier-Grade<br/>Insights
        </motion.h2>
      </div>
    </motion.div>
  );
}
