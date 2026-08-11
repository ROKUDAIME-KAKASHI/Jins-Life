import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Repeat, CheckCircle } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addHabit(formData: FormData) {
 "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

 const title = formData.get("title") as string;
 const frequency = formData.get("frequency") as string;
 if (!title) return;
 await prisma.habit.create({ data: { userId,  title, frequency, streak: 0 } });
 revalidatePath("/habits");
}

export default async function HabitsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8 text-white">Unauthorized. Please log in.</div>;
  const userId = session.user.id;

 const habits = await prisma.habit.findMany({ where: { userId }, 
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Habits
 </h1>
 <p className="text-muted-foreground mt-2">Track and build your daily routines.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addHabit} className="flex gap-2">
 <input 
 name="title" 
 required 
 type="text" 
 placeholder="What habit do you want to build?" 
 className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
 />
 <select name="frequency" className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50">
 <option value="DAILY">Daily</option>
 <option value="WEEKLY">Weekly</option>
 </select>
 <button 
 type="submit" 
 className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
 >
 Add Habit
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {habits.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <Repeat className="w-12 h-12 mb-4 opacity-50" />
 <p>No habits tracked yet. Create one above!</p>
 </CardContent>
 </Card>
 ) : (
 habits.map(habit => (
 <Card key={habit.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-all bg-card dark:from-white/5 dark:to-black/5 border border-border shadow-sm group hover:shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-lg flex items-center justify-between">
 <span className="flex items-center gap-2">
 <Repeat className="w-4 h-4 text-purple-500" />
 {habit.title}
 </span>
 <div className="flex items-center gap-2">
 <span className="text-xs font-normal bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
 {habit.frequency}
 </span>
 <DeleteButton model="Habit" id={habit.id} path="/habits" />
 </div>
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex justify-between items-center mt-4">
 <div className="text-sm">
 <span className="text-muted-foreground">Streak: </span>
 <span className="font-bold text-orange-500">{habit.streak} 🔥</span>
 </div>
 <button className="text-green-500 hover:text-green-600 transition-colors">
 <CheckCircle className="w-6 h-6" />
 </button>
 </div>
 </CardContent>
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

