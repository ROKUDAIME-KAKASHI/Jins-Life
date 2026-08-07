import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { prompt, template } = await req.json();

  let systemPrompt = '';
  if (template === 'Report') {
    systemPrompt = `You are an expert executive assistant. You will be given a raw, diarized meeting transcript (e.g. Speaker 0: ...).
Your job is to generate a professional Report with the following structure in Markdown:

# Report Overview
(Write a cohesive paragraph summarizing the meeting topic and overall context.)

# Key Findings
- (List major findings or points discussed)
- (Another key finding)

# Conclusion & Next Steps
- (List steps or follow-ups)

# Full Transcript
(Provide the fully cleaned transcript. Fix obvious typos and add perfect punctuation. Keep the "Speaker X" tags perfectly intact. Do not change the original meaning.)`;
  } else {
    systemPrompt = `You are an expert executive assistant. You will be given a raw, diarized meeting transcript (e.g. Speaker 0: ...).
Your job is to generate a professional Meeting Document with the following structure in Markdown:

# Executive Summary
(Write a cohesive paragraph summarizing the entire meeting.)

# Minutes of the Meeting
- **Key Decisions:** (List any decisions made)
- **Action Items:** (List tasks assigned and to whom, if any)
- **Key Discussion Points:** (Bullet points of main topics discussed)

# Full Transcript
(Provide the fully cleaned transcript. Fix obvious typos and add perfect punctuation. Keep the "Speaker X" tags perfectly intact. Do not change the original meaning.)`;
  }

  const result = await streamText({
    model: google('gemini-1.5-pro'),
    system: systemPrompt,
    prompt: `Here is the raw diarized transcript from Deepgram:\n\n${prompt}`,
  });

  return result.toTextStreamResponse();
}
