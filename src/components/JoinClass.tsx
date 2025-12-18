import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, Loader2 } from 'lucide-react';

interface JoinClassProps {
  onClassJoined?: () => void;
}

export function JoinClass({ onClassJoined }: JoinClassProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!user || !joinCode.trim()) {
      toast({
        title: "Error",
        description: "Masukkan kode kelas",
        variant: "destructive",
      });
      return;
    }

    setJoining(true);
    try {
      // Find class by join code
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('join_code', joinCode.trim().toUpperCase())
        .single();

      if (classError || !classData) {
        toast({
          title: "Error",
          description: "Kode kelas tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('class_members')
        .select('id')
        .eq('class_id', classData.id)
        .eq('student_id', user.id)
        .single();

      if (existingMember) {
        toast({
          title: "Info",
          description: "Kamu sudah bergabung di kelas ini",
        });
        return;
      }

      // Join the class
      const { error: joinError } = await supabase
        .from('class_members')
        .insert({
          class_id: classData.id,
          student_id: user.id,
        });

      if (joinError) {
        throw joinError;
      }

      toast({
        title: "Berhasil!",
        description: `Kamu bergabung di kelas ${classData.name}`,
      });

      setJoinCode('');
      setOpen(false);
      onClassJoined?.();
    } catch (error) {
      console.error('Error joining class:', error);
      toast({
        title: "Error",
        description: "Gagal bergabung ke kelas",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          Gabung Kelas
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gabung Kelas</DialogTitle>
          <DialogDescription>
            Masukkan kode kelas yang diberikan oleh guru
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Masukkan kode kelas (contoh: ABC123)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="text-center text-lg tracking-widest"
            maxLength={10}
          />
          <Button 
            onClick={handleJoin} 
            disabled={joining || !joinCode.trim()}
            className="w-full"
          >
            {joining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Bergabung...
              </>
            ) : (
              'Gabung Kelas'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
