import * as React from 'react';
import { 
  Trophy, 
  Plus, 
  Users, 
  Medal, 
  Table as TableIcon,
  List,
  ShieldCheck,
  Flag,
  Calendar,
  ChevronRight,
  Info,
  Workflow,
  Sparkles,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  Search,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { dataService } from '@/services/dataService';
import { Tournament, Sport, Team, Match } from '@/types';
import BracketVisualization from '@/components/BracketVisualization';
import LeagueSwitcher from '@/components/LeagueSwitcher';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Tournaments() {
  const { profile } = useAuth();
  const isManagement = profile?.role === 'management' || profile?.isSuperAdmin;
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'split' | 'table'>('split');
  const [sortField, setSortField] = React.useState<keyof Tournament>('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSport, setSelectedSport] = React.useState<Sport | 'all'>('all');

  // Form State
  const [newName, setNewName] = React.useState('');
  const [newSport, setNewSport] = React.useState<Sport | ''>('');
  const [newFormat, setNewFormat] = React.useState<'knockout' | 'league'>('league');
  const [newStartDate, setNewStartDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [selectedTeamIds, setSelectedTeamIds] = React.useState<string[]>([]);
  const [selectedTournament, setSelectedTournament] = React.useState<Tournament | null>(null);

  React.useEffect(() => {
    const unsubTournaments = dataService.getTournaments(setTournaments);
    const unsubTeams = dataService.getTeams(setTeams);
    const unsubMatches = dataService.getMatches(setMatches);
    return () => {
      unsubTournaments();
      unsubTeams();
      unsubMatches();
    };
  }, []);

  React.useEffect(() => {
    if (tournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(tournaments[0]);
    }
  }, [tournaments]);

  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSport || selectedTeamIds.length < 2) {
      toast.error('Please provide name, sport and select at least 2 teams.');
      return;
    }

    setIsSaving(true);
    try {
      const tournamentToCreate: Omit<Tournament, 'id'> = {
        name: newName.trim(),
        sport: newSport as Sport,
        format: newFormat,
        startDate: new Date(newStartDate).toISOString(),
        participants: selectedTeamIds,
        matchIds: [],
        status: 'upcoming'
      };

      await dataService.addTournament(tournamentToCreate);
      toast.success(`Tournament "${newName}" sanctioned for deployment!`);
      setIsDialogOpen(false);
      setNewName('');
      setNewSport('');
      setSelectedTeamIds([]);
    } catch (error) {
      toast.error('Failed to create tournament registry.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSort = (field: keyof Tournament) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTournaments = React.useMemo(() => {
    const filtered = tournaments.filter(t => 
      (selectedSport === 'all' || t.sport === selectedSport) &&
      (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       t.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
       t.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (Array.isArray(aVal) && Array.isArray(bVal)) {
        comparison = aVal.length - bVal.length;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tournaments, sortField, sortOrder, searchQuery]);

  const standings = React.useMemo(() => {
    if (!selectedTournament) return [];
    
    // Initialize results map for participants
    const statsMap: Record<string, { played: number, won: number, drawn: number, lost: number, points: number }> = {};
    selectedTournament.participants.forEach(id => {
      statsMap[id] = { played: 0, won: 0, drawn: 0, lost: 0, points: 0 };
    });

    // Process matches associated with this tournament
    const tournamentMatches = matches.filter(m => selectedTournament.matchIds.includes(m.id) && m.status === 'completed');
    
    tournamentMatches.forEach(m => {
      if (!m.team1Id || !m.team2Id) return;
      
      const config = selectedTournament.pointsConfig || { win: 3, draw: 1, loss: 0 };
      
      // Update played count
      if (statsMap[m.team1Id]) statsMap[m.team1Id].played++;
      if (statsMap[m.team2Id]) statsMap[m.team2Id].played++;

      if (m.winnerId) {
        if (statsMap[m.winnerId]) {
          statsMap[m.winnerId].won++;
          statsMap[m.winnerId].points += config.win;
        }
        const loserId = m.winnerId === m.team1Id ? m.team2Id : m.team1Id;
        if (statsMap[loserId]) {
          statsMap[loserId].lost++;
          statsMap[loserId].points += config.loss;
        }
      } else {
        // Draw
        if (statsMap[m.team1Id]) {
          statsMap[m.team1Id].drawn++;
          statsMap[m.team1Id].points += config.draw;
        }
        if (statsMap[m.team2Id]) {
          statsMap[m.team2Id].drawn++;
          statsMap[m.team2Id].points += config.draw;
        }
      }
    });

    // Convert map to sorted array
    return selectedTournament.participants
      .map(id => ({ id, ...statsMap[id] }))
      .sort((a, b) => b.points - a.points || b.won - a.won);
  }, [selectedTournament, matches]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-border">
        <div className="space-y-2">
          <h2 className="text-5xl font-display font-black text-foreground tracking-tighter uppercase italic flex items-center gap-3 leading-none">
            Combat <span className="text-accent underline decoration-accent/30 underline-offset-8">Theaters</span>
          </h2>
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2 italic">
             Sanctioned Operations • Competitive Matrix Control
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          <LeagueSwitcher currentSport={selectedSport} onSportChange={setSelectedSport} />
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="flex bg-muted p-1 rounded-2xl w-full sm:w-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('split')}
              className={cn(
                "flex-1 sm:flex-none rounded-xl h-10 px-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'split' ? "bg-card text-accent shadow-lg shadow-accent/20" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid size={14} className="mr-2" /> Split
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('table')}
              className={cn(
                "flex-1 sm:flex-none rounded-xl h-10 px-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'table' ? "bg-card text-accent shadow-lg shadow-accent/20" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List size={14} className="mr-2" /> Table
            </Button>
          </div>

          {isManagement && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-accent text-accent-foreground font-black h-14 md:h-16 px-6 md:px-10 rounded-[24px] md:rounded-[32px] uppercase text-[10px] tracking-widest shadow-2xl shadow-accent/20 hover:bg-accent/90 transition-all active:scale-95 italic border border-accent/20">
                  <Plus size={16} className="mr-2 md:mr-3" />
                  Sanction
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-[550px] bg-card border-none rounded-[32px] md:rounded-[48px] p-0 overflow-hidden shadow-2xl">
                <div className="bg-primary p-12 text-primary-foreground relative">
                  <div className="absolute top-0 right-0 p-12 opacity-10">
                      <Flag size={140} className="rotate-12" />
                  </div>
                  <div className="relative z-10 space-y-4">
                      <Badge className="bg-accent text-primary-foreground font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full border-none shadow-lg shadow-accent/20">
                        Tactical Command
                      </Badge>
                      <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Operational Config</h2>
                      <p className="text-primary-foreground/70 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed max-w-[300px]">
                        Deploy new tournament instance and participating units.
                      </p>
                  </div>
                </div>
                <form onSubmit={handleSaveTournament} className="p-12 space-y-10 max-h-[70vh] overflow-y-auto no-scrollbar">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Mission Identifier</Label>
                      <Input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. ACADEMY WINTER LEAGUE 2026"
                        className="h-16 rounded-2xl bg-muted/30 border-border font-black text-sm uppercase italic px-6 shadow-inner focus:border-accent transition-all"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Operational Track</Label>
                        <Select value={newSport} onValueChange={(val) => {
                          setNewSport(val as Sport);
                          setSelectedTeamIds([]);
                        }}>
                          <SelectTrigger className="h-16 rounded-2xl bg-muted/30 border-border font-black text-[10px] uppercase tracking-widest px-6 shadow-inner focus:border-accent transition-all">
                            <SelectValue placeholder="Sport" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl p-2 font-black">
                            <SelectItem value="cricket" className="text-[10px] uppercase py-3">Cricket</SelectItem>
                            <SelectItem value="football" className="text-[10px] uppercase py-3">Football</SelectItem>
                            <SelectItem value="badminton" className="text-[10px] uppercase py-3">Badminton</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Session Matrix</Label>
                        <Select value={newFormat} onValueChange={(val) => setNewFormat(val as any)}>
                          <SelectTrigger className="h-16 rounded-2xl bg-muted/30 border-border font-black text-[10px] uppercase tracking-widest px-6 shadow-inner focus:border-accent transition-all">
                            <SelectValue placeholder="Format" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl p-2 font-black">
                            <SelectItem value="league" className="text-[10px] uppercase py-3">League</SelectItem>
                            <SelectItem value="knockout" className="text-[10px] uppercase py-3">Knockout</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Initialization Date</Label>
                      <Input 
                        type="date"
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                        className="h-16 rounded-2xl bg-muted/30 border-border font-black text-xs px-6 shadow-inner focus:border-accent transition-all"
                      />
                    </div>

                    {newSport && (
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex justify-between">
                          <span>Deployed Units ({teams.filter(t => t.sport === newSport || t.sport === 'both').length})</span>
                          <span className={cn(selectedTeamIds.length < 2 ? "text-amber-500" : "text-emerald-500")}>{selectedTeamIds.length} Selection Active</span>
                        </Label>
                        <div className="max-h-[200px] overflow-y-auto no-scrollbar border border-border rounded-[32px] p-4 bg-muted/20 space-y-2">
                          {teams.filter(t => t.sport === newSport || t.sport === 'both').map(t => (
                            <div key={t.id} 
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group",
                                selectedTeamIds.includes(t.id) ? "bg-card shadow-xl border border-accent/10" : "hover:bg-card/100"
                              )}
                              onClick={() => {
                                  if (selectedTeamIds.includes(t.id)) {
                                    setSelectedTeamIds(selectedTeamIds.filter(id => id !== t.id));
                                  } else {
                                    setSelectedTeamIds([...selectedTeamIds, t.id]);
                                  }
                              }}>
                              <div className={cn(
                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                selectedTeamIds.includes(t.id) ? "bg-accent border-accent" : "border-border"
                              )}>
                                <ShieldCheck size={14} className={cn("text-primary-foreground transition-opacity", selectedTeamIds.includes(t.id) ? "opacity-100" : "opacity-0")} />
                              </div>
                              <span className="text-[11px] font-black text-foreground uppercase tracking-tight italic">{t.name}</span>
                              <span className="ml-auto text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">{t.playerIds.length} PERSONNEL</span>
                            </div>
                          ))}
                          {teams.filter(t => t.sport === newSport || t.sport === 'both').length === 0 && (
                            <div className="text-center py-10">
                                <Info size={32} className="mx-auto text-foreground/80 mb-2" />
                                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest italic">No operational units detected for this track</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="sticky bottom-0 -mx-12 px-12 bg-card/80 backdrop-blur-md pb-12 pt-6 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Abort Mission</Button>
                        <Button type="submit" disabled={isSaving} className="bg-primary text-primary-foreground font-black rounded-2xl h-14 uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 hover:bg-primary transition-all active:scale-95 italic">
                          {isSaving ? 'Sanctioning...' : 'Sanction Operation'}
                        </Button>
                    </div>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>

    {viewMode === 'table' ? (
        <Card className="elite-card border-none shadow-2xl rounded-[48px] overflow-hidden bg-card">
          <div className="p-10 bg-primary text-primary-foreground flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Operational <span className="text-accent/80">Registry</span></h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-foreground/60">Verified Campaign Database</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-foreground/20" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Database..."
                className="h-14 bg-card/10 border-border/5 rounded-2xl pl-12 font-black text-xs uppercase italic text-primary-foreground placeholder:text-primary-foreground/10 focus:bg-card/10 transition-all"
              />
            </div>
          </div>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead onClick={() => toggleSort('name')} className="cursor-pointer group h-20 pl-10">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Operation Name</span>
                      {sortField === 'name' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => toggleSort('sport')} className="cursor-pointer group h-20">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Sector</span>
                      {sortField === 'sport' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => toggleSort('startDate')} className="cursor-pointer group h-20">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Initiation Date</span>
                      {sortField === 'startDate' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => toggleSort('participants')} className="cursor-pointer group h-20 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Assets Deployed</span>
                      {sortField === 'participants' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => toggleSort('status')} className="cursor-pointer group h-20">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">Current Status</span>
                      {sortField === 'status' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead className="h-20 text-right pr-10">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTournaments.map((t) => (
                  <TableRow key={t.id} className="group hover:bg-muted/30 transition-all border-b border-border last:border-0">
                    <TableCell className="py-8 pl-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl group-hover:rotate-6 transition-transform">
                          <Trophy size={18} />
                        </div>
                        <span className="text-sm font-black uppercase italic tracking-tight text-foreground">{t.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-accent/10 text-accent border-none text-[8px] font-black uppercase px-3 py-1 rounded-full">
                        {t.sport} division
                      </Badge>
                    </TableCell>
                    <TableCell className="font-black text-[10px] text-muted-foreground uppercase tracking-widest">
                      {new Date(t.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-lg font-black italic text-foreground tracking-tighter">{t.participants.length}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          t.status === 'ongoing' ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : 
                          t.status === 'upcoming' ? "bg-accent shadow-lg shadow-accent/50" : "bg-muted-foreground/60"
                        )} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <Button 
                        onClick={() => {
                          setSelectedTournament(t);
                          setViewMode('split');
                        }}
                        className="bg-primary text-primary-foreground rounded-xl h-10 px-6 text-[8px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                      >
                        Access Intelligence
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Active Tournaments Column */}
        <div className="lg:col-span-1 space-y-10">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3 italic">
               <Trophy size={18} className="text-amber-500" />
               Roster Registry
             </h3>
             <Badge className="bg-muted/30 text-muted-foreground border-none text-[8px] font-black tracking-widest">{tournaments.length} ACTIVE</Badge>
          </div>
          
          <div className="space-y-6">
            {tournaments.map((t) => (
              <motion.div 
                whileHover={{ x: 5 }}
                key={t.id} 
                onClick={() => setSelectedTournament(t)}
                className={cn(
                  "p-6 rounded-[36px] border-none shadow-2xl transition-all cursor-pointer group relative overflow-hidden",
                  selectedTournament?.id === t.id ? "bg-accent text-accent-foreground shadow-accent/40" : "bg-card text-card-foreground shadow-black/40 hover:bg-muted"
                )}>
                {selectedTournament?.id === t.id && (
                   <div className="absolute top-0 right-0 p-4 opacity-5 bg-accent rounded-bl-[40px]">
                      <Sparkles size={40} />
                   </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <Badge variant="outline" className={cn(
                     "text-[8px] uppercase font-black tracking-widest px-3 py-1 rounded-full border-none",
                     selectedTournament?.id === t.id ? "bg-card/10 text-accent/80" : "bg-accent/10 text-accent"
                  )}>
                    {t.sport}
                  </Badge>
                  <div className={cn(
                     "w-2 h-2 rounded-full",
                     t.status === 'ongoing' ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : 
                     t.status === 'upcoming' ? "bg-accent shadow-lg shadow-accent/50" : "bg-muted-foreground/60"
                  )} />
                </div>
                
                <h4 className="font-black text-lg tracking-tighter uppercase italic leading-tight group-hover:translate-x-1 transition-transform">{t.name}</h4>
                
                <div className="flex items-center gap-6 mt-8 pt-6 border-t border-border/5 opacity-60">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-accent/80" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{t.participants.length} UNts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Medal size={14} className="text-accent/80" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{t.format}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {tournaments.length === 0 && (
              <div className="py-20 text-center bg-card rounded-[40px] border-4 border-dashed border-border flex flex-col items-center gap-4">
                 <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center text-foreground/80">
                    <Info size={32} />
                 </div>
                 <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] italic">No missions sanctioned</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed View Panel */}
        <div className="lg:col-span-3 space-y-10">
          {selectedTournament ? (
            <motion.div
              key={selectedTournament.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="rounded-[64px] border-none shadow-2xl shadow-black/40 overflow-hidden bg-card min-h-[700px] flex flex-col">
                <CardHeader className="bg-primary p-8 md:p-12 text-primary-foreground border-b border-border/10 relative">
                   <div className="absolute top-0 right-0 p-12 opacity-5">
                      <Trophy size={160} />
                   </div>
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12">
                      <div className="space-y-4">
                         <div className="flex flex-wrap items-center gap-2 md:gap-4">
                            <Badge className="bg-accent text-primary-foreground border-none font-black text-[8px] md:text-[9px] uppercase tracking-widest px-3 md:px-4 py-1 md:py-1.5 rounded-full shadow-lg shadow-accent/20">
                               {(selectedTournament.sport || 'cricket').toUpperCase()} SECTOR
                            </Badge>
                            <Badge variant="outline" className="bg-card/10 text-primary-foreground/70 border-border/10 font-black text-[8px] md:text-[9px] uppercase tracking-widest px-3 md:px-4 py-1 md:py-1.5 rounded-full">
                               {(selectedTournament.format || 'league').toUpperCase()} MATRIX
                            </Badge>
                         </div>
                         <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">{selectedTournament.name}</h2>
                         <p className="text-[8px] md:text-[10px] font-black text-primary-foreground/60 uppercase tracking-[0.4em] flex items-center gap-2 md:gap-3">
                            <Calendar size={12} className="text-accent/80" /> Operational Since {new Date(selectedTournament.startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                         </p>
                      </div>
                      
                      <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex-1 text-center bg-card/10 border border-border/5 rounded-2xl md:rounded-3xl p-4 md:p-6 md:min-w-[120px]">
                           <p className="text-2xl md:text-3xl font-black italic whitespace-nowrap leading-none mb-2">{selectedTournament.participants.length}</p>
                           <p className="text-[7px] md:text-[8px] font-black text-primary-foreground/60 uppercase tracking-widest">Units</p>
                        </div>
                        <div className="flex-1 text-center bg-card/10 border border-border/5 rounded-2xl md:rounded-3xl p-4 md:p-6 md:min-w-[120px]">
                           <p className="text-2xl md:text-3xl font-black italic whitespace-nowrap leading-none mb-2">{selectedTournament.matchIds.length}</p>
                           <p className="text-[7px] md:text-[8px] font-black text-primary-foreground/60 uppercase tracking-widest">Events</p>
                        </div>
                        {isManagement && (
                           <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                              <DialogTrigger asChild>
                                <Button className="h-full bg-card/10 border border-border/5 rounded-2xl md:rounded-3xl p-4 md:p-6 hover:bg-card/20 transition-all">
                                   <Workflow size={20} className="mb-2 mx-auto text-accent" />
                                   <p className="text-[7px] md:text-[8px] font-black text-primary-foreground/60 uppercase tracking-widest">Equation</p>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md bg-card border-none rounded-[32px] p-10">
                                 <DialogHeader>
                                    <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">Equation Builder</DialogTitle>
                                    <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Configure custom points matrix for this mission.</DialogDescription>
                                 </DialogHeader>
                                 <div className="space-y-8 py-6">
                                    <div className="grid grid-cols-3 gap-4">
                                       <div className="space-y-2">
                                          <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Win Pts</Label>
                                          <Input 
                                            type="number" 
                                            className="h-16 rounded-xl bg-muted/30 border-border text-center font-black italic text-xl" 
                                            value={selectedTournament.pointsConfig?.win ?? 3}
                                            onChange={(e) => {
                                              const win = parseInt(e.target.value) || 0;
                                              const newConfig = { ...(selectedTournament.pointsConfig || { win: 3, draw: 1, loss: 0 }), win };
                                              dataService.updateTournament(selectedTournament.id, { pointsConfig: newConfig });
                                            }}
                                          />
                                       </div>
                                       <div className="space-y-2">
                                          <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Draw Pts</Label>
                                          <Input 
                                            type="number" 
                                            className="h-16 rounded-xl bg-muted/30 border-border text-center font-black italic text-xl" 
                                            value={selectedTournament.pointsConfig?.draw ?? 1}
                                            onChange={(e) => {
                                              const draw = parseInt(e.target.value) || 0;
                                              const newConfig = { ...(selectedTournament.pointsConfig || { win: 3, draw: 1, loss: 0 }), draw };
                                              dataService.updateTournament(selectedTournament.id, { pointsConfig: newConfig });
                                            }}
                                          />
                                       </div>
                                       <div className="space-y-2">
                                          <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Loss Pts</Label>
                                          <Input 
                                            type="number" 
                                            className="h-16 rounded-xl bg-muted/30 border-border text-center font-black italic text-xl" 
                                            value={selectedTournament.pointsConfig?.loss ?? 0}
                                            onChange={(e) => {
                                              const loss = parseInt(e.target.value) || 0;
                                              const newConfig = { ...(selectedTournament.pointsConfig || { win: 3, draw: 1, loss: 0 }), loss };
                                              dataService.updateTournament(selectedTournament.id, { pointsConfig: newConfig });
                                            }}
                                          />
                                       </div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                                       <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest italic leading-relaxed">Equations are applied in real-time to the matrix below. Tactical rankings will update immediately upon reconfiguration.</p>
                                    </div>
                                    <Button onClick={() => setIsConfigDialogOpen(false)} className="w-full h-14 bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest rounded-xl">Commit Configuration</Button>
                                 </div>
                              </DialogContent>
                           </Dialog>
                        )}
                      </div>
                   </div>
                </CardHeader>
                
                <CardContent className="p-0 flex-1 flex flex-col">
                  <Tabs defaultValue="standings" className="w-full flex-1 flex flex-col">
                    <div className="px-4 md:px-12 pt-6 md:pt-10 pb-4 md:pb-6 bg-muted/20 border-b border-border">
                      <TabsList className="bg-muted h-12 md:h-16 rounded-[16px] md:rounded-[24px] p-1 w-full sm:w-fit flex gap-1 md:gap-2 border border-border/50">
                        <TabsTrigger value="standings" className="flex-1 px-4 md:px-10 rounded-[12px] md:rounded-[18px] font-black uppercase text-[8px] md:text-[10px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all italic h-full"> 
                           Matrix
                        </TabsTrigger>
                        <TabsTrigger value="fixtures" className="flex-1 px-4 md:px-10 rounded-[12px] md:rounded-[18px] font-black uppercase text-[8px] md:text-[10px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all italic h-full"> 
                           Logs
                        </TabsTrigger>
                        {selectedTournament.format === 'knockout' && (
                          <TabsTrigger value="bracket" className="flex-1 px-4 md:px-10 rounded-[12px] md:rounded-[18px] font-black uppercase text-[8px] md:text-[10px] tracking-widest data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all italic h-full"> 
                             Bracket
                          </TabsTrigger>
                        )}
                      </TabsList>
                    </div>

                    <TabsContent value="standings" className="mt-0 flex-1 outline-none animate-in fade-in slide-in-from-bottom-5 duration-500 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-card hover:bg-transparent border-b border-border">
                            <TableHead className="w-[100px] text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest px-4 md:pl-12 h-12 md:h-16">Rank</TableHead>
                            <TableHead className="text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest h-12 md:h-16">Unit</TableHead>
                            <TableHead className="text-center text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest h-12 md:h-16">DPL</TableHead>
                            <TableHead className="text-center text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest h-12 md:h-16">VIC</TableHead>
                            <TableHead className="hidden sm:table-cell text-center text-[8px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest h-12 md:h-16">DEF</TableHead>
                            <TableHead className="text-right text-[8px] md:text-[9px] font-black text-accent uppercase tracking-widest px-4 md:pr-12 h-12 md:h-16">Points</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {standings.map((stat, i) => {
                            const team = teams.find(tm => tm.id === stat.id);
                            return (
                              <TableRow key={stat.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-all group">
                                <TableCell className="px-4 md:pl-12 py-6 md:py-8">
                                   <div className={cn(
                                     "w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center font-black italic text-xs md:text-base",
                                     i === 0 ? "bg-amber-100 text-amber-600 shadow-lg shadow-amber-500/10" : 
                                     i === 1 ? "bg-muted text-muted-foreground" :
                                     "bg-muted/30 text-muted-foreground/60"
                                   )}>
                                      {i + 1}
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-3 md:gap-5">
                                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center overflow-hidden border-2 border-border shadow-xl">
                                         {team?.logoURL ? (
                                            <img src={team.logoURL} className="w-full h-full object-cover" />
                                         ) : (
                                            <Flag size={14} className="text-primary-foreground opacity-20" />
                                         )}
                                      </div>
                                      <div>
                                         <p className="text-sm md:text-base font-black text-foreground tracking-tight uppercase italic mb-0.5 md:mb-1 group-hover:translate-x-1 transition-transform truncate max-w-[100px] md:max-w-none">{team?.name || 'Inert'}</p>
                                         <Badge className="bg-muted/30 text-muted-foreground text-[6px] md:text-[8px] font-black border-none uppercase tracking-widest ring-0">TACTICAL</Badge>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell className="text-center font-black text-foreground italic text-xs md:text-base">{stat.played}</TableCell>
                                <TableCell className="text-center font-black text-foreground italic text-xs md:text-base">{stat.won}</TableCell>
                                <TableCell className="hidden sm:table-cell text-center font-black text-muted-foreground italic text-xs md:text-base">{stat.lost}</TableCell>
                                <TableCell className="text-right px-4 md:pr-12">
                                   <span className="text-xl md:text-3xl font-black text-accent tracking-tighter italic">{stat.points}</span>
                                   <span className="text-[8px] md:text-[10px] font-black text-muted-foreground/60 ml-1 md:ml-2 italic tracking-widest">PTS</span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {standings.length === 0 && (
                            <TableRow>
                               <TableCell colSpan={6} className="text-center py-40">
                                   <div className="flex flex-col items-center gap-6 opacity-40">
                                      <Search size={60} className="text-foreground/80" />
                                      <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] italic">No tactical units registered for mission</p>
                                   </div>
                               </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TabsContent>
                    
                    <TabsContent value="fixtures" className="mt-0 flex-1 outline-none animate-in fade-in slide-in-from-bottom-5 duration-500">
                      <div className="flex flex-col items-center justify-center py-40 gap-8 px-12">
                         <div className="relative">
                            <div className="w-32 h-32 rounded-[48px] bg-muted/30 flex items-center justify-center text-foreground/80">
                               <List size={60} />
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-[24px] bg-accent flex items-center justify-center text-primary-foreground shadow-2xl">
                               <ShieldCheck size={28} />
                            </div>
                         </div>
                         <div className="space-y-2 text-center max-w-[400px]">
                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">Event Log Generation Restricted</h3>
                            <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">Fixtures will be auto-generated by the command unit once the operation season is initialized.</p>
                         </div>
                         {isManagement && (
                           <Button className="bg-primary text-primary-foreground font-black h-16 px-12 rounded-[28px] uppercase tracking-[0.2em] text-[10px] italic shadow-2xl shadow-primary/20 hover:bg-primary active:scale-95 transition-all">
                              Initialize Generation Protocol
                           </Button>
                         )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="bracket" className="mt-0 flex-1 outline-none animate-in fade-in slide-in-from-bottom-5 duration-500">
                       <BracketVisualization 
                         tournament={selectedTournament} 
                         matches={matches} 
                         teams={teams} 
                       />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="min-h-[700px] bg-card rounded-[64px] border-none shadow-2xl shadow-black/40 flex flex-col items-center justify-center p-20 text-center gap-10">
               <div className="relative group">
                  <div className="w-48 h-48 rounded-[64px] bg-muted/30 flex items-center justify-center text-muted group-hover:scale-110 transition-transform duration-1000">
                     <Trophy size={100} />
                  </div>
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent rounded-[32px] flex items-center justify-center text-primary-foreground shadow-2xl animate-bounce">
                     <Target size={32} />
                  </div>
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic">Sector Selection Mandatory</h3>
                  <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[11px] italic max-w-[360px] mx-auto leading-relaxed">Select a sanctioned operation from the roster registry to access tactical data and operational matrix.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
}
