import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addCRM(formData: FormData) {
 "use server";
 const data: any = {};
 const name = formData.get("name") as string; if(name) data.name = name;
 const email = formData.get("email") as string; if(email) data.email = email;
 const notes = formData.get("notes") as string; if(notes) data.notes = notes;
 
 if (Object.keys(data).length > 0) {
 await prisma.contact.create({ data });
 revalidatePath("/crm");
 }
}

export default async function CRMPage() {
 const items = await prisma.contact.findMany({ where: { userId }, 
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 CRM
 </h1>
 <p className="text-muted-foreground mt-2">Manage your crm here.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addCRM} className="flex flex-col md:flex-row gap-2">
 <input 
 name="name" 
 required
 type="text" 
 
 placeholder="Contact Name" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
 />
 <input 
 name="email" 
 
 type="text" 
 
 placeholder="Email Address" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
 />
 <input 
 name="notes" 
 
 type="text" 
 
 placeholder="Notes" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
 />
 <button 
 type="submit" 
 className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add CRM
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {items.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <Users className="w-12 h-12 mb-4 opacity-50" />
 <p>No records found. Add one above!</p>
 </CardContent>
 </Card>
 ) : (
 items.map((item: any) => (
 <Card key={item.id} className="hover:bg-muted/50 transition-colors bg-card border-black/10 shadow-sm">
 
 <CardHeader className="pb-2">
 <CardTitle className="text-lg flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-blue-500" />
 {item.name}
 </div>
 <DeleteButton model="Contact" id={item.id} path="/crm" />
 </CardTitle>
 <CardDescription>{item.email}</CardDescription>
 </CardHeader>
 {item.notes && <CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent>}
 
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

