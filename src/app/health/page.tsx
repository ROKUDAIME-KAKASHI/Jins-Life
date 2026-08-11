import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Activity } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addHealth(formData: FormData) {
 "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

 const data: any = {};
 const type = formData.get("type") as string; if(type) data.type = type;
 const value = parseFloat(formData.get("value") as string); if(!isNaN(value)) data.value = value;
 const unit = formData.get("unit") as string; if(unit) data.unit = unit;
 
 if (Object.keys(data).length > 0) {
 await prisma.healthMetric.create({ data });
 revalidatePath("/health");
 }
}

export default async function HealthPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8 text-white">Unauthorized. Please log in.</div>;
  const userId = session.user.id;

 const items = await prisma.healthMetric.findMany({ where: { userId }, 
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Health
 </h1>
 <p className="text-muted-foreground mt-2">Manage your health here.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addHealth} className="flex flex-col md:flex-row gap-2">
 <input 
 name="type" 
 required
 type="text" 
 
 placeholder="Type (e.g. WEIGHT, SLEEP)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
 />
 <input 
 name="value" 
 
 type="number" 
 step="0.01"
 placeholder="Value" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
 />
 <input 
 name="unit" 
 
 type="text" 
 
 placeholder="Unit (e.g. kg, hours)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
 />
 <button 
 type="submit" 
 className="bg-rose-500 hover:bg-rose-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Health
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {items.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <Activity className="w-12 h-12 mb-4 opacity-50" />
 <p>No records found. Add one above!</p>
 </CardContent>
 </Card>
 ) : (
 items.map((item: any) => (
 <Card key={item.id} className="hover:bg-muted/50 transition-colors bg-card border-black/10 shadow-sm">
 
 <CardHeader className="pb-2">
 <CardTitle className="text-lg flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Activity className="w-4 h-4 text-rose-500" />
 {item.type}
 </div>
 <DeleteButton model="HealthMetric" id={item.id} path="/health" />
 </CardTitle>
 <CardDescription>{item.value} {item.unit}</CardDescription>
 </CardHeader>
 {item.notes && <CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent>}
 
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

