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

function ManagementDashboard({ players, matches, teams }: { players: Player[], matches: Match[], teams: Team[] }) {
  const handleBulkImport = async () => {
    const playerList = [
      ["ARIF", "BOTH", "18+", "FULL TIME", "ACTIVE"],
      ["JAKARIEA", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["RAMJAN", "FOOTBALL", "18+", "FREE TIME", "SUSPENDED"],
      ["ROBIUL", "CRICKET", "18+", "FREE TIME", "JOBS"],
      ["RIEAZ", "FOOTBALL", "18+", "FULL TIME", "ACTIVE"],
      ["RAHATUL", "FOOTBALL", "UNDER 17", "FULL TIME", "ACTIVE"],
      ["MEHEDI", "FOOTBALL", "18+", "FULL TIME", "ACTIVE"],
      ["NAYAN", "FOOTBALL", "UNDER 17", "FREE TIME", "ACTIVE"],
      ["LITON", "BOTH", "18+", "FULL TIME", "ACTIVE"],
      ["TAMIM", "FOOTBALL", "UNDER 17", "FULL TIME", "ACTIVE"],
      ["HASIB", "FOOTBALL", "18+", "FULL TIME", "ACTIVE"],
      ["LABLU", "FOOTBALL", "18+", "PART TIME", "ACTIVE"],
      ["MUNNA", "FOOTBALL", "18+", "FULL TIME", "ACTIVE"],
      ["ARAFAT", "BOTH", "18+", "FULL TIME", "ACTIVE"],
      ["MAINUL", "FOOTBALL", "18+", "FULL TIME", "ACTIVE"],
      ["SAKIL", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["SAKIB", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["ARSHAFUL", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["AMIN", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["RIFAT", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["HRIDOY", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["RONI", "FOOTBALL", "18+", "FULL TIME", "STUDY"],
      ["PRANTO", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["RAHAT", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["ABDULLAH", "FOOTBALL", "UNDER 11", "FULL TIME", "ACTIVE"],
      ["AMINUL", "FOOTBALL", "UNDER 11", "FULL TIME", "ACTIVE"],
      ["RABBI", "FOOTBALL", "UNDER 11", "FULL TIME", "ACTIVE"],
      ["SANIM", "BOTH", "UNDER 16", "FULL TIME", "ACTIVE"],
      ["JIHAD", "FOOTBALL", "UNDER 14", "FULL TIME", "ACTIVE"],
      ["SAJID", "FOOTBALL", "UNDER 14", "FULL TIME", "ACTIVE"],
      ["SAJJAD", "FOOTBALL", "UNDER 11", "FULL TIME", "ACTIVE"],
      ["BONI AMIN", "FOOTBALL", "UNDER 14", "FULL TIME", "ACTIVE"],
      ["TAREQ", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["AMINUL", "FOOTBALL", "18+", "FULL TIME", "ACTIVE"],
      ["YEASIN", "FOOTBALL", "UNDER 17", "FULL TIME", "ACTIVE"],
      ["SOWROV", "BOTH", "UNDER 16", "FULL TIME", "ACTIVE"],
      ["SENTU", "CRICKET", "UNDER 15", "FULL TIME", "ACTIVE"],
      ["ARAFT", "BOTH", "18+", "FULL TIME", "ACTIVE"],
      ["MAHAMUDULLA", "FOOTBALL", "UNDER 15", "FULL TIME", "ACTIVE"],
      ["FAHIM", "FOOTBALL", "UNDER 15", "FULL TIME", "ACTIVE"],
      ["SAKIB", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["RAKIB", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["SABUJ", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["ROHIM", "CRICKET", "18+", "FULL TIME", "ACTIVE"],
      ["ARFAN", "BOTH", "18+", "FULL TIME", "ACTIVE"],
      ["RIEAZ", "BADMINTON", "18+", "PART TIME", "ACTIVE"],
      ["MAHAFUZ", "FOOTBALL", "UNDER 15", "FULL TIME", "ACTIVE"],
      ["SAYEM", "BOTH", "UNDER 16", "FULL TIME", "ACTIVE"],
      ["JIHAD", "BADMINTON", "UNDER 15", "FULL TIME", "ACTIVE"],
      ["SAKIL", "FOOTBALL", "UNDER 13", "FULL TIME", "ACTIVE"],
      ["RUHUL AMIN", "FOOTBALL", "UNDER 14", "FULL TIME", "ACTIVE"],
      ["NUR", "FOOTBALL", "UNDER 15", "FULL TIME", "ACTIVE"],
      ["MARUF", "FOOTBALL", "UNDER 13", "FULL TIME", "ACTIVE"],
      ["AJIJUL", "FOOTBALL", "UNDER 14", "FULL TIME", "ACTIVE"],
      ["RAHAT", "FOOTBALL", "UNDER 14", "FULL TIME", "ACTIVE"],
      ["YOUNUS", "FOOTBALL", "UNDER 15", "FULL TIME", "ACTIVE"],
      ["ROBIUL", "FOOTBALL", "UNDER 15", "PART TIME", "ACTIVE"],
      ["BONI AMIN", "FOOTBALL", "UNDER 13", "FULL TIME", "ACTIVE"],
      ["SAKIB", "FOOTBALL", "UNDER 13", "FULL TIME", "ACTIVE"]
    ];

    toast.loading("Importing players...");
    
    let imported = 0;
    let skipped = 0;
    for (const [name, sportStr, ageStr, category, statusStr] of playerList) {
      if (players.some(p => p.name === name)) {
        skipped++;
        continue;
      }

      let sport: Sport = 'football';
      if (sportStr.includes('CRICKET')) sport = 'cricket';
      else if (sportStr.includes('BADMINTON') || sportStr.includes('BATMINTON')) sport = 'badminton';
      else if (sportStr.includes('BOTH')) sport = 'football'; // Default both to football primary
      
      let status: PlayerStatus = 'training';
      if (statusStr === 'SUSPENDED') status = 'suspended';
      else if (statusStr === 'JOBS') status = 'jobs';
      else if (statusStr === 'STUDY') status = 'study';
      
      let ageNum = ageStr === '18+' ? 18 : parseInt(ageStr.replace('UNDER ', '').replace('UNDER', '')) || 18;

      const player: Omit<Player, 'id'> = {
        name,
        primarySport: sport,
        status,
        age: ageNum,
        joinedDate: new Date().toISOString(),
        stats: {
          cricket: { runs: 0, wickets: 0, matches: 0, strikeRate: 0, average: 0 },
          football: { goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 },
          badminton: { wins: 0, matches: 0, winRate: 0 }
        }
      };

      try {
        await dataService.addPlayer(player);
        imported++;
      } catch (e) {
        console.error(`Failed to import ${name}`, e);
      }
    }
    
    toast.dismiss();
    toast.success(`Successfully imported ${imported} players! (${skipped} skipped)`);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            Academy <span className="bg-indigo-500 text-white px-3 py-1 rounded-2xl skew-x-[-6deg] not-italic">Control</span>
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] opacity-80">Operational Intelligence & Oversight</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleBulkImport} variant="outline" className="border-indigo-500/20 text-indigo-600 hover:bg-indigo-50 font-black uppercase text-[10px] tracking-widest h-14 px-8 rounded-2xl transition-all">
             Initialize Bulk Feed
          </Button>
          <Link to="/players">
            <Button className="bg-slate-900 text-white hover:bg-indigo-600 font-black uppercase text-[10px] tracking-widest h-14 px-10 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all">
              <Plus size={16} className="mr-2" /> Register Talent
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {[
          { label: 'Registered Athletes', value: players.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10', trend: '+12% from last month', link: '/players' },
          { label: 'Registered Teams', value: teams.length, icon: Flag, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: 'Active squads', link: '/teams' },
          { label: 'Active Deployments', value: matches.filter(m => m.status === 'live').length, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'Live Monitoring', link: '/schedule' },
          { label: 'Tournament Assets', value: 3, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: 'Next kick-off in 4h', link: '/tournaments' },
          { label: 'Efficiency Rating', value: '94.2%', icon: ClipboardCheck, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: 'Optimal threshold' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {stat.link ? (
              <Link to={stat.link}>
                <Card className="elite-card group overflow-hidden border-none shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-4 rounded-2xl transition-transform group-hover:rotate-6", stat.bg)}>
                          <stat.icon size={22} className={stat.color} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.trend}</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tight italic">{stat.value}</p>
                    </div>
                  </CardContent>
                  <div className={cn("h-1.5 w-full", stat.bg)} />
                </Card>
              </Link>
            ) : (
              <Card className="elite-card group overflow-hidden border-none shadow-xl shadow-slate-200/40">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-4 rounded-2xl transition-transform group-hover:rotate-6", stat.bg)}>
                        <stat.icon size={22} className={stat.color} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.trend}</span>
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                      <p className="text-4xl font-black text-slate-900 tracking-tight italic">{stat.value}</p>
                  </div>
                </CardContent>
                <div className={cn("h-1.5 w-full", stat.bg)} />
              </Card>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Scoring Engine Card */}
        <Card className="lg:col-span-2 elite-card border-none shadow-2xl shadow-slate-200/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] -rotate-12">
            <Activity size={320} />
          </div>
          <CardHeader className="border-b border-slate-100 pb-6 flex flex-row items-center justify-between space-y-0 bg-slate-50/50 px-10">
            <div>
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Live Telemetry Feed</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 mt-1 uppercase italic">Unified Academy Scoreboard</CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Secure Uplink Active</span>
            </div>
          </CardHeader>
          <CardContent className="p-12 relative z-10">
            <div className="space-y-12">
              <div className="flex items-center justify-center gap-16 md:gap-24">
                 <div className="text-center space-y-4 group cursor-pointer">
                    <div className="w-28 h-28 rounded-3xl bg-slate-900 flex items-center justify-center text-white font-black text-3xl border-8 border-slate-100 shadow-2xl group-hover:scale-105 transition-transform">W</div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">Warriors</p>
                 </div>
                 <div className="text-center space-y-2">
                    <p className="text-7xl font-black text-slate-900 tracking-tighter italic">2<span className="text-indigo-500 mx-2">-</span>1</p>
                    <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full border border-red-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live: 65'</span>
                    </div>
                 </div>
                 <div className="text-center space-y-4 group cursor-pointer">
                    <div className="w-28 h-28 rounded-3xl bg-indigo-500 flex items-center justify-center text-white font-black text-3xl border-8 border-slate-100 shadow-2xl group-hover:scale-105 transition-transform">T</div>
                    <p className="text-sm font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">Titans</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                 <Button className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-slate-800">Update Payload</Button>
                 <Button variant="outline" className="border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl hover:bg-slate-50">Command Center</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="elite-card border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Elite Talent Index</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-50">
                {players.slice(0, 5).map((p, i) => (
                   <div key={p.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                         <span className="text-xs font-black text-slate-200 w-4">{i + 1}</span>
                         <div className="w-12 h-12 rounded-2xl bg-indigo-500/5 flex items-center justify-center text-indigo-500 font-black text-sm uppercase border border-indigo-500/10 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                            {p.photoURL ? <img src={p.photoURL} alt={p.name} className="w-full h-full object-cover rounded-2xl" /> : p.name[0]}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{p.name}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60 italic">{p.primarySport}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-base font-black text-slate-900 tracking-tight">
                            {p.stats.cricket.matches > 0 ? p.stats.cricket.runs : p.stats.football.goals}
                         </p>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60 italic">{p.stats.cricket.matches > 0 ? 'Score' : 'Goals'}</p>
                      </div>
                   </div>
                ))}
             </div>
             <div className="p-8 bg-slate-50/50">
                <Button variant="link" className="w-full text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] p-0 h-auto hover:text-indigo-600 underline">
                   Access Global Rankings <ArrowRight size={14} className="ml-2" />
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="elite-card border-none shadow-2xl shadow-slate-200/50 p-10">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
              <TrendingUp size={16} className="text-indigo-500" /> Deployment Frequency (H1 2026)
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" fontSize={9} fontWeight="black" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis fontSize={9} fontWeight="black" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', background: 'rgba(15, 23, 42, 0.95)', color: 'white' }}
                  />
                  <Bar dataKey="matches" fill="url(#barGradient)" radius={[8, 8, 4, 4]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </Card>

          <Card className="elite-card border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="border-b border-slate-100 px-10 py-8 bg-slate-50/50">
               <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Intelligence Briefing</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
               {[
                 { title: "Summer Cup Deployment", desc: "Category A athletes approved for regional series kickoff.", date: "14 May" },
                 { title: "Logistical Readiness", desc: "Training Facility B recalibrated for monsoon session specs.", date: "12 May" },
                 { title: "New Asset Acquisition", desc: "Professional grade telemetry sensors deployed to pitch A.", date: "10 May" }
               ].map((event, i) => (
                  <div key={i} className="flex gap-6 p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-indigo-500/20 transition-all cursor-pointer group">
                     <div className="shrink-0 flex flex-col items-center">
                        <span className="text-base font-black text-slate-900 italic tracking-tighter leading-none">{event.date.split(' ')[0]}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{event.date.split(' ')[1]}</span>
                     </div>
                     <div className="w-px bg-slate-200 h-10 self-center" />
                     <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{event.title}</p>
                        <p className="text-xs text-slate-400 font-bold mt-1 leading-relaxed italic opacity-80">{event.desc}</p>
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
  
  const comparePlayer = React.useMemo(() => 
    allPlayers.find(p => p.id === comparePlayerId), 
    [allPlayers, comparePlayerId]
  );

  const personalStats = React.useMemo(() => {
    const stats: { label: string, value: any, icon: any, color: string, bg: string, academyAvg?: string }[] = [];
    
    const calculateAvg = (sport: Sport, field: string) => {
      const activePlayers = allPlayers.filter(p => p.stats[sport].matches > 0);
      if (activePlayers.length === 0) return '0';
      const sum = activePlayers.reduce((acc, p) => acc + ((p.stats[sport] as any)[field] || 0), 0);
      return (sum / activePlayers.length).toFixed(1);
    };

    if (player.stats.cricket.matches > 0 || player.primarySport === 'cricket') {
      stats.push({ 
        label: 'Runs Scored', 
        value: player.stats.cricket.runs, 
        icon: Trophy, 
        color: 'text-indigo-500', 
        bg: 'bg-indigo-500/10',
        academyAvg: calculateAvg('cricket', 'runs')
      });
      stats.push({ 
        label: 'Strike Rate', 
        value: player.stats.cricket.strikeRate.toFixed(1), 
        icon: Activity, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-500/10',
        academyAvg: calculateAvg('cricket', 'strikeRate')
      });
    }
    if (player.stats.football.matches > 0 || player.primarySport === 'football') {
      stats.push({ 
        label: 'Goals', 
        value: player.stats.football.goals, 
        icon: Target, 
        color: 'text-rose-500', 
        bg: 'bg-rose-500/10',
        academyAvg: calculateAvg('football', 'goals')
      });
      stats.push({ 
        label: 'Assists', 
        value: player.stats.football.assists, 
        icon: TrendingUp, 
        color: 'text-sky-500', 
        bg: 'bg-sky-500/10',
        academyAvg: calculateAvg('football', 'assists')
      });
    }
    return stats;
  }, [player, allPlayers]);

  const [attendance, setAttendance] = React.useState<any[]>([]);
  React.useEffect(() => {
    return dataService.getPlayerAttendance(player.id, setAttendance);
  }, [player.id]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
               Elite <span className="bg-indigo-500 text-white px-3 py-1 rounded-2xl skew-x-[-6deg] not-italic text-2xl md:text-3xl">Portal</span>
             </h1>
             <Badge className="bg-slate-100 text-slate-500 font-black border-none uppercase tracking-widest text-[9px] px-3 hidden sm:inline-flex">
               ID: {player.academyId || player.id.slice(-6).toUpperCase()}
             </Badge>
          </div>
          <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] opacity-80">Personal Performance Intelligence</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Dialog>
            <DialogTrigger nativeButton={false} render={
              <Button className="flex-1 md:flex-none bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-black uppercase text-[10px] tracking-widest h-14 px-6 md:px-8 rounded-2xl transition-all italic border border-indigo-100">
                <QrCode size={16} className="mr-2" /> Pass
              </Button>
            } />
            <DialogContent className="sm:max-w-xs bg-white rounded-[40px] p-10 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-black italic uppercase tracking-tighter mb-6">Execution QR Code</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-8">
                <div className="p-6 bg-white rounded-3xl border-4 border-slate-900 shadow-2xl">
                   <QRCodeSVG 
                     value={`${window.location.origin}/players/${player.id}`} 
                     size={180}
                     level="H"
                     includeMargin={true}
                   />
                </div>
                <div className="text-center space-y-2">
                   <p className="text-lg font-black italic uppercase tracking-tight leading-none text-slate-900">{player.name}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academy ID: {player.academyId || player.id.slice(-6).toUpperCase()}</p>
                </div>
                <div className="w-full h-px bg-slate-100" />
                <p className="text-[9px] font-bold text-slate-400 uppercase italic text-center leading-relaxed">
                  Authentication protocol active. <br/>Scan for personnel verification.
                </p>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={() => window.location.href = `tel:+8801700000000`}
            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-black uppercase text-[10px] tracking-widest h-14 px-8 rounded-2xl transition-all italic border border-emerald-100"
          >
            <MessageSquare size={16} className="mr-2" /> Dispatch SMS
          </Button>

          <Button 
            onClick={() => navigate(`/players/${player.id}`)}
            className="bg-slate-900 text-white hover:bg-indigo-600 font-black uppercase text-[10px] tracking-widest h-14 px-10 rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-95 italic"
          >
            <UserIcon size={16} className="mr-2" /> View Digital Profile
          </Button>
        </div>
      </header>

      {/* Comparison Engine */}
      <Card className="elite-card border-none shadow-2xl shadow-slate-200/50 p-8 bg-slate-900 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
           <TrendingUp size={200} />
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
           <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Tactical Comparison Module</h4>
              <p className="text-2xl font-black italic uppercase tracking-tight">Benchmark against academy assets</p>
           </div>
           
           <div className="relative col-span-1 md:col-span-2 flex flex-col md:flex-row gap-6 items-center">
              <div className="relative w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Select value={comparePlayerId} onValueChange={setComparePlayerId}>
                   <SelectTrigger className="w-full h-16 bg-white/10 border-white/10 rounded-2xl pl-14 pr-6 text-white font-black italic uppercase tracking-widest text-[10px]">
                      <SelectValue placeholder="SELECT TARGET FOR COMPARISON" />
                   </SelectTrigger>
                   <SelectContent className="bg-slate-900 border-white/10 text-white rounded-2xl">
                      {allPlayers.filter(p => p.id !== player.id).map(p => (
                         <SelectItem key={p.id} value={p.id} className="font-black italic uppercase text-[10px] py-3 focus:bg-white/10 focus:text-white">
                           {p.name} ({p.primarySport})
                         </SelectItem>
                      ))}
                   </SelectContent>
                </Select>
              </div>

              {comparePlayer && (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl border border-white/5 w-full md:w-auto min-w-[280px]"
                 >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center font-black italic text-lg shadow-xl">
                       {comparePlayer.name[0]}
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{comparePlayer.primarySport} Grade</p>
                       <p className="text-sm font-black italic uppercase tracking-tight">{comparePlayer.name}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black italic leading-none">
                          {comparePlayer.primarySport === 'cricket' ? comparePlayer.stats.cricket.runs : comparePlayer.stats.football.goals}
                       </p>
                       <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Total Score</p>
                    </div>
                 </motion.div>
              )}
           </div>
        </div>
      </Card>

      {/* Stats Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {personalStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="elite-card group overflow-hidden border-none shadow-xl shadow-slate-200/40">
              <CardContent className="p-8">
                 <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-4 rounded-2xl transition-transform group-hover:rotate-6", stat.bg)}>
                       <stat.icon size={22} className={stat.color} />
                    </div>
                    {stat.academyAvg && (
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Academy Avg</p>
                          <p className="text-sm font-black text-slate-900 italic">{stat.academyAvg}</p>
                       </div>
                    )}
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                    <div className="flex items-baseline gap-3">
                       <p className="text-4xl font-black text-slate-900 tracking-tight italic">{stat.value}</p>
                       {stat.academyAvg && (
                          <Badge className={cn(
                            "text-[8px] font-black uppercase tracking-widest border-none px-2",
                            Number(stat.value) >= Number(stat.academyAvg) ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          )}>
                             {Number(stat.value) >= Number(stat.academyAvg) ? "Above Avg" : "Below Avg"}
                          </Badge>
                       )}
                    </div>
                 </div>
              </CardContent>
              <div className={cn("h-1.5 w-full", stat.bg)} />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Performance Chart */}
         <Card className="lg:col-span-2 elite-card border-none shadow-2xl shadow-slate-200/50 p-10">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-10 flex items-center gap-3 italic">
              <Activity size={16} className="text-indigo-500" /> Operational Growth History
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" fontSize={9} fontWeights="black" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} dy={10} />
                  <YAxis fontSize={9} fontWeights="black" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px', background: 'rgba(15, 23, 42, 1)', color: 'white' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={6} dot={{ r: 6, fill: '#6366F1', stroke: 'white', strokeWidth: 4 }} activeDot={{ r: 10, fill: '#0F172A' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
         </Card>

         {/* Attendance Card */}
         <Card className="elite-card border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden flex flex-col">
            <CardHeader className="border-b border-slate-50 px-10 py-8 bg-slate-50/50">
               <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">Attendance Integrity</CardTitle>
            </CardHeader>
            <CardContent className="p-10 flex-1 flex flex-col justify-between space-y-8">
               <div className="text-center space-y-4">
                  <div className="relative inline-block">
                     <div className="w-32 h-32 rounded-[40px] bg-slate-900 flex flex-col items-center justify-center text-white border-8 border-slate-100 shadow-2xl">
                        <p className="text-4xl font-black italic">{attendance.length}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Sessions</p>
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-xl">
                        <ShieldCheck size={20} />
                     </div>
                  </div>
                  <div>
                    <h5 className="text-xl font-black text-slate-900 tracking-tight uppercase italic leading-none mb-1">Operational Presence</h5>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Current Month Cycle</p>
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-2 italic">Recent Sessions</p>
                  {attendance.slice(0, 3).map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-500/20 transition-all">
                       <span className="text-[10px] font-black text-slate-900 uppercase italic">{new Date(a.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric' })}</span>
                       <Badge className="bg-emerald-50 text-emerald-600 text-[8px] font-black border-none uppercase tracking-widest">Present</Badge>
                    </div>
                  ))}
                  {attendance.length === 0 && <p className="text-[10px] font-bold text-slate-300 uppercase italic py-4">No sessions documented</p>}
               </div>

               <Button className="w-full bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl transition-all shadow-sm">View Full Log</Button>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Achievements */}
         <Card className="elite-card border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6">
               <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">Strategic Achievements</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               {[
                 { title: "Century Milestone", icon: Award, color: "text-amber-500", bg: "bg-amber-50", date: "May 2026" },
                 { title: "Ironman Attendance", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50", date: "April 2026" },
                 { title: "MVP Contender", icon: Star, color: "text-indigo-500", bg: "bg-indigo-50", date: "Ongoing" }
               ].map((ach, i) => (
                 <div key={i} className="flex items-center gap-5 group cursor-pointer">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 shadow-sm", ach.bg)}>
                       <ach.icon size={24} className={ach.color} />
                    </div>
                    <div>
                       <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight group-hover:text-indigo-600 transition-colors">{ach.title}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ach.date}</p>
                    </div>
                 </div>
               ))}
            </CardContent>
         </Card>

         {/* Academy News Feed */}
         <Card className="elite-card border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6">
               <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">Intelligence Feed</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               {[
                 { title: "Summer Cup 2026", date: "20 May", desc: "Registration protocols are now active for all categories." },
                 { title: "New Training Specs", date: "19 May", desc: "Monday sessions recalibrated to 16:00 hours." }
               ].map((news, i) => (
                  <div key={i} className="p-5 rounded-[28px] border border-slate-50 bg-slate-50/30 hover:bg-slate-50 hover:border-indigo-500/20 transition-all group cursor-pointer">
                     <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-black text-slate-900 uppercase italic tracking-tight">{news.title}</p>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{news.date}</span>
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wide italic opacity-80">{news.desc}</p>
                  </div>
               ))}
            </CardContent>
         </Card>

         {/* Training Tips */}
         <Card className="bg-slate-900 p-10 rounded-[48px] shadow-2xl relative overflow-hidden group border-none">
            <div className="absolute bottom-0 right-0 p-10 opacity-10 blur-xl group-hover:blur-none transition-all duration-1000">
               <Trophy size={160} className="text-indigo-400" />
            </div>
            <div className="relative z-10 space-y-8">
               <div className="inline-flex items-center gap-3 text-indigo-400 underline underline-offset-8 decoration-2">
                  <Activity size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tactical Directive</span>
               </div>
               <div className="space-y-4">
                  <h4 className="text-2xl font-black text-white leading-tight tracking-tight uppercase italic">Master the "Shadow Training" Protocol.</h4>
                  <p className="text-xs font-bold text-white/40 leading-relaxed uppercase tracking-wider italic">Mimic your core vertical movements without assets to optimize muscle memory and synaptic accuracy.</p>
               </div>
               <Button variant="outline" className="border-white/10 text-white font-black uppercase text-[10px] tracking-widest h-14 px-8 rounded-2xl hover:bg-white/5 transition-all">Read Documentation</Button>
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
         <div className="absolute inset-0 bg-slate-900" />
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
         
         <div className="relative z-10 max-w-4xl space-y-6 md:space-y-10">
            <div className="flex justify-center">
              <Badge className="bg-indigo-500 text-white font-black uppercase tracking-[0.4em] px-4 md:px-6 py-2 rounded-full text-[8px] md:text-[10px] shadow-2xl shadow-indigo-500/40 border-none">Unified Academy Portal</Badge>
            </div>
            <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.9] md:leading-[0.85]">
              Elite <span className="text-indigo-500">Academy</span> <br/>Tactical Feed
            </h1>
            <p className="text-slate-400 text-sm md:text-lg font-bold uppercase tracking-widest max-w-2xl mx-auto italic opacity-80 leading-relaxed">
              Real-time telemetry, athlete benchmarks, and strategic updates.
            </p>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-4">
              <Activity className="text-indigo-500" /> Live Deployment Feed
            </h2>
            <Link to="/schedule">
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 p-0 hover:bg-transparent">
                 Full Timeline Archive <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>

          {liveMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {liveMatches.map(match => (
                <Link key={match.id} to={`/matches/${match.id}`} className="block">
                  <Card className="elite-card border-none shadow-2xl shadow-slate-200/50 bg-white overflow-hidden group hover:ring-2 hover:ring-indigo-500/20 transition-all duration-700">
                    <div className="bg-red-600 p-3 text-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> Live Telemetry Linked
                      </span>
                    </div>
                    <CardContent className="p-12">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="text-center md:text-left flex-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">{match.sport} Index / Sector A</p>
                          <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic underline decoration-indigo-500/30 decoration-8 underline-offset-12 transition-all group-hover:decoration-indigo-500">{match.title}</h3>
                        </div>
                        
                        <div className="flex items-center gap-12 text-center px-10 py-6 bg-slate-50/50 rounded-[40px] border border-slate-100 shadow-inner group-hover:bg-slate-50 transition-colors">
                          <div>
                            <p className="text-6xl font-black text-slate-900 italic tracking-tighter">
                              {match.sport === 'football' ? (match.score as any).team1.goals : (match.score as any).team1.runs}
                            </p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Home Unit</p>
                          </div>
                          <div className="text-3xl font-black text-slate-200 italic tracking-widest">-</div>
                          <div>
                            <p className="text-6xl font-black text-slate-900 italic tracking-tighter">
                              {match.sport === 'football' ? (match.score as any).team2.goals : (match.score as any).team2.runs}
                            </p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Away Unit</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-32 text-center rounded-[64px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-8 bg-slate-50/30">
               <div className="w-24 h-24 bg-white rounded-[40px] flex items-center justify-center text-slate-100 shadow-xl border border-slate-50">
                  <Activity size={48} />
               </div>
               <div className="space-y-2">
                 <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.5em] italic leading-relaxed">No Deployments Underway</p>
                 <p className="text-[10px] font-bold text-slate-200 uppercase tracking-widest italic leading-relaxed">Scan the timeline for next scheduled mission</p>
               </div>
            </div>
          )}

          <div className="pt-12">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-8 flex items-center gap-4 px-2">
              <Trophy className="text-indigo-500" /> Academy Benchmark Leaders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {players.slice(0, 3).map((player, i) => (
                <Card key={player.id} className="elite-card border-none shadow-2xl relative overflow-hidden group hover:scale-[1.05] transition-all duration-700">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                    <span className="text-8xl font-black text-slate-900 italic">0{i+1}</span>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center font-black text-2xl rounded-2xl skew-x-[-8deg] shadow-lg group-hover:rotate-6 transition-transform">
                      {player.name[0]}
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{player.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{player.primarySport} DEP.</p>
                    </div>
                    <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
                      <div>
                        <p className="text-4xl font-black text-slate-900 italic tracking-tighter leading-none">
                          {player.stats.football.goals || player.stats.cricket.runs || 0}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 italic">Performance Grade</p>
                      </div>
                      <Link to={`/players/${player.id}`}>
                        <Button size="icon" variant="ghost" className="rounded-2xl h-12 w-12 hover:bg-indigo-50 hover:text-indigo-500 shadow-sm border border-slate-100 transition-all"><ExternalLink size={20} /></Button>
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic mb-8 flex items-center gap-4 px-2">
              <Plus className="text-indigo-500" /> Academy Log
            </h2>
            <Card className="elite-card border-none shadow-2xl overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                  {[
                    { title: "Training Logs Updated", date: "12 May", excerpt: "Personal development scores now available in player portal." },
                    { title: "Inter-Academy Cup", date: "10 May", excerpt: "Rimon Sports confirms participation in the Summer Series." },
                    { title: "Kit Distribution Active", date: "08 May", excerpt: "New training assets ready for pick-up at admin sector." },
                    { title: "Academy Open Day", date: "05 May", excerpt: "Public talent scouting session scheduled for next Sunday." }
                  ].map((news, i) => (
                    <div key={i} className="p-8 hover:bg-slate-50 transition-all cursor-pointer group">
                      <div className="flex justify-between items-center mb-3">
                        <Badge className="bg-indigo-50 text-indigo-500 font-black uppercase text-[8px] tracking-[0.2em] px-3 py-1 rounded-full border-none">{news.date}</Badge>
                        <ArrowRight size={16} className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{news.title}</h4>
                      <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wide italic opacity-80">{news.excerpt}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900 p-10 rounded-[56px] shadow-2xl relative overflow-hidden group border-none">
            <div className="absolute bottom-0 right-0 p-10 opacity-10 blur-xl group-hover:blur-none transition-all duration-1000 group-hover:rotate-12">
               <Trophy size={200} className="text-indigo-400" />
            </div>
            <div className="relative z-10 space-y-8">
               <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-[0.9] italic">
                 Join the <br/><span className="text-indigo-500">Professional</span> Pathway
               </h3>
               <p className="text-white/40 text-xs font-bold uppercase tracking-widest italic leading-relaxed">
                 Enroll in the country's most advanced athletic development ecosystem and secure your future.
               </p>
               <Button className="w-full bg-indigo-500 text-white font-black uppercase text-[11px] tracking-[0.3em] h-16 rounded-[28px] shadow-xl shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-95">
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
