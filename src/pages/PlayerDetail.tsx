import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  ChevronLeft,
  Activity as ActivityIcon,
  Target,
  Medal,
  Clock,
  User,
  Star,
  CheckCircle2,
  Award,
  ChevronRight,
  Info,
  Upload,
  Camera,
  ArrowRight
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataService } from '@/services/dataService';
import { Player, Match, Attendance, Sport } from '@/types';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [playerMatches, setPlayerMatches] = React.useState<Match[]>([]);
  const [playerAttendance, setPlayerAttendance] = React.useState<Attendance[]>([]);
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const { profile, user } = useAuth();
  
  const [submissionForm, setSubmissionForm] = React.useState({
    sport: 'cricket' as Sport,
    title: '',
    date: new Date().toISOString().split('T')[0],
    proofURL: '',
    stats: {
      playerRuns: 0,
      playerWickets: 0,
      playerGoals: 0,
      playerAssists: 0,
      isWinner: false
    }
  });

  const isOwner = React.useMemo(() => {
    return profile?.role === 'management' || (profile?.role === 'player' && profile.playerId === id);
  }, [profile, id]);

  const handleSubmitScore = async () => {
    if (!profile || !id) return;
    try {
      await dataService.submitMatchStats({
        playerId: id,
        sport: submissionForm.sport,
        matchTitle: submissionForm.title,
        matchDate: submissionForm.date,
        proofURL: submissionForm.proofURL,
        scoreData: submissionForm.stats
      });
      toast.success("Match stats submitted for approval!");
      setShowSubmitModal(false);
    } catch (error) {
      toast.error("Failed to submit stats.");
    }
  };

  React.useEffect(() => {
    if (!id) return;
    const unsubPlayer = dataService.getPlayer(id, (data) => {
      setPlayer(data);
      setLoading(false);
    });
    
    const unsubMatches = dataService.getPlayerMatches(id, setPlayerMatches);
    const unsubAttendance = dataService.getPlayerAttendance(id, setPlayerAttendance);
    
    return () => {
      unsubPlayer();
      unsubMatches();
      unsubAttendance();
    };
  }, [id]);

  const activities = React.useMemo(() => {
    const combined: any[] = [];
    
    // Add matches
    playerMatches.forEach(match => {
      combined.push({
        id: `match-${match.id}`,
        type: 'match',
        title: `${match.sport.toUpperCase()} Match: ${match.title}`,
        date: new Date(match.date),
        description: match.status === 'completed' ? 'Participated in a competitive match' : 'Scheduled for upcoming match',
        icon: <Trophy size={16} className="text-primary" />,
        color: 'bg-primary/10'
      });
    });
    
    // Add attendance
    playerAttendance.forEach(att => {
      combined.push({
        id: `att-${att.id}`,
        type: 'training',
        title: 'Training Session Attended',
        date: new Date(att.date),
        description: 'Successfully attended regular academy training',
        icon: <CheckCircle2 size={16} className="text-green-600" />,
        color: 'bg-green-50'
      });
    });
    
    // Awards (Mocked based on user request)
    if (player) {
      combined.push({
        id: 'award-1',
        type: 'award',
        title: 'Player of the Month',
        date: new Date('2026-03-31'),
        description: 'Recognized for outstanding performance and conduct',
        icon: <Award size={16} className="text-accent" />,
        color: 'bg-accent/10'
      });
    }
    
    return combined.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [playerMatches, playerAttendance, player]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-primary uppercase tracking-widest">Player Not Found</h2>
        <Button 
          variant="outline" 
          className="mt-4 border-primary text-primary font-bold"
          onClick={() => navigate('/players')}
        >
          <ChevronLeft size={18} className="mr-2" />
          Back to Players
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header / Nav */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/players')}
          className="rounded-full hover:bg-muted text-primary"
        >
          <ChevronLeft size={24} />
        </Button>
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Player Profile</h2>
          <p className="text-text-light text-sm italic">Member since {new Date(player.joinedDate || (player as any).joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-card border-border-custom overflow-hidden">
            <div className="h-32 bg-primary relative">
               <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
            </div>
            <CardContent className="p-0 text-center relative pt-16">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                <Avatar className="w-32 h-32 border-4 border-secondary shadow-xl">
                  <AvatarImage src={player.photoURL || (player as any).photo} alt={player.name} />
                  <AvatarFallback className="bg-muted text-primary font-black text-4xl">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-primary tracking-tight">{player.name}</h3>
                  <Badge className={cn(
                    "mt-2 text-[10px] font-black uppercase tracking-widest px-3 py-1",
                    (player as any).status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                  )} variant="outline">
                    {(player as any).status || 'Academy Member'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-muted">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-text-light/40 uppercase tracking-widest">Age</p>
                    <p className="text-lg font-black text-primary">{player.age || 'N/A'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-text-light/40 uppercase tracking-widest">Sport</p>
                    <p className="text-lg font-black text-primary capitalize">
                      {player.stats.cricket.matches > 0 ? 'Cricket' : 
                       player.stats.football.matches > 0 ? 'Football' : 
                       player.stats.badminton.matches > 0 ? 'Badminton' : 'Multi-Sport'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm font-bold text-text-light">
                    <Clock size={16} className="text-primary/40" />
                    <span>Last Active: Today</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-text-light">
                    <Star size={16} className="text-accent" />
                    <span>MVP Status: Eligible</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-primary text-secondary font-bold h-11 shadow-md hover:shadow-lg transition-all mt-4"
                  onClick={() => isOwner ? setShowSubmitModal(true) : toast.error("Only the athlete or management can submit scores.")}
                >
                  {isOwner ? 'Submit New Match Score' : 'Send Message'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Card */}
          <Card className="shadow-card border-border-custom bg-secondary/30">
            <CardHeader className="p-4 border-b border-muted">
              <CardTitle className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <Trophy size={16} className="text-accent" />
                Key Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border-custom">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <Medal size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-primary tracking-tight">Club Player of the Month</p>
                  <p className="text-[10px] text-text-light">March 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-border-custom">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Target size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-primary tracking-tight">100+ Match Appearances</p>
                  <p className="text-[10px] text-text-light">Career Milestone</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Stats & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <Card className="shadow-card border-border-custom overflow-hidden">
              <CardHeader className="p-0 border-b border-muted">
                <TabsList className="w-full bg-muted/30 rounded-none h-14 p-1">
                  <TabsTrigger 
                    value="overview" 
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-xs uppercase tracking-widest h-auto py-3"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity" 
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-xs uppercase tracking-widest h-auto py-3"
                  >
                    Activity Feed
                  </TabsTrigger>
                  <TabsTrigger 
                    value="stats" 
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-xs uppercase tracking-widest h-auto py-3"
                  >
                    Detailed Stats
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-xs uppercase tracking-widest h-auto py-3"
                  >
                    Match History
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="p-8">
                <TabsContent value="overview" className="mt-0 space-y-8 focus-visible:outline-none">
                  {/* Performance Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                      whileHover={{ y: -4 }}
                      className="p-6 rounded-2xl bg-primary text-secondary shadow-lg space-y-3"
                    >
                  <ActivityIcon size={24} className="text-accent" />
                      <div>
                        <p className="text-4xl font-black tracking-tighter">
                          {player.stats.cricket.matches + player.stats.football.matches + player.stats.badminton.matches}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary/60">Total Appearances</p>
                      </div>
                    </motion.div>

                    <div className="p-6 rounded-2xl border border-border-custom bg-muted/20 space-y-3">
                      <Target size={24} className="text-primary/40" />
                      <div>
                        <p className="text-4xl font-black text-primary tracking-tighter">
                          {player.stats.cricket.runs || player.stats.football.goals || player.stats.badminton.wins}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Main Score Asset</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-border-custom bg-muted/20 space-y-3">
                      <Clock size={24} className="text-primary/40" />
                      <div>
                        <p className="text-4xl font-black text-primary tracking-tighter">98%</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Attendance Rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Sport Specific Quick Stats */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                       Sport-Wise Performance
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {player.stats.cricket.matches > 0 && (
                        <div className="p-5 rounded-xl border border-border-custom bg-white space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-primary tracking-tight">Cricket</span>
                            <Badge className="bg-primary text-secondary text-[9px] font-black">ACTIVE</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <p className="text-lg font-black text-primary">{player.stats.cricket.runs}</p>
                              <p className="text-[8px] font-bold text-text-light/60 uppercase">Runs</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-black text-primary">{player.stats.cricket.wickets}</p>
                              <p className="text-[8px] font-bold text-text-light/60 uppercase">Wkts</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-black text-primary">{player.stats.cricket.average}</p>
                              <p className="text-[8px] font-bold text-text-light/60 uppercase">Avg</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {player.stats.football.matches > 0 && (
                        <div className="p-5 rounded-xl border border-border-custom bg-white space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-primary tracking-tight">Football</span>
                            <Badge className="bg-primary text-secondary text-[9px] font-black">ACTIVE</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <p className="text-lg font-black text-primary">{player.stats.football.goals}</p>
                              <p className="text-[8px] font-bold text-text-light/60 uppercase">Goals</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-black text-primary">{player.stats.football.assists}</p>
                              <p className="text-[8px] font-bold text-text-light/60 uppercase">Assists</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-black text-primary">{player.stats.football.matches}</p>
                              <p className="text-[8px] font-bold text-text-light/60 uppercase">Apps</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {player.stats.badminton.matches > 0 && (
                        <div className="p-5 rounded-xl border border-border-custom bg-white space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-primary tracking-tight">Badminton</span>
                            <Badge className="bg-primary text-secondary text-[9px] font-black">ACTIVE</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <p className="text-lg font-black text-primary">{player.stats.badminton.wins}</p>
                              <p className="text-[8px] font-bold text-text-light/60 uppercase">Wins</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-black text-primary">{player.stats.badminton.winRate}%</p>
                              <p className="text-[8px] font-bold text-text-light/60 uppercase">Win Rate</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-black text-primary">{player.stats.badminton.matches}</p>
                              <p className="text-[8px] font-bold text-text-light/60 uppercase">Sets</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-0 focus-visible:outline-none">
                  <div className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                    {activities.map((activity, idx) => (
                      <motion.div 
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="mb-8 last:mb-0 relative"
                      >
                        <div className={cn(
                          "absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10",
                          activity.color
                        )}>
                          {activity.icon}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-text-light/40 uppercase tracking-widest">
                            {activity.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <h5 className="text-sm font-black text-primary tracking-tight">{activity.title}</h5>
                          <p className="text-xs text-text-light font-medium">{activity.description}</p>
                        </div>
                      </motion.div>
                    ))}
                    {activities.length === 0 && (
                      <div className="py-12 text-center text-text-light/40 italic">
                        No recent activities recorded for this member.
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="mt-0 focus-visible:outline-none">
                  <div className="py-20 text-center space-y-4">
                    <ActivityIcon size={48} className="mx-auto text-primary/10" />
                    <p className="text-sm font-bold text-text-light uppercase tracking-widest">Enhanced Analytics Coming Soon</p>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0 focus-visible:outline-none">
                   <div className="space-y-4">
                     {playerMatches.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((match) => (
                       <button
                         key={match.id}
                         onClick={() => setSelectedMatch(match)}
                         className="w-full flex items-center justify-between p-4 rounded-xl border border-muted bg-muted/5 hover:bg-muted/10 hover:border-primary/20 transition-all text-left group"
                       >
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary transition-colors">
                             <Trophy size={18} />
                           </div>
                           <div>
                             <p className="text-sm font-black text-primary">{match.title}</p>
                             <div className="flex items-center gap-2 mt-0.5">
                               <p className="text-[10px] font-bold text-text-light uppercase">
                                 {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                               </p>
                               <Badge className="bg-muted text-primary text-[8px] font-black tracking-widest uppercase py-0 px-1.5 h-auto">
                                 {match.sport}
                               </Badge>
                             </div>
                           </div>
                         </div>
                         <div className="flex items-center gap-4">
                           <div className="text-right hidden sm:block">
                             <Badge 
                               variant="outline" 
                               className={cn(
                                 "text-[9px] font-black uppercase tracking-widest",
                                 match.status === 'completed' ? 'text-green-600 border-green-200 bg-green-50' : 
                                 match.status === 'live' ? 'text-red-600 border-red-200 bg-red-50 animate-pulse' : 
                                 'text-blue-600 border-blue-200 bg-blue-50'
                               )}
                             >
                               {match.status}
                             </Badge>
                           </div>
                           <ChevronRight size={18} className="text-text-light/20 group-hover:text-primary transition-colors" />
                         </div>
                       </button>
                     ))}
                     {playerMatches.length === 0 && (
                       <div className="py-20 text-center space-y-4">
                         <Trophy size={48} className="mx-auto text-primary/10" />
                         <p className="text-sm font-bold text-text-light uppercase tracking-widest italic">No match history found</p>
                       </div>
                     )}
                   </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>

      {/* Match Detail Modal */}
      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
        <DialogContent className="sm:max-w-[500px] border-border-custom bg-white p-0 overflow-hidden">
          {selectedMatch && (
            <>
              <div className="bg-primary p-8 text-secondary relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                  <Badge className="bg-accent text-primary font-black uppercase tracking-widest text-[10px] px-3">
                    {selectedMatch.sport} Tournament
                  </Badge>
                  <DialogTitle className="text-2xl font-black tracking-tight">{selectedMatch.title}</DialogTitle>
                  <p className="text-secondary/60 text-xs font-bold uppercase tracking-widest">
                    {new Date(selectedMatch.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-text-light uppercase tracking-widest border-b border-muted pb-2">Match Status</h4>
                    <div className="flex items-center gap-3">
                      <ActivityIcon size={20} className="text-primary/40" />
                      <div>
                        <p className="text-sm font-black text-primary capitalize">{selectedMatch.status}</p>
                        <p className="text-[10px] text-text-light font-medium leading-none mt-1">Completion Status</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-text-light uppercase tracking-widest border-b border-muted pb-2">Your Performance</h4>
                    <div className="flex items-center gap-3">
                      <Star size={20} className="text-accent" />
                      <div>
                        <p className="text-sm font-black text-primary">Key Participant</p>
                        <p className="text-[10px] text-text-light font-medium leading-none mt-1">Starting Lineup</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-muted/30 border border-border-custom space-y-6">
                   <h4 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                     <Medal size={16} className="text-accent" />
                     Official Scoreboard
                   </h4>
                   
                   {selectedMatch.sport === 'cricket' && (
                     <div className="space-y-4">
                       <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[10px] font-black text-text-light/60 uppercase tracking-widest">Team A</p>
                            <p className="text-2xl font-black text-primary">{(selectedMatch.score as any).team1?.runs}/{(selectedMatch.score as any).team1?.wickets}</p>
                         </div>
                         <div className="text-xs font-black text-primary/20 italic">VS</div>
                         <div className="text-right">
                            <p className="text-[10px] font-black text-text-light/60 uppercase tracking-widest">Team B</p>
                            <p className="text-2xl font-black text-primary">{(selectedMatch.score as any).team2?.runs}/{(selectedMatch.score as any).team2?.wickets}</p>
                         </div>
                       </div>
                       <p className="text-[10px] font-bold text-center text-text-light bg-white border border-border-custom rounded-full py-1">
                          {(selectedMatch.score as any).team1?.overs}.{(selectedMatch.score as any).team1?.balls} Overs Bowled
                       </p>
                     </div>
                   )}

                   {selectedMatch.sport === 'football' && (
                     <div className="space-y-6">
                        <div className="flex items-center justify-center gap-8">
                           <div className="text-center">
                              <p className="text-3xl font-black text-primary">{(selectedMatch.score as any).team1?.goals}</p>
                              <p className="text-[9px] font-black text-text-light uppercase">Team A</p>
                           </div>
                           <div className="text-xl font-black text-primary/20">-</div>
                           <div className="text-center">
                              <p className="text-3xl font-black text-primary">{(selectedMatch.score as any).team2?.goals}</p>
                              <p className="text-[9px] font-black text-text-light uppercase">Team B</p>
                           </div>
                        </div>
                        <div className="flex justify-center gap-2">
                           <Badge className="bg-primary/5 text-primary border-primary/10 text-[9px] font-black">FULL TIME</Badge>
                        </div>
                     </div>
                   )}

                   {selectedMatch.sport === 'badminton' && (
                     <div className="space-y-3">
                        {(selectedMatch.score as any).sets?.map((set: any, i: number) => (
                           <div key={i} className="flex justify-between items-center py-2 px-4 bg-white rounded-lg border border-border-custom">
                              <span className="text-[10px] font-black text-text-light uppercase tracking-widest">Set {i+1}</span>
                              <div className="flex gap-4 font-black">
                                 <span className={cn(set.player1 > set.player2 ? "text-primary" : "text-text-light/40")}>{set.player1}</span>
                                 <span className="text-muted">:</span>
                                 <span className={cn(set.player2 > set.player1 ? "text-primary" : "text-text-light/40")}>{set.player2}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                   )}
                </div>

                <div className="pt-4 flex gap-3">
                  <Button 
                    className="flex-1 bg-secondary text-primary border border-primary/10 font-black text-xs uppercase tracking-widest h-12"
                    onClick={() => setSelectedMatch(null)}
                  >
                    Close Log
                  </Button>
                  <Button className="flex-1 bg-primary text-secondary font-black text-xs uppercase tracking-widest h-12">
                    Share Stats
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Submission Modal */}
      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="sm:max-w-[500px] border-border-custom bg-white p-0 overflow-hidden">
           <div className="bg-secondary p-8 text-primary border-b border-primary/10">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-primary text-secondary rounded-lg">
                    <Upload size={20} />
                 </div>
                 <h2 className="text-xl font-black uppercase tracking-widest">Submit Match Score</h2>
              </div>
              <p className="text-xs font-bold opacity-60">Upload proof and stats for academy verification.</p>
           </div>
           
           <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-text-light/60">Sport</label>
                       <select 
                         className="w-full bg-muted/50 border border-border-custom rounded-lg px-4 py-2 text-sm outline-none focus:border-primary transition-all"
                         value={submissionForm.sport}
                         onChange={(e) => setSubmissionForm({...submissionForm, sport: e.target.value as Sport})}
                       >
                          <option value="cricket">Cricket</option>
                          <option value="football">Football</option>
                          <option value="badminton">Badminton</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-text-light/60">Date</label>
                       <input 
                         type="date"
                         className="w-full bg-muted/50 border border-border-custom rounded-lg px-4 py-2 text-sm outline-none focus:border-primary transition-all"
                         value={submissionForm.date}
                         onChange={(e) => setSubmissionForm({...submissionForm, date: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-light/60">Match Title</label>
                    <input 
                      placeholder="e.g. Academy Friendly Cup"
                      className="w-full bg-muted/50 border border-border-custom rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-all"
                      value={submissionForm.title}
                      onChange={(e) => setSubmissionForm({...submissionForm, title: e.target.value})}
                    />
                 </div>

                 {/* Dynamic Stats Based on Sport */}
                 <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Individual Achievement</h4>
                    {submissionForm.sport === 'cricket' && (
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <span className="text-[10px] font-bold text-text-light">Runs</span>
                             <input 
                               type="number" 
                               className="w-full bg-white border border-border-custom rounded px-3 py-2 text-sm" 
                               value={submissionForm.stats.playerRuns}
                               onChange={(e) => setSubmissionForm({...submissionForm, stats: {...submissionForm.stats, playerRuns: parseInt(e.target.value)}})}
                             />
                          </div>
                          <div className="space-y-1">
                             <span className="text-[10px] font-bold text-text-light">Wickets</span>
                             <input 
                               type="number" 
                               className="w-full bg-white border border-border-custom rounded px-3 py-2 text-sm" 
                               value={submissionForm.stats.playerWickets}
                               onChange={(e) => setSubmissionForm({...submissionForm, stats: {...submissionForm.stats, playerWickets: parseInt(e.target.value)}})}
                             />
                          </div>
                       </div>
                    )}
                    {submissionForm.sport === 'football' && (
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <span className="text-[10px] font-bold text-text-light">Goals</span>
                             <input 
                               type="number" 
                               className="w-full bg-white border border-border-custom rounded px-3 py-2 text-sm" 
                               value={submissionForm.stats.playerGoals}
                               onChange={(e) => setSubmissionForm({...submissionForm, stats: {...submissionForm.stats, playerGoals: parseInt(e.target.value)}})}
                             />
                          </div>
                          <div className="space-y-1">
                             <span className="text-[10px] font-bold text-text-light">Assists</span>
                             <input 
                               type="number" 
                               className="w-full bg-white border border-border-custom rounded px-3 py-2 text-sm" 
                               value={submissionForm.stats.playerAssists}
                               onChange={(e) => setSubmissionForm({...submissionForm, stats: {...submissionForm.stats, playerAssists: parseInt(e.target.value)}})}
                             />
                          </div>
                       </div>
                    )}
                    {submissionForm.sport === 'badminton' && (
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                             <input 
                               type="checkbox" 
                               id="win"
                               checked={submissionForm.stats.isWinner}
                               onChange={(e) => setSubmissionForm({...submissionForm, stats: {...submissionForm.stats, isWinner: e.target.checked}})}
                             />
                             <label htmlFor="win" className="text-sm font-bold text-primary">Match Won?</label>
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-text-light/60 flex items-center gap-2">
                       <Camera size={14} /> Scorecard Screenshot URL
                    </label>
                    <input 
                      placeholder="Paste image link here..."
                      className="w-full bg-muted/50 border border-border-custom rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-all"
                      value={submissionForm.proofURL}
                      onChange={(e) => setSubmissionForm({...submissionForm, proofURL: e.target.value})}
                    />
                    <p className="text-[10px] text-text-light italic">Admins will verify this proof before syncing stats.</p>
                 </div>
              </div>

              <div className="pt-4 flex gap-3">
                 <Button 
                   variant="ghost" 
                   className="flex-1 font-black text-xs uppercase"
                   onClick={() => setShowSubmitModal(false)}
                 >
                    Cancel
                 </Button>
                 <Button 
                   className="flex-1 bg-primary text-secondary font-black text-xs uppercase h-12"
                   onClick={handleSubmitScore}
                 >
                    Submit for Approval
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
