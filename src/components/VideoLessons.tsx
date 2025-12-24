import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Clock, CheckCircle2, Lock, ChevronDown, ChevronUp,
  BookOpen, Star, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VideoPlayer } from './VideoPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

interface VideoLesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  video_provider: string;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  order_index: number;
  is_premium: boolean;
}

interface VideoProgress {
  video_id: string;
  completed: boolean;
  watched_seconds: number;
}

interface VideoLessonsProps {
  topicId: string;
  topicName: string;
}

export function VideoLessons({ topicId, topicName }: VideoLessonsProps) {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [progress, setProgress] = useState<Record<string, VideoProgress>>({});
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, [topicId]);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user, topicId]);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('video_lessons')
      .select('*')
      .eq('topic_id', topicId)
      .order('order_index');

    if (data) {
      setVideos(data);
      if (data.length > 0 && !selectedVideo) {
        // Auto-select first unwatched or first video
        const firstUnwatched = data.find(v => !progress[v.id]?.completed);
        setSelectedVideo(firstUnwatched || data[0]);
      }
    }
    setLoading(false);
  };

  const fetchProgress = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('video_progress')
      .select('video_id, completed, watched_seconds')
      .eq('user_id', user.id);

    if (data) {
      const progressMap: Record<string, VideoProgress> = {};
      data.forEach(p => {
        progressMap[p.video_id] = p;
      });
      setProgress(progressMap);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoSelect = (video: VideoLesson) => {
    if (video.is_premium && !isPremium) {
      toast.error('Video ini hanya untuk member Premium');
      return;
    }
    setSelectedVideo(video);
  };

  const completedCount = videos.filter(v => progress[v.id]?.completed).length;
  const progressPercent = videos.length > 0 ? (completedCount / videos.length) * 100 : 0;

  if (loading) {
    return (
      <div className="game-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-40 bg-muted rounded" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="game-card text-center py-8">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">Belum Ada Video</h3>
        <p className="text-muted-foreground">
          Video pembelajaran untuk topik ini akan segera tersedia
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={selectedVideo.id}
        >
          <VideoPlayer
            videoId={selectedVideo.id}
            videoUrl={selectedVideo.video_url}
            title={selectedVideo.title}
            provider={selectedVideo.video_provider as 'youtube' | 'vimeo' | 'self'}
            onComplete={() => {
              fetchProgress();
              toast.success('Video selesai! +50 XP');
            }}
          />
          <div className="mt-4">
            <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
            {selectedVideo.description && (
              <p className="text-muted-foreground mt-2">{selectedVideo.description}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Video List */}
      <div className="game-card">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-lg">Video Materi - {topicName}</h3>
            <Badge variant="secondary">
              {completedCount}/{videos.length} selesai
            </Badge>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {/* Progress */}
        <div className="mb-4">
          <Progress value={progressPercent} className="h-2" />
        </div>

        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="space-y-2"
          >
            {videos.map((video, index) => {
              const isCompleted = progress[video.id]?.completed;
              const isSelected = selectedVideo?.id === video.id;
              const isLocked = video.is_premium && !isPremium;

              return (
                <motion.button
                  key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
                    isSelected 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-muted/50 hover:bg-muted border-2 border-transparent'
                  } ${isLocked ? 'opacity-60' : ''}`}
                  whileHover={{ scale: isLocked ? 1 : 1.01 }}
                  whileTap={{ scale: isLocked ? 1 : 0.99 }}
                >
                  {/* Thumbnail or Number */}
                  <div className={`relative w-16 h-12 rounded-lg flex items-center justify-center ${
                    isCompleted ? 'bg-green-500/20' : 'bg-muted'
                  }`}>
                    {video.thumbnail_url ? (
                      <img 
                        src={video.thumbnail_url} 
                        alt={video.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-lg font-bold">{index + 1}</span>
                    )}
                    
                    {isLocked && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{video.title}</h4>
                      {video.is_premium && (
                        <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(video.duration_seconds)}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : isSelected ? (
                      <Play className="w-6 h-6 text-primary" />
                    ) : (
                      <Play className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
