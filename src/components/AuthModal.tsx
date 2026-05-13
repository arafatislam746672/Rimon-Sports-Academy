import * as React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { UserRole } from '@/types';
import { LogIn, UserPlus, Chrome } from 'lucide-react';

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
      toast.success('Successfully logged in with Google!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success('Logged in successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, name, initialRole);
      toast.success('Account created successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] border-border-custom bg-white">
        <DialogHeader>
          <DialogTitle className="text-primary font-black uppercase tracking-wider text-xl">
            {initialRole === 'management' ? 'Staff Portal' : 'Athlete Portal'}
          </DialogTitle>
          <DialogDescription className="text-text-light font-medium text-xs">
            Access your {initialRole} account to manage sports data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Button 
            onClick={handleGoogleLogin} 
            disabled={isLoading}
            variant="outline" 
            className="w-full h-12 flex items-center justify-center gap-3 border-border-custom hover:bg-secondary/5 font-bold transition-all"
          >
            <Chrome size={20} className="text-blue-500" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border-custom" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-text-light/40 font-black">Or continue with email</span>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/20 p-1 rounded-xl mb-4">
              <TabsTrigger value="login" className="rounded-lg font-black text-[10px] uppercase tracking-widest">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg font-black text-[10px] uppercase tracking-widest">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Email</Label>
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-border-custom rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Password</Label>
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-border-custom rounded-xl h-11"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-primary text-secondary h-11 font-black uppercase tracking-widest text-xs">
                  {isLoading ? 'Signing In...' : 'Sign In'}
                  <LogIn size={16} className="ml-2" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Full Name</Label>
                  <Input 
                    placeholder="John Doe" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-border-custom rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Email</Label>
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-border-custom rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-light/60">Password</Label>
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-border-custom rounded-xl h-11"
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full bg-accent text-primary h-11 font-black uppercase tracking-widest text-xs hover:bg-accent/90">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                  <UserPlus size={16} className="ml-2" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="sm:justify-center border-t border-border-custom pt-4">
           <p className="text-[10px] text-text-light/40 font-bold uppercase tracking-widest">Secure auth via Firebase</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
