'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, Maximize, 
  Settings, SkipBack, SkipForward, 
  VolumeX, Airplay, Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (Hls.isSupported() && url.endsWith('.m3u8')) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }

      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => setDuration(video.duration);
      
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('loadedmetadata', updateDuration);
      
      return () => {
        video.removeEventListener('timeupdate', updateTime);
        video.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [url]);

  const togglePlay = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="relative group w-full max-w-5xl mx-auto aspect-video bg-black rounded-[3rem] overflow-hidden shadow-[0_32px_128px_-32px_rgba(0,0,0,0.8)] border border-white/5">
      {/* Moteur Vidéo */}
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Overlay de Gradation Sombre (Cinématique) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* TITRE (TOP LEFT) */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        whileHover={{ y: 0, opacity: 1 }}
        className="absolute top-8 left-10 z-20 group-hover:opacity-100 opacity-0 transition-all duration-500"
      >
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black tracking-[0.2em] text-white">4K HDR</div>
          <h3 className="text-white font-black text-xl tracking-tighter italic uppercase drop-shadow-lg">{title}</h3>
        </div>
      </motion.div>

      {/* CONTROLES PRINCIPAUX (BOTTOM) */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-8 flex flex-col gap-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
        
        {/* Timeline (SeekBar) */}
        <div className="relative w-full group/track cursor-pointer py-2">
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
            <motion.div 
              className="h-full bg-blue-500 relative"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl scale-0 group-hover/track:scale-100 transition-transform" />
            </motion.div>
          </div>
        </div>

        {/* Barre de boutons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={togglePlay} className="transition-transform active:scale-90">
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white fill-white shadow-blue-500" />
              ) : (
                <Play className="w-8 h-8 text-white fill-white shadow-blue-500" />
              )}
            </button>

            <div className="flex items-center gap-4">
              <button onClick={() => setIsMuted(!isMuted)}>
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </button>
              <span className="text-xs font-black text-white/80 tabular-nums tracking-widest">
                {formatTime(currentTime)} <span className="text-white/30 mx-1">/</span> {formatTime(duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
              <Monitor className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">HLS Active</span>
            </div>
            
            <Settings className="w-5 h-5 text-white/70 hover:text-white cursor-pointer transition-colors" />
            <Maximize 
              className="w-5 h-5 text-white/70 hover:text-white cursor-pointer transition-colors" 
              onClick={() => videoRef.current?.requestFullscreen()}
            />
          </div>
        </div>
      </div>

      {/* Icône de Play géante au centre (Pulse effect) */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-24 h-24 bg-blue-600/20 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/20">
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}