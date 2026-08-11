import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
// @ts-nocheck
import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// This endpoint can be triggered by a cron job (e.g., every morning at 6 AM)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const authHeader = req.headers.get('authorization');
  
  // Example hardcoded credentials for the cron job: username "cron", password "loop-engine"
  // In production, use environment variables: process.env.CRON_USERNAME and process.env.CRON_PASSWORD
  const EXPECTED_USER = process.env.CRON_USERNAME || 'cron';
  const EXPECTED_PASS = process.env.CRON_PASSWORD || 'loop-engine';
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Cron"' },
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (username !== EXPECTED_USER || password !== EXPECTED_PASS) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  console.log("Starting Daily Planner Loop...");

  // Start the background autonomous agent loop
  const result = await generateText({
    model: google('gemini-2.5-flash'),
    system: `You are the LifeOS Background Autonomous Agent. 
    Your goal is to run the daily morning planner loop. 
    1. Observe the user's tasks and schedule. 
    2. Reschedule any overdue tasks from yesterday to today.
    3. Generate a quick daily summary and log it as a ProactiveInsight.
    Work autonomously and use your tools to accomplish this goal.`,
    prompt: 'Good morning! Please run the daily loop: observe my tasks, reschedule overdue ones, and leave a daily insight.',
    // @ts-ignore
    tools: {
      getTasks: tool({
        description: 'Get a list of the user\'s current tasks.',
        parameters: z.object({
          status: z.string().optional().describe('Filter by status: TODO, IN_PROGRESS, DONE. If omitted, returns all.'),
        }),
        execute: async (args) => {
          const { status } = args;
          const tasks = await prisma.task.findMany({
            where: status ? { status } : undefined,
            orderBy: { dueDate: 'asc' },
          });
          return tasks;
        },
      }),
      updateTask: tool({
        description: 'Update an existing task.',
        parameters: z.object({
          id: z.string().describe('The ID of the task to update'),
          dueDate: z.string().optional().describe('New ISO date string for due date'),
        }),
        execute: async (args) => {
          const { id, dueDate } = args;
          const task = await prisma.task.update({
            where: { userId,  id },
            data: {
              ...(dueDate && { dueDate: new Date(dueDate) }),
            }
          });
          return `Task ${task.id} updated.`;
        },
      }),
      logInsight: tool({
        description: 'Log a proactive insight or daily summary for the user to see when they wake up.',
        parameters: z.object({
          content: z.string().describe('The message or summary to leave for the user.'),
        }),
        execute: async (args) => {
          const { content } = args;
          const insight = await prisma.proactiveInsight.create({
            data: { userId, 
              content,
              date: new Date(),
            }
          });
          return `Insight logged with ID ${insight.id}`;
        },
      })
    },
    // @ts-ignore
    maxSteps: 5,
  });

  console.log("Daily Planner Loop finished. Final summary:", result.text);

  return NextResponse.json({ 
    success: true, 
    message: "Daily loop executed successfully.",
    summary: result.text
  });
}
