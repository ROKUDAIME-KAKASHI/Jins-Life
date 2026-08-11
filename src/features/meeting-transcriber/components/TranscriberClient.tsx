"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Save, Loader2, Volume2, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMeeting } from "../context/MeetingContext";
import { useCompletion } from "@ai-sdk/react";
import { saveFinalTranscript, getSavedTranscripts } from "../server/actions";
import Markdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function TranscriberClient() {
  const {
    isRecording,
    transcriptParts,
    interimText,
    recordingSeconds,
    statusMsg,
    selectedLanguage,
    setSelectedLanguage,
    toggleRecording,
    resetRecording
  } = useMeeting();

  const [template, setTemplate] = useState("MOM");
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedNotes, setShowSavedNotes] = useState(false);
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const router = useRouter();

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/meetings/process",
  });

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFullRawTranscript = () => {
    return transcriptParts
      .map(part => `Speaker ${part.speaker}: ${part.text}`)
      .join('\n\n');
  };

  const processAndSaveNote = async () => {
    const fullTranscript = getFullRawTranscript();
    if (!fullTranscript.trim()) return;
    
    // Instead of doing it synchronously and timing out on mobile, we stream it!
    const generatedDoc = await complete(fullTranscript, {
      body: { template }
    });
    
    if (generatedDoc) {
      setIsSaving(true);
      try {
        const result = await saveFinalTranscript(generatedDoc, template);
        if (result.success) {
          resetRecording();
          alert("Saved successfully to your notes!");
        } else {
          alert("Failed to save transcript.");
        }
      } catch (e) {
        console.error(e);
        alert("Error saving note.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('generated-doc');
    if (!element) return;
    const html2pdf = (await import('html2pdf.js')).default;
    const opt = {
      margin:       1,
      filename:     `${template}-${new Date().toISOString().slice(0,10)}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const openSavedNotes = async () => {
    setShowSavedNotes(true);
    setIsLoadingNotes(true);
    const result = await getSavedTranscripts();
    if (result.success) {
      setSavedNotes(result.notes);
    }
    setIsLoadingNotes(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-black/10 shadow-sm ">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                  isRecording 
                    ? 'bg-red-600 text-white' 
                    : 'bg-foreground text-background'
                }`}
              >
                {isRecording ? (
                  <><Square className="w-5 h-5 fill-current" /> Stop Recording</>
                ) : (
                  <><Mic className="w-5 h-5" /> Start Recording (Deepgram AI)</>
                )}
              </button>
              
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isRecording}
                className="bg-black/5 dark:bg-white/5 border border-border rounded-full px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="ml">Malayalam</option>
                <option value="kn">Kannada</option>
              </select>

              {isRecording && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-red-500 font-medium">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    Recording - {formatTime(recordingSeconds)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{statusMsg}</div>
                </div>
              )}
            </div>
            
            {statusMsg !== "Ready" && !isRecording && !isLoading && (
              <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-xl border border-black/10">
                <span className="text-sm font-medium text-muted-foreground">{statusMsg}</span>
              </div>
            )}
            
            <Button variant="outline" onClick={openSavedNotes} className="ml-auto rounded-full font-bold">
              View Saved Notes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Streaming Result View */}
      {completion && (
        <Card className="min-h-[200px] bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 shadow-sm relative overflow-hidden flex flex-col">
          <div className="p-4 border-b border-indigo-200 bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-between gap-2">
             <div className="flex items-center gap-2">
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : <Save className="w-5 h-5 text-indigo-600" />}
               <span className="font-bold text-indigo-900 dark:text-indigo-300">
                 {isLoading ? "Mistral is generating your document..." : "Generation Complete"}
               </span>
             </div>
             {!isLoading && (
               <Button onClick={handleExportPDF} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                 <Download className="w-4 h-4" /> Export PDF
               </Button>
             )}
          </div>
          <div id="generated-doc" className="p-6 overflow-y-auto prose prose-indigo max-w-none bg-white dark:bg-transparent">
            <Markdown>{completion}</Markdown>
          </div>
        </Card>
      )}

      {/* Raw Transcript View */}
      <Card className="min-h-[400px] bg-background border border-border shadow-sm relative overflow-hidden flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto">
          {transcriptParts.length === 0 && !interimText && !isRecording && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <Volume2 className="w-16 h-16 mb-4" />
              <p>Powered by Deepgram Nova-2.</p>
              <p className="text-sm mt-2 text-center max-w-sm">Hit start recording. Deepgram will instantly transcribe and identify each speaker in the room perfectly.</p>
            </div>
          )}
          
          <div className="space-y-6">
            {transcriptParts.map((part, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Speaker {part.speaker}
                </span>
                <p className="text-lg leading-relaxed text-foreground font-medium">{part.text}</p>
              </div>
            ))}
            
            {interimText && (
              <div className="flex flex-col gap-1 animate-pulse">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                  Listening...
                </span>
                <p className="text-lg leading-relaxed italic text-foreground/80">{interimText}</p>
              </div>
            )}
          </div>
        </div>
        
        {transcriptParts.length > 0 && !isRecording && (
          <div className="p-4 border-t border-border bg-black/5 dark:bg-black/20 flex flex-wrap items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Template:</span>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                disabled={isLoading || isSaving}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="MOM">Minutes of Meeting</option>
                <option value="Report">Report</option>
              </select>
            </div>
            
            <button
              onClick={processAndSaveNote}
              disabled={isLoading || isSaving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm disabled:opacity-50 transition-colors"
            >
              {(isLoading || isSaving) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isLoading ? 'Generating...' : isSaving ? 'Saving...' : 'Process with Mistral & Save'}
            </button>
          </div>
        )}
      </Card>

      <Dialog open={showSavedNotes} onOpenChange={setShowSavedNotes}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Saved Meetings & Reports</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {isLoadingNotes ? (
              <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
            ) : savedNotes.length === 0 ? (
              <p className="text-muted-foreground text-center p-8">No saved meeting notes found.</p>
            ) : (
              savedNotes.map((note) => (
                <Card key={note.id} className="p-4 border border-black/10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{note.title}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/notes/${note.id}`)}>
                      Open Full Note
                    </Button>
                  </div>
                  <div className="prose prose-sm max-w-none max-h-32 overflow-hidden relative">
                    <Markdown>{note.content}</Markdown>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-background to-transparent" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
