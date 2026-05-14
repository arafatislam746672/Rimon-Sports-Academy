import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  ChevronLeft,
  Activity as ActivityIcon,
  Target,
  Medal,
  Clock,
  User,
  Star,
  CheckCircle2,
  Award,
  ChevronRight,
  Info,
  Upload,
  Camera,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Workflow,
  Share2
} from 'lucide-react';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataService } from '@/services/dataService';
import { Player, Match, Attendance, Sport } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [playerMatches, setPlayerMatches] = React.useState<Match[]>([]);
  const [playerAttendance, setPlayerAttendance] = React.useState<Attendance[]>([]);
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const { profile } = useAuth();
  
  const [submissionForm, setSubmissionForm] = React.useState({
    sport: 'cricket' as Sport,
    title: '',
    date: new Date().toISOString().split('T')[0],
    proofURL: '',
    stats: {
      playerRuns: 0,
      playerWickets: 0,
      playerGoals: 0,
      playerAssists: 0,
      isWinner: false
    }
  });

  const isOwner = React.useMemo(() => {
    return profile?.role === 'management' || (profile?.role === 'player' && profile.playerId === id);
  }, [profile, id]);

  const handleSubmitScore = async () => {
    if (!profile || !id) return;
    try {
      await dataService.submitMatchStats({
        playerId: id,
        sport: submissionForm.sport,
        matchTitle: submissionForm.title,
        matchDate: submissionForm.date,
        proofURL: submissionForm.proofURL,
        scoreData: submissionForm.stats
      });
      toast.success("Match stats submitted for approval!");
      setShowSubmitModal(false);
    } catch (error) {
      toast.error("Failed to submit stats.");
    }
  };

  React.useEffect(() => {
    if (!id) return;
    const unsubPlayer = dataService.getPlayer(id, (data) => {
      setPlayer(data);
      setLoading(false);
    });
    
    const unsubMatches = dataService.getPlayerMatches(id, setPlayerMatches);
    const unsubAttendance = dataService.getPlayerAttendance(id, setPlayerAttendance);
    
    return () => {
      unsubPlayer();
      unsubMatches();
      unsubAttendance();
    };
  }, [id]);

  const activities = React.useMemo(() => {
    const combined: any[] = [];
    
    playerMatches.forEach(match => {
      combined.push({
        id: `match-${match.id}`,
        type: 'match',
        title: `${(match.sport || 'cricket').toUpperCase()} Match: ${match.title}`,
        date: new Date(match.date),
        description: match.status === 'completed' ? 'Participated in a competitive match' : 'Scheduled for upcoming match',
        icon: <Trophy size={16} className="text-white" />,
        color: 'bg-indigo-500'
      });
    });
    
    playerAttendance.forEach(att => {
      combined.push({
        id: `att-${att.id}`,
        type: 'training',
        title: 'Training Session Attended',
        date: new Date(att.date),
        description: 'Successfully attended regular academy training',
        icon: <CheckCircle2 size={16} className="text-white" />,
        color: 'bg-emerald-500'
      });
    });
    
    if (player) {
      combined.push({
        id: 'award-1',
        type: 'award',
        title: 'Player of the Month',
        date: new Date('2026-03-31'),
        description: 'Recognized for outstanding performance and conduct',
        icon: <Award size={16} className="text-white" />,
        color: 'bg-amber-500'
      });
    }
    
    return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [playerMatches, playerAttendance, player]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-[12px] h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Personnel Not Found</h2>
        <Button 
          variant="outline" 
          className="mt-6 border-slate-200 text-slate-900 font-black h-14 px-10 rounded-[20px] uppercase text-[10px] tracking-widest"
          onClick={() => navigate('/players')}
        >
          <ChevronLeft size={18} className="mr-3" />
          Back to Roster
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header / Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/players')}
            className="rounded-2xl h-14 w-14 border border-slate-100 text-slate-900 group hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3 leading-none">
              Asset <span className="text-indigo-500">Dossier</span>
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
               Active Since {new Date(player.joinedDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Col: Info Card */}
        <div className="lg:col-span-1 space-y-10">
          <Card className="elite-card border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white rounded-[48px]">
            <div className="h-40 bg-slate-900 relative">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
               <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />
            </div>
            <CardContent className="p-0 text-center relative pt-20">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                <div className="relative group">
                  <Avatar className="w-40 h-40 border-[8px] border-white shadow-2xl rounded-[40px] bg-slate-50">
                    <AvatarImage src={player.photoURL} alt={player.name} className="object-cover" />
                    <AvatarFallback className="bg-indigo-50 text-indigo-500 font-black text-4xl">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 p-3 bg-indigo-500 text-white rounded-2xl border-4 border-white shadow-2xl">
                    <ShieldCheck size={20} className="fill-white/20" />
                  </div>
                </div>
              </div>

              <div className="px-10 pb-10 space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{player.name}</h3>
                  <Badge className={cn(
                    "mt-4 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-none shadow-lg shadow-indigo-100",
                    player.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  )}>
                    {player.status || 'Verified Academy Resident'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-8 border-y border-slate-50">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Asset Age</p>
                    <p className="text-2xl font-black text-slate-900 italic">{player.age || '18'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Primary Track</p>
                    <p className="text-2xl font-black text-slate-900 italic capitalize">
                       {player.primarySport || 'Cricket'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500">
                      <Clock size={18} />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Operational Status</p>
                       <p className="text-xs font-black text-slate-900 uppercase italic">Ready for Deployment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-500">
                      <Star size={18} className="fill-amber-500/20" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">MVP Vector</p>
                       <p className="text-xs font-black text-slate-900 uppercase italic">High Performance Eligible</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-slate-900 text-white font-black h-16 rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-indigo-600 transition-all active:scale-95 uppercase tracking-widest text-[10px] italic"
                  onClick={() => isOwner ? setShowSubmitModal(true) : toast.error("Only the authorized asset or command can submit data.")}
                >
                  {isOwner ? 'Transmit Match Intel' : 'Open Channel'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[48px] overflow-hidden">
            <CardHeader className="p-10 border-b border-slate-50">
              <CardTitle className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3 italic">
                <Trophy size={18} className="text-amber-500" />
                Strategic Awards
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-4">
              <div className="flex items-center gap-5 p-5 rounded-[28px] bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <Medal size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight italic">Player of the Period</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Q1 - 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-5 p-5 rounded-[28px] bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight italic">Century Asset Club</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">100+ Operations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Stats & Details */}
        <div className="lg:col-span-2 space-y-10">
          <Tabs defaultValue="overview" className="w-full">
            <Card className="border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white rounded-[48px]">
              <CardHeader className="p-2 border-b border-slate-50 bg-slate-50/50">
                <TabsList className="w-full bg-transparent h-16 grid grid-cols-4 gap-2">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-2xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest py-3 border border-transparent data-[state=active]:border-slate-100 transition-all italic"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity" 
                    className="rounded-2xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest py-3 border border-transparent data-[state=active]:border-slate-100 transition-all italic"
                  >
                    Log Feed
                  </TabsTrigger>
                  <TabsTrigger 
                    value="stats" 
                    className="rounded-2xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest py-3 border border-transparent data-[state=active]:border-slate-100 transition-all italic"
                  >
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="rounded-2xl data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest py-3 border border-transparent data-[state=active]:border-slate-100 transition-all italic"
                  >
                    Operational
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="p-10">
                <TabsContent value="overview" className="mt-0 space-y-12 focus-visible:outline-none">
                  {/* Performance Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="p-8 rounded-[36px] bg-slate-900 text-white shadow-2xl relative overflow-hidden group"
                    >
                      <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                         <ActivityIcon size={120} />
                      </div>
                      <ActivityIcon size={32} className="text-indigo-400 mb-6 relative z-10" />
                      <div className="relative z-10">
                        <p className="text-5xl font-black tracking-tighter italic leading-none mb-2">
                           {(player.stats.cricket?.matches || 0) + (player.stats.football?.matches || 0) + (player.stats.badminton?.matches || 0)}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Total Deployments</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 space-y-6 group"
                    >
                      <Target size={32} className="text-indigo-500 relative z-10 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none mb-2">
                           {player.stats.cricket?.runs || player.stats.football?.goals || player.stats.badminton?.wins || 0}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Prime Multiplier</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="p-8 rounded-[36px] bg-slate-50 border border-slate-100 space-y-6 group"
                    >
                      <Clock size={32} className="text-emerald-500 relative z-10 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none mb-2">98%</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reliability Index</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Sport Specific Quick Stats */}
                  <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                       <Workflow size={16} className="text-indigo-500" /> Track Performance Matrix
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {player.stats.cricket && (player.stats.cricket.matches > 0 || player.primarySport === 'cricket') && (
                        <div className="p-8 rounded-[36px] border border-slate-100 bg-white shadow-xl space-y-6 group hover:border-indigo-200 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-indigo-500" /> Cricket Track
                            </span>
                            <Badge className="bg-slate-900 text-white text-[8px] font-black px-3">ELITE</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-black text-slate-900 italic">{player.stats.cricket.runs}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Runs</p>
                            </div>
                            <div className="text-center">
                               <p className="text-2xl font-black text-slate-900 italic">{player.stats.cricket.wickets}</p>
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Wkts</p>
                            </div>
                            <div className="text-center">
                               <p className="text-2xl font-black text-slate-900 italic">{player.stats.cricket.average || '0'}</p>
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Avg</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {player.stats.football && (player.stats.football.matches > 0 || player.primarySport === 'football') && (
                        <div className="p-8 rounded-[36px] border border-slate-100 bg-white shadow-xl space-y-6 group hover:border-indigo-200 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-emerald-500" /> Football Track
                            </span>
                            <Badge className="bg-slate-900 text-white text-[8px] font-black px-3">ELITE</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-black text-slate-900 italic">{player.stats.football.goals}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Goals</p>
                            </div>
                            <div className="text-center">
                               <p className="text-2xl font-black text-slate-900 italic">{player.stats.football.assists}</p>
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Assists</p>
                            </div>
                            <div className="text-center">
                               <p className="text-2xl font-black text-slate-900 italic">{player.stats.football.matches}</p>
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Apps</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-0 focus-visible:outline-none">
                  <div className="relative pl-10 space-y-10 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-1 before:bg-slate-100 before:rounded-full">
                    {activities.map((activity, idx) => (
                      <motion.div 
                        key={activity.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative group"
                      >
                        <div className={cn(
                          "absolute -left-[43px] top-0 w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl z-10 group-hover:scale-110 transition-transform duration-300",
                          activity.color
                        )}>
                          {activity.icon}
                        </div>
                        <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-slate-200/50 transition-all">
                          <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2 leading-none">
                            {activity.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <h5 className="text-base font-black text-slate-900 uppercase tracking-tight italic mb-1">{activity.title}</h5>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide opacity-60 leading-relaxed">{activity.description}</p>
                        </div>
                      </motion.div>
                    ))}
                    {activities.length === 0 && (
                      <div className="py-20 text-center flex flex-col items-center gap-6">
                         <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-200">
                            <Info size={40} />
                         </div>
                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] italic">No operational logs recorded</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="mt-0 focus-visible:outline-none">
                  <div className="py-32 text-center flex flex-col items-center gap-8">
                    <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center text-indigo-200 animate-pulse">
                      <TrendingUp size={48} />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Advanced Performance Analytics</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Quantum Data Processor Offline</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0 focus-visible:outline-none">
                   <div className="space-y-6">
                     {playerMatches.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((match) => (
                       <button
                         key={match.id}
                         onClick={() => setSelectedMatch(match)}
                         className="w-full group relative"
                       >
                         <div className="flex items-center justify-between p-6 rounded-[32px] border border-slate-100 bg-white hover:bg-indigo-50/30 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all text-left">
                           <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                               <Trophy size={28} />
                             </div>
                             <div>
                               <p className="text-lg font-black text-slate-900 uppercase tracking-tight italic leading-tight">{match.title}</p>
                               <div className="flex items-center gap-3 mt-1.5">
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                   {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                 </span>
                                 <div className="w-1 h-1 rounded-full bg-slate-200" />
                                 <Badge className="bg-slate-900 text-white text-[8px] font-black tracking-widest uppercase py-0.5 px-2 rounded-full">
                                   {match.sport}
                                 </Badge>
                               </div>
                             </div>
                           </div>
                           <div className="flex items-center gap-8">
                             <div className="text-right hidden sm:block">
                               <Badge 
                                 className={cn(
                                   "text-[9px] font-black uppercase tracking-widest border-none px-4 py-1.5 rounded-full shadow-lg",
                                   match.status === 'completed' ? 'bg-emerald-500 text-white shadow-emerald-100' : 
                                   match.status === 'live' ? 'bg-red-500 text-white shadow-red-100 animate-pulse' : 
                                   'bg-blue-500 text-white shadow-blue-100'
                                 )}
                               >
                                 {match.status}
                               </Badge>
                             </div>
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                <ChevronRight size={20} />
                             </div>
                           </div>
                         </div>
                       </button>
                     ))}
                     {playerMatches.length === 0 && (
                       <div className="py-20 text-center flex flex-col items-center gap-6">
                         <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center text-slate-200">
                            <Trophy size={40} />
                         </div>
                         <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] italic">No operational history found</p>
                       </div>
                     )}
                   </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>

      {/* Match Detail Modal - Redesign needed but keeping for logic */}
      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <DialogContent className="sm:max-w-[550px] bg-white border-none rounded-[48px] p-0 overflow-hidden shadow-2xl">
          {selectedMatch && (
            <>
              <div className="bg-slate-900 p-12 text-white relative">
                 <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Trophy size={160} />
                 </div>
                 <div className="relative z-10 space-y-4">
                    <Badge className="bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full border-none shadow-lg shadow-indigo-500/20">
                       {selectedMatch.sport} Operational Audit
                    </Badge>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">{selectedMatch.title}</h2>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                       <Calendar size={14} className="text-indigo-400" />
                       {new Date(selectedMatch.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                 </div>
              </div>

              <div className="p-12 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Network Status
                    </h4>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500">
                        <ActivityIcon size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase italic leading-none">{selectedMatch.status}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit Phase</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-200" /> Asset Role
                    </h4>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-500">
                        <Star size={20} className="fill-amber-500/20" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase italic leading-none">Field Command</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Elite Matrix</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-200/50 space-y-10 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                      <ShieldCheck size={120} />
                   </div>
                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3 italic leading-none">
                     <Medal size={18} className="text-amber-500" />
                     Verified Matrix Results
                   </h4>
                   
                   {selectedMatch.sport === 'cricket' && (
                     <div className="space-y-6">
                       <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
                         <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black italic">A</div>
                            <p className="text-3xl font-black text-slate-900 italic">{(selectedMatch.score as any).team1?.runs}<span className="text-slate-200 mx-1">/</span>{(selectedMatch.score as any).team1?.wickets}</p>
                         </div>
                         <div className="text-xl font-black text-slate-200 italic tracking-[0.3em]">VS</div>
                         <div className="flex flex-col items-center gap-2 text-right">
                             <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-black italic">B</div>
                             <p className="text-3xl font-black text-slate-900 italic">{(selectedMatch.score as any).team2?.runs}<span className="text-slate-200 mx-1">/</span>{(selectedMatch.score as any).team2?.wickets}</p>
                         </div>
                       </div>
                       <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest bg-white/50 backdrop-blur-md border border-slate-100 rounded-full py-2.5 shadow-inner italic">
                          {(selectedMatch.score as any).team1?.overs}.{(selectedMatch.score as any).team1?.balls} Delivery Cycles Executed
                       </p>
                     </div>
                   )}

                   {selectedMatch.sport === 'football' && (
                     <div className="space-y-10">
                        <div className="flex items-center justify-center gap-12 bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl">
                           <div className="text-center space-y-2">
                              <p className="text-6xl font-black text-slate-900 italic leading-none">{(selectedMatch.score as any).team1?.goals}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SQUAD ALPHA</p>
                           </div>
                           <div className="text-3xl font-black text-slate-100 italic">—</div>
                           <div className="text-center space-y-2">
                              <p className="text-6xl font-black text-slate-300 italic leading-none">{(selectedMatch.score as any).team2?.goals}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">OPPOSITION</p>
                           </div>
                        </div>
                        <div className="flex justify-center">
                           <Badge className="bg-slate-900 text-white border-none text-[9px] font-black tracking-widest uppercase px-6 py-1.5 rounded-full shadow-xl shadow-slate-900/20">FULL PROTOCOL COMPLETE</Badge>
                        </div>
                     </div>
                   )}

                   {selectedMatch.sport === 'badminton' && (
                     <div className="space-y-4">
                        {(selectedMatch.score as any).sets?.map((set: any, i: number) => (
                           <div key={i} className="flex justify-between items-center py-5 px-8 bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 group hover:border-indigo-100 transition-all">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Operational Set {i+1}</span>
                              <div className="flex gap-6 font-black italic text-xl">
                                 <span className={cn(set.player1 > set.player2 ? "text-indigo-600" : "text-slate-200")}>{set.player1}</span>
                                 <span className="text-slate-100">—</span>
                                 <span className={cn(set.player2 > set.player1 ? "text-indigo-600" : "text-slate-200")}>{set.player2}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    variant="ghost"
                    className="flex-1 rounded-[24px] h-16 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50"
                    onClick={() => setSelectedMatch(null)}
                  >
                    Archive Intel
                  </Button>
                  <Button className="flex-1 bg-slate-900 text-white font-black rounded-[24px] h-16 uppercase text-[10px] tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-95 italic">
                    <Share2 size={18} className="mr-3" /> Transmit Stats
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Submission Modal - Redesign needed */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-[550px] bg-white border-none rounded-[48px] p-0 overflow-hidden shadow-2xl">
           <div className="bg-slate-900 p-12 text-white relative">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                 <Upload size={120} />
              </div>
              <div className="relative z-10 space-y-4">
                 <Badge className="bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full border-none shadow-lg shadow-indigo-500/20">
                    Data Transmission Portal
                 </Badge>
                 <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Submit Audit Score</h2>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed max-w-[300px]">
                    Verify operational results with digital proof for academy validation.
                 </p>
              </div>
           </div>
           
           <div className="p-12 space-y-10 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Vertical Track</label>
                       <select 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase italic outline-none focus:border-indigo-500 transition-all appearance-none shadow-inner"
                         value={submissionForm.sport}
                         onChange={(e) => setSubmissionForm({...submissionForm, sport: e.target.value as Sport})}
                       >
                          <option value="cricket">Cricket</option>
                          <option value="football">Football</option>
                          <option value="badminton">Badminton</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Mission Date</label>
                       <input 
                         type="date"
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-indigo-500 transition-all shadow-inner"
                         value={submissionForm.date}
                         onChange={(e) => setSubmissionForm({...submissionForm, date: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Mission Designation</label>
                    <input 
                      placeholder="e.g. ACADEMY ELITE CUP G1"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black uppercase italic outline-none focus:border-indigo-500 transition-all shadow-inner"
                      value={submissionForm.title}
                      onChange={(e) => setSubmissionForm({...submissionForm, title: e.target.value})}
                    />
                 </div>

                 <div className="p-8 rounded-[40px] bg-slate-50/50 border border-slate-100 space-y-6">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-3">
                       <ArrowRight size={14} className="text-indigo-500" /> Individual Asset Metrics
                    </h4>
                    {submissionForm.sport === 'cricket' && (
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Runs Accumulated</span>
                             <input 
                               type="number" 
                               className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-base font-black italic shadow-xl shadow-slate-100" 
                               value={submissionForm.stats.playerRuns}
                               onChange={(e) => setSubmissionForm({...submissionForm, stats: {...submissionForm.stats, playerRuns: parseInt(e.target.value)}})}
                             />
                          </div>
                          <div className="space-y-2">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Wickets Neutralized</span>
                             <input 
                               type="number" 
                               className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-base font-black italic shadow-xl shadow-slate-100" 
                               value={submissionForm.stats.playerWickets}
                               onChange={(e) => setSubmissionForm({...submissionForm, stats: {...submissionForm.stats, playerWickets: parseInt(e.target.value)}})}
                             />
                          </div>
                       </div>
                    )}
                    {submissionForm.sport === 'football' && (
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Goals Secured</span>
                             <input 
                               type="number" 
                               className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-base font-black italic shadow-xl shadow-slate-100" 
                               value={submissionForm.stats.playerGoals}
                               onChange={(e) => setSubmissionForm({...submissionForm, stats: {...submissionForm.stats, playerGoals: parseInt(e.target.value)}})}
                             />
                          </div>
                          <div className="space-y-2">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tactical Assists</span>
                             <input 
                               type="number" 
                               className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-base font-black italic shadow-xl shadow-slate-100" 
                               value={submissionForm.stats.playerAssists}
                               onChange={(e) => setSubmissionForm({...submissionForm, stats: {...submissionForm.stats, playerAssists: parseInt(e.target.value)}})}
                             />
                          </div>
                       </div>
                    )}
                    {submissionForm.sport === 'badminton' && (
                       <div className="flex items-center gap-4 bg-white p-6 rounded-[28px] border border-slate-200 shadow-xl shadow-slate-100">
                          <div className="flex items-center gap-4">
                             <div className="relative flex items-center justify-center">
                               <input 
                                 type="checkbox" 
                                 id="win"
                                 className="w-6 h-6 rounded-lg accent-indigo-500 peer opacity-0 absolute cursor-pointer"
                                 checked={submissionForm.stats.isWinner}
                                 onChange={(e) => setSubmissionForm({...submissionForm, stats: {...submissionForm.stats, isWinner: e.target.checked}})}
                               />
                               <div className="w-6 h-6 rounded-lg border-2 border-slate-200 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 flex items-center justify-center transition-all">
                                  <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                               </div>
                             </div>
                             <label htmlFor="win" className="text-sm font-black text-slate-900 uppercase tracking-tight italic cursor-pointer">Mission Victory Secured</label>
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
                       <Camera size={14} /> Digital Asset Proof (URL)
                    </label>
                    <input 
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-xs font-medium outline-none focus:border-indigo-500 transition-all shadow-inner"
                      value={submissionForm.proofURL}
                      onChange={(e) => setSubmissionForm({...submissionForm, proofURL: e.target.value})}
                    />
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic ml-1 opacity-60">* Audit will proceed after visual verification</p>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-white/80 backdrop-blur-md py-6 border-t border-slate-100 -mx-12 px-12 z-20">
                 <Button 
                   variant="ghost" 
                   className="flex-1 rounded-[24px] h-16 font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50"
                   onClick={() => setShowSubmitModal(false)}
                 >
                    Abort Transmission
                 </Button>
                 <Button 
                   className="flex-1 bg-slate-900 text-white font-black rounded-[24px] h-16 uppercase text-[10px] tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-95 italic"
                   onClick={handleSubmitScore}
                 >
                    Initialize Verification
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
