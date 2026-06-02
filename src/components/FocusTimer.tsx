import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, CheckCircle } from 'lucide-react';
import { GameButton } from '@/components/ui/game-button';
import { useToast } from '@/hooks/use-toast';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_SETTINGS = {
  focus: { duration: 25 * 60, label: 'Fokus', icon: Brain, color: 'primary' },
  shortBreak: { duration: 5 * 60, label: 'Istirahat', icon: Coffee, color: 'success' },
  longBreak: { duration: 15 * 60, label: 'Istirahat Panjang', icon: Coffee, color: 'info' },
};

export function FocusTimer() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_SETTINGS.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play notification sound (browser notification)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('EduPlay Timer', {
        body: mode === 'focus' ? 'Waktu fokus selesai! Istirahat dulu ya 🎉' : 'Istirahat selesai! Yuk lanjut belajar 💪',
        icon: '🦊',
      });
    }

    if (mode === 'focus') {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      
      toast({
        title: '🎉 Sesi Fokus Selesai!',
        description: `Hebat! Kamu sudah menyelesaikan ${newSessions} sesi hari ini!`,
      });

      // After 4 focus sessions, take a long break
      if (newSessions % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(TIMER_SETTINGS.longBreak.duration);
      } else {
        setMode('shortBreak');
        setTimeLeft(TIMER_SETTINGS.shortBreak.duration);
      }
    } else {
      toast({
        title: '☕ Istirahat Selesai!',
        description: 'Yuk lanjut belajar lagi!',
      });
      setMode('focus');
      setTimeLeft(TIMER_SETTINGS.focus.duration);
    }
  };

  const toggleTimer = () => {
    // Request notification permission on first start
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_SETTINGS[mode].duration);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(TIMER_SETTINGS[newMode].duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((TIMER_SETTINGS[mode].duration - timeLeft) / TIMER_SETTINGS[mode].duration) * 100;
  const currentSettings = TIMER_SETTINGS[mode];
  const Icon = currentSettings.icon;

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl bg-${currentSettings.color}/10 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${currentSettings.color}`} />
          </div>
          <div>
            <h3 className="font-bold">Focus Timer</h3>
            <p className="text-xs text-muted-foreground">Teknik Pomodoro</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-full px-2 py-1">
          <CheckCircle className="w-4 h-4 text-success" />
          <span className="text-sm font-bold">{sessionsCompleted}</span>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(TIMER_SETTINGS) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              mode === m
                ? `bg-${TIMER_SETTINGS[m].color}/20 text-${TIMER_SETTINGS[m].color}`
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {TIMER_SETTINGS[m].label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke={`hsl(var(--${currentSettings.color}))`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          
          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black">{formatTime(timeLeft)}</span>
            <span className="text-sm text-muted-foreground">{currentSettings.label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <GameButton
          variant="outline"
          size="sm"
          onClick={resetTimer}
          className="w-12 h-12 rounded-full p-0"
        >
          <RotateCcw className="w-5 h-5" />
        </GameButton>
        <GameButton
          variant={isRunning ? 'secondary' : 'primary'}
          size="lg"
          onClick={toggleTimer}
          className="w-16 h-16 rounded-full p-0"
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </GameButton>
      </div>

      {/* Tips */}
      <div className="mt-6 p-3 rounded-xl bg-muted/50 text-center">
        <p className="text-xs text-muted-foreground">
          💡 Tips: Fokus 25 menit, istirahat 5 menit. Setelah 4 sesi, istirahat 15 menit!
        </p>
      </div>
    </div>
  );
}
