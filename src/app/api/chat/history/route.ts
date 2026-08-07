import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth'; // assuming next-auth is used

export async function GET(req: Request) {
  try {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    // Reverse them so they are in chronological order
    const formatted = messages.reverse().map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
    }));
    
    return Response.json(formatted);
  } catch (e: any) {
    return Response.json([]);
  }
}
