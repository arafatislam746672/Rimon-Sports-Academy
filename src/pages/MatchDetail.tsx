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
        <div className="animate-spin rounded-[12px] h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Match Record Not Found</h2>
        <Button 
          variant="outline" 
          className="mt-6 border-slate-200 text-slate-900 font-black h-14 px-10 rounded-[20px] uppercase text-[10px] tracking-widest"
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
          className="rounded-2xl h-14 w-14 border border-slate-100 text-slate-900 group hover:bg-slate-900 hover:text-white transition-all shadow-sm"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3 leading-none">
            Operational <span className="text-indigo-500">Audit</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
             Official Match Records & Real-time Matrix
          </p>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-[48px] overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
        
        <CardHeader className="relative z-10 p-12 pb-8 border-b border-white/5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4">
              <Badge className="bg-indigo-500 text-white font-black uppercase tracking-[0.3em] text-[10px] px-4 py-1.5 rounded-full border-none shadow-lg shadow-indigo-500/20">
                {match.sport} DIVISION • VERIFIED
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                {match.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5"><Calendar size={14} className="text-indigo-400" /> {new Date(match.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5"><Clock size={14} className="text-indigo-400" /> {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5"><MapPin size={14} className="text-indigo-400" /> Main Strategy Grounds</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Badge className={cn(
                "h-14 px-8 flex items-center justify-center rounded-2xl text-[11px] font-black uppercase tracking-widest border-none shadow-xl shadow-slate-900/40",
                match.status === 'completed' ? 'bg-emerald-500 text-white' : 
                match.status === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 text-white'
              )}>
                {match.status}
              </Badge>
              <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <Share2 size={20} className="text-indigo-400" />
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
          <TabsList className="bg-slate-100 p-2 rounded-[24px] h-20 w-fit flex gap-2 border border-slate-200">
            <TabsTrigger value="scorecard" className="h-full px-12 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all italic">Analytics Matrix</TabsTrigger>
            <TabsTrigger value="timeline" className="h-full px-12 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all italic">Live Transmission</TabsTrigger>
            <TabsTrigger value="h2h" className="h-full px-12 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all italic">Rivals History</TabsTrigger>
            <TabsTrigger value="info" className="h-full px-12 rounded-[18px] font-black uppercase text-[10px] tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all italic">Asset Profile</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="scorecard" className="animate-in fade-in duration-700 outline-none space-y-10">
           {aiAnalysis && (
              <Card className="rounded-[32px] border-none shadow-xl bg-indigo-600 text-white overflow-hidden">
                 <CardContent className="p-8 flex gap-6 items-start">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 shadow-2xl">
                       <TrendingUp size={24} className="text-white" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Audit Intelligence <span className="text-white ml-2 opacity-100 border border-white/20 px-2 py-0.5 rounded-md text-[8px] font-black uppercase">LIVE DEPLOYMENT</span></h4>
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
             <div className="py-32 flex flex-col items-center justify-center bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-100 text-center gap-6">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-slate-200">
                   <Info size={40} />
                </div>
                <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[11px] italic">Quantitative scorecard for {match.sport} track in development</p>
             </div>
           )}
        </TabsContent>

        <TabsContent value="h2h" className="animate-in fade-in duration-700 outline-none">
           <div className="space-y-8">
              <div className="flex items-center justify-between px-6">
                 <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tight">Rivalry <span className="text-indigo-500">History</span></h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Historical encounter logs</p>
                 </div>
                 <Badge className="bg-slate-900 text-white font-black px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest border-none">
                    {h2hMatches.length} Previous Ops
                 </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {h2hMatches.map((m) => (
                    <Card key={m.id} className="elite-card group border-none shadow-xl rounded-[32px] overflow-hidden bg-white hover:shadow-2xl transition-all">
                       <CardContent className="p-8">
                          <div className="flex justify-between items-center mb-6">
                             <Badge className="bg-slate-50 text-slate-400 border-none px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest leading-none">
                                {new Date(m.date).toLocaleDateString()}
                             </Badge>
                             <div className="flex items-center gap-2">
                                <History size={12} className="text-indigo-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Operation Record</span>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-4">
                             <div className="flex-1 text-center">
                                <p className="text-sm font-black uppercase italic text-slate-900 truncate mb-1">{teams.find(t => t.id === m.team1Id)?.name || 'Alpha'}</p>
                                <span className="text-2xl font-black italic text-indigo-500">
                                   {m.sport === 'cricket' ? (m.score as CricketScore).team1.runs : 
                                    m.sport === 'football' ? (m.score as FootballScore).team1.goals :
                                    (m.score as BadmintonScore).sets[0]?.player1}
                                </span>
                             </div>
                             <div className="text-[10px] font-black text-slate-200 italic">VS</div>
                             <div className="flex-1 text-center">
                                <p className="text-sm font-black uppercase italic text-slate-900 truncate mb-1">{teams.find(t => t.id === m.team2Id)?.name || 'Beta'}</p>
                                <span className="text-2xl font-black italic text-indigo-500">
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
                    <div className="col-span-full py-20 bg-slate-50 rounded-[48px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 text-center">
                       <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-200">
                          <Activity size={32} />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">No previous tactical encounters logged in registry.</p>
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
                  className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex gap-6"
                >
                   <div className="w-16 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-black text-indigo-500 italic">{comm.gameTime || '0\''}</span>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        comm.type === 'ai' ? "bg-emerald-500" : "bg-slate-300"
                      )} />
                      <div className="w-px flex-1 bg-slate-100" />
                   </div>
                   <div className="space-y-2">
                      <p className={cn(
                        "text-sm font-bold tracking-tight",
                        comm.type === 'ai' ? "text-slate-900" : "text-slate-600"
                      )}>
                        {comm.text}
                      </p>
                      <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest italic">{comm.type} FEED • {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                </motion.div>
             ))}
             {commentary.length === 0 && (
               <div className="py-20 text-center">
                  <Activity size={48} className="mx-auto text-slate-200 mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Standby: Monitoring Frequency for Transmission...</p>
               </div>
             )}
           </div>
        </TabsContent>

        <TabsContent value="info" className="animate-in fade-in duration-700 outline-none">
          <Card className="rounded-[48px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <CardContent className="p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-6 flex items-center gap-3 italic leading-none">
                         <div className="w-2 h-2 rounded-full bg-slate-900" /> Ground Intelligence
                      </h3>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <span className="text-slate-400 font-black uppercase text-[9px] tracking-widest">Digital Arena</span>
                            <span className="text-slate-900 font-black uppercase text-[10px] italic tracking-tight">Main Academy Pavilion</span>
                         </div>
                         <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <span className="text-slate-400 font-black uppercase text-[9px] tracking-widest">Sector</span>
                            <span className="text-slate-900 font-black uppercase text-[10px] italic tracking-tight">Prime South Zone</span>
                         </div>
                         <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <span className="text-slate-400 font-black uppercase text-[9px] tracking-widest">Crowd Density</span>
                            <span className="text-slate-900 font-black uppercase text-[10px] italic tracking-tight">Optimal Participation</span>
                         </div>
                      </div>
                   </section>
                </div>
                
                <div className="space-y-8">
                   <section>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-6 flex items-center gap-3 italic leading-none">
                        <div className="w-2 h-2 rounded-full bg-slate-900" /> Command Council
                      </h3>
                      <div className="space-y-4">
                         <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <span className="text-slate-400 font-black uppercase text-[9px] tracking-widest">Lead Auditor</span>
                            <span className="text-slate-900 font-black uppercase text-[10px] italic tracking-tight">Engr. Kabir Hossain</span>
                         </div>
                         <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <span className="text-slate-400 font-black uppercase text-[9px] tracking-widest">Tactical Observer</span>
                            <span className="text-slate-900 font-black uppercase text-[10px] italic tracking-tight">Arifur Rahman</span>
                         </div>
                         <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <span className="text-slate-400 font-black uppercase text-[9px] tracking-widest">Registry Master</span>
                            <span className="text-slate-900 font-black uppercase text-[10px] italic tracking-tight">System Automated</span>
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
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-12">
        {/* Team 1 Score */}
        <div className="text-center space-y-4 group">
           <div className="w-24 h-24 bg-white/5 rounded-[32px] mx-auto flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
              <Flag size={40} className="text-indigo-400" />
           </div>
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 leading-none">Initial Phase</h3>
           <div className="text-6xl font-black tracking-tighter italic">
              {score.team1.runs}<span className="text-indigo-500 mx-1">/</span>{score.team1.wickets}
           </div>
           <div className="bg-indigo-500/10 inline-block px-4 py-1.5 rounded-full border border-indigo-500/20">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">
                {score.team1.overs}.{score.team1.balls} Deliveries
              </span>
           </div>
        </div>

        {/* VS / Middle Info */}
        <div className="flex flex-col items-center justify-center gap-8">
           <div className="w-20 h-20 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
              <span className="text-2xl font-black italic opacity-20 tracking-widest leading-none">X</span>
           </div>
           {score.ballsHistory && score.ballsHistory.length > 0 && (
              <div className="flex gap-2.5">
                 {score.ballsHistory.slice(-6).map((ball, i) => (
                    <div key={i} className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border transition-all hover:scale-110",
                      ball === 4 ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20" : 
                      ball === 6 ? "bg-amber-500 border-amber-400 shadow-lg shadow-amber-500/20" :
                      ball === -1 ? "bg-red-600 border-red-500 shadow-lg shadow-red-500/20" : "bg-white/5 border-white/10"
                    )}>
                      {ball === -1 ? "W" : ball}
                    </div>
                 ))}
              </div>
           )}
        </div>

        {/* Team 2 Score */}
        <div className="text-center space-y-4 group text-right md:text-center">
           <div className="w-24 h-24 bg-white/5 rounded-[32px] md:mx-auto flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
              <Users size={40} className="text-white/20" />
           </div>
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 leading-none">Pursuit Phase</h3>
           <div className="text-6xl font-black tracking-tighter italic">
              {score.team2.runs}<span className="text-indigo-500 mx-1">/</span>{score.team2.wickets}
           </div>
           <div className="bg-white/5 inline-block px-4 py-1.5 rounded-full border border-white/10">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">
                {score.team2.overs}.{score.team2.balls} Deliveries
              </span>
           </div>
        </div>
      </div>

      {score.currentInnings === 2 && score.team1.runs > score.team2.runs && (
        <div className="bg-white/5 border border-white/10 p-8 rounded-[36px] text-center shadow-inner">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 italic">
               Verification Logic: Need {score.team1.runs - score.team2.runs + 1} tactical units to secure mission
            </p>
        </div>
      )}
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
             activeInnings === 1 ? "bg-slate-900 text-white shadow-2xl" : "bg-white text-slate-400 border border-slate-100"
           )}
         >
            Innings 01
         </Button>
         <Button 
           onClick={() => setActiveInnings(2)}
           className={cn(
             "h-14 px-10 rounded-[20px] font-black uppercase text-[10px] tracking-widest transition-all",
             activeInnings === 2 ? "bg-slate-900 text-white shadow-2xl" : "bg-white text-slate-400 border border-slate-100"
           )}
         >
            Innings 02
         </Button>
      </div>

      <Card className="rounded-[48px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
        <CardHeader className="bg-slate-900 text-white p-10 flex flex-row items-center justify-between">
           <div>
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] italic mb-1">Tactical Batting Output</CardTitle>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Innings {activeInnings}</p>
           </div>
           <div className="text-4xl font-black italic">{teamScore.runs}<span className="text-white/20 mx-1">/</span>{teamScore.wickets} <span className="text-xs text-white/40">({teamScore.overs}.{teamScore.balls})</span></div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50">
                 <tr>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Tactical Asset</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">R</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">D</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">4x</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">6x</th>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Vector SR</th>
                 </tr>
               </thead>
               <tbody>
                 {(teamScore.scorecard?.batting || []).map((b, i) => (
                   <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                     <td className="px-10 py-6">
                       <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 rounded-xl border-2 border-white shadow-md">
                             <AvatarImage src={`https://picsum.photos/seed/${b.name}/100`} />
                             <AvatarFallback className="font-black text-[10px] bg-indigo-50 text-indigo-500">{b.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight italic leading-none mb-1">{b.name} {b.status === 'playing' && "*"}</p>
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{b.status}</p>
                          </div>
                       </div>
                     </td>
                     <td className="px-6 py-6 text-base font-black text-slate-900 text-right italic">{b.runs}</td>
                     <td className="px-6 py-6 text-sm font-black text-slate-400 text-right">{b.balls}</td>
                     <td className="px-6 py-6 text-sm font-black text-slate-400 text-right">{b.fours}</td>
                     <td className="px-6 py-6 text-sm font-black text-slate-400 text-right">{b.sixes}</td>
                     <td className="px-10 py-6 text-sm font-black text-indigo-500 text-right italic">
                       {((b.runs / (b.balls || 1)) * 100).toFixed(1)}
                     </td>
                   </tr>
                 ))}
                 {(!teamScore.scorecard?.batting || teamScore.scorecard.batting.length === 0) && (
                    <tr>
                       <td colSpan={6} className="px-10 py-20 text-center text-slate-200 italic font-black uppercase tracking-[0.3em] text-[10px]">Matrix data feed unavailable</td>
                    </tr>
                 )}
               </tbody>
             </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[48px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
        <CardHeader className="bg-indigo-600 text-white p-10">
           <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] italic">Tactical Bowling Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-slate-50">
                 <tr>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Asset</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">O</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">M</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">R</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">W</th>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">ECON</th>
                 </tr>
               </thead>
               <tbody>
                 {(oppScore.scorecard?.bowling || []).map((b, i) => (
                   <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                     <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                           <Avatar className="w-10 h-10 rounded-xl border-2 border-white shadow-md">
                              <AvatarImage src={`https://picsum.photos/seed/${b.name}/100`} />
                              <AvatarFallback className="font-black text-[10px] bg-slate-100 text-slate-400">{b.name[0]}</AvatarFallback>
                           </Avatar>
                           <p className="text-sm font-black text-slate-900 uppercase tracking-tight italic leading-none">{b.name}</p>
                        </div>
                     </td>
                     <td className="px-6 py-6 text-base font-black text-slate-900 text-right italic">{b.overs}</td>
                     <td className="px-6 py-6 text-sm font-black text-slate-400 text-right">{b.maidens}</td>
                     <td className="px-6 py-6 text-sm font-black text-slate-400 text-right">{b.runs}</td>
                     <td className="px-6 py-6 text-base font-black text-indigo-600 text-right italic">{b.wickets}</td>
                     <td className="px-10 py-6 text-sm font-black text-slate-400 text-right italic">
                       {(b.runs / (b.overs || 1)).toFixed(2)}
                     </td>
                   </tr>
                 ))}
                 {(!oppScore.scorecard?.bowling || oppScore.scorecard.bowling.length === 0) && (
                    <tr>
                       <td colSpan={6} className="px-10 py-20 text-center text-slate-200 italic font-black uppercase tracking-[0.3em] text-[10px]">Matrix data feed unavailable</td>
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
    <div className="flex flex-col md:flex-row items-center justify-around gap-12">
      <div className="text-center space-y-6 group">
        <div className="w-40 h-40 md:w-56 md:h-56 rounded-[48px] bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-8xl md:text-9xl font-black text-indigo-500 shadow-2xl group-hover:scale-105 transition-all italic leading-none">
           {score.team1.goals}
        </div>
        <div>
          <h3 className="text-2xl font-black tracking-tighter uppercase italic leading-none mb-1">Squad Bravo</h3>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Home Sector</p>
        </div>
      </div>

      <div className="text-center space-y-4">
         <div className="bg-white/5 px-6 py-2 rounded-full border border-white/5">
            <span className="text-[10px] font-black tracking-[0.3em] opacity-40 uppercase italic">Temporal Status</span>
         </div>
         <div className="text-5xl font-black italic tracking-tighter opacity-10 leading-none">VS</div>
         <div className="text-4xl font-black text-indigo-500 tracking-tighter italic animate-pulse">{score.time}'</div>
      </div>

      <div className="text-center space-y-6 group">
        <div className="w-40 h-40 md:w-56 md:h-56 rounded-[48px] bg-white/5 border border-white/5 flex items-center justify-center text-8xl md:text-9xl font-black text-white/20 shadow-2xl group-hover:scale-105 transition-all italic leading-none">
           {score.team2.goals}
        </div>
        <div>
          <h3 className="text-2xl font-black tracking-tighter uppercase italic leading-none mb-1">Incursion Team</h3>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Void Sector</p>
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
             <div key={i} className="flex flex-col items-center gap-4 group">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">Phase {i+1}</span>
                <div className="bg-white/5 border border-white/10 px-10 py-6 rounded-3xl flex items-center gap-8 shadow-2xl group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                   <span className={cn("text-4xl font-black italic", set.player1 > set.player2 ? "text-indigo-500" : "text-white/40")}>{set.player1}</span>
                   <span className="text-xl font-black opacity-5">—</span>
                   <span className={cn("text-4xl font-black italic", set.player2 > set.player1 ? "text-indigo-500" : "text-white/40")}>{set.player2}</span>
                </div>
             </div>
           ))}
        </div>
        
        <div className="text-center">
           <div className="inline-block bg-indigo-500/10 px-8 py-3 rounded-full border border-indigo-500/20">
              <p className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 italic">
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
      <Card className="rounded-[40px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
        <CardHeader className="bg-slate-900 text-white p-10">
           <CardTitle className="text-[11px] font-black uppercase tracking-[0.3em] italic">Sets Comparison Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Phase Segment</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Entity Alpha</th>
                   <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Entity Beta</th>
                   <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Dominance</th>
                </tr>
              </thead>
              <tbody>
                {score.sets.map((set, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-8 font-black text-slate-400 uppercase text-[10px] italic tracking-widest">Digital Phase {i+1}</td>
                    <td className="px-6 py-8 text-3xl font-black text-slate-900 text-center italic">{set.player1}</td>
                    <td className="px-6 py-8 text-3xl font-black text-slate-900 text-center italic">{set.player2}</td>
                    <td className="px-10 py-8 text-right">
                       <Badge className={cn(
                         "h-10 px-6 rounded-xl font-black text-[9px] uppercase italic border-none shadow-lg",
                         set.player1 > set.player2 ? "bg-indigo-500 text-white shadow-indigo-500/20" : "bg-white text-slate-400 border border-slate-100"
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
        <Card className="rounded-[40px] border-none shadow-lg bg-white overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] italic">Alpha Logistical Output</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
               <div className="space-y-3">
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tactical Strikes</p>
                 {score.team1.scorers?.map((s, i) => {
                   const p = players.find(player => player.id === s.playerId);
                   return (
                     <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-sm font-black uppercase italic">{p?.name || 'Unknown Asset'}</span>
                        <span className="text-xs font-black text-indigo-500">{s.minute}'</span>
                     </div>
                   );
                 })}
                 {(!score.team1.scorers || score.team1.scorers.length === 0) && <p className="text-center py-6 text-slate-200 font-black text-[9px] uppercase italic">No goals registered</p>}
               </div>
               
               <div className="space-y-3">
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Disciplinary Logs</p>
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
                   {(!score.team1.cards || score.team1.cards.length === 0) && <p className="text-[9px] font-black text-slate-200 uppercase italic">Clear Record</p>}
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-[40px] border-none shadow-lg bg-white overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-6">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] italic">Beta Logistical Output</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <div className="space-y-6">
               <div className="space-y-3">
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tactical Strikes</p>
                 {score.team2.scorers?.map((s, i) => {
                   const p = players.find(player => player.id === s.playerId);
                   return (
                     <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-sm font-black uppercase italic">{p?.name || 'Unknown Asset'}</span>
                        <span className="text-xs font-black text-indigo-500">{s.minute}'</span>
                     </div>
                   );
                 })}
                 {(!score.team2.scorers || score.team2.scorers.length === 0) && <p className="text-center py-6 text-slate-200 font-black text-[9px] uppercase italic">No goals registered</p>}
               </div>

               <div className="space-y-3">
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Disciplinary Logs</p>
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
                   {(!score.team2.cards || score.team2.cards.length === 0) && <p className="text-[9px] font-black text-slate-200 uppercase italic">Clear Record</p>}
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

