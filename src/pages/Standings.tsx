import * as React from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Search, 
  Target,
  BarChart3,
  Calendar,
  Filter,
  Users
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { dataService } from '@/services/dataService';
import { Tournament, Team, Standing } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export default function Standings() {
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = React.useState<string>('');
  const [standings, setStandings] = React.useState<Standing[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubTournaments = dataService.getTournaments((data) => {
      setTournaments(data);
      if (data.length > 0 && !selectedTournament) {
        setSelectedTournament(data[0].id!);
      }
      setLoading(false);
    });
    const unsubTeams = dataService.getTeams(setTeams);

    return () => {
      unsubTournaments();
      unsubTeams();
    };
  }, []);

  React.useEffect(() => {
    if (!selectedTournament) return;
    const unsubStandings = dataService.getStandings(selectedTournament, setStandings);
    return () => unsubStandings();
  }, [selectedTournament]);

  const tournament = tournaments.find(t => t.id === selectedTournament);

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-border">
        <div className="space-y-2">
          <h2 className="text-5xl font-display font-black text-foreground tracking-tighter uppercase italic flex items-center gap-3 leading-none">
            Competitive <span className="text-accent underline decoration-accent/30 underline-offset-8">Standings</span>
          </h2>
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2 italic">
             Tournament Rankings & Predictive Analytics
          </p>
        </div>

        <div className="flex items-center gap-4">
           <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-[300px] bg-card h-16 rounded-[24px] border-border shadow-2xl shadow-black/50 font-black text-[10px] uppercase tracking-widest px-8 group hover:bg-accent hover:text-accent-foreground transition-all ring-offset-background focus:ring-0">
                <SelectValue placeholder="Select Tournament" />
              </SelectTrigger>
              <SelectContent className="rounded-[24px] border-border shadow-2xl p-2 bg-card text-foreground">
                {tournaments.map(t => (
                  <SelectItem key={t.id} value={t.id!} className="rounded-xl font-black text-[10px] uppercase py-3.5 px-4">{t.name}</SelectItem>
                ))}
              </SelectContent>
           </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-10">
          <Card className="rounded-[48px] border-none shadow-2xl shadow-black/50 overflow-hidden bg-card">
            <CardHeader className="bg-primary text-primary-foreground p-10 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                 <Trophy size={24} className="text-accent" />
                 <CardTitle className="text-[12px] font-black uppercase tracking-[0.3em] italic">Qualified Matrix • {tournament?.name}</CardTitle>
              </div>
              <Badge className="bg-card/10 text-primary-foreground border-none font-black text-[10px] uppercase py-1 px-4 rounded-full italic">{tournament?.sport}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Position</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Squad Intelligence</th>
                      <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">P</th>
                      <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">W</th>
                      <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">L</th>
                      <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">D</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-accent text-center">PTS</th>
                      {tournament?.sport === 'cricket' && <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">NRR</th>}
                      {tournament?.sport === 'football' && <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">GD</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => {
                      const team = teams.find(t => t.id === s.teamId);
                      return (
                        <motion.tr 
                          key={s.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors group"
                        >
                          <td className="px-10 py-8">
                            <span className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-sm border-2",
                              i < 4 ? "bg-accent text-accent-foreground border-accent shadow-xl shadow-accent/20" : "bg-card text-muted-foreground border-border"
                            )}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-6 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg overflow-hidden">
                                 {team?.logoURL ? <img src={team.logoURL} alt="" /> : <Users size={20} />}
                              </div>
                              <span className="text-[14px] font-black uppercase text-foreground italic tracking-tight">{team?.name || 'Unknown Squad'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-8 text-sm font-black text-muted-foreground text-center">{s.played}</td>
                          <td className="px-4 py-8 text-sm font-black text-emerald-500 text-center">{s.won}</td>
                          <td className="px-4 py-8 text-sm font-black text-red-500 text-center">{s.lost}</td>
                          <td className="px-4 py-8 text-sm font-black text-muted-foreground text-center">{s.draw || 0}</td>
                          <td className="px-6 py-8 text-xl font-black text-accent text-center italic">{s.points}</td>
                          {tournament?.sport === 'cricket' && (
                            <td className="px-10 py-8 text-sm font-black text-muted-foreground text-right">
                                {s.netRunRate > 0 ? '+' : ''}{s.netRunRate.toFixed(3)}
                            </td>
                          )}
                          {tournament?.sport === 'football' && (
                            <td className="px-10 py-8 text-sm font-black text-muted-foreground text-right">
                                {s.goalDifference > 0 ? '+' : ''}{s.goalDifference}
                            </td>
                          )}
                        </motion.tr>
                      );
                    })}
                    {standings.length === 0 && (
                      <tr>
                        <td colSpan={tournament?.sport === 'cricket' || tournament?.sport === 'football' ? 8 : 7} className="px-10 py-32 text-center">
                          <BarChart3 size={48} className="mx-auto text-muted border border-border mb-6" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Quantitative matrix awaiting first transmissions...</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
           <Card className="rounded-[40px] border-none shadow-2xl shadow-black/50 overflow-hidden bg-card">
              <CardHeader className="p-8 border-b border-border bg-primary text-primary-foreground">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 italic leading-none">
                    <Target size={18} className="text-accent/30" /> Qualification Intelligence
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 <div className="space-y-4 text-foreground">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Main Draw Quota</span>
                       <span className="text-[10px] font-black text-emerald-500 italic">4 Units</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                       <div className="w-3/4 h-full bg-accent rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                    </div>
                 </div>
                 
                 <div className="space-y-6 pt-4">
                    <div className="flex gap-4 items-center">
                       <div className="w-2 h-2 rounded-full bg-accent shadow-xl shadow-accent/50" />
                       <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest leading-relaxed">Top 4 squads transition to knockout phase.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                       <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                       <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest leading-relaxed">Secondary matrix calculated via NRR/GD.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-[40px] border-none shadow-2xl shadow-black/50 overflow-hidden bg-card">
              <CardHeader className="p-8 border-b border-border">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground italic leading-none">Performance Surge</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="space-y-6">
                    {standings.slice(0, 3).map((s, i) => {
                      const team = teams.find(t => t.id === s.teamId);
                      return (
                        <div key={`surge-${i}`} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-muted-foreground">#{i+1}</span>
                              <span className="text-xs font-black uppercase italic text-foreground tracking-tight">{team?.name || 'N/A'}</span>
                           </div>
                           <TrendingUp size={14} className="text-emerald-500" />
                        </div>
                      );
                    })}
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
