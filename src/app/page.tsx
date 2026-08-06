import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { 
 CheckSquare, FileText, Target, Repeat, DollarSign, BookOpen, FolderKanban,
 Calendar, Users, Activity, Library, Timer, ListChecks,
 Sun, BarChart, Plane, CreditCard, Archive, Bot, Sparkles, ArrowRight, Zap
} from "lucide-react";

const modules = [
 { title: "Today", desc: "Daily focus & timeline", icon: Sun, href: "/today", color: "from-amber-500 to-orange-500", glow: "" },
 { title: "Tasks", desc: "Action items & todos", icon: CheckSquare, href: "/tasks", color: "from-emerald-500 to-teal-500", glow: "" },
 { title: "Projects", desc: "Active initiatives", icon: FolderKanban, href: "/projects", color: "from-orange-500 to-amber-600", glow: "" },
 { title: "Goals", desc: "Milestones & target dates", icon: Target, href: "/goals", color: "from-rose-500 to-pink-600", glow: "" },
 { title: "Habits", desc: "Build consistent routines", icon: Repeat, href: "/habits", color: "from-purple-500 to-violet-600", glow: "" },
 { title: "Finances", desc: "Income & expense log", icon: DollarSign, href: "/finances", color: "from-green-500 to-emerald-600", glow: "" },
 { title: "Notes & Docs", desc: "Knowledge & research", icon: FileText, href: "/notes", color: "from-blue-500 to-cyan-600", glow: "" },
 { title: "Journal", desc: "Reflections & mood track", icon: BookOpen, href: "/journal", color: "from-pink-500 to-rose-500", glow: "" },
 { title: "Calendar", desc: "Schedule & timeblocks", icon: Calendar, href: "/calendar", color: "from-indigo-500 to-purple-600", glow: "" },
 { title: "CRM", desc: "People & connections", icon: Users, href: "/crm", color: "from-teal-500 to-cyan-500", glow: "" },
 { title: "Health", desc: "Sleep, water & metrics", icon: Activity, href: "/health", color: "from-red-500 to-rose-600", glow: "" },
 { title: "Media", desc: "Books, movies & podcasts", icon: Library, href: "/media", color: "from-violet-500 to-purple-600", glow: "" },
 { title: "Focus Timer", desc: "Pomodoro sessions", icon: Timer, href: "/focus", color: "from-amber-400 to-yellow-500", glow: "shadow-amber-400/20" },
 { title: "Routines", desc: "Checklists & habits", icon: ListChecks, href: "/routines", color: "from-cyan-500 to-blue-500", glow: "" },
 { title: "Reviews", desc: "Weekly reflection metrics", icon: BarChart, href: "/reviews", color: "from-sky-500 to-indigo-500", glow: "" },
 { title: "Trips", desc: "Travel itineraries", icon: Plane, href: "/trips", color: "from-fuchsia-500 to-pink-500", glow: "" },
];

export default async function Home() {
 const [taskCount, habitCount, goalCount, latestInsight] = await Promise.all([
 prisma.task.count({ where: { status: "TODO" } }),
 prisma.habit.count(),
 prisma.goal.count({ where: { status: "IN_PROGRESS" } }),
 prisma.proactiveInsight.findFirst({ orderBy: { createdAt: "desc" } }),
 ]);

 return (
 <div className="flex-1 space-y-8 p-8 max-w-[1600px] mx-auto relative z-10">
 {/* Top Banner / Hero */}
 <div className="relative overflow-hidden rounded-3xl bg-card dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-slate-900/40 border border-border p-8 shadow-sm ">
 <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
 <Sparkles className="w-48 h-48 text-indigo-500 dark:text-indigo-400" />
 </div>
 <div className="relative z-10 space-y-4 max-w-2xl">
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
 <Bot className="w-3.5 h-3.5" />
 Autonomous Loop System Active
 </div>
 <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground dark:text-white leading-tight">
 Welcome to <span className="bg-clip-text text-transparent bg-card dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400">Life OS</span>
 </h1>
 <p className="text-muted-foreground text-base leading-relaxed">
 Your personal operating system driven by intelligent feedback loops. Monitor goals, schedule tasks, and track routines in real-time.
 </p>
 </div>

 {/* Quick Stats Grid */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border">
 <div className="p-4 rounded-2xl bg-muted/50 border border-border ">
 <span className="text-xs text-muted-foreground uppercase font-semibold">Active Todos</span>
 <div className="text-3xl font-extrabold text-foreground dark:text-white mt-1">{taskCount}</div>
 </div>
 <div className="p-4 rounded-2xl bg-muted/50 border border-border ">
 <span className="text-xs text-muted-foreground uppercase font-semibold">Habits Tracked</span>
 <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{habitCount}</div>
 </div>
 <div className="p-4 rounded-2xl bg-muted/50 border border-border ">
 <span className="text-xs text-muted-foreground uppercase font-semibold">Goals In-Progress</span>
 <div className="text-3xl font-extrabold text-pink-600 dark:text-pink-400 mt-1">{goalCount}</div>
 </div>
 <div className="p-4 rounded-2xl bg-muted/50 border border-border ">
 <span className="text-xs text-muted-foreground uppercase font-semibold">Loop Health</span>
 <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
 99.8% <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
 </div>
 </div>
 </div>
 </div>

 {/* AI Autonomous Insight Card */}
 {latestInsight && (
 <Card className="bg-card dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-500/30 shadow-sm">
 <CardHeader className="flex flex-row items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-300">
 <Bot className="w-5 h-5 animate-pulse" />
 </div>
 <div>
 <CardTitle className="text-lg text-foreground dark:text-purple-200">Daily Agent Insight</CardTitle>
 <CardDescription className="text-xs">Generated by your background autonomous loop</CardDescription>
 </div>
 </CardHeader>
 <CardContent>
 <p className="text-sm text-foreground/80 dark:text-purple-100/80 leading-relaxed bg-black/5 dark:bg-black/20 p-4 rounded-xl border border-border">
 "{latestInsight.content}"
 </p>
 </CardContent>
 </Card>
 )}

 {/* Main Grid Modules */}
 <div>
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white flex items-center gap-2">
 Command Modules
 </h2>
 <span className="text-xs text-muted-foreground">16 Systems Operational</span>
 </div>

 <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
 {modules.map((mod) => (
 <Link href={mod.href} key={mod.title} className="group">
 <Card className="h-full bg-card/60 dark:bg-slate-900/40 hover:bg-black/5 dark:hover:bg-slate-800/60 border-border transition-all duration-300 group-hover:-translate-y-1 hover:shadow-sm relative overflow-hidden">
 <CardHeader className="pb-3">
 <div className="flex items-center justify-between">
 <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center shadow-sm ${mod.glow} group-hover:scale-110 transition-transform duration-300`}>
 <mod.icon className="h-5 w-5 text-white" />
 </div>
 <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
 </div>
 <CardTitle className="text-lg font-bold text-foreground dark:text-white mt-4">{mod.title}</CardTitle>
 <CardDescription className="text-xs text-muted-foreground line-clamp-2">{mod.desc}</CardDescription>
 </CardHeader>
 </Card>
 </Link>
 ))}
 </div>
 </div>
 </div>
 );
}
