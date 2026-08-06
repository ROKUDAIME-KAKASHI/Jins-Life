"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateDailyInsight } from "@/app/actions/proactive";
import { AlertCircle } from "lucide-react";

export function InsightGenerator() {
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);

 async function handleGen() {
 setLoading(true);
 setError(null);
 try {
 const res = await generateDailyInsight();
 if (res && 'error' in res) {
 setError(res.error as string);
 }
 } catch (e) {
 setError("It seems your AI assistant is currently asleep. Could you kindly verify that your API key is correctly placed in the .env file?");
 } finally {
 setLoading(false);
 }
 }

 return (
 <div className="space-y-4">
 <p className="text-muted-foreground text-sm">Your AI assistant is ready to analyze your day and give you a personalized briefing.</p>
 {error && (
 <div className="flex items-center gap-3 text-red-400 bg-red-400/10 p-3 rounded-xl text-sm border border-red-400/20 shadow-inner">
 <AlertCircle className="w-5 h-5 shrink-0" />
 <p>{error}</p>
 </div>
 )}
 <Button 
 onClick={handleGen} 
 disabled={loading}
 className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm transition-all hover:-translate-y-0.5"
 >
 {loading ? "Generating..." : "✨ Generate Briefing"}
 </Button>
 </div>
 );
}
