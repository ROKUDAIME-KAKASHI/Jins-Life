import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { TaskList } from "./TaskList";
import { revalidatePath } from "next/cache";

export default async function TasksPage() {
 const tasks = await prisma.task.findMany({
 orderBy: [
 { status: 'asc' }, // TODO before DONE
 { createdAt: 'desc' } // Newest first
 ]
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Tasks
 </h1>
 <p className="text-muted-foreground mt-2">Manage your tasks and to-dos here.</p>
 </div>
 </div>

 <Card className="bg-card dark:from-white/5 dark:to-black/5 border-border shadow-sm ">
 <CardHeader>
 <CardTitle>Action Items</CardTitle>
 </CardHeader>
 <CardContent>
 <TaskList tasks={tasks} />
 </CardContent>
 </Card>
 </div>
 );
}

