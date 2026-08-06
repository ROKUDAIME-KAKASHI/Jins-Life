const fs = require('fs');
const path = require('path');

const routePath = path.join(__dirname, 'src', 'app', 'api', 'chat', 'route.ts');
let code = fs.readFileSync(routePath, 'utf8');

const newTools = `
      createContact: tool({
        description: 'Add a person/contact to CRM',
        parameters: z.object({
          name: z.string(),
          email: z.string().optional(),
          notes: z.string().optional(),
        }),
        execute: async (args) => { try { const { name, email, notes } = args; const item = await prisma.contact.create({ data: { name, email: email || '', notes: notes || '' } }); return \`Contact added with ID \${item.id}\`; } catch(e) { return "Error: " + e.message; } }
      }),
      createInventoryItem: tool({
        description: 'Add an item to the physical inventory/archive',
        parameters: z.object({
          name: z.string(),
          category: z.string(),
          value: z.number().optional().describe('Estimated value in Rupees'),
        }),
        execute: async (args) => { try { const { name, category, value } = args; const item = await prisma.inventoryItem.create({ data: { name, category, value: value || 0 } }); return \`Inventory item added with ID \${item.id}\`; } catch(e) { return "Error: " + e.message; } }
      }),
      createProject: tool({
        description: 'Create a new project',
        parameters: z.object({
          title: z.string(),
          description: z.string().optional(),
        }),
        execute: async (args) => { try { const { title, description } = args; const item = await prisma.project.create({ data: { title, description: description || '' } }); return \`Project created with ID \${item.id}\`; } catch(e) { return "Error: " + e.message; } }
      }),
      createTrip: tool({
        description: 'Plan a new trip or travel',
        parameters: z.object({
          destination: z.string(),
          startDate: z.string().describe('ISO date'),
          endDate: z.string().describe('ISO date'),
        }),
        execute: async (args) => { try { const { destination, startDate, endDate } = args; const item = await prisma.trip.create({ data: { destination, startDate: new Date(startDate), endDate: new Date(endDate) } }); return \`Trip added with ID \${item.id}\`; } catch(e) { return "Error: " + e.message; } }
      }),
      createReview: tool({
        description: 'Log a weekly or monthly life review',
        parameters: z.object({
          type: z.string().describe('WEEKLY or MONTHLY'),
          summary: z.string(),
        }),
        execute: async (args) => { try { const { type, summary } = args; const item = await prisma.review.create({ data: { type, summary } }); return \`Review logged with ID \${item.id}\`; } catch(e) { return "Error: " + e.message; } }
      }),
      createRoutine: tool({
        description: 'Add a new daily/weekly routine',
        parameters: z.object({
          title: z.string(),
          timeOfDay: z.string().describe('MORNING, EVENING, or ANYTIME'),
        }),
        execute: async (args) => { try { const { title, timeOfDay } = args; const item = await prisma.routine.create({ data: { title, timeOfDay } }); return \`Routine added with ID \${item.id}\`; } catch(e) { return "Error: " + e.message; } }
      }),
      createFocusSession: tool({
        description: 'Log a focus/deep-work session',
        parameters: z.object({
          duration: z.number().describe('Duration in minutes'),
          task: z.string().optional(),
        }),
        execute: async (args) => { try { const { duration, task } = args; const item = await prisma.focusSession.create({ data: { duration, task: task || '' } }); return \`Focus session logged with ID \${item.id}\`; } catch(e) { return "Error: " + e.message; } }
      }),
`;

code = code.replace('createTask: tool({', newTools + '\n      createTask: tool({');

// Update system prompt to be extremely clear that Jarvis has access to all these tools
const newSystemPrompt = `You are Jarvis, the advanced AI Assistant for LifeOS. The user is currently viewing the "\${currentPath}" page. You have direct database access to EVERY module in the user's LifeOS. 

When the user asks you to add, log, or create something, you MUST use the appropriate tool. You support:
- Tasks, Events, Expenses, Habits, Goals
- Notes, Journals, Health Metrics, Media Items, Subscriptions
- CRM Contacts, Inventory Items, Projects, Trips, Reviews, Routines, and Focus Sessions.

CRITICAL INSTRUCTIONS:
1. NEVER tell the user you cannot do something if a tool exists for it.
2. If the user gives you partial information, infer the rest or use defaults rather than failing.
3. ALWAYS reply with a friendly, conversational confirmation message AFTER the tool executes (e.g. "I've added John to your CRM!"). Do NOT just leave a blank text bubble.
4. If a tool returns an error, apologize and explain what went wrong smoothly.`;

code = code.replace(/system: \`You are the LifeOS AI Assistant.*hang without a text reply.\`,/s, 'system: `' + newSystemPrompt + '`,');

fs.writeFileSync(routePath, code);
console.log('Final tools added successfully.');
