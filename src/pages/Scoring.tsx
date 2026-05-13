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
  CheckCircle2
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
} from "@/components/ui/select";
import { 
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { dataService } from '@/services/dataService';
import { Player, Match, Team } from '@/types';

export default function Scoring() {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);

  React.useEffect(() => {
    const unsubPlayers = dataService.getPlayers(setPlayers);
    const unsubTeams = dataService.getTeams(setTeams);
    return () => {
      unsubPlayers();
      unsubTeams();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Live Scoring Engine</h2>
          <p className="text-text-light text-sm mt-1">Real-time match management and automatic data synchronization.</p>
        </div>
      </div>

      <Tabs defaultValue="cricket" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-xl">
          <TabsTrigger value="cricket" className="data-[state=active]:bg-primary data-[state=active]:text-secondary font-bold rounded-lg">Cricket</TabsTrigger>
          <TabsTrigger value="football" className="data-[state=active]:bg-primary data-[state=active]:text-secondary font-bold rounded-lg">Football</TabsTrigger>
          <TabsTrigger value="badminton" className="data-[state=active]:bg-primary data-[state=active]:text-secondary font-bold rounded-lg">Badminton</TabsTrigger>
        </TabsList>

        <TabsContent value="cricket" className="mt-6">
          <CricketScorer players={players} teams={teams} />
        </TabsContent>

        <TabsContent value="football" className="mt-6">
          <FootballScorer players={players} teams={teams} />
        </TabsContent>

        <TabsContent value="badminton" className="mt-6">
          <BadmintonScorer players={players} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CricketScorer({ players, teams }: { players: Player[], teams: Team[] }) {
  const [score, setScore] = React.useState({ runs: 0, wickets: 0, overs: 0, balls: 0 });
  const [ballsHistory, setBallsHistory] = React.useState<number[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = React.useState<string>("");
  const [guestName, setGuestName] = React.useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("");
  const [isSyncing, setIsSyncing] = React.useState(false);
  
  const addBall = (runs: number, isWicket = false) => {
    setBallsHistory(prev => [isWicket ? -1 : runs, ...prev].slice(0, 6));
    setScore(prev => {
      let newBalls = prev.balls + 1;
      let newOvers = prev.overs;
      if (newBalls === 6) {
        newBalls = 0;
        newOvers += 1;
      }
      return {
        runs: prev.runs + runs,
        wickets: prev.wickets + (isWicket ? 1 : 0),
        overs: newOvers,
        balls: newBalls
      };
    });
  };

  const handleFinalize = async () => {
    if (!selectedPlayerId && !guestName) {
      toast.error("Please select a player or enter guest name.");
      return;
    }
    const team = teams.find(t => t.id === selectedTeamId);
    setIsSyncing(true);
    
    const attributionId = selectedPlayerId === "guest" ? `guest_${guestName}` : selectedPlayerId;
    const attributionName = selectedPlayerId === "guest" ? guestName : players.find(p => p.id === selectedPlayerId)?.name;

    try {
      let finalPlayerId = selectedPlayerId;
      if (selectedPlayerId === 'guest' && guestName) {
        // Quick register if user wants to (or just default to quick register for better UX as per request)
        const newPlayer: Omit<Player, 'id'> = {
          name: guestName,
          joinedDate: new Date().toISOString(),
          primarySport: 'cricket',
          status: 'prospect',
          stats: {
            cricket: { runs: 0, wickets: 0, matches: 0, strikeRate: 0, average: 0 },
            football: { goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 },
            badminton: { wins: 0, matches: 0, winRate: 0 }
          },
          photoURL: `https://picsum.photos/seed/${guestName.replace(/\s+/g, '')}/400`
        };
        const id = await dataService.addPlayer(newPlayer);
        if (id) finalPlayerId = id;
      }

      await dataService.finalizeMatch({
        title: `Cricket: ${team ? team.name : (attributionName || 'Friendly')}`,
        date: new Date().toISOString(),
        sport: 'cricket',
        participants: [finalPlayerId],
        status: 'completed',
        score: { 
          team1: { ...score },
          team2: { runs: 0, wickets: 0, overs: 0, balls: 0 },
          currentInnings: 1,
          ballsHistory
        }
      }, finalPlayerId.startsWith('guest_') ? [] : [{ 
        playerId: finalPlayerId, 
        stats: { runs: score.runs, wickets: score.wickets } 
      }]);
      toast.success('Match saved successfully!');
      setScore({ runs: 0, wickets: 0, overs: 0, balls: 0 });
      setBallsHistory([]);
      setSelectedPlayerId("");
      setGuestName("");
    } catch (error) {
      toast.error("Failed to finalize match.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 shadow-card border-border-custom overflow-hidden">
        <CardHeader className="bg-primary text-secondary pb-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-black uppercase tracking-widest">Match: Cricket Engine</CardTitle>
            <Badge variant="secondary" className="bg-accent text-primary font-black uppercase tracking-widest text-[10px]">LIVE</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="text-8xl font-black text-primary tracking-tighter">
              {score.runs} <span className="text-text-light/30">/</span> {score.wickets}
            </div>
            <div className="text-2xl font-black text-text-light/60 uppercase tracking-widest">
              Overs: {score.overs}.{score.balls}
            </div>
            
            {ballsHistory.length > 0 && (
              <div className="flex justify-center gap-2 pt-4">
                {ballsHistory.map((ball, i) => (
                  <div key={i} className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border transition-all",
                    ball === 4 ? "bg-blue-600 border-blue-500 text-white" : 
                    ball === 6 ? "bg-purple-600 border-purple-500 text-white" :
                    ball === -1 ? "bg-red-600 border-red-500 text-white" : "bg-muted border-border-custom text-primary"
                  )}>
                    {ball === -1 ? "W" : ball}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 mt-12">
            {[0, 1, 2, 3, 4, 6].map(r => (
              <Button 
                key={r} 
                onClick={() => addBall(r)}
                className="h-16 text-xl font-black bg-white border-2 border-border-custom text-primary hover:bg-primary hover:text-secondary transition-all shadow-sm"
              >
                {r}
              </Button>
            ))}
            <Button 
              onClick={() => addBall(0, true)}
              className="h-16 text-xl font-black bg-red-600 text-white hover:bg-red-700 shadow-sm"
            >
              W
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border-custom">
        <CardHeader className="border-b border-muted">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Match Controls</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-text-light">Associated Team (Optional)</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="border-border-custom font-bold">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.filter(t => t.sport === 'cricket').map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-text-light">Select Striker (Sync Target)</Label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="border-border-custom font-bold">
                  <SelectValue placeholder="Select a player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest" className="font-bold text-accent">Guest Player (Not in List)</SelectItem>
                   <DropdownMenuSeparator className="bg-muted" />
                  {(selectedTeamId 
                    ? players.filter(p => teams.find(t => t.id === selectedTeamId)?.playerIds.includes(p.id)) 
                    : players.filter(p => p.primarySport === 'cricket')
                  ).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlayerId === 'guest' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-text-light">Guest Name</Label>
                <Input 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter guest name"
                  className="border-border-custom font-bold"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <Button 
              disabled={isSyncing}
              className="w-full bg-primary text-secondary font-black uppercase text-xs tracking-widest h-12" 
              onClick={handleFinalize}
            >
              {isSyncing ? "Syncing..." : <><Save size={18} className="mr-2" /> Save & Sync Stats</>}
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-primary text-primary font-black uppercase text-xs tracking-widest h-12 hover:bg-primary/5" 
              onClick={() => {
                setScore({ runs: 0, wickets: 0, overs: 0, balls: 0 });
                setBallsHistory([]);
                setSelectedPlayerId("");
                setGuestName("");
              }}
            >
              <RotateCcw size={18} className="mr-2" />
              Reset Scorecard
            </Button>
          </div>
          
          <div className="pt-4 border-t border-muted">
            <h4 className="text-[10px] font-black text-text-light uppercase tracking-widest mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-500" /> Auto-Sync Active
            </h4>
            <p className="text-[10px] text-text-light/60 font-medium">Player stats will be incremented instantly upon save.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FootballScorer({ players, teams }: { players: Player[], teams: Team[] }) {
  const [score, setScore] = React.useState({ team1: 0, team2: 0 });
  const [time, setTime] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = React.useState<string>("");
  const [guestName, setGuestName] = React.useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("");
  const [isSyncing, setIsSyncing] = React.useState(false);

  React.useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleFinalize = async () => {
    if (!selectedPlayerId && !guestName) {
      toast.error("Select a player or enter guest name.");
      return;
    }
    const team = teams.find(t => t.id === selectedTeamId);
    setIsSyncing(true);
    
    const attributionId = selectedPlayerId === "guest" ? `guest_${guestName}` : selectedPlayerId;
    const attributionName = selectedPlayerId === "guest" ? guestName : players.find(p => p.id === selectedPlayerId)?.name;

    try {
      let finalPlayerId = selectedPlayerId;
      if (selectedPlayerId === 'guest' && guestName) {
        const newPlayer: Omit<Player, 'id'> = {
          name: guestName,
          joinedDate: new Date().toISOString(),
          primarySport: 'football',
          status: 'prospect',
          stats: {
            cricket: { runs: 0, wickets: 0, matches: 0, strikeRate: 0, average: 0 },
            football: { goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 },
            badminton: { wins: 0, matches: 0, winRate: 0 }
          },
          photoURL: `https://picsum.photos/seed/${guestName.replace(/\s+/g, '')}/400`
        };
        const id = await dataService.addPlayer(newPlayer);
        if (id) finalPlayerId = id;
      }

      await dataService.finalizeMatch({
        title: `Football: ${team ? team.name : (attributionName || 'Friendly')}`,
        date: new Date().toISOString(),
        sport: 'football',
        participants: [finalPlayerId],
        status: 'completed',
        score: { 
          team1: { goals: score.team1, scorers: [], assists: [], cards: [] },
          team2: { goals: score.team2, scorers: [], assists: [], cards: [] },
          time: Math.floor(time / 60)
        }
      }, finalPlayerId.startsWith('guest_') ? [] : [{ 
        playerId: finalPlayerId, 
        stats: { goals: score.team1, assists: 0 } 
      }]);
      toast.success('Football stats synced successfully!');
      setScore({ team1: 0, team2: 0 });
      setTime(0);
      setIsActive(false);
      setSelectedPlayerId("");
      setGuestName("");
    } catch (error) {
      toast.error("Failed to sync football stats.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 shadow-card border-border-custom overflow-hidden">
        <CardHeader className="bg-primary text-secondary pb-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-black uppercase tracking-widest">Football Scorer</CardTitle>
            <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
              <Clock size={16} />
              <span className="font-black tracking-widest text-sm">{Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-12">
          <div className="flex items-center justify-around">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 rounded-3xl bg-muted flex items-center justify-center text-6xl font-black text-primary border-4 border-border-custom shadow-inner">
                {score.team1}
              </div>
              <p className="font-black text-primary uppercase tracking-widest text-sm">Academy</p>
              <Button variant="outline" className="border-primary text-primary font-bold hover:bg-primary/5 w-full" onClick={() => setScore(s => ({ ...s, team1: s.team1 + 1 }))}>+ Goal</Button>
            </div>
            
            <div className="text-4xl font-black text-text-light/10 italic tracking-tighter">VS</div>

            <div className="text-center space-y-4">
              <div className="w-32 h-32 rounded-3xl bg-muted flex items-center justify-center text-6xl font-black text-primary border-4 border-border-custom shadow-inner">
                {score.team2}
              </div>
              <p className="font-black text-primary uppercase tracking-widest text-sm">Opponent</p>
              <Button variant="outline" className="border-primary text-primary font-bold hover:bg-primary/5 w-full" onClick={() => setScore(s => ({ ...s, team2: s.team2 + 1 }))}>+ Goal</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border-custom">
        <CardHeader className="border-b border-muted">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Match Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-text-light">Select Team</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="border-border-custom font-bold">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.filter(t => t.sport === 'football').map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-text-light">Attribute Success To</Label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="border-border-custom font-bold">
                  <SelectValue placeholder="Select a player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest" className="font-bold text-accent">Guest Player (Not in List)</SelectItem>
                  <DropdownMenuSeparator className="bg-muted" />
                  {(selectedTeamId 
                    ? players.filter(p => teams.find(t => t.id === selectedTeamId)?.playerIds.includes(p.id)) 
                    : players.filter(p => p.primarySport === 'football')
                  ).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlayerId === 'guest' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-text-light">Guest Name</Label>
                <Input 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter guest name"
                  className="border-border-custom font-bold"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              className={cn("w-full h-12 font-black uppercase text-xs tracking-widest", isActive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white")}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? <Pause size={18} className="mr-2" /> : <Play size={18} className="mr-2" />}
              {isActive ? 'Pause Clock' : 'Start Match'}
            </Button>
            <Button 
              disabled={isSyncing}
              className="w-full bg-primary text-secondary font-black uppercase text-xs tracking-widest h-12" 
              onClick={handleFinalize}
            >
              {isSyncing ? "Finalizing..." : <><Save size={18} className="mr-2" /> Finalize Match</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BadmintonScorer({ players }: { players: Player[] }) {
  const [sets, setSets] = React.useState([{ p1: 0, p2: 0 }]);
  const [player1Id, setPlayer1Id] = React.useState<string>("");
  const [player2Id, setPlayer2Id] = React.useState<string>("");
  const [guest1Name, setGuest1Name] = React.useState<string>("");
  const [guest2Name, setGuest2Name] = React.useState<string>("");
  const [isSyncing, setIsSyncing] = React.useState(false);
  
  const currentSet = sets.length - 1;

  const updateScore = (player: 'p1' | 'p2', amount: number) => {
    const newSets = [...sets];
    newSets[currentSet][player] = Math.max(0, newSets[currentSet][player] + amount);
    setSets(newSets);
  };

  const nextSet = () => {
    setSets([...sets, { p1: 0, p2: 0 }]);
  };

  const handleFinalize = async () => {
    if ((!player1Id && !guest1Name) || (!player2Id && !guest2Name)) {
      toast.error("Both players must be selected or named.");
      return;
    }
    setIsSyncing(true);
    
    // Calculate winner
    let p1Wins = 0;
    let p2Wins = 0;
    sets.forEach(s => {
      if (s.p1 > s.p2) p1Wins++;
      else if (s.p2 > s.p1) p2Wins++;
    });

    const p1AttributionId = player1Id === "guest" ? `guest_${guest1Name}` : player1Id;
    const p1AttributionName = player1Id === "guest" ? guest1Name : players.find(p=>p.id===player1Id)?.name;
    const p2AttributionId = player2Id === "guest" ? `guest_${guest2Name}` : player2Id;
    const p2AttributionName = player2Id === "guest" ? guest2Name : players.find(p=>p.id===player2Id)?.name;

    try {
      let finalP1Id = player1Id;
      let finalP2Id = player2Id;

      if (player1Id === 'guest' && guest1Name) {
        const id = await dataService.addPlayer({
          name: guest1Name,
          joinedDate: new Date().toISOString(),
          primarySport: 'badminton',
          status: 'prospect',
          stats: {
            cricket: { runs: 0, wickets: 0, matches: 0, strikeRate: 0, average: 0 },
            football: { goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 },
            badminton: { wins: 0, matches: 0, winRate: 0 }
          },
          photoURL: `https://picsum.photos/seed/${guest1Name.replace(/\s+/g, '')}/400`
        });
        if (id) finalP1Id = id;
      }

      if (player2Id === 'guest' && guest2Name) {
        const id = await dataService.addPlayer({
          name: guest2Name,
          joinedDate: new Date().toISOString(),
          primarySport: 'badminton',
          status: 'prospect',
          stats: {
            cricket: { runs: 0, wickets: 0, matches: 0, strikeRate: 0, average: 0 },
            football: { goals: 0, assists: 0, matches: 0, yellowCards: 0, redCards: 0 },
            badminton: { wins: 0, matches: 0, winRate: 0 }
          },
          photoURL: `https://picsum.photos/seed/${guest2Name.replace(/\s+/g, '')}/400`
        });
        if (id) finalP2Id = id;
      }

      const syncTargets: any[] = [];
      if (!finalP1Id.startsWith('guest_') && finalP1Id) syncTargets.push({ playerId: finalP1Id, stats: { isWinner: p1Wins > p2Wins } });
      if (!finalP2Id.startsWith('guest_') && finalP2Id) syncTargets.push({ playerId: finalP2Id, stats: { isWinner: p2Wins > p1Wins } });

      await dataService.finalizeMatch({
        title: `Badminton: ${p1AttributionName} vs ${p2AttributionName}`,
        date: new Date().toISOString(),
        sport: 'badminton',
        participants: [finalP1Id, finalP2Id],
        status: 'completed',
        score: { 
          sets: sets.map(s => ({ player1: s.p1, player2: s.p2 })),
          currentSet: sets.length
        }
      }, syncTargets);
      toast.success('Badminton stats synced!');
      setSets([{ p1: 0, p2: 0 }]);
      setPlayer1Id("");
      setPlayer2Id("");
      setGuest1Name("");
      setGuest2Name("");
    } catch (error) {
      toast.error("Failed to sync match.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 shadow-card border-border-custom overflow-hidden">
        <CardHeader className="bg-primary text-secondary pb-6">
          <CardTitle className="text-lg font-black uppercase tracking-widest text-center">Badminton Court Management</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-10">
            <div className="flex gap-3 overflow-x-auto w-full justify-center pb-2">
              {sets.map((set, i) => (
                <div key={i} className={cn(
                  "px-4 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-widest transition-all shrink-0",
                  i === currentSet ? "border-primary bg-primary text-secondary shadow-md" : "border-muted text-text-light/40"
                )}>
                  Set {i + 1}: {set.p1} - {set.p2}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-around w-full">
              <div className="text-center space-y-4 w-1/3">
                <div className="text-7xl font-black text-primary tracking-tighter">{sets[currentSet].p1}</div>
                <Select value={player1Id} onValueChange={setPlayer1Id}>
                  <SelectTrigger className="border-border-custom font-bold">
                    <SelectValue placeholder="P1" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest" className="font-bold text-accent">Guest</SelectItem>
                    <DropdownMenuSeparator className="bg-muted" />
                    {players.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {player1Id === 'guest' && (
                  <Input 
                    value={guest1Name} 
                    onChange={(e) => setGuest1Name(e.target.value)} 
                    placeholder="Name" 
                    className="border-border-custom font-bold h-8 text-xs"
                  />
                )}
                <div className="flex gap-2 justify-center">
                  <Button size="icon" variant="outline" className="border-border-custom text-primary h-10 w-10" onClick={() => updateScore('p1', -1)}><Minus size={16} /></Button>
                  <Button size="icon" className="bg-primary text-secondary h-10 w-10 shadow-md" onClick={() => updateScore('p1', 1)}><Plus size={16} /></Button>
                </div>
              </div>

              <div className="text-2xl font-black text-text-light/10 italic tracking-tighter">VS</div>

              <div className="text-center space-y-4 w-1/3">
                <div className="text-7xl font-black text-primary tracking-tighter">{sets[currentSet].p2}</div>
                <Select value={player2Id} onValueChange={setPlayer2Id}>
                  <SelectTrigger className="border-border-custom font-bold">
                    <SelectValue placeholder="P2" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest" className="font-bold text-accent">Guest</SelectItem>
                    <DropdownMenuSeparator className="bg-muted" />
                    {players.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {player2Id === 'guest' && (
                  <Input 
                    value={guest2Name} 
                    onChange={(e) => setGuest2Name(e.target.value)} 
                    placeholder="Name" 
                    className="border-border-custom font-bold h-8 text-xs"
                  />
                )}
                <div className="flex gap-2 justify-center">
                  <Button size="icon" variant="outline" className="border-border-custom text-primary h-10 w-10" onClick={() => updateScore('p2', -1)}><Minus size={16} /></Button>
                  <Button size="icon" className="bg-primary text-secondary h-10 w-10 shadow-md" onClick={() => updateScore('p2', 1)}><Plus size={16} /></Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border-custom">
        <CardHeader className="border-b border-muted">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Match Controls</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Button className="w-full bg-secondary text-primary border border-primary font-black uppercase text-xs tracking-widest h-12 hover:bg-primary/5" onClick={nextSet}>
            Next Set
          </Button>
          <Button 
            disabled={isSyncing}
            className="w-full bg-primary text-secondary font-black uppercase text-xs tracking-widest h-12" 
            onClick={handleFinalize}
          >
            {isSyncing ? "Finalizing..." : <><Save size={18} className="mr-2" /> Finish Match</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
