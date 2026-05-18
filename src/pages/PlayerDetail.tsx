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
  Share2,
  MessageSquare,
  QrCode
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
import PerformanceSubmitModal from '@/components/PerformanceSubmitModal';

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
  
  const isOwner = React.useMemo(() => {
    return profile?.role === 'management' || (profile?.role === 'player' && profile.playerId === id);
  }, [profile, id]);

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
        icon: <Trophy size={16} className="text-primary-foreground" />,
        color: 'bg-accent'
      });
    });
    
    playerAttendance.forEach(att => {
      combined.push({
        id: `att-${att.id}`,
        type: 'training',
        title: 'Training Session Attended',
        date: new Date(att.date),
        description: 'Successfully attended regular academy training',
        icon: <CheckCircle2 size={16} className="text-primary-foreground" />,
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
        icon: <Award size={16} className="text-primary-foreground" />,
        color: 'bg-amber-500'
      });
    }
    
    return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [playerMatches, playerAttendance, player]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-[12px] h-10 w-10 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-foreground uppercase tracking-widest">Personnel Not Found</h2>
        <Button 
          variant="outline" 
          className="mt-6 border-border text-foreground font-black h-14 px-10 rounded-[20px] uppercase text-[10px] tracking-widest"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-border">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/players')}
            className="rounded-2xl h-14 w-14 border border-border text-foreground group hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                Asset <span className="text-accent">Dossier</span>
              </h2>
              <Badge className="bg-muted text-muted-foreground font-black border-none uppercase tracking-widest text-[9px] px-3 h-6 flex items-center">
                 ID: {player.academyId || player.id.slice(-6).toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
               Active Since {new Date(player.joinedDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Col: Info Card */}
        <div className="lg:col-span-1 space-y-10">
          <Card className="elite-card border-none shadow-2xl shadow-black/40 overflow-hidden bg-card rounded-[48px]">
            <div className="h-40 bg-primary relative">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
               <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
            </div>
            <CardContent className="p-0 text-center relative pt-20">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                <div className="relative group">
                  <Avatar className="w-40 h-40 border-[8px] border-border shadow-2xl rounded-[40px] bg-muted/30">
                    <AvatarImage src={player.photoURL} alt={player.name} className="object-cover" />
                    <AvatarFallback className="bg-accent/10 text-accent font-black text-4xl">
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 p-3 bg-accent text-primary-foreground rounded-2xl border-4 border-border shadow-2xl">
                    <ShieldCheck size={20} className="fill-white/20" />
                  </div>
                </div>
              </div>

              <div className="px-10 pb-10 space-y-8">
                <div>
                  <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase italic leading-none">{player.name}</h3>
                  <Badge className={cn(
                    "mt-4 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-none shadow-lg shadow-accent/10",
                    player.status === 'active' ? 'bg-emerald-500 text-primary-foreground' : 'bg-amber-500 text-primary-foreground'
                  )}>
                    {player.status || 'Verified Academy Resident'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-8 border-y border-border">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Asset Age</p>
                    <p className="text-2xl font-black text-foreground italic">{player.age || '18'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Primary Track</p>
                    <p className="text-2xl font-black text-foreground italic capitalize">
                       {player.primarySport === 'both' ? 'Multi-Discipline' : (player.primarySport || 'Cricket')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
                    <div className="w-10 h-10 rounded-xl bg-card shadow-sm flex items-center justify-center text-accent">
                      <Clock size={18} />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Operational Status</p>
                       <p className="text-xs font-black text-foreground uppercase italic">Ready for Deployment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
                    <div className="w-10 h-10 rounded-xl bg-card shadow-sm flex items-center justify-center text-amber-500">
                      <Star size={18} className="fill-amber-500/20" />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">MVP Vector</p>
                       <p className="text-xs font-black text-foreground uppercase italic">High Performance Eligible</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="w-full bg-muted text-foreground font-black h-16 rounded-2xl shadow-sm hover:bg-muted-foreground/40 transition-all active:scale-95 uppercase tracking-widest text-[9px] italic"
                    onClick={() => {
                      const phoneNumber = profile?.phone || '0123456789'; 
                      window.location.href = `sms:${phoneNumber}`;
                    }}
                  >
                    <MessageSquare size={16} className="mr-2" /> Send SMS
                  </Button>
                  <Button 
                    className="w-full bg-primary text-primary-foreground font-black h-16 rounded-2xl shadow-xl shadow-primary/10 hover:bg-primary transition-all active:scale-95 uppercase tracking-widest text-[9px] italic"
                    onClick={() => isOwner ? setShowSubmitModal(true) : toast.error("Only the authorized asset or command can submit data.")}
                  >
                    {isOwner ? 'Transmit Intel' : 'Transmit Meta'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Identification Card */}
          <Card className="border-none shadow-2xl shadow-black/40 bg-card rounded-[48px] overflow-hidden">
            <CardHeader className="p-10 border-b border-border">
               <CardTitle className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3 italic">
                <QrCode size={18} className="text-accent" />
                Digital ID Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 flex flex-col items-center space-y-6">
              <div className="p-6 bg-muted/30 rounded-[40px] border border-border shadow-inner group hover:scale-105 transition-transform duration-500">
                <QRCodeSVG 
                  value={window.location.href} 
                  size={150}
                  level="H"
                  includeMargin={false}
                  bgColor="transparent"
                  fgColor="#0f172a"
                />
              </div>
              <div className="text-center">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-2 italic">Scan to verify asset credentials</p>
                 <p className="text-xs font-black text-foreground uppercase italic">Authorized Academy Access ONLY</p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card className="border-none shadow-2xl shadow-black/40 bg-card rounded-[48px] overflow-hidden">
            <CardHeader className="p-10 border-b border-border">
              <CardTitle className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3 italic">
                <Trophy size={18} className="text-amber-500" />
                Strategic Awards
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-4">
              <div className="flex items-center gap-5 p-5 rounded-[28px] bg-muted/30 border border-border group hover:border-accent/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-primary-foreground shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <Medal size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground uppercase tracking-tight italic">Player of the Period</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Q1 - 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-5 p-5 rounded-[28px] bg-muted/30 border border-border group hover:border-accent/30 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-primary-foreground shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground uppercase tracking-tight italic">Century Asset Club</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">100+ Operations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Stats & Details */}
        <div className="lg:col-span-2 space-y-10">
          <Tabs defaultValue="overview" className="w-full">
            <Card className="border-none shadow-2xl shadow-black/40 overflow-hidden bg-card rounded-[48px]">
              <CardHeader className="p-2 border-b border-border bg-muted/20">
                <TabsList className="w-full bg-transparent h-16 grid grid-cols-4 gap-2">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-2xl data-[state=active]:bg-card data-[state=active]:text-accent data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest py-3 border border-transparent data-[state=active]:border-border transition-all italic"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity" 
                    className="rounded-2xl data-[state=active]:bg-card data-[state=active]:text-accent data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest py-3 border border-transparent data-[state=active]:border-border transition-all italic"
                  >
                    Log Feed
                  </TabsTrigger>
                  <TabsTrigger 
                    value="stats" 
                    className="rounded-2xl data-[state=active]:bg-card data-[state=active]:text-accent data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest py-3 border border-transparent data-[state=active]:border-border transition-all italic"
                  >
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="rounded-2xl data-[state=active]:bg-card data-[state=active]:text-accent data-[state=active]:shadow-lg font-black text-[10px] uppercase tracking-widest py-3 border border-transparent data-[state=active]:border-border transition-all italic"
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
                      className="p-8 rounded-[36px] bg-primary text-primary-foreground shadow-2xl relative overflow-hidden group"
                    >
                      <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                         <ActivityIcon size={120} />
                      </div>
                      <ActivityIcon size={32} className="text-accent/80 mb-6 relative z-10" />
                      <div className="relative z-10">
                        <p className="text-5xl font-black tracking-tighter italic leading-none mb-2">
                           {(player.stats.cricket?.matches || 0) + (player.stats.football?.matches || 0) + (player.stats.badminton?.matches || 0)}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/70">Total Deployments</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="p-8 rounded-[36px] bg-muted/30 border border-border space-y-6 group"
                    >
                      <Target size={32} className="text-accent relative z-10 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-5xl font-black text-foreground tracking-tighter italic leading-none mb-2">
                           {player.stats.cricket?.runs || player.stats.football?.goals || player.stats.badminton?.wins || 0}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Prime Multiplier</p>
                      </div>
                    </motion.div>

                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="p-8 rounded-[36px] bg-muted/30 border border-border space-y-6 group"
                    >
                      <Clock size={32} className="text-emerald-500 relative z-10 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-5xl font-black text-foreground tracking-tighter italic leading-none mb-2">98%</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Reliability Index</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Sport Specific Quick Stats */}
                  <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-3 italic">
                       <Workflow size={16} className="text-accent" /> Track Performance Matrix
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {player.stats.cricket && (player.stats.cricket.matches > 0 || player.primarySport === 'cricket' || player.primarySport === 'both') && (
                        <div className="p-8 rounded-[36px] border border-border bg-card shadow-xl space-y-6 group hover:border-accent/30 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-foreground uppercase tracking-widest italic flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-accent" /> Cricket Track
                            </span>
                            <Badge className="bg-primary text-primary-foreground text-[8px] font-black px-3">ELITE</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-black text-foreground italic">{player.stats.cricket.runs}</p>
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Runs</p>
                            </div>
                            <div className="text-center">
                               <p className="text-2xl font-black text-foreground italic">{player.stats.cricket.wickets}</p>
                               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Wkts</p>
                            </div>
                            <div className="text-center">
                               <p className="text-2xl font-black text-foreground italic">{player.stats.cricket.average || '0'}</p>
                               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Avg</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {player.stats.football && (player.stats.football.matches > 0 || player.primarySport === 'football' || player.primarySport === 'both') && (
                        <div className="p-8 rounded-[36px] border border-border bg-card shadow-xl space-y-6 group hover:border-accent/30 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-foreground uppercase tracking-widest italic flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-emerald-500" /> Football Track
                            </span>
                            <Badge className="bg-primary text-primary-foreground text-[8px] font-black px-3">ELITE</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-black text-foreground italic">{player.stats.football.goals}</p>
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Goals</p>
                            </div>
                            <div className="text-center">
                               <p className="text-2xl font-black text-foreground italic">{player.stats.football.assists}</p>
                               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Assists</p>
                            </div>
                            <div className="text-center">
                               <p className="text-2xl font-black text-foreground italic">{player.stats.football.matches}</p>
                               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Apps</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {(player.stats.badminton && (player.stats.badminton.matches > 0 || player.primarySport === 'badminton' || player.primarySport === 'both')) && (
                        <div className="p-8 rounded-[36px] border border-border bg-card shadow-xl space-y-6 group hover:border-accent/30 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-foreground uppercase tracking-widest italic flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-amber-500" /> Badminton Track
                            </span>
                            <Badge className="bg-primary text-primary-foreground text-[8px] font-black px-3">ELITE</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-black text-foreground italic">{player.stats.badminton.wins}</p>
                              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Wins</p>
                            </div>
                            <div className="text-center">
                               <p className="text-2xl font-black text-foreground italic">{player.stats.badminton.matches}</p>
                               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Matches</p>
                            </div>
                            <div className="text-center">
                               <p className="text-2xl font-black text-foreground italic">{player.stats.badminton.winRate || '0'}%</p>
                               <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Win Rate</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-0 focus-visible:outline-none">
                  <div className="relative pl-10 space-y-10 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-1 before:bg-muted before:rounded-full">
                    {activities.map((activity, idx) => (
                      <motion.div 
                        key={activity.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="relative group"
                      >
                        <div className={cn(
                          "absolute -left-[43px] top-0 w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-border shadow-xl z-10 group-hover:scale-110 transition-transform duration-300",
                          activity.color
                        )}>
                          {activity.icon}
                        </div>
                        <div className="p-6 rounded-[32px] bg-muted/30 border border-border group-hover:bg-card group-hover:shadow-2xl group-hover:shadow-black/40 transition-all">
                          <p className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-2 leading-none">
                            {activity.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <h5 className="text-base font-black text-foreground uppercase tracking-tight italic mb-1">{activity.title}</h5>
                          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wide opacity-60 leading-relaxed">{activity.description}</p>
                        </div>
                      </motion.div>
                    ))}
                    {activities.length === 0 && (
                      <div className="py-20 text-center flex flex-col items-center gap-6">
                         <div className="w-20 h-20 bg-muted/30 rounded-[24px] flex items-center justify-center text-foreground/80">
                            <Info size={40} />
                         </div>
                        <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] italic">No operational logs recorded</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="mt-0 focus-visible:outline-none">
                  <div className="py-32 text-center flex flex-col items-center gap-8">
                    <div className="w-24 h-24 bg-accent/10 rounded-[32px] flex items-center justify-center text-accent/30 animate-pulse">
                      <TrendingUp size={48} />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">Advanced Performance Analytics</h3>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Quantum Data Processor Offline</p>
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
                         <div className="flex items-center justify-between p-6 rounded-[32px] border border-border bg-card hover:bg-accent/20 hover:border-accent/10 hover:shadow-2xl hover:shadow-accent/10 transition-all text-left">
                           <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-primary-foreground transition-all shadow-inner">
                               <Trophy size={28} />
                             </div>
                             <div>
                               <p className="text-lg font-black text-foreground uppercase tracking-tight italic leading-tight">{match.title}</p>
                               <div className="flex items-center gap-3 mt-1.5">
                                 <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                                   {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                 </span>
                                 <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                 <Badge className="bg-primary text-primary-foreground text-[8px] font-black tracking-widest uppercase py-0.5 px-2 rounded-full">
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
                                   match.status === 'completed' ? 'bg-emerald-500 text-primary-foreground shadow-emerald-100' : 
                                   match.status === 'live' ? 'bg-red-500 text-primary-foreground shadow-red-100 animate-pulse' : 
                                   'bg-blue-500 text-primary-foreground shadow-blue-100'
                                 )}
                               >
                                 {match.status}
                               </Badge>
                             </div>
                             <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground/60 group-hover:bg-accent group-hover:text-primary-foreground transition-all transform group-hover:translate-x-1">
                                <ChevronRight size={20} />
                             </div>
                           </div>
                         </div>
                       </button>
                     ))}
                     {playerMatches.length === 0 && (
                       <div className="py-20 text-center flex flex-col items-center gap-6">
                         <div className="w-20 h-20 bg-muted/30 rounded-[24px] flex items-center justify-center text-foreground/80">
                            <Trophy size={40} />
                         </div>
                         <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] italic">No operational history found</p>
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
        <DialogContent className="sm:max-w-[550px] bg-card border-none rounded-[48px] p-0 overflow-hidden shadow-2xl">
          {selectedMatch && (
            <>
              <div className="bg-primary p-12 text-primary-foreground relative">
                 <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Trophy size={160} />
                 </div>
                 <div className="relative z-10 space-y-4">
                    <Badge className="bg-accent text-primary-foreground font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full border-none shadow-lg shadow-accent/20">
                       {selectedMatch.sport} Operational Audit
                    </Badge>
                    <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">{selectedMatch.title}</h2>
                    <p className="text-primary-foreground/70 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                       <Calendar size={14} className="text-accent/80" />
                       {new Date(selectedMatch.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                 </div>
              </div>

              <div className="p-12 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> Network Status
                    </h4>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                      <div className="w-10 h-10 rounded-xl bg-card shadow-sm flex items-center justify-center text-accent">
                        <ActivityIcon size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-foreground uppercase italic leading-none">{selectedMatch.status}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Audit Phase</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /> Asset Role
                    </h4>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                      <div className="w-10 h-10 rounded-xl bg-card shadow-sm flex items-center justify-center text-amber-500">
                        <Star size={20} className="fill-amber-500/20" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-foreground uppercase italic leading-none">Field Command</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Elite Matrix</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[40px] bg-muted/30 border border-border/50 space-y-10 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
                      <ShieldCheck size={120} />
                   </div>
                   <h4 className="text-xs font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3 italic leading-none">
                     <Medal size={18} className="text-amber-500" />
                     Verified Matrix Results
                   </h4>
                   
                   {selectedMatch.sport === 'cricket' && (
                     <div className="space-y-6">
                       <div className="flex justify-between items-center bg-card p-8 rounded-[32px] border border-border shadow-xl shadow-muted-foreground/20">
                         <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-black italic">A</div>
                            <p className="text-3xl font-black text-foreground italic">{(selectedMatch.score as any).team1?.runs}<span className="text-foreground/80 mx-1">/</span>{(selectedMatch.score as any).team1?.wickets}</p>
                         </div>
                         <div className="text-xl font-black text-foreground/80 italic tracking-[0.3em]">VS</div>
                         <div className="flex flex-col items-center gap-2 text-right">
                             <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground text-[10px] font-black italic">B</div>
                             <p className="text-3xl font-black text-foreground italic">{(selectedMatch.score as any).team2?.runs}<span className="text-foreground/80 mx-1">/</span>{(selectedMatch.score as any).team2?.wickets}</p>
                         </div>
                       </div>
                       <p className="text-[10px] font-black text-center text-muted-foreground uppercase tracking-widest bg-card/100 backdrop-blur-md border border-border rounded-full py-2.5 shadow-inner italic">
                          {(selectedMatch.score as any).team1?.overs}.{(selectedMatch.score as any).team1?.balls} Delivery Cycles Executed
                       </p>
                     </div>
                   )}

                   {selectedMatch.sport === 'football' && (
                     <div className="space-y-10">
                        <div className="flex items-center justify-center gap-12 bg-card p-10 rounded-[40px] border border-border shadow-2xl">
                           <div className="text-center space-y-2">
                              <p className="text-6xl font-black text-foreground italic leading-none">{(selectedMatch.score as any).team1?.goals}</p>
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">SQUAD ALPHA</p>
                           </div>
                           <div className="text-3xl font-black text-muted italic">—</div>
                           <div className="text-center space-y-2">
                              <p className="text-6xl font-black text-muted-foreground/60 italic leading-none">{(selectedMatch.score as any).team2?.goals}</p>
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">OPPOSITION</p>
                           </div>
                        </div>
                        <div className="flex justify-center">
                           <Badge className="bg-primary text-primary-foreground border-none text-[9px] font-black tracking-widest uppercase px-6 py-1.5 rounded-full shadow-xl shadow-primary/20">FULL PROTOCOL COMPLETE</Badge>
                        </div>
                     </div>
                   )}

                   {selectedMatch.sport === 'badminton' && (
                     <div className="space-y-4">
                        {(selectedMatch.score as any).sets?.map((set: any, i: number) => (
                           <div key={i} className="flex justify-between items-center py-5 px-8 bg-card rounded-3xl border border-border shadow-lg shadow-muted-foreground/20 group hover:border-accent/10 transition-all">
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">Operational Set {i+1}</span>
                              <div className="flex gap-6 font-black italic text-xl">
                                 <span className={cn(set.player1 > set.player2 ? "text-accent" : "text-foreground/80")}>{set.player1}</span>
                                 <span className="text-muted">—</span>
                                 <span className={cn(set.player2 > set.player1 ? "text-accent" : "text-foreground/80")}>{set.player2}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    variant="ghost"
                    className="flex-1 rounded-[24px] h-16 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:bg-muted/30"
                    onClick={() => setSelectedMatch(null)}
                  >
                    Archive Intel
                  </Button>
                  <Button className="flex-1 bg-primary text-primary-foreground font-black rounded-[24px] h-16 uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 hover:bg-primary transition-all active:scale-95 italic">
                    <Share2 size={18} className="mr-3" /> Transmit Stats
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {player && (
        <PerformanceSubmitModal 
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          playerId={player.id}
          playerName={player.name}
          defaultSport={player.primarySport}
        />
      )}
    </div>
  );
}
