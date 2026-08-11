"use server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateText } from "ai";
import { mistral } from "@ai-sdk/mistral";

export async function cleanAndSaveTranscript(rawTranscript: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  try {
    // Use Mistral to clean up the transcript
    const { text: cleanedTranscript } = await generateText({
      model: mistral('mistral-large-latest'),
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
      data: { userId, 
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

export async function saveFinalTranscript(cleanedTranscript: string, template: string = "MOM") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  try {
    const titlePrefix = template === "Report" ? "Report" : "Minutes of Meeting";
    const note = await prisma.note.create({
      data: { userId, 
        title: `${titlePrefix} - ${new Date().toLocaleString()}`,
        content: cleanedTranscript,
        tags: "meeting, transcript, ai-processed",
      },
    });
    revalidatePath("/notes");
    return { success: true, id: note.id };
  } catch (error) {
    console.error("Failed to save final transcript:", error);
    return { success: false, error: "Failed to process transcript" };
  }
}

export async function getSavedTranscripts() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  try {
    const notes = await prisma.note.findMany({
      where: { userId, 
        tags: { contains: "meeting" }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, notes };
  } catch (error) {
    console.error("Failed to fetch transcripts:", error);
    return { success: false, notes: [] };
  }
}
