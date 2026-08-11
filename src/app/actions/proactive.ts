"use server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function generateDailyInsight() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.proactiveInsight.findUnique({
    where: { date: today }
  });

  if (existing) {
    return existing;
  }

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [tasks, events, habits] = await Promise.all([
    prisma.task.findMany({ where: { userId,  status: "TODO" }, take: 10 }),
    prisma.event.findMany({ where: { userId,  startTime: { gte: today, lte: endOfDay } } }),
    prisma.habit.findMany({ where: { userId },  take: 5 }),
  ]);

  const prompt = `
    You are the LifeOS proactive AI. Generate a short, highly motivational, and personalized morning briefing (3-4 sentences max) for the user.
    Do not use generic greetings like "Good morning". Speak directly and elegantly about their day.
    
    Current Context:
    Tasks to do: ${tasks.map(t => t.title).join(', ') || 'No immediate tasks.'}
    Events today: ${events.map(e => e.title).join(', ') || 'Your schedule is clear today.'}
    Habits to maintain: ${habits.map(h => h.title).join(', ') || 'No habits set yet.'}
  `;

  try {
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      prompt: prompt,
    });

    const insight = await prisma.proactiveInsight.create({
      data: { userId, 
        date: today,
        content: text,
      }
    });

    revalidatePath('/today');
    return insight;
  } catch (error) {
    console.error("AI Generation failed:", error);
    return { error: "It seems your AI assistant is currently asleep. Could you kindly verify that your API key is correctly placed in the .env file?" };
  }
}
