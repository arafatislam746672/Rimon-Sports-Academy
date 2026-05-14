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
import { Tournament, Sport, Team } from '@/types';
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
import { motion, AnimatePresence } from 'motion/react';

export default function Tournaments() {
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'split' | 'table'>('split');
  const [sortField, setSortField] = React.useState<keyof Tournament>('name');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = React.useState('');

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
    return () => {
      unsubTournaments();
      unsubTeams();
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
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3 leading-none">
            Combat <span className="text-indigo-500">Theaters</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2 italic">
             Sanctioned Operations • Competitive Matrix Control
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('split')}
              className={cn(
                "rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'split' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid size={14} className="mr-2" /> Split
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode('table')}
              className={cn(
                "rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'table' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List size={14} className="mr-2" /> Table
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 text-white font-black h-16 px-10 rounded-[28px] uppercase text-[10px] tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-95 italic">
              <Plus size={18} className="mr-3" />
              Sanction New Operations
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-white border-none rounded-[48px] p-0 overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-12 text-white relative">
               <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Flag size={140} className="rotate-12" />
               </div>
               <div className="relative z-10 space-y-4">
                  <Badge className="bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full border-none shadow-lg shadow-indigo-500/20">
                     Tactical Command
                  </Badge>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Operational Config</h2>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed max-w-[300px]">
                     Deploy new tournament instance and participating units.
                  </p>
               </div>
            </div>
            <form onSubmit={handleSaveTournament} className="p-12 space-y-10 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="space-y-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mission Identifier</Label>
                  <Input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. ACADEMY WINTER LEAGUE 2026"
                    className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-black text-sm uppercase italic px-6 shadow-inner focus:border-indigo-500 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Operational Track</Label>
                    <Select value={newSport} onValueChange={(val) => {
                      setNewSport(val as Sport);
                      setSelectedTeamIds([]);
                    }}>
                      <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-black text-[10px] uppercase tracking-widest px-6 shadow-inner focus:border-indigo-500 transition-all">
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
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Session Matrix</Label>
                    <Select value={newFormat} onValueChange={(val) => setNewFormat(val as any)}>
                      <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-black text-[10px] uppercase tracking-widest px-6 shadow-inner focus:border-indigo-500 transition-all">
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
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Initialization Date</Label>
                  <Input 
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-black text-xs px-6 shadow-inner focus:border-indigo-500 transition-all"
                  />
                </div>

                {newSport && (
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex justify-between">
                       <span>Deployed Units ({teams.filter(t => t.sport === newSport).length})</span>
                       <span className={cn(selectedTeamIds.length < 2 ? "text-amber-500" : "text-emerald-500")}>{selectedTeamIds.length} Selection Active</span>
                    </Label>
                    <div className="max-h-[200px] overflow-y-auto no-scrollbar border border-slate-100 rounded-[32px] p-4 bg-slate-50/50 space-y-2">
                      {teams.filter(t => t.sport === newSport).map(t => (
                        <div key={t.id} 
                           className={cn(
                             "flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group",
                             selectedTeamIds.includes(t.id) ? "bg-white shadow-xl border border-indigo-100" : "hover:bg-white/50"
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
                             selectedTeamIds.includes(t.id) ? "bg-indigo-500 border-indigo-500" : "border-slate-200"
                          )}>
                             <ShieldCheck size={14} className={cn("text-white transition-opacity", selectedTeamIds.includes(t.id) ? "opacity-100" : "opacity-0")} />
                          </div>
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight italic">{t.name}</span>
                          <span className="ml-auto text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">{t.playerIds.length} PERSONNEL</span>
                        </div>
                      ))}
                      {teams.filter(t => t.sport === newSport).length === 0 && (
                        <div className="text-center py-10">
                            <Info size={32} className="mx-auto text-slate-200 mb-2" />
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No operational units detected for this track</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="sticky bottom-0 -mx-12 px-12 bg-white/80 backdrop-blur-md pb-12 pt-6 border-t border-slate-50">
                 <div className="grid grid-cols-2 gap-4 w-full">
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Abort Mission</Button>
                    <Button type="submit" disabled={isSaving} className="bg-slate-900 text-white font-black rounded-2xl h-14 uppercase text-[10px] tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-95 italic">
                      {isSaving ? 'Sanctioning...' : 'Sanction Operation'}
                    </Button>
                 </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    {viewMode === 'table' ? (
        <Card className="elite-card border-none shadow-2xl rounded-[48px] overflow-hidden bg-white">
          <div className="p-10 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Operational <span className="text-indigo-400">Registry</span></h3>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Verified Campaign Database</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Database..."
                className="h-14 bg-white/5 border-white/5 rounded-2xl pl-12 font-black text-xs uppercase italic text-white placeholder:text-white/10 focus:bg-white/10 transition-all"
              />
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-slate-50">
                  <TableHead onClick={() => toggleSort('name')} className="cursor-pointer group h-20 pl-10">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Operation Name</span>
                      {sortField === 'name' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => toggleSort('sport')} className="cursor-pointer group h-20">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Sector</span>
                      {sortField === 'sport' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => toggleSort('startDate')} className="cursor-pointer group h-20">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Initiation Date</span>
                      {sortField === 'startDate' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => toggleSort('participants')} className="cursor-pointer group h-20 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Assets Deployed</span>
                      {sortField === 'participants' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => toggleSort('status')} className="cursor-pointer group h-20">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Current Status</span>
                      {sortField === 'status' ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-40" />}
                    </div>
                  </TableHead>
                  <TableHead className="h-20 text-right pr-10">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Action</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTournaments.map((t) => (
                  <TableRow key={t.id} className="group hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0">
                    <TableCell className="py-8 pl-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-transform">
                          <Trophy size={18} />
                        </div>
                        <span className="text-sm font-black uppercase italic tracking-tight text-slate-900">{t.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-indigo-50 text-indigo-600 border-none text-[8px] font-black uppercase px-3 py-1 rounded-full">
                        {t.sport} division
                      </Badge>
                    </TableCell>
                    <TableCell className="font-black text-[10px] text-slate-400 uppercase tracking-widest">
                      {new Date(t.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-center">
                       <span className="text-lg font-black italic text-slate-900 tracking-tighter">{t.participants.length}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          t.status === 'ongoing' ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : 
                          t.status === 'upcoming' ? "bg-indigo-500 shadow-lg shadow-indigo-500/50" : "bg-slate-300"
                        )} />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-10">
                      <Button 
                        onClick={() => {
                          setSelectedTournament(t);
                          setViewMode('split');
                        }}
                        className="bg-slate-900 text-white rounded-xl h-10 px-6 text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
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
             <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3 italic">
               <Trophy size={18} className="text-amber-500" />
               Roster Registry
             </h3>
             <Badge className="bg-slate-50 text-slate-400 border-none text-[8px] font-black tracking-widest">{tournaments.length} ACTIVE</Badge>
          </div>
          
          <div className="space-y-6">
            {tournaments.map((t) => (
              <motion.div 
                whileHover={{ x: 5 }}
                key={t.id} 
                onClick={() => setSelectedTournament(t)}
                className={cn(
                  "p-6 rounded-[36px] border-none shadow-2xl transition-all cursor-pointer group relative overflow-hidden",
                  selectedTournament?.id === t.id ? "bg-slate-900 text-white shadow-slate-900/40" : "bg-white text-slate-900 shadow-slate-200/50 hover:bg-slate-50"
                )}>
                {selectedTournament?.id === t.id && (
                   <div className="absolute top-0 right-0 p-4 opacity-5 bg-indigo-500 rounded-bl-[40px]">
                      <Sparkles size={40} />
                   </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <Badge variant="outline" className={cn(
                     "text-[8px] uppercase font-black tracking-widest px-3 py-1 rounded-full border-none",
                     selectedTournament?.id === t.id ? "bg-white/10 text-indigo-400" : "bg-indigo-50 text-indigo-500"
                  )}>
                    {t.sport}
                  </Badge>
                  <div className={cn(
                     "w-2 h-2 rounded-full",
                     t.status === 'ongoing' ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : 
                     t.status === 'upcoming' ? "bg-indigo-500 shadow-lg shadow-indigo-500/50" : "bg-slate-300"
                  )} />
                </div>
                
                <h4 className="font-black text-lg tracking-tighter uppercase italic leading-tight group-hover:translate-x-1 transition-transform">{t.name}</h4>
                
                <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/5 opacity-60">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-indigo-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{t.participants.length} UNts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Medal size={14} className="text-indigo-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{t.format}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {tournaments.length === 0 && (
              <div className="py-20 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-50 flex flex-col items-center gap-4">
                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                    <Info size={32} />
                 </div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">No missions sanctioned</p>
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
              <Card className="rounded-[64px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white min-h-[700px] flex flex-col">
                <CardHeader className="bg-slate-900 p-12 text-white border-b border-white/10 relative">
                   <div className="absolute top-0 right-0 p-12 opacity-5">
                      <Trophy size={160} />
                   </div>
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-12">
                      <div className="space-y-4">
                         <div className="flex items-center gap-4">
                            <Badge className="bg-indigo-500 text-white border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-indigo-500/20">
                               {(selectedTournament.sport || 'cricket').toUpperCase()} SECTOR
                            </Badge>
                            <Badge variant="outline" className="bg-white/5 text-white/40 border-white/10 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                               {(selectedTournament.format || 'league').toUpperCase()} MATRIX
                            </Badge>
                         </div>
                         <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{selectedTournament.name}</h2>
                         <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] flex items-center gap-3">
                            <Calendar size={14} className="text-indigo-400" /> Operational Since {new Date(selectedTournament.startDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                         </p>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="text-center bg-white/5 border border-white/5 rounded-3xl p-6 min-w-[120px]">
                           <p className="text-3xl font-black italic whitespace-nowrap leading-none mb-2">{selectedTournament.participants.length}</p>
                           <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Active Units</p>
                        </div>
                        <div className="text-center bg-white/5 border border-white/5 rounded-3xl p-6 min-w-[120px]">
                           <p className="text-3xl font-black italic whitespace-nowrap leading-none mb-2">{selectedTournament.matchIds.length}</p>
                           <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Logged Events</p>
                        </div>
                      </div>
                   </div>
                </CardHeader>
                
                <CardContent className="p-0 flex-1 flex flex-col">
                  <Tabs defaultValue="standings" className="w-full flex-1 flex flex-col">
                    <div className="px-12 pt-10 pb-6 bg-slate-50/50 border-b border-slate-50">
                      <TabsList className="bg-slate-200/50 h-16 rounded-[24px] p-1.5 w-fit flex gap-2">
                        <TabsTrigger value="standings" className="px-10 rounded-[18px] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg transition-all italic h-full"> 
                           Operational Matrix
                        </TabsTrigger>
                        <TabsTrigger value="fixtures" className="px-10 rounded-[18px] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg transition-all italic h-full"> 
                           Mission Logs
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="standings" className="mt-0 flex-1 outline-none animate-in fade-in slide-in-from-bottom-5 duration-500">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-white hover:bg-transparent border-b border-slate-50">
                            <TableHead className="w-[100px] text-[9px] font-black text-slate-400 uppercase tracking-widest pl-12 h-16">Quantum Rank</TableHead>
                            <TableHead className="text-[9px] font-black text-slate-400 uppercase tracking-widest h-16">Tactical Unit</TableHead>
                            <TableHead className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest h-16">Deployments</TableHead>
                            <TableHead className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest h-16">Victories</TableHead>
                            <TableHead className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest h-16">Defeats</TableHead>
                            <TableHead className="text-right text-[9px] font-black text-indigo-500 uppercase tracking-widest pr-12 h-16">Points Accumulation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedTournament.participants.map((teamId, i) => {
                            const team = teams.find(tm => tm.id === teamId);
                            return (
                              <TableRow key={teamId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-all group">
                                <TableCell className="pl-12 py-8">
                                   <div className={cn(
                                     "w-10 h-10 rounded-2xl flex items-center justify-center font-black italic",
                                     i === 0 ? "bg-amber-100 text-amber-600 shadow-lg shadow-amber-500/10" : 
                                     i === 1 ? "bg-slate-100 text-slate-500" :
                                     "bg-slate-50 text-slate-300"
                                   )}>
                                      {i + 1}
                                   </div>
                                </TableCell>
                                <TableCell>
                                   <div className="flex items-center gap-5">
                                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-white shadow-xl">
                                         {team?.logoURL ? (
                                            <img src={team.logoURL} className="w-full h-full object-cover" />
                                         ) : (
                                            <Flag size={20} className="text-white opacity-20" />
                                         )}
                                      </div>
                                      <div>
                                         <p className="text-base font-black text-slate-900 tracking-tight uppercase italic mb-1 group-hover:translate-x-1 transition-transform">{team?.name || 'Inert Sector'}</p>
                                         <Badge className="bg-slate-50 text-slate-400 text-[8px] font-black border-none uppercase tracking-widest">TACTICAL SQUAD</Badge>
                                      </div>
                                   </div>
                                </TableCell>
                                <TableCell className="text-center font-black text-slate-900 italic">0</TableCell>
                                <TableCell className="text-center font-black text-slate-900 italic">0</TableCell>
                                <TableCell className="text-center font-black text-slate-400 italic">0</TableCell>
                                <TableCell className="text-right pr-12">
                                   <span className="text-3xl font-black text-indigo-600 tracking-tighter italic">0</span>
                                   <span className="text-[10px] font-black text-slate-300 ml-2 italic tracking-widest">PTS</span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {selectedTournament.participants.length === 0 && (
                            <TableRow>
                               <TableCell colSpan={6} className="text-center py-40">
                                   <div className="flex flex-col items-center gap-6 opacity-40">
                                      <Search size={60} className="text-slate-200" />
                                      <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] italic">No tactical units registered for mission</p>
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
                            <div className="w-32 h-32 rounded-[48px] bg-slate-50 flex items-center justify-center text-slate-200">
                               <List size={60} />
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-[24px] bg-indigo-500 flex items-center justify-center text-white shadow-2xl">
                               <ShieldCheck size={28} />
                            </div>
                         </div>
                         <div className="space-y-2 text-center max-w-[400px]">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Event Log Generation Restricted</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Fixtures will be auto-generated by the command unit once the operation season is initialized.</p>
                         </div>
                         <Button className="bg-slate-900 text-white font-black h-16 px-12 rounded-[28px] uppercase tracking-[0.2em] text-[10px] italic shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 active:scale-95 transition-all">
                            Initialize Generation Protocol
                         </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="min-h-[700px] bg-white rounded-[64px] border-none shadow-2xl shadow-slate-200/50 flex flex-col items-center justify-center p-20 text-center gap-10">
               <div className="relative group">
                  <div className="w-48 h-48 rounded-[64px] bg-slate-50 flex items-center justify-center text-slate-100 group-hover:scale-110 transition-transform duration-1000">
                     <Trophy size={100} />
                  </div>
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-500 rounded-[32px] flex items-center justify-center text-white shadow-2xl animate-bounce">
                     <Target size={32} />
                  </div>
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Sector Selection Mandatory</h3>
                  <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[11px] italic max-w-[360px] mx-auto leading-relaxed">Select a sanctioned operation from the roster registry to access tactical data and operational matrix.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
}
