"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sun, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 const router = useRouter();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError("");

 const res = await signIn("credentials", {
 email,
 password,
 redirect: false,
 });

 if (res?.error) {
 setError("Invalid credentials. If this is your first login, make sure no other users have registered.");
 } else {
 router.push("/");
 router.refresh();
 }
 setLoading(false);
 };

 return (
 <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
 <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(0,0,0,0))]"></div>
 <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] animate-pulse"></div>
 <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

 <Card className="w-full max-w-md bg-background/20 border-border shadow-sm p-8 !py-8 !rounded-2xl">
 <div className="flex flex-col items-center mb-8">
 <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm mb-4">
 <Sun className="w-6 h-6 text-white" />
 </div>
 <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">Welcome to Life OS</h1>
 <p className="text-sm text-muted-foreground mt-2 text-center leading-relaxed">
 If this is the first time running Life OS, your login attempt will instantly create the master account.
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-5">
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground/80 dark:text-white/80">Email</label>
 <Input 
 type="email" 
 value={email} 
 onChange={e => setEmail(e.target.value)} 
 required 
 className="bg-muted/50 border-border h-12 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus-visible:ring-purple-500"
 placeholder="you@example.com"
 />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground/80 dark:text-white/80">Master Password</label>
 <Input 
 type="password" 
 value={password} 
 onChange={e => setPassword(e.target.value)} 
 required 
 className="bg-muted/50 border-border h-12 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus-visible:ring-purple-500"
 placeholder="••••••••"
 />
 </div>

 {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

 <Button type="submit" disabled={loading} className="w-full h-12 mt-6 bg-foreground hover:bg-foreground/90 text-background shadow-sm transition-all hover:-translate-y-0.5">
 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enter LifeOS'}
 </Button>
 </form>
 </Card>
 </div>
 );
}
