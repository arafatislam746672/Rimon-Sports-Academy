import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  Map as MapIcon, 
  Plus, 
  Phone, 
  Building, 
  CheckCircle2, 
  Layers,
  ArrowUpRight,
  Search,
  Settings2,
  Trash2,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { dataService } from '@/services/dataService';
import { Venue } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Venues() {
  const [venues, setVenues] = React.useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { profile } = useAuth();
  
  const [formData, setFormData] = React.useState<Partial<Venue>>({
    name: '',
    address: '',
    city: '',
    facilities: [],
    contactPerson: '',
    phone: '',
    photoURL: ''
  });

  const [newFacility, setNewFacility] = React.useState('');

  React.useEffect(() => {
    const unsub = dataService.getVenues(setVenues);
    return unsub;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dataService.addVenue(formData as any);
      toast.success("Strategic venue indexed.");
      setIsModalOpen(false);
      setFormData({
        name: '',
        address: '',
        city: '',
        facilities: [],
        contactPerson: '',
        phone: '',
        photoURL: ''
      });
    } catch (error) {
      toast.error("Failed to index venue.");
    }
  };

  const filteredVenues = venues.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isManagement = profile?.role === 'management';

  const addFacility = () => {
    if (newFacility.trim() && !formData.facilities?.includes(newFacility.trim())) {
      setFormData({
        ...formData,
        facilities: [...(formData.facilities || []), newFacility.trim()]
      });
      setNewFacility('');
    }
  };

  return (
    <div className="p-8 pb-32 space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <div className="space-y-6">
          <Badge className="bg-accent text-accent-foreground font-black uppercase tracking-[0.3em] text-[10px] px-8 py-2.5 rounded-full border-none shadow-2xl shadow-accent/20">
            Venue Management
          </Badge>
          <h1 className="text-7xl lg:text-8xl font-display font-black uppercase tracking-tighter leading-[0.8] italic">
            Command <br /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-primary to-accent animate-gradient-x">Centers</span>
          </h1>
          <p className="text-muted-foreground uppercase text-[11px] font-black tracking-[0.4em] italic max-w-lg leading-relaxed">
            Deployment coordinates, facility oversight, and logistical infrastructure mapping.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative group">
             <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
             <div className="relative bg-black/40 border border-white/10 rounded-[28px] h-16 w-full sm:w-[320px] flex items-center px-6 gap-4">
                <Search size={18} className="text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input 
                  placeholder="SEARCH COORDINATES..." 
                  className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-white w-full placeholder:text-white/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
          
          {isManagement && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-16 px-10 rounded-[28px] font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all active:scale-95 group">
                  <Plus size={18} className="mr-3 group-hover:rotate-90 transition-transform" />
                  Index New Venue
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[540px] bg-[#050608] border-none rounded-[48px] p-0 overflow-hidden shadow-2xl">
                 <div className="bg-accent p-10 text-accent-foreground relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <MapPin size={120} />
                    </div>
                    <div className="relative z-10 space-y-2">
                       <Badge className="bg-black/20 text-black font-black uppercase text-[9px] px-4 py-1.5 rounded-full border-none backdrop-blur-md">Tactical deployment</Badge>
                       <DialogTitle className="text-4xl font-black uppercase tracking-tighter italic">Venue Indexing</DialogTitle>
                    </div>
                 </div>

                 <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Venue Identity</label>
                          <input 
                            required
                            placeholder="OPERATIONAL NAME"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase italic outline-none focus:border-accent transition-all text-white placeholder:text-white/10"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">City/Sector</label>
                             <input 
                               required
                               className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase italic outline-none focus:border-accent transition-all text-white"
                               value={formData.city}
                               onChange={(e) => setFormData({...formData, city: e.target.value})}
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Contact Officer</label>
                             <input 
                               className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-black uppercase italic outline-none focus:border-accent transition-all text-white"
                               value={formData.contactPerson}
                               onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                             />
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Deployment Address</label>
                          <input 
                            required
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium outline-none focus:border-accent transition-all text-white"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                          />
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Facility Modules</label>
                          <div className="flex gap-2">
                             <input 
                               className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-xs font-medium outline-none focus:border-accent transition-all text-white"
                               value={newFacility}
                               onChange={(e) => setNewFacility(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
                             />
                             <Button type="button" onClick={addFacility} className="rounded-2xl h-full w-14 bg-white/5 hover:bg-white/10 border border-white/10">
                                <Plus size={18} />
                             </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                             {formData.facilities?.map(f => (
                               <Badge key={f} className="bg-white/5 border-white/10 text-[9px] font-black uppercase py-1 px-3">
                                  {f}
                               </Badge>
                             ))}
                          </div>
                       </div>
                    </div>

                    <Button type="submit" className="w-full bg-accent text-accent-foreground font-black rounded-2xl h-16 uppercase text-[11px] tracking-[0.2em] shadow-xl italic mt-4">
                       Finalize Command Center
                    </Button>
                 </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <AnimatePresence mode="popLayout">
          {filteredVenues.map((venue, index) => (
            <motion.div
              key={venue.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group relative bg-[#0a0b10] border-white/5 rounded-[48px] overflow-hidden hover:border-accent/40 transition-all duration-700 hover:shadow-[0_40px_120px_-30px_rgba(var(--accent),0.2)]">
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Photo / Map Placeholder */}
                  <div className="w-full lg:w-[40%] h-[240px] lg:h-auto bg-muted/10 relative overflow-hidden">
                    <img 
                      src={venue.photoURL || `https://images.unsplash.com/photo-1541252260730-0412e3e2108e?w=800&auto=format&fit=crop&q=60`}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                      alt={venue.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <div className="flex items-center gap-2 text-white">
                         <MapPin size={14} className="text-accent" />
                         <span className="text-[10px] font-black uppercase tracking-widest italic">{venue.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-8 lg:p-10 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <h3 className="text-3xl lg:text-4xl font-display font-black uppercase tracking-tighter italic leading-none group-hover:text-accent transition-colors">
                          {venue.name}
                        </h3>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">{venue.address}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500 cursor-pointer">
                        <Navigation size={20} />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                       {venue.facilities?.slice(0, 4).map(f => (
                         <div key={f} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 group-hover:border-accent/10 transition-colors">
                            <CheckCircle2 size={10} className="text-accent" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/70">{f}</span>
                         </div>
                       ))}
                       {venue.facilities && venue.facilities.length > 4 && (
                         <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                            + {venue.facilities.length - 4} MORE
                         </div>
                       )}
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                             <Users size={12} className="text-accent/60" />
                             <span className="text-[7px] font-black uppercase tracking-widest">Command Officer</span>
                          </div>
                          <div className="text-[11px] font-black uppercase italic text-white/90">{venue.contactPerson || 'NOT ASSIGNED'}</div>
                       </div>
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                             <Phone size={12} className="text-accent/60" />
                             <span className="text-[7px] font-black uppercase tracking-widest">Frequency (Tel)</span>
                          </div>
                          <div className="text-[11px] font-black uppercase italic text-white/90">{venue.phone || 'N/A'}</div>
                       </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tactical Map Overview Teaser */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative h-[400px] rounded-[60px] bg-[#0c0d12] border border-white/5 overflow-hidden group shadow-2xl"
      >
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
               <div className="absolute -inset-20 bg-accent/20 rounded-full blur-[100px] animate-pulse" />
               <MapIcon size={120} className="text-accent relative z-10 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
         </div>
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
         <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60 italic">Geospatial Overlay Active</span>
               </div>
               <h2 className="text-5xl lg:text-6xl font-display font-black uppercase tracking-tighter italic text-white leading-none">Global Network <br /> Visualization</h2>
            </div>
            <Button className="bg-white text-black hover:bg-white/90 h-16 px-10 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl transition-all group shrink-0">
               Launch Map Protocols
               <ArrowUpRight size={18} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
         </div>
      </motion.div>
    </div>
  );
}
