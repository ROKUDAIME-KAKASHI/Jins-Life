"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function cleanAndSaveTranscript(rawTranscript: string) {
  try {
    // Use Gemini to clean up the transcript
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
      prompt: `Here is the raw diarized transcript from Deepgram:\n\n${rawTranscript}`
    });

    // Save to database
    await prisma.note.create({
      data: {
        title: `Meeting Transcript - ${new Date().toLocaleString()}`,
        content: cleanedTranscript,
        tags: "meeting, transcript, ai-cleaned",
      },
    });

    revalidatePath("/notes");
    return { success: true };
  } catch (error) {
    console.error("Failed to clean and save transcript:", error);
    return { success: false, error: "Failed to process transcript" };
  }
}
