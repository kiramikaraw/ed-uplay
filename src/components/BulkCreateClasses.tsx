import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GameButton } from '@/components/ui/game-button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FolderPlus, Trash2, Plus, Download, Upload, FileText } from 'lucide-react';

interface BulkCreateClassesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassesCreated: () => void;
}

interface ClassEntry {
  id: string;
  name: string;
  description: string;
  education_level: string;
}

export function BulkCreateClasses({ open, onOpenChange, onClassesCreated }: BulkCreateClassesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [classes, setClasses] = useState<ClassEntry[]>([
    { id: '1', name: '', description: '', education_level: '' },
  ]);
  const [creating, setCreating] = useState(false);

  const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const addClassRow = () => {
    setClasses([...classes, { 
      id: Date.now().toString(), 
      name: '', 
      description: '', 
      education_level: '' 
    }]);
  };

  const removeClassRow = (id: string) => {
    if (classes.length > 1) {
      setClasses(classes.filter(c => c.id !== id));
    }
  };

  const updateClass = (id: string, field: keyof ClassEntry, value: string) => {
    setClasses(classes.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const downloadTemplate = () => {
    const csvContent = `nama_kelas,deskripsi,jenjang
"Kelas 6A","Matematika Semester 1","sd"
"Kelas 7B","IPA Terpadu","smp"
"Kelas 10 IPA","Fisika Dasar","sma"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_kelas.csv';
    link.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const newClasses: ClassEntry[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (values && values.length >= 3) {
            const cleanValue = (val: string) => val.replace(/^"|"$/g, '').trim();
            newClasses.push({
              id: Date.now().toString() + i,
              name: cleanValue(values[0]),
              description: cleanValue(values[1]),
              education_level: cleanValue(values[2]),
            });
          }
        }
        
        if (newClasses.length > 0) {
          setClasses(newClasses);
          toast({
            title: 'File berhasil dibaca',
            description: `${newClasses.length} kelas ditemukan`,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCreate = async () => {
    const validClasses = classes.filter(c => c.name && c.education_level);
    
    if (validClasses.length === 0) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Isi minimal nama dan jenjang untuk setiap kelas',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    let success = 0;
    let failed = 0;

    for (const cls of validClasses) {
      try {
        const { error } = await supabase
          .from('classes')
          .insert({
            teacher_id: user!.id,
            name: cls.name,
            description: cls.description,
            education_level: cls.education_level as 'sd' | 'smp' | 'sma',
            join_code: generateJoinCode(),
          });

        if (error) {
          failed++;
          console.error('Error creating class:', error);
        } else {
          success++;
        }
      } catch (err) {
        failed++;
      }
    }

    setCreating(false);
    
    toast({
      title: 'Pembuatan kelas selesai',
      description: `${success} kelas berhasil dibuat${failed > 0 ? `, ${failed} gagal` : ''}`,
    });

    if (success > 0) {
      onClassesCreated();
      onOpenChange(false);
      setClasses([{ id: '1', name: '', description: '', education_level: '' }]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-primary" />
            Bulk Buat Kelas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* CSV Upload */}
          <div className="flex gap-2">
            <GameButton variant="secondary" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4" />
              Download Template
            </GameButton>
            <GameButton 
              variant="secondary" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Upload CSV
            </GameButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Class Entries */}
          <div className="space-y-3">
            {classes.map((cls, index) => (
              <div key={cls.id} className="flex gap-2 items-start p-3 bg-muted/30 rounded-xl">
                <span className="text-sm font-bold text-muted-foreground w-6 pt-2">
                  {index + 1}.
                </span>
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Nama kelas"
                    value={cls.name}
                    onChange={(e) => updateClass(cls.id, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Deskripsi"
                    value={cls.description}
                    onChange={(e) => updateClass(cls.id, 'description', e.target.value)}
                  />
                  <Select 
                    value={cls.education_level} 
                    onValueChange={(val) => updateClass(cls.id, 'education_level', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Jenjang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sd">SD</SelectItem>
                      <SelectItem value="smp">SMP</SelectItem>
                      <SelectItem value="sma">SMA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <GameButton
                  variant="ghost"
                  size="icon"
                  onClick={() => removeClassRow(cls.id)}
                  disabled={classes.length === 1}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </GameButton>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <GameButton variant="ghost" size="sm" onClick={addClassRow}>
            <Plus className="w-4 h-4" />
            Tambah Kelas
          </GameButton>

          {/* Submit */}
          <GameButton 
            variant="primary" 
            className="w-full"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? 'Membuat...' : `Buat ${classes.filter(c => c.name && c.education_level).length} Kelas`}
          </GameButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
