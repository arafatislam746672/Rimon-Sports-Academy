import * as React from 'react';
import { 
  Plus, 
  Search, 
  Flag, 
  Users, 
  Trophy, 
  MoreVertical, 
  Upload, 
  Shield, 
  User as UserIcon,
  Camera,
  Activity,
  Calendar,
  Pencil,
  Trash2,
  Check,
  ShieldCheck,
  Workflow
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/services/dataService';
import { Team, Player, Sport, UserProfile } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function Teams() {
  const { profile } = useAuth();
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [profiles, setProfiles] = React.useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sportFilter, setSportFilter] = React.useState<Sport | 'all'>('all');
  const [isTeamDialogOpen, setIsTeamDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  // Form state
  const [editingTeam, setEditingTeam] = React.useState<Team | null>(null);
  const [teamName, setTeamName] = React.useState('');
  const [teamDescription, setTeamDescription] = React.useState('');
  const [teamSport, setTeamSport] = React.useState<Sport | ''>('');
  const [selectedPlayerIds, setSelectedPlayerIds] = React.useState<string[]>([]);
  const [captainId, setCaptainId] = React.useState<string>('');
  const [coachId, setCoachId] = React.useState<string>('');
  const [managerId, setManagerId] = React.useState<string>('');
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [playerSearch, setPlayerSearch] = React.useState('');
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const isManagement = profile?.role === 'management' || profile?.isSuperAdmin;
  const isTeamAuthority = (team: Team) => 
    isManagement || 
    profile?.uid === team.managerId || 
    profile?.uid === team.coachId ||
    profile?.playerId === team.captainId;

  React.useEffect(() => {
    const unsubTeams = dataService.getTeams(setTeams);
    const unsubPlayers = dataService.getPlayers(setPlayers);
    const unsubProfiles = dataService.getProfiles(setProfiles);
    return () => {
      unsubTeams();
      unsubPlayers();
      unsubProfiles();
    };
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be under 2MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be under 2MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const openCreateDialog = () => {
    setEditingTeam(null);
    setTeamName('');
    setTeamDescription('');
    setTeamSport('');
    setSelectedPlayerIds([]);
    setCaptainId('');
    setCoachId('');
    setManagerId('');
    setLogoFile(null);
    setLogoPreview(null);
    setPlayerSearch('');
    setIsTeamDialogOpen(true);
  };

  const openEditDialog = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setTeamDescription(team.description || '');
    setTeamSport(team.sport);
    setSelectedPlayerIds(team.playerIds);
    setCaptainId(team.captainId || 'none');
    setCoachId(team.coachId || 'none');
    setManagerId(team.managerId || 'none');
    setLogoPreview(team.logoURL || null);
    setLogoFile(null);
    setPlayerSearch('');
    setIsTeamDialogOpen(true);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to dismantle this squad? All match history associated with this team will remain, but the team entity will be removed.')) return;
    
    try {
      await dataService.deleteTeam(teamId);
      toast.success('Squad dismantled successfully');
    } catch (error) {
      toast.error('Failed to dismantle squad');
    }
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamSport || selectedPlayerIds.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      let finalLogoURL = logoPreview || '';
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `teams/${Date.now()}_${teamName.replace(/\s+/g, '_')}.${fileExt}`;
        finalLogoURL = await dataService.uploadFile(logoFile, fileName);
      }

      const teamData = {
        name: teamName.trim(),
        description: teamDescription.trim(),
        sport: teamSport as Sport,
        playerIds: selectedPlayerIds,
        captainId: captainId === 'none' ? undefined : captainId,
        coachId: coachId === 'none' ? undefined : coachId,
        managerId: managerId === 'none' ? undefined : managerId,
        logoURL: finalLogoURL,
        createdAt: editingTeam ? editingTeam.createdAt : new Date().toISOString(),
      };

      if (editingTeam) {
        await dataService.updateTeam(editingTeam.id, teamData);
        toast.success(`Team "${teamName}" updated!`);
      } else {
        await dataService.addTeam(teamData);
        toast.success(`Team "${teamName}" created!`);
      }
      setIsTeamDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save team');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === 'all' || team.sport === sportFilter;
    return matchesSearch && matchesSport;
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            Squad <span className="text-indigo-500">Directory</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
            <Trophy size={14} className="text-indigo-500" /> Strategic Resource Management
          </p>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <Input 
              placeholder="Query deployment intel..." 
              className="pl-12 h-14 w-full border-slate-200 rounded-[20px] bg-white text-xs font-bold shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={sportFilter} onValueChange={(val) => setSportFilter(val as Sport | 'all')}>
            <SelectTrigger className="w-44 h-14 border-slate-200 rounded-[20px] text-[10px] font-black uppercase tracking-widest bg-white shadow-sm hover:border-slate-300 transition-all">
              <SelectValue placeholder="All Disciplines" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl p-2 border-slate-200 shadow-2xl">
              <SelectItem value="all" className="font-black text-[10px] uppercase py-3 px-4">Consolidated</SelectItem>
              <SelectItem value="cricket" className="font-black text-[10px] uppercase py-3 px-4">Cricket</SelectItem>
              <SelectItem value="football" className="font-black text-[10px] uppercase py-3 px-4">Football</SelectItem>
              <SelectItem value="badminton" className="font-black text-[10px] uppercase py-3 px-4">Badminton</SelectItem>
            </SelectContent>
          </Select>

          {isManagement && (
            <Button onClick={openCreateDialog} className="bg-slate-900 text-white h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/10 hover:bg-indigo-600 transition-all active:scale-95">
              <Plus size={20} className="mr-3" /> Initialize Squad
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Brief */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="elite-card bg-slate-900 border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
            <Trophy size={160} />
          </div>
          <CardContent className="p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1.5 opacity-80">Total Operational Units</p>
            <h3 className="text-6xl font-black italic text-white tracking-widest">{teams.length}</h3>
          </CardContent>
        </Card>
        <Card className="elite-card bg-white border-none shadow-2xl shadow-slate-200/50">
          <CardContent className="p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Assets Under Deployment</p>
            <h3 className="text-6xl font-black text-slate-900 italic tracking-widest leading-none">
              {new Set(teams.flatMap(t => t.playerIds)).size}
            </h3>
          </CardContent>
        </Card>
        <Card className="elite-card border-none shadow-2xl shadow-indigo-100 bg-gradient-to-br from-indigo-500 to-indigo-600">
          <CardContent className="p-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1.5">Secure Enclaves active</p>
            <h3 className="text-6xl font-black italic text-white tracking-widest leading-none">02</h3>
          </CardContent>
        </Card>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredTeams.map((team, i) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group elite-card border-none shadow-2xl shadow-slate-200/50 rounded-[48px] overflow-hidden bg-white">
              <div className="h-2.5 bg-slate-900 group-hover:bg-indigo-500 transition-colors duration-500" />
              <CardHeader className="p-10 pb-6 bg-slate-50/30">
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <Link to={`/teams/${team.id}`} className="block">
                      <div className="w-24 h-24 rounded-[36px] border-[6px] border-white bg-slate-100 overflow-hidden flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-700">
                        {team.logoURL ? (
                          <img src={team.logoURL} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <Flag size={36} className="text-slate-200" />
                        )}
                      </div>
                    </Link>
                    <div className="absolute -bottom-1 -right-1 p-2 bg-indigo-500 text-white rounded-2xl border-4 border-white shadow-xl">
                       <ShieldCheck size={14} className="fill-white/20" />
                    </div>
                  </div>
                  {(isManagement || isTeamAuthority(team)) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger nativeButton={false} render={<Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-white shadow-sm border border-slate-100 hover:text-indigo-500" />}>
                        <MoreVertical size={22} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 p-3 rounded-3xl border-slate-100 shadow-2xl bg-white/95 backdrop-blur-md">
                        <DropdownMenuItem onClick={() => openEditDialog(team)} className="rounded-2xl cursor-pointer gap-3 font-black text-[10px] uppercase tracking-widest py-4 hover:bg-indigo-50 focus:bg-indigo-50">
                          <Pencil size={16} className="text-indigo-500" />
                          Modify Formation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-50" />
                        <DropdownMenuItem onClick={() => handleDeleteTeam(team.id)} className="rounded-2xl cursor-pointer gap-3 font-black text-[10px] uppercase tracking-widest py-4 text-red-500 focus:text-red-500 focus:bg-red-50">
                          <Trash2 size={16} />
                          Dismantle Squad
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="mt-8 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                     <span className="text-[9px] font-black uppercase tracking-[0.2em]">{team.sport} DIVISION</span>
                  </div>
                  <Link to={`/teams/${team.id}`}>
                    <CardTitle className="text-3xl font-black text-slate-900 tracking-tight italic uppercase hover:text-indigo-500 transition-colors">
                      {team.name}
                    </CardTitle>
                  </Link>
                  {team.description && (
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest line-clamp-2 italic leading-relaxed">
                      {team.description}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-4 space-y-8">
                {/* Management Tier */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="px-4 py-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                    <div className="shrink-0 w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                      <UserIcon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Manager</p>
                      <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">
                        {profiles.find(p => p.uid === team.managerId)?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                    <div className="shrink-0 w-8 h-8 bg-indigo-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                      <Workflow size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Strategy</p>
                      <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">
                        {profiles.find(p => p.uid === team.coachId)?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Captain Badge */}
                <div className="px-6 py-5 bg-slate-50 rounded-[32px] flex items-center gap-5 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                  <div className="shrink-0 w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Shield size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 mb-0.5">Field Commander</p>
                    <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">
                      {players.find(p => p.id === team.captainId)?.name || 'Pending Lead'}
                    </p>
                  </div>
                </div>

                {/* Player Stats */}
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Squad Asset Strength</span>
                    <span className="text-xl font-black text-slate-900 italic tracking-tight">{team.playerIds.length} Registered</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 font-bold">
                    <Users size={20} />
                  </div>
                </div>

                {/* Player Avatars */}
                <div className="flex -space-x-4 overflow-hidden py-2">
                  {team.playerIds.slice(0, 6).map(pid => {
                    const p = players.find(player => player.id === pid);
                    return (
                      <Avatar key={pid} className="h-14 w-14 border-[5px] border-white shadow-xl hover:translate-y-[-8px] transition-all cursor-pointer ring-1 ring-slate-100">
                        <AvatarImage src={p?.photoURL} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-slate-400 text-xs font-black">{p?.name[0]}</AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {team.playerIds.length > 6 && (
                    <div className="h-14 w-14 rounded-full border-[5px] border-white bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-xl ring-1 ring-slate-100">
                      +{team.playerIds.length - 6}
                    </div>
                  )}
                </div>

                <div className="pt-4 grid grid-cols-2 gap-4">
                  {(isManagement || isTeamAuthority(team)) ? (
                    <Button variant="outline" className="rounded-3xl h-14 text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50 transition-all shadow-sm group-hover:border-indigo-500/20" onClick={() => openEditDialog(team)}>
                      Reconfigure
                    </Button>
                  ) : (
                    <Button variant="outline" className="rounded-3xl h-14 text-[9px] font-black uppercase tracking-widest border-slate-100 bg-slate-50/50 opacity-40 cursor-not-allowed">
                      Secure View
                    </Button>
                  )}
                    <Link to={`/teams/${team.id}`} className="w-full">
                      <Button className="w-full bg-slate-900 text-white rounded-3xl h-14 text-[9px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/10 hover:bg-indigo-600 transition-all">
                        Intelligence
                      </Button>
                    </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Team Form Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="sm:max-w-[650px] bg-white border-none rounded-[48px] p-0 overflow-hidden shadow-2xl animate-in zoom-in-95">
          <div className="p-12 bg-slate-900 text-white relative">
             <div className="absolute top-0 right-0 p-12 opacity-10 -rotate-12 translate-x-12 -translate-y-12">
               <Flag size={200} />
             </div>
             <DialogHeader className="relative z-10">
                <div className="flex items-center gap-6 mb-4">
                  <div className="p-5 bg-indigo-500 rounded-[32px] text-white shadow-2xl shadow-indigo-500/40">
                    <Workflow size={32} />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                      {editingTeam ? 'Reconfigure Unit' : 'Initialize Formation'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">
                      {editingTeam ? 'Operational profile update pending.' : 'Academy tactical asset generation.'}
                    </DialogDescription>
                  </div>
                </div>
             </DialogHeader>
          </div>

          <div className="p-12 space-y-10 max-h-[65vh] overflow-y-auto no-scrollbar bg-white">
            {/* Logo Section */}
            <div className="flex flex-col items-center gap-6">
              <div 
                className={cn(
                  "relative group cursor-pointer transition-all duration-500",
                  isDragging ? "scale-110" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => logoInputRef.current?.click()}
              >
                <div className={cn(
                  "w-40 h-40 rounded-[54px] border-[10px] bg-slate-100 overflow-hidden flex items-center justify-center transition-all duration-700 shadow-2xl relative",
                  isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-50",
                  !logoPreview && "border-dashed border-slate-200"
                )}>
                   {logoPreview ? (
                     <div className="w-full h-full relative group">
                       <img src={logoPreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera size={32} className="text-white" />
                       </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center gap-2 text-slate-300">
                        <Upload size={40} className={cn(isDragging && "text-indigo-500 animate-bounce")} />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">Drop Insignia</span>
                     </div>
                   )}
                </div>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="icon" 
                  className="absolute -bottom-2 -right-2 rounded-2xl h-14 w-14 shadow-2xl bg-indigo-500 text-white hover:bg-slate-900 transition-all border-[6px] border-white z-10"
                >
                   <Camera size={24} />
                </Button>
                
                {isDragging && (
                  <div className="absolute inset-0 rounded-[54px] bg-indigo-500/10 border-4 border-indigo-500 animate-pulse pointer-events-none" />
                )}
              </div>
              <input type="file" className="hidden" ref={logoInputRef} accept="image/*" onChange={handleLogoChange} />
              <div className="text-center space-y-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-[0.3em]">Unit Insignia</Label>
                <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">PNG, JPG up to 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Brief</Label>
                <Input 
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Operational objectives and squad history..."
                  className="rounded-3xl border-slate-100 h-16 bg-slate-50 focus:bg-white text-xs font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Callsign</Label>
                  <Input 
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g. ALPHA_VANGUARD"
                    className="rounded-3xl border-slate-100 h-16 bg-slate-50 focus:bg-white text-xl font-black tracking-tight uppercase"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vertical</Label>
                  <Select value={teamSport} onValueChange={(val) => {
                    setTeamSport(val as Sport);
                    setSelectedPlayerIds([]);
                    setCaptainId('');
                    setCoachId('');
                    setManagerId('');
                  }}>
                    <SelectTrigger className="rounded-3xl border-slate-100 h-16 bg-slate-50 focus:bg-white text-[11px] font-black uppercase tracking-widest">
                      <SelectValue placeholder="Discipline" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl p-3 border-slate-100 shadow-2xl">
                      <SelectItem value="cricket" className="font-black uppercase text-[10px] py-4 rounded-2xl">Cricket</SelectItem>
                      <SelectItem value="football" className="font-black uppercase text-[10px] py-4 rounded-2xl">Football</SelectItem>
                      <SelectItem value="badminton" className="font-black uppercase text-[10px] py-4 rounded-2xl">Badminton</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operational Manager</Label>
                  <Select value={managerId} onValueChange={setManagerId}>
                    <SelectTrigger className="rounded-3xl border-slate-100 h-16 bg-slate-50 focus:bg-white text-[11px] font-black uppercase tracking-widest">
                      <SelectValue placeholder="Select Manager" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl p-3 border-slate-100 shadow-2xl">
                      <SelectItem value="none" className="font-black uppercase text-[10px] py-4 rounded-2xl">No Manager</SelectItem>
                      {profiles
                        .filter(p => p.role === 'management' || p.status === 'approved')
                        .map(p => (
                          <SelectItem key={p.uid} value={p.uid} className="font-black uppercase text-[10px] py-4 rounded-2xl">
                            {p.name} ({p.role})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Strategy Lead (Coach)</Label>
                  <Select value={coachId} onValueChange={setCoachId}>
                    <SelectTrigger className="rounded-3xl border-slate-100 h-16 bg-slate-50 focus:bg-white text-[11px] font-black uppercase tracking-widest">
                      <SelectValue placeholder="Select Coach" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl p-3 border-slate-100 shadow-2xl">
                      <SelectItem value="none" className="font-black uppercase text-[10px] py-4 rounded-2xl">No Coach</SelectItem>
                      {profiles
                        .filter(p => p.role === 'management' || p.status === 'approved')
                        .map(p => (
                          <SelectItem key={p.uid} value={p.uid} className="font-black uppercase text-[10px] py-4 rounded-2xl">
                            {p.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {teamSport && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-6 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-slate-100">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900 ml-1">Selection Pool ({selectedPlayerIds.length})</Label>
                  <div className="relative flex-1 max-w-[280px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <Input 
                      placeholder="Query talent..." 
                      className="pl-11 h-12 text-xs rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto no-scrollbar p-1">
                   {players
                    .filter(p => p.primarySport === teamSport)
                    .filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase()))
                    .map(p => (
                     <div 
                        key={p.id} 
                        className={cn(
                          "flex items-center gap-5 p-5 rounded-[32px] border-2 transition-all cursor-pointer group",
                          selectedPlayerIds.includes(p.id) 
                            ? "bg-indigo-50 border-indigo-500 shadow-xl shadow-indigo-100 scale-[1.02]" 
                            : "bg-white border-slate-50 hover:border-slate-100 hover:bg-slate-50"
                        )}
                        onClick={() => {
                          if (selectedPlayerIds.includes(p.id)) {
                             setSelectedPlayerIds(prev => {
                               const next = prev.filter(id => id !== p.id);
                               if (captainId === p.id) setCaptainId('none');
                               return next;
                             });
                          } else {
                            setSelectedPlayerIds(prev => [...prev, p.id]);
                          }
                        }}
                     >
                        <div className={cn(
                          "w-6 h-6 rounded-xl border-[3px] transition-all flex items-center justify-center shrink-0 shadow-inner",
                          selectedPlayerIds.includes(p.id) ? "bg-indigo-500 border-indigo-500" : "bg-slate-50 border-slate-100"
                        )}>
                            {selectedPlayerIds.includes(p.id) && <Check size={14} className="text-white" />}
                        </div>
                        <Avatar className="h-12 w-12 rounded-2xl border-2 border-white shadow-lg">
                          <AvatarImage src={p.photoURL} className="object-cover" />
                          <AvatarFallback className="font-black text-slate-400 bg-slate-100">{p.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight">{p.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60 italic">{p.status}</p>
                        </div>
                        {captainId === p.id && (
                          <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-lg">
                             <Shield size={12} />
                          </div>
                        )}
                     </div>
                   ))}
                </div>

                {selectedPlayerIds.length > 0 && (
                  <div className="space-y-4 p-8 bg-slate-900 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                       <Shield size={120} />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                       <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-xl shadow-amber-500/20">
                          <Shield size={20} />
                       </div>
                       <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Tactical Oversight Lead</Label>
                    </div>
                    <Select value={captainId} onValueChange={setCaptainId}>
                      <SelectTrigger className="rounded-2xl border-white/10 h-16 bg-white/5 backdrop-blur-xl text-white font-black uppercase text-[10px] tracking-widest shadow-inner relative z-10">
                        <SelectValue placeholder="Selection" />
                      </SelectTrigger>
                      <SelectContent className="rounded-3xl p-3 border-slate-800 bg-slate-900 text-white shadow-2xl">
                        <SelectItem value="none" className="font-black uppercase text-[10px] py-4 rounded-2xl hover:bg-white/10">No Captain Assigned</SelectItem>
                        {selectedPlayerIds.map(pid => {
                          const p = players.find(player => player.id === pid);
                          return <SelectItem key={pid} value={pid} className="font-black uppercase text-[10px] py-4 rounded-2xl hover:bg-white/10">{p?.name}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-6 pt-6 sticky bottom-0 bg-white/90 backdrop-blur-xl py-6 border-t border-slate-100 -mx-12 px-12 z-50">
              <Button type="button" variant="ghost" onClick={() => setIsTeamDialogOpen(false)} className="flex-1 rounded-[28px] h-16 font-black uppercase text-[10px] tracking-[0.3em] text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all">ABORT</Button>
              <Button onClick={handleSaveTeam} disabled={isSaving} className="flex-[2] bg-slate-900 text-white rounded-[28px] h-16 font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-95">
                {isSaving ? (
                  <div className="flex items-center gap-3">
                    <Activity className="animate-spin" size={18} /> SYNCHRONIZING...
                  </div>
                ) : editingTeam ? 'UPDATE PAYLOAD' : 'EXECUTE FORMATION'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
