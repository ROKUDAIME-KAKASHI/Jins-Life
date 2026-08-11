import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Target, Flag } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addGoal(formData: FormData) {
 "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

 const title = formData.get("title") as string;
 const description = formData.get("description") as string;
 const targetDateStr = formData.get("targetDate") as string;
 if (!title) return;
 await prisma.goal.create({ 
 data: { userId,  
 title, 
 description,
 targetDate: targetDateStr ? new Date(targetDateStr) : null,
 status: "IN_PROGRESS"
 } 
 });
 revalidatePath("/goals");
}

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8 text-white">Unauthorized. Please log in.</div>;
  const userId = session.user.id;

 const goals = await prisma.goal.findMany({ where: { userId }, 
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Goals
 </h1>
 <p className="text-muted-foreground mt-2">Your long-term objectives and milestones.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addGoal} className="flex flex-col md:flex-row gap-2">
 <input 
 name="title" 
 required 
 type="text" 
 placeholder="Goal title..." 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
 />
 <input 
 name="description" 
 type="text" 
 placeholder="Description (optional)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
 />
 <input 
 name="targetDate" 
 type="date" 
 className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
 />
 <button 
 type="submit" 
 className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Goal
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="space-y-4">
 {goals.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <Target className="w-12 h-12 mb-4 opacity-50" />
 <p>No goals defined yet. Create one above!</p>
 </CardContent>
 </Card>
 ) : (
 goals.map(goal => (
 <Card key={goal.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all bg-card dark:from-white/5 dark:to-black/5 border border-border shadow-sm group hover:shadow-sm">
 <CardHeader>
 <CardTitle className="text-xl flex items-center justify-between">
 <span className="flex items-center gap-2">
 <Target className="w-5 h-5 text-red-500" />
 {goal.title}
 </span>
 <div className="flex items-center gap-2">
 <span className={`text-xs font-normal px-2 py-1 rounded-full ${
 goal.status === 'ACHIEVED' ? 'bg-green-500/20 text-green-700' :
 goal.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-700' :
 'bg-slate-500/20 text-slate-700'
 }`}>
 {goal.status.replace('_', ' ')}
 </span>
 <DeleteButton model="Goal" id={goal.id} path="/goals" />
 </div>
 </CardTitle>
 {goal.description && (
 <CardDescription className="text-sm mt-2">{goal.description}</CardDescription>
 )}
 </CardHeader>
 <CardContent>
 <div className="flex items-center text-sm text-muted-foreground">
 <Flag className="w-4 h-4 mr-2" />
 Target Date: {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No date set'}
 </div>
 </CardContent>
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

