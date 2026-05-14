import * as React from 'react';
import { 
  Trophy, 
  Clock, 
  Users, 
  ChevronRight, 
  Plus, 
  Minus,
  RotateCcw,
  Save,
  Play,
  Pause,
  CheckCircle2,
  Mic2,
  Zap,
  TrendingUp,
  Target,
  Workflow,
  ShieldCheck,
  Flag,
  Calendar,
  Menu,
  Activity as ActivityIcon
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from "@/components/ui/select";
import { 
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { dataService } from '@/services/dataService';
import { aiService, CommentaryResponse } from '@/services/aiService';
import { Player, Match, Team, CricketScore, FootballScore, BadmintonScore } from '@/types';
import { motion, AnimatePresence } from 'motion/react';

import { useAuth } from '@/context/AuthContext';

export default function Scoring() {
  const { profile } = useAuth();
  const [matchId, setMatchId] = React.useState<string>('');
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [commentary, setCommentary] = React.useState<CommentaryResponse[]>([]);
  const [isGeneratingCommentary, setIsGeneratingCommentary] = React.useState(false);

  React.useEffect(() => {
    const unsubMatches = dataService.getMatches((data) => {
      setMatches(data.filter(m => m.status !== 'completed'));
    });
    const unsubPlayers = dataService.getPlayers(setPlayers);
    const unsubTeams = dataService.getTeams(setTeams);

    return () => {
      unsubMatches();
      unsubPlayers();
      unsubTeams();
    };
  }, []);

  const team1 = selectedMatch ? teams.find(t => t.id === selectedMatch.team1Id) : null;
  const team2 = selectedMatch ? teams.find(t => t.id === selectedMatch.team2Id) : null;
  const canScore = profile?.role === 'management' || 
                   (profile?.playerId && (team1?.captainId === profile.playerId || team2?.captainId === profile.playerId));

  const handleMatchSelect = (id: string) => {
    setMatchId(id);
    const match = matches.find(m => m.id === id);
    setSelectedMatch(match || null);
    if (match) {
        toast.info(`Authorized Session: ${match.title}`);
    }
  };

  const handleUpdateMatchScore = async (newScore: any, eventType?: string) => {
    if (!selectedMatch) return;
    if (!canScore) {
      toast.error("Unauthorized Access: Telemetry link restricted to Command or Captaincy.");
      return;
    }
    setIsSyncing(true);
    try {
      await dataService.updateMatchScore(selectedMatch.id, newScore);
      setSelectedMatch(prev => prev ? { ...prev, score: newScore } : null);
      
      // Auto-generate AI commentary for key events
      const keyEvents = ['goal', 'wicket', 'four', 'six', 'set_end', 'match_start', 'yellow_card', 'red_card'];
      if (aiService && eventType && keyEvents.includes(eventType)) {
        setIsGeneratingCommentary(true);
        const comm = await aiService.generateCommentary(selectedMatch, newScore, eventType);
        if (comm) {
          setCommentary(prev => [comm, ...prev].slice(0, 5));
        }
        setIsGeneratingCommentary(false);
      }
    } catch (error) {
      toast.error("Transmission Error: Matrix sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedMatch) return;
    if (!canScore) {
      toast.error("Unauthorized Access: Protocol termination restricted.");
      return;
    }
    setIsSyncing(true);
    try {
        const participantScores: { playerId: string, stats: any }[] = [];
        const score = selectedMatch.score;

        if (selectedMatch.sport === 'cricket') {
          const s = score as CricketScore;
          // Combine all scorecard data
          const allBatting = [...(s.team1.scorecard?.batting || []), ...(s.team2.scorecard?.batting || [])];
          const allBowling = [...(s.team1.scorecard?.bowling || []), ...(s.team2.scorecard?.bowling || [])];
          
          const pIds = Array.from(new Set([...allBatting.map(b => b.playerId), ...allBowling.map(b => b.playerId)]));
          
          pIds.forEach(pid => {
            const bat = allBatting.find(b => b.playerId === pid);
            const bowl = allBowling.find(b => b.playerId === pid);
            participantScores.push({
              playerId: pid,
              stats: {
                runs: bat?.runs || 0,
                wickets: bowl?.wickets || 0
              }
            });
          });
        } else if (selectedMatch.sport === 'football') {
          const s = score as FootballScore;
          const pIds = selectedMatch.participants;
          pIds.forEach(pid => {
            const goals = [...(s.team1.scorers || []), ...(s.team2.scorers || [])].filter(x => x.playerId === pid).length;
            const assists = [...(s.team1.assists || []), ...(s.team2.assists || [])].filter(x => x.playerId === pid).length;
            const yellowCards = [...(s.team1.cards || []), ...(s.team2.cards || [])].filter(x => x.playerId === pid && x.type === 'yellow').length;
            const redCards = [...(s.team1.cards || []), ...(s.team2.cards || [])].filter(x => x.playerId === pid && x.type === 'red').length;
            participantScores.push({
              playerId: pid,
              stats: { goals, assists, yellowCards, redCards }
            });
          });
        } else if (selectedMatch.sport === 'badminton') {
            // Placeholder for badminton winner logic
            const s = score as BadmintonScore;
            // Simple logic: who won more sets
            let p1Wins = 0;
            let p2Wins = 0;
            s.sets.forEach(set => {
              if (set.player1 > set.player2) p1Wins++;
              else if (set.player2 > set.player1) p2Wins++;
            });
            
            // Assuming match.participants[0] is p1 and [1] is p2
            if (selectedMatch.participants[0]) {
              participantScores.push({
                playerId: selectedMatch.participants[0],
                stats: { isWinner: p1Wins > p2Wins }
              });
            }
            if (selectedMatch.participants[1]) {
              participantScores.push({
                playerId: selectedMatch.participants[1],
                stats: { isWinner: p2Wins > p1Wins }
              });
            }
        }

        await dataService.completeMatch(selectedMatch.id, participantScores);
        toast.success("Operational protocol finalized. Stats archived.");
        setSelectedMatch(null);
        setMatchId('');
    } catch (error) {
        toast.error("Finalization failed: System rejection.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3 leading-none">
            Tactical <span className="text-indigo-500">Telemetry</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2 italic">
             Command & Control • Real-time Data Ingestion
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <Select value={matchId} onValueChange={handleMatchSelect}>
              <SelectTrigger className="w-[300px] bg-white h-16 rounded-[24px] border-none shadow-2xl shadow-slate-200/50 font-black text-[10px] uppercase tracking-widest px-8 group hover:bg-slate-900 hover:text-white transition-all ring-offset-transparent focus:ring-0">
                <SelectValue placeholder="Select Active Mission" />
              </SelectTrigger>
              <SelectContent className="rounded-[24px] border-none shadow-2xl p-2">
                <SelectGroup>
                  <SelectLabel className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] px-4 py-2">Available Nodes</SelectLabel>
                  <SelectSeparator className="bg-slate-100 mx-2" />
                  {matches.map(m => (
                    <SelectItem key={m.id} value={m.id} className="rounded-xl font-black text-[10px] uppercase tracking-wider py-3.5 px-4 cursor-pointer focus:bg-indigo-50 focus:text-indigo-600">
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
           </Select>
           
           {selectedMatch && (
             <Button 
                variant="outline" 
                size="icon" 
                className="h-16 w-16 rounded-[28px] border-none bg-white shadow-2xl shadow-slate-200/50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                onClick={() => {
                    setSelectedMatch(null);
                    setMatchId('');
                }}
             >
                <RotateCcw size={20} />
             </Button>
           )}
        </div>
      </div>

      {!selectedMatch ? (
        <div className="py-40 flex flex-col items-center justify-center bg-white rounded-[64px] border-4 border-dashed border-slate-100 text-center gap-8 shadow-2xl shadow-slate-200/10">
          <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 group-hover:scale-110 transition-transform">
             <Workflow size={60} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Strategic Node Offline</h3>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] italic">Select a mission from the command menu to initialize telemetry.</p>
          </div>
          <Button 
            className="bg-slate-900 text-white font-black h-16 px-12 rounded-2xl uppercase text-[10px] tracking-widest shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-95 italic"
            onClick={() => document.querySelector('button[role="combobox"]')?.dispatchEvent(new MouseEvent('click', {bubbles: true}))}
          >
             Initialize Interface
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-10">
            {/* Main Scoring Interface */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMatch.sport}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className={cn(!canScore && "pointer-events-none opacity-80 blur-[2px]")}
              >
                {!canScore && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center p-10 bg-white/10 backdrop-blur-sm rounded-[64px]">
                    <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl text-center space-y-6 max-w-md border border-white/10">
                       <ShieldCheck size={48} className="text-indigo-400 mx-auto" />
                       <div className="space-y-2">
                          <h4 className="text-xl font-black uppercase italic text-white tracking-tighter">Security Lock Active</h4>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] leading-relaxed">Your digital signature does not match Command or Squad Leadership credentials for this mission.</p>
                       </div>
                    </div>
                  </div>
                )}
                {selectedMatch.sport === 'cricket' && (
                  <CricketIngestor match={selectedMatch} onUpdate={handleUpdateMatchScore} isSyncing={isSyncing} players={players} teams={teams} />
                )}
                {selectedMatch.sport === 'football' && (
                  <FootballIngestor match={selectedMatch} onUpdate={handleUpdateMatchScore} isSyncing={isSyncing} players={players} teams={teams} />
                )}
                {selectedMatch.sport === 'badminton' && (
                  <BadmintonIngestor match={selectedMatch} onUpdate={handleUpdateMatchScore} isSyncing={isSyncing} players={players} />
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Tactical Feed */}
            <Card className="rounded-[48px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
              <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 italic flex items-center gap-3 leading-none">
                  <ActivityIcon size={18} className="text-indigo-500" /> Automated Narrative Feed
                </CardTitle>
                {isGeneratingCommentary && (
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                        <span className="text-[8px] font-black uppercase text-indigo-500 tracking-widest leading-none">Quantum Logic Ingestion...</span>
                    </div>
                )}
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                <div className="space-y-4">
                  {commentary.map((c, i) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 border-l-4 border-l-indigo-500 transition-all hover:bg-white hover:shadow-xl group"
                    >
                      <div className="flex justify-between items-start mb-3">
                         <span className="text-[14px] font-black text-slate-900 italic leading-none">{c.event}</span>
                         <Badge className="bg-indigo-500/10 text-indigo-500 border-none font-black text-[8px] px-2 py-0.5 rounded-full">{c.tone}</Badge>
                      </div>
                      <p className="text-xs text-slate-600 font-bold leading-relaxed">{c.commentary}</p>
                    </motion.div>
                  ))}
                  {commentary.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center gap-6 opacity-40">
                         <div className="w-16 h-16 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-200">
                            <Mic2 size={32} />
                         </div>
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Awaiting tactical data for narrative generation</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-10">
            <Card className="rounded-[40px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
              <CardHeader className="p-8 border-b border-slate-50 bg-slate-900 text-white">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 italic leading-none">
                  <ShieldCheck size={18} className="text-indigo-400" /> Session Lock
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-6 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">
                  Operational finalization will archive all matrix data and terminate the telemetry stream.
                </p>
                <Button 
                   className="w-full bg-slate-900 text-white font-black h-16 rounded-2xl uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all active:scale-95 italic"
                   onClick={handleFinalize}
                   disabled={!canScore}
                >
                   Finalize Protocol
                </Button>
                <div className="flex items-center justify-center gap-2 group cursor-help">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest italic">Secure Link Active</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[40px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
               <CardHeader className="p-8 border-b border-slate-50">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 italic leading-none">Inbound Logs</CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                     <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Zap size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-tight italic">Low Latency</p>
                        <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mt-1">Matrix Verified</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                     <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                        <Users size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-tight italic">Squad Synced</p>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Auth Completed</p>
                     </div>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-interfaces - Redesigning them as well
function CricketIngestor({ match, onUpdate, isSyncing, players, teams }: any) {
  const score = match.score as CricketScore;
  const team1 = teams.find((t: any) => t.id === match.team1Id);
  const team2 = teams.find((t: any) => t.id === match.team2Id);

  const [strikerId, setStrikerId] = React.useState<string>('');
  const [nonStrikerId, setNonStrikerId] = React.useState<string>('');
  const [bowlerId, setBowlerId] = React.useState<string>('');

  const currentTeamIndex = score.currentInnings || 1;
  const battingTeamKey = currentTeamIndex === 1 ? 'team1' : 'team2';
  const bowlingTeamKey = currentTeamIndex === 1 ? 'team2' : 'team1';

  const battingPlayers = players.filter((p: Player) => 
    match.participants.includes(p.id) && (p.primarySport === 'cricket' || p.primarySport === undefined)
  );

  const updateStats = (runs: number, isWicket: boolean = false, extraType?: 'wide' | 'noball') => {
    const newScore = JSON.parse(JSON.stringify(score));
    const battingTeam = newScore[battingTeamKey];
    
    // Initialize scorecard if missing
    if (!battingTeam.scorecard) {
      battingTeam.scorecard = { batting: [], bowling: [] };
    }

    // 1. Update Team Runs
    if (extraType === 'wide' || extraType === 'noball') {
      battingTeam.runs += 1; // Penalty
    } else {
      battingTeam.runs += runs;
    }

    // 2. Update Batting Stats
    if (strikerId && !extraType) {
      let striker = battingTeam.scorecard.batting.find((b: any) => b.playerId === strikerId);
      if (!striker) {
        const p = players.find((p: Player) => p.id === strikerId);
        striker = { playerId: strikerId, name: p?.name || 'Unknown', runs: 0, balls: 0, fours: 0, sixes: 0, status: 'playing' };
        battingTeam.scorecard.batting.push(striker);
      }
      striker.runs += runs;
      striker.balls += 1;
      if (runs === 4) striker.fours += 1;
      if (runs === 6) striker.sixes += 1;
      if (isWicket) striker.status = 'out';
    }

    // 3. Update Bowling Stats
    if (bowlerId) {
      const bowlingTeamData = newScore[bowlingTeamKey];
      if (!bowlingTeamData.scorecard) bowlingTeamData.scorecard = { batting: [], bowling: [] };
      
      let bowler = bowlingTeamData.scorecard.bowling.find((b: any) => b.playerId === bowlerId);
      if (!bowler) {
        const p = players.find((p: Player) => p.id === bowlerId);
        bowler = { playerId: bowlerId, name: p?.name || 'Unknown', overs: 0, runs: 0, wickets: 0, maidens: 0, currentBalls: 0 };
        bowlingTeamData.scorecard.bowling.push(bowler);
      }
      
      if (!extraType) {
        bowler.runs += runs;
        bowler.currentBalls = (bowler.currentBalls || 0) + 1;
        if (bowler.currentBalls >= 6) {
          bowler.currentBalls = 0;
          bowler.overs += 1;
        }
      } else {
        bowler.runs += 1; // Extras count towards bowler usually (except byes/leg-byes which we simplify here)
      }
      
      if (isWicket) bowler.wickets += 1;
    }

    // 4. Update Team Overs/Wickets
    if (isWicket) {
      battingTeam.wickets += 1;
    }

    if (!extraType) {
      battingTeam.balls += 1;
      if (battingTeam.balls >= 6) {
        battingTeam.balls = 0;
        battingTeam.overs += 1;
        // Auto-rotate strike on over end
        const temp = strikerId;
        setStrikerId(nonStrikerId);
        setNonStrikerId(temp);
      }
    }

    // Rotate strike on odd runs
    if (runs % 2 !== 0 && !extraType) {
      const temp = strikerId;
      setStrikerId(nonStrikerId);
      setNonStrikerId(temp);
    }

    // History
    newScore.ballsHistory = [...(newScore.ballsHistory || []), isWicket ? -1 : runs];
    if (newScore.ballsHistory.length > 24) newScore.ballsHistory.shift();

    let eventType = 'ball';
    if (isWicket) eventType = 'wicket';
    else if (runs === 4) eventType = 'four';
    else if (runs === 6) eventType = 'six';

    onUpdate(newScore, eventType);
  };

  return (
    <Card className="rounded-[64px] border-none shadow-2xl shadow-indigo-100 overflow-hidden bg-white">
      <CardHeader className="bg-slate-900 p-12 text-white relative">
         <div className="absolute top-0 right-0 p-12 opacity-5">
            <Trophy size={200} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className={cn(
              "text-center space-y-4 flex-1 group transition-all",
              battingTeamKey === 'team1' ? "opacity-100 scale-105" : "opacity-40"
            )}>
               <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.4em] italic mb-4 block">
                 {battingTeamKey === 'team1' ? 'Batting Unit' : 'Defending'}
               </span>
               <div className="text-8xl font-black italic tracking-tighter">
                  {score.team1.runs}<span className="text-white/10 text-6xl mx-2">/</span>{score.team1.wickets}
               </div>
               <Badge className="bg-white/5 border border-white/10 text-white/40 font-black text-[9px] uppercase tracking-widest px-6 py-2 rounded-full">
                  {score.team1.overs}.{score.team1.balls} OVERS
               </Badge>
            </div>
            
            <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-xl font-black italic opacity-20">VS</div>
               <Button 
                variant="ghost" 
                className="text-[8px] font-black uppercase tracking-widest text-indigo-400 hover:text-white"
                onClick={() => onUpdate({ ...score, currentInnings: score.currentInnings === 1 ? 2 : 1 })}
               >
                 Switch Innings
               </Button>
            </div>

            <div className={cn(
              "text-center space-y-4 flex-1 group transition-all",
              battingTeamKey === 'team2' ? "opacity-100 scale-105" : "opacity-40"
            )}>
               <span className="text-[10px] font-black uppercase text-slate-600 tracking-[0.4em] italic mb-4 block">
                 {battingTeamKey === 'team2' ? 'Batting Unit' : 'Defending'}
               </span>
               <div className="text-8xl font-black italic tracking-tighter">
                  {score.team2.runs}<span className="text-white/10 text-6xl mx-2">/</span>{score.team2.wickets}
               </div>
               <Badge className="bg-white/5 border border-white/10 text-white/20 font-black text-[9px] uppercase tracking-widest px-6 py-2 rounded-full">
                  {score.team2.overs}.{score.team2.balls} OVERS
               </Badge>
            </div>
         </div>
      </CardHeader>
      
      <CardContent className="p-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Active Selection */}
           <div className="md:col-span-2 space-y-10">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-4">Striker (On Strike)</Label>
                  <Select value={strikerId} onValueChange={setStrikerId}>
                    <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none px-6 font-black uppercase text-[10px] italic">
                      <SelectValue placeholder="Select Striker" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                       {battingPlayers.map(p => (
                         <SelectItem key={p.id} value={p.id} className="rounded-xl font-black text-[10px] uppercase py-3 italic">{p.name}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-4">Non-Striker</Label>
                  <Select value={nonStrikerId} onValueChange={setNonStrikerId}>
                    <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none px-6 font-black uppercase text-[10px] italic">
                      <SelectValue placeholder="Select Non-Striker" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                       {battingPlayers.map(p => (
                         <SelectItem key={p.id} value={p.id} className="rounded-xl font-black text-[10px] uppercase py-3 italic">{p.name}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-4 text-indigo-500">Current Bowler</Label>
                <Select value={bowlerId} onValueChange={setBowlerId}>
                  <SelectTrigger className="h-16 rounded-2xl bg-indigo-50 border-none px-6 font-black uppercase text-[10px] text-indigo-600 italic">
                    <SelectValue placeholder="Select Bowler" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                     {players.filter(p => match.participants.includes(p.id) && p.id !== strikerId && p.id !== nonStrikerId).map(p => (
                       <SelectItem key={p.id} value={p.id} className="rounded-xl font-black text-[10px] uppercase py-3 italic">{p.name}</SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-8">
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                  {[0, 1, 2, 3, 4, 6].map(r => (
                    <Button 
                      key={r}
                      className={cn(
                        "h-20 rounded-[28px] font-black text-2xl italic shadow-xl transition-all active:scale-95",
                        r === 4 ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200" : 
                        r === 6 ? "bg-amber-500 hover:bg-amber-400 shadow-amber-200" : 
                        "bg-slate-900 hover:bg-slate-800 shadow-slate-200"
                      )}
                      disabled={!strikerId || !bowlerId}
                      onClick={() => updateStats(r)}
                    >
                      {r}
                    </Button>
                  ))}
                  <Button 
                    variant="outline"
                    className="h-20 rounded-[28px] border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600"
                    onClick={() => updateStats(1, false, 'wide')}
                  >
                    WD
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-20 rounded-[28px] border-slate-200 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600"
                    onClick={() => updateStats(1, false, 'noball')}
                  >
                    NB
                  </Button>
                  <Button 
                    className="h-20 rounded-[28px] bg-red-600 hover:bg-red-500 shadow-xl shadow-red-200 text-white font-black text-[10px] uppercase tracking-widest"
                    onClick={() => updateStats(0, true)}
                    disabled={!strikerId || !bowlerId}
                  >
                    WICKET
                  </Button>
                </div>
              </div>
           </div>

           {/* Side History & Scorecard Preview */}
           <div className="space-y-10">
              <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2 italic">
                  <Clock size={14} className="text-slate-400" /> Recent Matrix
                </h4>
                <div className="flex flex-wrap gap-3">
                  {score.ballsHistory?.slice(-12).reverse().map((ball, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border italic",
                        ball === 4 ? "bg-indigo-500 text-white border-indigo-500" :
                        ball === 6 ? "bg-amber-500 text-white border-amber-500" :
                        ball === -1 ? "bg-red-600 text-white border-red-600" :
                        "bg-white text-slate-900 border-slate-200"
                      )}
                    >
                      {ball === -1 ? 'W' : ball}
                    </div>
                  ))}
                  {(!score.ballsHistory || score.ballsHistory.length === 0) && (
                    <div className="py-10 text-center w-full text-slate-300 italic text-[10px] font-black uppercase tracking-widest">Awaiting Pulse...</div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] ml-4 italic">Active Personnel</h4>
                 {battingTeamKey && score[battingTeamKey].scorecard?.batting.filter((b: any) => b.status === 'playing').map((b: any) => (
                   <div key={b.playerId} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                         <div>
                            <p className="text-[10px] font-black uppercase italic text-slate-900">{b.name} {strikerId === b.playerId ? '*' : ''}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{b.balls} Balls Faced</p>
                         </div>
                      </div>
                      <div className="text-xl font-black italic text-slate-900">{b.runs}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FootballIngestor({ match, onUpdate, isSyncing, players, teams }: any) {
  const score = match.score as FootballScore;
  const [selectedPlayerId, setSelectedPlayerId] = React.useState<string>('');

  const updateGoals = (teamKey: 'team1' | 'team2', delta: number) => {
    const newScore = JSON.parse(JSON.stringify(score));
    newScore[teamKey].goals = Math.max(0, newScore[teamKey].goals + delta);
    
    if (delta > 0 && selectedPlayerId) {
      if (!newScore[teamKey].scorers) newScore[teamKey].scorers = [];
      newScore[teamKey].scorers.push({ playerId: selectedPlayerId, minute: newScore.time || 0 });
    }
    onUpdate(newScore, delta > 0 ? 'goal' : undefined);
  };

  const addCard = (teamKey: 'team1' | 'team2', type: 'yellow' | 'red') => {
    if (!selectedPlayerId) {
      toast.error("Assign personnel before disciplinary action.");
      return;
    }
    const newScore = JSON.parse(JSON.stringify(score));
    if (!newScore[teamKey].cards) newScore[teamKey].cards = [];
    newScore[teamKey].cards.push({ playerId: selectedPlayerId, type, minute: newScore.time || 0 });
    onUpdate(newScore, type === 'yellow' ? 'yellow_card' : 'red_card');
  };

  const updateTime = (delta: number) => {
    const newScore = { ...score };
    newScore.time = Math.max(0, newScore.time + delta);
    onUpdate(newScore);
  };

  const participantPlayers = players.filter((p: Player) => 
    match.participants.includes(p.id) && (p.primarySport === 'football' || p.primarySport === undefined)
  );

  return (
    <Card className="rounded-[64px] border-none shadow-2xl shadow-indigo-100 overflow-hidden bg-white">
        <CardHeader className="bg-slate-900 p-16 text-white relative flex flex-col items-center gap-12 overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5">
              <Calendar size={240} className="rotate-12" />
           </div>
           
           <div className="flex flex-col md:flex-row items-center gap-16 relative z-10 w-full justify-between">
              <div className="text-center space-y-6 flex-1">
                 <div className="text-[120px] font-black tracking-tighter leading-none italic text-indigo-500">{score.team1.goals}</div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter italic">ALPHA FORCE</h3>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                 <div className="h-24 w-px bg-white/10" />
                 <div className="text-4xl font-black text-indigo-400 italic font-mono tracking-tighter">{score.time || 0}'</div>
                 <div className="h-24 w-px bg-white/10" />
              </div>

              <div className="text-center space-y-6 flex-1">
                 <div className="text-[120px] font-black tracking-tighter leading-none italic text-white/10">{score.team2.goals}</div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter italic text-white/40">GHOST UNIT</h3>
              </div>
           </div>
           
           <div className="flex gap-4 relative z-10">
              <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:bg-white/10" onClick={() => updateTime(-1)}><Minus size={18} /></Button>
              <Button size="icon" variant="ghost" className="h-12 w-12 rounded-xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20" onClick={() => updateTime(1)}><Plus size={18} /></Button>
           </div>
        </CardHeader>
        
        <CardContent className="p-16 space-y-16">
           <div className="max-w-md mx-auto space-y-6">
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-4 text-slate-400 italic">Active Tactical Agent</Label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="h-20 rounded-[32px] bg-slate-50 border-none shadow-inner px-10 font-black uppercase text-[12px] italic">
                  <SelectValue placeholder="Identify Personnel..." />
                </SelectTrigger>
                <SelectContent className="rounded-[32px] border-none shadow-2xl p-4">
                  {participantPlayers.map(p => (
                    <SelectItem key={p.id} value={p.id} className="rounded-2xl font-black uppercase italic py-4">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-12">
                 <div className="text-center">
                    <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-[0.4em] italic mb-8">Alpha Force Ingestion</h4>
                    <div className="flex justify-center gap-6">
                       <Button variant="outline" className="h-20 w-20 rounded-[32px] border-slate-100 text-slate-300 hover:bg-slate-50 transition-all shadow-inner" onClick={() => updateGoals('team1', -1)}><Minus size={24} /></Button>
                       <Button className="h-20 w-20 rounded-[32px] bg-indigo-500 text-white shadow-2xl shadow-indigo-500/20 hover:bg-slate-900 transition-all active:scale-90" onClick={() => updateGoals('team1', 1)}><Plus size={24} /></Button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-14 rounded-2xl border-amber-100 text-amber-500 font-black uppercase text-[9px] hover:bg-amber-50 italic" onClick={() => addCard('team1', 'yellow')}>Yellow Card</Button>
                    <Button variant="outline" className="h-14 rounded-2xl border-red-100 text-red-500 font-black uppercase text-[9px] hover:bg-red-50 italic" onClick={() => addCard('team1', 'red')}>Red Card</Button>
                 </div>
              </div>
              
              <div className="space-y-12">
                 <div className="text-center">
                    <h4 className="text-[11px] font-black uppercase text-slate-900 tracking-[0.4em] italic mb-8">Ghost Unit Audit</h4>
                    <div className="flex justify-center gap-6">
                       <Button variant="outline" className="h-20 w-20 rounded-[32px] border-slate-100 text-slate-300 hover:bg-slate-50 transition-all shadow-inner" onClick={() => updateGoals('team2', -1)}><Minus size={24} /></Button>
                       <Button className="h-20 w-20 rounded-[32px] bg-white border-2 border-slate-900 text-slate-900 shadow-2xl shadow-slate-100 hover:bg-slate-900 hover:text-white transition-all active:scale-90" onClick={() => updateGoals('team2', 1)}><Plus size={24} /></Button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-14 rounded-2xl border-amber-100 text-amber-500 font-black uppercase text-[9px] hover:bg-amber-50 italic" onClick={() => addCard('team2', 'yellow')}>Yellow Card</Button>
                    <Button variant="outline" className="h-14 rounded-2xl border-red-100 text-red-500 font-black uppercase text-[9px] hover:bg-red-50 italic" onClick={() => addCard('team2', 'red')}>Red Card</Button>
                 </div>
              </div>
           </div>
        </CardContent>
    </Card>
  );
}

function BadmintonIngestor({ match, onUpdate, isSyncing, players }: any) {
  const score = match.score as BadmintonScore;
  const currentSet = score.currentSet || 0;
  const sets = score.sets || [{ player1: 0, player2: 0 }];

  const updateScore = (playerKey: 'player1' | 'player2', delta: number) => {
    const newSets = JSON.parse(JSON.stringify(sets));
    newSets[currentSet][playerKey] = Math.max(0, newSets[currentSet][playerKey] + delta);
    onUpdate({ ...score, sets: newSets }, 'point');
  };

  const nextSet = () => {
    if (sets.length >= 3) return;
    const newSets = [...sets, { player1: 0, player2: 0 }];
    onUpdate({ ...score, sets: newSets, currentSet: sets.length }, 'set_end');
  };

  const participantPlayers = players.filter((p: Player) => 
    match.participants.includes(p.id) && (p.primarySport === 'badminton' || p.primarySport === undefined)
  );

  return (
    <Card className="rounded-[64px] border-none shadow-2xl shadow-indigo-100 overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 p-10 border-b border-slate-100">
           <div className="flex flex-wrap justify-center gap-6">
              {sets.map((s: any, i: number) => (
                <Button 
                    key={i}
                    variant={currentSet === i ? 'default' : 'ghost'}
                    className={cn(
                        "h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest italic transition-all",
                        currentSet === i ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" : "text-slate-400 hover:bg-slate-100"
                    )}
                    onClick={() => onUpdate({ ...score, currentSet: i })}
                >
                    Sub-Session {i+1}
                </Button>
              ))}
              {sets.length < 3 && (
                <Button 
                    variant="ghost" 
                    className="h-14 w-14 rounded-2xl border-2 border-dashed border-slate-200 text-slate-300 hover:bg-slate-100 transition-all font-black"
                    onClick={nextSet}
                >
                    <Plus size={20} />
                </Button>
              )}
           </div>
        </CardHeader>
        
        <CardContent className="p-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-20">
               <div className="text-center space-y-10 flex-1 group">
                  <div className="text-[120px] font-black text-indigo-500 tracking-tighter leading-none italic transition-all group-hover:scale-110">{sets[currentSet].player1}</div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">ALPHA ASSET</p>
                     <div className="flex justify-center gap-4">
                        <Button variant="outline" className="h-16 w-16 rounded-[28px] border-slate-100 text-slate-300 hover:bg-slate-50 transition-all" onClick={() => updateScore('player1', -1)}><Minus size={24} /></Button>
                        <Button className="h-16 w-16 rounded-[28px] bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-90" onClick={() => updateScore('player1', 1)}><Plus size={24} /></Button>
                     </div>
                  </div>
               </div>

               <div className="text-center flex flex-col items-center gap-6">
                  <div className="w-px h-16 bg-slate-100" />
                  <span className="text-3xl font-black text-slate-100 italic tracking-[0.4em]">VS</span>
                  <div className="w-px h-16 bg-slate-100" />
               </div>

               <div className="text-center space-y-10 flex-1 group">
                  <div className="text-[120px] font-black text-slate-200 tracking-tighter leading-none italic transition-all group-hover:scale-110 group-hover:text-slate-900">{sets[currentSet].player2}</div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">BETA ASSET</p>
                     <div className="flex justify-center gap-4">
                        <Button variant="outline" className="h-16 w-16 rounded-[28px] border-slate-100 text-slate-300 hover:bg-slate-50 transition-all" onClick={() => updateScore('player2', -1)}><Minus size={24} /></Button>
                        <Button className="h-16 w-16 rounded-[28px] bg-white border-2 border-slate-900 text-slate-900 shadow-2xl shadow-slate-100 hover:bg-slate-900 hover:text-white transition-all active:scale-90" onClick={() => updateScore('player2', 1)}><Plus size={24} /></Button>
                     </div>
                  </div>
               </div>
            </div>
        </CardContent>
    </Card>
  );
}
