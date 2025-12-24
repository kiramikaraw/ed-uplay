import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, CheckCircle2, Star, ChevronRight, BookOpen,
  Trophy, Sparkles, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface LearningPathNode {
  id: string;
  path_id: string;
  topic_id: string | null;
  title: string;
  description: string | null;
  xp_reward: number;
  order_index: number;
  prerequisite_node_id: string | null;
  position_x: number;
  position_y: number;
}

interface LearningPathData {
  id: string;
  name: string;
  description: string | null;
  education_level: string;
  subject_id: string | null;
  icon: string | null;
  color: string | null;
  nodes: LearningPathNode[];
}

interface UserProgress {
  node_id: string;
  completed: boolean;
}

interface LearningPathProps {
  subjectId?: string;
  educationLevel: string;
}

export function LearningPath({ subjectId, educationLevel }: LearningPathProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paths, setPaths] = useState<LearningPathData[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPathData | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaths();
  }, [subjectId, educationLevel]);

  useEffect(() => {
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchPaths = async () => {
    let query = supabase
      .from('learning_paths')
      .select('*')
      .eq('education_level', educationLevel as 'sd' | 'smp' | 'sma');

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data: pathsData } = await query.order('order_index');

    if (pathsData && pathsData.length > 0) {
      // Fetch nodes for each path
      const pathsWithNodes = await Promise.all(
        pathsData.map(async (path) => {
          const { data: nodes } = await supabase
            .from('learning_path_nodes')
            .select('*')
            .eq('path_id', path.id)
            .order('order_index');

          return {
            ...path,
            nodes: nodes || []
          };
        })
      );

      setPaths(pathsWithNodes);
      if (pathsWithNodes.length > 0) {
        setSelectedPath(pathsWithNodes[0]);
      }
    }
    setLoading(false);
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_path_progress')
      .select('node_id, completed')
      .eq('user_id', user.id);

    if (data) {
      const progressMap: Record<string, boolean> = {};
      data.forEach(p => {
        progressMap[p.node_id] = p.completed;
      });
      setUserProgress(progressMap);
    }
  };

  const isNodeUnlocked = (node: LearningPathNode) => {
    if (!node.prerequisite_node_id) return true;
    return userProgress[node.prerequisite_node_id] === true;
  };

  const handleNodeClick = (node: LearningPathNode) => {
    if (!isNodeUnlocked(node)) {
      toast.error('Selesaikan materi sebelumnya terlebih dahulu!');
      return;
    }

    if (node.topic_id) {
      navigate(`/subjects/${node.topic_id}`);
    }
  };

  const getCompletedCount = (nodes: LearningPathNode[]) => {
    return nodes.filter(n => userProgress[n.id]).length;
  };

  if (loading) {
    return (
      <div className="game-card animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-64 bg-muted rounded" />
      </div>
    );
  }

  if (paths.length === 0) {
    return (
      <div className="game-card text-center py-12">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">Belum Ada Learning Path</h3>
        <p className="text-muted-foreground">
          Learning path untuk jenjang ini akan segera tersedia
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Path Selector */}
      {paths.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {paths.map((path) => {
            const completed = getCompletedCount(path.nodes);
            const total = path.nodes.length;
            
            return (
              <Button
                key={path.id}
                variant={selectedPath?.id === path.id ? 'default' : 'outline'}
                onClick={() => setSelectedPath(path)}
                className="flex-shrink-0"
              >
                <span>{path.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {completed}/{total}
                </Badge>
              </Button>
            );
          })}
        </div>
      )}

      {/* Selected Path */}
      {selectedPath && (
        <div className="game-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {selectedPath.name}
              </h2>
              {selectedPath.description && (
                <p className="text-muted-foreground mt-1">{selectedPath.description}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold text-primary">
                {getCompletedCount(selectedPath.nodes)}/{selectedPath.nodes.length}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress 
            value={(getCompletedCount(selectedPath.nodes) / selectedPath.nodes.length) * 100} 
            className="h-3 mb-8"
          />

          {/* Skill Tree */}
          <div className="relative">
            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {selectedPath.nodes.map((node, index) => {
                if (index === 0) return null;
                const prevNode = selectedPath.nodes[index - 1];
                
                return (
                  <line
                    key={`line-${node.id}`}
                    x1={`${(index - 1) * (100 / (selectedPath.nodes.length - 1))}%`}
                    y1="50%"
                    x2={`${index * (100 / (selectedPath.nodes.length - 1))}%`}
                    y2="50%"
                    stroke={userProgress[prevNode.id] ? 'hsl(var(--primary))' : 'hsl(var(--muted))'}
                    strokeWidth="3"
                    strokeDasharray={userProgress[prevNode.id] ? '0' : '5,5'}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            <div className="flex justify-between items-center py-8 relative z-10">
              {selectedPath.nodes.map((node, index) => {
                const isCompleted = userProgress[node.id];
                const isUnlocked = isNodeUnlocked(node);
                const isNext = !isCompleted && isUnlocked;

                return (
                  <motion.button
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className={`relative flex flex-col items-center group ${
                      !isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    whileHover={isUnlocked ? { scale: 1.1 } : {}}
                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                  >
                    {/* Node Circle */}
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center
                      border-4 transition-all duration-300
                      ${isCompleted 
                        ? 'bg-green-500 border-green-400 text-white' 
                        : isNext
                          ? 'bg-primary border-primary/50 text-primary-foreground animate-pulse'
                          : isUnlocked
                            ? 'bg-muted border-muted-foreground/30'
                            : 'bg-muted/50 border-muted-foreground/20'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : isUnlocked ? (
                        isNext ? (
                          <Play className="w-8 h-8" />
                        ) : (
                          <Star className="w-8 h-8" />
                        )
                      ) : (
                        <Lock className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* XP Reward */}
                    <Badge 
                      variant={isCompleted ? 'default' : 'secondary'} 
                      className="mt-2"
                    >
                      +{node.xp_reward} XP
                    </Badge>

                    {/* Node Title */}
                    <div className="mt-2 text-center max-w-24">
                      <p className={`text-sm font-medium ${!isUnlocked ? 'text-muted-foreground' : ''}`}>
                        {node.title}
                      </p>
                    </div>

                    {/* Hover Info */}
                    {isUnlocked && node.description && (
                      <div className="absolute -top-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground p-3 rounded-lg shadow-lg text-sm w-48 pointer-events-none">
                        {node.description}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Completion Reward */}
          {getCompletedCount(selectedPath.nodes) === selectedPath.nodes.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border-2 border-yellow-500/30 text-center"
            >
              <Trophy className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
              <h3 className="text-xl font-bold">🎉 Selamat!</h3>
              <p className="text-muted-foreground">
                Kamu telah menyelesaikan learning path ini!
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
