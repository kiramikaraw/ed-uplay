import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GameButton } from '@/components/ui/game-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Download, FileSpreadsheet, Users, CheckCircle } from 'lucide-react';

interface BulkExportDataProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ClassData {
  id: string;
  name: string;
  education_level: string;
}

interface ExportOption {
  id: string;
  label: string;
  description: string;
}

export function BulkExportData({ open, onOpenChange }: BulkExportDataProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['progress', 'scores']);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const exportOptions: ExportOption[] = [
    { id: 'progress', label: 'Progress Siswa', description: 'Games played, mastery level' },
    { id: 'scores', label: 'Skor & Nilai', description: 'Total score, average score' },
    { id: 'sessions', label: 'Detail Sesi', description: 'Riwayat bermain lengkap' },
    { id: 'badges', label: 'Badge & Achievement', description: 'Badge yang didapat siswa' },
  ];

  useEffect(() => {
    if (open) {
      fetchClasses();
    }
  }, [open]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('classes')
        .select('id, name, education_level')
        .eq('teacher_id', user!.id);
      
      setClasses(data || []);
      if (data && data.length > 0) {
        setSelectedClasses([data[0].id]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleExport = async () => {
    if (selectedClasses.length === 0) {
      toast({
        title: 'Pilih kelas',
        description: 'Minimal pilih 1 kelas untuk export',
        variant: 'destructive',
      });
      return;
    }

    if (selectedOptions.length === 0) {
      toast({
        title: 'Pilih data',
        description: 'Minimal pilih 1 jenis data untuk export',
        variant: 'destructive',
      });
      return;
    }

    setExporting(true);

    try {
      // Get all students from selected classes
      const { data: members } = await supabase
        .from('class_members')
        .select('student_id, class_id')
        .in('class_id', selectedClasses);

      if (!members || members.length === 0) {
        toast({
          title: 'Tidak ada data',
          description: 'Tidak ada siswa di kelas yang dipilih',
          variant: 'destructive',
        });
        setExporting(false);
        return;
      }

      const studentIds = [...new Set(members.map(m => m.student_id))];

      // Get student profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, education_level')
        .in('id', studentIds);

      // Get progress data
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .in('user_id', studentIds);

      // Get game sessions
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('*')
        .in('user_id', studentIds);

      // Get badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select(`
          *,
          badges:badge_id (name)
        `)
        .in('user_id', studentIds);

      // Build CSV data
      const csvRows: string[] = [];
      const headers: string[] = ['Nama Siswa', 'Kelas'];

      if (selectedOptions.includes('progress')) {
        headers.push('Games Played', 'Mastery Level');
      }
      if (selectedOptions.includes('scores')) {
        headers.push('Total Score', 'Average Score');
      }
      if (selectedOptions.includes('sessions')) {
        headers.push('Total Sessions', 'Completed Sessions', 'Total Time (min)');
      }
      if (selectedOptions.includes('badges')) {
        headers.push('Badges Earned');
      }

      csvRows.push(headers.join(','));

      // Process each student
      for (const profile of (profiles || [])) {
        const studentClasses = members
          .filter(m => m.student_id === profile.id)
          .map(m => classes.find(c => c.id === m.class_id)?.name || '')
          .join('; ');

        const row: string[] = [
          `"${profile.full_name}"`,
          `"${studentClasses}"`,
        ];

        if (selectedOptions.includes('progress')) {
          const progress = progressData?.filter(p => p.user_id === profile.id) || [];
          const gamesPlayed = progress.reduce((sum, p) => sum + (p.games_played || 0), 0);
          const avgMastery = progress.length > 0 
            ? Math.round(progress.reduce((sum, p) => sum + (p.mastery_level || 0), 0) / progress.length)
            : 0;
          row.push(gamesPlayed.toString(), avgMastery.toString());
        }

        if (selectedOptions.includes('scores')) {
          const studentSessions = sessions?.filter(s => s.user_id === profile.id) || [];
          const totalScore = studentSessions.reduce((sum, s) => sum + (s.score || 0), 0);
          const avgScore = studentSessions.length > 0 
            ? Math.round(totalScore / studentSessions.length)
            : 0;
          row.push(totalScore.toString(), avgScore.toString());
        }

        if (selectedOptions.includes('sessions')) {
          const studentSessions = sessions?.filter(s => s.user_id === profile.id) || [];
          const completedSessions = studentSessions.filter(s => s.completed).length;
          const totalTime = Math.round(
            studentSessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0) / 60
          );
          row.push(
            studentSessions.length.toString(),
            completedSessions.toString(),
            totalTime.toString()
          );
        }

        if (selectedOptions.includes('badges')) {
          const studentBadges = userBadges?.filter(b => b.user_id === profile.id) || [];
          const badgeNames = studentBadges
            .map(b => (Array.isArray(b.badges) ? b.badges[0] : b.badges)?.name || '')
            .filter(Boolean)
            .join('; ');
          row.push(`"${badgeNames || 'Belum ada'}"`);
        }

        csvRows.push(row.join(','));
      }

      // Download CSV
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `export_progress_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: 'Export berhasil',
        description: `Data ${profiles?.length || 0} siswa telah diexport`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting:', error);
      toast({
        title: 'Gagal export',
        description: 'Terjadi kesalahan saat mengexport data',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const levelLabels: Record<string, string> = { sd: 'SD', smp: 'SMP', sma: 'SMA' };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Export Data Siswa
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Memuat data...</div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Select Classes */}
            <div>
              <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" />
                Pilih Kelas
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {classes.map(cls => (
                  <div
                    key={cls.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      selectedClasses.includes(cls.id)
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                    onClick={() => toggleClass(cls.id)}
                  >
                    <Checkbox
                      checked={selectedClasses.includes(cls.id)}
                      onCheckedChange={() => toggleClass(cls.id)}
                    />
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {levelLabels[cls.education_level]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {classes.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Belum ada kelas
                </p>
              )}
            </div>

            {/* Export Options */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Data yang Diexport
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {exportOptions.map(option => (
                  <div
                    key={option.id}
                    className={`p-3 rounded-xl cursor-pointer transition-colors ${
                      selectedOptions.includes(option.id)
                        ? 'bg-secondary/10 border-2 border-secondary'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={() => toggleOption(option.id)}
                      />
                      <div>
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <GameButton 
              variant="primary" 
              className="w-full"
              onClick={handleExport}
              disabled={exporting || selectedClasses.length === 0 || selectedOptions.length === 0}
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Mengexport...' : 'Export ke CSV'}
            </GameButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
