import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceNote {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  createdAt: Date;
}

export const VoiceNotes = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newNote: VoiceNote = {
          id: Date.now().toString(),
          blob: audioBlob,
          url: audioUrl,
          duration: recordingTime,
          createdAt: new Date(),
        };
        
        setVoiceNotes((prev) => [newNote, ...prev]);
        setRecordingTime(0);
        
        stream.getTracks().forEach(track => track.stop());
        
        toast({
          title: "Rekaman Disimpan! 🎤",
          description: "Voice note berhasil direkam",
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Gagal Merekam",
        description: "Izinkan akses mikrofon untuk merekam",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playNote = (note: VoiceNote) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    if (playingId === note.id) {
      setPlayingId(null);
      return;
    }
    
    const audio = new Audio(note.url);
    audioRef.current = audio;
    
    audio.onended = () => setPlayingId(null);
    audio.play();
    setPlayingId(note.id);
  };

  const deleteNote = (id: string) => {
    const note = voiceNotes.find(n => n.id === id);
    if (note) {
      URL.revokeObjectURL(note.url);
    }
    setVoiceNotes((prev) => prev.filter((n) => n.id !== id));
    toast({
      title: "Dihapus",
      description: "Voice note berhasil dihapus",
    });
  };

  const downloadNote = (note: VoiceNote) => {
    const a = document.createElement('a');
    a.href = note.url;
    a.download = `voice-note-${note.id}.webm`;
    a.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          Voice Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-4">
          {isRecording ? (
            <motion.div
              className="flex items-center gap-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <motion.div
                className="w-4 h-4 rounded-full bg-destructive"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              <span className="text-lg font-semibold text-foreground">
                {formatTime(recordingTime)}
              </span>
              <Button
                onClick={stopRecording}
                variant="destructive"
                size="sm"
                className="rounded-full"
              >
                <Square className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <Button
              onClick={startRecording}
              className="rounded-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Mic className="h-5 w-5 mr-2" />
              Mulai Rekam
            </Button>
          )}
        </div>

        {/* Voice Notes List */}
        <AnimatePresence>
          {voiceNotes.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {voiceNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => playNote(note)}
                      className="h-8 w-8"
                    >
                      {playingId === note.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Voice Note #{voiceNotes.length - index}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(note.duration)} • {note.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => downloadNote(note)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteNote(note.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {voiceNotes.length === 0 && !isRecording && (
          <p className="text-center text-sm text-muted-foreground">
            Belum ada voice note. Mulai rekam sekarang!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
