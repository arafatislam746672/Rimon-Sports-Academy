import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
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
  MapPin
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
import { Match, Player, CricketScore, FootballScore, BadmintonScore, Team } from '@/types';
import { cn } from '@/lib/utils';

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = React.useState<Match | null>(null);
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    
    const unsubMatch = dataService.getMatch(id, (m) => {
      setMatch(m);
      setLoading(false);
    });

    const unsubPlayers = dataService.getPlayers(setPlayers);
    const unsubTeams = dataService.getTeams(setTeams);

    return () => {
      unsubMatch();
      unsubPlayers();
      unsubTeams();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-primary uppercase tracking-widest">Match Not Found</h2>
        <Link to="/schedule">
          <Button className="mt-4 bg-primary text-secondary font-black uppercase text-xs tracking-widest px-8">Back to Schedule</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link to="/schedule">
        <Button variant="ghost" className="text-text-light font-black uppercase text-[10px] tracking-widest hover:bg-muted mb-2">
          <ChevronLeft size={16} className="mr-1" /> Back to matches
        </Button>
      </Link>

      <div className="bg-primary text-secondary rounded-[2rem] overflow-hidden shadow-2xl relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <CardHeader className="relative z-10 pt-10 pb-6 border-b border-secondary/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
              <Badge className="bg-accent text-primary font-black uppercase tracking-[0.2em] text-[10px] px-3 py-1">
                {match.sport} • {match.status}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none">
                {match.title}
              </h1>
              <div className="flex items-center gap-4 text-secondary/60 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-accent" /> {new Date(match.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-accent" /> {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-accent" /> Academy Ground</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className="rounded-xl border-secondary/20 hover:bg-secondary/10">
                <Share2 size={18} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 md:p-12 relative z-10">
          {match.sport === 'cricket' && <CricketScoreboard score={match.score as CricketScore} teams={teams} players={players} />}
          {match.sport === 'football' && <FootballScoreboard score={match.score as FootballScore} teams={teams} players={players} />}
          {match.sport === 'badminton' && <BadmintonScoreboard score={match.score as BadmintonScore} players={players} />}
        </CardContent>
      </div>

      <Tabs defaultValue="scorecard" className="w-full">
        <TabsList className="bg-muted p-1 rounded-2xl w-full max-w-md mx-auto grid grid-cols-3 mb-8">
          <TabsTrigger value="scorecard" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-secondary">Full Scorecard</TabsTrigger>
          <TabsTrigger value="info" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-secondary">Match Info</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-secondary">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="scorecard" className="animate-in fade-in duration-500">
           {match.sport === 'cricket' ? (
             <DetailedCricketScorecard score={match.score as CricketScore} players={players} />
           ) : (
             <div className="text-center py-20 bg-muted/30 rounded-[2rem] border-2 border-dashed border-muted">
                <Info size={48} className="mx-auto text-muted mb-4" />
                <p className="text-text-light font-black uppercase tracking-widest text-xs opacity-40 italic">Scorecard for {match.sport} coming soon</p>
             </div>
           )}
        </TabsContent>
        
        <TabsContent value="info" className="animate-in fade-in duration-500">
          <Card className="rounded-[2rem] border-border-custom shadow-card overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <section>
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                        <Activity size={16} /> Venue Details
                      </h3>
                      <div className="space-y-4">
                         <div className="flex justify-between border-b border-muted pb-2">
                            <span className="text-text-light/60 font-bold uppercase text-[10px]">Stadium</span>
                            <span className="text-primary font-black uppercase text-[10px]">Elite Athlete Grounds</span>
                         </div>
                         <div className="flex justify-between border-b border-muted pb-2">
                            <span className="text-text-light/60 font-bold uppercase text-[10px]">Location</span>
                            <span className="text-primary font-black uppercase text-[10px]">Dhaka, Bangladesh</span>
                         </div>
                         <div className="flex justify-between border-b border-muted pb-2">
                            <span className="text-text-light/60 font-bold uppercase text-[10px]">Capacity</span>
                            <span className="text-primary font-black uppercase text-[10px]">5,000</span>
                         </div>
                      </div>
                   </section>
                </div>
                
                <div className="space-y-6">
                   <section>
                      <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                        <Users size={16} /> Match Officials
                      </h3>
                      <div className="space-y-4">
                         <div className="flex justify-between border-b border-muted pb-2">
                            <span className="text-text-light/60 font-bold uppercase text-[10px]">Umpire 1</span>
                            <span className="text-primary font-black uppercase text-[10px]">Kabir Hossain</span>
                         </div>
                         <div className="flex justify-between border-b border-muted pb-2">
                            <span className="text-text-light/60 font-bold uppercase text-[10px]">Umpire 2</span>
                            <span className="text-primary font-black uppercase text-[10px]">Rahat Ahmed</span>
                         </div>
                         <div className="flex justify-between border-b border-muted pb-2">
                            <span className="text-text-light/60 font-bold uppercase text-[10px]">Match Referee</span>
                            <span className="text-primary font-black uppercase text-[10px]">Shakil Tanvir</span>
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
  // Mocking "current" stats if not present for visual depth
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 md:gap-4">
        {/* Team 1 Score */}
        <div className="text-center space-y-2">
           <div className="w-20 h-20 bg-accent/20 rounded-3xl mx-auto flex items-center justify-center mb-2 border border-accent/30">
              <Trophy size={40} className="text-accent" />
           </div>
           <h3 className="text-xs font-black uppercase tracking-widest text-secondary/60">First Innings</h3>
           <div className="text-6xl font-black tracking-tighter">
              {score.team1.runs} <span className="text-secondary/20">/</span> {score.team1.wickets}
           </div>
           <div className="text-xs font-bold text-accent uppercase tracking-[0.2em]">
             Overs: {score.team1.overs}.{score.team1.balls}
           </div>
        </div>

        {/* VS / Middle Info */}
        <div className="flex flex-col items-center justify-center gap-4">
           <div className="bg-secondary/5 px-6 py-3 rounded-full border border-secondary/10">
              <span className="text-2xl font-black italic opacity-20 tracking-widest">VS</span>
           </div>
           {score.ballsHistory && score.ballsHistory.length > 0 && (
              <div className="flex gap-2">
                 {score.ballsHistory.map((ball, i) => (
                    <div key={i} className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border",
                      ball === 4 ? "bg-blue-600 border-blue-500" : 
                      ball === 6 ? "bg-purple-600 border-purple-500" :
                      ball === -1 ? "bg-red-600 border-red-500" : "bg-secondary/10 border-secondary/20"
                    )}>
                      {ball === -1 ? "W" : ball}
                    </div>
                 ))}
              </div>
           )}
        </div>

        {/* Team 2 Score */}
        <div className="text-center space-y-2">
           <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto flex items-center justify-center mb-2 border border-white/10">
              <Users size={40} className="text-secondary/20" />
           </div>
           <h3 className="text-xs font-black uppercase tracking-widest text-secondary/60">Second Innings</h3>
           <div className="text-6xl font-black tracking-tighter">
              {score.team2.runs} <span className="text-secondary/20">/</span> {score.team2.wickets}
           </div>
           <div className="text-xs font-bold text-secondary/40 uppercase tracking-[0.2em]">
             Overs: {score.team2.overs}.{score.team2.balls}
           </div>
        </div>
      </div>

      {score.currentInnings === 2 && score.team1.runs > score.team2.runs && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-center">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-accent">
               Need {score.team1.runs - score.team2.runs + 1} runs to win
            </p>
        </div>
      )}
    </div>
  );
}

function DetailedCricketScorecard({ score, players }: { score: CricketScore, players: Player[] }) {
  return (
    <div className="space-y-8">
      <Card className="rounded-[2rem] border-border-custom shadow-card overflow-hidden">
        <CardHeader className="bg-primary text-secondary p-6">
           <div className="flex justify-between items-center">
             <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Team 1 Batting</CardTitle>
             <span className="text-xl font-black">{score.team1.runs}/{score.team1.wickets} ({score.team1.overs}.{score.team1.balls})</span>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60">Batter</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60 text-right">R</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60 text-right">B</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60 text-right">4s</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60 text-right">6s</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60 text-right">SR</th>
              </tr>
            </thead>
            <tbody>
              {score.team1.scorecard?.batting.map((b, i) => (
                <tr key={i} className="border-b border-muted last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User size={14} className="text-primary/40" />
                       </div>
                       <div>
                         <p className="text-sm font-black text-primary">{b.name} {b.status === 'playing' && "*"}</p>
                         <p className="text-[9px] font-bold text-text-light/40 uppercase tracking-widest">{b.status}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-primary text-right">{b.runs}</td>
                  <td className="px-4 py-4 text-sm font-bold text-text-light text-right">{b.balls}</td>
                  <td className="px-4 py-4 text-sm font-bold text-text-light text-right">{b.fours}</td>
                  <td className="px-4 py-4 text-sm font-bold text-text-light text-right">{b.sixes}</td>
                  <td className="px-6 py-4 text-sm font-black text-accent text-right">
                    {((b.runs / (b.balls || 1)) * 100).toFixed(1)}
                  </td>
                </tr>
              ))}
              {!score.team1.scorecard?.batting && (
                 <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-light/40 italic font-medium text-xs">No batting data recorded</td>
                 </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-border-custom shadow-card overflow-hidden">
        <CardHeader className="bg-primary text-secondary p-6">
           <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Team 2 Bowling</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60">Bowler</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60 text-right">O</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60 text-right">M</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60 text-right">R</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60 text-right">W</th>
                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-text-light/60 text-right">ECO</th>
              </tr>
            </thead>
            <tbody>
              {score.team1.scorecard?.bowling.map((b, i) => (
                <tr key={i} className="border-b border-muted last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-black text-primary">{b.name}</td>
                  <td className="px-4 py-4 text-sm font-black text-primary text-right">{b.overs}</td>
                  <td className="px-4 py-4 text-sm font-bold text-text-light text-right">{b.maidens}</td>
                  <td className="px-4 py-4 text-sm font-bold text-text-light text-right">{b.runs}</td>
                  <td className="px-4 py-4 text-sm font-black text-accent text-right">{b.wickets}</td>
                  <td className="px-6 py-4 text-sm font-black text-primary text-right">
                    {(b.runs / (b.overs || 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
              {!score.team1.scorecard?.bowling && (
                 <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-text-light/40 italic font-medium text-xs">No bowling data recorded</td>
                 </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function FootballScoreboard({ score, teams, players }: { score: FootballScore, teams: Team[], players: Player[] }) {
  return (
    <div className="flex items-center justify-around">
      <div className="text-center space-y-6">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-accent/20 border-2 border-accent/20 flex items-center justify-center text-8xl md:text-9xl font-black text-accent shadow-inner">
           {score.team1.goals}
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tighter uppercase leading-tight">Academy FC</h3>
          <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Home</p>
        </div>
      </div>

      <div className="text-center space-y-2">
         <div className="bg-secondary/10 px-4 py-1 rounded-full border border-secondary/20">
            <span className="text-xs font-black tracking-[0.3em] opacity-40 uppercase">Match Time</span>
         </div>
         <div className="text-4xl md:text-5xl font-black italic tracking-tighter opacity-10">VS</div>
         <div className="text-2xl font-black text-accent tracking-tighter">{score.time}'</div>
      </div>

      <div className="text-center space-y-6">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] bg-white/5 border-2 border-white/10 flex items-center justify-center text-8xl md:text-9xl font-black text-secondary/40 shadow-inner">
           {score.team2.goals}
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tighter uppercase leading-tight">Opponents</h3>
          <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest">Away</p>
        </div>
      </div>
    </div>
  );
}

function BadmintonScoreboard({ score, players }: { score: BadmintonScore, players: Player[] }) {
  return (
     <div className="space-y-8">
        <div className="flex items-center justify-center gap-4 py-4 overflow-x-auto">
           {score.sets.map((set, i) => (
             <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[9px] font-black text-secondary/40 uppercase tracking-widest">Set {i+1}</span>
                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
                   <span className={cn("text-2xl font-black", set.player1 > set.player2 ? "text-accent" : "text-secondary")}>{set.player1}</span>
                   <span className="text-xs font-black opacity-10">—</span>
                   <span className={cn("text-2xl font-black", set.player2 > set.player1 ? "text-accent" : "text-secondary")}>{set.player2}</span>
                </div>
             </div>
           ))}
        </div>
        
        <div className="text-center">
           <p className="text-sm font-black uppercase tracking-[0.2em] text-accent">
              Game in Progress • Set {score.currentSet}
           </p>
        </div>
     </div>
  );
}
