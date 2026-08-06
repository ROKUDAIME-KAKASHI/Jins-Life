require('dotenv').config();
const { streamText, tool } = require('ai');
const { google } = require('@ai-sdk/google');
const { z } = require('zod');

async function test() {
  const result = streamText({
    model: google('gemini-flash-latest'),
    maxSteps: 3,
    messages: [{ role: 'user', content: '/task drive check' }],
    tools: {
      createTask: tool({
        description: 'Create a new to-do task',
        parameters: z.object({
          title: z.string()
        }),
        execute: async (args) => {
          console.log("TOOL EXECUTED:", args);
          return { success: true, id: "123" };
        }
      })
    },
    system: "You are an assistant. ALWAYS reply with text after using a tool saying 'Added to the system!'"
  });

  for await (const chunk of result.fullStream) {
    if (chunk.type === 'text-delta') {
      process.stdout.write(chunk.textDelta);
    } else if (chunk.type === 'tool-call') {
      console.log("\nTOOL CALL:", chunk.toolName);
    } else if (chunk.type === 'tool-result') {
      console.log("\nTOOL RESULT:", chunk.result);
    } else if (chunk.type === 'error') {
      console.log("\nERROR:", chunk.error);
    }
  }
}

test().catch(console.error);
