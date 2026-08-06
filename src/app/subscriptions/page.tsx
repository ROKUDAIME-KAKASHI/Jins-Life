import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { CreditCard } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addSubscriptions(formData: FormData) {
 "use server";
 const data: any = {};
 const name = formData.get("name") as string; if(name) data.name = name;
 const cost = parseFloat(formData.get("cost") as string); if(!isNaN(cost)) data.cost = cost;
 const cycle = formData.get("cycle") as string; if(cycle) data.cycle = cycle;
 
 if (Object.keys(data).length > 0) {
 await prisma.subscription.create({ data });
 revalidatePath("/subscriptions");
 }
}

export default async function SubscriptionsPage() {
 const items = await prisma.subscription.findMany({
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Subscriptions
 </h1>
 <p className="text-muted-foreground mt-2">Manage your subscriptions here.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addSubscriptions} className="flex flex-col md:flex-row gap-2">
 <input 
 name="name" 
 required
 type="text" 
 
 placeholder="Subscription Name" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/50"
 />
 <input 
 name="cost" 
 
 type="number" 
 step="0.01"
 placeholder="Cost" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/50"
 />
 <input 
 name="cycle" 
 
 type="text" 
 
 placeholder="Cycle (MONTHLY/YEARLY)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/50"
 />
 <button 
 type="submit" 
 className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Subscription
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {items.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <CreditCard className="w-12 h-12 mb-4 opacity-50" />
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
 <CreditCard className="w-4 h-4 text-green-500" />
 {item.name}
 </span>
 <span className="font-bold">₹{item.cost}</span>
 </div>
 <DeleteButton model="Subscription" id={item.id} path="/subscriptions" />
 </CardTitle>
 <CardDescription>{item.cycle}</CardDescription>
 </CardHeader>
 
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

