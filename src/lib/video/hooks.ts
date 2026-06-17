import { useState, useEffect, useRef } from 'react';

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const scenes = Object.keys(durations);
  const [currentScene, setCurrentScene] = useState(0);
  const hasRecorded = useRef(false);

  useEffect(() => {
    (window as any).startRecording?.();

    let sceneIndex = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const advance = () => {
      const key = scenes[sceneIndex];
      const duration = durations[key];

      timeout = setTimeout(() => {
        sceneIndex++;
        if (sceneIndex >= scenes.length) {
          if (!hasRecorded.current) {
            hasRecorded.current = true;
            (window as any).stopRecording?.();
          }
          sceneIndex = 0;
        }
        setCurrentScene(sceneIndex);
        advance();
      }, duration);
    };

    advance();
    return () => clearTimeout(timeout);
  }, []);

  return { currentScene };
}
