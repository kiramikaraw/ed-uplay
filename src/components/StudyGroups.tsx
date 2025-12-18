import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, Plus, UserPlus, Crown, LogOut, 
  Loader2, User 
} from 'lucide-react';

interface ClassData {
  id: string;
  name: string;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  class_id: string;
  class_name: string;
  creator_id: string;
  creator_name: string;
  max_members: number;
  member_count: number;
  is_member: boolean;
  is_creator: boolean;
}

interface GroupMember {
  user_id: string;
  full_name: string;
  joined_at: string;
}

export function StudyGroups() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMaxMembers, setNewMaxMembers] = useState('5');
  const [creating, setCreating] = useState(false);
  
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedClass) {
      fetchGroups(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('class_members')
        .select('class_id, classes(id, name)')
        .eq('student_id', user.id);

      const classList = (data || [])
        .map((m: any) => m.classes)
        .filter(Boolean);
      setClasses(classList);
      if (classList.length > 0) {
        setSelectedClass(classList[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async (classId: string) => {
    if (!user) return;

    try {
      const { data: groupsData } = await supabase
        .from('study_groups')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (!groupsData) {
        setGroups([]);
        return;
      }

      // Get class name
      const { data: classData } = await supabase
        .from('classes')
        .select('name')
        .eq('id', classId)
        .single();

      // Get creator names
      const creatorIds = [...new Set(groupsData.map(g => g.creator_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', creatorIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      // Get member counts and check membership
      const formattedGroups: StudyGroup[] = await Promise.all(
        groupsData.map(async (g) => {
          const { count } = await supabase
            .from('study_group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', g.id);

          const { data: membership } = await supabase
            .from('study_group_members')
            .select('id')
            .eq('group_id', g.id)
            .eq('user_id', user.id)
            .single();

          return {
            id: g.id,
            name: g.name,
            description: g.description,
            class_id: g.class_id,
            class_name: classData?.name || 'Unknown',
            creator_id: g.creator_id,
            creator_name: profileMap.get(g.creator_id) || 'Unknown',
            max_members: g.max_members,
            member_count: count || 0,
            is_member: !!membership,
            is_creator: g.creator_id === user.id,
          };
        })
      );

      setGroups(formattedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    setLoadingMembers(true);
    try {
      const { data: members } = await supabase
        .from('study_group_members')
        .select('user_id, joined_at')
        .eq('group_id', groupId);

      if (!members) {
        setGroupMembers([]);
        return;
      }

      const userIds = members.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const formattedMembers: GroupMember[] = members.map(m => ({
        user_id: m.user_id,
        full_name: profileMap.get(m.user_id) || 'Unknown',
        joined_at: m.joined_at,
      }));

      setGroupMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !newName.trim() || !selectedClass) {
      toast({
        title: 'Error',
        description: 'Isi nama grup',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { data: newGroup, error } = await supabase
        .from('study_groups')
        .insert({
          name: newName.trim(),
          description: newDescription.trim() || null,
          class_id: selectedClass,
          creator_id: user.id,
          max_members: parseInt(newMaxMembers),
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join as member
      await supabase
        .from('study_group_members')
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
        });

      toast({
        title: 'Berhasil!',
        description: 'Study group berhasil dibuat',
      });

      setNewName('');
      setNewDescription('');
      setShowCreateDialog(false);
      fetchGroups(selectedClass);
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat grup',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: 'Berhasil!',
        description: 'Kamu bergabung ke study group',
      });

      fetchGroups(selectedClass);
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: 'Error',
        description: 'Gagal bergabung ke grup',
        variant: 'destructive',
      });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Kamu keluar dari study group',
      });

      setSelectedGroup(null);
      fetchGroups(selectedClass);
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: 'Error',
        description: 'Gagal keluar dari grup',
        variant: 'destructive',
      });
    }
  };

  const openGroup = (group: StudyGroup) => {
    setSelectedGroup(group);
    fetchGroupMembers(group.id);
  };

  if (loading) {
    return (
      <div className="game-card">
        <h2 className="font-bold text-xl mb-4">Study Groups 👥</h2>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="game-card">
        <h2 className="font-bold text-xl mb-4">Study Groups 👥</h2>
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Gabung kelas untuk akses study groups</p>
        </div>
      </div>
    );
  }

  // Group Detail View
  if (selectedGroup) {
    return (
      <div className="game-card">
        <button
          onClick={() => setSelectedGroup(null)}
          className="text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          ← Kembali
        </button>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-bold text-xl">{selectedGroup.name}</h2>
            {selectedGroup.description && (
              <p className="text-sm text-muted-foreground">{selectedGroup.description}</p>
            )}
          </div>
          {selectedGroup.is_member && !selectedGroup.is_creator && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLeaveGroup(selectedGroup.id)}
            >
              <LogOut className="w-4 h-4 mr-1" />
              Keluar
            </Button>
          )}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Anggota ({selectedGroup.member_count}/{selectedGroup.max_members})
          </h3>

          {loadingMembers ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-2">
              {groupMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{member.full_name}</span>
                  {member.user_id === selectedGroup.creator_id && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                  {member.user_id === user?.id && (
                    <span className="text-xs text-primary">(Kamu)</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Group List View
  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Study Groups
        </h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Buat Grup
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Nama grup"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Textarea
                placeholder="Deskripsi (opsional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
              />
              <div>
                <label className="text-sm font-medium">Max Anggota</label>
                <Select value={newMaxMembers} onValueChange={setNewMaxMembers}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 orang</SelectItem>
                    <SelectItem value="5">5 orang</SelectItem>
                    <SelectItem value="8">8 orang</SelectItem>
                    <SelectItem value="10">10 orang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateGroup} disabled={creating} className="w-full">
                {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Buat Grup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {classes.length > 1 && (
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="mb-4">
            <SelectValue placeholder="Pilih kelas" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Belum ada study group</p>
          <p className="text-sm">Buat grup belajar bersama!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={() => openGroup(group)}
                  className="flex-1 text-left"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    {group.name}
                    {group.is_creator && <Crown className="w-4 h-4 text-yellow-500" />}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    oleh {group.creator_name} • {group.member_count}/{group.max_members} anggota
                  </p>
                </button>
                {!group.is_member && group.member_count < group.max_members && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleJoinGroup(group.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Gabung
                  </Button>
                )}
                {group.is_member && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Anggota
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
