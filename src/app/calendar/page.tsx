import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { CalendarClient } from "./CalendarClient";

export default async function CalendarPage() {
 const events = await prisma.event.findMany({ where: { userId }, 
 orderBy: { startTime: 'asc' },
 });

 return (
 <div className="p-8 max-w-6xl mx-auto space-y-8 relative z-10">
 <div className="flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-black tracking-tight text-foreground capitalize">
 Calendar
 </h1>
 <p className="text-muted-foreground mt-2">Your interactive schedule and events.</p>
 </div>
 </div>
 
 <CalendarClient events={events} />
 </div>
 );
}

