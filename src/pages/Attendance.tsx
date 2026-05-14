import * as React from 'react';
import { 
  ClipboardCheck, 
  Calendar as CalendarIcon, 
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

const mockPlayers = [
  { id: '1', name: 'Sakib Al Hasan', photo: 'https://picsum.photos/seed/sakib/200', attendance: '92%' },
  { id: '2', name: 'Nirob Hossain', photo: 'https://picsum.photos/seed/nirob/200', attendance: '85%' },
  { id: '3', name: 'Nayan Ali', photo: 'https://picsum.photos/seed/nayan/200', attendance: '78%' },
  { id: '4', name: 'Tamim Iqbal', photo: 'https://picsum.photos/seed/tamim/200', attendance: '95%' },
  { id: '5', name: 'Mushfiqur Rahim', photo: 'https://picsum.photos/seed/mushfiq/200', attendance: '88%' },
];

import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export default function Attendance() {
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [presentIds, setPresentIds] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  const toggleAttendance = (id: string) => {
    setPresentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredPlayers = mockPlayers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveAttendance = () => {
    toast.success(`Attendance saved for ${selectedDate}. ${presentIds.length} players present.`);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            Personnel <span className="text-indigo-500">Log</span>
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
            <ClipboardCheck size={14} className="text-indigo-500" /> Operational Participation Audit
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="border-slate-200 text-slate-500 font-black h-14 px-8 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Download size={20} className="mr-3" />
            Export Intel
          </Button>
          <Button className="bg-slate-900 text-white font-black h-14 px-10 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-indigo-600 transition-all active:scale-95" onClick={saveAttendance}>
            <ClipboardCheck size={20} className="mr-3" />
            Commit Audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Attendance List */}
        <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/50 rounded-[48px] overflow-hidden bg-white">
          <CardHeader className="p-10 pb-6 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-44 border-slate-200 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest bg-white shadow-inner"
                />
                <div className="relative w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <Input 
                    placeholder="Search personnel..." 
                    className="pl-12 border-slate-200 rounded-2xl h-12 text-[11px] font-bold bg-white shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic shadow-lg shadow-slate-900/10 transition-all">
                {presentIds.length} / {mockPlayers.length} Accounted
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredPlayers.map((player, i) => (
                <motion.div 
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-6 group hover:bg-indigo-50/30 px-10 transition-all cursor-pointer"
                  onClick={() => toggleAttendance(player.id)}
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-8 h-8 rounded-2xl border-[3px] transition-all flex items-center justify-center shrink-0 shadow-inner",
                      presentIds.includes(player.id) ? "bg-indigo-500 border-indigo-500" : "bg-slate-50 border-slate-100 group-hover:border-indigo-200"
                    )}>
                        {presentIds.includes(player.id) && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                    <Avatar className="w-14 h-14 rounded-2xl border-4 border-white shadow-xl group-hover:scale-110 transition-transform">
                      <AvatarImage src={player.photo} className="object-cover" />
                      <AvatarFallback className="bg-slate-100 text-slate-400 font-black text-xs">{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <Label className="font-black text-slate-900 cursor-pointer text-base uppercase tracking-tight italic">
                        {player.name}
                      </Label>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">Field Ready</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Consistency Rating</p>
                      <p className="text-lg font-black text-slate-900 italic">{player.attendance}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2full flex items-center justify-center transition-all">
                      {presentIds.includes(player.id) ? (
                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Insights */}
        <div className="space-y-10">
          <Card className="elite-card bg-slate-900 border-none shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
              <TrendingUp size={160} />
            </div>
            <CardHeader className="p-8 border-b border-white/5 relative z-10">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Tactical Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 relative z-10">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Aggregate Rating</span>
                <span className="font-black text-4xl text-white italic">84%</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Field Exemplar</span>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[28px] border border-white/10">
                   <Avatar className="w-10 h-10 rounded-xl border border-white/10">
                      <AvatarImage src="https://picsum.photos/seed/tamim/200" />
                      <AvatarFallback>TI</AvatarFallback>
                   </Avatar>
                   <span className="text-sm font-black text-white uppercase tracking-tight">Tamim Iqbal</span>
                </div>
              </div>
              <div className="pt-4">
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <TrendingUp size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Positive Displacement</span>
                </div>
                <p className="text-[11px] font-bold text-white/50 leading-relaxed uppercase tracking-wider italic">Attendance vector has increased by 12% relative to previous audit.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[48px] bg-white">
            <CardHeader className="p-8 border-b border-slate-50">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 italic">Personnel Key</CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Accounted / Prime Status</span>
              </div>
              <div className="flex items-center gap-4 opacity-60">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Delayed Deployment</span>
              </div>
              <div className="flex items-center gap-4 opacity-40">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Critical Absence</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
