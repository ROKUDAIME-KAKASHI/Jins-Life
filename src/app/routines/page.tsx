import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ListChecks } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addRoutines(formData: FormData) {
 "use server";
 const data: any = {};
 const title = formData.get("title") as string; if(title) data.title = title;
 const timeOfDay = formData.get("timeOfDay") as string; if(timeOfDay) data.timeOfDay = timeOfDay;
 
 if (Object.keys(data).length > 0) {
 await prisma.routine.create({ data });
 revalidatePath("/routines");
 }
}

export default async function RoutinesPage() {
 const items = await prisma.routine.findMany({ where: { userId }, 
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Routines
 </h1>
 <p className="text-muted-foreground mt-2">Manage your routines here.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addRoutines} className="flex flex-col md:flex-row gap-2">
 <input 
 name="title" 
 required
 type="text" 
 placeholder="Routine Name" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
 />
 <input 
 name="timeOfDay" 
 
 type="text" 
 placeholder="MORNING, EVENING, ANYTIME" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
 />
 <button 
 type="submit" 
 className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Routine
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {items.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <ListChecks className="w-12 h-12 mb-4 opacity-50" />
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
 <ListChecks className="w-4 h-4 text-orange-500" />
 {item.title}
 </span>
 <span className="text-xs font-normal bg-orange-500/20 text-orange-700 px-2 py-1 rounded-full">{item.timeOfDay}</span>
 </div>
 <DeleteButton model="Routine" id={item.id} path="/routines" />
 </CardTitle>
 </CardHeader>
 
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

