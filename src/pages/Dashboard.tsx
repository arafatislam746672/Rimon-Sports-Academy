import * as React from 'react';
import { 
  Users, 
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
  ExternalLink
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
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
import { Player, Match, MatchSubmission, Sport, PlayerStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

function ManagementDashboard({ players, matches }: { players: Player[], matches: Match[] }) {
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight uppercase italic">Academy <span className="text-accent">Overview</span></h1>
          <p className="text-text-light text-sm font-bold opacity-60">Full administrative control of academy operations and data.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleBulkImport} className="bg-accent text-primary hover:bg-accent/90 font-black uppercase text-xs tracking-widest h-12 px-6">
             Bulk Import
          </Button>
          <Link to="/players">
            <Button className="bg-primary text-secondary hover:bg-primary/90 font-black uppercase text-xs tracking-widest h-12 px-8">
              <Plus size={16} className="mr-2" /> Add Player
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Athletes', value: players.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Matches', value: matches.filter(m => m.status === 'live').length, icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Tournaments', value: 3, icon: Trophy, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Attendance', value: '94%', icon: ClipboardCheck, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <Card key={i} className="shadow-card border-border-custom hover:border-primary/20 transition-all">
            <CardContent className="p-6">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-black text-text-light uppercase tracking-widest mb-1">{stat.label}</p>
                     <p className="text-2xl font-black text-primary">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-xl", stat.bg)}>
                     <stat.icon size={20} className={stat.color} />
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Scoring Engine Card */}
        <Card className="lg:col-span-2 shadow-card border-border-custom overflow-hidden">
          <CardHeader className="border-b border-muted pb-4 flex flex-row items-center justify-between space-y-0 bg-muted/10">
            <div>
              <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Live Match Monitor</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-text-light mt-1 italic">Real-time academy scoreboard</CardDescription>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase text-green-600">Sync Active</span>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-12">
                 <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-primary font-black text-xl border-2 border-primary/10 mx-auto">W</div>
                    <p className="text-xs font-black text-primary uppercase">Warriors</p>
                 </div>
                 <div className="text-center space-y-1">
                    <p className="text-5xl font-black text-primary tracking-tighter">2 - 1</p>
                    <Badge className="bg-red-50 text-red-600 text-[10px] font-black tracking-widest border-red-200">LIVE: 65'</Badge>
                 </div>
                 <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-primary font-black text-xl border-2 border-primary/10 mx-auto">T</div>
                    <p className="text-xs font-black text-primary uppercase">Titans</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <Button className="bg-primary text-secondary font-black uppercase text-xs tracking-widest h-12">Update Score</Button>
                 <Button variant="outline" className="border-primary text-primary font-black uppercase text-xs tracking-widest h-12">Match Center</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="shadow-card border-border-custom overflow-hidden">
          <CardHeader className="border-b border-muted bg-muted/5">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-muted">
                {players.slice(0, 4).map((p, i) => (
                   <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-black text-text-light/30">{i + 1}</span>
                         <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                            {p.name[0]}
                         </div>
                         <div>
                            <p className="text-sm font-black text-primary group-hover:text-accent transition-colors">{p.name}</p>
                            <p className="text-[10px] font-bold text-text-light uppercase">{p.stats.cricket.matches > 0 ? 'Cricket' : 'Football'}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-black text-primary">
                            {p.stats.cricket.matches > 0 ? p.stats.cricket.runs : p.stats.football.goals}
                         </p>
                         <p className="text-[9px] font-bold text-text-light uppercase">{p.stats.cricket.matches > 0 ? 'Runs' : 'Goals'}</p>
                      </div>
                   </div>
                ))}
             </div>
             <div className="p-4 bg-muted/10">
                <Button variant="link" className="w-full text-xs font-black uppercase text-primary tracking-widest p-0 h-auto">
                   View Full Leaderboard <ArrowRight size={14} className="ml-2" />
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="shadow-card border-border-custom p-6">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-6">Match Frequency (Last 6 Months)</h4>
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Jan', matches: 12 },
                  { name: 'Feb', matches: 19 },
                  { name: 'Mar', matches: 15 },
                  { name: 'Apr', matches: 22 },
                  { name: 'May', matches: 30 },
                  { name: 'Jun', matches: 25 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} fontWeight="bold" tick={{fill: '#4A4A4A'}} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} fontWeight="bold" tick={{fill: '#4A4A4A'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="matches" fill="#0F172A" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </Card>

          <Card className="shadow-card border-border-custom overflow-hidden">
            <CardHeader className="border-b border-muted">
               <CardTitle className="text-xs font-black text-primary uppercase tracking-widest">Academy News Feed</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               {[
                 { title: "Tournament Registration Open", desc: "Summer Cup 2026 registration is now open.", type: "news" },
                 { title: "Weekly Performance Review", desc: "Coaches have updated the latest training logs.", type: "news" },
                 { title: "New Training Facility", desc: "Academy Indoor Court B is now open for bookings.", type: "news" }
               ].map((event, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-muted/20 border border-muted/50">
                     <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-accent" />
                     <div>
                        <p className="text-xs font-black text-primary uppercase tracking-tight">{event.title}</p>
                        <p className="text-xs text-text-light font-medium mt-1">{event.desc}</p>
                     </div>
                  </div>
               ))}
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

function PlayerDashboard({ player, matches }: { player: Player, matches: Match[] }) {
  const navigate = useNavigate();
  
  const personalStats = React.useMemo(() => {
    const stats: { label: string, value: any, icon: any }[] = [];
    if (player.stats.cricket.matches > 0) {
      stats.push({ label: 'Cricket Runs', value: player.stats.cricket.runs, icon: Trophy });
      stats.push({ label: 'Avg Strike Rate', value: player.stats.cricket.strikeRate, icon: Activity });
    }
    if (player.stats.football.matches > 0) {
      stats.push({ label: 'Football Goals', value: player.stats.football.goals, icon: Target });
      stats.push({ label: 'Total Assists', value: player.stats.football.assists, icon: TrendingUp });
    }
    if (player.stats.badminton.matches > 0) {
      stats.push({ label: 'Badminton Wins', value: player.stats.badminton.wins, icon: Award });
      stats.push({ label: 'Win Rate', value: `${player.stats.badminton.winRate}%`, icon: TrendingUp });
    }
    return stats;
  }, [player]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight uppercase">My <span className="text-accent">Athlete Dashboard</span></h1>
          <p className="text-text-light text-sm font-bold opacity-60">Track your personal development and academy progress.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate(`/players/${player.id}`)}
            className="bg-primary text-secondary hover:bg-primary/90 font-black uppercase text-xs tracking-widest h-12 px-8"
          >
            Submit Match Score
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {personalStats.map((stat, i) => (
          <Card key={i} className="shadow-card border-border-custom bg-white">
            <CardContent className="p-6">
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/5 text-primary">
                     <stat.icon size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-text-light uppercase tracking-widest">{stat.label}</p>
                     <p className="text-2xl font-black text-primary">{stat.value}</p>
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
        {/* Placeholder for unified stats */}
        <Card className="shadow-card border-border-custom bg-primary text-secondary">
          <CardContent className="p-6">
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/10">
                   <Users size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-secondary/60 uppercase tracking-widest">Academy Status</p>
                   <p className="text-2xl font-black">{player.joinedDate ? 'Active' : 'Pending'}</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Performance Chart */}
         <Card className="lg:col-span-2 shadow-card border-border-custom p-8">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-8">Personal Performance Trend</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { name: 'Wk 1', score: 10 },
                  { name: 'Wk 2', score: 25 },
                  { name: 'Wk 3', score: 12 },
                  { name: 'Wk 4', score: 40 },
                  { name: 'Wk 5', score: 35 },
                  { name: 'Wk 6', score: 55 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#0F172A" strokeWidth={4} dot={{ r: 4, fill: '#0F172A' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
         </Card>

         {/* Upcoming Personal Match */}
         <Card className="shadow-card border-border-custom bg-secondary/30 flex flex-col">
            <CardHeader className="border-b border-primary/10">
               <CardTitle className="text-xs font-black text-primary uppercase tracking-widest">Next Feature Match</CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex-1 flex flex-col justify-center text-center space-y-6">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-primary/5">
                  <CalendarIcon size={32} className="text-primary" />
               </div>
               <div>
                  <h5 className="text-lg font-black text-primary tracking-tight">Inter-Club Qualifier</h5>
                  <p className="text-xs font-bold text-text-light uppercase mt-1">Saturday, April 25th • 10:00 AM</p>
               </div>
               <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-text-light px-2">
                     <span>Sport</span>
                     <span className="text-primary uppercase">Football</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-text-light px-2">
                     <span>Venue</span>
                     <span className="text-primary uppercase">Main Academy Turf</span>
                  </div>
               </div>
               <Button className="w-full bg-primary text-secondary font-black uppercase text-xs h-12">View Details</Button>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Recent Submissions */}
         <Card className="shadow-card border-border-custom overflow-hidden">
            <CardHeader className="border-b border-muted bg-muted/5 flex flex-row items-center justify-between">
               <CardTitle className="text-xs font-black text-primary uppercase tracking-widest">Score Submissions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-muted">
                  {[
                    { title: "Friendly v Titans", date: "Apr 18", status: "pending" },
                    { title: "Weekend Knockout", date: "Apr 12", status: "approved" }
                  ].map((sub, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/10">
                       <div className="flex items-center gap-3">
                          <Clock size={16} className="text-primary/40" />
                          <div>
                             <p className="text-xs font-black text-primary">{sub.title}</p>
                             <p className="text-[9px] font-bold text-text-light uppercase">{sub.date}</p>
                          </div>
                       </div>
                       <Badge className={cn(
                         "text-[8px] font-black uppercase tracking-widest",
                         sub.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                       )}>
                          {sub.status}
                       </Badge>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>

         {/* Academy News Feed */}
         <Card className="shadow-card border-border-custom overflow-hidden">
            <CardHeader className="border-b border-muted bg-muted/5">
               <CardTitle className="text-xs font-black text-primary uppercase tracking-widest">Academy News Feed</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
               {[
                 { title: "Summer Cup 2026", date: "Apr 20", desc: "Registration is now open for all categories." },
                 { title: "New Training Times", date: "Apr 19", desc: "Monday sessions shifted to 4:00 PM." }
               ].map((news, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border-custom bg-secondary/20">
                     <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black text-primary uppercase">{news.title}</p>
                        <span className="text-[8px] font-bold text-text-light">{news.date}</span>
                     </div>
                     <p className="text-[10px] font-medium text-text-light line-clamp-1">{news.desc}</p>
                  </div>
               ))}
            </CardContent>
         </Card>

         {/* Training Tips */}
         <Card className="shadow-card border-border-custom overflow-hidden bg-primary text-secondary p-8">
            <CardHeader className="p-0 mb-6">
               <CardTitle className="text-xs font-black uppercase tracking-widest text-accent flex items-center gap-2 underline underline-offset-4">
                  <Activity size={16} /> Performance Tip
               </CardTitle>
            </CardHeader>
            <div className="space-y-4">
               <h4 className="text-xl font-black leading-tight tracking-tight">Improve your reaction time with "Shadow Training".</h4>
               <p className="text-sm font-medium opacity-70">Mimic your sport's key movements without the ball to build muscle memory and speed accuracy.</p>
               <Button variant="outline" className="border-white/20 text-white font-black uppercase text-[10px] h-10 hover:bg-white/10">Read Guide</Button>
            </div>
         </Card>
      </div>
    </div>
  );
}

function PublicDashboard({ players, matches }: { players: Player[], matches: Match[] }) {
  const liveMatches = matches.filter(m => m.status === 'live');
  
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <section className="relative h-[400px] rounded-[40px] overflow-hidden flex items-center justify-center text-center p-8">
         <div className="absolute inset-0 bg-primary" />
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
         <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent" />
         
         <div className="relative z-10 max-w-3xl space-y-6">
            <Badge className="bg-accent text-primary font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full text-[10px]">Academy Portal</Badge>
            <h1 className="text-5xl md:text-7xl font-black text-secondary tracking-tighter uppercase italic leading-none">
              Elite <span className="text-accent">Academy</span> Performance
            </h1>
            <p className="text-secondary/70 text-lg font-medium max-w-xl mx-auto">
              Track live matches, athlete statistics, and academy updates in real-time. Join the future of sports excellence.
            </p>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-primary uppercase tracking-widest flex items-center gap-3">
              <Activity className="text-accent" /> Live Matches
            </h2>
            <Link to="/schedule">
              <Button variant="link" className="text-xs font-black uppercase tracking-widest text-primary p-0">Full Schedule <ArrowRight size={14} className="ml-1" /></Button>
            </Link>
          </div>

          {liveMatches.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {liveMatches.map(match => (
                <Link key={match.id} to={`/matches/${match.id}`} className="block">
                  <Card className="shadow-2xl border-border-custom bg-white overflow-hidden group hover:border-accent transition-all cursor-pointer">
                    <div className="bg-red-600 p-2 text-center">
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live Now
                      </span>
                    </div>
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left flex-1">
                          <p className="text-[10px] font-black text-text-light/40 uppercase mb-2">Category: {match.sport}</p>
                          <h3 className="text-2xl font-black text-primary underline decoration-accent decoration-4 underline-offset-8">{match.title}</h3>
                        </div>
                        
                        <div className="flex items-center gap-8 text-center px-8 py-4 bg-secondary/10 rounded-3xl border border-primary/5">
                          <div>
                            <p className="text-4xl font-black text-primary">
                              {match.sport === 'football' ? (match.score as any).team1.goals : (match.score as any).team1.runs}
                            </p>
                            <p className="text-[9px] font-black text-text-light uppercase tracking-widest opacity-40">Home</p>
                          </div>
                          <div className="text-xl font-black text-text-light/20 italic tracking-tighter">VS</div>
                          <div>
                            <p className="text-4xl font-black text-primary">
                              {match.sport === 'football' ? (match.score as any).team2.goals : (match.score as any).team2.runs}
                            </p>
                            <p className="text-[9px] font-black text-text-light uppercase tracking-widest opacity-40">Away</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="shadow-lg border-dashed border-2 border-muted bg-white/50 p-12 text-center rounded-[30px]">
               <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity size={24} className="text-text-light/40" />
               </div>
               <p className="text-sm font-black text-text-light/40 uppercase tracking-widest">No Matches Underway</p>
               <p className="text-xs font-bold text-text-light/30 mt-1 italic">Check the upcoming schedule for next kickoff</p>
            </Card>
          )}

          <div className="pt-8">
            <h2 className="text-xl font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-3">
              <Trophy className="text-accent" /> Academy Leaders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {players.slice(0, 3).map((player, i) => (
                <Card key={player.id} className="border-border-custom shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <span className="text-6xl font-black text-primary">0{i+1}</span>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-primary flex items-center justify-center text-secondary font-black text-lg skew-x-[-12deg]">
                      {player.name[0]}
                    </div>
                    <div>
                      <p className="text-lg font-black text-primary tracking-tight">{player.name}</p>
                      <p className="text-[10px] font-black text-text-light uppercase tracking-widest italic">{player.primarySport}</p>
                    </div>
                    <div className="pt-4 border-t border-muted/50 flex justify-between items-end">
                      <div>
                        <p className="text-2xl font-black text-primary">
                          {player.stats.football.goals || player.stats.cricket.runs || 0}
                        </p>
                        <p className="text-[9px] font-bold text-text-light uppercase tracking-widest opacity-40">Performance</p>
                      </div>
                      <Link to={`/players/${player.id}`}>
                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-accent hover:text-primary"><ExternalLink size={16} /></Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-3">
              <Plus className="text-accent" /> Academy News
            </h2>
            <Card className="border-border-custom shadow-card overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-muted">
                  {[
                    { title: "Training Logs Updated", date: "May 12", excerpt: "Check your personal development scores in player portal." },
                    { title: "Inter-Academy Cup", date: "May 10", excerpt: "Rimon Sports confirms participation in the Summer Series." },
                    { title: "Kit Distribution", date: "May 08", excerpt: "New training kits available in the admin office." },
                    { title: "Academy Open Day", date: "May 05", excerpt: "Public scouting session scheduled for next Sunday." }
                  ].map((news, i) => (
                    <div key={i} className="p-6 hover:bg-muted/5 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20">{news.date}</Badge>
                        <ArrowRight size={14} className="text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </div>
                      <h4 className="text-sm font-black text-primary uppercase mb-1">{news.title}</h4>
                      <p className="text-[11px] font-medium text-text-light/60 line-clamp-2 italic leading-relaxed">{news.excerpt}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary p-8 rounded-[30px] shadow-2xl relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 p-8 opacity-10 blur-xl group-hover:blur-none transition-all duration-700">
               <Trophy size={160} className="text-accent" />
            </div>
            <div className="relative z-10 space-y-6">
               <h3 className="text-2xl font-black text-secondary tracking-tighter uppercase leading-none italic">
                 Join the <br/><span className="text-accent">Professional</span> Pathway
               </h3>
               <p className="text-secondary/60 text-xs font-medium italic">
                 Enroll in the country's most advanced athletic development program.
               </p>
               <Button className="w-full bg-accent text-primary font-black uppercase text-[10px] tracking-widest h-12 rounded-xl group-hover:scale-105 transition-transform">
                 Apply for Membership
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
  const [currentPlayer, setCurrentPlayer] = React.useState<Player | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { user, profile } = useAuth();

  React.useEffect(() => {
    const unsubPlayers = dataService.getPlayers(setPlayers);
    const unsubMatches = dataService.getMatches(setMatches);
    
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
    return <PlayerDashboard player={currentPlayer} matches={matches} />;
  }

  return <ManagementDashboard players={players} matches={matches} />;
}
