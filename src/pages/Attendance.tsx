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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Training Attendance</h2>
          <p className="text-text-light text-sm mt-1">Track daily participation and generate reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-primary text-primary font-bold hover:bg-primary/5 h-10">
            <Download size={18} className="mr-2" />
            Monthly Report
          </Button>
          <Button className="bg-primary text-secondary font-bold h-10" onClick={saveAttendance}>
            <ClipboardCheck size={18} className="mr-2" />
            Save Attendance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance List */}
        <Card className="lg:col-span-2 shadow-card border-border-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-muted">
            <div className="flex items-center gap-4">
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40 border-border-custom focus:ring-primary h-9 text-xs font-bold uppercase"
              />
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light/40" size={16} />
                <Input 
                  placeholder="Search players..." 
                  className="pl-9 border-border-custom focus:ring-primary h-9 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="text-[10px] font-black text-primary uppercase tracking-widest">
              {presentIds.length} / {mockPlayers.length} Present
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-muted">
              {filteredPlayers.map((player) => (
                <div key={player.id} className="flex items-center justify-between py-4 group hover:bg-muted/30 px-6 transition-colors">
                  <div className="flex items-center gap-4">
                    <Checkbox 
                      id={`player-${player.id}`}
                      checked={presentIds.includes(player.id)}
                      onCheckedChange={() => toggleAttendance(player.id)}
                      className="border-border-custom data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Avatar className="w-10 h-10 border border-border-custom">
                      <AvatarImage src={player.photo} />
                      <AvatarFallback className="bg-muted text-primary font-black text-xs">{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <Label htmlFor={`player-${player.id}`} className="font-bold text-text-main cursor-pointer text-sm">
                      {player.name}
                    </Label>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-text-light uppercase tracking-widest">Monthly Rate</p>
                      <p className="text-sm font-black text-primary">{player.attendance}</p>
                    </div>
                    {presentIds.includes(player.id) ? (
                      <CheckCircle2 className="text-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]" size={20} />
                    ) : (
                      <XCircle className="text-text-light/20" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Insights */}
        <div className="space-y-6">
          <Card className="shadow-card border-border-custom bg-primary text-secondary overflow-hidden">
            <CardHeader className="border-b border-secondary/10">
              <CardTitle className="text-xs font-black uppercase tracking-widest">Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary/60 text-xs font-bold uppercase tracking-wider">Avg. Attendance</span>
                <span className="font-black text-2xl">84%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary/60 text-xs font-bold uppercase tracking-wider">Best Attendance</span>
                <span className="font-black text-lg truncate ml-4">Tamim Iqbal</span>
              </div>
              <div className="pt-4 border-t border-secondary/10">
                <div className="flex items-center gap-2 text-accent mb-2">
                  <TrendingUp size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Trending Up</span>
                </div>
                <p className="text-xs text-secondary/80 leading-relaxed">Attendance has increased by 12% compared to last month.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border-custom">
            <CardHeader className="border-b border-muted">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Legend</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-xs font-bold text-text-light uppercase tracking-wider">Present (On Time)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                <span className="text-xs font-bold text-text-light uppercase tracking-wider">Late Arrival</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-xs font-bold text-text-light uppercase tracking-wider">Absent</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
