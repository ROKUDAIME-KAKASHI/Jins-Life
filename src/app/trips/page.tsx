import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Plane } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addTrips(formData: FormData) {
 "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

 const data: any = {};
 const destination = formData.get("destination") as string; if(destination) data.destination = destination;
 const startDate = formData.get("startDate") as string; if(startDate) data.startDate = new Date(startDate);
 const endDate = formData.get("endDate") as string; if(endDate) data.endDate = new Date(endDate);
 
 if (Object.keys(data).length > 0) {
 await prisma.trip.create({ data });
 revalidatePath("/trips");
 }
}

export default async function TripsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8 text-white">Unauthorized. Please log in.</div>;
  const userId = session.user.id;

 const items = await prisma.trip.findMany({ where: { userId }, 
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Trips
 </h1>
 <p className="text-muted-foreground mt-2">Manage your trips here.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addTrips} className="flex flex-col md:flex-row gap-2">
 <input 
 name="destination" 
 required
 type="text" 
 
 placeholder="Destination" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
 />
 <input 
 name="startDate" 
 
 type="date" 
 
 placeholder="Start Date" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
 />
 <input 
 name="endDate" 
 
 type="date" 
 
 placeholder="End Date" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
 />
 <button 
 type="submit" 
 className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Trip
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {items.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <Plane className="w-12 h-12 mb-4 opacity-50" />
 <p>No records found. Add one above!</p>
 </CardContent>
 </Card>
 ) : (
 items.map((item: any) => (
 <Card key={item.id} className="hover:bg-muted/50 transition-colors bg-card border-black/10 shadow-sm">
 
 <CardHeader className="pb-2">
 <CardTitle className="text-lg flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Plane className="w-4 h-4 text-teal-500" />
 {item.destination}
 </div>
 <DeleteButton model="Trip" id={item.id} path="/trips" />
 </CardTitle>
 <CardDescription>
 {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
 </CardDescription>
 </CardHeader>
 {item.notes && <CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent>}
 
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

