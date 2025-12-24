import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  BookOpen, 
  Clock, 
  Trophy, 
  RotateCcw,
  Sparkles,
  Target,
  Brain
} from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description: string;
}

interface QuizModeSelectorProps {
  topic: Topic;
  onSelect: (mode: string) => void;
  onClose: () => void;
}

const quizModes = [
  {
    id: 'quick',
    name: 'Latihan Cepat',
    description: '5 soal dalam 5 menit',
    icon: Zap,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    questions: 5,
    timeLimit: 300,
    badge: 'Populer'
  },
  {
    id: 'practice',
    name: 'Latihan Lengkap',
    description: '10 soal dengan pembahasan',
    icon: BookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    questions: 10,
    timeLimit: 600,
    badge: null
  },
  {
    id: 'exam',
    name: 'Simulasi Ujian',
    description: '20 soal seperti ujian asli',
    icon: Clock,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    questions: 20,
    timeLimit: 1200,
    badge: 'Rekomendasi'
  },
  {
    id: 'challenge',
    name: 'Mode Tantangan',
    description: 'Soal bertingkat kesulitan',
    icon: Trophy,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    questions: 15,
    timeLimit: 900,
    badge: 'XP 2x'
  },
  {
    id: 'review',
    name: 'Review Soal',
    description: 'Ulang soal yang pernah salah',
    icon: RotateCcw,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    questions: 10,
    timeLimit: null,
    badge: null
  },
  {
    id: 'adaptive',
    name: 'Mode Adaptif',
    description: 'AI menyesuaikan tingkat kesulitan',
    icon: Brain,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    questions: 15,
    timeLimit: null,
    badge: 'AI'
  }
];

const QuizModeSelector = ({ topic, onSelect, onClose }: QuizModeSelectorProps) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Pilih Mode Latihan
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Topik: <span className="font-medium text-foreground">{topic.name}</span>
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {quizModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.id}
                className={`cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 ${mode.borderColor} ${mode.bgColor}`}
                onClick={() => onSelect(mode.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${mode.bgColor}`}>
                      <Icon className={`h-6 w-6 ${mode.color}`} />
                    </div>
                    {mode.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {mode.badge === 'AI' && <Sparkles className="h-3 w-3 mr-1" />}
                        {mode.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold mb-1">{mode.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{mode.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {mode.questions} soal
                    </span>
                    {mode.timeLimit && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {Math.floor(mode.timeLimit / 60)} menit
                      </span>
                    )}
                    {!mode.timeLimit && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Tanpa batas
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizModeSelector;
