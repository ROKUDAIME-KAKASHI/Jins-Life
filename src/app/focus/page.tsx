import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Timer } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addFocus(formData: FormData) {
 "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

 const data: any = {};
 const duration = parseInt(formData.get("duration") as string, 10); if(!isNaN(duration)) data.duration = duration;
 const task = formData.get("task") as string; if(task) data.task = task;
 
 if (Object.keys(data).length > 0) {
 await prisma.focusSession.create({ data });
 revalidatePath("/focus");
 }
}

export default async function FocusPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8 text-white">Unauthorized. Please log in.</div>;
  const userId = session.user.id;

 const items = await prisma.focusSession.findMany({ where: { userId }, 
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Focus
 </h1>
 <p className="text-muted-foreground mt-2">Manage your focus here.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addFocus} className="flex flex-col md:flex-row gap-2">
 <input 
 name="duration" 
 required
 type="number" 
 placeholder="Duration (minutes)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
 />
 <input 
 name="task" 
 
 type="text" 
 placeholder="What are you focusing on?" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
 />
 <button 
 type="submit" 
 className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Focu
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {items.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <Timer className="w-12 h-12 mb-4 opacity-50" />
 <p>No records found. Add one above!</p>
 </CardContent>
 </Card>
 ) : (
 items.map((item: any) => (
 <Card key={item.id} className="hover:bg-muted/50 transition-colors bg-card border-black/10 shadow-sm">
 
 <CardHeader className="pb-2">
 <CardTitle className="text-lg flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span className="flex items-center gap-2">
 <Timer className="w-4 h-4 text-rose-500" />
 {item.task || "Deep Work Session"}
 </span>
 <span className="font-bold">{item.duration}m</span>
 </div>
 <DeleteButton model="FocusSession" id={item.id} path="/focus" />
 </CardTitle>
 <CardDescription>{new Date(item.startTime).toLocaleString()}</CardDescription>
 </CardHeader>
 
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

