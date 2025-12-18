import { cn } from '@/lib/utils';
import { Crown, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
}

export function Leaderboard({ entries, title = 'Papan Peringkat' }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800/30 dark:to-slate-800/30';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30';
      default:
        return 'bg-card';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-lg">
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-accent" />
        {title}
      </h3>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl transition-all',
              getRankBg(entry.rank),
              entry.isCurrentUser && 'ring-2 ring-primary'
            )}
          >
            <div className="flex-shrink-0">{getRankIcon(entry.rank)}</div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
              {entry.avatar || entry.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('font-semibold truncate', entry.isCurrentUser && 'text-primary')}>
                {entry.name}
                {entry.isCurrentUser && ' (Kamu)'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{entry.score.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">poin</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
