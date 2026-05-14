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
    const unsub = dataService.getProfiles(setProfiles);
    setLoading(false);
    return unsub;
  }, []);

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
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">Access Denied</h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-sm">This sector is restricted to Terminal level administrators only.</p>
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
              <div className="p-2 bg-indigo-500 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                 <ShieldCheck size={20} />
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Terminal Access</h2>
           </div>
           <h1 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter">User <span className="text-indigo-500">Governance</span></h1>
           <p className="text-slate-400 font-medium text-sm mt-1">Manage personnel clearance levels and operational permissions.</p>
        </div>

        <div className="relative w-full md:w-96">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <Input 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search Personnel Database..."
             className="h-16 pl-14 pr-6 rounded-2xl bg-white border-slate-100 shadow-xl shadow-slate-200/50 font-bold text-xs uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 transition-all"
           />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2">
          <Card className="elite-card border-none shadow-2xl rounded-[40px] bg-white overflow-hidden">
             <CardHeader className="p-10 pb-6 border-b border-slate-50 flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-xl font-black uppercase italic tracking-tight">Personnel <span className="text-indigo-500">Manifest</span></CardTitle>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-60">Verified security profiles</p>
                </div>
                <Badge className="bg-slate-900 text-white border-none px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                   {filteredProfiles.length} Total Registered
                </Badge>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                   {filteredProfiles.map((user) => (
                      <div 
                        key={user.uid}
                        onClick={() => setSelectedUser(user)}
                        className={cn(
                          "group p-6 flex flex-col md:flex-row md:items-center gap-6 cursor-pointer transition-all border-l-4",
                          selectedUser?.uid === user.uid ? "bg-indigo-50/30 border-indigo-500" : "hover:bg-slate-50 border-transparent"
                        )}
                      >
                         <div className="flex items-center gap-5 flex-1">
                            <Avatar className="h-14 w-14 rounded-2xl border-4 border-white shadow-xl group-hover:rotate-3 transition-transform">
                               <AvatarImage src={user.photoURL} alt={user.name} className="object-cover" />
                               <AvatarFallback className="font-black text-slate-400 bg-slate-100">{user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                               <div className="flex items-center gap-2 mb-0.5">
                                  <h4 className="font-black text-sm uppercase italic tracking-tight text-slate-900 truncate">
                                     {user.name}
                                  </h4>
                                  {user.isSuperAdmin && (
                                     <div className="p-1 bg-red-100 text-red-600 rounded-md">
                                        <ShieldAlert size={10} />
                                     </div>
                                  )}
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 truncate">{user.email}</p>
                            </div>
                         </div>

                         <div className="flex flex-wrap items-center gap-3">
                            <Badge className={cn(
                               "border-none px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full",
                               user.role === 'management' ? "bg-slate-900 text-white" : "bg-indigo-100 text-indigo-600"
                            )}>
                               {user.role}
                            </Badge>
                            <Badge className={cn(
                               "border-none px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full",
                               user.status === 'approved' ? "bg-emerald-500 text-white" : 
                               user.status === 'pending' ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                            )}>
                               {user.status}
                            </Badge>
                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                               <ChevronRight size={16} />
                            </div>
                         </div>
                      </div>
                   ))}

                   {filteredProfiles.length === 0 && (
                      <div className="py-20 text-center flex flex-col items-center gap-4">
                         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                            <Search size={32} />
                         </div>
                         <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No matching personnel identified.</p>
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
                <Card className="elite-card border-none shadow-3xl rounded-[40px] bg-slate-900 text-white overflow-hidden">
                   <div className="p-8 pb-4 text-center">
                      <Avatar className="h-24 w-24 rounded-[32px] border-8 border-white/5 mx-auto mb-6 shadow-2xl">
                         <AvatarImage src={selectedUser.photoURL} alt={selectedUser.name} className="object-cover" />
                         <AvatarFallback className="text-3xl font-black bg-white/10 text-white/40">{selectedUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-1">{selectedUser.name}</h3>
                      <p className="text-[10px] font-bold text-white/40 tracking-wider mb-6">{selectedUser.email}</p>
                      
                      <div className="flex items-center justify-center gap-3">
                         <Button 
                           onClick={() => handleToggleSuperAdmin(selectedUser.uid)}
                           className={cn(
                             "h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all gap-2",
                             selectedUser.isSuperAdmin ? "bg-red-500/10 text-red-500 hover:bg-red-500 text-white border border-red-500/50" : "bg-white/10 text-white hover:bg-white/20 border border-white/5"
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
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Clearance Level</Label>
                            <Select value={selectedUser.role} onValueChange={(val) => handleUpdateRole(selectedUser.uid, val as UserRole)}>
                               <SelectTrigger className="h-12 bg-white/5 border-none rounded-xl text-xs font-bold uppercase tracking-widest text-white">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-slate-800 border-none rounded-xl">
                                  <SelectItem value="player" className="text-white hover:bg-white/10">Athlete</SelectItem>
                                  <SelectItem value="management" className="text-white hover:bg-white/10">Staff/Mgmt</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Verification Status</Label>
                            <Select value={selectedUser.status} onValueChange={(val) => handleUpdateStatus(selectedUser.uid, val as UserStatus)}>
                               <SelectTrigger className="h-12 bg-white/5 border-none rounded-xl text-xs font-bold uppercase tracking-widest text-white">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent className="bg-slate-800 border-none rounded-xl">
                                  <SelectItem value="pending" className="text-white hover:bg-white/10">Pending</SelectItem>
                                  <SelectItem value="approved" className="text-white hover:bg-white/10">Approved</SelectItem>
                                  <SelectItem value="rejected" className="text-white hover:bg-white/10">Rejected</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                      </div>

                      <div className="space-y-6 pt-6 border-t border-white/5">
                         <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Operational Privileges</h4>
                            <Badge className="bg-indigo-500/20 text-indigo-400 border-none text-[8px] font-black italic">GRANULAR CONTROL</Badge>
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
                               <div key={perm.key} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer" onClick={() => handleTogglePermission(selectedUser.uid, perm.key as keyof UserPermissions)}>
                                  <div className="min-w-0 pr-4">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-white mb-0.5">{perm.label}</p>
                                     <p className="text-[8px] font-medium text-white/30 truncate">{perm.desc}</p>
                                  </div>
                                  <Switch 
                                    checked={selectedUser.permissions?.[perm.key as keyof UserPermissions] || false} 
                                    onCheckedChange={() => handleTogglePermission(selectedUser.uid, perm.key as keyof UserPermissions)}
                                    className="data-[state=checked]:bg-indigo-500"
                                  />
                               </div>
                            ))}
                         </div>
                      </div>
                   </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 bg-white rounded-[40px] border border-slate-100 shadow-2xl border-dashed">
                 <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
                    <UserIcon size={40} />
                 </div>
                 <h4 className="text-sm font-black uppercase italic tracking-tight text-slate-400">Terminal Idle</h4>
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Select personnel to modify clearance.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
