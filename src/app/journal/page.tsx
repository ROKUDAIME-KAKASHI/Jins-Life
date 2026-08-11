import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { BookOpen } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addJournal(formData: FormData) {
 "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

 const data: any = {};
 const mood = formData.get("mood") as string; if(mood) data.mood = mood;
 const entry = formData.get("entry") as string; if(entry) data.entry = entry;
 
 if (Object.keys(data).length > 0) {
 await prisma.journal.create({ data });
 revalidatePath("/journal");
 }
}

export default async function JournalPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8 text-white">Unauthorized. Please log in.</div>;
  const userId = session.user.id;

 const items = await prisma.journal.findMany({ where: { userId }, 
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Journal
 </h1>
 <p className="text-muted-foreground mt-2">Manage your journal here.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addJournal} className="flex flex-col md:flex-row gap-2">
 <input 
 name="mood" 
 required
 type="text" 
 
 placeholder="Mood (e.g. Happy, Focused)" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
 />
 <input 
 name="entry" 
 
 type="text" 
 
 placeholder="Write your thoughts..." 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
 />
 <button 
 type="submit" 
 className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Journal
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {items.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <BookOpen className="w-12 h-12 mb-4 opacity-50" />
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
 <BookOpen className="w-4 h-4 text-indigo-500" />
 {new Date(item.date).toLocaleDateString()}
 </span>
 {item.mood && <span className="text-xs font-normal bg-indigo-500/20 text-indigo-700 px-2 py-1 rounded-full">{item.mood}</span>}
 </div>
 <DeleteButton model="Journal" id={item.id} path="/journal" />
 </CardTitle>
 </CardHeader>
 <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.entry}</p></CardContent>
 
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

