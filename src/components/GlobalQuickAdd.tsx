"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CheckSquare, Flame, Calendar, DollarSign } from "lucide-react";
import { createEntity } from "@/app/actions/quickAdd";

export function GlobalQuickAdd() {
 const [open, setOpen] = useState(false);
 const [type, setType] = useState<"task" | "habit" | "event" | "expense" | "log">("log");
 const [title, setTitle] = useState("");
 const [amount, setAmount] = useState("");
 const [loading, setLoading] = useState(false);

 async function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 setLoading(true);
 await createEntity({ type, title, amount: Number(amount) || 0 });
 setLoading(false);
 setOpen(false);
 setTitle("");
 setAmount("");
 }

 const types = [
 { id: "task", label: "Task", icon: CheckSquare },
 { id: "habit", label: "Habit", icon: Flame },
 { id: "event", label: "Event", icon: Calendar },
 { id: "expense", label: "Expense", icon: DollarSign },
 { id: "log", label: "Log", icon: Plus },
 ] as const;

 return (
 <Dialog open={open} onOpenChange={setOpen}>
 <DialogTrigger className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-foreground text-background shadow-sm transition-all hover:scale-110 z-50 p-0 border border-border flex items-center justify-center group">
 <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
 </DialogTrigger>
 <DialogContent className="bg-background/80 border-border text-foreground dark:text-white max-w-md shadow-sm !rounded-3xl">
 <DialogHeader>
 <DialogTitle className="text-2xl font-bold bg-clip-text text-foreground">Quick Add</DialogTitle>
 </DialogHeader>
 
 <div className="flex gap-2 p-1.5 bg-muted/50 rounded-2xl mt-2 border border-border">
 {types.map(t => {
 const Icon = t.icon;
 const active = type === t.id;
 return (
 <button
 key={t.id}
 onClick={() => setType(t.id)}
 className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all ${active ? "bg-card text-white shadow-sm " : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground dark:hover:text-white"}`}
 >
 <Icon className="w-5 h-5" />
 {t.label}
 </button>
 )
 })}
 </div>

 <form onSubmit={handleSubmit} className="space-y-5 pt-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground/80 dark:text-white/80 ml-1">
 {type === 'expense' ? 'Description' : 'Title'}
 </label>
 <Input 
 required 
 autoFocus
 value={title} 
 onChange={e => setTitle(e.target.value)} 
 placeholder={type === 'task' ? 'e.g. Buy groceries' : type === 'habit' ? 'e.g. Drink Water' : type === 'event' ? 'e.g. Dentist Appt' : type === 'log' ? 'e.g. Just had a great idea' : 'e.g. Lunch'} 
 className="bg-muted/50 border-border text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus-visible:ring-purple-500 h-12 rounded-xl" 
 />
 </div>
 
 {type === 'expense' && (
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground/80 dark:text-white/80 ml-1">Amount ($)</label>
 <Input 
 required 
 type="number"
 step="0.01"
 value={amount} 
 onChange={e => setAmount(e.target.value)} 
 placeholder="0.00" 
 className="bg-muted/50 border-border text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/30 focus-visible:ring-purple-500 h-12 rounded-xl" 
 />
 </div>
 )}

 <button type="submit" disabled={loading || !title.trim()} className="w-full h-12 mt-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 font-semibold flex items-center justify-center">
 {loading ? "Saving..." : `Create ${types.find(t => t.id === type)?.label}`}
 </button>
 </form>
 </DialogContent>
 </Dialog>
 );
}
