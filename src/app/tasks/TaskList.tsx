"use client";

import { useTransition } from "react";
import { toggleTask, deleteTask, addTask } from "./actions";
import { CheckSquare, Square, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TaskList({ tasks }: { tasks: any[] }) {
 const [isPending, startTransition] = useTransition();

 return (
 <div className="space-y-6">
 <form 
 action={(formData) => {
 startTransition(() => {
 addTask(formData);
 });
 }}
 className="flex gap-2"
 >
 <input 
 type="text" 
 name="title" 
 placeholder="What needs to be done?" 
 className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
 required
 />
 <Button type="submit" disabled={isPending} className="h-full px-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl">
 <Plus className="w-5 h-5 mr-2" />
 Add
 </Button>
 </form>

 <div className="space-y-2">
 {tasks.length === 0 ? (
 <p className="text-muted-foreground text-center py-8">No tasks found. Add one above!</p>
 ) : (
 tasks.map((task) => (
 <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border group hover:border-indigo-500/50 transition-all">
 <div 
 className="flex items-center gap-4 cursor-pointer flex-1"
 onClick={() => startTransition(() => toggleTask(task.id, task.status))}
 >
 {task.status === "DONE" ? (
 <CheckSquare className="w-6 h-6 text-green-500" />
 ) : (
 <Square className="w-6 h-6 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
 )}
 <span className={`text-lg transition-all ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
 {task.title}
 </span>
 </div>
 <button 
 onClick={() => startTransition(() => deleteTask(task.id))}
 disabled={isPending}
 className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
 >
 <Trash2 className="w-5 h-5" />
 </button>
 </div>
 ))
 )}
 </div>
 </div>
 );
}
