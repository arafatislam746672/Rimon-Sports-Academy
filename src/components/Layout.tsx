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
  ShieldAlert,
  Building2,
  Briefcase
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
import ScoreTicker from './ScoreTicker';
import { ThemeSelector } from './ThemeSelector';

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
  { name: 'Training', href: '/pipeline', icon: Workflow, permission: 'managePlayers' },
  { name: 'Results', href: '/scoring', icon: Trophy, permission: 'manageMatches' },
  { name: 'Tournaments', href: '/tournaments', icon: Trophy, permission: 'manageTournaments' },
  { name: 'Standings', href: '/standings', icon: BarChart3 },
  { name: 'Attendance', href: '/attendance', icon: ClipboardCheck, permission: 'managePlayers' },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Venues', href: '/venues', icon: Building2 },
  { name: 'Sponsors', href: '/sponsors', icon: Briefcase },
  { name: 'Approvals', href: '/approvals', icon: ClipboardCheck, permission: 'manageProfiles' },
  { name: 'Users', href: '/user-management', icon: ShieldAlert, superAdmin: true },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(window.innerWidth > 1024);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [authModalConfig, setAuthModalConfig] = React.useState<{ isOpen: boolean; role: UserRole }>({
    isOpen: false,
    role: UserRole.PLAYER
  });
  const location = useLocation();
  const { user, profile, loading, logout } = useAuth();
  const [availablePlayers, setAvailablePlayers] = React.useState<Player[]>([]);

  React.useEffect(() => {
    if (user && profile?.role === UserRole.PLAYER && !profile.playerId) {
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

      // Check if it is explicitly for Super Admin
      if (item.superAdmin) return false;

      // Management see their permitted items
      if (profile?.role === UserRole.MANAGEMENT) {
        if (permissions.fullControl) return true;
        if (item.permission && !(permissions as any)[item.permission]) return false;
        return true;
      }

      // Players see most items but not Approvals or superAdmin items
      if (profile?.role === UserRole.PLAYER) {
        // Approvals is strictly for management/admins
        if (item.permission === 'manageProfiles') return false;
        // Navigation items we want to HIDE from players? 
        // Maybe 'Pipeline' is too internal? Or 'Attendance' management?
        // User said "tournament, score bord soho sokol data dekhte parbe"
        return true;
      }

      return true;
    });
  }, [user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Handle restricted access for pending players
  const renderRestrictedBanner = () => {
    if (user && profile?.role === UserRole.PLAYER && profile?.status === 'pending') {
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
    <div id="app-layout-root" className="min-h-screen bg-background flex flex-col font-sans overflow-hidden relative">
      <ScoreTicker />
      <div id="layout-wrapper" className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Hidden on mobile, shown as drawer if needed or completely hidden in favor of bottom nav */}
      <aside 
        id="sidebar-nav"
        className={cn(
          "bg-[#030408] text-white transition-all duration-300 z-50 lg:flex flex-col py-8 shadow-[10px_0_40px_rgba(0,0,0,0.6)] hidden border-r border-white/5",
          isSidebarOpen ? "w-[280px]" : "w-24"
        )}
      >
        <div className={cn(
          "px-8 pb-10 flex items-center justify-between",
          !isSidebarOpen && "px-4 justify-center"
        )}>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <h1 className="text-3xl font-black tracking-tighter leading-none italic">
                <span className="text-primary italic">R</span>IMON
              </h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-accent" />
                 <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 whitespace-nowrap italic">Academy Portal</span>
              </div>
            </motion.div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white/20 hover:text-primary hover:bg-primary/5 rounded-full transition-all"
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>

        <nav className="mt-10 flex-1 overflow-y-auto no-scrollbar px-5 space-y-2">
          {currentNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-5 py-4 transition-all group relative rounded-[28px] overflow-hidden",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 font-black italic scale-[1.02]" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "shrink-0 transition-transform duration-500",
                  isActive ? "scale-110" : "group-hover:rotate-12 group-hover:scale-110"
                )}>
                  <item.icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-[1.5]"} />
                </div>
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="ml-4 text-xs font-bold uppercase tracking-widest"
                  >
                    {item.name}
                  </motion.span>
                )}
                {isActive && (
                   <motion.div 
                     layoutId="active-pill"
                     className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" 
                   />
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-6 px-4 py-2 bg-[#0a0c10] border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap pointer-events-none z-50 shadow-2xl shadow-black">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 mt-auto space-y-6 pb-6">
          {user ? (
            <div className="py-8 border-t border-white/5">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full text-left outline-none">
                  {isSidebarOpen ? (
                    <div className="flex items-center gap-4 p-4 rounded-[32px] transition-all hover:bg-white/5 group bg-white/5 border border-white/5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0 border border-primary/30 overflow-hidden ring-4 ring-transparent group-hover:ring-primary/20 transition-all">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary font-black text-lg">{user.displayName?.[0] || 'U'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-primary leading-none mb-2 italic">
                          {profile?.role || 'User'}
                        </p>
                        <p className="text-xs font-black truncate text-white uppercase italic">
                          {user.displayName || 'Member'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-[10px] font-bold m-auto hover:bg-primary/30 transition-all border border-primary/30 overflow-hidden shadow-2xl">
                       {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary font-black text-xl">{user.displayName?.[0] || 'U'}</span>
                        )}
                    </div>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side={isSidebarOpen ? "top" : "right"} className="w-72 bg-[#090b10] border-white/10 rounded-[40px] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] mb-4 ml-6 animate-in slide-in-from-bottom-5 duration-500 text-foreground backdrop-blur-3xl">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-5 py-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Online</span>
                        </div>
                        <span className="text-base font-black text-foreground truncate leading-none uppercase italic tracking-tighter">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-white/5 mx-2" />
                  <DropdownMenuGroup className="py-2 space-y-1">
                    <DropdownMenuItem 
                      className="flex items-center gap-4 px-5 py-4 rounded-[24px] cursor-pointer hover:bg-white/5 focus:bg-white/5 border border-transparent transition-all group"
                      render={<Link to="/settings" className="flex items-center gap-4 w-full" />}
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/30 transition-all transform group-hover:rotate-6">
                        <User size={18} className="text-muted-foreground group-hover:text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground italic">My Account</span>
                        <span className="text-[8px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">Profile Settings</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-white/5 mx-2" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      onClick={logout}
                      className="flex items-center gap-4 px-5 py-4 rounded-[24px] cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 text-red-500 transition-all group mt-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/30 transition-all transform group-hover:-rotate-6">
                        <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black uppercase tracking-widest text-red-500 italic">Logout</span>
                         <span className="text-[8px] text-red-500/60 font-bold mt-1 uppercase tracking-widest">Exit Application</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
                  <div className="py-10 border-t border-white/5 px-2">
                {isSidebarOpen ? (
                  <div className="space-y-4">
                    <p className="px-6 text-[8px] font-black uppercase tracking-[0.5em] text-white/20 text-center mb-6 italic">Login Required</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="relative w-full group outline-none">
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-[28px] blur opacity-20 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
                          <div className="relative w-full bg-card border border-white/10 text-white h-16 font-black uppercase tracking-[0.25em] text-[10px] rounded-[24px] flex items-center justify-center gap-4 overflow-hidden shadow-2xl active:scale-95 transition-all italic">
                              <ShieldCheck size={20} className="text-primary group-hover:rotate-12 transition-transform duration-500" /> 
                              <span>Login</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" side="top" className="w-[280px] bg-[#090b10] border-white/10 rounded-[48px] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] mb-6 animate-in slide-in-from-bottom-10 duration-700 text-foreground backdrop-blur-3xl">
                        <DropdownMenuGroup className="space-y-2">
                          <DropdownMenuLabel className="text-[8px] font-black uppercase tracking-[0.4em] text-primary px-6 py-6 text-center italic">Choose Role</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => openAuth(UserRole.PLAYER)}
                            className="flex items-center gap-5 px-6 py-5 rounded-[32px] cursor-pointer hover:bg-primary/10 focus:bg-primary/10 border border-transparent transition-all group"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:scale-110 shadow-inner">
                               <User size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black uppercase tracking-widest leading-none italic group-hover:text-primary transition-colors">Players</span>
                              <span className="text-[8px] text-muted-foreground font-black mt-2 uppercase tracking-tight">Player Portal</span>
                            </div>
                          </DropdownMenuItem>
                          <div className="h-px bg-white/5 mx-6" />
                          <DropdownMenuItem 
                            onClick={() => openAuth(UserRole.MANAGEMENT)}
                            className="flex items-center gap-5 px-6 py-5 rounded-[32px] cursor-pointer hover:bg-accent/10 focus:bg-accent/10 border border-transparent transition-all group"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-accent/20 transition-all group-hover:scale-110 shadow-inner">
                              <ShieldCheck size={22} className="text-muted-foreground group-hover:text-accent transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-black uppercase tracking-widest leading-none italic group-hover:text-accent transition-colors">Staff Portal</span>
                              <span className="text-[8px] text-muted-foreground font-black mt-2 uppercase tracking-tight">Management Hub</span>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <button onClick={() => openAuth(UserRole.PLAYER)} className="w-16 h-16 relative group outline-none m-auto transition-transform hover:scale-105 active:scale-90">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-30 group-hover:opacity-60 transition-all duration-500"></div>
                    <div className="relative w-16 h-16 bg-card border border-white/10 text-primary rounded-2xl flex items-center justify-center shadow-2xl">
                      <LogIn size={24} />
                    </div>
                  </button>
                )}
             </div>
          )}
        </div>

      </aside>

      {/* Main Content */}
      <main 
        id="main-viewport"
        className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col"
        style={{ scrollbarGutter: 'stable' }}
      >
        {/* Top Header Blur Effect */}
        <div className="sticky top-0 left-0 right-0 h-20 bg-background/60 backdrop-blur-3xl z-30 border-b border-white/5 flex items-center px-6 lg:px-12">
          <div className="flex-1 flex items-center gap-4 lg:hidden">
             <h1 className="text-2xl font-black tracking-tighter leading-none italic text-primary">
                RIMON
             </h1>
          </div>
          <div className="flex-1 hidden lg:block">
             <div className="flex items-center gap-6 opacity-30">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <div className="w-40 h-[1px] bg-gradient-to-r from-white to-transparent" />
             </div>
          </div>
          <div className="flex items-center gap-8">
             <ThemeSelector className="hidden md:flex" />
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em] leading-none mb-1.5 italic">Live Feed</span>
                <span className="flex items-center gap-2 text-[10px] font-black text-primary uppercase italic tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_hsl(var(--primary))]" /> 
                  Match Score
                </span>
             </div>
             {user && (
               <div className="lg:hidden">
                 <DropdownMenu>
                  <DropdownMenuTrigger nativeButton={true} render={<button className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black text-white cursor-pointer shadow-lg overflow-hidden border border-indigo-200" />}>
                     {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : user.displayName?.[0]}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-card border-border text-foreground">
                       <DropdownMenuItem render={<Link to="/settings" className="w-full">Settings</Link>} className="rounded-xl py-3 focus:bg-muted" />
                       <DropdownMenuSeparator className="bg-border" />
                       <DropdownMenuItem onClick={logout} className="rounded-xl py-3 text-red-500 font-bold focus:bg-red-500/10">Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
               </div>
             )}
          </div>
        </div>

        <div className="p-4 lg:p-10 pb-32 lg:pb-20 w-full max-w-[1600px] mx-auto bg-background/50">
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
    </div>

      {/* Mobile Bottom Navigation */}
      <div id="mobile-nav-root" className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-lg border-t border-border flex items-center justify-around px-2 py-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] text-card-foreground">
        {currentNavItems.slice(0, 4).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link 
              key={item.href} 
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 px-3 py-1 transition-all rounded-xl",
                isActive ? "text-indigo-600 scale-110" : "text-muted-foreground"
              )}
            >
              <item.icon size={22} className={cn(isActive && "fill-indigo-600/10")} />
              <span className="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
            </Link>
          );
        })}
        
        <DropdownMenu>
          <DropdownMenuTrigger nativeButton={true} render={<button className="flex flex-col items-center gap-1.5 px-3 py-1 text-muted-foreground" />}>
             <Menu size={22} />
             <span className="text-[9px] font-black uppercase tracking-widest">More</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-[85vw] mx-auto mb-6 bg-card border-none shadow-2xl rounded-[32px] p-4 flex flex-wrap gap-2 text-card-foreground">
            <div className="w-full px-2 mb-2">
              <ThemeSelector className="w-full h-16" />
            </div>
            {currentNavItems.slice(4).map((item) => (
              <DropdownMenuItem 
                key={item.href} 
                render={<Link to={item.href} className="w-full flex items-center gap-3" />}
                className="w-full py-4 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-muted focus:bg-muted"
              >
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground">
                  <item.icon size={16} />
                </div>
                {item.name}
              </DropdownMenuItem>
            ))}
            {!user && (
              <>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => openAuth(UserRole.PLAYER)} className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary text-primary-foreground mt-2 shadow-lg shadow-black/20">Athlete Login</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openAuth(UserRole.MANAGEMENT)} className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-border mt-2 bg-muted text-foreground">Staff Login</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AuthModal 
        isOpen={authModalConfig.isOpen}
        onClose={() => setAuthModalConfig(prev => ({ ...prev, isOpen: false }))}
        initialRole={authModalConfig.role}
      />
    </div>
  );
}
