import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video/hooks';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';

const SCENE_DURATIONS = {
  intro: 4000,
  scan: 6000,
  flow: 6000,
  radar: 6000,
  compare: 6000,
  card: 6000,
  outro: 4000
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1F1518] text-[#FDFBF7]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      
      {/* Background layer */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}images/burgundy-bg.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          animate={{ scale: [1, 1.05, 1], filter: ['blur(0px)', 'blur(4px)', 'blur(0px)'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1518] via-transparent to-[#1F1518]/50" />
      </div>

      <AnimatePresence mode="wait">
        {currentScene === 0 && <Scene1 key="intro" />}
        {currentScene === 1 && <Scene2 key="scan" />}
        {currentScene === 2 && <Scene3 key="flow" />}
        {currentScene === 3 && <Scene4 key="radar" />}
        {currentScene === 4 && <Scene5 key="compare" />}
        {currentScene === 5 && <Scene6 key="card" />}
        {currentScene === 6 && <Scene7 key="outro" />}
      </AnimatePresence>
    </div>
  );
}
