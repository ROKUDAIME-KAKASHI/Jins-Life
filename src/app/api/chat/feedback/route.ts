import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const userId = session.user.id;

  try {
    const { messageId, rating, feedback } = await req.json();

    if (!rating || ![-1, 1].includes(rating)) {
      return NextResponse.json({ error: 'Rating must be 1 (positive) or -1 (negative)' }, { status: 400 });
    }

    if (messageId) {
      await prisma.chatMessage.update({
        where: { userId,  id: messageId },
        data: { rating, feedback: feedback || null },
      });
    }

    // Also log user feedback for overall system audit
    await prisma.log.create({
      data: { userId, 
        content: `User rating: ${rating === 1 ? '👍 Positive' : '👎 Negative'}${feedback ? ` - Feedback: "${feedback}"` : ''}`,
        source: 'USER_FEEDBACK',
      },
    });

    return NextResponse.json({ success: true, message: 'Feedback recorded' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record feedback' }, { status: 500 });
  }
}
