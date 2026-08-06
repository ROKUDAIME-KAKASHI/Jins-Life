// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

type Task = {
 id: string;
 title: string;
 status: string;
 priority: string;
 dueDate: string | null;
};

export function TaskList() {
 const [tasks, setTasks] = useState<Task[]>([]);
 const [newTaskTitle, setNewTaskTitle] = useState("");

 useEffect(() => {
 fetchTasks();
 }, []);

 const fetchTasks = async () => {
 const res = await fetch("/api/tasks");
 const data = await res.json();
 setTasks(data);
 };

 const addTask = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!newTaskTitle.trim()) return;

 const res = await fetch("/api/tasks", {
 method: "POST",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify({ title: newTaskTitle }),
 });

 if (res.ok) {
 setNewTaskTitle("");
 fetchTasks();
 }
 };

 const updateTask = async (id: string, updates: Partial<Task>) => {
 await fetch(`/api/tasks/${id}`, {
 method: "PATCH",
 headers: { "Content-Type": "application/json" },
 body: JSON.stringify(updates),
 });
 fetchTasks();
 };

 const deleteTask = async (id: string) => {
 await fetch(`/api/tasks/${id}`, { method: "DELETE" });
 fetchTasks();
 };

 return (
 <div className="space-y-4">
 <form onSubmit={addTask} className="flex gap-2">
 <Input
 placeholder="Add a new task..."
 value={newTaskTitle}
 onChange={(e) => setNewTaskTitle(e.target.value)}
 className="max-w-md"
 />
 <Button type="submit">Add Task</Button>
 </form>

 <div className="grid gap-4">
 {tasks.map((task) => (
 <Card key={task.id}>
 <CardContent className="flex items-center justify-between p-4">
 <div className="flex items-center gap-4">
 <input
 type="checkbox"
 checked={task.status === "DONE"}
 onChange={(e) =>
 updateTask(task.id, { status: e.target.checked ? "DONE" : "TODO" })
 }
 className="h-4 w-4"
 />
 <span className={task.status === "DONE" ? "line-through text-muted-foreground" : ""}>
 {task.title}
 </span>
 </div>
 <div className="flex items-center gap-2">
 <Select
 value={task.priority}
 onValueChange={(value) => updateTask(task.id, { priority: value })}
 >
 <SelectTrigger className="w-[100px]">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="LOW">Low</SelectItem>
 <SelectItem value="MEDIUM">Medium</SelectItem>
 <SelectItem value="HIGH">High</SelectItem>
 </SelectContent>
 </Select>
 <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
}
