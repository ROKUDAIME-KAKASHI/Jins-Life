import { TranscriberClient } from "./TranscriberClient";

export default function MeetingsPage() {
 return (
 <div className="p-4 md:p-8 max-w-5xl mx-auto">
 <div className="mb-8">
 <h1 className="text-3xl font-bold tracking-tight">Meeting Transcriber</h1>
 <p className="text-muted-foreground mt-2">
 Record and transcribe your meetings in the background. Leave this tab open (even if minimized) while recording.
 </p>
 </div>

 <TranscriberClient />
 </div>
 );
}
