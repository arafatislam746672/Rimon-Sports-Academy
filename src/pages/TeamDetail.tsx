import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Flag, 
  Users, 
  Shield, 
  User as UserIcon,
  ShieldCheck,
  Calendar,
  Trophy,
  Activity,
  Workflow,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { dataService } from '@/services/dataService';
import { Team, Player, UserProfile, Match } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = React.useState<Team | null>(null);
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [profiles, setProfiles] = React.useState<UserProfile[]>([]);
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;

    setLoading(true);
    const unsubTeam = dataService.getTeam(id, (t) => {
      setTeam(t);
      setLoading(false);
    });

    const unsubPlayers = dataService.getPlayers(setPlayers);
    const unsubProfiles = dataService.getStaffProfiles(setProfiles);
    const unsubMatches = dataService.getMatches(setMatches);

    return () => {
      unsubTeam();
      unsubPlayers();
      unsubProfiles();
      unsubMatches();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Activity className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-20 bg-card rounded-[48px] shadow-2xl border border-border">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100">
          <Shield size={48} />
        </div>
        <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">Squad Not Identified</h2>
        <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em] mt-2 mb-10">Sector 7 Secure Database Result: NULL</p>
        <Link to="/teams">
          <Button className="bg-primary text-primary-foreground px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all">
            Return to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const squadPlayers = players.filter(p => team.playerIds.includes(p.id));
  const manager = profiles.find(p => p.uid === team.managerId);
  const coach = profiles.find(p => p.uid === team.coachId);
  const captain = players.find(p => p.id === team.captainId);
  
  const teamMatches = matches.filter(m => m.team1Id === team.id || m.team2Id === team.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-12 pb-20">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/teams">
          <Button variant="ghost" className="rounded-2xl h-12 gap-3 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <ChevronLeft size={16} /> Base Directory
          </Button>
        </Link>
        <Badge className="bg-accent text-primary-foreground border-none rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20">
          Profile ID: #{team.id.slice(-6).toUpperCase()}
        </Badge>
      </div>

      {/* Hero Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary rounded-[64px] shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-[0.03] scale-150 rotate-12">
            <Shield size={400} />
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-48 h-48 rounded-[64px] border-[12px] border-border/5 bg-card/10 backdrop-blur-xl flex items-center justify-center shadow-3xl group"
          >
            {team.logoURL ? (
              <img src={team.logoURL} alt={team.name} className="w-full h-full object-cover rounded-[52px]" />
            ) : (
              <Flag size={80} className="text-primary-foreground/20" />
            )}
            <div className="absolute -bottom-2 -right-2 p-4 bg-accent text-primary-foreground rounded-[24px] border-8 border-primary shadow-2xl">
               <ShieldCheck size={24} className="fill-white/10" />
            </div>
          </motion.div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <span className="px-4 py-1.5 bg-accent text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                {team.sport} Division
              </span>
              <span className="flex items-center gap-2 text-primary-foreground/70 text-[10px] font-black uppercase tracking-[0.3em]">
                <Calendar size={14} /> Activation: {new Date(team.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-primary-foreground italic uppercase tracking-tighter leading-none">
              {team.name}
            </h1>
            <p className="max-w-2xl text-muted-foreground font-medium text-sm leading-relaxed italic">
              {team.description || "No mission brief identified for this combat unit. Tactical deployment history is currently encrypted."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Command Structure */}
        <div className="space-y-10">
          <Card className="elite-card border-none shadow-2xl rounded-[48px] bg-primary text-primary-foreground overflow-hidden">
             <CardHeader className="p-10 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/80">Command Structure</CardTitle>
             </CardHeader>
             <CardContent className="p-10 pt-0 space-y-6">
                <div className="p-6 bg-card/10 rounded-[32px] border border-border/5 flex items-center gap-5 hover:bg-card/10 transition-all group">
                   <div className="w-14 h-14 bg-card/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-accent transition-colors">
                      <UserIcon size={24} className="text-primary-foreground/60 group-hover:text-primary-foreground" />
                   </div>
                   <div className="min-w-0 flex-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary-foreground/70 mb-1">General Manager</p>
                      <p className="text-sm font-black uppercase italic tracking-tight">{manager?.name || 'Unassigned'}</p>
                   </div>
                </div>

                <div className="p-6 bg-card/10 rounded-[32px] border border-border/5 flex items-center gap-5 hover:bg-card/10 transition-all group">
                   <div className="w-14 h-14 bg-card/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-accent transition-colors">
                      <Workflow size={24} className="text-primary-foreground/60 group-hover:text-primary-foreground" />
                   </div>
                   <div className="min-w-0 flex-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary-foreground/70 mb-1">Technical Strategist</p>
                      <p className="text-sm font-black uppercase italic tracking-tight">{coach?.name || 'Unassigned'}</p>
                   </div>
                </div>

                <div className="p-6 bg-card/10 rounded-[32px] border border-border/5 flex items-center gap-5 hover:bg-card/10 transition-all group">
                   <div className="w-14 h-14 bg-amber-500 text-primary-foreground rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/20">
                      <Shield size={24} />
                   </div>
                   <div className="min-w-0 flex-1">
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary-foreground/70 mb-1">Field Commander (C)</p>
                      <p className="text-sm font-black uppercase italic tracking-tight text-amber-400">{captain?.name || 'Pending Commission'}</p>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card className="elite-card border-none shadow-2xl rounded-[48px] bg-card overflow-hidden">
             <CardHeader className="p-10 pb-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Active Deployment Stats</CardTitle>
             </CardHeader>
             <CardContent className="p-10 pt-0 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-muted/30 rounded-[32px] border border-border flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black italic text-foreground">{team.playerIds.length}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Assets</span>
                   </div>
                   <div className="p-6 bg-muted/30 rounded-[32px] border border-border flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black italic text-foreground">{teamMatches.length}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Operations</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Readiness</span>
                      <span className="text-[9px] font-black text-accent">94%</span>
                   </div>
                   <div className="h-4 bg-muted rounded-full overflow-hidden p-1">
                      <div className="h-full bg-accent rounded-full w-[94%]" />
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Center & Right Column: Squad and History */}
        <div className="lg:col-span-2 space-y-10">
          {/* Squad List */}
          <Card className="elite-card border-none shadow-2xl rounded-[48px] bg-card overflow-hidden">
             <CardHeader className="p-10 pb-6 border-b border-border flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-2xl font-black uppercase italic tracking-tighter italic">Squad <span className="text-accent">Manifest</span></CardTitle>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Verified roster assets</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                   <Users size={20} />
                </div>
             </CardHeader>
             <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                   {squadPlayers.map((player) => (
                      <Link key={player.id} to={`/players/${player.id}`}>
                        <div className="group flex items-center gap-5 p-4 rounded-[32px] hover:bg-muted/30 transition-all border border-transparent hover:border-border">
                           <Avatar className="h-16 w-16 rounded-[24px] border-4 border-border shadow-xl group-hover:rotate-3 transition-transform">
                              <AvatarImage src={player.photoURL} alt={player.name} className="object-cover" />
                              <AvatarFallback className="font-black text-muted-foreground bg-muted">{player.name[0]}</AvatarFallback>
                           </Avatar>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                 <h4 className="font-black text-sm uppercase italic tracking-tight text-foreground">{player.name}</h4>
                                 {team.captainId === player.id && (
                                    <div className="p-1 bg-amber-500 text-primary-foreground rounded-md shadow-lg shadow-amber-500/20">
                                       <Shield size={10} />
                                    </div>
                                 )}
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                                 {player.status} unit
                              </p>
                           </div>
                           <ChevronLeft size={16} className="text-foreground/80 rotate-180 group-hover:text-accent transition-colors" />
                        </div>
                      </Link>
                   ))}
                   {squadPlayers.length === 0 && (
                      <div className="col-span-full py-12 text-center text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                         No assets registered to this unit.
                      </div>
                   )}
                </div>
             </CardContent>
          </Card>

          {/* Operational History */}
          <Card className="elite-card border-none shadow-2xl rounded-[48px] bg-card overflow-hidden">
             <CardHeader className="p-10 pb-6 border-b border-border flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Engagement <span className="text-accent">History</span></CardTitle>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Verified combat reports</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                   <Activity size={20} />
                </div>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                {teamMatches.length > 0 ? teamMatches.map((match) => {
                  const isWinner = match.winnerId === team.id;
                  const isDraw = match.status === 'completed' && !match.winnerId;
                  const resultColor = isWinner ? 'text-green-500 bg-green-50' : (isDraw ? 'text-muted-foreground bg-muted/30' : 'text-red-500 bg-red-50');
                  
                  return (
                    <Link key={match.id} to={`/matches/${match.id}`}>
                       <div className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[40px] border border-border hover:border-accent/10 hover:bg-accent/20 transition-all">
                          <div className="flex items-center gap-6">
                             <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm", resultColor)}>
                                {match.status === 'completed' ? (isWinner ? 'W' : (isDraw ? 'D' : 'L')) : 'VS'}
                             </div>
                             <div>
                                <h4 className="font-black text-sm uppercase italic tracking-tight text-foreground group-hover:text-accent transition-colors">{match.title}</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                                   {new Date(match.date).toLocaleDateString()} • {match.status}
                                </p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <ArrowRight size={20} className="text-foreground/80 group-hover:translate-x-2 transition-transform" />
                          </div>
                       </div>
                    </Link>
                  );
                }) : (
                  <div className="py-20 text-center flex flex-col items-center gap-4">
                     <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center text-muted-foreground/60">
                        <Trophy size={32} />
                     </div>
                     <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">No operational records found.</p>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
