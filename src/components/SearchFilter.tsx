import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, Gamepad2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchResult {
  id: string;
  type: 'game' | 'topic' | 'subject';
  title: string;
  difficulty?: string;
  game_type?: string;
  subject_name?: string;
}

export default function SearchFilter() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (query.length >= 2) searchContent();
    else { setResults([]); setShowResults(false); }
  }, [query]);

  const searchContent = async () => {
    try {
      const { data: games } = await supabase.from('games').select('id, title, description, difficulty, game_type').ilike('title', `%${query}%`).limit(10);
      const { data: subjects } = await supabase.from('subjects').select('id, name').ilike('name', `%${query}%`).limit(5);

      const searchResults: SearchResult[] = [
        ...(games?.map((g) => ({ id: g.id, type: 'game' as const, title: g.title, difficulty: g.difficulty, game_type: g.game_type })) || []),
        ...(subjects?.map((s) => ({ id: s.id, type: 'subject' as const, title: s.name })) || [])
      ];
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');
    if (result.type === 'subject') navigate(`/subjects/${result.id}`);
    else navigate(`/subjects`);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green/20 text-green';
      case 'medium': return 'bg-accent/20 text-accent';
      case 'hard': return 'bg-destructive/20 text-destructive';
      default: return '';
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={`${t('search')} game atau materi...`} value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => results.length > 0 && setShowResults(true)} className="pl-10 pr-10" />
        {query && <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => { setQuery(''); setShowResults(false); }}><X className="h-4 w-4" /></Button>}
      </div>

      <AnimatePresence>
        {showResults && results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 mt-2 z-50">
            <Card className="shadow-lg">
              <CardContent className="p-2 max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <motion.div key={`${result.type}-${result.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer" onClick={() => handleResultClick(result)}>
                    <div className="flex-shrink-0">{result.type === 'game' ? <Gamepad2 className="h-5 w-5 text-primary" /> : <BookOpen className="h-5 w-5 text-secondary" />}</div>
                    <div className="flex-1 min-w-0"><p className="font-medium truncate">{result.title}</p></div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs capitalize">{result.type}</Badge>
                      {result.difficulty && <Badge className={`text-xs ${getDifficultyColor(result.difficulty)}`}>{result.difficulty}</Badge>}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      {showResults && <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />}
    </div>
  );
}
