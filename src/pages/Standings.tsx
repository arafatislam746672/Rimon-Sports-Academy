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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3 leading-none">
            Competitive <span className="text-indigo-500">Standings</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2 italic">
             Tournament Rankings & Predictive Analytics
          </p>
        </div>

        <div className="flex items-center gap-4">
           <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-[300px] bg-white h-16 rounded-[24px] border-none shadow-2xl shadow-slate-200/50 font-black text-[10px] uppercase tracking-widest px-8 group hover:bg-slate-900 hover:text-white transition-all ring-offset-transparent focus:ring-0">
                <SelectValue placeholder="Select Tournament" />
              </SelectTrigger>
              <SelectContent className="rounded-[24px] border-none shadow-2xl p-2">
                {tournaments.map(t => (
                  <SelectItem key={t.id} value={t.id!} className="rounded-xl font-black text-[10px] uppercase py-3.5 px-4">{t.name}</SelectItem>
                ))}
              </SelectContent>
           </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-10">
          <Card className="rounded-[48px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <CardHeader className="bg-slate-900 text-white p-10 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                 <Trophy size={24} className="text-indigo-400" />
                 <CardTitle className="text-[12px] font-black uppercase tracking-[0.3em] italic">Qualified Matrix • {tournament?.name}</CardTitle>
              </div>
              <Badge className="bg-white/10 text-white border-none font-black text-[10px] uppercase py-1 px-4 rounded-full italic">{tournament?.sport}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Position</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Squad Intelligence</th>
                      <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">P</th>
                      <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">W</th>
                      <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">L</th>
                      <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">D</th>
                      <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-indigo-500 text-center">PTS</th>
                      {tournament?.sport === 'cricket' && <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">NRR</th>}
                      {tournament?.sport === 'football' && <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">GD</th>}
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
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-10 py-8">
                            <span className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-sm border-2",
                              i < 4 ? "bg-indigo-500 text-white border-indigo-400 shadow-xl shadow-indigo-500/20" : "bg-white text-slate-200 border-slate-100"
                            )}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-6 py-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden">
                                 {team?.logoURL ? <img src={team.logoURL} alt="" /> : <Users size={20} />}
                              </div>
                              <span className="text-[14px] font-black uppercase text-slate-900 italic tracking-tight">{team?.name || 'Unknown Squad'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-8 text-sm font-black text-slate-600 text-center">{s.played}</td>
                          <td className="px-4 py-8 text-sm font-black text-emerald-500 text-center">{s.won}</td>
                          <td className="px-4 py-8 text-sm font-black text-red-500 text-center">{s.lost}</td>
                          <td className="px-4 py-8 text-sm font-black text-slate-400 text-center">{s.draw || 0}</td>
                          <td className="px-6 py-8 text-xl font-black text-indigo-500 text-center italic">{s.points}</td>
                          {tournament?.sport === 'cricket' && (
                            <td className="px-10 py-8 text-sm font-black text-slate-400 text-right">
                                {s.netRunRate > 0 ? '+' : ''}{s.netRunRate.toFixed(3)}
                            </td>
                          )}
                          {tournament?.sport === 'football' && (
                            <td className="px-10 py-8 text-sm font-black text-slate-400 text-right">
                                {s.goalDifference > 0 ? '+' : ''}{s.goalDifference}
                            </td>
                          )}
                        </motion.tr>
                      );
                    })}
                    {standings.length === 0 && (
                      <tr>
                        <td colSpan={tournament?.sport === 'cricket' || tournament?.sport === 'football' ? 8 : 7} className="px-10 py-32 text-center">
                          <BarChart3 size={48} className="mx-auto text-slate-200 mb-6" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic">Quantitative matrix awaiting first transmissions...</p>
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
           <Card className="rounded-[40px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
              <CardHeader className="p-8 border-b border-slate-50 bg-slate-900 text-white">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 italic leading-none">
                    <Target size={18} className="text-indigo-400" /> Qualification Intelligence
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Main Draw Quota</span>
                       <span className="text-[10px] font-black text-emerald-500 italic">4 Units</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                       <div className="w-3/4 h-full bg-indigo-500 rounded-full" />
                    </div>
                 </div>
                 
                 <div className="space-y-6 pt-4">
                    <div className="flex gap-4 items-center">
                       <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-xl shadow-indigo-500/50" />
                       <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Top 4 squads transition to knockout phase.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                       <div className="w-2 h-2 rounded-full bg-slate-200" />
                       <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Secondary matrix calculated via NRR/GD.</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="rounded-[40px] border-none shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
              <CardHeader className="p-8 border-b border-slate-50">
                 <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 italic leading-none">Performance Surge</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="space-y-6">
                    {standings.slice(0, 3).map((s, i) => {
                      const team = teams.find(t => t.id === s.teamId);
                      return (
                        <div key={i} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-slate-200">#{i+1}</span>
                              <span className="text-xs font-black uppercase italic text-slate-900 tracking-tight">{team?.name || 'N/A'}</span>
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
