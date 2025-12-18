import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Brain, Hand, Grid3X3, Puzzle } from 'lucide-react';

interface GameTypeCardProps {
  type: 'quiz' | 'drag_drop' | 'memory' | 'puzzle';
  title: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  topicId: string;
  gameId?: string;
}

const gameTypeConfig = {
  quiz: {
    icon: Brain,
    color: 'from-primary to-pink-500',
    bgColor: 'bg-primary/10',
  },
  drag_drop: {
    icon: Hand,
    color: 'from-secondary to-cyan-500',
    bgColor: 'bg-secondary/10',
  },
  memory: {
    icon: Grid3X3,
    color: 'from-purple to-violet-500',
    bgColor: 'bg-purple/10',
  },
  puzzle: {
    icon: Puzzle,
    color: 'from-orange to-amber-500',
    bgColor: 'bg-orange/10',
  },
};

const difficultyColors = {
  easy: 'bg-success text-success-foreground',
  medium: 'bg-warning text-warning-foreground',
  hard: 'bg-destructive text-destructive-foreground',
};

const difficultyLabels = {
  easy: 'Mudah',
  medium: 'Sedang',
  hard: 'Sulit',
};

export function GameTypeCard({ type, title, description, difficulty = 'medium', topicId, gameId }: GameTypeCardProps) {
  const config = gameTypeConfig[type];
  const Icon = config.icon;

  return (
    <Link to={`/play/${type}/${topicId}${gameId ? `/${gameId}` : ''}`} className="block">
      <div className="game-card group cursor-pointer overflow-hidden">
        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity', config.color)} />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', config.bgColor)}>
              <Icon className="w-7 h-7 text-foreground" />
            </div>
            <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', difficultyColors[difficulty])}>
              {difficultyLabels[difficulty]}
            </span>
          </div>
          
          <h3 className="font-bold text-lg text-card-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          
          <div className="mt-4 flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
            Main Sekarang →
          </div>
        </div>
      </div>
    </Link>
  );
}
