import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import Markdown from "react-markdown";

export default async function NoteViewPage({ params }: { params: Promise<{ id: string }> }) {
 const resolvedParams = await params;
 const note = await prisma.note.findUnique({
 where: { id: resolvedParams.id }
 });

 if (!note) {
 notFound();
 }

 return (
 <div className="p-8 max-w-4xl mx-auto space-y-8 relative z-10">
 <Link href="/notes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
 <ArrowLeft className="w-4 h-4 mr-2" />
 Back to Notes
 </Link>

 <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
 <div className="p-8 border-b border-border bg-muted/50 flex justify-between items-start">
 <div className="space-y-4">
 <h1 className="text-3xl font-bold tracking-tight text-foreground">{note.title}</h1>
 <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
 <span className="flex items-center gap-1.5">
 <Calendar className="w-4 h-4" />
 {new Date(note.createdAt).toLocaleString()}
 </span>
 {note.tags && (
 <span className="flex items-center gap-1.5">
 <Tag className="w-4 h-4" />
 {note.tags}
 </span>
 )}
 </div>
 </div>
 <DeleteButton model="Note" id={note.id} path="/notes" />
 </div>
 
 <div className="p-8 prose prose-lg dark:prose-invert max-w-none">
 <Markdown>{note.content}</Markdown>
 </div>
 </div>
 </div>
 );
}
