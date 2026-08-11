// @ts-nocheck
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { streamText, tool, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const rawMessages = body.messages || [body];
  
  // Custom mapper to handle mismatch between @ai-sdk/react and ai v6
  const messages: any[] = [];
  
  rawMessages.forEach((m: any) => {
    if (m.role === 'user') {
      messages.push({ role: 'user', content: m.content || '' });
    } else if (m.role === 'assistant') {
      if (m.toolInvocations && m.toolInvocations.length > 0) {
        messages.push({
          role: 'assistant',
          content: m.content || '',
          toolCalls: m.toolInvocations.map((t: any) => ({
            type: 'tool-call',
            toolCallId: t.toolCallId,
            toolName: t.toolName,
            args: t.args
          }))
        });
      } else {
        messages.push({ role: 'assistant', content: m.content || '' });
      }
    } else if (m.role === 'tool') {
      messages.push({
        role: 'tool',
        content: m.content || (m.toolInvocations || []).map((t: any) => ({
          type: 'tool-result',
          toolCallId: t.toolCallId,
          toolName: t.toolName,
          result: t.result
        }))
      });
    } else {
      messages.push({ role: m.role, content: m.content || '' });
    }
  });

  const currentPath = body.currentPath || 'unknown';

  // Get current date & time in IST (India Standard Time)
  const now = new Date();
  const formattedDateTime = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  // Fetch quick snapshot of active state (pending tasks & active goals) for system context
  let stateContext = '';
  try {
    const [pendingTasksCount, activeGoals] = await Promise.all([
      prisma.task.count({ where: { userId,  status: 'TODO' } }),
      prisma.goal.findMany({ where: { userId },  take: 3, orderBy: { createdAt: 'desc' }, select: { title: true } }),
    ]);
    stateContext = `\n- Pending Tasks Count: ${pendingTasksCount}\n- Current Goals: ${activeGoals.map(g => g.title).join(', ') || 'None specified'}`;
  } catch (e) {
    // Non-blocking fallback
  }

  // Log and persist the user's latest message
  const lastUserMessage = messages.slice().reverse().find((m: any) => m.role === 'user');
  if (lastUserMessage) {
    // Fire-and-forget logging to avoid blocking the stream response time
    Promise.all([
      prisma.log.create({ data: { userId,  content: lastUserMessage.content, source: 'USER' } }),
      prisma.chatMessage.create({ data: { userId,  role: 'user', content: lastUserMessage.content, source: currentPath } })
    ]).catch(e => console.error("Error logging chat:", e));
  }

  const systemInstruction = `You are the LifeOS AI Assistant. Your job is to help the user organize, manage, and optimize their life.

TEMPORAL & REGIONAL CONTEXT:
- Current Date & Time: ${formattedDateTime} (India Standard Time)
- Currency: Indian Rupees (₹)
- Active App Page: "${currentPath}"
${stateContext}

BEHAVIOR RULES:
1. Always maintain a helpful, warm, concise, and executive tone.
2. If the user refers to "this page", "here", or asks for page-specific assistance, tailor your answer to the "${currentPath}" context.
3. Automatically call the appropriate tools whenever the user mentions adding, updating, or querying tasks, expenses, notes, routines, events, habits, or health metrics.
4. CRITICAL: After executing any tool call, you MUST provide a short, encouraging text confirmation like "Added it to the system!", "Got it, keep on working!", or "All set, what's next?". Never end a turn silently or with tool output alone.`;

  const result = streamText({
    model: google('gemini-flash-latest'),
    system: systemInstruction,
    messages: messages,
    // @ts-ignore
    tools: {
      
      createNote: tool({
        description: 'Create a new note',
        parameters: z.object({
          title: z.string().describe('Title of the note'),
          content: z.string().describe('Content of the note'),
          tags: z.string().optional().describe('Comma separated tags'),
        }),
        execute: async (args) => {
          try {
            const { title, content, tags } = args;
            const note = await prisma.note.create({ data: { userId,  title, content, tags: tags || '' } });
            return { success: true, message: `Note '${note.title}' created successfully`, id: note.id };
          } catch(e: any) { return { success: false, error: String(e.message) }; }
        },
      }),
      createJournalEntry: tool({
        description: 'Create a new journal entry',
        parameters: z.object({
          entry: z.string().describe('The journal text'),
          mood: z.string().optional().describe('Mood of the user'),
        }),
        execute: async (args) => {
          try {
            const { entry, mood } = args;
            const journal = await prisma.journal.create({ data: { userId,  entry, mood: mood || '' } });
            return { success: true, message: 'Journal entry logged', id: journal.id, mood: journal.mood };
          } catch(e: any) { return { success: false, error: String(e.message) }; }
        },
      }),
      logHealthMetric: tool({
        description: 'Log a health metric (weight, sleep, water, workout)',
        parameters: z.object({
          type: z.string().describe('Type of metric e.g. SLEEP, WEIGHT, WATER, WORKOUT'),
          value: z.number().describe('Numerical value'),
          unit: z.string().describe('Unit (hours, kg, liters, mins)'),
        }),
        execute: async (args) => {
          try {
            const { type, value, unit } = args;
            const metric = await prisma.healthMetric.create({ data: { userId,  type, value, unit } });
            return { success: true, message: `Health metric ${type} (${value} ${unit}) logged`, id: metric.id };
          } catch(e: any) { return { success: false, error: String(e.message) }; }
        },
      }),
      addMediaItem: tool({
        description: 'Add a book, movie, podcast, or article to consume',
        parameters: z.object({
          title: z.string(),
          type: z.string().describe('BOOK, MOVIE, ARTICLE, PODCAST'),
          status: z.string().describe('TO_CONSUME, IN_PROGRESS, COMPLETED'),
        }),
        execute: async (args) => {
          try {
            const { title, type, status } = args;
            const media = await prisma.mediaItem.create({ data: { userId,  title, type, status } });
            return { success: true, message: `Added ${type}: ${title}`, id: media.id };
          } catch(e: any) { return { success: false, error: String(e.message) }; }
        },
      }),
      addSubscription: tool({
        description: 'Add a recurring subscription',
        parameters: z.object({
          name: z.string(),
          cost: z.number(),
          cycle: z.string().describe('MONTHLY or YEARLY'),
        }),
        execute: async (args) => {
          try {
            const { name, cost, cycle } = args;
            const sub = await prisma.subscription.create({ data: { userId,  name, cost, cycle } });
            return { success: true, message: `Subscription ${name} (₹${cost}/${cycle}) added`, id: sub.id };
          } catch(e: any) { return { success: false, error: String(e.message) }; }
        },
      }),

      
      createContact: tool({
        description: 'Add a person/contact to CRM',
        parameters: z.object({
          name: z.string(),
          email: z.string().optional(),
          notes: z.string().optional(),
        }),
        execute: async (args) => { try { const { name, email, notes } = args; const item = await prisma.contact.create({ data: { userId,  name, email: email || '', notes: notes || '' } }); return { success: true, message: `Contact ${name} created`, id: item.id }; } catch(e: any) { return { success: false, error: String(e.message) }; } }
      }),
      createInventoryItem: tool({
        description: 'Add an item to the physical inventory/archive',
        parameters: z.object({
          name: z.string(),
          category: z.string(),
          value: z.number().optional().describe('Estimated value in Rupees'),
        }),
        execute: async (args) => { try { const { name, category, value } = args; const item = await prisma.inventoryItem.create({ data: { userId,  name, category, value: value || 0 } }); return { success: true, message: `Inventory item '${name}' added`, id: item.id }; } catch(e: any) { return { success: false, error: String(e.message) }; } }
      }),
      createProject: tool({
        description: 'Create a new project',
        parameters: z.object({
          title: z.string(),
          description: z.string().optional(),
        }),
        execute: async (args) => { try { const { title, description } = args; const item = await prisma.project.create({ data: { userId,  title, description: description || '' } }); return { success: true, message: `Project '${title}' created`, id: item.id }; } catch(e: any) { return { success: false, error: String(e.message) }; } }
      }),
      createTrip: tool({
        description: 'Plan a new trip or travel',
        parameters: z.object({
          destination: z.string(),
          startDate: z.string().describe('ISO date'),
          endDate: z.string().describe('ISO date'),
        }),
        execute: async (args) => { try { const { destination, startDate, endDate } = args; const item = await prisma.trip.create({ data: { userId,  destination, startDate: new Date(startDate), endDate: new Date(endDate) } }); return { success: true, message: `Trip to ${destination} scheduled`, id: item.id }; } catch(e: any) { return { success: false, error: String(e.message) }; } }
      }),
      createReview: tool({
        description: 'Log a weekly or monthly life review',
        parameters: z.object({
          type: z.string().describe('WEEKLY or MONTHLY'),
          summary: z.string(),
        }),
        execute: async (args) => { try { const { type, summary } = args; const item = await prisma.review.create({ data: { userId,  type, summary } }); return { success: true, message: `${type} review logged`, id: item.id }; } catch(e: any) { return { success: false, error: String(e.message) }; } }
      }),
      createRoutine: tool({
        description: 'Add a new daily/weekly routine',
        parameters: z.object({
          title: z.string(),
          timeOfDay: z.string().describe('MORNING, EVENING, or ANYTIME'),
        }),
        execute: async (args) => { try { const { title, timeOfDay } = args; const item = await prisma.routine.create({ data: { userId,  title, timeOfDay } }); return { success: true, message: `Routine '${title}' (${timeOfDay}) created`, id: item.id }; } catch(e: any) { return { success: false, error: String(e.message) }; } }
      }),
      createFocusSession: tool({
        description: 'Log a focus/deep-work session',
        parameters: z.object({
          duration: z.number().describe('Duration in minutes'),
          task: z.string().optional(),
        }),
        execute: async (args) => { try { const { duration, task } = args; const item = await prisma.focusSession.create({ data: { userId,  duration, task: task || '' } }); return { success: true, message: `${duration} minute focus session logged`, id: item.id }; } catch(e: any) { return { success: false, error: String(e.message) }; } }
      }),

      createTask: tool({
        description: 'Create a new to-do task',
        parameters: z.object({
          title: z.string().describe('The description of the task'),
          dueDate: z.string().optional().describe('ISO date string if a date/time is mentioned, else omit'),
        }),
        execute: async (args) => { try { const { title, dueDate } = args; const task = await prisma.task.create({ data: { userId, 
              title,
              dueDate: dueDate ? new Date(dueDate) : null,
            } }); return { success: true, message: `Task '${title}' created successfully`, id: task.id, dueDate: task.dueDate }; } catch(e: any) { return { success: false, error: String(e.message) }; } },
      }),
      createEvent: tool({
        description: 'Schedule a new calendar event',
        parameters: z.object({
          title: z.string().describe('The name of the event'),
          startTime: z.string().describe('ISO date string for when the event starts'),
          endTime: z.string().describe('ISO date string for when the event ends'),
        }),
        execute: async (args) => { try { const { title, startTime, endTime } = args; const event = await prisma.event.create({ data: { userId, 
              title,
              startTime: new Date(startTime),
              endTime: new Date(endTime),
            } }); return { success: true, message: `Event '${title}' scheduled`, id: event.id }; } catch(e: any) { return { success: false, error: String(e.message) }; } },
      }),
      logExpense: tool({
        description: 'Log a new financial expense',
        parameters: z.object({
          amount: z.number().describe('The numerical cost of the expense'),
          category: z.string().describe('Category like Food, Transport, Utilities, etc.'),
          description: z.string().optional().describe('What was bought specifically'),
        }),
        execute: async (args) => { try { const { amount, category, description } = args; const exp = await prisma.expense.create({ data: { userId,  amount, category, description, date: new Date() } }); return { success: true, message: `Expense of ₹${amount} (${category}) logged`, id: exp.id }; } catch(e: any) { return { success: false, error: String(e.message) }; } },
      }),
      getTasks: tool({
        description: 'Get a list of the user\'s current tasks. Use this to observe the environment before deciding what to update or reschedule.',
        parameters: z.object({
          status: z.string().optional().describe('Filter by status: TODO, IN_PROGRESS, DONE. If omitted, returns all.'),
        }),
        execute: async (args) => {
          const { status } = args;
          const tasks = await prisma.task.findMany({
            where: status ? { status } : undefined,
            orderBy: { dueDate: 'asc' },
          });
          return { success: true, tasksCount: tasks.length, tasks };
        },
      }),
      updateTask: tool({
        description: 'Update an existing task (e.g., to mark it DONE or reschedule its dueDate).',
        parameters: z.object({
          id: z.string().describe('The ID of the task to update'),
          status: z.string().optional().describe('New status: TODO, IN_PROGRESS, DONE'),
          dueDate: z.string().optional().describe('New ISO date string for due date'),
        }),
        execute: async (args) => { try { const { id, status, dueDate } = args; const task = await prisma.task.update({ where: { userId,  id }, data: {
              ...(status && { status }),
              ...(dueDate && { dueDate: new Date(dueDate) }),
            } }); return { success: true, message: `Task '${task.title}' updated`, status: task.status, dueDate: task.dueDate }; } catch(e: any) { return { success: false, error: String(e.message) }; } },
      }),
      getEvents: tool({
        description: 'Get a list of calendar events to observe the user\'s schedule.',
        parameters: z.object({
          upcomingOnly: z.boolean().optional().describe('If true, only fetch events from today onwards.'),
        }),
        execute: async (args) => {
          const { upcomingOnly } = args;
          const events = await prisma.event.findMany({
            where: upcomingOnly ? { startTime: { gte: new Date() } } : undefined,
            orderBy: { startTime: 'asc' },
          });
          return { success: true, eventsCount: events.length, events };
        },
      }),
      createHabit: tool({
        description: 'Create a new habit to track.',
        parameters: z.object({
          title: z.string().describe('The name of the habit'),
          frequency: z.string().describe('DAILY or WEEKLY'),
        }),
        execute: async (args) => { try { const { title, frequency } = args; const habit = await prisma.habit.create({ data: { userId,  title, frequency } }); return { success: true, message: `Habit '${title}' created`, id: habit.id }; } catch(e: any) { return { success: false, error: String(e.message) }; } },
      }),
      getHabits: tool({
        description: 'Get all habits.',
        parameters: z.object({}),
        execute: async () => {
          const habits = await prisma.habit.findMany({ where: { userId },  orderBy: { createdAt: 'desc' } });
          return { success: true, habitsCount: habits.length, habits };
        },
      }),
      createGoal: tool({
        description: 'Create a long-term goal.',
        parameters: z.object({
          title: z.string().describe('The name of the goal'),
          description: z.string().optional().describe('Details about the goal'),
          targetDate: z.string().optional().describe('ISO date string for when the goal should be achieved'),
        }),
        execute: async (args) => { try { const { title, description, targetDate } = args; const goal = await prisma.goal.create({ data: { userId,  title, description, targetDate: targetDate ? new Date(targetDate) : null } }); return { success: true, message: `Goal '${title}' created`, id: goal.id }; } catch(e: any) { return { success: false, error: String(e.message) }; } },
      }),
      getGoals: tool({
        description: 'Get all goals to observe long-term objectives.',
        parameters: z.object({}),
        execute: async () => {
          const goals = await prisma.goal.findMany({ where: { userId },  orderBy: { createdAt: 'desc' } });
          return { success: true, goalsCount: goals.length, goals };
        },
      })
    },
    // @ts-ignore
    maxSteps: 5,
    async onFinish({ text }) {
      if (text) {
        await prisma.log.create({
          data: { userId, 
            content: text,
            source: 'AI'
          }
        });
        try {
          await prisma.chatMessage.create({
            data: { userId, 
              role: 'assistant',
              content: text,
              source: currentPath,
            }
          });
        } catch (e) {}
      }
    }
  });

  return result.toTextStreamResponse();
}
