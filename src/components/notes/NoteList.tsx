"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

type Note = {
 id: string;
 title: string;
 content: string;
 tags: string;
};

export function NoteList() {
 const [notes, setNotes] = useState<Note[]>([]);
 const [activeNote, setActiveNote] = useState<Note | null>(null);

 useEffect(() => {
 fetchNotes();
 }, []);

 const fetchNotes = async () => {
 const res = await fetch("/api/notes");
 const data = await res.json();
 setNotes(data);
 };

 const createNote = async () => {
 const res = await fetch("/api/notes", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ title: "New Note", content: "" }),
 });
 if (res.ok) {
 const newNote = await res.json();
 setNotes([newNote, ...notes]);
 setActiveNote(newNote);
 }
 };

 const updateNote = async (id: string, updates: Partial<Note>) => {
 // Optimistic UI update
 setNotes(notes.map((n) => (n.id === id ? { ...n, ...updates } : n)));
 if (activeNote?.id === id) {
 setActiveNote({ ...activeNote, ...updates });
 }

 await fetch(`/api/notes/${id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(updates),
 });
 };

 const deleteNote = async (id: string) => {
 await fetch(`/api/notes/${id}`, { method: "DELETE" });
 if (activeNote?.id === id) setActiveNote(null);
 fetchNotes();
 };

 return (
 <div className="flex h-full gap-6">
 {/* Sidebar for Notes List */}
 <div className="w-1/3 flex flex-col gap-4 border-r pr-6">
 <Button onClick={createNote} className="w-full gap-2">
 <Plus className="h-4 w-4" /> New Note
 </Button>
 <div className="flex-1 overflow-auto space-y-2">
 {notes.map((note) => (
 <Card
 key={note.id}
 className={`cursor-pointer transition-colors hover:bg-muted ${
 activeNote?.id === note.id ? "bg-muted border-primary" : ""
 }`}
 onClick={() => setActiveNote(note)}
 >
 <CardContent className="p-3">
 <div className="font-semibold truncate">{note.title || "Untitled"}</div>
 <div className="text-sm text-muted-foreground truncate">
 {note.content || "No content"}
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>

 {/* Note Editor Area */}
 <div className="flex-1 flex flex-col gap-4">
 {activeNote ? (
 <>
 <div className="flex items-center gap-4">
 <Input
 value={activeNote.title}
 onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
 className="text-2xl font-bold border-none px-0 focus-visible:ring-0"
 placeholder="Note Title"
 />
 <Button variant="ghost" size="icon" onClick={() => deleteNote(activeNote.id)}>
 <Trash2 className="h-4 w-4 text-destructive" />
 </Button>
 </div>
 <Textarea
 value={activeNote.content}
 onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
 placeholder="Write your note here..."
 className="flex-1 resize-none border-none p-0 focus-visible:ring-0 text-base"
 />
 </>
 ) : (
 <div className="flex h-full items-center justify-center text-muted-foreground">
 Select or create a note to start writing
 </div>
 )}
 </div>
 </div>
 );
}
