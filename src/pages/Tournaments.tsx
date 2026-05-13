import * as React from 'react';
import { 
  Trophy, 
  Plus, 
  Users, 
  Medal, 
  Table as TableIcon,
  List
} from 'lucide-react';
import { toast } from 'sonner';
import { dataService } from '@/services/dataService';
import { Tournament, Sport, Team } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';

import { cn } from '@/lib/utils';

export default function Tournaments() {
  const [tournaments, setTournaments] = React.useState<Tournament[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form State
  const [newName, setNewName] = React.useState('');
  const [newSport, setNewSport] = React.useState<Sport | ''>('');
  const [newFormat, setNewFormat] = React.useState<'knockout' | 'league'>('league');
  const [newStartDate, setNewStartDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [selectedTeamIds, setSelectedTeamIds] = React.useState<string[]>([]);
  const [selectedTournament, setSelectedTournament] = React.useState<Tournament | null>(null);

  React.useEffect(() => {
    const unsubTournaments = dataService.getTournaments(setTournaments);
    const unsubTeams = dataService.getTeams(setTeams);
    return () => {
      unsubTournaments();
      unsubTeams();
    };
  }, []);

  React.useEffect(() => {
    if (tournaments.length > 0 && !selectedTournament) {
      setSelectedTournament(tournaments[0]);
    }
  }, [tournaments]);

  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSport || selectedTeamIds.length < 2) {
      toast.error('Please provide name, sport and select at least 2 teams.');
      return;
    }

    setIsSaving(true);
    try {
      const tournamentToCreate: Omit<Tournament, 'id'> = {
        name: newName.trim(),
        sport: newSport as Sport,
        format: newFormat,
        startDate: new Date(newStartDate).toISOString(),
        participants: selectedTeamIds,
        matchIds: [],
        status: 'upcoming'
      };

      await dataService.addTournament(tournamentToCreate);
      
      // Update teams to associate them with this new tournament? 
      // Actually we have tournamentIds in Team type, but we usually look it up via participants field in Tournament.
      
      toast.success(`Tournament "${newName}" created!`);
      setIsDialogOpen(false);
      setNewName('');
      setNewSport('');
      setSelectedTeamIds([]);
    } catch (error) {
      toast.error('Failed to create tournament.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Tournaments</h2>
          <p className="text-text-light text-sm mt-1">Organize leagues, knockouts, and track standings.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-primary text-secondary font-bold h-10 px-6">
              <Plus size={18} className="mr-2" />
              Create Tournament
            </Button>
          } />
          <DialogContent className="sm:max-w-[500px] bg-white border-border-custom rounded-[32px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-primary uppercase">Sanction Tournament</DialogTitle>
              <DialogDescription className="font-bold text-xs text-text-light/60">Configure tournament format and participating squads.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveTournament} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Tournament Name</Label>
                  <Input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Academy Winter Cup"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Sport</Label>
                    <Select value={newSport} onValueChange={(val) => {
                      setNewSport(val as Sport);
                      setSelectedTeamIds([]);
                    }}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cricket">Cricket</SelectItem>
                        <SelectItem value="football">Football</SelectItem>
                        <SelectItem value="badminton">Badminton</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Format</Label>
                    <Select value={newFormat} onValueChange={(val) => setNewFormat(val as any)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="league">League</SelectItem>
                        <SelectItem value="knockout">Knockout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Start Date</Label>
                  <Input 
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {newSport && (
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Participating Teams ({teams.filter(t => t.sport === newSport).length})</Label>
                  <div className="max-h-[150px] overflow-y-auto border border-border-custom rounded-2xl p-2 space-y-1">
                    {teams.filter(t => t.sport === newSport).map(t => (
                      <div key={t.id} className="flex items-center gap-3 p-2 hover:bg-secondary/20 rounded-xl transition-colors cursor-pointer" onClick={() => {
                        if (selectedTeamIds.includes(t.id)) {
                          setSelectedTeamIds(selectedTeamIds.filter(id => id !== t.id));
                        } else {
                          setSelectedTeamIds([...selectedTeamIds, t.id]);
                        }
                      }}>
                        <Checkbox checked={selectedTeamIds.includes(t.id)} />
                        <span className="text-sm font-bold text-primary">{t.name}</span>
                        <span className="ml-auto text-[10px] font-bold text-text-light opacity-60">{t.playerIds.length} players</span>
                      </div>
                    ))}
                    {teams.filter(t => t.sport === newSport).length === 0 && (
                      <p className="text-center py-4 text-xs font-bold text-text-light opacity-40 italic">No teams created for this sport yet.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-xl h-12 font-black uppercase text-xs tracking-widest">Cancel</Button>
                <Button type="submit" disabled={isSaving} className="flex-1 bg-primary text-secondary rounded-xl h-12 font-black uppercase text-xs tracking-widest hover:bg-primary/90">
                  {isSaving ? 'Launching...' : 'Create Tournament'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tournaments */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <Trophy size={16} className="text-accent" />
            Roster of Events
          </h3>
          {tournaments.map((t) => (
            <Card key={t.id} 
              onClick={() => setSelectedTournament(t)}
              className={cn(
                "shadow-card border-border-custom hover:border-primary/30 transition-all cursor-pointer group overflow-hidden",
                selectedTournament?.id === t.id && "border-primary/50 bg-primary/5"
              )}>
              <div className={cn("h-1 bg-primary/10 group-hover:bg-primary transition-colors", selectedTournament?.id === t.id && "bg-primary")} />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest border-border-custom text-text-light/60 px-2">
                    {t.sport}
                  </Badge>
                  <Badge className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5",
                    t.status === 'ongoing' ? 'bg-green-50 text-green-700 border-green-200' : 
                    t.status === 'upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                  )} variant="outline">
                    {t.status}
                  </Badge>
                </div>
                <h4 className="font-black text-primary group-hover:text-blue-900 transition-colors tracking-tight">{t.name}</h4>
                <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-text-light uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-primary/40" />
                    <span>{t.participants.length} Squads</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Medal size={14} className="text-primary/40" />
                    <span>{t.format}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {tournaments.length === 0 && (
            <div className="text-center py-10 opacity-40 italic text-xs font-bold">No active tournaments.</div>
          )}
        </div>

        {/* Tournament Details */}
        <Card className="lg:col-span-2 shadow-card border-border-custom overflow-hidden">
          {selectedTournament ? (
            <Tabs defaultValue="standings" className="w-full">
              <CardHeader className="border-b border-muted pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
                  <div>
                    <CardTitle className="text-xl font-black text-primary tracking-tight">{selectedTournament.name}</CardTitle>
                    <CardDescription className="text-xs font-bold text-text-light uppercase tracking-widest mt-1">
                      {selectedTournament.sport} • {new Date(selectedTournament.startDate).getFullYear()}
                    </CardDescription>
                  </div>
                  <TabsList className="bg-muted p-1 rounded-xl">
                    <TabsTrigger value="standings" className="data-[state=active]:bg-primary data-[state=active]:text-secondary font-bold rounded-lg text-xs px-4">
                      <TableIcon size={14} className="mr-2" />
                      Standings
                    </TabsTrigger>
                    <TabsTrigger value="fixtures" className="data-[state=active]:bg-primary data-[state=active]:text-secondary font-bold rounded-lg text-xs px-4">
                      <List size={14} className="mr-2" />
                      Fixtures
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <TabsContent value="standings" className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-muted bg-muted/30">
                        <TableHead className="w-[60px] text-[10px] font-black text-text-light uppercase tracking-widest pl-6">Pos</TableHead>
                        <TableHead className="text-[10px] font-black text-text-light uppercase tracking-widest">Team</TableHead>
                        <TableHead className="text-center text-[10px] font-black text-text-light uppercase tracking-widest">P</TableHead>
                        <TableHead className="text-center text-[10px] font-black text-text-light uppercase tracking-widest">W</TableHead>
                        <TableHead className="text-center text-[10px] font-black text-text-light uppercase tracking-widest">L</TableHead>
                        <TableHead className="text-right text-[10px] font-black text-text-light uppercase tracking-widest pr-6">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTournament.participants.map((teamId, i) => {
                        const team = teams.find(tm => tm.id === teamId);
                        return (
                          <TableRow key={teamId} className="border-b border-muted hover:bg-muted/20 transition-colors">
                            <TableCell className="font-black text-text-light/40 pl-6">{(i + 1).toString().padStart(2, '0')}</TableCell>
                            <TableCell className="font-black text-primary">{team?.name || 'Unknown Team'}</TableCell>
                            <TableCell className="text-center font-bold text-text-light">0</TableCell>
                            <TableCell className="text-center font-bold text-text-light">0</TableCell>
                            <TableCell className="text-center font-bold text-text-light">0</TableCell>
                            <TableCell className="text-right font-black text-primary pr-6 text-lg">0</TableCell>
                          </TableRow>
                        );
                      })}
                      {selectedTournament.participants.length === 0 && (
                        <TableRow>
                           <TableCell colSpan={6} className="text-center py-20 text-xs font-bold text-text-light opacity-40 italic">No participants registered.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="fixtures" className="mt-0 p-6 space-y-4">
                  <p className="text-center py-20 text-xs font-bold text-text-light opacity-40 italic">Fixtures will be generated once season starts.</p>
                </TabsContent>
              </CardContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
               <Trophy size={48} className="text-text-light/20" />
               <p className="text-sm font-bold text-text-light opacity-60">Select a tournament from the roster to view details.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
