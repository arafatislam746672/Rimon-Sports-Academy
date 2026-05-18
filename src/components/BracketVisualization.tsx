import React from 'react';
import { motion } from 'motion/react';
import { Trophy, ChevronRight, Zap } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Tournament, Match, Team } from '@/types';

interface BracketVisualizationProps {
  tournament: Tournament;
  matches: Match[];
  teams: Team[];
}

export default function BracketVisualization({ tournament, matches, teams }: BracketVisualizationProps) {
  // A simple knockout bracket visualization
  // In a real app, this would be computed from the tournament's bracket field
  // For now, let's visualize a mock structure if the 'bracket' field is empty, 
  // or use the 'bracket' field if it exists.

  if (tournament.format !== 'knockout') {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-40">
        <Trophy size={60} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Bracket view only available for knockout formats</p>
      </div>
    );
  }

  // Mocking 2 rounds for visualization if none exists
  const rounds = tournament.bracket?.rounds || [
    {
      name: 'Semifinals',
      matches: tournament.matchIds.slice(0, 2).map((id, i) => ({ id, position: i === 0 ? 'top' : 'bottom' as any }))
    },
    {
      name: 'Final',
      matches: tournament.matchIds.slice(2, 3).map(id => ({ id, position: 'top' as any }))
    }
  ];

  return (
    <div className="p-8 md:p-20 overflow-x-auto no-scrollbar min-h-[600px] bg-black/20 rounded-[64px] border border-white/5">
      <div className="flex gap-16 md:gap-32 items-stretch min-w-max">
        {rounds.map((round, rIndex) => (
          <div key={rIndex} className="flex flex-col justify-around gap-12 w-80">
            <div className="pb-8 border-b border-white/5">
              <Badge className="bg-primary/20 text-primary font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-full border-none">
                {round.name}
              </Badge>
            </div>
            
            <div className="flex-1 flex flex-col justify-around gap-20 py-12">
              {round.matches.map((bm, mIndex) => {
                const match = matches.find(m => m.id === bm.id);
                const team1 = teams.find(t => t.id === match?.team1Id);
                const team2 = teams.find(t => t.id === match?.team2Id);
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (rIndex * 0.2) + (mIndex * 0.1) }}
                    key={bm.id} 
                    className="relative group"
                  >
                    {/* Connection Lines */}
                    {rIndex < rounds.length - 1 && (
                      <div className={cn(
                        "absolute -right-16 md:-right-32 top-1/2 w-16 md:w-32 h-px bg-white/10 group-hover:bg-primary/50 transition-colors pointer-events-none",
                        bm.position === 'top' ? "after:absolute after:right-0 after:top-0 after:w-px after:h-20 md:after:h-40 after:bg-white/10 group-hover:after:bg-primary/50" : 
                        "after:absolute after:right-0 after:bottom-0 after:w-px after:h-20 md:after:h-40 after:bg-white/10 group-hover:after:bg-primary/50"
                      )} />
                    )}

                    <div className="bg-[#0f1118] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl group-hover:border-primary/50 transition-all duration-500 group-hover:-translate-y-2">
                       {/* Team 1 */}
                       <div className={cn(
                         "p-5 flex items-center justify-between transition-colors",
                         match?.winnerId === team1?.id ? "bg-primary/10" : "bg-black/20"
                       )}>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-muted p-1 border border-white/5">
                                {team1?.logoURL ? <img src={team1.logoURL} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-white/5 rounded-xl" />}
                             </div>
                             <span className="text-xs font-black uppercase tracking-tight italic text-white/80">{team1?.name || 'TBD'}</span>
                          </div>
                          <span className="text-xl font-black italic tracking-tighter text-primary">
                            {match?.status === 'completed' && match.score && 'team1' in match.score ? (match.score as any).team1.runs || (match.score as any).team1.goals : '-'}
                          </span>
                       </div>

                       <div className="h-px bg-white/5" />

                       {/* Team 2 */}
                       <div className={cn(
                         "p-5 flex items-center justify-between transition-colors",
                         match?.winnerId === team2?.id ? "bg-primary/10" : "bg-black/20"
                       )}>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-muted p-1 border border-white/5">
                                {team2?.logoURL ? <img src={team2.logoURL} className="w-full h-full object-contain" /> : <div className="w-full h-full bg-white/5 rounded-xl" />}
                             </div>
                             <span className="text-xs font-black uppercase tracking-tight italic text-white/80">{team2?.name || 'TBD'}</span>
                          </div>
                          <span className="text-xl font-black italic tracking-tighter text-primary">
                             {match?.status === 'completed' && match.score && 'team2' in match.score ? (match.score as any).team2.runs || (match.score as any).team2.goals : '-'}
                          </span>
                       </div>

                       {/* Match Footer */}
                       <div className="bg-black/40 p-3 flex items-center justify-between px-6 border-t border-white/5">
                          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground italic">Event #{match?.id.slice(0,4) || 'NULL'}</span>
                          <div className="flex items-center gap-2">
                             <div className={cn("w-1.5 h-1.5 rounded-full", match?.status === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-white/10')} />
                             <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{match?.status || 'SCHEDULED'}</span>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Winner Highlight */}
        <div className="flex flex-col justify-center gap-12 w-80 scale-110">
           <div className="pb-8 border-b border-primary/20">
              <Badge className="bg-amber-500 text-black font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-full border-none shadow-xl shadow-amber-500/20">
                 Champion
              </Badge>
           </div>
           
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ delay: 1, type: 'spring' }}
             className="relative aspect-square rounded-[64px] bg-gradient-to-br from-amber-500 via-primary to-orange-600 p-1 flex flex-col items-center justify-center group shadow-2xl shadow-primary/30"
           >
              <div className="absolute inset-4 rounded-[56px] border border-white/20 border-dashed animate-spin-slow pointer-events-none" />
              <div className="bg-black/20 backdrop-blur-3xl inset-0 absolute rounded-[60px]" />
              
              <div className="relative z-10 flex flex-col items-center gap-6">
                 <div className="w-24 h-24 rounded-[32px] bg-white p-4 shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                    <Trophy size={60} className="text-amber-500" />
                 </div>
                 <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 leading-none italic">Ultimate Victory</p>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic text-white">Pending...</h3>
                 </div>
                 <div className="flex items-center gap-3 bg-black/40 px-6 py-3 rounded-2xl border border-white/10">
                    <Zap size={14} className="text-amber-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white italic">Protocol Active</span>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
