import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Clock, 
  ChevronLeft,
  Share2,
  Info,
  Activity,
  History,
  TrendingUp,
  User,
  MapPin,
  ShieldCheck,
  Flag
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataService } from '@/services/dataService';
import { geminiService } from '@/services/geminiService';
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from '@/components/ui/avatar';
import { Match, Player, CricketScore, FootballScore, BadmintonScore, Team } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [match, setMatch] = React.useState<Match | null>(null);
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [allMatches, setAllMatches] = React.useState<Match[]>([]);
  const [commentary, setCommentary] = React.useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const h2hMatches = React.useMemo(() => {
    if (!match || !match.team1Id || !match.team2Id) return [];
    return allMatches.filter(m => 
      m.id !== match.id &&
      m.status === 'completed' &&
      ((m.team1Id === match.team1Id && m.team2Id === match.team2Id) ||
       (m.team1Id === match.team2Id && m.team2Id === match.team1Id))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [match, allMatches]);

  React.useEffect(() => {
    if (!id) return;
    
    const unsubMatch = dataService.getMatch(id, (m) => {
      setMatch(m);
      setLoading(false);
      
      // Generate AI analysis if match is completed
      if (m?.status === 'completed' && !aiAnalysis) {
        generateAiAnalysis(m);
      }
    });

    const unsubCommentary = dataService.getCommentary(id, setCommentary);
    const unsubPlayers = dataService.getPlayers(setPlayers);
    const unsubTeams = dataService.getTeams(setTeams);
    const unsubAllMatches = dataService.getMatches(setAllMatches);

    return () => {
      unsubMatch();
      unsubCommentary();
      unsubPlayers();
      unsubTeams();
      unsubAllMatches();
    };
  }, [id]);

  const generateAiAnalysis = async (m: Match) => {
    try {
      const result = await geminiService.generateMatchSummary(m);
      setAiAnalysis(result || null);
    } catch (error) {
      console.error("AI Analysis failed", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-[12px] h-10 w-10 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-foreground uppercase tracking-widest">Match Record Not Found</h2>
        <Button 
          variant="outline" 
          className="mt-6 border-border text-foreground font-black h-14 px-10 rounded-[20px] uppercase text-[10px] tracking-widest"
          onClick={() => navigate('/schedule')}
        >
          <ChevronLeft size={18} className="mr-3" />
          Back to Control
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/schedule')}
          className="rounded-2xl h-14 w-14 border border-border text-foreground group hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-5xl font-display font-black text-foreground tracking-tighter uppercase italic flex items-center gap-3 leading-none">
            Operational <span className="text-accent underline decoration-accent/30 underline-offset-8">Audit</span>
          </h2>
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
             Official Match Records & Real-time Matrix
          </p>
        </div>
      </div>

      <div className="bg-card text-foreground rounded-[48px] overflow-hidden shadow-2xl relative border border-border/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
        
        <CardHeader className="relative z-10 p-12 pb-8 border-b border-border/5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
              <Badge className="bg-accent text-accent-foreground font-black uppercase tracking-[0.3em] text-[10px] px-4 py-1.5 rounded-full border-none shadow-lg shadow-accent/20">
                {match.sport} DIVISION • VERIFIED
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                {match.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-primary-foreground/70 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2 bg-card/10 px-4 py-2 rounded-xl border border-border/5"><Calendar size={14} className="text-accent/80" /> {new Date(match.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-2 bg-card/10 px-4 py-2 rounded-xl border border-border/5"><Clock size={14} className="text-accent/80" /> {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="flex items-center gap-2 bg-card/10 px-4 py-2 rounded-xl border border-border/5"><MapPin size={14} className="text-accent/80" /> Main Strategy Grounds</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Badge className={cn(
                "h-14 px-8 flex items-center justify-center rounded-2xl text-[11px] font-black uppercase tracking-widest border-none shadow-xl shadow-primary/40",
                match.status === 'completed' ? 'bg-emerald-500 text-primary-foreground' : 
                match.status === 'live' ? 'bg-red-500 text-primary-foreground animate-pulse' : 'bg-blue-500 text-primary-foreground'
              )}>
                {match.status}
              </Badge>
              <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl bg-card/10 border border-border/5 hover:bg-card/10 transition-all">
                <Share2 size={20} className="text-accent/80" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-12 relative z-10">
          <div className="max-w-4xl mx-auto">
            {match.sport === 'cricket' && <CricketScoreboard score={match.score as CricketScore} teams={teams} players={players} />}
            {match.sport === 'football' && <FootballScoreboard score={match.score as FootballScore} teams={teams} players={players} />}
            {match.sport === 'badminton' && <BadmintonScoreboard score={match.score as BadmintonScore} players={players} />}
          </div>
        </CardContent>
      </div>

      <Tabs defaultValue="scorecard" className="w-full space-y-10">
        <div className="flex justify-center">
          <TabsList className="bg-card p-2 rounded-[24px] h-20 w-fit flex gap-2 border border-border">
            <TabsTrigger value="scorecard" className="h-full px-12 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-2xl transition-all italic">Analytics Matrix</TabsTrigger>
            <TabsTrigger value="timeline" className="h-full px-12 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-2xl transition-all italic">Live Transmission</TabsTrigger>
            <TabsTrigger value="h2h" className="h-full px-12 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-2xl transition-all italic">Rivals History</TabsTrigger>
            <TabsTrigger value="info" className="h-full px-12 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-2xl transition-all italic">Asset Profile</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="scorecard" className="animate-in fade-in duration-700 outline-none space-y-10">
           {aiAnalysis && (
              <Card className="rounded-[32px] border-none shadow-xl bg-accent text-accent-foreground overflow-hidden">
                 <CardContent className="p-8 flex gap-6 items-start">
                    <div className="w-12 h-12 bg-card/10 rounded-2xl flex items-center justify-center shrink-0 border border-border/5 shadow-2xl">
                       <TrendingUp size={24} className="text-primary-foreground" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-foreground/50">Audit Intelligence <span className="text-primary-foreground ml-2 opacity-100 border border-border/20 px-2 py-0.5 rounded-md text-[8px] font-black uppercase">LIVE DEPLOYMENT</span></h4>
                       <p className="text-sm font-black italic tracking-tight leading-relaxed">{aiAnalysis}</p>
                    </div>
                 </CardContent>
              </Card>
           )}

           {match.sport === 'cricket' ? (
             <DetailedCricketScorecard score={match.score as CricketScore} players={players} />
           ) : match.sport === 'football' ? (
             <DetailedFootballScorecard score={match.score as FootballScore} players={players} />
           ) : match.sport === 'badminton' ? (
             <DetailedBadmintonScorecard score={match.score as BadmintonScore} players={players} />
           ) : (
             <div className="py-32 flex flex-col items-center justify-center bg-muted/30 rounded-[48px] border-4 border-dashed border-border text-center gap-6">
                <div className="w-20 h-20 bg-card rounded-3xl shadow-xl flex items-center justify-center text-foreground/80">
                   <Info size={40} />
                </div>
                <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-[11px] italic">Quantitative scorecard for {match.sport} track in development</p>
             </div>
           )}
        </TabsContent>

        <TabsContent value="h2h" className="animate-in fade-in duration-700 outline-none">
           <div className="space-y-8">
              <div className="flex items-center justify-between px-6">
                 <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground">Rivalry <span className="text-accent underline decoration-accent/30 underline-offset-4">History</span></h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Historical encounter logs</p>
                 </div>
                 <Badge className="bg-primary text-primary-foreground font-black px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest border-none">
                    {h2hMatches.length} Previous Ops
                 </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {h2hMatches.map((m) => (
                    <Card key={m.id} className="elite-card group border-none shadow-xl rounded-[32px] overflow-hidden bg-card hover:shadow-2xl transition-all">
                       <CardContent className="p-8">
                          <div className="flex justify-between items-center mb-6">
                             <Badge className="bg-muted/30 text-muted-foreground border-none px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest leading-none">
                                {new Date(m.date).toLocaleDateString()}
                             </Badge>
                             <div className="flex items-center gap-2">
                                <History size={12} className="text-accent" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Operation Record</span>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                             <div className="flex-1 text-center">
                                <p className="text-sm font-black uppercase italic text-foreground truncate mb-1">{teams.find(t => t.id === m.team1Id)?.name || 'Alpha'}</p>
                                <span className="text-2xl font-black italic text-accent">
                                   {m.sport === 'cricket' ? (m.score as CricketScore).team1.runs : 
                                    m.sport === 'football' ? (m.score as FootballScore).team1.goals :
                                    (m.score as BadmintonScore).sets[0]?.player1}
                                </span>
                             </div>
                             <div className="text-[10px] font-black text-foreground/80 italic">VS</div>
                             <div className="flex-1 text-center">
                                <p className="text-sm font-black uppercase italic text-foreground truncate mb-1">{teams.find(t => t.id === m.team2Id)?.name || 'Beta'}</p>
                                <span className="text-2xl font-black italic text-accent">
                                   {m.sport === 'cricket' ? (m.score as CricketScore).team2.runs : 
                                    m.sport === 'football' ? (m.score as FootballScore).team1.goals :
                                    (m.score as BadmintonScore).sets[0]?.player2}
                                </span>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 ))}
                 {h2hMatches.length === 0 && (
                    <div className="col-span-full py-20 bg-muted/30 rounded-[48px] border-4 border-dashed border-border flex flex-col items-center justify-center gap-4 text-center">
                       <div className="w-16 h-16 bg-card rounded-2xl shadow-xl flex items-center justify-center text-foreground/80">
                          <Activity size={32} />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">No previous tactical encounters logged in registry.</p>
                    </div>
                 )}
              </div>
           </div>
        </TabsContent>

        <TabsContent value="timeline" className="animate-in fade-in duration-700 outline-none">
           <div className="max-w-3xl mx-auto space-y-6">
             {commentary.map((comm, i) => (
                <motion.div 
                  key={comm.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card p-8 rounded-[32px] shadow-sm border border-border flex gap-6"
                >
                   <div className="w-16 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-black text-accent italic">{comm.gameTime || '0\''}</span>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        comm.type === 'ai' ? "bg-emerald-500" : "bg-muted-foreground/60"
                      )} />
                      <div className="w-px flex-1 bg-muted" />
                   </div>
                   <div className="space-y-2">
                      <p className={cn(
                        "text-sm font-bold tracking-tight",
                        comm.type === 'ai' ? "text-foreground" : "text-muted-foreground/80"
                      )}>
                        {comm.text}
                      </p>
                      <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest italic">{comm.type} FEED • {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                </motion.div>
             ))}
             {commentary.length === 0 && (
               <div className="py-20 text-center">
                  <Activity size={48} className="mx-auto text-foreground/80 mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic">Standby: Monitoring Frequency for Transmission...</p>
               </div>
             )}
           </div>
        </TabsContent>

        <TabsContent value="info" className="animate-in fade-in duration-700 outline-none">
          <Card className="rounded-[48px] border-none shadow-2xl shadow-black/40 overflow-hidden bg-card">
            <CardContent className="p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6 flex items-center gap-3 italic leading-none">
                         <div className="w-2 h-2 rounded-full bg-primary" /> Ground Intelligence
                      </h3>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center bg-muted/30 p-6 rounded-2xl border border-border">
                            <span className="text-muted-foreground font-black uppercase text-[9px] tracking-widest">Digital Arena</span>
                            <span className="text-foreground font-black uppercase text-[10px] italic tracking-tight">Main Academy Pavilion</span>
                         </div>
                         <div className="flex justify-between items-center bg-muted/30 p-6 rounded-2xl border border-border">
                            <span className="text-muted-foreground font-black uppercase text-[9px] tracking-widest">Sector</span>
                            <span className="text-foreground font-black uppercase text-[10px] italic tracking-tight">Prime South Zone</span>
                         </div>
                         <div className="flex justify-between items-center bg-muted/30 p-6 rounded-2xl border border-border">
                            <span className="text-muted-foreground font-black uppercase text-[9px] tracking-widest">Crowd Density</span>
                            <span className="text-foreground font-black uppercase text-[10px] italic tracking-tight">Optimal Participation</span>
                         </div>
                      </div>
                   </section>
                </div>
                
                <div className="space-y-8">
                   <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6 flex items-center gap-3 italic leading-none">
                        <div className="w-2 h-2 rounded-full bg-primary" /> Command Council
                      </h3>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center bg-muted/30 p-6 rounded-2xl border border-border">
                            <span className="text-muted-foreground font-black uppercase text-[9px] tracking-widest">Lead Auditor</span>
                            <span className="text-foreground font-black uppercase text-[10px] italic tracking-tight">Engr. Kabir Hossain</span>
                         </div>
                         <div className="flex justify-between items-center bg-muted/30 p-6 rounded-2xl border border-border">
                            <span className="text-muted-foreground font-black uppercase text-[9px] tracking-widest">Tactical Observer</span>
                            <span className="text-foreground font-black uppercase text-[10px] italic tracking-tight">Arifur Rahman</span>
                         </div>
                         <div className="flex justify-between items-center bg-muted/30 p-6 rounded-2xl border border-border">
                            <span className="text-muted-foreground font-black uppercase text-[9px] tracking-widest">Registry Master</span>
                            <span className="text-foreground font-black uppercase text-[10px] italic tracking-tight">System Automated</span>
                         </div>
                      </div>
                   </section>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CricketScoreboard({ score, teams, players }: { score: CricketScore, teams: Team[], players: Player[] }) {
  const team1 = teams.find(t => t.id === teams[0]?.id);
  const team2 = teams.find(t => t.id === teams[1]?.id);

  return (
    <div className="space-y-12">
      <div className="bg-primary/50 backdrop-blur-xl border border-border/10 rounded-[48px] p-10 md:p-16 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Trophy size={200} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
           {/* Team 1 Score */}
           <div className="space-y-6">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 rounded-2xl bg-card text-foreground flex items-center justify-center font-black text-xl italic shadow-xl">
                    {team1?.name?.substring(0, 3).toUpperCase() || 'ALP'}
                 </div>
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter text-primary-foreground/80">{team1?.name || 'Alpha Team'}</h3>
              </div>
              <div className="space-y-2">
                 <motion.div 
                   key={`cr-t1-${score.team1.runs}`}
                   initial={{ x: -20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   className="text-7xl md:text-8xl font-black italic tracking-tighter leading-none"
                 >
                    {score.team1.runs}<span className="text-primary-foreground/20 mx-2 text-5xl">/</span>{score.team1.wickets}
                 </motion.div>
                 <Badge className="bg-accent text-accent-foreground border-none font-black text-[10px] uppercase px-4 py-1.5 rounded-full">
                    {score.team1.overs}.{score.team1.balls} OVERS
                 </Badge>
              </div>
           </div>

           {/* Team 2 Score */}
           <div className="space-y-6 text-right md:border-l md:border-border/5 md:pl-20">
              <div className="flex items-center gap-6 justify-end">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter text-primary-foreground/20 group-hover:text-primary-foreground/70 transition-colors">{team2?.name || 'Beta Team'}</h3>
                 <div className="w-16 h-16 rounded-2xl bg-card/10 border border-border/10 text-primary-foreground/70 flex items-center justify-center font-black text-xl italic">
                    {team2?.name?.substring(0, 3).toUpperCase() || 'BET'}
                 </div>
              </div>
              <div className="space-y-2">
                 <motion.div 
                   key={`cr-t2-${score.team2.runs}`}
                   initial={{ x: 20, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   className="text-7xl md:text-8xl font-black italic tracking-tighter leading-none text-primary-foreground/20"
                 >
                    {score.team2.runs}<span className="text-primary-foreground/5 mx-2 text-5xl">/</span>{score.team2.wickets}
                 </motion.div>
                 <Badge className="bg-card/10 text-primary-foreground/20 border-border/10 font-black text-[10px] uppercase px-4 py-1.5 rounded-full">
                    {score.team2.overs}.{score.team2.balls} OVERS
                 </Badge>
              </div>
           </div>
        </div>

        {/* IPL Broadcast Style Ticker */}
        <div className="mt-16 bg-black/40 backdrop-blur-2xl border border-border/5 p-6 rounded-[32px] flex flex-wrap items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="bg-amber-400 text-black px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest italic">RECENT BALLS</div>
              <div className="flex gap-2">
                 {score.ballsHistory?.slice(-12).map((ball, i) => (
                    <div key={i} className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black border transition-all",
                      ball === 4 ? "bg-accent border-accent/20 text-accent-foreground" : 
                      ball === 6 ? "bg-amber-500 border-amber-300 text-primary-foreground" :
                      ball === -1 ? "bg-red-600 border-red-400 text-primary-foreground" : "bg-card/10 border-border/10 text-primary-foreground/20"
                    )}>
                       {ball === -1 ? 'W' : ball}
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="flex items-center gap-8">
              <div className="text-[10px] font-black uppercase text-primary-foreground/60 italic">
                 TARGET: <span className="text-primary-foreground text-xl ml-2">{score.team1.runs + 1}</span>
              </div>
              <div className="w-px h-10 bg-card/10" />
              <div className="text-[10px] font-black uppercase text-accent/80 italic">
                 CRR: <span className="text-primary-foreground text-xl ml-2">{((score.team2.runs || 0) / ((score.team2.overs || 1) + (score.team2.balls / 6))).toFixed(2)}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function DetailedCricketScorecard({ score, players }: { score: CricketScore, players: Player[] }) {
  const [activeInnings, setActiveInnings] = React.useState<1 | 2>(1);
  const teamScore = activeInnings === 1 ? score.team1 : score.team2;
  const oppScore = activeInnings === 1 ? score.team2 : score.team1;

  return (
    <div className="space-y-10">
      <div className="flex gap-4">
         <Button 
           onClick={() => setActiveInnings(1)}
           className={cn(
             "h-14 px-10 rounded-[20px] font-black uppercase text-[10px] tracking-widest transition-all",
             activeInnings === 1 ? "bg-primary text-primary-foreground shadow-2xl" : "bg-card text-muted-foreground border border-border"
           )}
         >
            Innings 01
         </Button>
         <Button 
           onClick={() => setActiveInnings(2)}
           className={cn(
             "h-14 px-10 rounded-[20px] font-black uppercase text-[10px] tracking-widest transition-all",
             activeInnings === 2 ? "bg-primary text-primary-foreground shadow-2xl" : "bg-card text-muted-foreground border border-border"
           )}
         >
            Innings 02
         </Button>
      </div>

      <Card className="rounded-[48px] border-none shadow-2xl shadow-black/40 overflow-hidden bg-card">
        <CardHeader className="bg-primary text-primary-foreground p-10 flex flex-row items-center justify-between">
           <div>
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] italic mb-1">Tactical Batting Output</CardTitle>
              <p className="text-[9px] font-black uppercase tracking-widest text-primary-foreground/70">Innings {activeInnings}</p>
           </div>
           <div className="text-4xl font-black italic">{teamScore.runs}<span className="text-primary-foreground/20 mx-1">/</span>{teamScore.wickets} <span className="text-xs text-primary-foreground/70">({teamScore.overs}.{teamScore.balls})</span></div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-muted/30">
                 <tr>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tactical Asset</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">R</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">D</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">4x</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">6x</th>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Vector SR</th>
                 </tr>
               </thead>
               <tbody>
                 {(teamScore.scorecard?.batting || []).map((b, i) => (
                   <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
                     <td className="px-10 py-6">
                       <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 rounded-xl border-2 border-border shadow-md">
                             <AvatarImage src={`https://picsum.photos/seed/${b.name}/100`} />
                             <AvatarFallback className="font-black text-[10px] bg-accent/10 text-accent">{b.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-black text-foreground uppercase tracking-tight italic leading-none mb-1">{b.name} {b.status === 'playing' && "*"}</p>
                            <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">{b.status}</p>
                          </div>
                       </div>
                     </td>
                     <td className="px-6 py-6 text-base font-black text-foreground text-right italic">{b.runs}</td>
                     <td className="px-6 py-6 text-sm font-black text-muted-foreground text-right">{b.balls}</td>
                     <td className="px-6 py-6 text-sm font-black text-muted-foreground text-right">{b.fours}</td>
                     <td className="px-6 py-6 text-sm font-black text-muted-foreground text-right">{b.sixes}</td>
                     <td className="px-10 py-6 text-sm font-black text-accent text-right italic">
                       {((b.runs / (b.balls || 1)) * 100).toFixed(1)}
                     </td>
                   </tr>
                 ))}
                 {(!teamScore.scorecard?.batting || teamScore.scorecard.batting.length === 0) && (
                    <tr>
                       <td colSpan={6} className="px-10 py-20 text-center text-foreground/80 italic font-black uppercase tracking-[0.3em] text-[10px]">Matrix data feed unavailable</td>
                    </tr>
                 )}
               </tbody>
             </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[48px] border-none shadow-2xl shadow-black/40 overflow-hidden bg-card">
        <CardHeader className="bg-accent text-accent-foreground p-10">
           <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] italic">Tactical Bowling Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-muted/30">
                 <tr>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned Asset</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">O</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">M</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">R</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">W</th>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">ECON</th>
                 </tr>
               </thead>
               <tbody>
                 {(oppScore.scorecard?.bowling || []).map((b, i) => (
                   <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
                     <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                           <Avatar className="w-10 h-10 rounded-xl border-2 border-border shadow-md">
                              <AvatarImage src={`https://picsum.photos/seed/${b.name}/100`} />
                              <AvatarFallback className="font-black text-[10px] bg-muted text-muted-foreground">{b.name[0]}</AvatarFallback>
                           </Avatar>
                           <p className="text-sm font-black text-foreground uppercase tracking-tight italic leading-none">{b.name}</p>
                        </div>
                     </td>
                     <td className="px-6 py-6 text-base font-black text-foreground text-right italic">{b.overs}</td>
                     <td className="px-6 py-6 text-sm font-black text-muted-foreground text-right">{b.maidens}</td>
                     <td className="px-6 py-6 text-sm font-black text-muted-foreground text-right">{b.runs}</td>
                     <td className="px-6 py-6 text-base font-black text-accent text-right italic">{b.wickets}</td>
                     <td className="px-10 py-6 text-sm font-black text-muted-foreground text-right italic">
                       {(b.runs / (b.overs || 1)).toFixed(2)}
                     </td>
                   </tr>
                 ))}
                 {(!oppScore.scorecard?.bowling || oppScore.scorecard.bowling.length === 0) && (
                    <tr>
                       <td colSpan={6} className="px-10 py-20 text-center text-foreground/80 italic font-black uppercase tracking-[0.3em] text-[10px]">Matrix data feed unavailable</td>
                    </tr>
                 )}
               </tbody>
             </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FootballScoreboard({ score, teams, players }: { score: FootballScore, teams: Team[], players: Player[] }) {
  return (
    <div className="relative group p-8 md:p-16 rounded-[48px] bg-primary/50 backdrop-blur-xl border border-border/5 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]">
       {/* Broadcast Style Header */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-8 py-2 rounded-b-2xl shadow-lg shadow-accent/20 z-20">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-primary-foreground/80">Rimon Live • Match Day</span>
       </div>

       <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-20">
          {/* Team 1 Panel */}
          <div className="flex-1 flex flex-col items-center gap-6 group/team">
             <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-card/10 border border-border/10 flex items-center justify-center p-2 relative">
                <div className="absolute inset-2 rounded-full border border-accent/20 animate-pulse" />
                {teams[0]?.logoURL ? (
                  <img src={teams[0].logoURL} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="text-4xl font-black text-primary-foreground italic">{teams[0]?.name?.[0] || 'A'}</div>
                )}
             </div>
             <div className="text-center">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-primary-foreground mb-2">{teams[0]?.name || 'ALPHA'}</h3>
                <div className="flex justify-center gap-1">
                   {[...Array(score.team1.goals)].map((_, i) => (
                      <div key={i} className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                   ))}
                </div>
             </div>
          </div>

          {/* Main Score Board */}
          <div className="flex flex-col items-center gap-8">
             <div className="bg-primary/80 border border-border/10 px-10 py-6 rounded-3xl flex items-center gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5" />
                <motion.span 
                  key={`fb-t1-${score.team1.goals}`}
                  initial={{ scale: 1.5, color: '#6366f1' }}
                  animate={{ scale: 1, color: '#ffffff' }}
                  className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none"
                >
                   {score.team1.goals}
                </motion.span>
                <div className="flex flex-col items-center gap-2">
                   <div className="text-accent/80 font-bold font-mono text-xl md:text-3xl animate-pulse">{score.time}'</div>
                   <div className="w-px h-12 bg-card/10" />
                </div>
                <motion.span 
                   key={`fb-t2-${score.team2.goals}`}
                   initial={{ scale: 1.5, color: '#6366f1' }}
                   animate={{ scale: 1, color: '#ffffff' }}
                   className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none"
                >
                   {score.team2.goals}
                </motion.span>
             </div>
             <Badge className="bg-emerald-500 text-primary-foreground border-none font-black text-[10px] uppercase px-6 py-2 rounded-full shadow-lg shadow-emerald-500/20">
                Live Data Link Active
             </Badge>
          </div>

          {/* Team 2 Panel */}
          <div className="flex-1 flex flex-col items-center gap-6 group/team">
             <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-card/10 border border-border/10 flex items-center justify-center p-2 relative">
                <div className="absolute inset-2 rounded-full border border-accent/20 animate-pulse" />
                {teams[1]?.logoURL ? (
                  <img src={teams[1].logoURL} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="text-4xl font-black text-primary-foreground/20 italic">{teams[1]?.name?.[0] || 'B'}</div>
                )}
             </div>
             <div className="text-center">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-primary-foreground/70 mb-2">{teams[1]?.name || 'BETA'}</h3>
                <div className="flex justify-center gap-1">
                   {[...Array(score.team2.goals)].map((_, i) => (
                      <div key={i} className="w-1.5 h-4 bg-card/10 rounded-full" />
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function BadmintonScoreboard({ score, players }: { score: BadmintonScore, players: Player[] }) {
  return (
     <div className="space-y-12">
        <div className="flex flex-wrap items-center justify-center gap-6 py-6">
           {score.sets.map((set, i) => (
             <div key={`set-${i}`} className="flex flex-col items-center gap-4 group">
                <span className="text-[10px] font-black text-primary-foreground/20 uppercase tracking-[0.3em] italic">Phase {i+1}</span>
                <div className="bg-card/10 border border-border/10 px-10 py-6 rounded-3xl flex items-center gap-8 shadow-2xl group-hover:bg-accent/10 group-hover:border-accent/20 transition-all">
                   <span className={cn("text-4xl font-black italic", set.player1 > set.player2 ? "text-accent" : "text-primary-foreground/70")}>{set.player1}</span>
                   <span className="text-xl font-black opacity-5">—</span>
                   <span className={cn("text-4xl font-black italic", set.player2 > set.player1 ? "text-accent" : "text-primary-foreground/70")}>{set.player2}</span>
                </div>
             </div>
           ))}
        </div>
        
        <div className="text-center">
           <div className="inline-block bg-accent/10 px-8 py-3 rounded-full border border-accent/20">
              <p className="text-xs font-black uppercase tracking-[0.4em] text-accent/80 italic">
                 Audit Ongoing • Operational Phase {score.currentSet}
              </p>
           </div>
        </div>
     </div>
  );
}

function DetailedBadmintonScorecard({ score }: { score: BadmintonScore, players: Player[] }) {
  return (
    <div className="space-y-12">
      <Card className="rounded-[40px] border-none shadow-2xl shadow-black/40 overflow-hidden bg-card">
        <CardHeader className="bg-primary text-primary-foreground p-10">
           <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] italic">Sets Comparison Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phase Segment</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Entity Alpha</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Entity Beta</th>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Dominance</th>
                </tr>
              </thead>
              <tbody>
                {score.sets.map((set, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-10 py-8 font-black text-muted-foreground uppercase text-[10px] italic tracking-widest">Digital Phase {i+1}</td>
                    <td className="px-6 py-8 text-3xl font-black text-foreground text-center italic">{set.player1}</td>
                    <td className="px-6 py-8 text-3xl font-black text-foreground text-center italic">{set.player2}</td>
                    <td className="px-10 py-8 text-right">
                       <Badge className={cn(
                         "h-10 px-6 rounded-xl font-black text-[9px] uppercase italic border-none shadow-lg",
                         set.player1 > set.player2 ? "bg-accent text-primary-foreground shadow-accent/20" : "bg-card text-muted-foreground border border-border"
                       )}>
                         {set.player1 > set.player2 ? "Alpha Advantage" : "Beta Neutral"}
                       </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailedFootballScorecard({ score, players }: { score: FootballScore, players: Player[] }) {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <Card className="rounded-[40px] border-none shadow-lg bg-card overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] italic">Alpha Logistical Output</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
               <div className="space-y-3">
                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tactical Strikes</p>
                 {score.team1.scorers?.map((s, i) => {
                   const p = players.find(player => player.id === s.playerId);
                   return (
                     <div key={i} className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border">
                        <span className="text-sm font-black uppercase italic">{p?.name || 'Unknown Asset'}</span>
                        <span className="text-xs font-black text-accent">{s.minute}'</span>
                     </div>
                   );
                 })}
                 {(!score.team1.scorers || score.team1.scorers.length === 0) && <p className="text-center py-6 text-foreground/80 font-black text-[9px] uppercase italic">No goals registered</p>}
               </div>
               
               <div className="space-y-3">
                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Disciplinary Logs</p>
                 <div className="flex flex-wrap gap-3">
                   {score.team1.cards?.map((c, i) => {
                     const p = players.find(player => player.id === c.playerId);
                     return (
                       <div key={i} className={cn(
                        "px-4 py-2 rounded-lg font-black text-[9px] uppercase italic border",
                        c.type === 'yellow' ? "bg-amber-50 border-amber-100 text-amber-500" : "bg-red-50 border-red-100 text-red-500"
                       )}>
                         {p?.name?.split(' ')[0] || 'Asset'}. {c.minute}'
                       </div>
                     );
                   })}
                   {(!score.team1.cards || score.team1.cards.length === 0) && <p className="text-[9px] font-black text-foreground/80 uppercase italic">Clear Record</p>}
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[40px] border-none shadow-lg bg-card overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] italic">Beta Logistical Output</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <div className="space-y-6">
               <div className="space-y-3">
                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Tactical Strikes</p>
                 {score.team2.scorers?.map((s, i) => {
                   const p = players.find(player => player.id === s.playerId);
                   return (
                     <div key={i} className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border">
                        <span className="text-sm font-black uppercase italic">{p?.name || 'Unknown Asset'}</span>
                        <span className="text-xs font-black text-accent">{s.minute}'</span>
                     </div>
                   );
                 })}
                 {(!score.team2.scorers || score.team2.scorers.length === 0) && <p className="text-center py-6 text-foreground/80 font-black text-[9px] uppercase italic">No goals registered</p>}
               </div>

               <div className="space-y-3">
                 <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Disciplinary Logs</p>
                 <div className="flex flex-wrap gap-3">
                   {score.team2.cards?.map((c, i) => {
                     const p = players.find(player => player.id === c.playerId);
                     return (
                       <div key={i} className={cn(
                        "px-4 py-2 rounded-lg font-black text-[9px] uppercase italic border",
                        c.type === 'yellow' ? "bg-amber-50 border-amber-100 text-amber-500" : "bg-red-50 border-red-100 text-red-500"
                       )}>
                         {p?.name?.split(' ')[0] || 'Asset'}. {c.minute}'
                       </div>
                     );
                   })}
                   {(!score.team2.cards || score.team2.cards.length === 0) && <p className="text-[9px] font-black text-foreground/80 uppercase italic">Clear Record</p>}
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

