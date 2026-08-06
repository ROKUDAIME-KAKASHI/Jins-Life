// @ts-nocheck
"use client";

import { useChat } from "@ai-sdk/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, X, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from 'next/navigation';

const SLASH_COMMANDS = [
 { cmd: "/task", desc: "Add a new to-do task" },
 { cmd: "/expense", desc: "Log a financial expense" },
 { cmd: "/note", desc: "Create a new note" },
 { cmd: "/journal", desc: "Log a journal entry" },
 { cmd: "/habit", desc: "Track a new habit" },
 { cmd: "/goal", desc: "Set a long-term goal" },
 { cmd: "/project", desc: "Start a new project" },
 { cmd: "/event", desc: "Schedule a calendar event" },
 { cmd: "/routine", desc: "Add a daily routine" },
 { cmd: "/focus", desc: "Log a focus session" },
 { cmd: "/health", desc: "Log a health metric" },
 { cmd: "/trip", desc: "Plan a trip" },
 { cmd: "/contact", desc: "Add a CRM contact" },
];

export function AIAssistantBubble() {
 const [isOpen, setIsOpen] = useState(false);
 const [input, setInput] = useState("");
 const [ratedMessages, setRatedMessages] = useState<Record<string, number>>({});
 const pathname = usePathname();
 
 // @ts-ignore
 const { messages, sendMessage, status, error } = useChat({
 api: '/api/chat',
 maxSteps: 5,
 body: { currentPath: pathname }
 });
 const msgs = messages as any[];
 
 const isLoading = status === 'submitted' || status === 'streaming';
 
 const bottomRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (isOpen) {
 setTimeout(() => {
 bottomRef.current?.scrollIntoView({ behavior: "smooth" });
 }, 100);
 }
 }, [messages, isOpen]);

 return (
 <div className="fixed bottom-[6.5rem] right-8 z-50 flex flex-col items-end">
 {isOpen && (
 <Card className="mb-4 w-[380px] h-[550px] flex flex-col overflow-hidden border-border bg-background/80 shadow-sm origin-bottom-right animate-in zoom-in-95 duration-200 !rounded-2xl">
 <div className="flex justify-between items-center p-4 border-b border-border bg-card dark:from-indigo-500/10 dark:to-purple-600/10">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center shadow-sm">
 <Bot className="w-4 h-4 text-white" />
 </div>
 <h3 className="font-bold text-foreground dark:text-white tracking-tight">Jarvis</h3>
 </div>
 <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground dark:text-white/40 dark:hover:text-white transition-colors bg-muted/50 hover:bg-black/10 dark:hover:bg-white/10 p-1.5 rounded-lg">
 <X className="w-4 h-4" />
 </button>
 </div>
 
 <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
 {msgs.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 text-sm text-center">
 <Sparkles className="w-10 h-10 opacity-30 text-indigo-400 mb-2" />
 <p>Try saying: "Remind me to buy groceries tomorrow"</p>
 <p>or "I spent ₹60 on lunch today"</p>
 </div>
 ) : null}
 
 {msgs.map((m: any) => {
 // Extract text content robustly across string content or parts array
 const textContent = (typeof m.content === 'string' && m.content.trim().length > 0)
 ? m.content
 : (Array.isArray(m.parts) 
 ? m.parts.filter((p: any) => p.type === 'text' || typeof p.text === 'string').map((p: any) => p.text || p.content || '').join('')
 : (typeof m.content === 'object' && m.content !== null ? JSON.stringify(m.content) : ''));
 
 const hasText = textContent && textContent.trim().length > 0;
 const hasTools = m.toolInvocations && m.toolInvocations.length > 0;
 
 // Skip rendering completely empty messages (e.g. intermediate tool states without content)
 if (!hasText && !hasTools) return null;

 return (
 <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
 {m.role === 'assistant' && (
 <div className="w-7 h-7 rounded-full bg-card flex items-center justify-center shrink-0 shadow-sm mt-0.5">
 <Bot className="w-3.5 h-3.5 text-white" />
 </div>
 )}
 <div className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-indigo-500 text-white rounded-tr-sm' : 'bg-muted/50 border border-border rounded-tl-sm text-foreground dark:text-white'}`}>
 
 {hasText && (
 <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
 {textContent}
 </p>
 )}
 
 {hasTools && (
 <div className={hasText ? "mt-2" : ""}>
 {m.toolInvocations.map((toolInfo: any) => (
 <div key={toolInfo.toolCallId} className="mt-1 text-[11px] bg-black/5 dark:bg-black/40 p-2 rounded-lg border border-border text-muted-foreground flex flex-col gap-1">
 <div>
 <span className="font-semibold text-purple-600 dark:text-purple-400">⚡ Action:</span> {toolInfo.toolName}
 {toolInfo.state === 'result' ? ' (Completed ✅)' : ' (Working...)'}
 </div>
 {toolInfo.state === 'result' && (
 <div className="text-[10px] text-foreground/70 dark:text-white/70 italic border-t border-border pt-1 mt-1">
 {typeof toolInfo.result === 'string' ? toolInfo.result : JSON.stringify(toolInfo.result)}
 </div>
 )}
 </div>
 ))}
 </div>
 )}

 {m.role === 'assistant' && (
 <div className="flex items-center justify-end gap-1 mt-2 pt-1 border-t border-border">
 <button
 onClick={async () => {
 setRatedMessages(prev => ({ ...prev, [m.id]: 1 }));
 await fetch('/api/chat/feedback', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ rating: 1 })
 });
 }}
 className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${ratedMessages[m.id] === 1 ? 'text-green-500 font-bold' : 'text-muted-foreground/60'}`}
 title="Good response"
 >
 <ThumbsUp className="w-3 h-3" />
 </button>
 <button
 onClick={async () => {
 setRatedMessages(prev => ({ ...prev, [m.id]: -1 }));
 await fetch('/api/chat/feedback', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ rating: -1 })
 });
 }}
 className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${ratedMessages[m.id] === -1 ? 'text-red-500 font-bold' : 'text-muted-foreground/60'}`}
 title="Poor response"
 >
 <ThumbsDown className="w-3 h-3" />
 </button>
 </div>
 )}
 </div>
 </div>
 );
 })}

 {isLoading && status !== 'streaming' && (
 <div className="flex gap-3 justify-start">
 <div className="w-7 h-7 rounded-full bg-card flex items-center justify-center shrink-0 shadow-sm mt-0.5 animate-pulse">
 <Bot className="w-3.5 h-3.5 text-white" />
 </div>
 <div className="px-3.5 py-3 rounded-2xl bg-muted/50 border border-border rounded-tl-sm flex items-center gap-1">
 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
 </div>
 </div>
 )}
 
 {error && (
 <div className="flex items-start gap-3 justify-start mt-4">
 <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 shadow-sm border border-red-500/20 mt-0.5">
 <Bot className="w-3.5 h-3.5 text-red-400" />
 </div>
 <div className="px-3.5 py-2.5 rounded-2xl max-w-[85%] shadow-sm bg-red-400/10 border border-red-400/20 text-red-400 rounded-tl-sm">
 <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
 {error.message || "Connection error. Please check your network and API key."}
 </p>
 </div>
 </div>
 )}
 <div ref={bottomRef} />
 </CardContent>
 
 <div className="p-3 border-t border-border bg-black/5 dark:bg-black/20 relative">
 {input.startsWith('/') && (
 <div className="absolute bottom-[100%] left-2 right-2 mb-2 bg-background border border-border rounded-xl shadow-sm max-h-48 overflow-y-auto z-20 flex flex-col p-1 animate-in slide-in-from-bottom-2">
 {SLASH_COMMANDS.filter(c => c.cmd.startsWith(input.split(' ')[0].toLowerCase())).map((cmd, i) => (
 <button
 key={i}
 onClick={() => setInput(cmd.cmd + ' ')}
 className="text-left px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm flex justify-between items-center"
 >
 <span className="font-bold text-indigo-500">{cmd.cmd}</span>
 <span className="text-xs text-muted-foreground">{cmd.desc}</span>
 </button>
 ))}
 {SLASH_COMMANDS.filter(c => c.cmd.startsWith(input.split(' ')[0].toLowerCase())).length === 0 && (
 <div className="px-3 py-2 text-xs text-muted-foreground text-center">No commands found.</div>
 )}
 </div>
 )}
 <div className="flex gap-2">
 <Input 
 value={input} 
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Tab' && input.startsWith('/')) {
 e.preventDefault();
 const match = SLASH_COMMANDS.find(c => c.cmd.startsWith(input.split(' ')[0].toLowerCase()));
 if (match) {
 setInput(match.cmd + ' ');
 }
 } else if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 if (!isLoading && input.trim()) {
 // @ts-ignore
 sendMessage({ role: 'user', content: input });
 setInput('');
 }
 }
 }}
 placeholder="Ask Jarvis..." 
 className="border-border bg-muted/50 h-11 text-sm focus-visible:ring-indigo-500 rounded-xl"
 disabled={isLoading}
 />
 <button 
 type="button" 
 onClick={(e) => {
 e.preventDefault();
 if (!isLoading && input.trim()) {
 // @ts-ignore
 sendMessage({ role: 'user', content: input });
 setInput('');
 }
 }}
 disabled={isLoading || !input?.trim()} 
 className="h-11 px-4 bg-foreground hover:bg-foreground/90 text-background shadow-sm transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
 >
 <Send className="w-4 h-4" />
 </button>
 </div>
 </div>
 </Card>
 )}

 <Button 
 onClick={() => setIsOpen(!isOpen)}
 className="w-14 h-14 rounded-full bg-background border border-border shadow-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all hover:scale-110 p-0 flex items-center justify-center group z-50"
 >
 {isOpen ? <X className="w-6 h-6 text-muted-foreground" /> : <Bot className="w-6 h-6 text-indigo-400 group-hover:text-purple-400 transition-colors" />}
 </Button>
 </div>
 );
}
