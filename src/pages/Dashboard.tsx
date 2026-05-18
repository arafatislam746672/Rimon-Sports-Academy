import * as React from 'react';
import { 
  Users, 
  Flag,
  Trophy, 
  Target, 
  TrendingUp,
  Activity,
  Calendar as CalendarIcon,
  Plus,
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  ClipboardCheck,
  Award,
  Clock,
  ExternalLink,
  Star,
  QrCode,
  MessageSquare,
  Search
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { dataService } from '@/services/dataService';
import { Player, Match, MatchSubmission, Sport, PlayerStatus, Team } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import PerformanceSubmitModal from '@/components/PerformanceSubmitModal';
import LeagueSwitcher from '@/components/LeagueSwitcher';

function ManagementDashboard({ players, matches, teams }: { players: Player[], matches: Match[], teams: Team[] }) {
  const [selectedSport, setSelectedSport] = React.useState<Sport | 'all'>('all');

  const handleBulkImport = async () => {
    toast.loading("Initializing secure talent feed...");
    // ... existing bulk import logic ...
  };

  return (
    <div id="dashboard-root" className="space-y-12 pb-20">
      <header id="dashboard-header" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <h1 id="dashboard-title" className="text-6xl font-black text-foreground tracking-tighter uppercase italic leading-none">
            DASHBOARD <span className="text-primary italic">HOME</span>
          </h1>
          <div className="flex items-center gap-3">
             <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent" />
             <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] opacity-80 italic">Academy Status Ready</p>
          </div>
        </div>
        
        <div id="dashboard-controls" className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          <LeagueSwitcher currentSport={selectedSport} onSportChange={setSelectedSport} />
          
          <div className="flex gap-4 w-full sm:w-auto">
            <Link to="/players" className="flex-1">
              <Button id="btn-register-talent" className="w-full bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] font-black uppercase text-[10px] tracking-widest h-16 px-10 rounded-[28px] transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Plus size={18} className="mr-3" /> Register Talent
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div id="stats-overview-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: 'stat-athletes', label: 'All Players', value: players.length, icon: Users, color: 'text-emerald-400', glow: 'hsl(158 94% 50% / 0.15)', trend: 'Active Talents', link: '/players' },
          { id: 'stat-units', label: 'All Teams', value: teams.length, icon: Flag, color: 'text-violet-400', glow: 'hsl(263 94% 65% / 0.15)', trend: 'Ready to Play', link: '/teams' },
          { id: 'stat-live-ops', label: 'Live Matches', value: matches.filter(m => m.status === 'live').length, icon: Activity, color: 'text-rose-400', glow: 'hsl(346 84% 61% / 0.15)', trend: 'Currently Playing', link: '/schedule' },
          { id: 'stat-events', label: 'Tournaments', value: 3, icon: Trophy, color: 'text-amber-400', glow: 'hsl(45 93% 47% / 0.15)', trend: 'Academy Events', link: '/tournaments' },
        ].map((stat, i) => (
          <motion.div
            key={`mgmt-stat-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={stat.link}>
              <div 
                id={stat.id}
                className="bento-card group p-8"
                style={{ '--glow-color': stat.glow } as React.CSSProperties}
              >
                <div id={`${stat.id}-header`} className="flex items-center justify-between mb-8 text-white">
                    <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/10 transition-transform group-hover:rotate-12 group-hover:scale-110")}>
                      <stat.icon size={26} className={stat.color} />
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black uppercase tracking-widest text-white block mb-1">Status</span>
                       <span className={cn("text-[10px] font-black uppercase tracking-widest", stat.color)}>{stat.trend}</span>
                    </div>
                </div>
                <div id={`${stat.id}-content`}>
                    <p id={`${stat.id}-label`} className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 italic">{stat.label}</p>
                    <p id={`${stat.id}-value`} className="text-5xl font-black text-foreground tracking-tighter italic leading-none">{stat.value}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div id="live-telemetry-feed" className="lg:col-span-2 bento-card p-10 bg-card/40 backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000 grayscale">
            <Activity size={400} />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary italic">Live Match Stats</h3>
              <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Current Game Data</p>
            </div>
            <div className="flex items-center gap-4 bg-emerald-500/5 px-6 py-3 rounded-full border border-emerald-500/20">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Live Connection Active</span>
            </div>
          </div>

          <div id="telemetry-display" className="space-y-16 relative z-10 py-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
               <div className="text-center group cursor-pointer">
                  <div className="w-32 h-32 rounded-[40px] bg-emerald-500/10 border-4 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-5xl italic shadow-2xl group-hover:scale-110 transition-all duration-500">W</div>
                  <p className="mt-6 text-sm font-black text-foreground uppercase tracking-[0.2em] bg-white/5 py-2 px-4 rounded-xl border border-white/5">Warriors</p>
               </div>
               
               <div className="text-center space-y-4">
                  <p className="text-8xl font-black text-white tracking-tighter italic drop-shadow-2xl">2<span className="text-primary mx-3">-</span>1</p>
                  <div className="inline-flex items-center gap-3 bg-red-600/10 text-red-500 px-6 py-2 rounded-full border border-red-600/20 animate-pulse">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">Live Feed: 65:42</span>
                  </div>
               </div>

               <div className="text-center group cursor-pointer">
                  <div className="w-32 h-32 rounded-[40px] bg-violet-600/10 border-4 border-violet-600/40 flex items-center justify-center text-violet-400 font-black text-5xl italic shadow-2xl group-hover:scale-110 transition-all duration-500">T</div>
                  <p className="mt-6 text-sm font-black text-foreground uppercase tracking-[0.2em] bg-white/5 py-2 px-4 rounded-xl border border-white/5">Titans</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
               <Button id="btn-intercept-control" className="bg-primary text-primary-foreground font-black uppercase text-[11px] tracking-widest h-16 rounded-[28px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Go to Matches</Button>
               <Button id="btn-analysis-hub" variant="outline" className="border-white/10 bg-white/5 text-muted-foreground font-black uppercase text-[11px] tracking-widest h-16 rounded-[28px] hover:bg-white/10 transition-all">View Statistics</Button>
            </div>
          </div>
        </div>

        <div id="talent-index-manifest" className="bento-card-accent p-0 overflow-hidden flex flex-col">
          <div className="p-10 border-b border-white/5 bg-white/5">
             <h3 className="text-xs font-black uppercase tracking-[0.4em] text-accent italic mb-2">Top Performers</h3>
             <p className="text-xl font-black text-white uppercase italic tracking-tighter">Elite Player Rankings</p>
          </div>
          <div id="talent-list" className="flex-1 divide-y divide-white/5 bg-black/20">
             {players.slice(0, 5).map((p, i) => (
                <div key={p.id} id={`talent-row-${i}`} className="px-10 py-6 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer group">
                   <div className="flex items-center gap-6">
                      <span className="text-sm font-black text-white/20 italic w-4">{i + 1}</span>
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-accent font-black text-xl italic border border-white/10 group-hover:border-accent/40 group-hover:shadow-[0_0_20px_hsl(var(--accent)/0.2)] transition-all">
                         {p.photoURL ? <img src={p.photoURL} alt={p.name} className="w-full h-full object-cover rounded-2xl" /> : p.name[0]}
                      </div>
                      <div>
                         <p className="text-sm font-black text-foreground group-hover:text-accent transition-colors uppercase italic tracking-tight">{p.name}</p>
                         <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1 italic">{p.primarySport}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xl font-black text-white italic tracking-tighter leading-none">
                         {p.stats.cricket.matches > 0 ? p.stats.cricket.runs : p.stats.football.goals}
                      </p>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1 italic">{p.stats.cricket.matches > 0 ? 'Score' : 'Goals'}</p>
                   </div>
                </div>
             ))}
          </div>
          <div className="p-8 bg-white/5 border-t border-white/10">
             <Button id="btn-browse-manifest" variant="link" className="w-full text-[10px] font-black uppercase text-accent tracking-[0.3em] h-auto p-0 hover:text-accent group">
                View All Players <ArrowRight size={14} className="ml-3 group-hover:translate-x-2 transition-transform" />
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="elite-card border-none shadow-2xl shadow-black/50 p-10 bg-card">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
              <TrendingUp size={16} className="text-accent" /> Deployment Frequency (H1 2026)
            </h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'JAN', matches: 12 },
                  { name: 'FEB', matches: 19 },
                  { name: 'MAR', matches: 15 },
                  { name: 'APR', matches: 22 },
                  { name: 'MAY', matches: 30 },
                  { name: 'JUN', matches: 25 },
                ]}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                      <stop offset="100%" stopColor="#0F172A" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" fontSize={9} fontWeight="black" tick={{fill: 'var(--muted-foreground)'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis fontSize={9} fontWeight="black" tick={{fill: 'var(--muted-foreground)'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ borderRadius: '20px', border: 'none', shadow: '0 20px 25px -5px rgba(0,0,0,0.5)', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', background: 'var(--card)', color: 'white' }}
                  />
                  <Bar dataKey="matches" fill="url(#barGradient)" radius={[8, 8, 4, 4]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </Card>

          <Card className="elite-card border-none shadow-2xl shadow-black/50 overflow-hidden">
            <CardHeader className="border-b border-border px-10 py-8 bg-muted/50">
               <CardTitle className="text-[10px] font-black text-foreground uppercase tracking-[0.2em]">Latest Updates</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
               {[
                 { title: "Summer Cup Coming Soon", desc: "Players are invited to join the upcoming regional series.", date: "14 May" },
                 { title: "New Training Schedule", desc: "Training at Facility B has been updated for monsoon season.", date: "12 May" },
                 { title: "New Sports Equipment", desc: "New tracking tools are now available on pitch A.", date: "10 May" }
               ].map((event, i) => (
                  <div key={`mgmt-brief-${i}`} className="flex gap-6 p-6 rounded-3xl bg-muted/30 border border-border hover:border-accent/20 transition-all cursor-pointer group">
                     <div className="shrink-0 flex flex-col items-center">
                        <span className="text-base font-black text-foreground italic tracking-tighter leading-none">{event.date.split(' ')[0]}</span>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{event.date.split(' ')[1]}</span>
                     </div>
                     <div className="w-px bg-border h-10 self-center" />
                     <div>
                        <p className="text-[11px] font-black text-foreground uppercase tracking-tight group-hover:text-accent transition-colors">{event.title}</p>
                        <p className="text-xs text-muted-foreground font-bold mt-1 leading-relaxed italic opacity-80">{event.desc}</p>
                     </div>
                  </div>
               ))}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

function PlayerDashboard({ player, matches, allPlayers }: { player: Player, matches: Match[], allPlayers: Player[] }) {
  const navigate = useNavigate();
  const [comparePlayerId, setComparePlayerId] = React.useState<string>('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);
  
  const comparePlayer = React.useMemo(() => 
    allPlayers.find(p => p.id === comparePlayerId), 
    [allPlayers, comparePlayerId]
  );

  const personalStats = React.useMemo(() => {
    const stats: { label: string, value: any, icon: any, color: string, glow: string, academyAvg?: string }[] = [];
    
    const calculateAvg = (sport: Sport, field: string) => {
      const activePlayers = allPlayers.filter(p => p.stats[sport].matches > 0);
      if (activePlayers.length === 0) return '0';
      const sum = activePlayers.reduce((acc, p) => acc + ((p.stats[sport] as any)[field] || 0), 0);
      return (sum / activePlayers.length).toFixed(1);
    };

    if (player.stats.cricket.matches > 0 || player.primarySport === 'cricket' || player.primarySport === 'both') {
      stats.push({ 
        label: 'Runs Scored', 
        value: player.stats.cricket.runs, 
        icon: Trophy, 
        color: 'text-emerald-400', 
        glow: 'hsl(158 94% 50% / 0.15)',
        academyAvg: calculateAvg('cricket', 'runs')
      });
      stats.push({ 
        label: 'Strike Rate', 
        value: player.stats.cricket.strikeRate.toFixed(1), 
        icon: Activity, 
        color: 'text-violet-400', 
        glow: 'hsl(263 94% 65% / 0.15)',
        academyAvg: calculateAvg('cricket', 'strikeRate')
      });
    }
    if (player.stats.football.matches > 0 || player.primarySport === 'football' || player.primarySport === 'both') {
      stats.push({ 
        label: 'Goals Scored', 
        value: player.stats.football.goals, 
        icon: Target, 
        color: 'text-rose-400', 
        glow: 'hsl(346 84% 61% / 0.15)',
        academyAvg: calculateAvg('football', 'goals')
      });
      stats.push({ 
        label: 'Tactical Assists', 
        value: player.stats.football.assists, 
        icon: TrendingUp, 
        color: 'text-amber-400', 
        glow: 'hsl(45 93% 47% / 0.15)',
        academyAvg: calculateAvg('football', 'assists')
      });
    }
    if (player.stats.badminton.matches > 0 || player.primarySport === 'badminton' || player.primarySport === 'both') {
      stats.push({ 
        label: 'Badminton Wins', 
        value: player.stats.badminton.wins, 
        icon: Trophy, 
        color: 'text-emerald-400', 
        glow: 'hsl(158 94% 50% / 0.15)',
        academyAvg: calculateAvg('badminton', 'wins')
      });
    }
    return stats;
  }, [player, allPlayers]);

  const [attendance, setAttendance] = React.useState<any[]>([]);
  React.useEffect(() => {
    return dataService.getPlayerAttendance(player.id, setAttendance);
  }, [player.id]);

  return (
    <div id="player-portal-root" className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <header id="player-portal-header" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <h1 id="player-portal-title" className="text-5xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-none">
               PLAYER <span className="text-primary">PORTAL</span>
             </h1>
             <Badge id="badge-asset-id" className="bg-white/5 text-primary border-white/10 font-black uppercase tracking-widest text-[9px] px-4 py-1 hidden sm:inline-flex rounded-full">
               PLAYER-ID: {player.academyId || player.id.slice(-6).toUpperCase()}
             </Badge>
          </div>
          <p className="text-muted-foreground text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-80 italic">Your Performance Data</p>
        </div>
        <div id="player-portal-controls" className="flex flex-wrap gap-4 w-full md:w-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button id="btn-tactical-pass" className="flex-1 md:flex-none bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase text-[10px] tracking-widest h-16 px-8 rounded-full transition-all italic">
                <QrCode size={18} className="mr-3 text-primary" /> Entry Pass
              </Button>
            </DialogTrigger>
            <DialogContent id="modal-tactical-pass" className="sm:max-w-md bg-[#050608] rounded-[64px] p-12 border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
              <div className="flex flex-col items-center gap-10">
                <div className="space-y-2 text-center">
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Identity verification</h2>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Your Digital Membership ID</p>
                </div>
                <div id="qr-code-container" className="p-10 bg-white rounded-[48px] shadow-[0_30px_60px_-12px_hsl(var(--primary)/20%)] relative">
                   <div className="absolute inset-0 bg-primary/5 rounded-[48px] animate-pulse" />
                   <QRCodeSVG 
                     value={`${window.location.origin}/players/${player.id}`} 
                     size={220}
                     level="H"
                     includeMargin={false}
                   />
                </div>
                <div className="text-center space-y-3">
                   <p id="player-name-pass" className="text-3xl font-black italic uppercase tracking-tight leading-none text-white">{player.name}</p>
                   <div className="flex items-center justify-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Classified Academy Data</p>
                   </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            id="btn-transmit-performance"
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex-1 md:flex-none bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] font-black uppercase text-[10px] tracking-widest h-16 px-10 rounded-full transition-all active:scale-95 italic relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Trophy size={18} className="mr-3" /> Submit Score
          </Button>

          <Button 
            id="btn-intelligence-profile"
            onClick={() => navigate(`/players/${player.id}`)}
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase text-[10px] tracking-widest h-16 px-10 rounded-full transition-all italic"
          >
            <UserIcon size={18} className="mr-3 text-accent" /> View Full Profile
          </Button>
        </div>
      </header>

      <PerformanceSubmitModal 
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        playerId={player.id}
        playerName={player.name}
        defaultSport={player.primarySport}
      />

      <div 
        id="asset-benchmarking-module"
        className="bento-card p-10 bg-card/60 backdrop-blur-3xl group"
        style={{ '--glow-color': 'hsl(var(--accent) / 0.1)' } as React.CSSProperties}
      >
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:rotate-12 transition-transform duration-1000 grayscale">
           <TrendingUp size={300} />
        </div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
           <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-accent italic">Compare Players</h3>
              <p className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Player <br/><span className="text-accent underline decoration-4 underline-offset-8">Comparison</span> Module</p>
           </div>
           
           <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={20} />
                <Select value={comparePlayerId} onValueChange={setComparePlayerId}>
                   <SelectTrigger id="select-benchmark-target" className="w-full h-20 bg-white/5 border-white/5 rounded-[32px] pl-16 pr-8 text-white font-black italic uppercase tracking-widest text-[11px] focus:ring-accent/50 outline-none">
                      <SelectValue placeholder="SELECT PLAYER TO COMPARE" />
                   </SelectTrigger>
                   <SelectContent className="bg-[#050608] border-white/10 text-white rounded-[32px] p-2">
                      {allPlayers.filter(p => p.id !== player.id).map(p => (
                         <SelectItem key={p.id} value={p.id} className="font-black italic uppercase text-[10px] py-4 rounded-2xl focus:bg-white/5 focus:text-accent">
                           {p.name} <span className="opacity-40 ml-2">[{p.primarySport}]</span>
                         </SelectItem>
                      ))}
                   </SelectContent>
                </Select>
              </div>

              {comparePlayer && (
                 <motion.div 
                   id="compare-player-result"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="flex items-center gap-6 p-6 bg-accent/5 rounded-[32px] border border-accent/10 w-full md:w-auto min-w-[320px] shadow-2xl"
                 >
                    <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center font-black italic text-2xl shadow-2xl text-accent-foreground">
                       {comparePlayer.name[0]}
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-1">{comparePlayer.primarySport} Grade</p>
                       <p className="text-base font-black italic uppercase tracking-tight text-white leading-none">{comparePlayer.name}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-2xl font-black italic leading-none text-white">
                          {comparePlayer.primarySport === 'cricket' ? comparePlayer.stats.cricket.runs : comparePlayer.stats.football.goals}
                       </p>
                       <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mt-1">Net Stats</p>
                    </div>
                 </motion.div>
              )}
           </div>
        </div>
      </div>

      <div id="performance-intel-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {personalStats.map((stat, i) => (
          <motion.div
            key={`player-stat-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div 
              id={`player-stat-card-${i}`}
              className="bento-card group p-8"
              style={{ '--glow-color': stat.glow } as React.CSSProperties}
            >
               <div id={`player-stat-header-${i}`} className="flex items-center justify-between mb-8">
                  <div className={cn("p-4 rounded-2xl bg-white/5 border border-white/10 transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-inner")}>
                     <stat.icon size={26} className={stat.color} />
                  </div>
                  {stat.academyAvg && (
                     <div className="text-right">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none mb-1 shadow-glow ">Unit Avg</p>
                        <p className="text-sm font-black text-white italic leading-none">{stat.academyAvg}</p>
                     </div>
                  )}
               </div>
               <div id={`player-stat-content-${i}`}>
                  <p id={`player-stat-label-${i}`} className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 italic">{stat.label}</p>
                  <div className="flex items-end gap-4">
                     <p id={`player-stat-value-${i}`} className="text-5xl font-black text-white tracking-tighter italic leading-none">{stat.value}</p>
                     {stat.academyAvg && (
                        <div className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full italic border mb-1",
                          Number(stat.value) >= Number(stat.academyAvg) ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                        )}>
                           {Number(stat.value) >= Number(stat.academyAvg) ? "OPTIMAL" : "SUB-PAR"}
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 elite-card border-none shadow-2xl shadow-black/50 p-10">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] mb-10 flex items-center gap-3 italic">
              <Activity size={16} className="text-accent" /> Your Progress History
            </h4>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { name: 'Jan', score: 20 },
                  { name: 'Feb', score: 35 },
                  { name: 'Mar', score: 25 },
                  { name: 'Apr', score: 45 },
                  { name: 'May', score: 55 },
                  { name: 'Jun', score: 65 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" fontSize={9} fontWeight="black" tick={{fill: 'var(--muted-foreground)'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis fontSize={9} fontWeight="black" tick={{fill: 'var(--muted-foreground)'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', background: 'var(--card)', color: 'white' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#F59E0B" strokeWidth={6} dot={{ r: 6, fill: '#F59E0B', stroke: 'white', strokeWidth: 4 }} activeDot={{ r: 10, fill: '#000000' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
         </Card>

         {/* Attendance Card */}
          <Card className="elite-card border-none shadow-2xl shadow-black/50 bg-card overflow-hidden flex flex-col">
            <CardHeader className="border-b border-border px-10 py-8 bg-muted/30">
               <CardTitle className="text-[10px] font-black text-accent uppercase tracking-[0.2em] italic">Attendance Records</CardTitle>
            </CardHeader>
            <CardContent className="p-10 flex-1 flex flex-col justify-between space-y-8">
               <div className="text-center space-y-4">
                  <div className="relative inline-block">
                     <div className="w-32 h-32 rounded-[40px] bg-black flex flex-col items-center justify-center text-primary-foreground border-8 border-border/50 shadow-2xl">
                        <p className="text-4xl font-black italic">{attendance.length}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Sessions</p>
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-2xl border-4 border-border flex items-center justify-center text-primary-foreground shadow-xl">
                        <ShieldCheck size={20} />
                     </div>
                  </div>
                  <div>
                    <h5 className="text-xl font-black text-foreground tracking-tight uppercase italic leading-none mb-1">Class Attendance</h5>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">This Month</p>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[9px] font-black text-foreground uppercase tracking-widest mb-2 italic">Recent Sessions</p>
                  {attendance.slice(0, 3).map((a, i) => (
                    <div key={`attendance-${i}`} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border group hover:border-accent/20 transition-all">
                       <span className="text-[10px] font-black text-foreground uppercase italic">{new Date(a.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric' })}</span>
                       <Badge className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black border-none uppercase tracking-widest">Present</Badge>
                    </div>
                  ))}
                  {attendance.length === 0 && <p className="text-[10px] font-bold text-muted-foreground uppercase italic py-4">No sessions documented</p>}
               </div>

               <Button className="w-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl transition-all shadow-sm">View Full Log</Button>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Achievements */}
         <Card className="elite-card border-none shadow-2xl shadow-black/50 overflow-hidden bg-card">
            <CardHeader className="border-b border-border bg-muted/50 px-8 py-6">
               <CardTitle className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] italic">My Achievements</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               {[
                 { title: "Century Milestone", icon: Award, color: "text-amber-500", bg: "bg-amber-500/10", date: "May 2026" },
                 { title: "Ironman Attendance", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10", date: "April 2026" },
                 { title: "MVP Contender", icon: Star, color: "text-accent", bg: "bg-accent/10", date: "Ongoing" }
               ].map((ach, i) => (
                 <div key={`achievement-${i}`} className="flex items-center gap-5 group cursor-pointer">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 shadow-sm", ach.bg)}>
                       <ach.icon size={24} className={ach.color} />
                    </div>
                    <div>
                       <p className="text-sm font-black text-foreground uppercase italic tracking-tight group-hover:text-accent transition-colors">{ach.title}</p>
                       <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{ach.date}</p>
                    </div>
                 </div>
               ))}
            </CardContent>
         </Card>

         {/* Academy News Feed */}
         <Card className="elite-card border-none shadow-2xl shadow-black/50 overflow-hidden bg-card">
            <CardHeader className="border-b border-border bg-muted/50 px-8 py-6">
               <CardTitle className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] italic">Academy Updates</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               {[
                 { title: "Summer Cup 2026", date: "20 May", desc: "Registration protocols are now active for all categories." },
                 { title: "New Training Specs", date: "19 May", desc: "Monday sessions recalibrated to 16:00 hours." }
               ].map((news, i) => (
                  <div key={`player-news-${i}`} className="p-5 rounded-[28px] border border-border bg-muted/20 hover:bg-muted/40 hover:border-accent/20 transition-all group cursor-pointer">
                     <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-black text-foreground uppercase italic tracking-tight">{news.title}</p>
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{news.date}</span>
                     </div>
                     <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-wide italic opacity-80">{news.desc}</p>
                  </div>
               ))}
            </CardContent>
         </Card>

         {/* Training Tips */}
         <Card className="bg-black p-10 rounded-[48px] shadow-2xl relative overflow-hidden group border border-border/5">
            <div className="absolute bottom-0 right-0 p-10 opacity-10 blur-xl group-hover:blur-none transition-all duration-1000">
               <Trophy size={160} className="text-accent/80" />
            </div>
            <div className="relative z-10 space-y-8">
               <div className="inline-flex items-center gap-3 text-accent/80 underline underline-offset-8 decoration-2">
                  <Activity size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tactical Directive</span>
               </div>
               <div className="space-y-4">
                  <h4 className="text-2xl font-black text-primary-foreground leading-tight tracking-tight uppercase italic">Master the "Shadow Training" Protocol.</h4>
                  <p className="text-xs font-bold text-primary-foreground/70 leading-relaxed uppercase tracking-wider italic">Mimic your core vertical movements without assets to optimize muscle memory and synaptic accuracy.</p>
               </div>
               <Button variant="outline" className="border-border/10 text-primary-foreground font-black uppercase text-[10px] tracking-widest h-14 px-8 rounded-2xl hover:bg-card/10 transition-all">Read Documentation</Button>
            </div>
         </Card>
      </div>
    </div>
  );
}

function PublicDashboard({ players, matches }: { players: Player[], matches: Match[] }) {
  const liveMatches = matches.filter(m => m.status === 'live');
  
   return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <section className="relative h-[400px] md:h-[500px] rounded-[32px] md:rounded-[64px] overflow-hidden flex items-center justify-center text-center p-6 md:p-12 shadow-2xl">
         <div className="absolute inset-0 bg-black" />
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
         
         <div className="relative z-10 max-w-4xl space-y-6 md:space-y-10">
            <div className="flex justify-center">
              <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-[0.4em] px-4 md:px-6 py-2 rounded-full text-[8px] md:text-[10px] shadow-2xl shadow-primary/40 border-none">Unified Academy Portal</Badge>
            </div>
            <h1 className="text-5xl md:text-9xl font-display font-black text-primary-foreground tracking-tighter uppercase italic leading-[0.9] md:leading-[0.85]">
              Elite <span className="text-accent">Academy</span> <br/>Tactical Feed
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg font-bold uppercase tracking-widest max-w-2xl mx-auto italic opacity-80 leading-relaxed">
              Real-time telemetry, athlete benchmarks, and strategic updates.
            </p>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-4">
              <Activity className="text-accent" /> Live Deployment Feed
            </h2>
            <Link to="/schedule">
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-accent p-0 hover:bg-transparent">
                 Full Timeline Archive <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>

          {liveMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {liveMatches.map(match => (
                <Link key={match.id} to={`/matches/${match.id}`} className="block">
                  <Card className="elite-card border-none shadow-2xl shadow-black/50 bg-card overflow-hidden group hover:ring-2 hover:ring-accent/20 transition-all duration-700">
                    <div className="bg-red-600 p-3 text-center">
                      <span className="text-[10px] font-black text-primary-foreground uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-card animate-pulse" /> Live Telemetry Linked
                      </span>
                    </div>
                    <CardContent className="p-12">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="text-center md:text-left flex-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 italic">{match.sport} Index / Sector A</p>
                          <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase italic underline decoration-accent/30 decoration-8 underline-offset-12 transition-all group-hover:decoration-accent">{match.title}</h3>
                        </div>
                        
                        <div className="flex items-center gap-12 text-center px-10 py-6 bg-muted/30 rounded-[40px] border border-border shadow-inner group-hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="text-6xl font-black text-foreground italic tracking-tighter">
                              {match.sport === 'football' ? (match.score as any).team1.goals : (match.score as any).team1.runs}
                            </p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Home Unit</p>
                          </div>
                          <div className="text-3xl font-black text-muted/30 italic tracking-widest">-</div>
                          <div>
                            <p className="text-6xl font-black text-foreground italic tracking-tighter">
                              {match.sport === 'football' ? (match.score as any).team2.goals : (match.score as any).team2.runs}
                            </p>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Away Unit</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center rounded-[64px] border-4 border-dashed border-border/20 flex flex-col items-center justify-center gap-8 bg-muted/20">
               <div className="w-24 h-24 bg-card rounded-[40px] flex items-center justify-center text-muted-foreground shadow-xl border border-border">
                  <Activity size={48} />
               </div>
               <div className="space-y-2">
                 <p className="text-[12px] font-black text-foreground/70 uppercase tracking-[0.5em] italic leading-relaxed">No Deployments Underway</p>
                 <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest italic leading-relaxed">Scan the timeline for next scheduled mission</p>
               </div>
            </div>
          )}

          <div className="pt-12">
            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase italic mb-8 flex items-center gap-4 px-2">
              <Trophy className="text-accent" /> Academy Benchmark Leaders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {players.slice(0, 3).map((player, i) => (
                  <Card key={player.id} className="elite-card border-none shadow-2xl relative overflow-hidden group hover:scale-[1.05] transition-all duration-700 bg-card">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                    <span className="text-8xl font-black text-foreground italic">0{i+1}</span>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center font-black text-2xl rounded-2xl skew-x-[-8deg] shadow-lg group-hover:rotate-6 transition-transform">
                      {player.name[0]}
                    </div>
                    <div>
                      <p className="text-2xl font-black text-foreground tracking-tighter uppercase italic leading-none">{player.name}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">{player.primarySport} DEP.</p>
                    </div>
                    <div className="pt-6 border-t border-border flex justify-between items-end">
                      <div>
                        <p className="text-4xl font-black text-foreground italic tracking-tighter leading-none">
                          {player.stats.football.goals || player.stats.cricket.runs || 0}
                        </p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 italic">Performance Grade</p>
                      </div>
                      <Link to={`/players/${player.id}`}>
                        <Button size="icon" variant="ghost" className="rounded-2xl h-12 w-12 hover:bg-accent/10 hover:text-accent shadow-sm border border-border transition-all"><ExternalLink size={20} /></Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase italic mb-8 flex items-center gap-4 px-2">
              <Plus className="text-accent" /> Academy Log
            </h2>
            <Card className="elite-card border-none shadow-2xl shadow-black/40 overflow-hidden bg-card">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {[
                    { title: "Training Logs Updated", date: "12 May", excerpt: "Personal development scores now available in player portal." },
                    { title: "Inter-Academy Cup", date: "10 May", excerpt: "Rimon Sports confirms participation in the Summer Series." },
                    { title: "Kit Distribution Active", date: "08 May", excerpt: "New training assets ready for pick-up at admin sector." },
                    { title: "Academy Open Day", date: "05 May", excerpt: "Public talent scouting session scheduled for next Sunday." }
                  ].map((news, i) => (
                    <div key={`public-news-${i}`} className="p-8 hover:bg-muted/50 transition-all cursor-pointer group">
                      <div className="flex justify-between items-center mb-3">
                        <Badge className="bg-muted text-muted-foreground font-black uppercase text-[8px] tracking-[0.2em] px-3 py-1 rounded-full border-none">{news.date}</Badge>
                        <ArrowRight size={16} className="text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                      </div>
                      <h4 className="text-sm font-black text-foreground uppercase italic tracking-tight mb-2 group-hover:text-accent transition-colors">{news.title}</h4>
                      <p className="text-[11px] font-bold text-muted-foreground leading-relaxed uppercase tracking-wide italic opacity-80">{news.excerpt}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-black p-10 rounded-[56px] shadow-2xl relative overflow-hidden group border border-border/5">
            <div className="absolute bottom-0 right-0 p-10 opacity-10 blur-xl group-hover:blur-none transition-all duration-1000 group-hover:rotate-12">
               <Trophy size={200} className="text-accent/80" />
            </div>
            <div className="relative z-10 space-y-8">
               <h3 className="text-3xl font-black text-primary-foreground tracking-tighter uppercase leading-[0.9] italic">
                 Join the <br/><span className="text-accent">Professional</span> Pathway
               </h3>
               <p className="text-primary-foreground/70 text-xs font-bold uppercase tracking-widest italic leading-relaxed">
                 Enroll in the country's most advanced athletic development ecosystem and secure your future.
               </p>
               <Button className="w-full bg-accent text-primary-foreground font-black uppercase text-[11px] tracking-[0.3em] h-16 rounded-[28px] shadow-xl shadow-accent/20 hover:bg-primary transition-all active:scale-95">
                 Initialize Application
               </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [currentPlayer, setCurrentPlayer] = React.useState<Player | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { user, profile } = useAuth();

  React.useEffect(() => {
    const unsubPlayers = dataService.getPlayers(setPlayers);
    const unsubMatches = dataService.getMatches(setMatches);
    const unsubTeams = dataService.getTeams(setTeams);
    
    // If user is a player, fetch their specific player profile
    let unsubProfile = () => {};
    if (profile?.role === 'player' && profile.playerId) {
      unsubProfile = dataService.getPlayer(profile.playerId, (data) => {
        setCurrentPlayer(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    return () => {
      unsubPlayers();
      unsubMatches();
      unsubTeams();
      unsubProfile();
    };
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <PublicDashboard players={players} matches={matches} />;
  }

  if (profile?.role === 'player' && currentPlayer) {
    return <PlayerDashboard player={currentPlayer} matches={matches} allPlayers={players} />;
  }

  return <ManagementDashboard players={players} matches={matches} teams={teams} />;
}
