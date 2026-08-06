import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
 return (
 <div className="flex-1 flex flex-col items-center justify-center p-8 h-full relative z-10">
 <Card className="max-w-md w-full bg-card dark:from-white/5 dark:to-black/5 border-border shadow-sm text-center">
 <CardContent className="p-12 flex flex-col items-center">
 <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 shadow-inner">
 <SearchX className="w-10 h-10 text-indigo-500" />
 </div>
 <h1 className="text-4xl font-black tracking-tight text-foreground dark:text-white mb-2">404</h1>
 <p className="text-xl font-medium text-muted-foreground mb-6">Module Not Found</p>
 <p className="text-sm text-muted-foreground/80 mb-8 max-w-[250px]">
 The requested sector of Life OS could not be located. It may have been moved or doesn't exist yet.
 </p>
 <Link 
 href="/"
 className="flex items-center gap-2 bg-foreground hover:bg-foreground/90 text-background px-6 py-3 rounded-xl font-medium transition-all shadow-sm"
 >
 <ArrowLeft className="w-4 h-4" /> Return to Dashboard
 </Link>
 </CardContent>
 </Card>
 </div>
 );
}
