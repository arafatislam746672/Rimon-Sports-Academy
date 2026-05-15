import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Flag,
  Calendar, 
  ClipboardCheck, 
  Settings, 
  Menu, 
  X,
  LogOut,
  ChevronRight,
  LogIn,
  User,
  ShieldCheck,
  Workflow,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/services/dataService';
import { Player, UserRole, UserPermissions } from '@/types';
import { toast } from 'sonner';
import AuthModal from './AuthModal';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  role?: UserRole;
  permission?: keyof UserPermissions;
  superAdmin?: boolean;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Players', href: '/players', icon: Users, permission: 'managePlayers' },
  { name: 'Teams', href: '/teams', icon: Flag, permission: 'manageTeams' },
  { name: 'Pipeline', href: '/pipeline', icon: Workflow, permission: 'managePlayers' },
  { name: 'Scoring', href: '/scoring', icon: Trophy, permission: 'manageMatches' },
  { name: 'Tournaments', href: '/tournaments', icon: Trophy, permission: 'manageTournaments' },
  { name: 'Standings', href: '/standings', icon: BarChart3 },
  { name: 'Attendance', href: '/attendance', icon: ClipboardCheck, permission: 'managePlayers' },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Approvals', href: '/approvals', icon: ClipboardCheck, permission: 'manageProfiles' },
  { name: 'Users', href: '/user-management', icon: ShieldAlert, superAdmin: true },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [authModalConfig, setAuthModalConfig] = React.useState<{ isOpen: boolean; role: UserRole }>({
    isOpen: false,
    role: 'player'
  });
  const location = useLocation();
  const { user, profile, loading, logout } = useAuth();
  const [availablePlayers, setAvailablePlayers] = React.useState<Player[]>([]);

  React.useEffect(() => {
    if (user && profile?.role === 'player' && !profile.playerId) {
      dataService.getPlayers(setAvailablePlayers);
    }
  }, [user, profile]);

  const handleLinkPlayer = async (playerId: string) => {
    if (!profile) return;
    try {
      await dataService.updatePlayerProfile(profile.uid, { ...profile, playerId });
      toast.success("Account successfully linked to academy profile!");
      window.location.reload(); // Refresh to update profile in context
    } catch (error) {
           toast.error("Linking failed.");
    }
  };

  const openAuth = (role: UserRole) => {
    setAuthModalConfig({ isOpen: true, role });
  };

  const currentNavItems = React.useMemo(() => {
    if (!user) return navItems.filter(item => item.href === '/');
    
    const isSuperAdmin = profile?.isSuperAdmin || profile?.email === 'malihajahanshamme@gmail.com' || profile?.email === 'arafathislam279@gmail.com';
    const permissions = profile?.permissions || {};

    return navItems.filter(item => {
      // Super Admin sees everything
      if (isSuperAdmin) return true;

      // Check if it's explicitly for Super Admin
      if (item.superAdmin) return false;

      // Staff with Full Control see everything except superAdmin specific items
      if (profile?.role === 'management' && permissions.fullControl) return true;

      // Check specific permissions
      if (item.permission && !(permissions as any)[item.permission]) return false;

      // Fallback to role-based check if no specific permission defined
      if (item.role && profile?.role !== item.role) return false;

      return true;
    });
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy"></div>
      </div>
    );
  }

  // Handle restricted access for pending players
  const renderRestrictedBanner = () => {
    if (user && profile?.role === 'player' && profile?.status === 'pending') {
      return (
        <div className="bg-amber-500 text-primary p-4 rounded-xl mb-8 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <ClipboardCheck size={20} />
             </div>
             <div>
                <p className="text-xs font-black uppercase tracking-wide">Account Pending Approval</p>
                <p className="text-xs font-bold opacity-80 italic">An administrator is reviewing your athlete record. You have limited access to scoring and feed.</p>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-slate-900 text-white h-screen sticky top-0 transition-all duration-300 z-50 flex flex-col py-8 shadow-2xl",
          isSidebarOpen ? "w-[260px]" : "w-20"
        )}
      >
        <div className={cn(
          "px-6 pb-8 border-b border-white/5 flex items-center justify-between",
          !isSidebarOpen && "px-4 justify-center"
        )}>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-xl font-black tracking-tight leading-none">
                RIMON<span className="text-indigo-400">.</span>
              </h1>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Sports Academy</span>
            </motion.div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <nav className="mt-8 flex-1 overflow-y-auto no-scrollbar px-3 space-y-1">
          {currentNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3.5 transition-all group relative rounded-2xl",
                  isActive 
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-bold" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "shrink-0 transition-transform duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )}>
                  <item.icon size={20} />
                </div>
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-4 text-sm font-medium tracking-wide"
                  >
                    {item.name}
                  </motion.span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mt-auto">
          {user ? (
            <div className="py-6 border-t border-white/5">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full text-left outline-none">
                  {isSidebarOpen ? (
                    <div className="flex items-center gap-3 p-2.5 rounded-2xl transition-all hover:bg-white/5 group">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-xs font-bold shrink-0 border border-indigo-500/30 overflow-hidden ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-indigo-400 font-black">{user.displayName?.[0] || 'U'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60 leading-none mb-1">
                          {profile?.role || 'User'}
                        </p>
                        <p className="text-xs font-black truncate text-white">
                          {user.displayName || 'User'}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-white/20 group-data-[state=open]:rotate-90 transition-transform" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold m-auto hover:bg-indigo-500/30 transition-all border border-indigo-500/30 overflow-hidden">
                       {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-indigo-400 font-black">{user.displayName?.[0] || 'U'}</span>
                        )}
                    </div>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side={isSidebarOpen ? "top" : "right"} className="w-64 bg-white border-slate-200 rounded-3xl p-2 shadow-2xl mb-4 ml-2 animate-in slide-in-from-bottom-2 duration-300">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Account Verified</span>
                        <span className="text-sm font-bold text-slate-900 truncate leading-tight">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuGroup className="py-2">
                    <DropdownMenuItem 
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer hover:bg-slate-50 focus:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                      render={<Link to="/settings" className="flex items-center gap-3 w-full" />}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <User size={16} className="text-slate-500 group-hover:text-indigo-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Account Profile</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 transition-all group mt-1"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-100/50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">End Session</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
             <div className="py-6 border-t border-white/5">
               {isSidebarOpen ? (
                   <DropdownMenu>
                    <DropdownMenuTrigger className="w-full bg-indigo-500 text-white h-14 font-black uppercase tracking-widest text-[11px] rounded-2xl flex items-center justify-center gap-3 group hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                        <ShieldCheck size={18} /> Portal Access
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-[200px] bg-white border-slate-200 rounded-3xl p-2 shadow-2xl mb-4 ml-2 animate-in slide-in-from-bottom-2 duration-300">
                       <DropdownMenuGroup className="space-y-1">
                         <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-4 py-3">Digital ID Login</DropdownMenuLabel>
                         <DropdownMenuSeparator className="bg-slate-100" />
                         <DropdownMenuItem 
                           onClick={() => openAuth('player')}
                           className="flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer hover:bg-slate-50 focus:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                         >
                           <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                              <User size={16} className="text-slate-500 group-hover:text-indigo-500" />
                           </div>
                           <span className="text-xs font-bold uppercase tracking-wider">Athletes</span>
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => openAuth('management')}
                           className="flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer hover:bg-slate-50 focus:bg-slate-50 border border-transparent hover:border-slate-100 transition-all group"
                         >
                           <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                            <ShieldCheck size={16} className="text-slate-500 group-hover:text-indigo-500" />
                           </div>
                           <span className="text-xs font-bold uppercase tracking-wider">Management</span>
                         </DropdownMenuItem>
                       </DropdownMenuGroup>
                    </DropdownMenuContent>
                 </DropdownMenu>
               ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center m-auto shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-colors active:scale-90">
                    <LogIn size={20} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" className="bg-white border-slate-200 rounded-2xl shadow-xl mb-4 ml-4">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => openAuth('player')}>Athlete Login</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openAuth('management')}>Staff Login</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
               )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className="flex-1 h-screen overflow-y-auto no-scrollbar relative flex flex-col"
        style={{ scrollbarGutter: 'stable' }}
      >
        {/* Top Header Blur Effect */}
        <div className="sticky top-0 left-0 right-0 h-16 bg-slate-50/80 backdrop-blur-md z-30 border-b border-slate-200 flex items-center px-10">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Status</span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live System
                </span>
             </div>
          </div>
        </div>

        <div className="p-10 pb-20 w-full max-w-[1600px] mx-auto">
          {renderRestrictedBanner()}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ 
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AuthModal 
        isOpen={authModalConfig.isOpen}
        onClose={() => setAuthModalConfig(prev => ({ ...prev, isOpen: false }))}
        initialRole={authModalConfig.role}
      />
    </div>
  );
}
