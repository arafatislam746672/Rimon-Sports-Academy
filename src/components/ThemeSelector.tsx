import * as React from 'react';
import { useTheme, ThemeType } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { Check, Palette } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

const themes: { id: ThemeType; name: string; color: string }[] = [
  { id: 'default', name: 'Midnight', color: 'bg-[#6366F1]' },
  { id: 'ocean', name: 'Ocean', color: 'bg-[#0EA5E9]' },
  { id: 'neon', name: 'Neon', color: 'bg-[#10B981]' },
  { id: 'sunset', name: 'Sunset', color: 'bg-[#F43F5E]' },
  { id: 'royal', name: 'Royal', color: 'bg-[#A855F7]' },
  { id: 'cherry', name: 'Cherry', color: 'bg-[#EF4444]' },
  { id: 'forest', name: 'Forest', color: 'bg-[#16A34A]' },
  { id: 'cyberpunk', name: 'Cyberpunk', color: 'bg-[#D946EF]' },
  { id: 'monochrome', name: 'Cyber', color: 'bg-white' },
];

export function ThemeSelector({ className, minimal = false }: { className?: string; minimal?: boolean }) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={minimal ? "icon" : "default"}
          className={cn(
            "rounded-2xl transition-all",
            !minimal && "gap-3 px-6 h-14 font-black text-[10px] uppercase tracking-widest bg-muted/30 hover:bg-muted",
            minimal && "h-12 w-12 bg-muted/30 hover:bg-muted",
            className
          )}
        >
          <Palette size={minimal ? 20 : 16} className="text-accent" />
          {!minimal && <span>Customize Appearance</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-card border-border rounded-3xl p-3 shadow-2xl z-[100] text-foreground">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Visual Engine</span>
              <span className="text-sm font-bold text-foreground">Switch Environment Theme</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border" />
        <div className="grid grid-cols-1 gap-2 mt-2">
          {themes.map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-pointer transition-all border border-transparent",
                theme === t.id ? "bg-accent/10 border-accent/20" : "hover:bg-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full shadow-sm", t.color)} />
                <span className={cn("text-xs font-bold", theme === t.id ? "text-accent" : "text-foreground")}>
                  {t.name}
                </span>
              </div>
              {theme === t.id && <Check size={14} className="text-accent" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
