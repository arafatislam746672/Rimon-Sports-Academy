import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Plus, 
  ExternalLink, 
  MousePointer2, 
  Eye, 
  ShieldCheck,
  Building2,
  Trash2,
  Settings2,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { dataService } from '@/services/dataService';
import { Sponsor } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Sponsors() {
  const [sponsors, setSponsors] = React.useState<Sponsor[]>([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { profile } = useAuth();
  
  const [formData, setFormData] = React.useState<Partial<Sponsor>>({
    name: '',
    logoURL: '',
    websiteURL: '',
    description: '',
    tier: 'gold',
    status: 'active'
  });

  React.useEffect(() => {
    const unsub = dataService.getSponsors(setSponsors);
    return unsub;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataService.addSponsor(formData as any);
      toast.success("Strategic partnership established.");
      setIsModalOpen(false);
      setFormData({
        name: '',
        logoURL: '',
        websiteURL: '',
        description: '',
        tier: 'gold',
        status: 'active'
      });
    } catch (error) {
      toast.error("Failed to establish partnership.");
    }
  };

  const isManagement = profile?.role === 'management';

  const tierColors = {
    platinum: 'text-[#E5E4E2] bg-[#E5E4E2]/10 border-[#E5E4E2]/20',
    gold: 'text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/20',
    silver: 'text-[#C0C0C0] bg-[#C0C0C0]/10 border-[#C0C0C0]/20',
    partner: 'text-primary bg-primary/10 border-primary/20'
  };

  return (
    <div className="p-8 pb-32 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] px-6 py-2 rounded-full border-none shadow-xl shadow-primary/20">
            Corporate Alliances
          </Badge>
          <h1 className="text-7xl font-display font-black uppercase tracking-tighter leading-[0.85] italic">
            Strategic <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">Partnerships</span>
          </h1>
          <p className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.4em] italic max-w-md">
            Management of commercial assets, sponsorships, and institutional growth indicators.
          </p>
        </div>

        {isManagement && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-black text-white hover:bg-black/90 h-16 px-10 rounded-[28px] font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all active:scale-95 group">
                <Plus size={18} className="mr-3 group-hover:rotate-90 transition-transform" />
                Initialize Alliance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-[#050608] border-none rounded-[40px] p-0 overflow-hidden shadow-2xl">
              <div className="bg-primary p-10 text-white relative">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Building2 size={120} />
                 </div>
                 <div className="relative z-10 space-y-2">
                    <Badge className="bg-white/20 text-white font-black uppercase text-[9px] px-4 py-1.5 rounded-full border-none backdrop-blur-md">Alliance Protocol</Badge>
                    <DialogTitle className="text-4xl font-black uppercase tracking-tighter italic">Register Sponsor</DialogTitle>
                 </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Asset Identity (Name)</label>
                       <input 
                         required
                         className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-black uppercase italic outline-none focus:border-primary transition-all text-white"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Tier Assignment</label>
                          <select 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase italic outline-none focus:border-primary transition-all text-white appearance-none"
                            value={formData.tier}
                            onChange={(e) => setFormData({...formData, tier: e.target.value as any})}
                          >
                             <option value="platinum">Platinum</option>
                             <option value="gold">Gold</option>
                             <option value="silver">Silver</option>
                             <option value="partner">Partner</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Operation Status</label>
                          <select 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase italic outline-none focus:border-primary transition-all text-white appearance-none"
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                          >
                             <option value="active">Operational</option>
                             <option value="inactive">Suspended</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Visual Asset (Logo URL)</label>
                       <input 
                         required
                         className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium outline-none focus:border-primary transition-all text-white"
                         value={formData.logoURL}
                         onChange={(e) => setFormData({...formData, logoURL: e.target.value})}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Relational Link (Website)</label>
                       <input 
                         className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium outline-none focus:border-primary transition-all text-white"
                         value={formData.websiteURL}
                         onChange={(e) => setFormData({...formData, websiteURL: e.target.value})}
                       />
                    </div>
                 </div>

                 <Button 
                   type="submit"
                   className="w-full bg-primary text-primary-foreground font-black rounded-2xl h-16 uppercase text-[11px] tracking-[0.2em] shadow-xl italic mt-4"
                 >
                    Finalize Alliance
                 </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={sponsor.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group relative bg-[#0a0b10] border-white/5 rounded-[48px] p-8 overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(var(--primary),0.15)] h-full flex flex-col">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 pointer-events-none">
                  <Trophy size={160} />
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-8">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-primary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative w-20 h-20 rounded-[28px] bg-white p-4 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                        <img 
                          src={sponsor.logoURL || 'https://via.placeholder.com/150'} 
                          alt={sponsor.name}
                          className="w-full h-full object-contain"
                          onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/initials/svg?seed=' + sponsor.name)}
                        />
                      </div>
                    </div>
                    <Badge className={`uppercase text-[9px] font-black tracking-widest px-4 py-1.5 rounded-full border ${tierColors[sponsor.tier as keyof typeof tierColors] || 'bg-muted/10'}`}>
                      {sponsor.tier} Partner
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-8">
                    <h3 className="text-3xl font-display font-black uppercase tracking-tighter leading-none italic group-hover:text-primary transition-colors">
                      {sponsor.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest line-clamp-2 leading-relaxed opacity-70">
                      {sponsor.description || 'Institutional partner supporting academy development initiatives.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MousePointer2 size={12} className="text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Conversions</span>
                      </div>
                      <div className="text-2xl font-black italic tracking-tighter">{sponsor.clicks || 0}</div>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group-hover:bg-accent/5 group-hover:border-accent/10 transition-colors">
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <Eye size={12} className="text-accent" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Exposure</span>
                      </div>
                      <div className="text-2xl font-black italic tracking-tighter">{sponsor.views || 0}</div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Operational Status: <span className="text-white">Active</span></span>
                    </div>
                    <div className="flex gap-2">
                      {sponsor.websiteURL && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild
                          className="w-10 h-10 rounded-xl hover:bg-primary/20 hover:text-primary"
                          onClick={() => dataService.trackSponsorClick(sponsor.id)}
                        >
                          <a href={sponsor.websiteURL} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={16} />
                          </a>
                        </Button>
                      )}
                      {isManagement && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-10 h-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Metrics Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-[60px] bg-primary p-12 overflow-hidden shadow-2xl shadow-primary/30"
      >
        <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12">
          <TrendingUp size={300} />
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div className="space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none">Institutional <br /> Growth Matrix</h2>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] max-w-[200px]">Strategic alliance data points for commercial optimization.</p>
          </div>
          
          <div className="flex items-center gap-8 border-l border-white/10 md:pl-12">
             <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-white">
                <Target size={32} />
             </div>
             <div>
                <div className="text-5xl font-black text-white italic tracking-tighter leading-none">84%</div>
                <div className="text-[9px] font-black text-white/50 uppercase tracking-widest mt-1 italic">Conversion Growth</div>
             </div>
          </div>

          <div className="flex items-center gap-8 border-l border-white/10 md:pl-12">
             <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-white">
                <ShieldCheck size={32} />
             </div>
             <div>
                <div className="text-5xl font-black text-white italic tracking-tighter leading-none">12.4M</div>
                <div className="text-[9px] font-black text-white/50 uppercase tracking-widest mt-1 italic">Brand impressions</div>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
