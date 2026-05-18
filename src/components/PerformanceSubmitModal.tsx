import * as React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Trophy, 
  Activity, 
  Calendar, 
  ArrowRight, 
  Upload, 
  ShieldCheck,
  Target,
  FileText,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '@/services/dataService';
import { toast } from 'sonner';
import { Sport } from '@/types';
import { cn } from '@/lib/utils';

interface PerformanceSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName: string;
  defaultSport?: Sport;
}

export default function PerformanceSubmitModal({ 
  isOpen, 
  onClose, 
  playerId, 
  playerName,
  defaultSport = 'football' 
}: PerformanceSubmitModalProps) {
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sport, setSport] = React.useState<Sport>(defaultSport);
  const [matchTitle, setMatchTitle] = React.useState('');
  const [matchDate, setMatchDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [scoreData, setScoreData] = React.useState<any>({});
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [proofPreview, setProofPreview] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!proofFile) {
      toast.error('Evidence file is required for verification.');
      return;
    }

    setIsLoading(true);
    try {
      const proofURL = await dataService.uploadFile(proofFile, `submissions/${playerId}/${Date.now()}_${proofFile.name}`);
      
      await dataService.submitMatchStats({
        playerId,
        sport,
        matchTitle,
        matchDate,
        scoreData,
        proofURL
      });

      toast.success('Performance payload dispatched for validation!');
      onClose();
      // Reset
      setStep(1);
      setMatchTitle('');
      setScoreData({});
      setProofFile(null);
      setProofPreview(null);
    } catch (error) {
      toast.error('Dispatch failed. Integrity check required.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateScoreData = (field: string, value: any) => {
    setScoreData((prev: any) => ({ ...prev, [field]: value }));
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none bg-background/90 backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] rounded-[40px]">
        <div className="relative">
          {/* Decorative gradients */}
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative px-10 pt-12 pb-10 space-y-10"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-white/5 flex items-center justify-center shadow-inner group overflow-hidden">
                    {step === 1 ? <Target className="w-7 h-7 text-primary" /> : step === 2 ? <Activity className="w-7 h-7 text-accent" /> : <Upload className="w-7 h-7 text-emerald-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] italic opacity-60">Step 0{step} <span className="mx-2 text-primary">/</span> 03</p>
                    <DialogTitle className="text-3xl font-display font-black uppercase tracking-tighter italic text-foreground leading-none">
                      {step === 1 ? 'Mission Parameters' : step === 2 ? 'Telemetry Scan' : 'Digital Evidence'}
                    </DialogTitle>
                  </div>
                </div>
                <DialogDescription className="text-muted-foreground text-xs font-bold uppercase tracking-widest italic opacity-70">
                  {step === 1 ? 'Configure deployment metadata for verification.' : step === 2 ? 'Quantify your impact on the field of play.' : 'Upload visual confirmation for authentication.'}
                </DialogDescription>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic">Tactical Vertical (Sport)</Label>
                    <Select value={sport} onValueChange={(v: Sport) => setSport(v)}>
                      <SelectTrigger className="h-16 rounded-2xl bg-white/[0.02] border-white/5 px-6 font-black uppercase tracking-widest text-xs italic transition-all focus:bg-white/[0.05]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 backdrop-blur-xl border-white/10 rounded-2xl">
                        <SelectItem value="football" className="font-black uppercase tracking-widest text-[10px] py-4 italic focus:bg-primary focus:text-white">Football</SelectItem>
                        <SelectItem value="cricket" className="font-black uppercase tracking-widest text-[10px] py-4 italic focus:bg-primary focus:text-white">Cricket</SelectItem>
                        <SelectItem value="badminton" className="font-black uppercase tracking-widest text-[10px] py-4 italic focus:bg-primary focus:text-white">Badminton</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic">Operation Title (Match/Event)</Label>
                    <div className="relative group">
                       <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                       <Input 
                        placeholder="ENTER MATCH DESCRIPTION..."
                        className="h-16 pl-14 rounded-2xl bg-white/[0.02] border-white/5 font-bold tracking-widest text-xs uppercase italic focus:bg-white/[0.05] focus:border-primary/40 transition-all"
                        value={matchTitle}
                        onChange={(e) => setMatchTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic">Execution Date</Label>
                    <div className="relative group">
                       <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                       <Input 
                        type="date"
                        className="h-16 pl-14 rounded-2xl bg-white/[0.02] border-white/5 font-bold tracking-widest text-xs uppercase italic focus:bg-white/[0.05] focus:border-primary/40 transition-all dark:[color-scheme:dark]"
                        value={matchDate}
                        onChange={(e) => setMatchDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={() => matchTitle ? setStep(2) : toast.error('Define match title to proceed.')}
                    className="w-full h-16 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl italic shadow-xl shadow-primary/20 group active:scale-95 transition-all"
                  >
                    Proceed to Telemetry <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    {sport === 'football' && (
                      <>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic">Goals</Label>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0"
                            className="h-20 text-center text-4xl font-black italic bg-white/[0.02] border-white/5 rounded-3xl"
                            value={scoreData.playerGoals || ''}
                            onChange={(e) => updateScoreData('playerGoals', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic">Assists</Label>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0"
                            className="h-20 text-center text-4xl font-black italic bg-white/[0.02] border-white/5 rounded-3xl"
                            value={scoreData.playerAssists || ''}
                            onChange={(e) => updateScoreData('playerAssists', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </>
                    )}

                    {sport === 'cricket' && (
                      <>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic">Individual Runs</Label>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0"
                            className="h-20 text-center text-4xl font-black italic bg-white/[0.02] border-white/5 rounded-3xl"
                            value={scoreData.playerRuns || ''}
                            onChange={(e) => updateScoreData('playerRuns', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic">Wickets Taken</Label>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0"
                            className="h-20 text-center text-4xl font-black italic bg-white/[0.02] border-white/5 rounded-3xl"
                            value={scoreData.playerWickets || ''}
                            onChange={(e) => updateScoreData('playerWickets', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </>
                    )}

                    {sport === 'badminton' && (
                      <div className="col-span-2 space-y-3">
                         <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic">Match Result</Label>
                         <div className="grid grid-cols-2 gap-4">
                            <Button 
                              variant="outline"
                              onClick={() => updateScoreData('isWinner', true)}
                              className={cn(
                                "h-20 rounded-3xl font-black uppercase tracking-widest text-xs italic transition-all",
                                scoreData.isWinner ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/50 shadow-lg shadow-emerald-500/20" : "bg-white/[0.02] border-white/5"
                              )}
                            >
                               Victory
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => updateScoreData('isWinner', false)}
                              className={cn(
                                "h-20 rounded-3xl font-black uppercase tracking-widest text-xs italic transition-all",
                                scoreData.isWinner === false ? "bg-rose-500/10 text-rose-500 border-rose-500/50 shadow-lg shadow-rose-500/20" : "bg-white/[0.02] border-white/5"
                              )}
                            >
                               Defeat
                            </Button>
                         </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex gap-4">
                    <Button 
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] italic border border-white/5 active:scale-95 transition-all"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => setStep(3)}
                      className="flex-[2] h-16 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl italic shadow-xl shadow-primary/20 active:scale-95 transition-all"
                    >
                      Summary Verification
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 italic">Evidence Payload</Label>
                    <div className="relative">
                      {proofPreview ? (
                        <div className="relative group rounded-3xl overflow-hidden border-4 border-white/10 aspect-video bg-black shadow-2xl">
                          <img src={proofPreview} alt="Proof" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 flex items-center justify-center">
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => { setProofPreview(null); setProofFile(null); }}
                                className="rounded-xl font-black uppercase tracking-widest text-[9px] h-10 px-4"
                              >
                                <X size={14} className="mr-2" /> Discard Evidence
                              </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="h-40 rounded-3xl border-4 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                             <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                               <Upload size={20} />
                             </div>
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">DRAG EVIDENCE OR SCAN DISK</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex gap-4 items-start">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 mt-1" />
                    <div>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic leading-tight">Integrity Assurance</p>
                      <p className="text-[10px] text-emerald-500/60 font-bold uppercase italic leading-relaxed mt-1">Submitted telemetry will undergo deep verification by Academy Command. Falsification results in systemic expulsion.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="ghost"
                      onClick={() => setStep(2)}
                      className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] italic border border-white/5 active:scale-95 transition-all"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={isLoading || !proofFile}
                      className="flex-[2] h-16 bg-emerald-500 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl italic shadow-xl shadow-emerald-500/20 active:scale-95 transition-all relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? 'Encrypting Payload...' : 'Initiate Dispatch'}
                        {!isLoading && <ArrowRight size={16} />}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
