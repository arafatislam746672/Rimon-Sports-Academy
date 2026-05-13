import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
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
  Workflow
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
import { Player, UserRole } from '@/types';
import { toast } from 'sonner';
import AuthModal from './AuthModal';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Players', href: '/players', icon: Users },
  { name: 'Pipeline', href: '/pipeline', icon: Workflow },
  { name: 'Scoring', href: '/scoring', icon: Trophy },
  { name: 'Tournaments', href: '/tournaments', icon: Trophy },
  { name: 'Attendance', href: '/attendance', icon: ClipboardCheck },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Approvals', href: '/approvals', icon: ClipboardCheck, role: 'management' },
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
    return navItems.filter(item => !item.role || profile?.role === item.role);
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
    <div className="min-h-screen bg-secondary flex font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-primary text-secondary h-screen sticky top-0 transition-all duration-300 z-50 flex flex-col py-[30px]",
          isSidebarOpen ? "w-[240px]" : "w-20"
        )}
      >
        <div className={cn(
          "px-[30px] pb-[40px] border-b border-secondary/10 flex items-center justify-between",
          !isSidebarOpen && "px-6"
        )}>
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-extrabold tracking-widest uppercase"
            >
              RIMON <span className="text-accent">SPORTS</span>
            </motion.h1>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-secondary hover:bg-secondary/10"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <nav className="mt-[30px] flex-1 overflow-y-auto no-scrollbar">
          {currentNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-[30px] py-[15px] transition-all group relative text-sm",
                  isActive 
                    ? "bg-secondary/10 opacity-100 border-r-4 border-accent font-bold" 
                    : "opacity-80 hover:opacity-100 hover:bg-secondary/10"
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="ml-3"
                  >
                    {item.name}
                  </motion.span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-primary text-secondary text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-[30px] mt-auto">
          {user ? (
            <div className="py-4 border-t border-secondary/10 mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full text-left outline-none group">
                  {isSidebarOpen ? (
                    <div className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-secondary/10">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-bold shrink-0">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          user.displayName?.[0] || 'U'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary/40 leading-none mb-1">
                          {profile?.role || 'User'}
                        </p>
                        <p className="text-xs font-black truncate text-secondary">
                          {user.displayName || 'User'}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-secondary/40 group-data-[state=open]:rotate-90 transition-transform" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-[10px] font-bold m-auto hover:bg-secondary/30 transition-colors">
                       {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          user.displayName?.[0] || 'U'
                        )}
                    </div>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side={isSidebarOpen ? "top" : "right"} className="w-56 bg-white border-border-custom rounded-2xl p-1 shadow-2xl mb-2">
                  <DropdownMenuLabel className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-light/40">Account Settings</span>
                      <span className="text-xs font-bold text-primary truncate">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-secondary/10" />
                  <DropdownMenuGroup>
                    <Link to="/settings">
                      <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-secondary focus:bg-secondary transition-colors group">
                        <Settings size={14} className="text-primary group-hover:text-accent" />
                        <span className="text-[10px] font-black uppercase">Preferences</span>
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-secondary/10" />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600 transition-colors group"
                  >
                    <LogOut size={14} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase">Logout Session</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
             <div className="py-4 border-t border-secondary/10 mb-4">
               {isSidebarOpen ? (
                   <DropdownMenu>
                    <DropdownMenuTrigger className="w-full bg-accent text-primary h-12 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 group hover:scale-[1.02] transition-transform">
                        <ShieldCheck size={16} /> Portal Login
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-[180px] bg-white border-border-custom rounded-xl p-1 shadow-2xl mb-2">
                       <DropdownMenuGroup>
                         <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-text-light/40 px-3 py-2">Select Portal</DropdownMenuLabel>
                         <DropdownMenuSeparator className="bg-secondary/10" />
                         <DropdownMenuItem 
                           onClick={() => openAuth('player')}
                           className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-secondary focus:bg-secondary transition-colors group"
                         >
                           <User size={14} className="text-primary group-hover:text-accent" />
                           <span className="text-[10px] font-black uppercase">Athlete Portal</span>
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => openAuth('management')}
                           className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-secondary focus:bg-secondary transition-colors group"
                         >
                           <ShieldCheck size={14} className="text-primary group-hover:text-accent" />
                           <span className="text-[10px] font-black uppercase">Staff Portal</span>
                         </DropdownMenuItem>
                       </DropdownMenuGroup>
                    </DropdownMenuContent>
                 </DropdownMenu>
               ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-10 h-10 bg-accent text-primary rounded-xl flex items-center justify-center m-auto">
                    <LogIn size={18} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" className="bg-white border-border-custom shadow-xl mb-4 ml-4">
                    <DropdownMenuItem onClick={() => openAuth('player')}>Player</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openAuth('management')}>Staff</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
               )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-[30px]">
        <div className="max-w-7xl mx-auto">
          {renderRestrictedBanner()}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
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
