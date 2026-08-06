// @ts-nocheck
"use client";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User } from "lucide-react";

export function ChatInterface() {
 const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
 maxSteps: 5,
 });

 return (
 <Card className="flex flex-1 flex-col overflow-hidden h-[calc(100vh-140px)]">
 <ScrollArea className="flex-1 p-4">
 <div className="flex flex-col gap-4">
 {messages.length === 0 && (
 <div className="flex h-full items-center justify-center text-muted-foreground p-8">
 Hi! I'm your LifeOS Assistant. How can I help you today?
 </div>
 )}
 {messages.map((message) => (
 <div
 key={message.id}
 className={`flex gap-3 ${
 message.role === "assistant" ? "flex-row" : "flex-row-reverse"
 }`}
 >
 <div
 className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow ${
 message.role === "assistant"
 ? "bg-primary text-primary-foreground"
 : "bg-background"
 }`}
 >
 {message.role === "assistant" ? (
 <Bot className="h-4 w-4" />
 ) : (
 <User className="h-4 w-4" />
 )}
 </div>
 <div
 className={`flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-2 text-sm ${
 message.role === "assistant"
 ? "bg-muted"
 : "bg-primary text-primary-foreground"
 }`}
 >
 {message.content}
 </div>
 </div>
 ))}
 </div>
 </ScrollArea>
 <div className="border-t p-4 bg-background">
 <form onSubmit={handleSubmit} className="flex gap-2">
 <Input
 value={input || ""}
 onChange={handleInputChange}
 placeholder="Type your message..."
 className="flex-1"
 disabled={isLoading}
 />
 <Button type="submit" disabled={isLoading || !input?.trim()}>
 Send
 </Button>
 </form>
 </div>
 </Card>
 );
}
