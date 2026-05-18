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
        toast.info(`Match selected: ${match.title}`);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-border">
        <div className="space-y-2">
          <h2 className="text-5xl font-display font-black text-foreground tracking-tighter uppercase italic flex items-center gap-3 leading-none">
            Tactical <span className="text-accent underline decoration-accent/30 underline-offset-8">Telemetry</span>
          </h2>
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2 italic">
             Command & Control • Real-time Data Ingestion
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
           <Select value={matchId} onValueChange={handleMatchSelect}>
              <SelectTrigger className="w-full sm:w-[300px] bg-card h-16 rounded-[24px] border-border shadow-2xl font-black text-[10px] uppercase tracking-widest px-8 group hover:bg-accent hover:text-accent-foreground transition-all ring-offset-background focus:ring-0">
                <SelectValue placeholder="Select Active Mission" />
              </SelectTrigger>
              <SelectContent className="rounded-[24px] border-none shadow-2xl p-2">
                <SelectGroup>
                  <SelectLabel className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] px-4 py-2">Available Nodes</SelectLabel>
                  <SelectSeparator className="bg-muted mx-2" />
                  {matches.map(m => (
                    <SelectItem key={m.id} value={m.id} className="rounded-xl font-black text-[10px] uppercase tracking-wider py-3.5 px-4 cursor-pointer focus:bg-accent focus:text-accent-foreground">
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
                className="h-16 w-16 rounded-[28px] border-none bg-card shadow-2xl shadow-black/40 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
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
        <div className="py-40 flex flex-col items-center justify-center bg-card rounded-[64px] border-4 border-dashed border-border text-center gap-8 shadow-2xl shadow-muted-foreground/20">
          <div className="w-32 h-32 bg-muted/30 rounded-[40px] flex items-center justify-center text-foreground/80 group-hover:scale-110 transition-transform">
             <Workflow size={60} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic">Strategic Node Offline</h3>
            <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px] italic">Select a mission from the command menu to initialize telemetry.</p>
          </div>
          <Button 
            className="bg-accent text-accent-foreground font-black h-16 px-12 rounded-2xl uppercase text-[10px] tracking-widest shadow-2xl shadow-accent/20 hover:bg-accent/90 transition-all active:scale-95 italic"
            onClick={() => {
              const trigger = document.querySelector('button[role="combobox"]');
              if (trigger instanceof HTMLElement) trigger.click();
            }}
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
                className={cn("relative")}
              >
                {!canScore && (
                  <div className="absolute top-6 right-6 z-50">
                    <Badge className="bg-amber-500 text-primary-foreground border-none font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/20 flex items-center gap-2">
                       <ShieldCheck size={12} /> Read-Only Access
                    </Badge>
                  </div>
                )}
                {selectedMatch.sport === 'cricket' && (
                  <CricketIngestor match={selectedMatch} onUpdate={handleUpdateMatchScore} isSyncing={isSyncing} players={players} teams={teams} canScore={canScore} />
                )}
                {selectedMatch.sport === 'football' && (
                  <FootballIngestor match={selectedMatch} onUpdate={handleUpdateMatchScore} isSyncing={isSyncing} players={players} teams={teams} canScore={canScore} />
                )}
                {selectedMatch.sport === 'badminton' && (
                  <BadmintonIngestor match={selectedMatch} onUpdate={handleUpdateMatchScore} isSyncing={isSyncing} players={players} canScore={canScore} />
                )}
              </motion.div>
            </AnimatePresence>
            
            {/* Tactical Feed */}
            <Card className="rounded-[48px] border-none shadow-2xl shadow-black/40 overflow-hidden bg-card">
              <CardHeader className="p-10 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground italic flex items-center gap-3 leading-none">
                  <ActivityIcon size={18} className="text-accent" /> Automated Narrative Feed
                </CardTitle>
                {isGeneratingCommentary && (
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                        <span className="text-[8px] font-black uppercase text-accent tracking-widest leading-none">Quantum Logic Ingestion...</span>
                    </div>
                )}
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                <div className="space-y-4">
                  {commentary.map((c, i) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={`comment-${i}`} 
                        className="bg-muted/30 p-6 rounded-[28px] border border-border border-l-4 border-l-accent transition-all hover:bg-card hover:shadow-xl group"
                    >
                      <div className="flex justify-between items-start mb-3">
                         <span className="text-[14px] font-black text-foreground italic leading-none">{c.event}</span>
                         <Badge className="bg-accent/10 text-accent border-none font-black text-[8px] px-2 py-0.5 rounded-full">{c.tone}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground/80 font-bold leading-relaxed">{c.commentary}</p>
                    </motion.div>
                  ))}
                  {commentary.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center gap-6 opacity-40">
                         <div className="w-16 h-16 bg-muted/30 rounded-[20px] flex items-center justify-center text-foreground/80">
                            <Mic2 size={32} />
                         </div>
                         <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest italic">Awaiting tactical data for narrative generation</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-10">
            <Card className="rounded-[40px] border-none shadow-2xl shadow-black/40 overflow-hidden bg-card">
              <CardHeader className="p-8 border-b border-border bg-primary text-primary-foreground">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 italic leading-none">
                  <ShieldCheck size={18} className="text-accent/80" /> Session Lock
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-6 text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">
                  Operational finalization will archive all matrix data and terminate the telemetry stream.
                </p>
                <Button 
                   className="w-full bg-primary text-primary-foreground font-black h-16 rounded-2xl uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/20 hover:bg-primary transition-all active:scale-95 italic"
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

            <Card className="rounded-[40px] border-none shadow-2xl shadow-black/40 overflow-hidden bg-card">
               <CardHeader className="p-8 border-b border-border">
                  <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground italic leading-none">Inbound Logs</CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-accent/10 border border-accent/10">
                     <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary-foreground shadow-lg shadow-accent/20">
                        <Zap size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-tight italic">Low Latency</p>
                        <p className="text-[8px] font-black uppercase text-accent/80 tracking-widest mt-1">Matrix Verified</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                     <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground">
                        <Users size={20} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-tight italic">Squad Synced</p>
                        <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mt-1">Auth Completed</p>
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

// Sub-interfaces
function CricketIngestor({ match, onUpdate, isSyncing, players, teams, canScore }: any) {
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
    match.participants.includes(p.id) && (p.primarySport === 'cricket' || p.primarySport === 'both' || p.primarySport === undefined)
  );

  const getTeamCode = (name?: string) => {
    if (!name) return 'UNK';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0] + (parts[2]?.[0] || parts[1][1] || '')).toUpperCase();
    return name.substring(0, 3).toUpperCase();
  };

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
        bowler.runs += 1; 
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
        const temp = strikerId;
        setStrikerId(nonStrikerId);
        setNonStrikerId(temp);
      }
    }

    if (runs % 2 !== 0 && !extraType) {
      const temp = strikerId;
      setStrikerId(nonStrikerId);
      setNonStrikerId(temp);
    }

    newScore.ballsHistory = [...(newScore.ballsHistory || []), isWicket ? -1 : runs];
    if (newScore.ballsHistory.length > 24) newScore.ballsHistory.shift();

    let eventType = 'ball';
    if (isWicket) eventType = 'wicket';
    else if (runs === 4) eventType = 'four';
    else if (runs === 6) eventType = 'six';

    onUpdate(newScore, eventType);
  };

  const currentBattingTeam = score[battingTeamKey];
  const currentStriker = currentBattingTeam.scorecard?.batting.find((b: any) => b.playerId === strikerId);

  return (
    <Card className="rounded-[64px] border-none shadow-2xl shadow-accent/10 overflow-hidden bg-card">
      {/* IPL BROADCAST STYLE SCOREBOARD */}
      <div className="bg-gradient-to-r from-primary via-card/50 to-primary/90 p-8 text-primary-foreground relative border-b border-border/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        <div className="relative z-10 flex flex-col gap-8">
           {/* Team Info & Main Score */}
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 border-b border-border/10 pb-8">
              <div className="flex items-center gap-8 group">
                 <div className="w-20 h-20 rounded-[28px] bg-accent text-accent-foreground flex items-center justify-center font-black text-2xl italic shadow-2xl transform group-hover:rotate-6 transition-transform">
                   {getTeamCode(currentTeamIndex === 1 ? team1?.name : team2?.name)}
                 </div>
                 <div className="space-y-1">
                    <span className="text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] italic block">CURRENT INNINGS</span>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase whitespace-nowrap">
                       {(currentTeamIndex === 1 ? team1?.name : team2?.name) || 'Tactical Squad'}
                    </h2>
                 </div>
              </div>

              <div className="text-center md:text-right group">
                 <motion.div 
                   key={currentBattingTeam.runs}
                   initial={{ scale: 1.2, color: '#fbbf24' }}
                   animate={{ scale: 1, color: '#ffffff' }}
                   className="text-8xl font-black italic tracking-tighter leading-none"
                 >
                    {currentBattingTeam.runs}<span className="text-primary-foreground/20 text-6xl mx-2 font-normal">/</span>{currentBattingTeam.wickets}
                 </motion.div>
                 <div className="flex items-center justify-center md:justify-end gap-3 mt-4">
                    <Badge className="bg-accent text-accent-foreground border-none font-black text-[11px] uppercase tracking-widest px-6 py-2 rounded-full shadow-lg shadow-accent/20">
                       {currentBattingTeam.overs}.{currentBattingTeam.balls} OVERS
                    </Badge>
                 </div>
              </div>
           </div>

           {/* Live Assets - Striker/Bowler Mini Stats */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card/10 backdrop-blur-md rounded-[32px] p-6 border border-border/10 flex items-center justify-between hover:bg-card/10 transition-all cursor-default">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-amber-400 rounded-full" />
                    <div>
                       <p className="text-[10px] font-black text-primary-foreground/50 uppercase tracking-widest leading-none mb-2">STRIKER</p>
                       <p className="text-lg font-black italic uppercase leading-none">{currentStriker?.name || 'Awaiting Asset'}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-2xl font-black italic text-amber-400">{currentStriker?.runs || 0}</p>
                    <p className="text-[10px] font-black text-primary-foreground/70 uppercase tracking-widest">({currentStriker?.balls || 0})</p>
                 </div>
              </div>

              <div className="bg-card/10 backdrop-blur-md rounded-[32px] p-6 border border-border/10 flex items-center justify-between hover:bg-card/10 transition-all cursor-default">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-card/20 rounded-full" />
                    <div>
                       <p className="text-[10px] font-black text-primary-foreground/50 uppercase tracking-widest leading-none mb-2">PARTNER</p>
                       <p className="text-lg font-black italic uppercase leading-none">
                         {currentBattingTeam.scorecard?.batting.find((b: any) => b.playerId === nonStrikerId)?.name || 'Syncing...'}
                       </p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-2xl font-black italic text-primary-foreground/50">
                       {currentBattingTeam.scorecard?.batting.find((b: any) => b.playerId === nonStrikerId)?.runs || 0}
                    </p>
                 </div>
              </div>

              <div className="bg-primary/20 backdrop-blur-md rounded-[32px] p-6 border border-accent/20 flex items-center justify-between hover:bg-primary/30 transition-all cursor-default overflow-hidden relative">
                 <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
                    <Users size={80} />
                 </div>
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-2 h-8 bg-accent/70 rounded-full animate-pulse" />
                    <div>
                       <p className="text-[10px] font-black text-accent/50 uppercase tracking-widest leading-none mb-2">BOWLER</p>
                       <p className="text-lg font-black italic uppercase leading-none">
                         {(score[bowlingTeamKey].scorecard?.bowling.find((b: any) => b.playerId === bowlerId)?.name) || 'Selecting...'}
                       </p>
                    </div>
                 </div>
                 <div className="text-right relative z-10">
                    <p className="text-2xl font-black italic text-accent/80">
                       {(score[bowlingTeamKey].scorecard?.bowling.find((b: any) => b.playerId === bowlerId)?.wickets || 0)}-{(score[bowlingTeamKey].scorecard?.bowling.find((b: any) => b.playerId === bowlerId)?.runs || 0)}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <CardContent className="p-12 space-y-12 bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Control Hub */}
           <div className="md:col-span-2 space-y-10 bg-card p-10 rounded-[48px] shadow-inner border border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-4 text-muted-foreground italic">Command Striker</Label>
                  <Select value={strikerId} onValueChange={setStrikerId}>
                    <SelectTrigger className="h-16 rounded-[24px] bg-muted/30 border-none px-8 font-black uppercase text-[10px] italic shadow-sm hover:bg-muted transition-all ring-offset-background focus:ring-0">
                      <SelectValue placeholder="Identify Personnel" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[24px] border-none shadow-2xl p-2 bg-card">
                       {battingPlayers.map(p => (
                         <SelectItem key={p.id} value={p.id} className="rounded-xl font-black text-[10px] uppercase py-4 italic transition-all">{p.name}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-4 text-muted-foreground italic">Wingman Asset</Label>
                  <Select value={nonStrikerId} onValueChange={setNonStrikerId}>
                    <SelectTrigger className="h-16 rounded-[24px] bg-muted/30 border-none px-8 font-black uppercase text-[10px] italic shadow-sm hover:bg-muted transition-all ring-offset-background focus:ring-0">
                      <SelectValue placeholder="Identify Support" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[24px] border-none shadow-2xl p-2 bg-card">
                       {battingPlayers.map(p => (
                         <SelectItem key={p.id} value={p.id} className="rounded-xl font-black text-[10px] uppercase py-4 italic transition-all">{p.name}</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] ml-4 text-accent italic">Opposition Projectile Agent (Bowler)</Label>
                <Select value={bowlerId} onValueChange={setBowlerId}>
                  <SelectTrigger className="h-16 rounded-[24px] bg-accent/20 border-none px-8 font-black uppercase text-[10px] text-accent italic shadow-sm hover:bg-accent/10 transition-all ring-offset-background focus:ring-0">
                    <SelectValue placeholder="Select Threat" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[24px] border-none shadow-2xl p-2 bg-card">
                     {players.filter(p => match.participants.includes(p.id) && p.id !== strikerId && p.id !== nonStrikerId).map(p => (
                       <SelectItem key={p.id} value={p.id} className="rounded-xl font-black text-[10px] uppercase py-4 italic transition-all">{p.name}</SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                  {[0, 1, 2, 3, 4, 6].map(r => (
                    <Button 
                      key={r}
                      className={cn(
                        "h-20 rounded-[32px] font-black text-3xl italic shadow-xl transition-all active:scale-90 group relative overflow-hidden",
                        r === 4 ? "bg-primary hover:bg-primary/80 text-primary-foreground shadow-accent/30" : 
                        r === 6 ? "bg-amber-500 hover:bg-amber-600 text-primary-foreground shadow-amber-200" : 
                        "bg-primary hover:bg-muted text-primary-foreground shadow-muted-foreground/40"
                      )}
                      disabled={!strikerId || !bowlerId || !canScore}
                      onClick={() => updateStats(r)}
                    >
                      <span className="relative z-10">{r}</span>
                      {r >= 4 && <div className="absolute inset-0 bg-card/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />}
                    </Button>
                  ))}
                  <Button 
                    variant="outline"
                    className="h-20 rounded-[32px] border-2 border-emerald-100 text-emerald-600 font-black text-[11px] uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95"
                    disabled={!canScore}
                    onClick={() => updateStats(1, false, 'wide')}
                  >
                    WIDE
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-20 rounded-[32px] border-2 border-amber-100 text-amber-600 font-black text-[11px] uppercase tracking-widest hover:bg-amber-50 transition-all active:scale-95"
                    disabled={!canScore}
                    onClick={() => updateStats(1, false, 'noball')}
                  >
                    NO BALL
                  </Button>
                  <Button 
                    className="col-span-2 h-20 rounded-[32px] bg-red-600 hover:bg-red-700 shadow-2xl shadow-red-200 text-primary-foreground font-black text-[12px] uppercase tracking-[0.2em] italic active:scale-95 transition-all"
                    onClick={() => updateStats(0, true)}
                    disabled={!strikerId || !bowlerId || !canScore}
                  >
                    EXTRACT ASSET (WICKET)
                  </Button>
                </div>
              </div>
           </div>

           {/* Pulse History */}
           <div className="space-y-10 lg:pl-10">
              <div className="bg-card rounded-[48px] p-10 border border-border shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-primary/40">
                    <ActivityIcon size={120} />
                </div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3 italic text-foreground relative z-10">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Live Broadcast Ticker
                </h4>
                <div className="flex flex-wrap gap-3 relative z-10">
                  {score.ballsHistory?.slice(-18).reverse().map((ball, i) => (
                    <motion.div 
                      key={`bh-${i}`} 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-2 italic shadow-md transition-all hover:scale-110 cursor-pointer",
                        ball === 4 ? "bg-primary text-primary-foreground border-accent/70 shadow-accent/10" :
                        ball === 6 ? "bg-amber-500 text-primary-foreground border-amber-300 shadow-amber-100" :
                        ball === -1 ? "bg-red-600 text-primary-foreground border-red-400 shadow-red-100" :
                        "bg-card text-foreground border-border"
                      )}
                    >
                      {ball === -1 ? 'W' : ball}
                    </motion.div>
                  )) || <div className="col-span-4 py-8 text-center text-foreground/80 text-[10px] font-black uppercase tracking-widest italic">Awaiting Impact...</div>}
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] ml-8 italic text-muted-foreground flex items-center gap-3">
                    <Target size={14} /> FIELD STATUS
                 </h4>
                 <Button 
                   variant="ghost"
                   className="w-full h-20 rounded-[32px] bg-accent/10 border-2 border-accent/10 text-accent font-black uppercase tracking-widest text-[11px] hover:bg-accent/10 transition-all italic flex items-center justify-center gap-3"
                   onClick={() => onUpdate({ ...score, currentInnings: score.currentInnings === 1 ? 2 : 1 })}
                 >
                    Invert Tactical Orientation (Switch Innings)
                 </Button>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FootballIngestor({ match, onUpdate, isSyncing, players, teams, canScore }: any) {
  const score = match.score as FootballScore;
  const team1 = teams.find((t: any) => t.id === match.team1Id);
  const team2 = teams.find((t: any) => t.id === match.team2Id);
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
        toast.error("Tactical alert: Personnel must be identified before disciplinary action.");
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
    match.participants.includes(p.id) && (p.primarySport === 'football' || p.primarySport === 'both' || p.primarySport === undefined)
  );

  return (
    <Card className="rounded-[64px] border-none shadow-2xl shadow-accent/10 overflow-hidden bg-card">
        {/* FIFA BROADCAST STYLE SCOREBOARD */}
        <CardHeader className="bg-gradient-to-b from-primary to-primary/90 p-16 text-primary-foreground relative flex flex-col items-center gap-12 overflow-hidden border-b border-border/5">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Calendar size={240} className="rotate-12" />
           </div>
           
           <div className="flex flex-col md:flex-row items-center gap-16 relative z-10 w-full justify-between max-w-5xl">
              <div className="text-center space-y-4 flex-1 w-full order-2 md:order-1 transition-all group">
                 <div className="w-24 h-24 rounded-full bg-card/10 border border-border/10 flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden group-hover:scale-110 transition-transform">
                    {team1?.logoURL ? <img src={team1.logoURL} className="w-full h-full object-cover" /> : <div className="text-3xl font-black italic">{team1?.name?.[0]}</div>}
                 </div>
                 <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic text-accent/80 truncate max-w-[200px] mx-auto">{team1?.name || 'ALPHA FORCE'}</h3>
              </div>
              
              <div className="flex flex-col items-center gap-8 order-1 md:order-2">
                 <div className="bg-primary/20 backdrop-blur-xl border border-accent/30 px-8 py-3 rounded-full flex items-center gap-4">
                    <Clock size={18} className="text-accent/80" />
                    <span className="text-3xl md:text-5xl font-black text-primary-foreground italic font-mono tracking-tighter leading-none">{score.time || 0}<span className="text-primary-foreground/20 animate-pulse">:</span>00</span>
                 </div>
                 <div className="flex items-center gap-6">
                    <motion.div 
                        key={`t1score-${score.team1.goals}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-8xl md:text-[140px] font-black italic text-primary-foreground tracking-tighter leading-none"
                    >
                        {score.team1.goals}
                    </motion.div>
                    <div className="text-4xl md:text-6xl font-black text-primary-foreground/10 italic leading-none">-</div>
                    <motion.div 
                        key={`t2score-${score.team2.goals}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-8xl md:text-[140px] font-black italic text-primary-foreground/20 tracking-tighter leading-none"
                    >
                        {score.team2.goals}
                    </motion.div>
                 </div>
              </div>

              <div className="text-center space-y-4 flex-1 w-full order-3 transition-all group">
                 <div className="w-24 h-24 rounded-full bg-card/10 border border-border/10 flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden group-hover:scale-110 transition-transform">
                    {team2?.logoURL ? <img src={team2.logoURL} className="w-full h-full object-cover" /> : <div className="text-3xl font-black italic text-primary-foreground/20">{team2?.name?.[0]}</div>}
                 </div>
                 <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic text-primary-foreground/70 truncate max-w-[200px] mx-auto">{team2?.name || 'GHOST UNIT'}</h3>
              </div>
           </div>
           
           <div className="flex gap-4 relative z-10 mt-8 pt-8 border-t border-border/5 w-full justify-center">
              <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl bg-card/10 border border-border/10 text-primary-foreground/70 hover:bg-red-500/20 hover:text-primary-foreground transition-all shadow-xl" disabled={!canScore} onClick={() => updateTime(-1)}><Minus size={20} /></Button>
              <Button size="icon" variant="ghost" className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40 hover:bg-accent transition-all font-black text-lg active:scale-90" disabled={!canScore} onClick={() => updateTime(1)}><Plus size={24} /></Button>
           </div>
        </CardHeader>
        
        <CardContent className="p-16 space-y-16 bg-muted/20">
           <div className="max-w-2xl mx-auto space-y-8 bg-card p-10 rounded-[48px] shadow-2xl shadow-black/40 border border-border relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <Label className="text-[11px] font-black uppercase tracking-[0.5em] ml-4 text-muted-foreground italic block mb-2 relative z-10">TACTICAL ASSET IDENTIFICATION</Label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId} disabled={!canScore}>
                <SelectTrigger className="h-18 rounded-[28px] bg-muted/20 border-2 border-border px-10 font-black uppercase text-[11px] italic shadow-sm hover:bg-muted transition-all ring-offset-background focus:ring-0 relative z-10 group/select">
                  <SelectValue placeholder="Identify Personnel for Delta Operation" />
                </SelectTrigger>
                <SelectContent className="rounded-[28px] border-none shadow-2xl p-2 bg-card scale-95 origin-top transition-all">
                   {participantPlayers.map(p => (
                     <SelectItem key={p.id} value={p.id} className="rounded-xl font-black text-[11px] uppercase py-4 px-6 italic transition-all hover:translate-x-1">{p.name}</SelectItem>
                   ))}
                </SelectContent>
              </Select>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-12">
                 <div className="text-center group">
                    <h4 className="text-[12px] font-black uppercase text-muted tracking-[0.4em] italic mb-10 flex items-center justify-center gap-3">
                       <Target size={16} className="text-accent" /> ALPHA COMMAND
                    </h4>
                    <div className="flex justify-center gap-8">
                       <Button variant="outline" className="h-24 w-24 rounded-[40px] border-2 border-border text-muted-foreground/60 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-inner active:scale-95" disabled={!canScore} onClick={() => updateGoals('team1', -1)}><Minus size={32} /></Button>
                       <Button className="h-24 w-24 rounded-[40px] bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:bg-primary transition-all active:scale-90 group-hover:shadow-accent/20" disabled={!canScore} onClick={() => updateGoals('team1', 1)}><Plus size={32} /></Button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6 p-2">
                    <Button variant="outline" className="h-16 rounded-[24px] border-2 border-amber-100 bg-amber-50/30 text-amber-600 font-black uppercase text-[10px] tracking-widest hover:bg-amber-100 italic transition-all active:scale-95 shadow-sm" disabled={!canScore} onClick={() => addCard('team1', 'yellow')}>
                       <div className="w-4 h-6 bg-amber-400 rounded-sm mr-3 shadow-md" /> Yellow Card
                    </Button>
                    <Button variant="outline" className="h-16 rounded-[24px] border-2 border-red-100 bg-red-50/30 text-red-600 font-black uppercase text-[10px] tracking-widest hover:bg-red-100 italic transition-all active:scale-95 shadow-sm" disabled={!canScore} onClick={() => addCard('team1', 'red')}>
                       <div className="w-4 h-6 bg-red-600 rounded-sm mr-3 shadow-md" /> Red Card
                    </Button>
                 </div>
              </div>
              
              <div className="space-y-12">
                 <div className="text-center group">
                    <h4 className="text-[12px] font-black uppercase text-muted-foreground tracking-[0.4em] italic mb-10 flex items-center justify-center gap-3">
                       GHOST PROTOCOL <ActivityIcon size={16} />
                    </h4>
                    <div className="flex justify-center gap-8">
                       <Button variant="outline" className="h-24 w-24 rounded-[40px] border-2 border-border text-muted-foreground/60 hover:bg-muted/30 transition-all shadow-inner active:scale-95" disabled={!canScore} onClick={() => updateGoals('team2', -1)}><Minus size={32} /></Button>
                       <Button className="h-24 w-24 rounded-[40px] bg-card border-2 border-border text-muted-foreground font-black shadow-2xl shadow-black/40 hover:bg-primary hover:text-primary-foreground transition-all active:scale-90" disabled={!canScore} onClick={() => updateGoals('team2', 1)}><Plus size={32} /></Button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6 p-2">
                    <Button variant="outline" className="h-16 rounded-[24px] border-2 border-border bg-muted/20 text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:bg-amber-50 hover:text-amber-600 hover:border-amber-100 italic transition-all active:scale-95" disabled={!canScore} onClick={() => addCard('team2', 'yellow')}>
                       <div className="w-4 h-6 bg-amber-400/30 rounded-sm mr-3" /> Yellow Card
                    </Button>
                    <Button variant="outline" className="h-16 rounded-[24px] border-2 border-border bg-muted/20 text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 italic transition-all active:scale-95" disabled={!canScore} onClick={() => addCard('team2', 'red')}>
                       <div className="w-4 h-6 bg-red-600/30 rounded-sm mr-3" /> Red Card
                    </Button>
                 </div>
              </div>
           </div>
        </CardContent>
    </Card>
  );
}

function BadmintonIngestor({ match, onUpdate, isSyncing, players, canScore }: any) {
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
    match.participants.includes(p.id) && (p.primarySport === 'badminton' || p.primarySport === 'both' || p.primarySport === undefined)
  );

  return (
    <Card className="rounded-[64px] border-none shadow-2xl shadow-accent/10 overflow-hidden bg-card">
        <CardHeader className="bg-muted/30 p-10 border-b border-border">
           <div className="flex flex-wrap justify-center gap-6">
              {sets.map((s: any, i: number) => (
                <Button 
                    key={`set-btn-${i}`}
                    variant={currentSet === i ? 'default' : 'ghost'}
                    className={cn(
                        "h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest italic transition-all",
                        currentSet === i ? "bg-primary text-primary-foreground shadow-xl shadow-primary/10" : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => onUpdate({ ...score, currentSet: i })}
                >
                    Sub-Session {i+1}
                </Button>
              ))}
              {sets.length < 3 && (
                <Button 
                    variant="ghost" 
                    className="h-14 w-14 rounded-2xl border-2 border-dashed border-border text-muted-foreground/60 hover:bg-muted transition-all font-black"
                    disabled={!canScore}
                    onClick={nextSet}
                >
                    <Plus size={20} />
                </Button>
              )}
           </div>
        </CardHeader>
        
        <CardContent className="p-8 md:p-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20">
               <div className="text-center space-y-6 md:space-y-10 flex-1 group w-full">
                  <div className="text-7xl md:text-[120px] font-black text-accent tracking-tighter leading-none italic transition-all group-hover:scale-110">{sets[currentSet].player1}</div>
                  <div className="space-y-4">
                     <p className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">ALPHA ASSET</p>
                     <div className="flex justify-center gap-4">
                        <Button variant="outline" className="h-14 md:h-16 w-14 md:w-16 rounded-2xl md:rounded-[28px] border-border text-muted-foreground/60 hover:bg-muted/30 transition-all" disabled={!canScore} onClick={() => updateScore('player1', -1)}><Minus size={20} md:size={24} /></Button>
                        <Button className="h-14 md:h-16 w-14 md:w-16 rounded-2xl md:rounded-[28px] bg-accent text-primary-foreground shadow-xl shadow-accent/20 hover:bg-primary transition-all active:scale-90" disabled={!canScore} onClick={() => updateScore('player1', 1)}><Plus size={20} md:size={24} /></Button>
                     </div>
                  </div>
               </div>

               <div className="text-center flex flex-row md:flex-col items-center gap-4 md:gap-6">
                  <div className="w-12 md:w-px h-px md:h-16 bg-muted" />
                  <span className="text-xl md:text-3xl font-black text-muted italic tracking-[0.2em] md:tracking-[0.4em]">VS</span>
                  <div className="w-12 md:w-px h-px md:h-16 bg-muted" />
               </div>

               <div className="text-center space-y-6 md:space-y-10 flex-1 group w-full">
                  <div className="text-7xl md:text-[120px] font-black text-foreground/80 tracking-tighter leading-none italic transition-all group-hover:scale-110 group-hover:text-foreground">{sets[currentSet].player2}</div>
                  <div className="space-y-4">
                     <p className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">BETA ASSET</p>
                     <div className="flex justify-center gap-4">
                        <Button variant="outline" className="h-14 md:h-16 w-14 md:w-16 rounded-2xl md:rounded-[28px] border-border text-muted-foreground/60 hover:bg-muted/30 transition-all" disabled={!canScore} onClick={() => updateScore('player2', -1)}><Minus size={20} md:size={24} /></Button>
                        <Button className="h-14 md:h-16 w-14 md:w-16 rounded-2xl md:rounded-[28px] bg-card border-2 border-primary text-foreground shadow-2xl shadow-black/40 hover:bg-primary hover:text-primary-foreground transition-all active:scale-90" disabled={!canScore} onClick={() => updateScore('player2', 1)}><Plus size={20} md:size={24} /></Button>
                     </div>
                  </div>
               </div>
            </div>
        </CardContent>
    </Card>
  );
}
