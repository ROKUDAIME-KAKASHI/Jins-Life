import { PrismaClient } from '@prisma/client';
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const prisma = new PrismaClient();

async function main() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log("Recent notes:", notes.map(n => ({ id: n.id, title: n.title })));
  
  // Find notes that look like raw transcripts
  const transcriptNotes = notes.filter(n => n.title.includes("Meeting") || n.tags?.includes("transcript"));
  
  for (const note of transcriptNotes) {
    if (note.content.includes("Minutes of the Meeting") || note.content.includes("Executive Summary")) {
      console.log(`Note ${note.id} already processed, skipping.`);
      continue;
    }
    
    console.log(`Processing note ${note.id}: ${note.title}...`);
    
    try {
      const { text: cleanedTranscript } = await generateText({
        model: google('gemini-flash-latest'),
        system: `You are an expert executive assistant. You will be given a raw, diarized meeting transcript (e.g. Speaker 0: ...).
Your job is to generate a professional Meeting Document with the following structure in Markdown:

# Executive Summary
(Write a cohesive paragraph summarizing the entire meeting.)

# Minutes of the Meeting
- **Key Decisions:** (List any decisions made)
- **Action Items:** (List tasks assigned and to whom, if any)
- **Key Discussion Points:** (Bullet points of main topics discussed)

# Full Transcript
(Provide the fully cleaned transcript. Fix obvious typos and add perfect punctuation. Keep the "Speaker X" tags perfectly intact. Do not change the original meaning.)`,
        prompt: `Here is the raw diarized transcript from Deepgram:\n\n${note.content}`
      });

      await prisma.note.update({
        where: { id: note.id },
        data: {
          content: cleanedTranscript,
          tags: (note.tags ? note.tags + ", " : "") + "processed"
        }
      });
      console.log(`Updated note ${note.id} successfully!`);
    } catch (e) {
      console.error(`Failed to process note ${note.id}:`, e);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
