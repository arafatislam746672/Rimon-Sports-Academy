import * as React from 'react';
import { 
  Trophy, 
  Flag, 
  Activity, 
  ChevronDown,
  Sparkles,
  Zap
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Sport } from '@/types';

interface LeagueSwitcherProps {
  currentSport: Sport | 'all';
  onSportChange: (sport: Sport | 'all') => void;
  className?: string;
}

export default function LeagueSwitcher({ currentSport, onSportChange, className }: LeagueSwitcherProps) {
  const sports: { id: Sport | 'all', label: string, icon: any, color: string }[] = [
    { id: 'all', label: 'All Sectors', icon: Activity, color: 'text-accent' },
    { id: 'cricket', label: 'Cricket League', icon: Trophy, color: 'text-amber-500' },
    { id: 'football', label: 'Football League', icon: Flag, color: 'text-rose-500' },
    { id: 'badminton', label: 'Badminton League', icon: Zap, color: 'text-sky-500' },
  ];

  const selected = sports.find(s => s.id === currentSport) || sports[0];

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-4 bg-card border border-border px-6 py-3 rounded-2xl shadow-xl shadow-black/40 hover:bg-muted transition-all group focus:outline-none">
             <div className={cn("p-2 rounded-xl bg-muted/50 transition-transform group-hover:rotate-6", selected.color)}>
                <selected.icon size={18} />
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1 opacity-60">Selected League</p>
                <p className="text-sm font-black text-foreground uppercase italic tracking-tight">{selected.label}</p>
             </div>
             <ChevronDown size={14} className="ml-4 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[280px] bg-card border-none rounded-[32px] p-2 shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-top-4 duration-300">
          <DropdownMenuLabel className="px-5 py-4">
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Tactical Sector Selection</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/50 mx-2" />
          <div className="p-1 space-y-1">
            {sports.map((sport) => (
              <DropdownMenuItem 
                key={sport.id} 
                onClick={() => onSportChange(sport.id)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-none focus:bg-accent focus:text-accent-foreground group",
                  currentSport === sport.id ? "bg-muted text-accent" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl bg-card border border-border group-hover:bg-white/10 transition-colors",
                  sport.color
                )}>
                  <sport.icon size={16} />
                </div>
                <div className="flex-1">
                  <span className="font-black uppercase italic tracking-tight text-xs">{sport.label}</span>
                </div>
                {currentSport === sport.id && (
                  <Sparkles size={14} className="text-accent animate-pulse" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div className="hidden lg:flex items-center gap-1.5 opacity-50">
         {[1, 2, 3].map(i => (
           <div key={i} className="w-1 h-1 rounded-full bg-accent" />
         ))}
      </div>
    </div>
  );
}
