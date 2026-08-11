import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { FolderKanban } from "lucide-react";
import { revalidatePath } from "next/cache";
import { DeleteButton } from "@/components/DeleteButton";

async function addProjects(formData: FormData) {
 "use server";
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

 const data: any = {};
 const title = formData.get("title") as string; if(title) data.title = title;
 const description = formData.get("description") as string; if(description) data.description = description;
 
 if (Object.keys(data).length > 0) {
 await prisma.project.create({ data });
 revalidatePath("/projects");
 }
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div className="p-8 text-white">Unauthorized. Please log in.</div>;
  const userId = session.user.id;

 const items = await prisma.project.findMany({ where: { userId }, 
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="p-8 max-w-5xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Projects
 </h1>
 <p className="text-muted-foreground mt-2">Manage your projects here.</p>
 </div>
 </div>

 <Card className="bg-card border border-border shadow-sm mb-8">
 <CardContent className="p-4 sm:p-6">
 <form action={addProjects} className="flex flex-col md:flex-row gap-2">
 <input 
 name="title" 
 required
 type="text" 
 
 placeholder="Project Title" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
 />
 <input 
 name="description" 
 
 type="text" 
 
 placeholder="Description" 
 className="md:flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
 />
 <button 
 type="submit" 
 className="bg-sky-500 hover:bg-sky-600 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shrink-0"
 >
 Add Project
 </button>
 </form>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
 {items.length === 0 ? (
 <Card className="bg-card border-black/10 shadow-sm col-span-3">
 <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
 <FolderKanban className="w-12 h-12 mb-4 opacity-50" />
 <p>No records found. Add one above!</p>
 </CardContent>
 </Card>
 ) : (
 items.map((item: any) => (
 <Card key={item.id} className="hover:bg-muted/50 transition-colors bg-card border-black/10 shadow-sm">
 
 <CardHeader className="pb-2">
 <CardTitle className="text-lg flex items-center justify-between">
 <span className="flex items-center gap-2">
 <FolderKanban className="w-4 h-4 text-sky-500" />
 {item.title}
 </span>
 <div className="flex items-center gap-2">
 <span className="text-xs font-normal bg-sky-500/20 text-sky-700 px-2 py-1 rounded-full">{item.status}</span>
 <DeleteButton model="Project" id={item.id} path="/projects" />
 </div>
 </CardTitle>
 </CardHeader>
 {item.description && <CardContent><p className="text-sm text-muted-foreground">{item.description}</p></CardContent>}
 
 </Card>
 ))
 )}
 </div>
 </div>
 );
}

