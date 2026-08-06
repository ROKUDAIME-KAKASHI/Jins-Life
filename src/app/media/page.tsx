import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Library } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addMedia(formData: FormData) {
 "use server";
 const data: any = {};
 const title = formData.get("title") as string; if(title) data.title = title;
 const type = formData.get("type") as string; if(type) data.type = type;
 const status = formData.get("status") as string; if(status) data.status = status;
 
 if (Object.keys(data).length > 0) {
 await prisma.mediaItem.create({ data });
 revalidatePath("/media");
 }
}

export default async function MediaPage() {
 const items = await prisma.mediaItem.findMany({
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Media
 </h1>
 <p className="text-muted-foreground mt-2">Manage your media here.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addMedia} className="flex flex-col md:flex-row gap-2">
 <input 
 name="title" 
 required
 type="text" 
 
 placeholder="Title" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
 />
 <input 
 name="type" 
 
 type="text" 
 
 placeholder="Type (e.g. BOOK, MOVIE)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
 />
 <input 
 name="status" 
 
 type="text" 
 
 placeholder="Status (e.g. TO_CONSUME)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
 />
 <button 
 type="submit" 
 className="bg-purple-500 hover:bg-purple-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Media
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {items.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <Library className="w-12 h-12 mb-4 opacity-50" />
 <p>No records found. Add one above!</p>
 </CardContent>
 </Card>
 ) : (
 items.map((item: any) => (
 <Card key={item.id} className="hover:bg-muted/50 transition-colors bg-card border-black/10 shadow-sm">
 
 <CardHeader className="pb-2">
 <CardTitle className="text-lg flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Library className="w-4 h-4 text-purple-500" />
 {item.title}
 </div>
 <DeleteButton model="MediaItem" id={item.id} path="/media" />
 </CardTitle>
 <CardDescription>{item.type} - {item.status.replace('_', ' ')}</CardDescription>
 </CardHeader>
 {item.notes && <CardContent><p className="text-sm text-muted-foreground">{item.notes}</p></CardContent>}
 
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

