import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface SubjectCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  topicsCount?: number;
  progress?: number;
}

export function SubjectCard({ id, name, icon, color, topicsCount = 0, progress = 0 }: SubjectCardProps) {
  return (
    <Link to={`/subjects/${id}`} className="block">
      <div className="game-card group cursor-pointer">
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <h3 className="font-bold text-xl text-card-foreground mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{topicsCount} topik tersedia</p>
        
        {progress > 0 && (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold" style={{ color }}>{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: color }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
