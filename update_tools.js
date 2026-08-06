const fs = require('fs');
const path = require('path');

const routePath = path.join(__dirname, 'src', 'app', 'api', 'chat', 'route.ts');
let code = fs.readFileSync(routePath, 'utf8');

const newTools = `
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
            const note = await prisma.note.create({ data: { title, content, tags: tags || '' } });
            return \`Note created with ID \${note.id}\`;
          } catch(e) { return "Error: " + e.message; }
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
            const journal = await prisma.journal.create({ data: { entry, mood: mood || '' } });
            return \`Journal entry logged with ID \${journal.id}\`;
          } catch(e) { return "Error: " + e.message; }
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
            const metric = await prisma.healthMetric.create({ data: { type, value, unit } });
            return \`Health metric logged with ID \${metric.id}\`;
          } catch(e) { return "Error: " + e.message; }
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
            const media = await prisma.mediaItem.create({ data: { title, type, status } });
            return \`Media item added with ID \${media.id}\`;
          } catch(e) { return "Error: " + e.message; }
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
            const sub = await prisma.subscription.create({ data: { name, cost, cycle } });
            return \`Subscription added with ID \${sub.id}\`;
          } catch(e) { return "Error: " + e.message; }
        },
      }),
`;

// Insert new tools
code = code.replace('createTask: tool({', newTools + '\n      createTask: tool({');

// Wrap existing executes in try/catch to prevent stream crashes
code = code.replace(/execute: async \(args\) => \{\s*const \{ (.*?) \} = args;\s*const (.*?) = await prisma\.(.*?)\.create\(\{\s*data: \{([\s\S]*?)\}\s*\}\);\s*return (.*?);\s*\}/g, 
  'execute: async (args) => { try { const { $1 } = args; const $2 = await prisma.$3.create({ data: {$4} }); return $5; } catch(e) { return "Error: " + e.message; } }');
  
code = code.replace(/execute: async \(args\) => \{\s*const \{ (.*?) \} = args;\s*const (.*?) = await prisma\.(.*?)\.update\(\{\s*where: \{([\s\S]*?)\},\s*data: \{([\s\S]*?)\}\s*\}\);\s*return (.*?);\s*\}/g, 
  'execute: async (args) => { try { const { $1 } = args; const $2 = await prisma.$3.update({ where: {$4}, data: {$5} }); return $6; } catch(e) { return "Error: " + e.message; } }');

fs.writeFileSync(routePath, code);
console.log('Tools updated successfully.');
