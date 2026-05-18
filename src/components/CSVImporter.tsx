import React from 'react';
import { Upload, FileDown, AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface CSVImporterProps<T> {
  type: 'players' | 'matches' | 'teams';
  onImport: (data: any[]) => Promise<void>;
  sampleHeaders: string[];
}

export default function CSVImporter<T>({ type, onImport, sampleHeaders }: CSVImporterProps<T>) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [parsedData, setParsedData] = React.useState<any[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCSV(text);
    };
    reader.readAsText(file);
  };

  const processCSV = (text: string) => {
    try {
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const missingHeaders = sampleHeaders.filter(sh => !headers.includes(sh.toLowerCase()));
      if (missingHeaders.length > 0) {
        setError(`Missing required columns: ${missingHeaders.join(', ')}`);
        return;
      }

      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        return obj;
      });

      setParsedData(data);
      setError(null);
    } catch (err) {
      setError("Failed to parse CSV file. Ensure it is correctly formatted.");
    }
  };

  const handleConfirmImport = async () => {
    if (!parsedData) return;
    setIsUploading(true);
    try {
      await onImport(parsedData);
      toast.success(`Successfully imported ${parsedData.length} ${type}!`);
      setParsedData(null);
    } catch (err) {
      toast.error(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + sampleHeaders.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-black uppercase tracking-tighter italic">Bulk Import ({type})</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Transfer large datasets via prioritized CSV protocols</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={downloadTemplate}
          className="rounded-full border-border/50 bg-muted/10 hover:bg-muted/20 text-[9px] font-black uppercase tracking-widest gap-2"
        >
          <FileDown size={14} /> Template
        </Button>
      </div>

      {!parsedData ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border/50 rounded-[32px] p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".csv"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-muted/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
              <Upload size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="font-black uppercase tracking-widest text-sm">Deploy CSV File</p>
              <p className="text-[10px] text-muted-foreground font-medium">Click or drag to initialize data stream</p>
            </div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-muted/10 border border-border/50 rounded-[32px] p-8 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
              <div>
                <p className="font-black uppercase text-sm tracking-widest">{parsedData.length} records parsed</p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">Data integrity verified</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setParsedData(null)}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <X size={20} />
            </Button>
          </div>

          <div className="max-h-[200px] overflow-y-auto rounded-2xl border border-border/30 bg-black/20 p-4 no-scrollbar">
            <table className="w-full text-[10px] uppercase font-black tracking-widest opacity-60">
              <thead>
                <tr className="border-b border-border/20">
                  {sampleHeaders.map(h => <th key={h} className="text-left py-2 px-3">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-b border-border/10">
                    {sampleHeaders.map(h => <td key={h} className="py-2 px-3">{row[h.toLowerCase()]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 5 && (
              <p className="text-center py-4 text-[9px] text-muted-foreground italic font-black uppercase tracking-[0.2em]">
                + {parsedData.length - 5} more records
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <Button 
              variant="ghost" 
              className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px]"
              onClick={() => setParsedData(null)}
            >
              Abort Mission
            </Button>
            <Button 
              className="flex-1 bg-primary text-primary-foreground h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 italic"
              onClick={handleConfirmImport}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                'Finalize Synchronization'
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
          <AlertCircle size={20} />
          <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
        </div>
      )}
    </div>
  );
}
