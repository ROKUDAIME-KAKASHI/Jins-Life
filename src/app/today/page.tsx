import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Calendar, Repeat, Sparkles } from "lucide-react";
import { InsightGenerator } from "./InsightGenerator";
import { BlurText } from "@/components/ui/blur-text";

export const metadata = {
  title: "Today | Life OS"
};

export default async function TodayPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8 text-white">Unauthorized. Please log in.</div>;
  const userId = session.user.id;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayEvents = await prisma.event.findMany({
    where: { userId,  startTime: { gte: startOfDay, lte: endOfDay } },
    orderBy: { startTime: 'asc' }
  });

  const routines = await prisma.routine.findMany({ where: { userId },  include: { steps: true } });
  const tasks = await prisma.task.findMany({ 
    where: { userId,  status: "TODO" },
    take: 5
  });

  const insight = await prisma.proactiveInsight.findUnique({
    where: { date_userId: { date: startOfDay, userId } }
  });

  const recentExpenses = await prisma.expense.findMany({ where: { userId }, 
    orderBy: { date: 'desc' },
    take: 4
  });

  const habits = await prisma.habit.findMany({ where: { userId }, 
    take: 4
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            <BlurText text="Good Morning." delay={0.1} />
          </h1>
          <p className="text-muted-foreground mt-2">Here is your daily snapshot.</p>
        </div>
      </div>

      <Card className="bg-card shadow-sm border border-border">
        <CardContent className="p-6">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-muted/50 rounded-xl text-indigo-400 shrink-0 border border-border">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground dark:text-white mb-2">Proactive AI Briefing</h3>
              {insight ? (
                <p className="text-muted-foreground leading-relaxed text-sm">{insight.content}</p>
              ) : (
                <InsightGenerator />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md"><Calendar className="w-5 h-5 text-indigo-500"/> Today's Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayEvents.length === 0 ? <p className="text-sm text-muted-foreground">Free schedule today!</p> : null}
            {todayEvents.map(e => (
              <div key={e.id} className="text-sm flex flex-col">
                <span className="font-medium text-foreground">{e.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span className="text-muted-foreground">{e.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-1 border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md"><CheckSquare className="w-5 h-5 text-green-500"/> Action Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length === 0 ? <p className="text-sm text-muted-foreground">All caught up!</p> : null}
            {tasks.map(t => (
              <div key={t.id} className="flex items-start gap-3 text-sm group cursor-pointer">
                <div className="w-5 h-5 rounded-md border-2 border-muted-foreground/30 mt-0.5 group-hover:border-green-500 transition-colors"></div>
                <span className="text-foreground">{t.title}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-1 border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md"><Repeat className="w-5 h-5 text-purple-500"/> Habits & Routines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {habits.map(h => (
              <div key={h.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">🔥</div>
                  <span className="font-medium">{h.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">{h.streak} day streak</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1 border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <span className="text-emerald-500 font-bold">₹</span> Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentExpenses.length === 0 ? <p className="text-sm text-muted-foreground">No recent expenses.</p> : null}
            {recentExpenses.map(e => (
              <div key={e.id} className="flex items-center justify-between text-sm p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex flex-col">
                  <span className="font-medium">{e.description || e.category}</span>
                  <span className="text-xs text-muted-foreground">{e.category}</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{e.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
