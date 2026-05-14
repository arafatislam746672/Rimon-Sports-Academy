import * as React from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  UserPlus,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Camera,
  Upload,
  Flag,
  Users as UsersIcon,
  CheckCircle2,
  ShieldCheck,
  Trophy,
  Activity,
  Target,
  Dna
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
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
  DialogTrigger,
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

import { toast } from 'sonner';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/context/AuthContext';
import { Player, Sport, Team, UserRole } from '@/types';
import { cn } from '@/lib/utils';

export default function Players() {
  const { profile } = useAuth();
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sportFilter, setSportFilter] = React.useState('all');
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = React.useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const isManagement = profile?.role === 'management';
  
  // Player Form State
  const [newPlayerName, setNewPlayerName] = React.useState('');
  const [newPlayerSport, setNewPlayerSport] = React.useState<Sport | ''>('');
  const [newPlayerJoinDate, setNewPlayerJoinDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);

  // Team Form State
  const [newTeamName, setNewTeamName] = React.useState('');
  const [newTeamSport, setNewTeamSport] = React.useState<Sport | ''>('');
  const [selectedPlayerIds, setSelectedPlayerIds] = React.useState<string[]>([]);
  const [teamLogoFile, setTeamLogoFile] = React.useState<File | null>(null);
  const [teamLogoPreview, setTeamLogoPreview] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const teamLogoInputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubPlayers = dataService.getPlayers(setPlayers);
    const unsubTeams = dataService.getTeams(setTeams);
    return () => {
      unsubPlayers();
      unsubTeams();
    };
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeamLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTeamLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlayerName.trim();
    const sport = newPlayerSport;
    const joinDate = newPlayerJoinDate;

    if (!name || name.length < 3) {
      toast.error('Player name must be at least 3 characters long.');
      return;
    }
    if (!sport) {
      toast.error('Please select a valid sport.');
      return;
    }

    setIsSaving(true);
    try {
      let finalPhotoURL = `https://picsum.photos/seed/${name.replace(/\s+/g, '')}/400`;
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `players/${Date.now()}_${name.replace(/\s+/g, '_')}.${fileExt}`;
        finalPhotoURL = await dataService.uploadFile(photoFile, fileName);
      }

      const playerToCreate: Omit<Player, 'id'> = {
        name,
        joinedDate: new Date(joinDate).toISOString(),
        photoURL: finalPhotoURL,
        status: 'prospect',
        primarySport: sport as Sport,
        stats: {
          cricket: { runs: 0, wickets: 0, matches: 0, strikeRate: 0, average: 0 },
          football: { goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 },
          badminton: { wins: 0, matches: 0, winRate: 0 }
        }
      };

      await dataService.addPlayer(playerToCreate);
      toast.success(`${name} has been registered successfully!`);
      setIsPlayerDialogOpen(false);
      setNewPlayerName('');
      setNewPlayerSport('');
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      toast.error('Failed to register player.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamSport || selectedPlayerIds.length === 0) {
      toast.error('Please provide team name, sport and select at least one player.');
      return;
    }

    setIsSaving(true);
    try {
      let finalLogoURL = '';
      if (teamLogoFile) {
        const fileExt = teamLogoFile.name.split('.').pop();
        const fileName = `teams/${Date.now()}_${newTeamName.replace(/\s+/g, '_')}.${fileExt}`;
        finalLogoURL = await dataService.uploadFile(teamLogoFile, fileName);
      }

      const teamToCreate: Omit<Team, 'id'> = {
        name: newTeamName.trim(),
        sport: newTeamSport as Sport,
        playerIds: selectedPlayerIds,
        createdAt: new Date().toISOString(),
        tournamentIds: [],
        logoURL: finalLogoURL || undefined
      };

      await dataService.addTeam(teamToCreate);
      toast.success(`Team "${newTeamName}" created!`);
      setIsTeamDialogOpen(false);
      setNewTeamName('');
      setNewTeamSport('');
      setSelectedPlayerIds([]);
      setTeamLogoFile(null);
      setTeamLogoPreview(null);
    } catch (error) {
      toast.error('Failed to create team.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === 'all' || player.primarySport === sportFilter.toLowerCase();
    return matchesSearch && matchesSport;
  });

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = sportFilter === 'all' || team.sport === sportFilter.toLowerCase();
    return matchesSearch && matchesSport;
  });

   return (
    <div className="space-y-16 animate-in fade-in duration-1000 p-2 md:p-6 w-full">
      {/* Prime Header Matrix */}
      <div className="relative group w-full">
         <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-[56px] blur-2xl opacity-10 group-hover:opacity-20 transition duration-1000"></div>
         <div className="relative bg-white/60 backdrop-blur-3xl rounded-[56px] p-10 md:p-14 border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] flex flex-col xl:flex-row xl:items-center justify-between gap-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[120px] -mr-48 -mt-48 rounded-full"></div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-slate-900 rounded-[28px] shadow-2xl shadow-slate-900/20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-700">
                    <UsersIcon className="text-white" size={28} />
                 </div>
                 <div className="flex flex-col">
                    <Badge className="w-fit bg-slate-900 text-white border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-[0.3em] shadow-lg shadow-slate-900/10">
                       Elite Division Matrix
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70 italic">Protocol v2.4.0 Authorized</span>
                 </div>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
                 Talent <span className="text-indigo-600 underline decoration-indigo-500/20 decoration-8 underline-offset-12">Registry</span>
              </h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.3em] flex items-center gap-4 max-w-[600px] leading-relaxed opacity-80">
                 Unified Asset Categorization • Skill telemetry • Tactical Sourcing
              </p>
            </div>
            
            <div className="flex flex-wrap gap-5 relative z-10">
              {isManagement && (
                <>
                  <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                     <DialogTrigger render={<Button variant="outline" className="border-slate-200 text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] h-20 px-12 rounded-[32px] hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-slate-200/20 active:scale-95 italic bg-white/50 backdrop-blur-sm group-hover:border-indigo-500/30" />}>
                        <Flag size={20} className="mr-4" />
                        Assemble Unit
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[650px] bg-white border-none rounded-[64px] p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)]">
                        {/* Team Dialog Content remains same or slightly improved */}
                        <div className="bg-slate-900 p-12 text-white relative">
                           <div className="absolute top-0 right-0 p-12 opacity-5">
                              <Target size={140} className="rotate-12" />
                           </div>
                           <div className="relative z-10 space-y-2">
                             <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Squad formation</h2>
                             <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">Tactical unit deployment protocol</p>
                           </div>
                        </div>
                        
                        <form onSubmit={handleSaveTeam} className="p-12 space-y-12 max-h-[70vh] overflow-y-auto no-scrollbar">
                           <div className="flex flex-col items-center gap-6">
                              <div className="relative group/logo">
                                 <div className="w-32 h-32 rounded-[48px] border-[8px] border-slate-50 bg-slate-100 overflow-hidden flex items-center justify-center transition-all group-hover/logo:scale-105 duration-700 shadow-2xl">
                                    {teamLogoPreview ? (
                                      <img src={teamLogoPreview} alt="Team Logo Preview" className="w-full h-full object-cover" />
                                    ) : (
                                       <Flag size={40} className="text-slate-200" />
                                    )}
                                 </div>
                                 <Button 
                                   type="button" 
                                   variant="secondary" 
                                   size="icon" 
                                   className="absolute -bottom-2 -right-2 rounded-2xl h-14 w-14 shadow-2xl border-4 border-white bg-indigo-500 text-white hover:bg-indigo-600 transition-all"
                                   onClick={() => teamLogoInputRef.current?.click()}
                                 >
                                    <Upload size={20} />
                                 </Button>
                              </div>
                              <input type="file" className="hidden" ref={teamLogoInputRef} accept="image/*" onChange={handleTeamLogoChange} />
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Insignia Upload</Label>
                           </div>
    
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Callsign</Label>
                                <Input 
                                  value={newTeamName}
                                  onChange={(e) => setNewTeamName(e.target.value)}
                                  placeholder="e.g. PHANTOM CORE"
                                  className="rounded-[24px] border-slate-100 h-16 bg-slate-50 font-black tracking-tight uppercase px-6 italic focus:bg-white transition-all shadow-inner"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Discipline</Label>
                                <Select value={newTeamSport} onValueChange={(val) => {
                                  setNewTeamSport(val as Sport);
                                  setSelectedPlayerIds([]);
                                }}>
                                  <SelectTrigger className="rounded-[24px] border-slate-100 h-16 bg-slate-50 font-black tracking-tight uppercase px-6 italic focus:bg-white transition-all shadow-inner">
                                    <SelectValue placeholder="Tracks" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-[32px] border-none p-3 shadow-2xl font-black">
                                    <SelectItem value="cricket" className="font-black uppercase text-[10px] py-4 rounded-2xl">Cricket</SelectItem>
                                    <SelectItem value="football" className="font-black uppercase text-[10px] py-4 rounded-2xl">Football</SelectItem>
                                    <SelectItem value="badminton" className="font-black uppercase text-[10px] py-4 rounded-2xl">Badminton</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                           </div>
    
                           {newTeamSport && (
                             <div className="space-y-6">
                                <div className="flex items-center justify-between px-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available personnel ({players.filter(p => p.primarySport === newTeamSport).length})</Label>
                                    <span className="text-[10px] font-black text-indigo-500 uppercase italic">{selectedPlayerIds.length} Selected</span>
                                </div>
                                <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-4 no-scrollbar border border-slate-50 p-4 rounded-[32px] bg-slate-50/50">
                                   {players.filter(p => p.primarySport === newTeamSport).map(p => (
                                     <div 
                                        key={p.id} 
                                        className={cn(
                                          "flex items-center gap-6 p-4 rounded-[28px] border-2 transition-all cursor-pointer group/item",
                                          selectedPlayerIds.includes(p.id) ? "bg-white border-indigo-500 shadow-xl shadow-indigo-500/10" : "bg-white/50 border-transparent hover:bg-white hover:border-slate-100"
                                        )}
                                        onClick={() => {
                                          if (selectedPlayerIds.includes(p.id)) {
                                            setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== p.id));
                                          } else {
                                            setSelectedPlayerIds([...selectedPlayerIds, p.id]);
                                          }
                                        }}
                                     >
                                        <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", selectedPlayerIds.includes(p.id) ? "bg-indigo-500 border-indigo-500 rotate-0" : "border-slate-200 rotate-45 group-hover/item:rotate-0")}>
                                           {selectedPlayerIds.includes(p.id) && <CheckCircle2 size={14} className="text-white" />}
                                        </div>
                                        <Avatar className="h-14 w-14 rounded-2xl border-4 border-white shadow-lg">
                                          <AvatarImage src={p.photoURL} className="object-cover" />
                                          <AvatarFallback className="font-black text-slate-400">{p.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                           <p className="text-base font-black text-slate-900 truncate uppercase tracking-tighter italic">{p.name}</p>
                                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Status: {(p.status || 'prospect').toUpperCase()}</p>
                                        </div>
                                     </div>
                                   ))}
                                </div>
                             </div>
                           )}
    
                           <div className="flex flex-col sm:flex-row gap-6 sticky bottom-0 bg-white/90 backdrop-blur-md py-8 border-t border-slate-50 -mx-12 px-12">
                              <Button type="button" variant="ghost" onClick={() => setIsTeamDialogOpen(false)} className="flex-1 rounded-[24px] h-16 font-black uppercase text-[10px] tracking-widest text-slate-400">Abort session</Button>
                              <Button type="submit" disabled={isSaving} className="flex-1 bg-slate-900 text-white rounded-[24px] h-16 font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all italic">
                                {isSaving ? 'Sanctioning...' : 'Deploy Unit'}
                              </Button>
                           </div>
                        </form>
                     </DialogContent>
                  </Dialog>
    
                  <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
                    <DialogTrigger render={<Button className="bg-slate-900 text-white border-none shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 font-black uppercase tracking-widest text-[10px] h-16 px-12 rounded-[28px] active:scale-95 transition-all italic" />}>
                      <UserPlus size={18} className="mr-3" /> Enroll Asset
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-white border-none rounded-[56px] p-0 overflow-hidden shadow-2xl">
                       <div className="bg-indigo-600 p-12 text-white relative">
                          <div className="absolute top-0 right-0 p-12 opacity-5">
                             <Dna size={120} />
                          </div>
                          <DialogHeader>
                            <DialogTitle className="text-4xl font-black uppercase tracking-tighter italic">Asset Intake</DialogTitle>
                            <DialogDescription className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Initialize Talent Pipeline</DialogDescription>
                          </DialogHeader>
                       </div>
                       <form onSubmit={handleSavePlayer} className="p-12 space-y-12">
                         <div className="flex flex-col items-center gap-6">
                            <div className="relative group/photo">
                              <div className="w-36 h-36 rounded-[56px] border-[10px] border-slate-50 bg-slate-100 overflow-hidden flex items-center justify-center transition-all group-hover/photo:rotate-3 duration-700 shadow-2xl">
                                 {photoPreview ? (
                                   <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                 ) : (
                                   <Camera size={48} className="text-slate-200" />
                                 )}
                              </div>
                              <Button 
                                type="button" 
                                variant="secondary" 
                                size="icon" 
                                className="absolute -bottom-2 -right-2 rounded-2xl h-14 w-14 shadow-2xl border-4 border-white bg-slate-900 text-white hover:bg-indigo-500 transition-all"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                 <Upload size={22} />
                              </Button>
                            </div>
                            <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handlePhotoChange} />
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Visual Profile Gen</Label>
                         </div>
    
                         <div className="space-y-8">
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Operational ID</Label>
                              <Input 
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                placeholder="Legal Full Name" 
                                className="rounded-[24px] border-slate-100 h-16 bg-slate-50 font-black tracking-tight uppercase px-6 italic focus:bg-white transition-all shadow-inner"
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                               <div className="space-y-3">
                                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Specialization</Label>
                                 <Select value={newPlayerSport} onValueChange={(val) => setNewPlayerSport(val as Sport)}>
                                   <SelectTrigger className="rounded-[24px] border-slate-100 h-16 bg-slate-50 font-black tracking-tight uppercase px-6 italic focus:bg-white transition-all shadow-inner">
                                     <SelectValue placeholder="Division" />
                                   </SelectTrigger>
                                   <SelectContent className="rounded-[32px] border-none p-3 shadow-2xl">
                                     <SelectItem value="cricket" className="font-black uppercase text-[10px] py-4 rounded-2xl italic">Cricket</SelectItem>
                                     <SelectItem value="football" className="font-black uppercase text-[10px] py-4 rounded-2xl italic">Football</SelectItem>
                                     <SelectItem value="badminton" className="font-black uppercase text-[10px] py-4 rounded-2xl italic">Badminton</SelectItem>
                                   </SelectContent>
                                 </Select>
                               </div>
                               <div className="space-y-3">
                                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Inception Date</Label>
                                 <Input 
                                   type="date" 
                                   className="rounded-[24px] border-slate-100 h-16 bg-slate-50 font-black tracking-tight px-6 transition-all shadow-inner"
                                   value={newPlayerJoinDate}
                                   onChange={(e) => setNewPlayerJoinDate(e.target.value)}
                                   required
                                 />
                               </div>
                            </div>
                         </div>
                         <div className="flex gap-6 pt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsPlayerDialogOpen(false)} className="flex-1 rounded-[24px] h-16 font-black uppercase text-[10px] tracking-widest text-slate-400">Abort</Button>
                            <Button type="submit" disabled={isSaving} className="flex-1 bg-indigo-600 text-white rounded-[24px] h-16 font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-500/20 hover:bg-slate-900 transition-all italic">
                              {isSaving ? 'Finalizing...' : 'Commit data'}
                            </Button>
                         </div>
                       </form>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
         </div>
      </div>
      <Tabs defaultValue="players" className="w-full space-y-16 flex flex-col">
        {/* Superior Navigation & Console Tier */}
        <div className="flex flex-col gap-12 w-full">
           <div className="flex justify-center flex-col items-center gap-8 bg-slate-900/5 backdrop-blur-md p-10 rounded-[48px] border border-slate-100 shadow-inner">
             <TabsList className="bg-white/50 p-2 rounded-[32px] h-fit border border-white/60 shadow-xl w-fit">
               <TabsTrigger value="players" className="gap-4 rounded-[26px] px-20 py-6 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all italic duration-500">
                  Athletes
               </TabsTrigger>
               <TabsTrigger value="teams" className="gap-4 rounded-[26px] px-20 py-6 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all italic duration-500">
                  Squadrons
               </TabsTrigger>
             </TabsList>
             
             {/* Integrated Tactical Integration Tier */}
             <div className="flex flex-col md:flex-row gap-6 items-center w-full max-w-5xl">
               <div className="relative group flex-1 w-full">
                  <div className="absolute -inset-1 bg-indigo-500 rounded-[32px] blur opacity-0 group-focus-within:opacity-10 transition-opacity duration-1000"></div>
                  <div className="relative">
                     <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
                     <Input 
                       placeholder="Unified Command: Search assets..." 
                       className="pl-20 h-20 w-full border-slate-200 rounded-[32px] bg-white text-md font-black uppercase tracking-widest shadow-2xl shadow-slate-200/30 focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all placeholder:text-slate-300 italic"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
               </div>
               
               <div className="w-full md:w-80 h-20 bg-white rounded-[32px] p-2 shadow-2xl shadow-slate-200/30 border border-slate-200 flex items-center">
                 <Select value={sportFilter} onValueChange={setSportFilter}>
                   <SelectTrigger className="border-none focus:ring-0 shadow-none h-full w-full font-black uppercase text-[10px] tracking-[0.2em] px-8 italic">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <SelectValue placeholder="All Sectors" />
                     </div>
                   </SelectTrigger>
                   <SelectContent className="rounded-[32px] border-none shadow-[0_32px_64px_rgba(0,0,0,0.2)] p-3">
                     <SelectItem value="all" className="font-black uppercase text-[10px] py-4 rounded-2xl italic tracking-widest">Global Scan</SelectItem>
                     <SelectItem value="cricket" className="font-black uppercase text-[10px] py-4 rounded-2xl italic tracking-widest">Cricket Sector</SelectItem>
                     <SelectItem value="football" className="font-black uppercase text-[10px] py-4 rounded-2xl italic tracking-widest">Football Sector</SelectItem>
                     <SelectItem value="badminton" className="font-black uppercase text-[10px] py-4 rounded-2xl italic tracking-widest">Badminton Sector</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
           </div>
        </div>

        <TabsContent value="players" className="w-full animate-in fade-in-50 slide-in-from-bottom-12 duration-1000 outline-none">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pb-20 w-full">
            {filteredPlayers.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.8 }}
                onClick={() => navigate(`/players/${player.id}`)}
                className="group cursor-pointer"
              >
                <div className="relative transform transition-all duration-700 group-hover:-translate-y-4">
                    {/* Shadow Layer */}
                    <div className="absolute inset-x-4 top-1/2 bottom-0 bg-slate-400/20 blur-[64px] rounded-full group-hover:bg-indigo-500/20 transition-all"></div>
                    
                    <Card className="relative h-[480px] elite-card border-none rounded-[64px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] overflow-hidden bg-white group-hover:bg-indigo-50/10 transition-all duration-700">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 group-hover:scale-125 transition-transform duration-1000">
                         <Target size={240} />
                      </div>
                      <CardContent className="p-10 flex flex-col h-full">
                        <div className="flex items-start justify-between mb-8">
                          <div className="relative">
                             <div className="absolute -inset-1 bg-indigo-500 rounded-[48px] blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                             <div className="relative w-32 h-32 rounded-[44px] overflow-hidden border-[10px] border-slate-50 bg-slate-100 group-hover:rotate-6 transition-all duration-700 shadow-2xl">
                                <img src={player.photoURL || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'} alt={player.name} className="w-full h-full object-cover transition-opacity duration-1000 group-hover:opacity-80" />
                             </div>
                             <div className="absolute -bottom-2 -right-2 p-3.5 bg-slate-900 text-white rounded-[22px] border-4 border-white shadow-2xl group-hover:scale-110 transition-transform">
                                <Activity size={18} />
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                             <Badge className={cn(
                               "text-[8px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full border-none shadow-xl",
                               player.status === 'elite' ? 'bg-indigo-500 text-white shadow-indigo-500/20' : 
                               player.status === 'prospect' ? 'bg-amber-500 text-white shadow-amber-500/20' : 
                               'bg-emerald-500 text-white shadow-emerald-500/20'
                             )}>
                               {player.status}
                             </Badge>
                             <p className="text-[7px] font-black border border-slate-100 px-4 py-1.5 rounded-full text-slate-300 uppercase tracking-[0.3em] leading-none bg-slate-50">
                                {player.id.slice(0, 8)}
                             </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4 flex-1">
                           <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 group-hover:animate-ping"></div>
                              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] font-mono">{(player.primarySport || 'cricket').toUpperCase()} VERTICAL</p>
                           </div>
                           <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-[0.9] italic uppercase group-hover:text-indigo-600 transition-colors">
                              {player.name}
                           </h3>
                        </div>
    
                        {/* High-Fi Stat Matrix */}
                        <div className="grid grid-cols-2 gap-5 pt-8 border-t border-slate-50">
                           <div className="p-5 bg-slate-50/50 rounded-[32px] border border-slate-100 group-hover:bg-white transition-all shadow-sm">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Missions</p>
                              <p className="text-2xl font-black text-slate-900 italic tracking-tighter leading-none">
                                {player.stats.cricket.matches + player.stats.football.matches + player.stats.badminton.matches}
                              </p>
                           </div>
                           <div className="p-5 bg-slate-50/50 rounded-[32px] border border-slate-100 group-hover:bg-white transition-all shadow-sm">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Efficiency</p>
                              <p className="text-2xl font-black text-indigo-500 italic tracking-tighter leading-none">
                                {player.status === 'elite' ? '9.8' : player.status === 'training' ? '8.4' : 'N/A'}
                              </p>
                           </div>
                        </div>
    
                        <div className="pt-8 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1.5">Entry Protocol</span>
                            <span className="text-[11px] font-black text-slate-900 uppercase italic tracking-tighter opacity-80">{new Date(player.joinedDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-0 transition-all duration-700 italic">Access Dossier</span>
                             <div className="w-14 h-14 rounded-[24px] bg-slate-900 text-white flex items-center justify-center transform transition-all duration-700 group-hover:rotate-[360deg] group-hover:bg-indigo-600 shadow-2xl group-active:scale-90">
                                <ChevronRight size={26} />
                             </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                </div>
              </motion.div>
            ))}
            {filteredPlayers.length === 0 && (
               <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-32 h-32 rounded-[48px] bg-slate-50 flex items-center justify-center text-slate-200 shadow-inner">
                     <Search size={56} />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Zero Intel Detected</h3>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No personnel matching criteria in current sector</p>
                  </div>
               </div>
            )}
           </div>
        </TabsContent>

        <TabsContent value="teams" className="w-full animate-in fade-in-50 slide-in-from-bottom-10 duration-1000 outline-none">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pb-20 w-full">
             {filteredTeams.map((team, i) => (
               <motion.div
                 key={team.id}
                 initial={{ opacity: 0, x: -30 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: i * 0.1, duration: 0.8 }}
               >
                 <Card className="elite-card border-none rounded-[64px] shadow-2xl overflow-hidden relative group bg-white hover:bg-slate-50 transition-all duration-700">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-700">
                      <Trophy size={160} className="rotate-12" />
                   </div>
                   
                   <CardHeader className="p-12 pb-8 border-b border-slate-50">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-8">
                            <div className="relative">
                                <div className="absolute -inset-2 bg-indigo-500 rounded-[36px] blur-lg opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                <div className="relative w-20 h-20 rounded-[32px] border-[8px] border-slate-50 bg-slate-200 overflow-hidden flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-700 group-hover:rotate-6">
                                   {team.logoURL ? (
                                     <img src={team.logoURL} alt={team.name} className="w-full h-full object-cover" />
                                   ) : (
                                     <Flag size={32} className="text-slate-400" />
                                   )}
                                </div>
                            </div>
                            <div className="space-y-2">
                               <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em] leading-none">{team.sport} SECTOR</p>
                               <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-none group-hover:translate-x-2 transition-transform duration-700">{team.name}</CardTitle>
                            </div>
                         </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="text-slate-300 hover:text-slate-900 rounded-[24px] h-14 w-14 hover:bg-white transition-all shadow-sm border border-transparent hover:border-slate-100" />}>
                               <MoreVertical size={24} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="p-3 rounded-[32px] border-none shadow-2xl font-black min-w-[200px]">
                               <DropdownMenuGroup>
                                  <DropdownMenuItem className="font-black text-[10px] uppercase py-4 px-6 rounded-2xl cursor-not-allowed opacity-50 flex items-center gap-3 italic">
                                     <Activity size={14} /> Reconfigure Tactics
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-50" />
                                  <DropdownMenuItem className="font-black text-[10px] uppercase py-4 px-6 rounded-2xl text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3 italic">
                                     <Dna size={14} /> Decommission Unit
                                  </DropdownMenuItem>
                               </DropdownMenuGroup>
                            </DropdownMenuContent>
                         </DropdownMenu>
                      </div>
                   </CardHeader>
                   <CardContent className="p-12 space-y-12">
                      <div className="grid grid-cols-2 gap-6">
                         <div className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 group-hover:bg-white transition-all duration-700 group-hover:border-indigo-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Unit count</p>
                            <div className="flex items-end gap-2">
                               <p className="text-5xl font-black text-slate-900 italic tracking-tighter leading-none">{team.playerIds.length}</p>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic mb-1">PERSONNEL</span>
                            </div>
                         </div>
                         <div className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 group-hover:bg-white transition-all duration-700 group-hover:border-emerald-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Unit XP</p>
                            <div className="flex items-end gap-2">
                               <p className="text-5xl font-black text-emerald-500 italic tracking-tighter leading-none">MVP</p>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic mb-1">RATING</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="space-y-6">
                         <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-4 italic px-2">
                           <UsersIcon size={16} className="text-indigo-500" /> Tactical Identity Roster
                         </p>
                         <div className="flex -space-x-5 overflow-hidden p-2">
                            {team.playerIds.slice(0, 6).map((pid, idx) => {
                              const p = players.find(player => player.id === pid);
                              return (
                                <motion.div 
                                  key={pid}
                                  whileHover={{ y: -8, scale: 1.1, zIndex: 10 }}
                                  className="relative"
                                >
                                    <Avatar className="h-16 w-16 rounded-[24px] border-4 border-white shadow-2xl transition-all cursor-pointer ring-1 ring-slate-100">
                                      <AvatarImage src={p?.photoURL} className="object-cover" />
                                      <AvatarFallback className="text-sm bg-slate-50 text-slate-400 font-black">{p?.name[0]}</AvatarFallback>
                                    </Avatar>
                                </motion.div>
                              );
                            })}
                            {team.playerIds.length > 6 && (
                              <div className="flex items-center justify-center h-16 w-16 rounded-[24px] border-4 border-white bg-slate-900 text-xs font-black text-white shadow-2xl ring-1 ring-slate-100 relative group-hover:bg-indigo-600 transition-colors">
                                 +{team.playerIds.length - 6}
                              </div>
                            )}
                         </div>
                      </div>
    
                      <div className="pt-10 grid grid-cols-2 gap-6 border-t border-slate-50">
                         <Button variant="outline" className="rounded-[24px] h-16 font-black uppercase text-[10px] tracking-widest border-slate-100 text-slate-500 hover:bg-slate-50 italic">Full Overview</Button>
                         <Button className="rounded-[24px] h-16 font-black uppercase text-[10px] tracking-widest bg-slate-900 text-white shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all italic">Mission Hub</Button>
                      </div>
                   </CardContent>
                 </Card>
               </motion.div>
             ))}
             {filteredTeams.length === 0 && (
                <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-6">
                   <div className="w-32 h-32 rounded-[48px] bg-slate-50 flex items-center justify-center text-slate-200">
                      <Flag size={56} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Units Not Found</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Assemble your first tactical squadron to begin operations</p>
                   </div>
                </div>
             )}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
