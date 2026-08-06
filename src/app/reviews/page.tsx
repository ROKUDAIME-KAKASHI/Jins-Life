import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { BarChart } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addReviews(formData: FormData) {
 "use server";
 const data: any = {};
 const type = formData.get("type") as string; if(type) data.type = type;
 const summary = formData.get("summary") as string; if(summary) data.summary = summary;
 
 if (Object.keys(data).length > 0) {
 await prisma.review.create({ data });
 revalidatePath("/reviews");
 }
}

export default async function ReviewsPage() {
 const items = await prisma.review.findMany({
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Reviews
 </h1>
 <p className="text-muted-foreground mt-2">Manage your reviews here.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addReviews} className="flex flex-col md:flex-row gap-2">
 <input 
 name="type" 
 required
 type="text" 
 
 placeholder="Type (WEEKLY/MONTHLY)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
 />
 <input 
 name="summary" 
 
 type="text" 
 
 placeholder="Summary of period" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
 />
 <button 
 type="submit" 
 className="bg-pink-500 hover:bg-pink-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Review
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {items.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <BarChart className="w-12 h-12 mb-4 opacity-50" />
 <p>No records found. Add one above!</p>
 </CardContent>
 </Card>
 ) : (
 items.map((item: any) => (
 <Card key={item.id} className="hover:bg-muted/50 transition-colors bg-card border-black/10 shadow-sm">
 
 <CardHeader className="pb-2">
 <CardTitle className="text-lg flex items-center justify-between">
 <div className="flex items-center gap-2">
 <BarChart className="w-4 h-4 text-pink-500" />
 {item.type} Review - {new Date(item.date).toLocaleDateString()}
 </div>
 <DeleteButton model="Review" id={item.id} path="/reviews" />
 </CardTitle>
 </CardHeader>
 {item.summary && <CardContent><p className="text-sm text-muted-foreground">{item.summary}</p></CardContent>}
 
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

