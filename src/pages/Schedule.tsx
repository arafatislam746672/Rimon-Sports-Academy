import * as React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
  Check
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { motion } from 'motion/react';

import { dataService } from '@/services/dataService';
import { Match, Player, Sport } from '@/types';
import { Link } from 'react-router-dom';

const mockSchedule = [
  { id: 1, title: 'Cricket Training', time: '07:00 AM - 09:00 AM', location: 'Main Ground', type: 'Training', sport: 'Cricket' },
  { id: 2, title: 'Football Match: Academy vs City', time: '04:00 PM - 05:30 PM', location: 'Field A', type: 'Match', sport: 'Football' },
  { id: 3, title: 'Badminton Drills', time: '06:00 PM - 07:30 PM', location: 'Indoor Court', type: 'Training', sport: 'Badminton' },
];

import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function Schedule() {
  const { profile } = useAuth();
  const isManagement = profile?.role === 'management' || profile?.isSuperAdmin;
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: '',
    sport: 'cricket' as Sport,
    date: new Date().toISOString().split('T')[0],
    participants: [] as string[]
  });

  React.useEffect(() => {
    const unsub = dataService.getMatches((data) => {
      setMatches(data);
      setLoading(false);
    });
    const unsubPlayers = dataService.getPlayers(setPlayers);
    return () => {
      unsub();
      unsubPlayers();
    };
  }, []);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.participants.length < 2) {
      toast.error("Security Breach: At least 2 personnel required for mission.");
      return;
    }
    setIsSubmitting(true);
    try {
      const initialScore = formData.sport === 'cricket' ? {
        team1: { runs: 0, wickets: 0, overs: 0, balls: 0 },
        team2: { runs: 0, wickets: 0, overs: 0, balls: 0 },
        currentInnings: 1,
        ballsHistory: []
      } : formData.sport === 'football' ? {
        team1: { goals: 0 },
        team2: { goals: 0 },
        time: 0
      } : {
        sets: [{ player1: 0, player2: 0 }],
        currentSet: 0
      };

      await dataService.addMatch({
        title: formData.title,
        sport: formData.sport,
        date: formData.date,
        participants: formData.participants,
        status: 'live',
        score: initialScore as any
      });

      toast.success("Mission Authorized: Data stream established.");
      setIsAddDialogOpen(false);
      setFormData({
        title: '',
        sport: 'cricket',
        date: new Date().toISOString().split('T')[0],
        participants: []
      });
    } catch (error) {
      toast.error("Authorization Failed: Database rejection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            Academy <span className="text-indigo-500">Timeline</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
            <CalendarIcon size={14} className="text-indigo-500" /> Chronological Pulse
          </p>
        </div>
        {isManagement && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger nativeButton={false} render={<Button className="bg-slate-900 text-white h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/10 hover:bg-indigo-600 transition-all active:scale-95 italic" />}>
              <Plus size={20} className="mr-3" /> Initialize Mission
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white border-none rounded-[48px] p-0 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)]">
              <div className="bg-slate-900 p-10 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap size={100} className="rotate-12" />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-2">Initialize Mission</h3>
                <p className="text-[9px] font-black uppercase text-indigo-400 tracking-[0.3em]">Protocol Alpha: New Match Entry</p>
              </div>
              
              <form onSubmit={handleAddMatch} className="p-10 space-y-6">
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-4">Mission Designation</Label>
                    <Input 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. CHAMPIONS TROPHY SEMI-FINAL" 
                      className="h-14 rounded-2xl bg-slate-50 border-none font-black text-[10px] uppercase px-6 italic"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-4">Asset Track</Label>
                    <Select value={formData.sport} onValueChange={(v: any) => setFormData({...formData, sport: v})}>
                      <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-black text-[10px] uppercase px-6 italic">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                        <SelectItem value="cricket" className="font-black text-[9px] uppercase italic">Cricket Core</SelectItem>
                        <SelectItem value="football" className="font-black text-[9px] uppercase italic">Football Matrix</SelectItem>
                        <SelectItem value="badminton" className="font-black text-[9px] uppercase italic">Badminton Node</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-4">Deployment Date</Label>
                    <Input 
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="h-14 rounded-2xl bg-slate-50 border-none font-black text-[10px] uppercase px-6 italic"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-4">Personnel Assignment</Label>
                    <div className="max-h-[150px] overflow-y-auto p-4 rounded-2xl bg-slate-50 space-y-2 no-scrollbar border-4 border-white">
                      {players.map(player => (
                        <div 
                          key={player.id} 
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all",
                            formData.participants.includes(player.id) ? "bg-indigo-500 text-white" : "bg-white hover:bg-slate-100"
                          )}
                          onClick={() => {
                            const newParticipants = formData.participants.includes(player.id)
                              ? formData.participants.filter(id => id !== player.id)
                              : [...formData.participants, player.id];
                            setFormData({...formData, participants: newParticipants});
                          }}
                        >
                          <span className="text-[9px] font-black uppercase italic">{player.name}</span>
                          {formData.participants.includes(player.id) && <Check size={12} />}
                        </div>
                      ))}
                    </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 bg-slate-900 text-white font-black uppercase tracking-[0.4em] italic rounded-2xl shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'SECURE INGESTION...' : 'AUTHORIZE MISSION'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Calendar Sidebar */}
        <Card className="lg:col-span-1 border-none shadow-2xl shadow-slate-200/50 rounded-[48px] overflow-hidden bg-white h-fit">
          <CardHeader className="p-8 pb-6 border-b border-slate-50 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">May 2026</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"><ChevronLeft size={18} /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"><ChevronRight size={18} /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-7 gap-2 text-center text-[9px] font-black text-slate-300 mb-6 uppercase tracking-widest">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-10 flex items-center justify-center text-[11px] font-black rounded-xl cursor-pointer transition-all",
                    i + 1 === 13 
                      ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-110 ring-4 ring-slate-100" 
                      : "hover:bg-slate-50 text-slate-400 hover:text-indigo-500"
                  )}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center gap-4 px-6 py-4 bg-indigo-50 rounded-[30px] border border-indigo-100/50">
            <div className="p-2 bg-indigo-500 rounded-xl text-white">
              <CalendarIcon size={16} />
            </div>
            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] italic">
              Planned Academy Agenda
            </h3>
          </div>
          
          <div className="space-y-6">
            {matches.map((match, i) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="elite-card border-none shadow-2xl shadow-slate-200/50 rounded-[40px] group transition-all overflow-hidden bg-white hover:ring-1 hover:ring-indigo-500/20">
                  <CardContent className="p-0 flex">
                    <div className={cn(
                      "w-2.5 shrink-0 transition-colors duration-500",
                      match.sport === 'cricket' ? 'bg-indigo-500' : 
                      match.sport === 'football' ? 'bg-emerald-500' : 'bg-amber-500'
                    )} />
                    <div className="p-10 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-slate-100 bg-slate-50 text-slate-400 px-3 py-1 rounded-full">
                            {match.status}
                          </Badge>
                          <div className="flex items-center gap-2">
                             <div className={cn(
                               "w-1.5 h-1.5 rounded-full animate-pulse",
                               match.sport === 'cricket' ? 'bg-indigo-500' : 
                               match.sport === 'football' ? 'bg-emerald-500' : 'bg-amber-500'
                             )} />
                             <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">{match.sport} Index</span>
                          </div>
                        </div>
                        <h4 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">{match.title}</h4>
                        <div className="flex flex-wrap gap-8 items-center pt-2">
                          <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock size={16} className="text-indigo-500" />
                            <span>{new Date(match.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            <MapPin size={16} className="text-indigo-500" />
                            <span>Operational Sector A</span>
                          </div>
                        </div>
                      </div>
                      <Link to={`/matches/${match.id}`}>
                        <Button className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest h-14 px-10 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                          View Analysis
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {matches.length === 0 && !loading && (
              <div className="py-32 text-center rounded-[48px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200">
                   <CalendarIcon size={40} />
                </div>
                <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] italic leading-relaxed">
                  No matches programmed<br/>in the current timeframe.
                </p>
              </div>
            )}
            
            {loading && (
              <div className="space-y-6">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="h-40 bg-slate-50 animate-pulse rounded-[40px]" />
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
