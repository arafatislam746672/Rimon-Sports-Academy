import * as React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  ExternalLink,
  ShieldCheck,
  Trophy,
  Filter,
  UserCheck,
  FileText
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '@/services/dataService';
import { MatchSubmission, Player, UserProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Approvals() {
  const [submissions, setSubmissions] = React.useState<MatchSubmission[]>([]);
  const [pendingProfiles, setPendingProfiles] = React.useState<UserProfile[]>([]);
  const [players, setPlayers] = React.useState<Record<string, Player>>({});
  const [submissionFilter, setSubmissionFilter] = React.useState<'pending' | 'approved' | 'rejected'>('pending');
  const { profile } = useAuth();

  React.useEffect(() => {
    const unsubSubmissions = dataService.getSubmissions(setSubmissions);
    const unsubProfiles = dataService.getPendingProfiles(setPendingProfiles);
    const unsubPlayers = dataService.getPlayers((data) => {
      const playerMap = data.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      setPlayers(playerMap);
    });
    return () => {
      unsubSubmissions();
      unsubProfiles();
      unsubPlayers();
    };
  }, []);

  const handleApproveSubmission = async (submission: MatchSubmission) => {
    if (!profile) return;
    try {
      await dataService.approveSubmission(submission, profile.uid);
      toast.success("Submission approved and stats synced!");
    } catch (error) {
      toast.error("Approval failed.");
    }
  };

  const handleRejectSubmission = async (id: string) => {
    try {
      await dataService.rejectSubmission(id);
      toast.error("Submission rejected.");
    } catch (error) {
      toast.error("Action failed.");
    }
  };

  const handleApproveUser = async (uid: string) => {
    try {
      await dataService.approveUserProfile(uid);
      toast.success("User account approved!");
    } catch (error) {
      toast.error("Approval failed.");
    }
  };

  const handleRejectUser = async (uid: string) => {
    try {
      await dataService.rejectUserProfile(uid);
      toast.error("User account rejected.");
    } catch (error) {
      toast.error("Action failed.");
    }
  };

  const filteredSubmissions = submissions.filter(s => s.status === submissionFilter);

  if (profile?.role !== 'management') {
    return (
      <div className="text-center py-20 bg-secondary/30 rounded-3xl border-2 border-dashed border-primary/20">
        <ShieldCheck size={64} className="mx-auto text-primary/10 mb-6" />
        <h2 className="text-2xl font-black text-primary uppercase tracking-widest">Access Denied</h2>
        <p className="text-text-light font-bold mt-2">Only academy management can access the approval queue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-primary tracking-tight">MANAGEMENT CENTER</h2>
        <p className="text-text-light text-sm font-bold uppercase tracking-widest opacity-60 italic">Academy verification & access control</p>
      </header>

      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl mb-8">
          <TabsTrigger value="submissions" className="data-[state=active]:bg-primary data-[state=active]:text-secondary flex items-center gap-2 font-black uppercase text-[10px] tracking-widest py-3">
             <FileText size={16} /> Match Scores
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-secondary flex items-center gap-2 font-black uppercase text-[10px] tracking-widest py-3">
             <UserCheck size={16} /> User Approvals
             {pendingProfiles.length > 0 && (
               <Badge className="bg-accent text-primary p-0 h-4 w-4 flex items-center justify-center rounded-full text-[8px]">
                 {pendingProfiles.length}
               </Badge>
             )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest">Score Verification Hub</h3>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-border-custom shadow-sm">
              {(['pending', 'approved', 'rejected'] as const).map(f => (
                <Button
                  key={f}
                  variant={submissionFilter === f ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSubmissionFilter(f)}
                  className={f === submissionFilter ? 'bg-primary text-secondary font-black text-[10px]' : 'text-text-light font-bold text-[10px]'}
                >
                  {f.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredSubmissions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white rounded-3xl border border-border-custom"
                >
                   <Clock size={32} className="mx-auto text-primary/10 mb-4" />
                   <p className="text-[10px] font-black text-text-light uppercase tracking-widest italic opacity-40">No {submissionFilter} submissions found</p>
                </motion.div>
              ) : (
                filteredSubmissions.sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).map((sub) => (
                  <motion.div
                    key={sub.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="shadow-card border-border-custom overflow-hidden group">
                      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 items-center">
                        <div className="p-6 md:col-span-1 border-r border-muted flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                            {players[sub.playerId]?.name[0] || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-primary tracking-tight">{players[sub.playerId]?.name || 'Unknown'}</p>
                            <p className="text-[9px] font-bold text-text-light uppercase tracking-tighter">{sub.sport}</p>
                          </div>
                        </div>

                        <div className="p-6 md:col-span-2 lg:col-span-3 space-y-1">
                           <div className="flex items-center gap-2">
                              <h4 className="text-base font-black text-primary tracking-tight">{sub.matchTitle}</h4>
                              <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary">
                                 {new Date(sub.matchDate).toLocaleDateString()}
                              </Badge>
                           </div>
                           <div className="flex flex-wrap gap-4">
                              {sub.sport === 'cricket' && (
                                 <p className="text-[10px] font-bold text-text-light uppercase">Score: <span className="text-primary font-black">{sub.scoreData.playerRuns}R, {sub.scoreData.playerWickets}W</span></p>
                              )}
                              {sub.sport === 'football' && (
                                 <p className="text-[10px] font-bold text-text-light uppercase">Score: <span className="text-primary font-black">{sub.scoreData.playerGoals}G, {sub.scoreData.playerAssists}A</span></p>
                              )}
                           </div>
                        </div>

                        <div className="p-6 md:col-span-1 border-l border-muted text-center">
                           <a href={sub.proofURL} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-accent uppercase flex items-center justify-center gap-1">
                              View Proof <ExternalLink size={10} />
                           </a>
                        </div>

                        <div className="p-6 md:col-span-4 lg:col-span-1 border-l border-muted bg-muted/5">
                           {sub.status === 'pending' ? (
                             <div className="flex lg:flex-col gap-2">
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[10px]" onClick={() => handleApproveSubmission(sub)}>Approve</Button>
                                <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 font-black uppercase text-[10px]" onClick={() => handleRejectSubmission(submissionFilter === 'pending' ? sub.id : sub.id)}>Reject</Button>
                             </div>
                           ) : (
                             <Badge className={cn("w-full justify-center font-black uppercase text-[10px]", sub.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200')}>
                               {sub.status}
                             </Badge>
                           )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-primary uppercase tracking-widest">Identity & Access Control</h3>
           </div>

           <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                 {pendingProfiles.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-3xl border border-border-custom">
                       <UserCheck size={32} className="mx-auto text-primary/10 mb-4" />
                       <p className="text-[10px] font-black text-text-light uppercase tracking-widest italic opacity-40">No pending user approvals</p>
                    </motion.div>
                 ) : (
                    pendingProfiles.map((p) => (
                       <motion.div key={p.uid} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                          <Card className="shadow-card border-border-custom overflow-hidden">
                             <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-primary font-black uppercase italic text-xl border-2 border-accent/30">
                                   {p.name[0]}
                                </div>
                                <div className="flex-1 space-y-1 text-center md:text-left">
                                   <div className="flex items-center justify-center md:justify-start gap-4">
                                      <h4 className="text-lg font-black text-primary tracking-tight uppercase italic">{p.name}</h4>
                                      <Badge variant="outline" className="bg-primary/5 text-primary text-[8px] font-black uppercase tracking-widest">{p.role}</Badge>
                                   </div>
                                   <p className="text-xs font-bold text-text-light opacity-60">{p.email}</p>
                                   <p className="text-[10px] font-black text-accent uppercase tracking-widest">ID: {p.uid.substring(0, 8)}...</p>
                                </div>
                                <div className="flex gap-2">
                                   <Button className="bg-primary text-secondary font-black uppercase text-[10px] tracking-widest h-10 px-6" onClick={() => handleApproveUser(p.uid)}>
                                      Approve Access
                                   </Button>
                                   <Button variant="outline" className="border-red-200 text-red-600 font-black uppercase text-[10px] h-10 px-6" onClick={() => handleRejectUser(p.uid)}>
                                      Reject
                                   </Button>
                                </div>
                             </div>
                          </Card>
                       </motion.div>
                    ))
                 )}
              </AnimatePresence>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
