"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteItem } from "@/app/actions/delete";

export function DeleteButton({ 
 model, 
 id, 
 path 
}: { 
 model: string; 
 id: string; 
 path: string; 
}) {
 const [isPending, startTransition] = useTransition();

 return (
 <button 
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 if (confirm("Are you sure?")) {
 startTransition(() => {
 deleteItem(model, id, path);
 });
 }
 }}
 disabled={isPending}
 className="p-2 text-slate-400 dark:text-red-500/70 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50 ml-auto"
 title="Delete"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 );
}
