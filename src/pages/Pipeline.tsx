import * as React from 'react';
import { 
  Search, 
  Filter, 
  Workflow, 
  ChevronRight, 
  MoreVertical,
  Trophy,
  Activity,
  Award,
  CircleDot,
  GraduationCap
} from 'lucide-react';
import { dataService } from '@/services/dataService';
import { Player, PlayerStatus, Sport } from '@/types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const STAGES: { id: PlayerStatus, label: string, icon: any, color: string }[] = [
  { id: 'prospect', label: 'Prospects', icon: CircleDot, color: 'bg-blue-500' },
  { id: 'trial', label: 'In Trial', icon: Activity, color: 'bg-yellow-500' },
  { id: 'training', label: 'Training', icon: Workflow, color: 'bg-purple-500' },
  { id: 'elite', label: 'Elite Squad', icon: Award, color: 'bg-amber-500' },
  { id: 'graduate', label: 'Graduates', icon: GraduationCap, color: 'bg-green-500' }
];

export default function Pipeline() {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [selectedSport, setSelectedSport] = React.useState<Sport | 'all'>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    return dataService.getPlayers(setPlayers);
  }, []);

  const handleStatusChange = async (playerId: string, newStatus: PlayerStatus) => {
    try {
      await dataService.updatePlayerStatus(playerId, newStatus);
      toast.success("Player status updated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredPlayers = players.filter(p => {
    const matchesSport = selectedSport === 'all' || (p.primarySport || 'cricket') === selectedSport;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSport && matchesSearch;
  });

  const getPlayersByStage = (stage: PlayerStatus) => {
    return filteredPlayers.filter(p => (p.status || 'prospect') === stage);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-primary tracking-tighter uppercase italic">
            Athlete <span className="text-accent">Pipeline</span>
          </h2>
          <p className="text-text-light font-bold text-sm uppercase tracking-widest opacity-60">Manage your player development workflow</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" size={16} />
            <Input 
              placeholder="Search players..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 w-full sm:w-[250px] border-border-custom rounded-xl"
            />
          </div>
          <Select value={selectedSport} onValueChange={(val) => setSelectedSport(val as Sport | 'all')}>
             <SelectTrigger className="w-full sm:w-40 h-10 border-border-custom rounded-xl font-bold text-primary">
               <SelectValue placeholder="All Sports" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Sports</SelectItem>
               <SelectItem value="cricket">Cricket</SelectItem>
               <SelectItem value="football">Football</SelectItem>
               <SelectItem value="badminton">Badminton</SelectItem>
             </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-row overflow-x-auto gap-6 pb-6 min-h-[600px] no-scrollbar active:cursor-grabbing">
        {STAGES.map((stage) => {
          const stagePlayers = getPlayersByStage(stage.id);
          return (
            <div key={stage.id} className="flex-shrink-0 w-80 space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${stage.color} text-white`}>
                    <stage.icon size={16} />
                  </div>
                  <h3 className="font-black text-primary uppercase tracking-tighter">{stage.label}</h3>
                </div>
                <Badge variant="outline" className="border-border-custom text-primary font-bold">
                  {stagePlayers.length}
                </Badge>
              </div>

              <div className="bg-secondary/20 rounded-[32px] p-3 border border-border-custom/30 space-y-3 min-h-[500px]">
                {stagePlayers.map((player) => (
                  <motion.div
                    layout
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Card className="shadow-sm border-border-custom hover:shadow-lg transition-all rounded-2xl overflow-hidden group/card cursor-pointer">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-border-custom">
                              <AvatarImage src={player.photoURL} alt={player.name} />
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                                {player.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-bold text-primary text-sm leading-tight group-hover/card:text-accent transition-colors">
                                {player.name}
                              </h4>
                              <p className="text-[10px] font-black text-text-light uppercase tracking-widest opacity-60">
                                {player.primarySport}
                              </p>
                            </div>
                          </div>
                          
                          <Select 
                            value={player.status} 
                            onValueChange={(val) => handleStatusChange(player.id, val as PlayerStatus)}
                          >
                            <SelectTrigger className="w-8 h-8 p-0 border-none bg-transparent hover:bg-muted flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <MoreVertical size={16} className="text-text-light" />
                            </SelectTrigger>
                            <SelectContent>
                              {STAGES.map(s => (
                                <SelectItem key={s.id} value={s.id}>
                                  Move to {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border-custom/30">
                          <div className="flex items-center gap-1 text-[10px] font-black text-text-light uppercase tracking-tighter opacity-40">
                             Joined {new Date(player.joinedDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </div>
                          <Badge className="bg-accent/10 text-accent border border-accent/20 text-[8px] font-black uppercase tracking-widest px-1.5 py-0">
                            View
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {stagePlayers.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-border-custom/20 rounded-2xl flex items-center justify-center">
                    <p className="text-[10px] font-bold text-text-light/30 uppercase tracking-widest">No Players</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
