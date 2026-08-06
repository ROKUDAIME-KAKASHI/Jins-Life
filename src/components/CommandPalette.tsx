"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function CommandPalette() {
 const [open, setOpen] = useState(false);
 const [search, setSearch] = useState("");
 const router = useRouter();

 useEffect(() => {
 const down = (e: KeyboardEvent) => {
 if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
 e.preventDefault();
 setOpen((open) => !open);
 }
 };
 document.addEventListener("keydown", down);
 return () => document.removeEventListener("keydown", down);
 }, []);

 const routes = [
 { name: "Today", path: "/today" },
 { name: "Dashboard", path: "/" },
 { name: "AI Assistant", path: "/assistant" },
 { name: "Tasks", path: "/tasks" },
 { name: "Calendar", path: "/calendar" },
 { name: "Finances", path: "/finances" },
 { name: "Journal", path: "/journal" },
 { name: "Reviews", path: "/reviews" },
 { name: "Trips", path: "/trips" },
 { name: "Subscriptions", path: "/subscriptions" },
 { name: "Inventory", path: "/inventory" },
 { name: "CRM", path: "/crm" },
 { name: "Routines", path: "/routines" },
 { name: "Focus Timer", path: "/focus" },
 ];

 const filtered = routes.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

 const handleSelect = (path: string) => {
 setOpen(false);
 setSearch("");
 router.push(path);
 };

 return (
 <Dialog open={open} onOpenChange={setOpen}>
 <DialogContent className="p-0 overflow-hidden max-w-2xl bg-background border shadow-sm [&>button]:hidden">
 <DialogTitle className="sr-only">Command Palette</DialogTitle>
 <DialogDescription className="sr-only">Search modules in Life OS</DialogDescription>
 <div className="flex items-center px-4 py-3 border-b">
 <Input 
 className="border-0 shadow-none focus-visible:ring-0 text-lg px-0 h-12" 
 placeholder="Search modules... (e.g. 'Tasks')" 
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 autoFocus
 />
 </div>
 <div className="max-h-[300px] overflow-y-auto p-2">
 {filtered.length === 0 ? <p className="text-sm text-muted-foreground p-4 text-center">No results found.</p> : null}
 {filtered.map(r => (
 <button
 key={r.path}
 onClick={() => handleSelect(r.path)}
 className="w-full text-left px-4 py-3 rounded-md hover:bg-muted/50 text-sm font-medium transition-colors flex items-center justify-between"
 >
 {r.name}
 <span className="text-xs text-muted-foreground">{r.path}</span>
 </button>
 ))}
 </div>
 </DialogContent>
 </Dialog>
 );
}
