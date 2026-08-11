import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";
import Link from "next/link";

async function addNotes(formData: FormData) {
 "use server";
 const data: any = {};
 const title = formData.get("title") as string; if(title) data.title = title;
 const tags = formData.get("tags") as string; if(tags) data.tags = tags;
 const content = formData.get("content") as string; if(content) data.content = content;
 
 if (Object.keys(data).length > 0) {
 await prisma.note.create({ data });
 revalidatePath("/notes");
 }
}

export default async function NotesPage() {
 const items = await prisma.note.findMany({ where: { userId }, 
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Notes
 </h1>
 <p className="text-muted-foreground mt-2">Manage your notes here.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addNotes} className="flex flex-col md:flex-row gap-2">
 <input 
 name="title" 
 required
 type="text" 
 
 placeholder="Note Title" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
 />
 <input 
 name="tags" 
 
 type="text" 
 
 placeholder="Tags (comma separated)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
 />
 <input 
 name="content" 
 
 type="text" 
 
 placeholder="Note Content" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
 />
 <button 
 type="submit" 
 className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Note
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {items.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <FileText className="w-12 h-12 mb-4 opacity-50" />
 <p>No records found. Add one above!</p>
 </CardContent>
 </Card>
 ) : (
 items.map((item: any) => (
 <Card key={item.id} className="hover:bg-muted/50 transition-colors bg-card border-black/10 shadow-sm">
 
 <CardHeader className="pb-2">
 <CardTitle className="text-lg flex items-center justify-between">
 <Link href={`/notes/${item.id}`} className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
 <FileText className="w-4 h-4 text-yellow-500" />
 <span className="line-clamp-1">{item.title}</span>
 </Link>
 <DeleteButton model="Note" id={item.id} path="/notes" />
 </CardTitle>
 <CardDescription>{item.tags}</CardDescription>
 </CardHeader>
 <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p></CardContent>
 
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

