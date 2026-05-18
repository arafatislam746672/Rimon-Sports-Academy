import * as React from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  User as UserIcon, 
  Search, 
  MoreVertical,
  Check,
  X,
  Lock,
  Unlock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '@/services/dataService';
import { UserProfile, UserRole, UserStatus, UserPermissions } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

export default function UserManagement() {
  const { profile: currentProfile } = useAuth();
  const [profiles, setProfiles] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    if (!currentProfile) return;
    
    const isSuperAdminUser = currentProfile.isSuperAdmin || 
                         currentProfile.email === 'malihajahanshamme@gmail.com' || 
                         currentProfile.email === 'arafathislam279@gmail.com' ||
                         currentProfile.email === 'raisamoni7466@gmail.com';
    
    if (!isSuperAdminUser) {
      setLoading(false);
      return;
    }

    const unsub = dataService.getProfiles(setProfiles);
    setLoading(false);
    return unsub;
  }, [currentProfile]);

  const handleUpdateRole = async (uid: string, role: UserRole) => {
    try {
      await dataService.updatePlayerProfile(uid, { role });
      toast.success(`Role updated to ${role}`);
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleUpdateStatus = async (uid: string, status: UserStatus) => {
    try {
      await dataService.updatePlayerProfile(uid, { status });
      toast.success(`User status: ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleTogglePermission = async (uid: string, permission: keyof UserPermissions) => {
    const userToUpdate = profiles.find(p => p.uid === uid);
    if (!userToUpdate) return;

    const currentPermissions = userToUpdate.permissions || {};
    const newPermissions = {
      ...currentPermissions,
      [permission]: !currentPermissions[permission]
    };

    try {
      await dataService.updatePlayerProfile(uid, { permissions: newPermissions });
      toast.success("Permission updated");
    } catch (error) {
      toast.error("Failed to update permission");
    }
  };

  const handleToggleSuperAdmin = async (uid: string) => {
    const userToUpdate = profiles.find(p => p.uid === uid);
    if (!userToUpdate) return;

    if (userToUpdate.email === 'malihajahanshamme@gmail.com' || userToUpdate.email === 'arafathislam279@gmail.com') {
        toast.error("Cannot remove super admin status from master account");
        return;
    }

    try {
      await dataService.updatePlayerProfile(uid, { isSuperAdmin: !userToUpdate.isSuperAdmin });
      toast.success(userToUpdate.isSuperAdmin ? "Super admin rights revoked" : "User promoted to Super Admin");
    } catch (error) {
           toast.error("Action failed");
    }
  };

  // Check if current user is actually allowed to be here
  const isSuperAdmin = currentProfile?.isSuperAdmin || currentProfile?.email === 'malihajahanshamme@gmail.com' || currentProfile?.email === 'arafathislam279@gmail.com';

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-100">
           <ShieldAlert size={48} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tight">Access Denied</h2>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest max-w-sm">This sector is restricted to Terminal level administrators only.</p>
        </div>
      </div>
    );
  }

  const filteredProfiles = profiles.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent rounded-lg text-primary-foreground shadow-lg shadow-accent/20">
                 <ShieldCheck size={20} />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">Terminal Access</h2>
           </div>
           <h1 className="text-5xl font-black text-foreground uppercase italic tracking-tighter">User <span className="text-accent">Governance</span></h1>
           <p className="text-muted-foreground font-medium text-sm mt-1">Manage personnel clearance levels and operational permissions.</p>
        </div>

        <div className="relative w-full md:w-96">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
           <Input 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search Personnel Database..."
             className="h-16 pl-14 pr-6 rounded-2xl bg-card border-border shadow-xl shadow-black/40 font-bold text-xs uppercase tracking-widest focus:ring-2 focus:ring-accent transition-all"
           />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2">
          <Card className="elite-card border-none shadow-2xl rounded-[40px] bg-card overflow-hidden">
             <CardHeader className="p-10 pb-6 border-b border-border flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-xl font-black uppercase italic tracking-tight text-foreground">Personnel <span className="text-accent">Manifest</span></CardTitle>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Verified security profiles</p>
                </div>
                <Badge className="bg-primary text-primary-foreground border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                   {filteredProfiles.length} Total Registered
                </Badge>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-border">
                   {filteredProfiles.map((user) => (
                      <div 
                        key={user.uid}
                        onClick={() => setSelectedUser(user)}
                        className={cn(
                          "group p-6 flex flex-col md:flex-row md:items-center gap-6 cursor-pointer transition-all border-l-4",
                          selectedUser?.uid === user.uid ? "bg-accent/10 border-accent" : "hover:bg-muted/30 border-transparent"
                        )}
                      >
                         <div className="flex items-center gap-5 flex-1">
                            <Avatar className="h-14 w-14 rounded-2xl border-4 border-background shadow-xl group-hover:rotate-3 transition-transform">
                               <AvatarImage src={user.photoURL} alt={user.name} className="object-cover" />
                               <AvatarFallback className="font-black text-muted-foreground bg-muted">{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                               <div className="flex items-center gap-2 mb-0.5">
                                  <h4 className="font-black text-sm uppercase italic tracking-tight text-foreground truncate">
                                     {user.name}
                                  </h4>
                                  {user.isSuperAdmin && (
                                     <div className="p-1 bg-red-500/20 text-red-500 rounded-md">
                                        <ShieldAlert size={10} />
                                     </div>
                                  )}
                               </div>
                               <p className="text-[10px] font-bold text-muted-foreground truncate">{user.email}</p>
                            </div>
                         </div>

                         <div className="flex flex-wrap items-center gap-3">
                            <Badge className={cn(
                               "border-none px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full",
                               user.role === UserRole.MANAGEMENT ? "bg-primary text-primary-foreground" : "bg-accent/20 text-accent"
                            )}>
                               {user.role}
                            </Badge>
                            <Badge className={cn(
                               "border-none px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full",
                               user.status === 'approved' ? "bg-emerald-500 text-primary-foreground" : 
                               user.status === 'pending' ? "bg-amber-500 text-primary-foreground" : "bg-red-500 text-primary-foreground"
                            )}>
                               {user.status}
                            </Badge>
                            <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:bg-accent/10 transition-all">
                               <ChevronRight size={16} />
                            </div>
                         </div>
                      </div>
                   ))}

                   {filteredProfiles.length === 0 && (
                      <div className="py-20 text-center flex flex-col items-center gap-4">
                         <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-foreground/70">
                            <Search size={32} />
                         </div>
                         <p className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">No matching personnel identified.</p>
                      </div>
                   )}
                </div>
             </CardContent>
          </Card>
        </div>

        <div>
          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div
                key={selectedUser.uid}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="space-y-6"
              >
                <Card className="elite-card border-none shadow-3xl rounded-[40px] bg-primary text-primary-foreground overflow-hidden">
                   <div className="p-8 pb-4 text-center">
                      <Avatar className="h-24 w-24 rounded-[32px] border-8 border-border/5 mx-auto mb-6 shadow-2xl">
                         <AvatarImage src={selectedUser.photoURL} alt={selectedUser.name} className="object-cover" />
                         <AvatarFallback className="text-3xl font-black bg-card/10 text-primary-foreground/70">{selectedUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-1">{selectedUser.name}</h3>
                      <p className="text-[10px] font-bold text-primary-foreground/70 tracking-wider mb-6">{selectedUser.email}</p>
                      
                      <div className="flex items-center justify-center gap-3">
                         <Button 
                           onClick={() => handleToggleSuperAdmin(selectedUser.uid)}
                           className={cn(
                             "h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all gap-2",
                             selectedUser.isSuperAdmin ? "bg-red-500/10 text-red-500 hover:bg-red-500 text-primary-foreground border border-red-500/50" : "bg-card/10 text-primary-foreground hover:bg-card/20 border border-border/5"
                           )}
                         >
                           {selectedUser.isSuperAdmin ? <Lock size={14} /> : <Unlock size={14} />}
                           {selectedUser.isSuperAdmin ? "Demote Admin" : "Promote to Admin"}
                         </Button>
                      </div>
                   </div>

                   <CardContent className="p-8 space-y-10">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/60">Clearance Level</Label>
                            <Select value={selectedUser.role} onValueChange={(val) => handleUpdateRole(selectedUser.uid, val as UserRole)}>
                               <SelectTrigger className="h-12 bg-card/10 border-none rounded-xl text-xs font-bold uppercase tracking-widest text-primary-foreground">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-muted border-none rounded-xl">
                                  <SelectItem value={UserRole.PLAYER} className="text-primary-foreground hover:bg-card/10">Athlete</SelectItem>
                                  <SelectItem value={UserRole.MANAGEMENT} className="text-primary-foreground hover:bg-card/10">Staff/Mgmt</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground/60">Verification Status</Label>
                            <Select value={selectedUser.status} onValueChange={(val) => handleUpdateStatus(selectedUser.uid, val as UserStatus)}>
                               <SelectTrigger className="h-12 bg-card/10 border-none rounded-xl text-xs font-bold uppercase tracking-widest text-primary-foreground">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-muted border-none rounded-xl">
                                  <SelectItem value="pending" className="text-primary-foreground hover:bg-card/10">Pending</SelectItem>
                                  <SelectItem value="approved" className="text-primary-foreground hover:bg-card/10">Approved</SelectItem>
                                  <SelectItem value="rejected" className="text-primary-foreground hover:bg-card/10">Rejected</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                      </div>

                      <div className="space-y-6 pt-6 border-t border-border/5">
                         <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/80">Operational Privileges</h4>
                            <Badge className="bg-accent/20 text-accent/80 border-none text-[8px] font-black italic">GRANULAR CONTROL</Badge>
                         </div>

                         <div className="space-y-4">
                            {[
                              { key: 'fullControl', label: 'Terminal Control', desc: 'Absolute bypass of all restriction protocols' },
                              { key: 'managePlayers', label: 'Athlete Management', desc: 'Authority to modify pro/academy files' },
                              { key: 'manageTeams', label: 'Squad Deployment', desc: 'Full control over formation/team assets' },
                              { key: 'manageMatches', label: 'Operation Center', desc: 'Scoring and real-time match control' },
                              { key: 'manageTournaments', label: 'Campaign Strategist', desc: 'Manage tournament grids and data' },
                              { key: 'manageProfiles', label: 'Security Clearance', desc: 'Approve/Reject new personnel access' },
                            ].map((perm) => (
                               <div key={perm.key} className="flex items-center justify-between p-4 bg-card/10 rounded-2xl border border-border/5 hover:bg-card/10 transition-all cursor-pointer" onClick={() => handleTogglePermission(selectedUser.uid, perm.key as keyof UserPermissions)}>
                                  <div className="min-w-0 pr-4">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-primary-foreground mb-0.5">{perm.label}</p>
                                     <p className="text-[8px] font-medium text-primary-foreground/60 truncate">{perm.desc}</p>
                                  </div>
                                  <Switch 
                                    checked={selectedUser.permissions?.[perm.key as keyof UserPermissions] || false} 
                                    onCheckedChange={() => handleTogglePermission(selectedUser.uid, perm.key as keyof UserPermissions)}
                                    className="data-[state=checked]:bg-accent"
                                  />
                               </div>
                            ))}
                         </div>
                      </div>
                   </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-card rounded-[40px] border border-border/50 shadow-2xl border-dashed">
                 <div className="w-20 h-20 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-6">
                    <UserIcon size={40} />
                 </div>
                 <h4 className="text-sm font-black uppercase italic tracking-tight text-muted-foreground">Terminal Idle</h4>
                 <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">Select personnel to modify clearance.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
