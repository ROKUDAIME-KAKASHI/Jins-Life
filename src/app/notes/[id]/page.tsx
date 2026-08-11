import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import Markdown from "react-markdown";
import { PdfExportButton } from "@/components/notes/PdfExportButton";

export default async function NoteViewPage({ params }: { params: Promise<{ id: string }> }) {
 const resolvedParams = await params;
 const note = await prisma.note.findUnique({
 where: { id: resolvedParams.id }
 });

 if (!note) {
 notFound();
 }

 return (
 <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8 relative z-10 bg-background text-foreground print:p-0 print:m-0 print:w-full print:max-w-none">
 <div className="flex items-center justify-between print:hidden">
 <Link href="/notes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
 <ArrowLeft className="w-4 h-4 mr-2" />
 Back to Notes
 </Link>
 <PdfExportButton />
 </div>

 <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden print:border-none print:shadow-none print:bg-transparent">
 <div className="p-4 md:p-8 border-b border-border bg-muted/50 flex flex-col md:flex-row justify-between items-start gap-4 print:bg-transparent print:p-0 print:border-none print:mb-8">
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
 <div className="print:hidden">
 <DeleteButton model="Note" id={note.id} path="/notes" />
 </div>
 </div>
 
 <div className="p-4 md:p-8 prose prose-base md:prose-lg dark:prose-invert max-w-none break-words">
 <Markdown>{note.content}</Markdown>
 </div>
 </div>
 </div>
 );
}
