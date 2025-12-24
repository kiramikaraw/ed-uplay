import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, X, Check, PictureInPicture2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface VideoPlayerProps {
  videoId: string;
  videoUrl: string;
  title: string;
  provider?: 'youtube' | 'vimeo' | 'self';
  onComplete?: () => void;
  onProgress?: (seconds: number) => void;
}

export function VideoPlayer({ 
  videoId, 
  videoUrl, 
  title, 
  provider = 'youtube',
  onComplete,
  onProgress 
}: VideoPlayerProps) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [savedProgress, setSavedProgress] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout>();

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  useEffect(() => {
    loadProgress();
  }, [videoId, user]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (user && currentTime > 0) {
        saveProgress();
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(saveInterval);
  }, [currentTime, user]);

  const loadProgress = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('video_progress')
      .select('watched_seconds')
      .eq('user_id', user.id)
      .eq('video_id', videoId)
      .maybeSingle();

    if (data?.watched_seconds) {
      setSavedProgress(data.watched_seconds);
    }
  };

  const saveProgress = async () => {
    if (!user) return;

    const completed = duration > 0 && currentTime >= duration * 0.9;

    await supabase
      .from('video_progress')
      .upsert({
        user_id: user.id,
        video_id: videoId,
        watched_seconds: Math.floor(currentTime),
        completed,
        last_watched_at: new Date().toISOString()
      }, { onConflict: 'user_id,video_id' });

    if (completed && onComplete) {
      onComplete();
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      onProgress?.(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (savedProgress > 0) {
        videoRef.current.currentTime = savedProgress;
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const vol = value[0];
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (videoRef.current) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // For YouTube embed
  if (provider === 'youtube') {
    const youtubeId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    
    return (
      <div ref={containerRef} className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onClick={handlePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          saveProgress();
        }}
      />

      {/* Play/Pause Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30"
          >
            <Button
              size="lg"
              variant="secondary"
              className="w-20 h-20 rounded-full"
              onClick={handlePlayPause}
            >
              <Play className="w-10 h-10" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={handlePlayPause}>
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                
                <Button size="icon" variant="ghost" onClick={() => skip(-10)}>
                  <SkipBack className="w-5 h-5" />
                </Button>
                
                <Button size="icon" variant="ghost" onClick={() => skip(10)}>
                  <SkipForward className="w-5 h-5" />
                </Button>

                <div className="flex items-center gap-2 ml-2">
                  <Button size="icon" variant="ghost" onClick={toggleMute}>
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-24"
                  />
                </div>

                <span className="text-sm text-white ml-4">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost">
                      {playbackRate}x
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {playbackRates.map((rate) => (
                      <DropdownMenuItem
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                      >
                        {rate === playbackRate && <Check className="w-4 h-4 mr-2" />}
                        {rate}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button size="icon" variant="ghost" onClick={togglePiP}>
                  <PictureInPicture2 className="w-5 h-5" />
                </Button>

                <Button size="icon" variant="ghost" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume from saved position */}
      {savedProgress > 0 && currentTime < 5 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 bg-black/70 rounded-lg p-3 flex items-center gap-3"
        >
          <span className="text-sm text-white">
            Lanjutkan dari {formatTime(savedProgress)}?
          </span>
          <Button
            size="sm"
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = savedProgress;
              }
            }}
          >
            Lanjut
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSavedProgress(0)}
          >
            <X className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
