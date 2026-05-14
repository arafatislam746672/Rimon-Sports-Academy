import * as React from 'react';
import { auth, storage } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { 
  User, 
  Settings as SettingsIcon, 
  Mail, 
  Bell, 
  Lock, 
  Shield, 
  Globe, 
  Smartphone, 
  Camera,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Phone,
  Calendar as CalendarIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Plus,
  MoreHorizontal,
  LogOut,
  ExternalLink,
  Copy,
  KeyRound
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { dataService } from '@/services/dataService';
import { UserProfile } from '@/types';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Settings() {
  const { user, profile, logout } = useAuth();
  const [isSaving, setIsSaving] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<UserProfile>>({});

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setIsSaving(true);
    try {
      await dataService.createUserProfile({ ...profile, ...formData } as UserProfile);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Settings Profile Banner */}
      <div className="relative group">
        <div className="h-64 sm:h-72 w-full bg-navy rounded-[40px] overflow-hidden relative shadow-2xl shadow-navy/20">
          <div className="absolute inset-0 bg-gradient-to-tr from-navy via-navy/90 to-primary/40" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="absolute top-6 sm:top-8 right-6 sm:right-10 flex flex-wrap items-center justify-end gap-3 sm:gap-4">
             <div className="hidden xs:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
               <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent animate-pulse" />
               <span className="text-[9px] sm:text-[10px] font-black text-accent uppercase tracking-widest">Active Profile</span>
             </div>

             <DropdownMenu>
                <DropdownMenuTrigger className="bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 h-12 w-12 rounded-2xl shadow-xl flex items-center justify-center outline-none ring-offset-primary focus-visible:ring-2 focus-visible:ring-accent transition-all">
                  <MoreHorizontal size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-border-custom rounded-2xl p-2 shadow-2xl">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="text-[10px] font-black uppercase text-text-light/40 tracking-widest p-3 pb-2">Account Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-secondary mb-1" />
                    <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-secondary focus:bg-secondary transition-colors group">
                      <ExternalLink size={16} className="text-primary group-hover:text-accent" />
                      <span className="text-xs font-bold text-primary">Public Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-secondary focus:bg-secondary transition-colors group"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin + `/players/${profile?.playerId}`);
                        toast.success("Profile link copied!");
                      }}
                    >
                      <Copy size={16} className="text-primary group-hover:text-accent" />
                      <span className="text-xs font-bold text-primary">Copy Profile URL</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-secondary focus:bg-secondary transition-colors group"
                      onClick={async () => {
                         if (user?.email) {
                           try {
                             await sendPasswordResetEmail(auth, user.email);
                             toast.success("Password reset email sent!");
                           } catch (e) {
                              toast.error("Failed to send reset email.");
                         }
                       }
                      }}
                    >
                      <KeyRound size={16} className="text-primary group-hover:text-accent" />
                      <span className="text-xs font-bold text-primary">Reset Password</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-secondary my-1" />
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-500 transition-colors group"
                      onClick={async () => {
                        await logout();
                        window.location.href = '/';
                      }}
                    >
                      <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                      <span className="text-xs font-black uppercase">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
             </DropdownMenu>

             <Button 
               onClick={handleSave}
               disabled={isSaving}
               className="bg-accent text-primary font-black uppercase text-xs tracking-widest h-12 px-8 rounded-2xl shadow-xl shadow-accent/20 hover:bg-accent/90 transition-all border-none"
             >
               {isSaving ? 'Saving...' : 'Sync Data'}
             </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-10 sm:gap-14 px-6 sm:px-16 -mt-12 sm:-mt-14 relative z-10 w-full">
          <div className="relative shrink-0">
            <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-[40px] sm:rounded-[56px] border-[8px] border-secondary bg-white shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
               {profile?.photoURL ? (
                 <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                    <User size={64} strokeWidth={1.5} />
                 </div>
               )}
            </div>
            <button 
              className="absolute -bottom-2 -right-2 p-3.5 bg-primary text-secondary rounded-2xl border-4 border-secondary shadow-lg hover:scale-110 active:scale-95 transition-all outline-none z-20"
              onClick={() => document.getElementById('avatar_upload')?.click()}
            >
              <Camera size={22} />
            </button>
            <input 
              id="avatar_upload"
              type="file" 
              className="hidden" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && user) {
                  const path = `avatars/${user.uid}_${Date.now()}_${file.name}`;
                  toast.promise(dataService.uploadFile(file, path), {
                    loading: 'Updating photo...',
                    success: (url) => {
                      handleInputChange('photoURL', url);
                      return 'Photo updated!';
                    },
                    error: 'Update failed.'
                  });
                }
              }}
            />
          </div>
          
          <div className="pb-4 space-y-4 text-center sm:text-left flex-1 min-w-0 sm:ml-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4">
              <h1 className="text-3xl sm:text-5xl font-black text-primary tracking-tighter drop-shadow-sm truncate">
                {profile?.name || 'Anonymous Athlete'}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <div className="p-1 px-3 bg-blue-500/10 rounded-lg border border-blue-500/20 shrink-0">
                  <CheckCircle2 size={18} className="sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <Badge variant="outline" className="sm:hidden text-[9px] font-black px-3 py-1 bg-white/50">{profile?.role === 'management' ? 'ADMIN' : 'PLAYER'}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-text-light font-black text-[10px] sm:text-xs uppercase tracking-widest">
               <div className="hidden sm:flex items-center gap-2.5 bg-white px-4 py-2 rounded-2xl border border-border-custom shadow-sm">
                 <Trophy size={14} className="text-accent" />
                 <span>{profile?.role === 'management' ? 'ADMIN' : 'PLAYER'}</span>
               </div>
               <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm sm:bg-transparent px-3 py-1.5 rounded-xl sm:p-0">
                 <MapPin size={14} className="text-primary/40" />
                 <span className="truncate max-w-[120px] sm:max-w-none">{formData.city || 'LOCATION'}</span>
               </div>
               <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm sm:bg-transparent px-3 py-1.5 rounded-xl sm:p-0">
                 <Mail size={14} className="text-primary/40" />
                 <span className="truncate max-w-[180px] sm:max-w-none">{user?.email}</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-12">
        <Tabs defaultValue="account" className="w-full flex flex-col lg:flex-row-reverse gap-8 items-start">
          {/* Sub Navigation Sidebar */}
          <TabsList className="flex flex-row lg:flex-col w-full lg:w-72 h-auto bg-white border border-border-custom p-3 rounded-[32px] lg:sticky lg:top-8 shrink-0 overflow-x-auto lg:overflow-visible shadow-sm no-scrollbar">
             <div className="hidden lg:block px-4 py-3 mb-2">
                <h3 className="text-[10px] font-black uppercase text-primary/40 tracking-[2px]">General Settings</h3>
             </div>
             
             <TabsTrigger value="account" className="flex-1 lg:flex-none justify-center lg:justify-start gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-wider min-w-max lg:w-full rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-accent data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 whitespace-nowrap">
               <User size={18} />
               <span className="hidden lg:inline">Account Info</span>
             </TabsTrigger>

             <TabsTrigger value="sports" className="flex-1 lg:flex-none justify-center lg:justify-start gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-wider min-w-max lg:w-full rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-accent data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 whitespace-nowrap">
               <Trophy size={18} />
               <span className="hidden lg:inline">Sports Settings</span>
             </TabsTrigger>

             <div className="hidden lg:block px-4 py-3 my-2">
                <Separator className="bg-border-custom/50 mb-4" />
                <h3 className="text-[10px] font-black uppercase text-primary/40 tracking-[2px]">Interactions</h3>
             </div>

             <TabsTrigger value="email" className="flex-1 lg:flex-none justify-center lg:justify-start gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-wider min-w-max lg:w-full rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-accent data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 whitespace-nowrap">
               <Mail size={18} />
               <span className="hidden lg:inline">Email Templates</span>
             </TabsTrigger>

             <div className="hidden lg:block px-4 py-3 my-2">
                <Separator className="bg-border-custom/50 mb-4" />
                <h3 className="text-[10px] font-black uppercase text-primary/40 tracking-[2px]">Protection</h3>
             </div>

             <TabsTrigger value="preferences" className="flex-1 lg:flex-none justify-center lg:justify-start gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-wider min-w-max lg:w-full rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-accent data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 whitespace-nowrap">
               <Bell size={18} />
               <span className="hidden lg:inline">Preferences</span>
             </TabsTrigger>

             <TabsTrigger value="privacy" className="flex-1 lg:flex-none justify-center lg:justify-start gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-wider min-w-max lg:w-full rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-accent data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 whitespace-nowrap">
               <Shield size={18} />
               <span className="hidden lg:inline">Security & Privacy</span>
             </TabsTrigger>
          </TabsList>

          {/* Settings Content Area */}
          <div className="flex-1 max-w-4xl space-y-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-3xl font-black text-primary tracking-tight">Account Settings</h2>
                <p className="text-sm font-bold text-text-light uppercase tracking-wider">Manage your academy profile and preferences</p>
              </div>
              
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-2xl border border-accent/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Profile Sync Live</span>
              </div>
            </div>
            
            <TabsContent value="account" className="space-y-8 mt-0 animate-in fade-in-50 duration-500">
              {/* Personal Information */}
              <section className="bg-white border border-border-custom rounded-3xl p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-primary">Personal Information</h3>
                  <Badge variant="outline" className="border-border-custom text-[10px] font-black px-2 py-0.5">PUBLIC</Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Salutation</Label>
                    <Select value={formData.salutation} onValueChange={(v) => handleInputChange('salutation', v)}>
                      <SelectTrigger className="rounded-xl border-border-custom focus:ring-primary h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mr">Mr.</SelectItem>
                        <SelectItem value="Ms">Ms.</SelectItem>
                        <SelectItem value="Dr">Dr.</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">First Name <span className="text-red-500">*</span></Label>
                    <Input 
                      value={formData.firstName || formData.name?.split(' ')[0] || ''} 
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Middle Name</Label>
                    <Input 
                      value={formData.middleName || ''} 
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Last Name <span className="text-red-500">*</span></Label>
                    <Input 
                      value={formData.lastName || formData.name?.split(' ').slice(1).join(' ') || ''} 
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Father's Name</Label>
                    <Input 
                      value={formData.fatherName || ''} 
                      onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-11" 
                      placeholder="Father's Full Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Mother's Name</Label>
                    <Input 
                      value={formData.motherName || ''} 
                      onChange={(e) => handleInputChange('motherName', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-11" 
                      placeholder="Mother's Full Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Short Bio</Label>
                    <Textarea 
                      value={formData.shortBio || ''} 
                      onChange={(e) => handleInputChange('shortBio', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-24 resize-none" 
                      placeholder="Write a brief intro..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Long Description</Label>
                    <Textarea 
                      value={formData.longDescription || ''} 
                      onChange={(e) => handleInputChange('longDescription', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-24 resize-none" 
                      placeholder="Detailed career summary..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Date of Birth <span className="text-red-500">*</span></Label>
                    <Input 
                       type="date" 
                       value={formData.dateOfBirth?.split('T')[0] || ''} 
                       onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                       className="rounded-xl border-border-custom focus:ring-primary h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Gender <span className="text-red-500">*</span></Label>
                    <RadioGroup 
                      value={formData.gender} 
                      onValueChange={(v) => handleInputChange('gender', v)}
                      className="flex gap-4 h-11 items-center"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="text-xs font-bold">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="text-xs font-bold">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Blood Group</Label>
                    <Select value={formData.bloodGroup} onValueChange={(v) => handleInputChange('bloodGroup', v)}>
                      <SelectTrigger className="rounded-xl border-border-custom focus:ring-primary h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Religion</Label>
                    <Input 
                      value={formData.religion || ''} 
                      onChange={(e) => handleInputChange('religion', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Nationality <span className="text-red-500">*</span></Label>
                    <Select value={formData.nationality} onValueChange={(v) => handleInputChange('nationality', v)}>
                      <SelectTrigger className="rounded-xl border-border-custom focus:ring-primary h-11">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Language <span className="text-red-500">*</span></Label>
                    <Input 
                      value={formData.language || ''} 
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-11" 
                      placeholder="e.g. English, Bengali"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Occupation</Label>
                    <Input 
                      value={formData.occupation || ''} 
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-11" 
                      placeholder="What do you do?"
                    />
                  </div>
                </div>
              </section>

              {/* Social Links */}
              <section className="bg-white border border-border-custom rounded-3xl p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-primary">Social Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Instagram URL OR User Name</Label>
                    <div className="relative">
                      <Instagram size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" />
                      <Input 
                        placeholder="https://instagram.com/ or Username" 
                        value={formData.instagram || ''} 
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                        className="pl-10 rounded-xl border-border-custom focus:ring-primary h-11 transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Facebook URL OR User Name</Label>
                    <div className="relative">
                      <Facebook size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" />
                      <Input 
                        placeholder="https://facebook.com/ or Username" 
                        value={formData.facebook || ''} 
                        onChange={(e) => handleInputChange('facebook', e.target.value)}
                        className="pl-10 rounded-xl border-border-custom focus:ring-primary h-11" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">X URL OR User Name</Label>
                    <div className="relative">
                      <Twitter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" />
                      <Input 
                        placeholder="https://x.com/ or Username" 
                        value={formData.twitter || ''} 
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                        className="pl-10 rounded-xl border-border-custom focus:ring-primary h-11" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">LinkedIn URL OR User Name</Label>
                    <div className="relative">
                      <Linkedin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" />
                      <Input 
                        placeholder="https://in.linkedin.com/ or Username" 
                        value={formData.linkedin || ''} 
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        className="pl-10 rounded-xl border-border-custom focus:ring-primary h-11" 
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-white border border-border-custom rounded-3xl p-8 shadow-sm space-y-8">
                <h3 className="text-lg font-black text-primary">Contact Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Email Address <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" />
                      <Input 
                        disabled 
                        value={formData.email || ''} 
                        className="pl-10 rounded-xl border-border-custom bg-secondary/30 h-11 font-bold" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Phone/Mobile Number <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" />
                      <Input 
                        placeholder="+880 1XXX-XXXXXX" 
                        value={formData.phone || ''} 
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="pl-10 rounded-xl border-border-custom focus:ring-primary h-11" 
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Current Address */}
              <section className="bg-white border border-border-custom rounded-3xl p-8 shadow-sm space-y-8">
                <h3 className="text-lg font-black text-primary">Current Address</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Start typing your address</Label>
                    <div className="relative">
                       <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" />
                       <Input 
                         placeholder="Type & Choose From Dropdown" 
                         className="pl-10 rounded-xl border-border-custom focus:ring-primary h-11" 
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Address Line 1</Label>
                      <Input 
                        value={formData.addressLine1 || ''} 
                        onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                        className="rounded-xl border-border-custom focus:ring-primary h-11" 
                        placeholder="Street / House No"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Address Line 2 (Optional)</Label>
                      <Input 
                        value={formData.addressLine2 || ''} 
                        onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                        className="rounded-xl border-border-custom focus:ring-primary h-11" 
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">City <span className="text-red-500">*</span></Label>
                      <Input 
                        value={formData.city || ''} 
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="rounded-xl border-border-custom focus:ring-primary h-11" 
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">State <span className="text-red-500">*</span></Label>
                      <Input 
                        value={formData.state || ''} 
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="rounded-xl border-border-custom focus:ring-primary h-11" 
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Country <span className="text-red-500">*</span></Label>
                      <Input 
                        value={formData.country || ''} 
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="rounded-xl border-border-custom focus:ring-primary h-11" 
                        placeholder="Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Pin / Zip code <span className="text-red-500">*</span></Label>
                      <Input 
                        value={formData.pinCode || ''} 
                        onChange={(e) => handleInputChange('pinCode', e.target.value)}
                        className="rounded-xl border-border-custom focus:ring-primary h-11" 
                        placeholder="Pin / Zip code"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Athlete/Player Information */}
              <section className="bg-white border border-border-custom rounded-3xl p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-primary">Athlete/Player Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Jersey Name</Label>
                      <Input 
                        value={formData.jerseyName || ''} 
                        onChange={(e) => handleInputChange('jerseyName', e.target.value)}
                        className="rounded-xl border-border-custom focus:ring-primary h-11" 
                        placeholder="Jersey Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Jersey Number</Label>
                      <Input 
                        value={formData.jerseyNumber || ''} 
                        onChange={(e) => handleInputChange('jerseyNumber', e.target.value)}
                        className="rounded-xl border-border-custom focus:ring-primary h-11" 
                        placeholder="Jersey No"
                      />
                    </div>
                  </div>
              </section>

              {/* Physical Information */}
              <section className="bg-white border border-border-custom rounded-3xl p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-primary">Physical Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Height (cm)</Label>
                    <Input 
                      placeholder="Enter Height" 
                      value={formData.height || ''} 
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Weight (kg)</Label>
                    <Input 
                      placeholder="Enter Weight" 
                      value={formData.weight || ''} 
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Handedness</Label>
                    <Select value={formData.handedness} onValueChange={(v) => handleInputChange('handedness', v)}>
                      <SelectTrigger className="rounded-xl border-border-custom focus:ring-primary h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="right">Right Handed</SelectItem>
                        <SelectItem value="left">Left Handed</SelectItem>
                        <SelectItem value="ambidextrous">Ambidextrous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Physically Challenged</Label>
                    <Select value={formData.physicallyChallenged} onValueChange={(v) => handleInputChange('physicallyChallenged', v)}>
                      <SelectTrigger className="rounded-xl border-border-custom focus:ring-primary h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">No</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Identity Verification */}
              <section className="bg-white border border-border-custom rounded-3xl p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-primary">Identity Verification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Select Your ID Proof</Label>
                    <Select value={formData.idProofType} onValueChange={(v) => handleInputChange('idProofType', v)}>
                      <SelectTrigger className="rounded-xl border-border-custom focus:ring-primary h-11">
                        <SelectValue placeholder="Select Identity Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NID">National ID (NID)</SelectItem>
                        <SelectItem value="Birth Certificate">Birth Certificate</SelectItem>
                        <SelectItem value="Passport">Passport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">National Identification Number</Label>
                    <Input 
                      placeholder="Enter number" 
                      value={formData.idNumber || ''} 
                      onChange={(e) => handleInputChange('idNumber', e.target.value)}
                      className="rounded-xl border-border-custom focus:ring-primary h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Upload ID Proof</Label>
                     <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          className="w-full border-dashed border-2 border-border-custom text-text-light font-bold hover:bg-muted/50 h-11"
                          onClick={() => document.getElementById('id_upload')?.click()}
                        >
                           <Upload size={16} className="mr-2" />
                           {formData.idProofURL ? 'File Uploaded' : 'Upload File'}
                        </Button>
                        <input 
                           id="id_upload"
                           type="file" 
                           className="hidden" 
                           onChange={async (e) => {
                             const file = e.target.files?.[0];
                             if (file && user) {
                               const path = `identities/${user.uid}_${Date.now()}_${file.name}`;
                               toast.promise(dataService.uploadFile(file, path), {
                                 loading: 'Uploading ID...',
                                 success: (url) => {
                                   handleInputChange('idProofURL', url);
                                   return 'ID Proof uploaded successfully!';
                                 },
                                 error: 'Upload failed.'
                               });
                             }
                           }}
                        />
                     </div>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6">
                 <Button 
                   variant="ghost" 
                   onClick={() => profile && setFormData(profile)}
                   className="text-text-light font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                 >
                   Discard Changes
                 </Button>
                 <Button 
                   onClick={handleSave}
                   disabled={isSaving}
                   className="bg-accent text-primary hover:bg-accent/90 font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl shadow-lg shadow-accent/20"
                 >
                   {isSaving ? 'Processing...' : 'Save Account Info'}
                 </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="sports" className="animate-in fade-in-50 space-y-6">
               <Card className="rounded-3xl border-border-custom bg-white">
                 <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                        <Trophy size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-primary">Athlete Profile</h3>
                        <p className="text-xs font-bold text-text-light uppercase">Professional Sports History</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-secondary" />

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Jersey Name</Label>
                          <Input 
                            value={formData.jerseyName || ''} 
                            onChange={(e) => handleInputChange('jerseyName', e.target.value)}
                            className="rounded-xl border-border-custom focus:ring-primary h-11" 
                            placeholder="Name displayed on jersey"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Jersey Number</Label>
                          <Input 
                            value={formData.jerseyNumber || ''} 
                            onChange={(e) => handleInputChange('jerseyNumber', e.target.value)}
                            className="rounded-xl border-border-custom focus:ring-primary h-11" 
                            placeholder="e.g. 10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-wider text-text-light/60">Previous Sports Experience</Label>
                        <Textarea 
                          value={formData.previousExperience || ''} 
                          onChange={(e) => handleInputChange('previousExperience', e.target.value)}
                          className="rounded-xl border-border-custom focus:ring-primary min-h-[150px] resize-none" 
                          placeholder="List your previous clubs, tournaments, and achievements..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                         onClick={handleSave}
                         disabled={isSaving}
                         className="bg-primary text-secondary font-black uppercase text-xs h-12 px-8 rounded-xl"
                      >
                         {isSaving ? 'Saving...' : 'Update Sports Info'}
                      </Button>
                    </div>
                 </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="preferences" className="animate-in fade-in-50 space-y-6">
               <section className="bg-white border border-border-custom rounded-3xl p-8 shadow-sm space-y-6">
                 <h3 className="text-lg font-black text-primary">App Preferences</h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-black text-primary">Email Notifications</Label>
                        <p className="text-xs text-text-light font-medium">Receive match updates and approvals via email.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator className="bg-secondary" />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-black text-primary">Public Profile</Label>
                        <p className="text-xs text-text-light font-medium">Allow other academy members to search and view your profile.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                 </div>
               </section>
            </TabsContent>

            <TabsContent value="privacy" className="animate-in fade-in-50 space-y-6">
               <section className="bg-white border border-border-custom rounded-3xl p-8 shadow-sm space-y-8">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                     <Lock size={24} />
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-primary">Security</h3>
                     <p className="text-xs font-bold text-text-light uppercase">Account Access & Protection</p>
                   </div>
                 </div>

                 <Separator className="bg-secondary" />

                 <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-primary">Change Password</h4>
                        <p className="text-xs text-text-light font-medium max-w-md">
                          For your security, we recommend using a strong password. Click the button below to receive a secure password reset link at <strong>{user?.email}</strong>.
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        className="border-primary text-primary font-black uppercase text-[10px] tracking-widest h-11 px-6 rounded-xl hover:bg-primary hover:text-secondary group transition-all"
                        onClick={async () => {
                          if (user?.email) {
                            try {
                              await sendPasswordResetEmail(auth, user.email);
                              toast.success("Password reset link sent to your email!");
                            } catch (error: any) {
                              toast.error(error.message || "Failed to send reset link.");
                            }
                          }
                        }}
                      >
                        Send Reset Link
                      </Button>
                    </div>

                    <Separator className="bg-secondary/50" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-primary">Two-Factor Authentication</h4>
                        <p className="text-xs text-text-light font-medium">Add an extra layer of security to your account.</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black border-red-200 text-red-500 bg-red-50 py-1">SOON</Badge>
                    </div>
                 </div>
               </section>

               <section className="bg-white border border-border-custom rounded-3xl p-8 shadow-sm space-y-8">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                     <Shield size={24} />
                   </div>
                   <div>
                     <h3 className="text-lg font-black text-primary">Privacy Control</h3>
                     <p className="text-xs font-bold text-text-light uppercase">Manage your data visibility</p>
                   </div>
                 </div>

                 <Separator className="bg-secondary" />

                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-black text-primary">Activity Visibility</Label>
                        <p className="text-xs text-text-light font-medium">Allow everyone to see your match history and stats.</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator className="bg-secondary/50" />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-black text-primary">Data Requests</Label>
                        <p className="text-xs text-text-light font-medium">Download a copy of all your data stored in the academy.</p>
                      </div>
                      <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest">Request Copy</Button>
                    </div>
                 </div>
               </section>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function Badge({ children, variant = 'default', className }: { children: React.ReactNode, variant?: 'default' | 'outline', className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === 'default' ? "bg-primary text-secondary" : "border border-border-custom bg-transparent",
      className
    )}>
      {children}
    </span>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
