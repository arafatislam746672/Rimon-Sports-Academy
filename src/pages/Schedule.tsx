import * as React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus,
  ChevronLeft,
  ChevronRight
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

import { dataService } from '@/services/dataService';
import { Match } from '@/types';
import { Link } from 'react-router-dom';

const mockSchedule = [
  { id: 1, title: 'Cricket Training', time: '07:00 AM - 09:00 AM', location: 'Main Ground', type: 'Training', sport: 'Cricket' },
  { id: 2, title: 'Football Match: Academy vs City', time: '04:00 PM - 05:30 PM', location: 'Field A', type: 'Match', sport: 'Football' },
  { id: 3, title: 'Badminton Drills', time: '06:00 PM - 07:30 PM', location: 'Indoor Court', type: 'Training', sport: 'Badminton' },
];

import { cn } from '@/lib/utils';

export default function Schedule() {
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = dataService.getMatches((data) => {
      setMatches(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Academy Schedule</h2>
          <p className="text-text-light text-sm mt-1">Manage training sessions and match fixtures.</p>
        </div>
        <Button className="bg-primary text-secondary font-bold h-10 px-6">
          <Plus size={18} className="mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Sidebar */}
        <Card className="lg:col-span-1 shadow-card border-border-custom overflow-hidden">
          <CardHeader className="pb-4 border-b border-muted">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-primary uppercase tracking-widest">April 2026</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted"><ChevronLeft size={14} /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-muted"><ChevronRight size={14} /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black text-text-light/40 mb-3 uppercase tracking-widest">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-8 flex items-center justify-center text-xs font-bold rounded-lg cursor-pointer transition-all",
                    i + 1 === 16 
                      ? "bg-primary text-secondary shadow-md" 
                      : "hover:bg-muted text-text-light/60 hover:text-primary"
                  )}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <CalendarIcon size={16} className="text-primary/40" />
            Today's Agenda
          </h3>
          
          <div className="space-y-4">
            {matches.map((match) => (
              <Card key={match.id} className="shadow-card border-border-custom group hover:border-primary/30 transition-all overflow-hidden">
                <CardContent className="p-0 flex">
                  <div className={cn(
                    "w-1.5 shrink-0",
                    match.sport === 'cricket' ? 'bg-primary' : 
                    match.sport === 'football' ? 'bg-accent' : 'bg-green-500'
                  )} />
                  <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-border-custom text-text-light/60 px-2">
                          {match.status}
                        </Badge>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{match.sport}</span>
                      </div>
                      <h4 className="text-xl font-black text-primary tracking-tight">{match.title}</h4>
                      <div className="flex flex-wrap gap-5 mt-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-text-light uppercase tracking-wider">
                          <Clock size={14} className="text-primary/40" />
                          <span>{new Date(match.date).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-text-light uppercase tracking-wider">
                          <MapPin size={14} className="text-primary/40" />
                          <span>Academy Grounds</span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/matches/${match.id}`}>
                      <Button className="bg-primary text-secondary font-black text-[10px] uppercase tracking-widest h-10 px-6 hover:scale-105 transition-all shadow-md">
                        View Scoreboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {matches.length === 0 && !loading && (
              <div className="py-20 text-center text-text-light/40 italic font-medium uppercase tracking-[0.2em] text-[10px]">
                No match fixtures recorded.
              </div>
            )}
            
            {loading && (
              <div className="animate-pulse space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="h-32 bg-muted rounded-2xl" />
                 ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
