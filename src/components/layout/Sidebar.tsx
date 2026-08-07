"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
 CheckSquare, FileText, Home, 
 Target, Repeat, DollarSign, BookOpen, FolderKanban,
 Calendar, Users, Activity, Library, Timer, ListChecks,
 Sun, BarChart, Plane, CreditCard, Archive, PanelLeftClose, PanelLeftOpen, Zap, Mic, LogOut
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";

const navItems = [
 { name: "Dashboard", href: "/", icon: Home },
 { name: "Today", href: "/today", icon: Sun },
 { name: "Tasks", href: "/tasks", icon: CheckSquare },
 { name: "Calendar", href: "/calendar", icon: Calendar },
 { name: "Habits", href: "/habits", icon: Repeat },
 { name: "Goals", href: "/goals", icon: Target },
 { name: "Projects", href: "/projects", icon: FolderKanban },
 { name: "Meetings", href: "/meetings", icon: Mic },
 { name: "Finances", href: "/finances", icon: DollarSign },
 { name: "Notes", href: "/notes", icon: FileText },
 { name: "Journal", href: "/journal", icon: BookOpen },
 { name: "CRM", href: "/crm", icon: Users },
 { name: "Health", href: "/health", icon: Activity },
 { name: "Media", href: "/media", icon: Library },
 { name: "Focus Timer", href: "/focus", icon: Timer },
 { name: "Routines", href: "/routines", icon: ListChecks },
 { name: "Reviews", href: "/reviews", icon: BarChart },
 { name: "Trips", href: "/trips", icon: Plane },
];

export function Sidebar() {
 const [isCollapsed, setIsCollapsed] = useState(false);
 const [mobileOpen, setMobileOpen] = useState(false);
 const pathname = usePathname();

 return (
 <>
 {/* Mobile Overlay */}
 {mobileOpen && (
   <div 
     className="fixed inset-0 bg-black/50 z-30 md:hidden" 
     onClick={() => setMobileOpen(false)}
   />
 )}

 {/* Mobile Toggle Button */}
 <button
   onClick={() => setMobileOpen(true)}
   className="md:hidden fixed top-4 left-4 z-20 p-2 bg-background border border-border rounded-lg shadow-sm"
 >
   <Menu className="w-5 h-5" />
 </button>

 <div 
   className={`fixed md:relative flex h-full flex-col border-r border-border bg-background/95 backdrop-blur-sm md:bg-background/60 dark:bg-slate-950/95 md:dark:bg-slate-950/60 shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-40 transition-all duration-300 ease-in-out ${
     mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
   } ${
     isCollapsed && !mobileOpen ? 'md:w-20' : 'md:w-64'
   }`}
 >
 {/* Header */}
 <div className={`flex h-16 items-center border-b border-border px-4 ${isCollapsed && !mobileOpen ? 'justify-center' : 'justify-between'}`}>
 {(!isCollapsed || mobileOpen) && (
              <Link href="/" className="flex items-center gap-3 font-semibold group overflow-hidden">
                <div className="min-w-9 w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform border border-border">
                  <img src="/logo.jpg" alt="LifeOS Logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight text-foreground">
                    LifeOS
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase -mt-1">
                    Loop Edition
                  </span>
                </div>
              </Link>
 )}
 
 <div className="flex items-center gap-1">
 <ThemeToggle />
 <button 
 onClick={() => {
   if (window.innerWidth < 768) {
     setMobileOpen(false);
   } else {
     setIsCollapsed(!isCollapsed);
   }
 }} 
 className="text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center w-9 h-9"
 >
 <span className="hidden md:block">
   {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
 </span>
 <span className="md:hidden">
   <X className="w-5 h-5" />
 </span>
 </button>
 </div>
 </div>

 {/* Nav List */}
 <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
 {navItems.map((item) => {
 const isActive = pathname === item.href;
 return (
 <Link
 key={item.href}
 href={item.href}
 title={isCollapsed ? item.name : undefined}
 className={`flex items-center rounded-lg px-3.5 py-2.5 transition-all duration-200 overflow-hidden group relative ${
 isActive 
 ? 'bg-foreground/5 dark:bg-foreground/10 text-foreground font-semibold shadow-sm' 
 : 'text-slate-600 dark:text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
 } ${(isCollapsed && !mobileOpen) ? 'justify-center w-12 mx-auto' : 'gap-3 w-full'}`}
 >
 <item.icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground dark:group-hover:text-white'}`} />
 {(!isCollapsed || mobileOpen) && <span className="whitespace-nowrap text-sm truncate">{item.name}</span>}
 {isActive && (!isCollapsed || mobileOpen) && (
 <div className="absolute right-2 w-1.5 h-5 bg-foreground rounded-full shadow-sm"></div>
 )}
 </Link>
 );
 })}
 </div>

 {/* System Status Footer */}
 {(!isCollapsed || mobileOpen) && (
        <div className="p-4 border-t border-border bg-black/5 dark:bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <div className="text-xs">
              <div className="text-foreground dark:text-white font-medium">Loop Agent Online</div>
              <div className="text-muted-foreground text-[10px]">Autonomy Engine Active</div>
            </div>
          </div>
          <button 
            onClick={() => signOut()} 
            className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
       )}
 </div>
 </>
 );
}
