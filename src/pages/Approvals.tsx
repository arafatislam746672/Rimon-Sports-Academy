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
    if (profile?.role !== 'management') return;

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
  }, [profile]);

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
      <div className="text-center py-32 bg-muted/30 rounded-[48px] border-4 border-dashed border-border flex flex-col items-center justify-center gap-8">
        <div className="w-24 h-24 rounded-[32px] bg-primary/5 flex items-center justify-center text-foreground/80">
          <ShieldCheck size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground uppercase tracking-widest italic">Unauthorized Sector</h2>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest max-w-xs mx-auto leading-relaxed">Management clearance required to access the approval queue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-border">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-3">
            Security <span className="text-accent">Clearance</span>
          </h2>
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 italic">Academy verification & access control</p>
        </div>
      </header>

      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="bg-muted p-1.5 rounded-2xl mb-10 w-fit">
          <TabsTrigger value="submissions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-[10px] tracking-widest py-3 px-8 rounded-xl transition-all relative">
             Match Scores
             {submissions.filter(s => s.status === 'pending').length > 0 && (
               <span className="absolute -top-1 -right-1 bg-accent text-primary-foreground w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black border-2 border-border">
                 {submissions.filter(s => s.status === 'pending').length}
               </span>
             )}
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase text-[10px] tracking-widest py-3 px-8 rounded-xl transition-all relative">
             User Profiles
             {pendingProfiles.length > 0 && (
               <span className="absolute -top-1 -right-1 bg-accent text-primary-foreground w-5 h-5 flex items-center justify-center rounded-full text-[9px] font-black border-2 border-border">
                 {pendingProfiles.length}
               </span>
             )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Awaiting Validation</h3>
            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-border">
              {(['pending', 'approved', 'rejected'] as const).map(f => (
                <Button
                  key={f}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSubmissionFilter(f)}
                  className={cn(
                    "font-black text-[9px] tracking-widest px-4 rounded-lg transition-all",
                    submissionFilter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-muted-foreground/80"
                  )}
                >
                  {(f || 'pending').toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSubmissions.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 text-center rounded-[48px] border-4 border-dashed border-border flex flex-col items-center justify-center gap-6"
                >
                   <Clock size={40} className="text-foreground/80" />
                   <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.4em] italic leading-relaxed">
                     Queue cleared. No {submissionFilter} assets detected.
                   </p>
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
                    <Card className="elite-card border-none shadow-2xl shadow-black/40 rounded-[40px] overflow-hidden bg-card">
                      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 items-center">
                        <div className="p-10 border-r border-border flex items-center gap-6">
                          <div className="w-14 h-14 rounded-[20px] bg-accent/10 flex items-center justify-center text-accent font-black uppercase text-xl">
                            {players[sub.playerId]?.name[0] || '?'}
                          </div>
                          <div>
                            <p className="text-base font-black text-foreground tracking-tight uppercase italic">{players[sub.playerId]?.name || 'Unknown'}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{sub.sport}</p>
                          </div>
                        </div>

                        <div className="p-10 md:col-span-2 lg:col-span-3 space-y-4">
                           <div className="flex flex-col gap-1">
                              <h4 className="text-xl font-black text-foreground tracking-tight uppercase italic">{sub.matchTitle}</h4>
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{new Date(sub.matchDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                           </div>
                           <div className="flex flex-wrap gap-10">
                              {sub.sport === 'cricket' && (
                                <div className="space-y-1">
                                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Performance Data</p>
                                   <p className="text-base font-black text-foreground underline decoration-accent/30 decoration-4 underline-offset-4 italic">{sub.scoreData.playerRuns} Runs • {sub.scoreData.playerWickets} Wickets</p>
                                </div>
                              )}
                              {sub.sport === 'football' && (
                                 <div className="space-y-1">
                                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Performance Data</p>
                                   <p className="text-base font-black text-foreground underline decoration-emerald-500/30 decoration-4 underline-offset-4 italic">{sub.scoreData.playerGoals} Goals • {sub.scoreData.playerAssists} Assists</p>
                                </div>
                              )}
                           </div>
                        </div>

                        <div className="p-10 md:col-span-1 border-l border-border text-center bg-muted/20">
                           <a href={sub.proofURL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-accent font-black uppercase text-[10px] tracking-widest hover:underline px-6 py-3 bg-accent/10 rounded-2xl transition-all">
                              Digital Proof <ExternalLink size={14} />
                           </a>
                        </div>

                        <div className="p-10 md:col-span-4 lg:col-span-1 border-l border-border bg-muted/20">
                           {sub.status === 'pending' ? (
                             <div className="flex lg:flex-col gap-3">
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-primary-foreground font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all" onClick={() => handleApproveSubmission(sub)}>Verify</Button>
                                <Button variant="outline" className="border-red-100 text-red-500 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest h-12 rounded-2xl active:scale-95 transition-all" onClick={() => handleRejectSubmission(sub.id)}>Reject</Button>
                             </div>
                           ) : (
                             <Badge className={cn(
                               "w-full h-12 rounded-2xl flex items-center justify-center font-black uppercase text-[10px] tracking-widest",
                               sub.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-none' : 'bg-red-50 text-red-600 border-none'
                             )} variant="outline">
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

        <TabsContent value="users" className="space-y-8">
           <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] italic">Pending Enrollment</h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatePresence mode="popLayout">
                 {pendingProfiles.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2 py-32 text-center rounded-[48px] border-4 border-dashed border-border flex flex-col items-center justify-center gap-6">
                       <div className="w-20 h-20 rounded-[32px] bg-muted/30 flex items-center justify-center text-foreground/80">
                         <UserCheck size={40} />
                       </div>
                       <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.4em] italic leading-relaxed">Identity queue empty. No pending verifications.</p>
                    </motion.div>
                 ) : (
                    pendingProfiles.map((p) => (
                       <motion.div key={p.uid} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                          <Card className="elite-card border-none shadow-2xl shadow-black/40 bg-card rounded-[40px] overflow-hidden">
                             <div className="p-10 space-y-8">
                                <div className="flex items-center gap-6">
                                   <div className="w-20 h-20 rounded-[30px] bg-primary flex items-center justify-center text-primary-foreground text-3xl font-black italic border-8 border-border shadow-xl">
                                      {p.name[0]}
                                   </div>
                                   <div>
                                      <h4 className="text-2xl font-black text-foreground tracking-tight uppercase italic">{p.name}</h4>
                                      <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{p.role}</p>
                                   </div>
                                </div>
                                <div className="space-y-1.5 pt-4 border-t border-border">
                                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Verified Credentials</p>
                                   <p className="text-sm font-black text-foreground tracking-tight">{p.email}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                   <Button className="bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl hover:bg-primary shadow-xl shadow-primary/10 active:scale-95 transition-all" onClick={() => handleApproveUser(p.uid)}>
                                      Grant Access
                                   </Button>
                                   <Button variant="outline" className="border-red-50 text-red-500 font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl hover:bg-red-50 active:scale-95 transition-all" onClick={() => handleRejectUser(p.uid)}>
                                      Deny
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
