import { Loader2 } from "lucide-react";

export default function Loading() {
 return (
 <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-500 relative z-10">
 <div className="flex justify-between items-end">
 <div className="space-y-3">
 <div className="h-10 w-48 bg-muted/50 rounded-xl animate-pulse "></div>
 <div className="h-4 w-64 bg-muted/50 rounded-md animate-pulse "></div>
 </div>
 </div>

 <div className="bg-card dark:from-white/5 dark:to-black/5 border border-border shadow-sm rounded-2xl p-6 min-h-[200px] flex items-center justify-center">
 <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
 <Loader2 className="w-8 h-8 animate-spin text-indigo-500/50" />
 <p className="text-sm font-medium animate-pulse">Loading module...</p>
 </div>
 </div>

 <div className="space-y-4">
 {[1, 2, 3].map((i) => (
 <div key={i} className="h-24 bg-muted/50 border border-border shadow-sm rounded-2xl animate-pulse "></div>
 ))}
 </div>
 </div>
 );
}
