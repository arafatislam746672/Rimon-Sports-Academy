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
  CheckCircle2
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

import { toast } from 'sonner';
import { dataService } from '@/services/dataService';
import { useAuth } from '@/context/AuthContext';
import { Player, Sport, Team, UserRole } from '@/types';

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-primary tracking-tighter uppercase italic">
            Academy <span className="text-accent">Roster</span>
          </h2>
          <p className="text-text-light font-bold text-sm uppercase tracking-widest opacity-60">Manage athletes and squads</p>
        </div>
        
        <div className="flex gap-3">
          {isManagement && (
            <>
              <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                 <DialogTrigger render={
                   <Button variant="outline" className="border-accent text-accent font-black uppercase tracking-widest text-[10px] h-10 px-6 hover:bg-accent/5">
                     <Flag size={14} className="mr-2" />
                     Create Team
                   </Button>
                 } />
                 <DialogContent className="sm:max-w-[500px] bg-white border-border-custom rounded-[32px]">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black text-primary uppercase">Formation Board</DialogTitle>
                      <DialogDescription className="font-bold text-xs text-text-light/60">Assemble your squad for upcoming tournaments.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveTeam} className="space-y-6 py-4">
                       <div className="flex flex-col items-center gap-3">
                          <div className="relative group">
                            <div className="w-24 h-24 rounded-[32px] border-4 border-secondary bg-muted overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                               {teamLogoPreview ? (
                                 <img src={teamLogoPreview} alt="Team Logo Preview" className="w-full h-full object-cover" />
                               ) : (
                                  <Flag size={32} className="text-text-light/20" />
                               )}
                            </div>
                            <Button 
                              type="button" 
                              variant="secondary" 
                              size="icon" 
                              className="absolute -bottom-2 -right-2 rounded-2xl h-10 w-10 shadow-xl border border-secondary bg-primary text-secondary hover:bg-primary/90"
                              onClick={() => teamLogoInputRef.current?.click()}
                            >
                               <Upload size={16} />
                            </Button>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            ref={teamLogoInputRef} 
                            accept="image/*"
                            onChange={handleTeamLogoChange}
                          />
                          <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/40">Team Brand Logo</Label>
                       </div>

                       <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Team Name</Label>
                            <Input 
                              value={newTeamName}
                              onChange={(e) => setNewTeamName(e.target.value)}
                              placeholder="e.g. Dhaka Tigers"
                              className="rounded-xl border-border-custom h-11"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Sport</Label>
                            <Select value={newTeamSport} onValueChange={(val) => {
                              setNewTeamSport(val as Sport);
                              setSelectedPlayerIds([]); // Reset selection when sport changes
                            }}>
                              <SelectTrigger className="rounded-xl border-border-custom h-11 transition-all focus:ring-accent">
                                <SelectValue placeholder="Select sport" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cricket">Cricket</SelectItem>
                                <SelectItem value="football">Football</SelectItem>
                                <SelectItem value="badminton">Badminton</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                       </div>

                       {newTeamSport && (
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Eligible Players ({players.filter(p => p.primarySport === newTeamSport).length})</Label>
                            <div className="max-h-[200px] overflow-y-auto border border-border-custom rounded-2xl p-2 space-y-1 custom-scrollbar">
                               {players.filter(p => p.primarySport === newTeamSport).map(p => (
                                 <div key={p.id} className="flex items-center gap-3 p-2 hover:bg-secondary/20 rounded-xl transition-colors cursor-pointer" onClick={() => {
                                   if (selectedPlayerIds.includes(p.id)) {
                                     setSelectedPlayerIds(selectedPlayerIds.filter(id => id !== p.id));
                                   } else {
                                     setSelectedPlayerIds([...selectedPlayerIds, p.id]);
                                   }
                                 }}>
                                    <Checkbox checked={selectedPlayerIds.includes(p.id)} />
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={p.photoURL} />
                                      <AvatarFallback>{p.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-bold text-primary">{p.name}</span>
                                    <Badge variant="secondary" className="ml-auto text-[8px] font-black uppercase tracking-widest">{p.status}</Badge>
                                 </div>
                               ))}
                               {players.filter(p => p.primarySport === newTeamSport).length === 0 && (
                                 <p className="text-center py-8 text-xs font-bold text-text-light opacity-40 italic">No players available for this sport.</p>
                               )}
                            </div>
                         </div>
                       )}

                       <div className="pt-4 flex gap-3">
                          <Button type="button" variant="ghost" onClick={() => setIsTeamDialogOpen(false)} className="flex-1 rounded-xl h-12 font-black uppercase text-xs tracking-widest">Cancel</Button>
                          <Button type="submit" disabled={isSaving} className="flex-1 bg-accent text-primary rounded-xl h-12 font-black uppercase text-xs tracking-widest hover:bg-accent/90">
                            {isSaving ? 'Creating...' : 'Finalize Squad'}
                          </Button>
                       </div>
                    </form>
                 </DialogContent>
              </Dialog>

              <Dialog open={isPlayerDialogOpen} onOpenChange={setIsPlayerDialogOpen}>
                <DialogTrigger render={
                  <Button className="bg-primary text-secondary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] h-10 px-6 shadow-lg shadow-primary/20">
                    <UserPlus size={16} className="mr-2" />
                    Register Athlete
                  </Button>
                } />
                <DialogContent className="sm:max-w-[425px] bg-white border-border-custom rounded-[32px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black text-primary uppercase">New Enrollment</DialogTitle>
                    <DialogDescription className="text-xs font-bold text-text-light/60">
                      Enter the details for the new academy member.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSavePlayer} className="space-y-6 py-4">
                    <div className="flex flex-col items-center gap-3">
                       <div className="relative group">
                         <div className="w-24 h-24 rounded-[32px] border-4 border-secondary bg-muted overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                            {photoPreview ? (
                              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <Camera size={32} className="text-text-light/20" />
                            )}
                         </div>
                         <Button 
                           type="button" 
                           variant="secondary" 
                           size="icon" 
                           className="absolute -bottom-2 -right-2 rounded-2xl h-10 w-10 shadow-xl border border-secondary bg-primary text-secondary hover:bg-primary/90"
                           onClick={() => fileInputRef.current?.click()}
                         >
                            <Upload size={16} />
                         </Button>
                       </div>
                       <input 
                         type="file" 
                         className="hidden" 
                         ref={fileInputRef} 
                         accept="image/*"
                         onChange={handlePhotoChange}
                       />
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Full Name</Label>
                        <Input 
                          placeholder="e.g. Sakib Al Hasan" 
                          className="rounded-xl border-border-custom h-11"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Primary Sport</Label>
                        <Select value={newPlayerSport} onValueChange={(val) => setNewPlayerSport(val as Sport)}>
                          <SelectTrigger className="rounded-xl border-border-custom h-11">
                            <SelectValue placeholder="Select sport" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cricket">Cricket</SelectItem>
                            <SelectItem value="football">Football</SelectItem>
                            <SelectItem value="badminton">Badminton</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Joining Date</Label>
                        <Input 
                          type="date" 
                          className="rounded-xl border-border-custom h-11"
                          value={newPlayerJoinDate}
                          onChange={(e) => setNewPlayerJoinDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                       <Button type="button" variant="ghost" onClick={() => setIsPlayerDialogOpen(false)} className="flex-1 rounded-xl h-12 font-black uppercase text-xs tracking-widest">Cancel</Button>
                       <Button type="submit" disabled={isSaving} className="flex-1 bg-primary text-secondary rounded-xl h-12 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20">
                         {isSaving ? 'Processing...' : 'Save Player'}
                       </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="players" className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="bg-white border border-border-custom p-1 rounded-2xl w-full sm:w-auto h-auto">
            <TabsTrigger value="players" className="flex-1 sm:flex-none gap-2 rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-accent text-[10px] font-black uppercase tracking-widest transition-all">
              <UsersIcon size={14} />
              Athletes
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex-1 sm:flex-none gap-2 rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-accent text-[10px] font-black uppercase tracking-widest transition-all">
              <Flag size={14} />
              Teams/Squads
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" size={16} />
              <Input 
                placeholder="Quick Search..." 
                className="pl-10 h-11 w-full sm:w-64 border-border-custom rounded-2xl text-xs font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-36 h-11 border-border-custom rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-accent">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="Cricket">Cricket</SelectItem>
                <SelectItem value="Football">Football</SelectItem>
                <SelectItem value="Badminton">Badminton</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="players" className="animate-in fade-in-50 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlayers.map((player) => (
              <Card key={player.id} className="group shadow-sm border-border-custom hover:shadow-xl hover:-translate-y-1 transition-all rounded-[32px] overflow-hidden bg-white">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="relative">
                       <Avatar className="w-20 h-20 rounded-[24px] border-2 border-secondary shadow-lg">
                        <AvatarImage src={player.photoURL} alt={player.name} />
                        <AvatarFallback className="bg-primary/5 text-primary text-xl font-black">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 p-1.5 bg-accent text-primary rounded-xl border-4 border-white shadow-lg">
                         <CheckCircle2 size={12} />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-text-light/40 hover:text-primary transition-colors">
                      <MoreVertical size={20} />
                    </Button>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-primary leading-tight tracking-tight">
                      {player.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-secondary text-primary text-[9px] uppercase tracking-widest font-black border border-border-custom px-2 py-0.5">
                        {player.primarySport || 'Cricket'}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/10 text-primary/40 px-2 py-0.5">
                        {player.status || 'prospect'}
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-secondary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[9px] font-black text-text-light/40 uppercase tracking-widest">
                      <Calendar size={14} className="opacity-40" />
                      <span>Est. {new Date(player.joinedDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/players/${player.id}`)}
                      className="text-[9px] font-black uppercase tracking-[2px] text-accent hover:bg-accent/5 h-8 px-3 rounded-lg"
                    >
                      Profile <ChevronRight size={12} className="ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredPlayers.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                 <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-text-light/20">
                    <UsersIcon size={32} />
                 </div>
                 <p className="text-sm font-bold text-text-light opacity-60 italic">No athletes found matching your filters.</p>
              </div>
            )}
           </div>
        </TabsContent>

        <TabsContent value="teams" className="animate-in fade-in-50 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredTeams.map((team) => (
               <Card key={team.id} className="shadow-sm border-border-custom hover:shadow-xl transition-all rounded-[32px] overflow-hidden bg-white">
                 <CardHeader className="bg-secondary/10 pb-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl border-2 border-secondary bg-white overflow-hidden flex items-center justify-center shadow-sm">
                             {team.logoURL ? (
                               <img src={team.logoURL} alt={team.name} className="w-full h-full object-cover" />
                             ) : (
                               <Flag size={20} className="text-primary" />
                             )}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-black text-primary tracking-tight">{team.name}</CardTitle>
                            <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest mt-1">{team.sport}</Badge>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="text-text-light/40"><MoreVertical size={18} /></Button>
                    </div>
                 </CardHeader>
                 <CardContent className="p-6">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-light/60">
                          <span>Squad Size</span>
                          <span className="text-primary">{team.playerIds.length} Athletes</span>
                       </div>
                       
                       <div className="flex -space-x-3 overflow-hidden p-1">
                          {team.playerIds.slice(0, 5).map(pid => {
                            const p = players.find(player => player.id === pid);
                            return (
                              <Avatar key={pid} className="inline-block h-10 w-10 border-4 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer">
                                <AvatarImage src={p?.photoURL} />
                                <AvatarFallback className="text-[10px] bg-primary/5 text-primary font-bold">{p?.name[0]}</AvatarFallback>
                              </Avatar>
                            );
                          })}
                          {team.playerIds.length > 5 && (
                            <div className="flex items-center justify-center h-10 w-10 rounded-full border-4 border-white bg-secondary text-[10px] font-bold text-primary shadow-sm">
                               +{team.playerIds.length - 5}
                            </div>
                          )}
                       </div>

                       <div className="pt-4 flex gap-2">
                          <Button variant="outline" className="flex-1 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest border-border-custom hover:border-primary">Manage</Button>
                          <Button variant="outline" className="flex-1 rounded-xl h-10 text-[10px] font-black uppercase tracking-widest border-border-custom hover:border-primary">Schedule</Button>
                       </div>
                    </div>
                 </CardContent>
               </Card>
             ))}
             {filteredTeams.length === 0 && (
               <div className="col-span-full py-20 text-center space-y-4">
                 <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-text-light/20">
                    <Flag size={32} />
                 </div>
                 <p className="text-sm font-bold text-text-light opacity-60 italic">No teams formed yet. Start assembling your squad!</p>
               </div>
             )}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
