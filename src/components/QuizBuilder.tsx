import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, Trash2, GripVertical, Save, Loader2, 
  HelpCircle, CheckCircle, XCircle, Pencil, Eye 
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

interface QuizData {
  title: string;
  description: string;
  topic_id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  time_limit_seconds: number;
  questions: QuizQuestion[];
}

export const QuizBuilder = () => {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [quiz, setQuiz] = useState<QuizData>({
    title: '',
    description: '',
    topic_id: '',
    difficulty: 'medium',
    time_limit_seconds: 60,
    questions: [],
  });

  const [topics, setTopics] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const loadTopics = async () => {
    setLoadingTopics(true);
    try {
      const { data } = await supabase
        .from('topics')
        .select('id, name')
        .order('name');
      if (data) setTopics(data);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: crypto.randomUUID(),
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      ),
    }));
  };

  const removeQuestion = (id: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      }),
    }));
  };

  const setCorrectAnswer = (questionId: string, answer: string) => {
    updateQuestion(questionId, { correct_answer: answer });
  };

  const saveQuiz = async () => {
    if (!user) return;
    
    // Validation
    if (!quiz.title.trim()) {
      toast({ title: "Judul harus diisi", variant: "destructive" });
      return;
    }
    if (!quiz.topic_id) {
      toast({ title: "Pilih topik", variant: "destructive" });
      return;
    }
    if (quiz.questions.length === 0) {
      toast({ title: "Tambahkan minimal 1 pertanyaan", variant: "destructive" });
      return;
    }
    
    // Validate each question
    for (const q of quiz.questions) {
      if (!q.question_text.trim()) {
        toast({ title: "Semua pertanyaan harus diisi", variant: "destructive" });
        return;
      }
      if (q.options.some(o => !o.trim())) {
        toast({ title: "Semua opsi jawaban harus diisi", variant: "destructive" });
        return;
      }
      if (!q.correct_answer) {
        toast({ title: "Pilih jawaban benar untuk setiap pertanyaan", variant: "destructive" });
        return;
      }
    }

    setSaving(true);

    try {
      // Create the game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          title: quiz.title,
          description: quiz.description,
          topic_id: quiz.topic_id,
          game_type: 'quiz',
          difficulty: quiz.difficulty,
          time_limit_seconds: quiz.time_limit_seconds,
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Create questions
      const questionsToInsert = quiz.questions.map((q, index) => ({
        game_id: gameData.id,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        order_index: index,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast({
        title: "Quiz Berhasil Dibuat! 🎉",
        description: `${quiz.questions.length} pertanyaan telah ditambahkan`,
      });

      // Reset form
      setQuiz({
        title: '',
        description: '',
        topic_id: '',
        difficulty: 'medium',
        time_limit_seconds: 60,
        questions: [],
      });
      setOpen(false);
    } catch (error) {
      console.error('Error saving quiz:', error);
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan, coba lagi",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (role !== 'teacher') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) loadTopics();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Buat Quiz Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Quiz Builder
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <Pencil className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {previewMode ? (
          // Preview Mode
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{quiz.title || 'Judul Quiz'}</CardTitle>
                <p className="text-muted-foreground">{quiz.description || 'Deskripsi quiz'}</p>
              </CardHeader>
            </Card>
            
            {quiz.questions.map((q, idx) => (
              <Card key={q.id}>
                <CardContent className="pt-6">
                  <p className="font-medium mb-4">
                    {idx + 1}. {q.question_text || 'Pertanyaan kosong'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg border ${
                          opt === q.correct_answer
                            ? 'bg-success/10 border-success'
                            : 'bg-muted/50'
                        }`}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                        {opt || `Opsi ${optIdx + 1}`}
                        {opt === q.correct_answer && (
                          <CheckCircle className="h-4 w-4 text-success inline ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-6">
            {/* Quiz Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Judul Quiz *</Label>
                <Input
                  placeholder="Masukkan judul quiz"
                  value={quiz.title}
                  onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Topik *</Label>
                <Select 
                  value={quiz.topic_id} 
                  onValueChange={(v) => setQuiz(prev => ({ ...prev, topic_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingTopics ? "Memuat..." : "Pilih topik"} />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map(topic => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea
                placeholder="Deskripsi singkat tentang quiz ini"
                value={quiz.description}
                onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tingkat Kesulitan</Label>
                <Select 
                  value={quiz.difficulty} 
                  onValueChange={(v: 'easy' | 'medium' | 'hard') => setQuiz(prev => ({ ...prev, difficulty: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Mudah</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="hard">Sulit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Waktu per Soal (detik)</Label>
                <Input
                  type="number"
                  min={10}
                  max={300}
                  value={quiz.time_limit_seconds}
                  onChange={(e) => setQuiz(prev => ({ ...prev, time_limit_seconds: parseInt(e.target.value) || 60 }))}
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Pertanyaan ({quiz.questions.length})</Label>
                <Button onClick={addQuestion} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Tambah Pertanyaan
                </Button>
              </div>

              <Reorder.Group 
                axis="y" 
                values={quiz.questions} 
                onReorder={(newOrder) => setQuiz(prev => ({ ...prev, questions: newOrder }))}
                className="space-y-4"
              >
                {quiz.questions.map((question, idx) => (
                  <Reorder.Item key={question.id} value={question}>
                    <Card className="relative">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className="cursor-grab active:cursor-grabbing text-muted-foreground">
                            <GripVertical className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">{idx + 1}.</span>
                              <Input
                                placeholder="Tulis pertanyaan di sini"
                                value={question.question_text}
                                onChange={(e) => updateQuestion(question.id, { question_text: e.target.value })}
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeQuestion(question.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {question.options.map((option, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setCorrectAnswer(question.id, option)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                      option && question.correct_answer === option
                                        ? 'bg-success border-success text-white'
                                        : 'border-border hover:border-primary'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIdx)}
                                  </button>
                                  <Input
                                    placeholder={`Opsi ${String.fromCharCode(65 + optIdx)}`}
                                    value={option}
                                    onChange={(e) => updateOption(question.id, optIdx, e.target.value)}
                                    className="flex-1"
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Penjelasan (opsional)</Label>
                              <Input
                                placeholder="Penjelasan jawaban benar"
                                value={question.explanation || ''}
                                onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {quiz.questions.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">Belum ada pertanyaan</p>
                  <Button onClick={addQuestion} variant="link">
                    Tambah pertanyaan pertama
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 pt-4 border-t flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button 
            className="flex-1 gap-2" 
            onClick={saveQuiz}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Simpan Quiz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};