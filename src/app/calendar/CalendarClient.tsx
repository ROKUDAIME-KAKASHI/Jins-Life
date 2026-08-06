"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { addEvent, deleteEvent } from "./actions";
import { DeleteButton } from "@/components/DeleteButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function CalendarClient({ events }: { events: any[] }) {
 const [currentDate, setCurrentDate] = useState(new Date());
 
 // Set default selected date string to today (handling local timezone offset)
 const today = new Date();
 const offset = today.getTimezoneOffset() * 60000;
 const localTodayStr = (new Date(today.getTime() - offset)).toISOString().slice(0, 10);
 
 const [selectedDateStr, setSelectedDateStr] = useState(localTodayStr);
 const [isDialogOpen, setIsDialogOpen] = useState(false);

 // Generate 42-day calendar matrix (6 weeks)
 const year = currentDate.getFullYear();
 const month = currentDate.getMonth();
 
 const firstDayOfMonth = new Date(year, month, 1).getDay();
 const daysInMonth = new Date(year, month + 1, 0).getDate();
 const daysInPrevMonth = new Date(year, month, 0).getDate();
 
 const calendarDays = [];
 
 // Previous month days
 for (let i = firstDayOfMonth - 1; i >= 0; i--) {
 calendarDays.push({
 date: new Date(year, month - 1, daysInPrevMonth - i),
 isCurrentMonth: false
 });
 }
 
 // Current month days
 for (let i = 1; i <= daysInMonth; i++) {
 calendarDays.push({
 date: new Date(year, month, i),
 isCurrentMonth: true
 });
 }
 
 // Next month days
 const remainingDays = 42 - calendarDays.length;
 for (let i = 1; i <= remainingDays; i++) {
 calendarDays.push({
 date: new Date(year, month + 1, i),
 isCurrentMonth: false
 });
 }

 const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
 const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
 const goToToday = () => setCurrentDate(new Date());

 const openAddEvent = (dateStr: string) => {
 setSelectedDateStr(dateStr);
 setIsDialogOpen(true);
 };

 return (
 <div className="flex flex-col h-[calc(100vh-8rem)]">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-4">
 <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
 <button 
 onClick={goToToday}
 className="px-4 py-1.5 ml-4 text-sm font-medium border border-border rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
 >
 Today
 </button>
 <div className="flex items-center gap-1">
 <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
 <ChevronLeft className="w-5 h-5" />
 </button>
 <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 <h2 className="text-2xl font-normal ml-2">
 {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
 </h2>
 </div>
 <button 
 onClick={() => openAddEvent(localTodayStr)}
 className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-sm hover:"
 >
 <Plus className="w-5 h-5" /> Create
 </button>
 </div>

 {/* Calendar Grid */}
 <Card className="flex-1 bg-background border border-border shadow-sm overflow-hidden flex flex-col rounded-xl">
 {/* Days of week header */}
 <div className="grid grid-cols-7 text-center border-b border-border text-xs font-bold py-3 text-slate-800 dark:text-slate-200 uppercase tracking-wider bg-muted/50">
 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
 </div>
 
 {/* Matrix */}
 <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-muted/50 gap-[1px]">
 {calendarDays.map((dayObj, idx) => {
 const localOffset = dayObj.date.getTimezoneOffset() * 60000;
 const dayStr = (new Date(dayObj.date.getTime() - localOffset)).toISOString().slice(0, 10);
 
 const isToday = dayStr === localTodayStr;
 const dayEvents = events.filter(e => {
 const eOffset = new Date(e.startTime).getTimezoneOffset() * 60000;
 return (new Date(new Date(e.startTime).getTime() - eOffset)).toISOString().slice(0, 10) === dayStr;
 });

 return (
 <div 
 key={idx} 
 onClick={() => openAddEvent(dayStr)}
 className={`p-1.5 group cursor-pointer transition-colors overflow-hidden flex flex-col ${
 isToday 
 ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-[1.5px] border-indigo-500' 
 : 'bg-background hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
 } ${!dayObj.isCurrentMonth && !isToday ? 'text-slate-400 dark:text-slate-500 bg-muted/20' : 'text-slate-900 dark:text-slate-100'}`}
 >
 <div className="flex justify-center mb-1">
 <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 !text-white shadow-sm' : 'group-hover:bg-black/5 dark:group-hover:bg-white/10'}`}>
 {dayObj.date.getDate()}
 </span>
 </div>
 
 <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar pb-1">
 {dayEvents.map(e => (
 <div 
 key={e.id} 
 onClick={(evt) => { evt.stopPropagation(); }}
 className="text-[11px] font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors flex items-center justify-between gap-1 group/event relative"
 title={e.title}
 >
 <div className="flex items-center gap-1 overflow-hidden">
 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
 <span className="truncate">{new Date(e.startTime).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} {e.title}</span>
 </div>
 <button 
 onClick={(evt) => {
 evt.stopPropagation();
 if (confirm("Delete event?")) {
 deleteEvent(e.id);
 }
 }}
 className="opacity-0 group-hover/event:opacity-100 hover:text-red-500 transition-opacity shrink-0 p-0.5"
 >
 <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
 </button>
 </div>
 ))}
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 {/* Add Event Dialog */}
 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>Add Event</DialogTitle>
 <DialogDescription>Create a new calendar event for {new Date(selectedDateStr).toLocaleDateString()}</DialogDescription>
 </DialogHeader>
 <form action={addEvent} className="flex flex-col gap-4 mt-4" onSubmit={() => setTimeout(() => setIsDialogOpen(false), 100)}>
 <input 
 name="title" 
 required 
 type="text" 
 placeholder="Event title (e.g. Doctor Appointment)" 
 className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
 autoFocus
 />
 <div className="grid grid-cols-2 gap-4">
 <input 
 name="date" 
 required
 type="date" 
 value={selectedDateStr}
 onChange={(e) => setSelectedDateStr(e.target.value)}
 className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
 />
 <input 
 name="time" 
 required
 type="time" 
 className="bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
 />
 </div>
 <button 
 type="submit" 
 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors mt-2"
 >
 Save Event
 </button>
 </form>
 </DialogContent>
 </Dialog>
 </div>
 );
}
