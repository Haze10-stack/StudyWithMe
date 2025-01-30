import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Maximize2, Minimize2, Volume2, VolumeX, Clock, PauseCircle, PlayCircle } from 'lucide-react';
import './App.css'

const RainDrops = () => {
  return (
    <div className="rain-container absolute inset-0 pointer-events-none">
      {[...Array(100)].map((_, i) => (
        <div
          key={i}
          className="rain-drop"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.5 + Math.random() * 0.3}s`
          }}
        />
      ))}
    </div>
  );
};

export default function StudyTimer() {
  const [studyTime, setStudyTime] = useState(30);
  const [remaining, setRemaining] = useState(studyTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTitle, setShowTitle] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => {
        if (!isMuted) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', () => {});
        }
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (!isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMuted]);

  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    let interval;
    if (isRunning && remaining > 0 && !isPaused) {
      interval = setInterval(() => {
        setRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, remaining, isPaused]);

  const startTimer = () => {
    setIsRunning(true);
    setRemaining(studyTime * 60);
    setIsPaused(false);
    setShowTitle(false);
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const toggleAudio = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleVolumeChange = (value) => {
    setVolume(value[0]);
    if (value[0] === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg2.png')", opacity:0.6 }}

      />

      <RainDrops />

      <audio ref={audioRef} src="/rain.mp3" loop />

      {/* Audio Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-background/10 p-2 rounded-lg backdrop-blur-md border border-white/10">
          <Button
            onClick={toggleAudio}
            variant="ghost"
            className="hover:bg-background/20 text-white"
            size="icon"
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          <div className="w-24">
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
        </div>
        <Button
          onClick={toggleFullscreen}
          variant="ghost"
          className="bg-background/10 hover:bg-background/20 backdrop-blur-md border border-white/10 text-white shadow-lg transition-all duration-300 hover:shadow-white/20"
          size="icon"
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>

      {/* la la la la  */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full">
        <AnimatePresence>
          {showTitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-4"
            >
              <h1 className="typewriter-wrapper font-space-grotesk font-bold tracking-tight">
                <span className="typewriter-modern bg-clip-text text-8xl text-transparent bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
                  Study With Me
                </span>
              </h1>
              <p className="text-3xl text-gray-300 font-outfit animate-fade-in">
                Set your timer to begin the journey
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          {!showTitle && (
            <div className="text-9xl font-bold text-white mb-8 select-none">
              {formatTime(remaining)}
            </div>
          )}

          {!isRunning && !isPaused && (
            <motion.div
              className="flex flex-col gap-6 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex gap-6 justify-center items-end">
                <div className="space-y-2">
                  <label className="block text-xl text-gray-300 font-medium">Study Duration</label>
                  <Input
                    type="number"
                    value={studyTime}
                    onChange={(e) => setStudyTime(Number(e.target.value))}
                    className="w-48 h-14 text-xl text-center bg-background/20 backdrop-blur-md border-gray-600/10 text-white focus:ring-2 focus:ring-gray-400/50 rounded-lg shadow-md"
                  />
                </div>
                <Button 
                  onClick={startTimer}
                  className="group relative px-8 py-6 bg-gradient-to-br from-[#B5828C] via-[#FFB4A2] to-[#FFB4A2] rounded-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:shadow-[#E5989B]/20 transition-all duration-300 backdrop-blur-md border border-white/10 hover:scale-105"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5 group-hover:animate-spin" />
                    Start Focus Session
                  </span>
                </Button>
              </div>
            </motion.div>
          )}

          {isRunning && !isPaused && (
            <div className="flex gap-6 justify-center mt-8">
              <Button 
                onClick={handlePauseResume}
                className="group relative px-8 py-6 bg-gradient-to-br from-[#DEAA79] to-[#F0BB78] rounded-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 backdrop-blur-md border border-white/10 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <PauseCircle className="w-5 h-5 group-hover:animate-spin" />
                  Pause Timer
                </span>
              </Button>
            </div>
          )}

          {isPaused && (
            <div className="flex gap-6 justify-center mt-8">
              <Button 
                onClick={handlePauseResume}
                className="group relative px-8 py-6 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 backdrop-blur-md border border-white/10 hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 group-hover:animate-spin" />
                  Resume Timer
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}