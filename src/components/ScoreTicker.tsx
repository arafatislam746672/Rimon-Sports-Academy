import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Trophy, Circle } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Match, CricketScore, FootballScore, BadmintonScore } from '@/types';
import { cn } from '@/lib/utils';

export default function ScoreTicker() {
  const [liveMatches, setLiveMatches] = React.useState<Match[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsub = dataService.getMatches((matches) => {
      setLiveMatches(matches.filter(m => m.status === 'live'));
    });
    return () => unsub();
  }, []);

  if (liveMatches.length === 0) return null;

  return (
    <div className="bg-card text-foreground h-12 flex items-center overflow-hidden border-b border-border relative z-50">
      <div className="bg-red-600 h-full px-6 flex items-center gap-3 shrink-0 relative overflow-hidden group shadow-[inset_-10px_0_20px_rgba(0,0,0,0.2)]">
         <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
         <Circle className="fill-white animate-pulse" size={10} />
         <span className="font-black text-[10px] uppercase tracking-[0.2em] italic text-white">Live Feed</span>
      </div>
      
      <div className="flex-1 flex items-center gap-12 px-8 overflow-x-auto no-scrollbar">
        <AnimatePresence mode="popLayout">
          {liveMatches.map((match) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => navigate(`/matches/${match.id}`)}
              className="flex items-center gap-6 cursor-pointer hover:bg-muted/50 px-4 py-1.5 rounded-full transition-all shrink-0 border border-transparent hover:border-border/50"
            >
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black uppercase text-accent italic tracking-widest">{match.sport}</span>
                 <span className="text-xs font-black uppercase italic tracking-tighter">{match.title}</span>
              </div>
              <div className="flex items-center gap-4 bg-muted/40 px-4 py-1 rounded-[14px] shadow-inner border border-border/10">
                 <ScoreDisplay match={match} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="bg-accent h-full px-6 flex items-center gap-3 shrink-0 shadow-[inset_10px_0_20px_rgba(0,0,0,0.1)]">
         <Activity size={14} className="text-accent-foreground/80" />
         <span className="font-black text-[10px] uppercase tracking-widest italic text-accent-foreground/80">Broadcasting Now</span>
      </div>
    </div>
  );
}

function ScoreDisplay({ match }: { match: Match }) {
  if (match.sport === 'cricket') {
    const score = match.score as CricketScore;
    const currentTeam = score.currentInnings === 1 ? score.team1 : score.team2;
    return (
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-white/40 italic">T{score.currentInnings}</span>
        <span className="text-sm font-black italic">{currentTeam.runs}/{currentTeam.wickets}</span>
        <span className="text-[10px] font-black text-white/20 italic">({currentTeam.overs}.{currentTeam.balls})</span>
      </div>
    );
  }

  if (match.sport === 'football') {
    const score = match.score as FootballScore;
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-black italic">{score.team1.goals} - {score.team2.goals}</span>
        <span className="text-[10px] font-black text-red-500 italic animate-pulse">{score.time}'</span>
      </div>
    );
  }

  if (match.sport === 'badminton') {
    const score = match.score as BadmintonScore;
    const currentSet = score.sets[score.currentSet - 1];
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-black italic">{currentSet.player1} - {currentSet.player2}</span>
        <span className="text-[10px] font-black text-indigo-400 italic">SET {score.currentSet}</span>
      </div>
    );
  }

  return null;
}
