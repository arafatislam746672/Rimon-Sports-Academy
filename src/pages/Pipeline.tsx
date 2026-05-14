import * as React from 'react';
import { 
  Search, 
  Filter, 
  Workflow, 
  ChevronRight, 
  MoreVertical,
  Trophy,
  Activity,
  Award,
  CircleDot,
  GraduationCap,
  Star,
  Users,
  Settings,
  Menu,
  ChevronDown
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Player, PlayerStatus, Sport, Team, TopEleven } from '@/types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const STAGES: { id: PlayerStatus, label: string, icon: any, color: string }[] = [
  { id: 'prospect', label: 'Prospects', icon: CircleDot, color: 'bg-blue-500' },
  { id: 'trial', label: 'In Trial', icon: Activity, color: 'bg-yellow-500' },
  { id: 'training', label: 'Training', icon: Workflow, color: 'bg-purple-500' },
  { id: 'elite', label: 'Elite Squad', icon: Award, color: 'bg-amber-500' },
  { id: 'graduate', label: 'Graduates', icon: GraduationCap, color: 'bg-green-500' }
];

export default function Pipeline() {
  const { profile } = useAuth();
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [topEleven, setTopEleven] = React.useState<TopEleven | null>(null);
  const [selectedSport, setSelectedSport] = React.useState<Sport | 'all'>('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStage, setSelectedStage] = React.useState<PlayerStatus | 'all'>('all');
  const [isTopElevenOpen, setIsTopElevenOpen] = React.useState(false);

  const isManagement = profile?.role === 'management';
  const captainTeams = teams.filter(t => t.captainId === profile?.playerId);
  const isCaptain = captainTeams.length > 0;
  
  // Specific permission per sport for Top 11
  const canManageSport = (sport: Sport | 'all') => {
    if (isManagement) return true;
    if (sport === 'all') return isCaptain; // Captains can see all but maybe not edit?
    return captainTeams.some(t => t.sport === sport);
  };

  const canManage = isManagement || isCaptain;

  React.useEffect(() => {
    const unsubPlayers = dataService.getPlayers(setPlayers);
    const unsubTeams = dataService.getTeams(setTeams);
    return () => {
      unsubPlayers();
      unsubTeams();
    };
  }, []);

  React.useEffect(() => {
    if (selectedSport !== 'all') {
      return dataService.getTopEleven(selectedSport as Sport, setTopEleven);
    } else {
      setTopEleven(null);
    }
  }, [selectedSport]);

  const handleStatusChange = async (playerId: string, newStatus: PlayerStatus) => {
    if (!canManage) {
      toast.error("Restricted: Management or Captain clearance required.");
      return;
    }
    try {
      await dataService.updatePlayerStatus(playerId, newStatus);
      toast.success("Player status updated in the matrix.");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleTopEleven = async (playerId: string) => {
    if (!canManageSport(selectedSport)) {
      toast.error("Restricted: You can only manage Top 11 for your respective sport discipline.");
      return;
    }
    if (selectedSport === 'all') {
      toast.error("Please select a specific sport track to manage Top 11.");
      return;
    }

    const currentIds = topEleven?.playerIds || [];
    let newIds: string[];
    
    if (currentIds.includes(playerId)) {
      newIds = currentIds.filter(id => id !== playerId);
    } else {
      if (currentIds.length >= 11) {
        toast.error("Alpha Squadron is at maximum capacity (11). Decommission an asset first.");
        return;
      }
      newIds = [...currentIds, playerId];
    }

    try {
      await dataService.updateTopEleven(selectedSport as Sport, newIds);
      toast.success(newIds.includes(playerId) ? "Added to Alpha-11 List" : "Removed from Alpha-11 List");
    } catch (error) {
      toast.error("Failed to update Top 11");
    }
  };

  const [filteredPlayers, setFilteredPlayers] = React.useState<Player[]>([]);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    const filtered = players.filter(p => {
      const matchesSport = selectedSport === 'all' || (p.primarySport || 'cricket') === selectedSport;
      const matchesStage = selectedStage === 'all' || (p.status || 'prospect') === selectedStage;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSport && matchesStage && matchesSearch;
    });
    setFilteredPlayers(filtered);
  }, [players, selectedSport, selectedStage, searchTerm]);

  const activeStageConfig = STAGES.find(s => s.id === selectedStage);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header Tier */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500 rounded-2xl shadow-xl shadow-indigo-200">
              <Workflow className="text-white" size={24} />
            </div>
            <Badge className="bg-indigo-50 text-indigo-600 border-none px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest">
              Lifecycle System Active
            </Badge>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Strategic <span className="text-indigo-500 underline decoration-8 decoration-indigo-100 underline-offset-4">Pipeline</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] flex items-center gap-3 max-w-[500px]">
             Talent Lifecycle Assessment • Operational Flow • Asset Deployment
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
            <div className="flex bg-white p-1.5 rounded-[24px] border border-slate-100 shadow-sm">
               <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "rounded-2xl h-12 w-12 p-0",
                  viewMode === 'grid' ? "bg-slate-900 text-white" : "text-slate-400"
                )}
               >
                 <Trophy size={18} />
               </Button>
               <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                onClick={() => setViewMode('list')}
                className={cn(
                  "rounded-2xl h-12 w-12 p-0",
                  viewMode === 'list' ? "bg-slate-900 text-white" : "text-slate-400"
                )}
               >
                 <Menu size={18} />
               </Button>
            </div>

            {selectedSport !== 'all' && (
             <Button 
               variant="outline" 
               onClick={() => setIsTopElevenOpen(true)}
               className={cn(
                 "h-16 px-10 border-slate-200 rounded-[32px] font-black uppercase text-[10px] tracking-[0.2em] italic shadow-sm hover:bg-slate-50 transition-all flex gap-4",
                 canManageSport(selectedSport) ? "border-amber-200 text-amber-600 bg-amber-50/30" : ""
               )}
             >
               <Trophy size={18} className="text-amber-500" />
               Academy Top 11
               <Badge className="bg-amber-100 text-amber-600 border-none font-black ml-2 rounded-lg">
                  {topEleven?.playerIds.length || 0}/11
               </Badge>
             </Button>
           )}

           <div className="flex flex-col xl:flex-row gap-6 items-center bg-white/50 backdrop-blur-md p-2 rounded-[36px] border border-slate-100 shadow-sm">
             <div className="relative group min-w-[280px]">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <Input 
                  placeholder="Asset Query..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-16 h-14 border-none bg-transparent text-[11px] font-black uppercase tracking-tight shadow-none focus-visible:ring-0 italic"
                />
             </div>
             <div className="w-px h-8 bg-slate-200 hidden xl:block" />
             <div className="flex items-center gap-2">
               <Select value={selectedSport} onValueChange={(val) => setSelectedSport(val as Sport | 'all')}>
                  <SelectTrigger className="w-full sm:w-44 border-none rounded-full h-14 text-[10px] font-black uppercase tracking-widest bg-transparent shadow-none hover:bg-white/80 transition-all px-6 italic focus:ring-0">
                    <SelectValue placeholder="Tracks" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[32px] border-none p-3 shadow-2xl font-black">
                    <SelectItem value="all" className="font-black text-[10px] uppercase py-4 px-6 rounded-2xl italic text-slate-400">Global Track</SelectItem>
                    <SelectItem value="cricket" className="font-black text-[10px] uppercase py-4 px-6 rounded-2xl italic">Cricket</SelectItem>
                    <SelectItem value="football" className="font-black text-[10px] uppercase py-4 px-6 rounded-2xl italic">Football</SelectItem>
                    <SelectItem value="badminton" className="font-black text-[10px] uppercase py-4 px-6 rounded-2xl italic">Badminton</SelectItem>
                  </SelectContent>
               </Select>

               <div className="w-px h-8 bg-slate-200" />

               <Select value={selectedStage} onValueChange={(val) => setSelectedStage(val as PlayerStatus | 'all')}>
                  <SelectTrigger className="w-full sm:w-48 border-none rounded-full h-14 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 shadow-none hover:bg-indigo-100 transition-all px-6 italic focus:ring-0">
                    <div className="flex items-center gap-2">
                       <Filter size={14} />
                       <SelectValue placeholder="Lifecycle Stage" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-[32px] border-none p-3 shadow-2xl font-black">
                    <SelectItem value="all" className="font-black text-[10px] uppercase py-4 px-6 rounded-2xl italic text-slate-400">All Stages</SelectItem>
                    {STAGES.map(s => (
                      <SelectItem key={s.id} value={s.id} className="font-black text-[10px] uppercase py-4 px-6 rounded-2xl italic">
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
               </Select>
             </div>
           </div>
        </div>
      </div>

      <div className="space-y-10 pb-32">
        {selectedStage !== 'all' && (
          <div className="flex items-center gap-6 bg-slate-900 text-white p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                {activeStageConfig && <activeStageConfig.icon size={120} />}
             </div>
             <div className={cn(
               "w-20 h-20 rounded-[32px] flex items-center justify-center shadow-2xl",
               activeStageConfig?.color
             )}>
               {activeStageConfig && <activeStageConfig.icon size={32} />}
             </div>
             <div className="space-y-2">
               <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
                  {activeStageConfig?.label} <span className="text-indigo-400">Sector</span>
               </h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
                  Displaying {filteredPlayers.length} verified assets in this track
               </p>
             </div>
          </div>
        )}

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPlayers.map((player) => (
              <PlayerPipelineCard 
                key={player.id} 
                player={player} 
                canManage={canManage}
                topElevenIds={topEleven?.playerIds || []}
                handleStatusChange={handleStatusChange}
                handleToggleTopEleven={handleToggleTopEleven}
                canManageSport={canManageSport(selectedSport)}
              />
            ))}
          </div>
        ) : (
          <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Personnel</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Sport Discipline</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Lifecycle Status</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Induction</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player, i) => (
                      <motion.tr 
                        key={player.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                             <Avatar className="h-12 w-12 rounded-2xl border-4 border-white shadow-lg">
                               <AvatarImage src={player.photoURL} alt={player.name} className="object-cover" />
                               <AvatarFallback className="font-black text-slate-400">{player.name[0]}</AvatarFallback>
                             </Avatar>
                             <Link to={`/players/${player.id}`} className="flex flex-col hover:text-indigo-500 transition-colors">
                               <span className="text-[14px] font-black uppercase italic tracking-tight">{player.name}</span>
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID-7492{player.id.slice(-4)}</span>
                             </Link>
                           </div>
                        </td>
                        <td className="px-6 py-6 font-black text-[11px] uppercase text-slate-600 italic tracking-widest">
                           {player.primarySport || 'CRICKET'}
                        </td>
                        <td className="px-6 py-6">
                           <Badge variant="outline" className={cn(
                             "font-black text-[9px] uppercase px-3 py-1 rounded-lg border-2",
                             (STAGES.find(s => s.id === player.status) || STAGES[0]).color.replace('bg-', 'text-').replace('-500', '-600'),
                             (STAGES.find(s => s.id === player.status) || STAGES[0]).color.replace('bg-', 'bg-').replace('-500', '-50')
                           )}>
                             {player.status || 'prospect'}
                           </Badge>
                        </td>
                        <td className="px-6 py-6 font-black text-[11px] text-slate-400">
                           {new Date(player.joinedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-10 py-6 text-right">
                           {canManage && (
                              <DropdownAction 
                                player={player} 
                                onStatusChange={handleStatusChange} 
                                onToggleTop={handleToggleTopEleven}
                                isTop={topEleven?.playerIds.includes(player.id)}
                                canEditTop={canManageSport(selectedSport)}
                              />
                            )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredPlayers.length === 0 && (
          <div className="py-40 text-center space-y-6 bg-slate-50/50 rounded-[64px] border-4 border-dashed border-slate-100">
            <Workflow size={64} className="mx-auto text-slate-200" />
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-400 uppercase italic tracking-tighter">No Assets Detected</h3>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Adjust query parameters or lifecycle track</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isTopElevenOpen} onOpenChange={setIsTopElevenOpen}>
         <DialogContent className="sm:max-w-[700px] bg-white border-none rounded-[56px] p-0 overflow-hidden shadow-2xl">
            <div className="bg-amber-500 p-12 text-white relative">
               <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Trophy size={140} className="rotate-12" />
               </div>
               <DialogHeader>
                 <DialogTitle className="text-5xl font-black uppercase tracking-tighter italic leading-none">{selectedSport} Top 11</DialogTitle>
                 <DialogDescription className="text-amber-100 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Elite Alpha Squadron Management</DialogDescription>
               </DialogHeader>
            </div>
            
            <div className="p-12 space-y-10">
               <div className="grid grid-cols-1 gap-6 max-h-[400px] overflow-y-auto no-scrollbar pr-4">
                  {(topEleven?.playerIds || []).map(pid => {
                    const p = players.find(player => player.id === pid);
                    if (!p) return null;
                    return (
                      <div key={pid} className="flex items-center gap-6 p-5 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-white hover:border-amber-200 transition-all">
                        <Avatar className="h-14 w-14 rounded-2xl border-4 border-white shadow-lg">
                           <AvatarImage src={p.photoURL} className="object-cover" />
                           <AvatarFallback className="font-black text-slate-400">{p.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                           <p className="text-lg font-black text-slate-900 tracking-tight italic uppercase">{p.name}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{(p.status || 'prospect').toUpperCase()} SECTOR</p>
                        </div>
                        {canManageSport(selectedSport) && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleToggleTopEleven(pid)}
                            className="text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                          >
                            <Settings size={20} />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                  {(topEleven?.playerIds || []).length === 0 && (
                    <div className="py-20 text-center space-y-4">
                       <Trophy size={48} className="mx-auto text-slate-100" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No elite assets deployed to Top 11 list</p>
                    </div>
                  )}
               </div>
               <DialogFooter className="pt-6 border-t border-slate-100">
                  <Button onClick={() => setIsTopElevenOpen(false)} className="w-full bg-slate-900 text-white rounded-[24px] h-16 font-black uppercase text-[10px] tracking-widest italic hover:bg-indigo-600 transition-all shadow-2xl">
                    Acknowledge Intelligence
                  </Button>
               </DialogFooter>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}

interface PlayerPipelineCardProps {
  key?: React.Key;
  player: Player;
  canManage: boolean;
  topElevenIds: string[];
  handleStatusChange: (pid: string, s: PlayerStatus) => Promise<void>;
  handleToggleTopEleven: (pid: string) => Promise<void>;
  canManageSport: boolean;
}

function PlayerPipelineCard({ 
  player, 
  canManage, 
  topElevenIds, 
  handleStatusChange,
  handleToggleTopEleven,
  canManageSport
}: PlayerPipelineCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[40px] overflow-hidden bg-white hover:ring-4 hover:ring-indigo-500/10 transition-all relative">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                 <Avatar className={cn(
                   "w-16 h-16 rounded-[24px] border-[6px] border-slate-50 shadow-xl transition-all duration-700 group-hover:scale-110",
                   topElevenIds.includes(player.id) && "ring-4 ring-amber-400 ring-offset-2"
                 )}>
                   <AvatarImage src={player.photoURL} alt={player.name} className="object-cover" />
                   <AvatarFallback className="bg-indigo-50 text-indigo-500 text-sm font-black">
                     {player.name.split(' ').map(n => n[0]).join('')}
                   </AvatarFallback>
                 </Avatar>
                 {topElevenIds.includes(player.id) && (
                   <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-lg border-2 border-white shadow-xl">
                      <Star size={10} fill="currentColor" />
                   </div>
                 )}
              </div>
              <div>
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                      {(player.primarySport || 'cricket').toUpperCase()} CORE
                   </p>
                 </div>
                <h4 className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-500 transition-colors uppercase tracking-tight italic">
                  {player.name}
                </h4>
              </div>
            </div>
            
            {canManage && (
              <DropdownAction 
                player={player} 
                onStatusChange={handleStatusChange} 
                onToggleTop={handleToggleTopEleven}
                isTop={topElevenIds.includes(player.id)}
                canEditTop={canManageSport}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 group-hover:bg-white transition-all">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                  Confidence <Activity size={8} />
                </p>
                <div className="flex items-end gap-1">
                   <span className="text-xl font-black text-slate-900 italic leading-none">A+</span>
                   <span className="text-[8px] font-black text-emerald-500 uppercase italic">PEAK</span>
                </div>
             </div>
             <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 group-hover:bg-white transition-all">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Maturity</p>
                <span className="text-xl font-black text-slate-900 italic leading-none">
                   {new Date().getFullYear() - new Date(player.joinedDate).getFullYear()}y
                </span>
             </div>
          </div>

          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Induction Protocol</span>
               <span className="text-[10px] font-black text-slate-500 uppercase italic">
                  {new Date(player.joinedDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
               </span>
            </div>
            <Link to={`/players/${player.id}`}>
              <Button className="bg-slate-900 text-white rounded-[18px] h-11 px-6 text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200">
                 Full Intel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DropdownAction({ 
  player, 
  onStatusChange, 
  onToggleTop, 
  isTop, 
  canEditTop 
}: { 
  player: Player, 
  onStatusChange: (pid: string, s: PlayerStatus) => void,
  onToggleTop: (pid: string) => void,
  isTop?: boolean,
  canEditTop: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button 
          variant="ghost" 
          size="icon" 
          className="w-12 h-12 p-0 border-none bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center transition-all shadow-sm focus:ring-0"
        />}>
          <MoreVertical size={22} className="text-slate-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-[32px] p-3 border-none shadow-2xl font-black min-w-[220px] bg-white">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-4 py-2 text-[8px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50 mb-2">
            Stage Deployment
          </DropdownMenuLabel>
          {STAGES.map(s => (
            <DropdownMenuItem 
              key={s.id} 
              onSelect={() => onStatusChange(player.id, s.id)}
              className={cn(
                "font-black text-[10px] uppercase py-3.5 px-5 rounded-xl italic cursor-pointer",
                player.status === s.id ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              Move to {s.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        {canEditTop && (
          <>
            <DropdownMenuSeparator className="bg-slate-50 my-2" />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-4 py-2 text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">
                Alpha Designation
              </DropdownMenuLabel>
              <DropdownMenuItem 
                onSelect={() => onToggleTop(player.id)}
                className={cn(
                  "w-full flex items-center gap-3 font-black text-[10px] uppercase py-3.5 px-5 rounded-xl italic cursor-pointer",
                  isTop ? "text-amber-600 hover:bg-amber-50" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Star size={14} fill={isTop ? "currentColor" : "none"} />
                {isTop ? "De-list Top 11" : "Assign to Top 11"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
