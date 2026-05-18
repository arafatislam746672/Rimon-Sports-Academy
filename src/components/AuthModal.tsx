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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { UserRole } from '@/types';
import { LogIn, UserPlus, Chrome, Fingerprint, ShieldCheck, Mail, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole: UserRole;
}

export default function AuthModal({ isOpen, onClose, initialRole }: AuthModalProps) {
  const { loginWithGoogle, signUpWithEmail, signInWithEmail } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle(initialRole);
      toast.success('Access granted via Google Authority');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Verification sequence failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Identity verified. Welcome back.');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Credentials invalid');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, name, initialRole);
      toast.success('New identity registered in the system.');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'System registration error');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none bg-[#050608] shadow-[0_0_80px_-20px_rgba(var(--primary),0.3)] rounded-[40px] sm:rounded-[48px]">
        <div className="relative min-h-[600px] flex flex-col">
          {/* Kinetic Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative flex-1 flex flex-col px-8 sm:px-12 pt-12 pb-10 gap-10"
          >
            <DialogHeader className="space-y-6">
              <motion.div variants={itemVariants} className="flex justify-center">
                <div className="relative group cursor-pointer">
                  {/* Outer glowing rings */}
                  <div className="absolute -inset-4 bg-primary/20 rounded-[40px] blur-2xl opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute -inset-1 bg-gradient-to-tr from-primary via-accent to-primary rounded-[34px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                  
                  <div className="relative w-24 h-24 rounded-[32px] bg-[#0c0d10] border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-primary/50 transition-colors">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_4s_infinite]" />
                    <Fingerprint className="w-12 h-12 text-primary group-hover:scale-110 group-hover:text-accent transition-all duration-500 z-10 drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    
                    {/* High-tech scanning beam */}
                    <motion.div 
                      className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent z-20"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Grid texture */}
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:10px_10px]" />
                  </div>
                </div>
              </motion.div>

              <div className="text-center space-y-3">
                <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
                  <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />
                  <DialogDescription className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.5em] flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    Secure Induction Portal
                  </DialogDescription>
                  <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/20" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <DialogTitle className="text-white font-display font-black uppercase tracking-tighter text-5xl sm:text-6xl italic leading-[0.85] flex flex-col italic">
                    <span className="text-3xl sm:text-4xl text-primary/80 mb-1">Elite</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/30">
                      {initialRole === UserRole.MANAGEMENT ? 'Terminal' : 'Personnel'}
                    </span>
                  </DialogTitle>
                </motion.div>
              </div>
            </DialogHeader>

            <motion.div variants={itemVariants} className="flex-1 space-y-8">
              <Tabs defaultValue="login" className="w-full" onValueChange={() => { setEmail(''); setPassword(''); setName(''); }}>
                <div className="bg-[#111216] p-1 rounded-[24px] border border-white/5 mb-8 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <TabsList className="grid w-full grid-cols-2 bg-transparent h-14 relative z-10 shadow-none ring-0 focus-visible:ring-0">
                    <TabsTrigger 
                      value="login" 
                      className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl transition-all duration-500 italic"
                    >
                      Identification
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl transition-all duration-500 italic"
                    >
                      Enlistment
                    </TabsTrigger>
                  </TabsList>
                </div>

                <AnimatePresence mode="wait">
                  <TabsContent value="login" key="login" className="focus-visible:ring-0 focus-visible:outline-none">
                    <motion.form 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onSubmit={handleEmailSignIn} 
                      className="space-y-6"
                    >
                      <div className="space-y-5">
                        <div className="relative group/input">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 transition-colors group-focus-within/input:text-primary text-white/30">
                             <Mail size={18} />
                          </div>
                          <Input 
                            type="email" 
                            placeholder="OPERATIONAL EMAIL" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-16 bg-[#111216]/50 border-white/5 rounded-[20px] h-16 text-xs font-black tracking-widest text-white uppercase placeholder:text-white/20 focus:bg-[#111216] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                          />
                        </div>
                        <div className="relative group/input">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 transition-colors group-focus-within/input:text-primary text-white/30">
                             <Lock size={18} />
                          </div>
                          <Input 
                            type="password" 
                            placeholder="SECRET KEY"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-16 bg-[#111216]/50 border-white/5 rounded-[20px] h-16 text-xs font-black tracking-widest text-white placeholder:text-white/20 focus:bg-[#111216] focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <Button 
                          type="submit" 
                          disabled={isLoading} 
                          className="w-full bg-primary text-primary-foreground h-16 rounded-[22px] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-primary/90 hover:shadow-primary/20 active:scale-[0.98] transition-all relative overflow-hidden group/btn italic"
                        >
                          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {isLoading ? 'Accessing...' : 'Verify Identity'}
                            <Fingerprint size={16} />
                          </span>
                        </Button>

                        <div className="relative flex items-center py-2">
                          <div className="flex-grow border-t border-white/5"></div>
                          <span className="flex-shrink mx-4 text-[8px] font-black uppercase tracking-[0.4em] text-white/10 italic">Oauth-X Interface</span>
                          <div className="flex-grow border-t border-white/5"></div>
                        </div>

                        <Button 
                          onClick={handleGoogleLogin} 
                          disabled={isLoading}
                          variant="outline" 
                          className="w-full h-16 flex items-center justify-center gap-4 bg-white/[0.02] border-white/5 hover:bg-white/[0.05] rounded-[22px] font-black transition-all group overflow-hidden shadow-xl"
                        >
                          <div className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <Chrome size={18} className="text-white group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.3em] text-white/80 group-hover:text-white transition-colors">Google Authority</span>
                        </Button>
                      </div>
                    </motion.form>
                  </TabsContent>

                  <TabsContent value="signup" key="signup" className="focus-visible:ring-0 focus-visible:outline-none">
                    <motion.form 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleEmailSignUp} 
                      className="space-y-5"
                    >
                      <div className="relative group/input">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 z-10 text-white/30 group-focus-within/input:text-primary transition-colors" size={18} />
                        <Input 
                          placeholder="ASSET NAME" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="pl-16 bg-[#111216]/50 border-white/5 rounded-[20px] h-16 text-xs font-black tracking-widest text-white uppercase placeholder:text-white/20 focus:bg-[#111216] transition-all"
                        />
                      </div>
                      <div className="relative group/input">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 z-10 text-white/30 group-focus-within/input:text-primary transition-colors" size={18} />
                        <Input 
                          type="email" 
                          placeholder="REGISTRATION EMAIL" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-16 bg-[#111216]/50 border-white/5 rounded-[20px] h-16 text-xs font-black tracking-widest text-white uppercase placeholder:text-white/20 focus:bg-[#111216] transition-all"
                        />
                      </div>
                      <div className="relative group/input">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 z-10 text-white/30 group-focus-within/input:text-primary transition-colors" size={18} />
                        <Input 
                          type="password" 
                          placeholder="CIPHER KEY"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-16 bg-[#111216]/50 border-white/5 rounded-[20px] h-16 text-xs font-black tracking-widest text-white placeholder:text-white/20 focus:bg-[#111216] transition-all"
                        />
                      </div>
                      
                      <div className="pt-4 space-y-4">
                        <Button 
                          type="submit" 
                          disabled={isLoading} 
                          className="w-full bg-accent text-accent-foreground h-16 rounded-[22px] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-accent/90 transition-all italic"
                        >
                          <span className="flex items-center justify-center gap-3">
                            {isLoading ? 'Processing...' : 'Enlist Personnel'}
                            <UserPlus size={16} />
                          </span>
                        </Button>
                        <p className="text-[8px] text-white/20 text-center font-black uppercase tracking-[0.2em] px-4">
                          By enlisting, you agree to the academy's operational protocols and strategic guidelines.
                        </p>
                      </div>
                    </motion.form>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </motion.div>

            {/* Matrix Status Readout */}
            <motion.div 
              variants={itemVariants} 
              className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                 <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full border border-black bg-muted/20 overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${i * 123}`} alt="" />
                      </div>
                    ))}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest leading-none mb-1">Academy Pulse</span>
                    <span className="text-[9px] font-black text-emerald-500 uppercase italic">148 Actives Online</span>
                 </div>
              </div>
              
              <div className="flex items-center gap-2 group cursor-help">
                <div className="text-right">
                  <span className="text-[7px] font-black text-white/30 uppercase tracking-widest leading-none block">Latency</span>
                  <span className="text-[9px] font-black text-primary uppercase italic">0.4ms</span>
                </div>
                <ShieldCheck className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
