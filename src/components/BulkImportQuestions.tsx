import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GameButton } from '@/components/ui/game-button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface BulkImportQuestionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

export function BulkImportQuestions({ open, onOpenChange }: BulkImportQuestionsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csvContent = `question_text,option_a,option_b,option_c,option_d,correct_answer,explanation
"Berapa hasil dari 5 + 3?","6","7","8","9","8","5 ditambah 3 sama dengan 8"
"Planet terbesar di tata surya adalah?","Mars","Venus","Jupiter","Saturnus","Jupiter","Jupiter adalah planet terbesar di tata surya kita"
"Siapa penemu lampu pijar?","Einstein","Edison","Newton","Tesla","Edison","Thomas Edison menemukan lampu pijar pada tahun 1879"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_soal.csv';
    link.click();
  };

  const parseCSV = (text: string): ParsedQuestion[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const questions: ParsedQuestion[] = [];
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      if (values && values.length >= 6) {
        const cleanValue = (val: string) => val.replace(/^"|"$/g, '').trim();
        questions.push({
          question_text: cleanValue(values[0]),
          options: [
            cleanValue(values[1]),
            cleanValue(values[2]),
            cleanValue(values[3]),
            cleanValue(values[4]),
          ],
          correct_answer: cleanValue(values[5]),
          explanation: values[6] ? cleanValue(values[6]) : undefined,
        });
      }
    }
    return questions;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImportResult(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const questions = parseCSV(text);
        setParsedQuestions(questions);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (parsedQuestions.length === 0) {
      toast({
        title: 'Tidak ada soal',
        description: 'Pilih file CSV yang berisi soal',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    let success = 0;
    let failed = 0;

    // First, get or create a default game for bulk import
    const { data: games } = await supabase
      .from('games')
      .select('id')
      .limit(1);

    if (!games || games.length === 0) {
      toast({
        title: 'Tidak ada game',
        description: 'Buat game terlebih dahulu sebelum import soal',
        variant: 'destructive',
      });
      setImporting(false);
      return;
    }

    const gameId = games[0].id;

    for (const q of parsedQuestions) {
      try {
        const { error } = await supabase
          .from('questions')
          .insert({
            game_id: gameId,
            question_text: q.question_text,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          });

        if (error) {
          failed++;
          console.error('Error inserting question:', error);
        } else {
          success++;
        }
      } catch (err) {
        failed++;
        console.error('Error:', err);
      }
    }

    setImportResult({ success, failed });
    setImporting(false);
    
    toast({
      title: 'Import selesai',
      description: `${success} soal berhasil, ${failed} gagal`,
    });
  };

  const resetForm = () => {
    setFile(null);
    setParsedQuestions([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Bulk Import Soal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Template Download */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-2">
              Download template CSV untuk format yang benar
            </p>
            <GameButton variant="secondary" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4" />
              Download Template
            </GameButton>
          </div>

          {/* File Upload */}
          <div 
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            {file ? (
              <p className="font-medium">{file.name}</p>
            ) : (
              <p className="text-muted-foreground">Klik untuk pilih file CSV</p>
            )}
          </div>

          {/* Preview */}
          {parsedQuestions.length > 0 && (
            <div className="bg-muted/30 rounded-xl p-4">
              <p className="font-semibold mb-2">{parsedQuestions.length} soal ditemukan</p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {parsedQuestions.slice(0, 5).map((q, i) => (
                  <div key={i} className="text-sm bg-card p-2 rounded-lg">
                    <p className="truncate">{i + 1}. {q.question_text}</p>
                  </div>
                ))}
                {parsedQuestions.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center">
                    ...dan {parsedQuestions.length - 5} soal lainnya
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Import Result */}
          {importResult && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="font-semibold">{importResult.success} berhasil</p>
                {importResult.failed > 0 && (
                  <p className="text-sm text-destructive">{importResult.failed} gagal</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <GameButton 
              variant="primary" 
              className="flex-1"
              onClick={handleImport}
              disabled={parsedQuestions.length === 0 || importing}
            >
              {importing ? 'Mengimport...' : 'Import Soal'}
            </GameButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
