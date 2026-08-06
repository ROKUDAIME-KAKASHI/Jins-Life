"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Save, Loader2, Volume2, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

import { cleanAndSaveTranscript } from "./actions";

interface TranscriptPart {
 speaker: number;
 text: string;
}

export function TranscriberClient() {
 const [isRecording, setIsRecording] = useState(false);
 const [transcriptParts, setTranscriptParts] = useState<TranscriptPart[]>([]);
 const [interimText, setInterimText] = useState("");
 const [isSaving, setIsSaving] = useState(false);
 const [statusMsg, setStatusMsg] = useState("Ready");
 const [recordingSeconds, setRecordingSeconds] = useState(0);
 const [selectedLanguage, setSelectedLanguage] = useState("en");

 const languages = [
   { code: "en", name: "English" },
   { code: "hi", name: "Hindi" },
   { code: "ta", name: "Tamil" },
   { code: "ml", name: "Malayalam" },
   { code: "kn", name: "Kannada" }
 ];

 const mediaRecorderRef = useRef<MediaRecorder | null>(null);
 const socketRef = useRef<WebSocket | null>(null);
 const timerRef = useRef<NodeJS.Timeout | null>(null);
 const router = useRouter();

 useEffect(() => {
 if (isRecording) {
 timerRef.current = setInterval(() => {
 setRecordingSeconds((prev) => prev + 1);
 }, 1000);
 } else {
 if (timerRef.current) clearInterval(timerRef.current);
 }
 return () => {
 if (timerRef.current) clearInterval(timerRef.current);
 };
 }, [isRecording]);

 const formatTime = (totalSeconds: number) => {
 const hrs = Math.floor(totalSeconds / 3600);
 const mins = Math.floor((totalSeconds % 3600) / 60);
 const secs = totalSeconds % 60;
 if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
 };

 // Helper to append final words to the correct speaker block
 const appendFinalWords = (words: any[]) => {
 setTranscriptParts((prev) => {
 const newParts = [...prev];
 
 words.forEach((w) => {
 const speaker = w.speaker || 0;
 const text = w.punctuated_word || w.word;
 
 // If the last part is from the same speaker, append to it
 if (newParts.length > 0 && newParts[newParts.length - 1].speaker === speaker) {
 newParts[newParts.length - 1].text += ` ${text}`;
 } else {
 // Otherwise, create a new speaker block
 newParts.push({ speaker, text: text });
 }
 });
 
 return newParts;
 });
 };

 const toggleRecording = async () => {
 if (isRecording) {
 // Stop Recording
 if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
 mediaRecorderRef.current.stop();
 mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
 }
 if (socketRef.current) {
 // Send empty blob to tell Deepgram we are done
 if (socketRef.current.readyState === WebSocket.OPEN) {
 socketRef.current.send(new Blob([]));
 }
 // Give it a second to finish processing before closing
 setTimeout(() => {
 socketRef.current?.close();
 }, 2000);
 }
 setIsRecording(false);
 setInterimText("");
 setStatusMsg("Stopped.");
 } else {
 // Start Recording
 setTranscriptParts([]);
 setInterimText("");
 setRecordingSeconds(0);
 setStatusMsg("Connecting to Deepgram...");
 
 try {
 const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
 
 const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
 if (!apiKey) {
 alert("Deepgram API Key not found in environment variables.");
 return;
 }

 // Automatically omit nova-2 if it's a regional language that Nova-2 might not support natively yet, falling back to Deepgram's best available model.
 const modelParam = (selectedLanguage === 'en' || selectedLanguage === 'hi') ? 'model=nova-2&' : '';
 const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?${modelParam}language=${selectedLanguage}&diarize=true&punctuate=true&interim_results=true`, [
   'token', apiKey
 ]);
 
 socketRef.current = socket;

 socket.onopen = () => {
 setStatusMsg("Listening (Live & Diarized)...");
 setIsRecording(true);
 
 const mediaRecorder = new MediaRecorder(stream);
 mediaRecorderRef.current = mediaRecorder;
 
 mediaRecorder.ondataavailable = (event) => {
 if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
 socket.send(event.data);
 }
 };
 
 mediaRecorder.start(250); // Send chunks every 250ms for extremely fast real-time
 };

 socket.onmessage = (message) => {
 const data = JSON.parse(message.data);
 
 if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
 const alternative = data.channel.alternatives[0];
 const transcript = alternative.transcript;
 
 if (data.is_final) {
 // Finalized chunk of text
 if (alternative.words && alternative.words.length > 0) {
 appendFinalWords(alternative.words);
 setInterimText(""); // Clear interim once final is committed
 }
 } else {
 // Interim / guessing text
 setInterimText(transcript);
 }
 }
 };

 socket.onclose = () => {
 setStatusMsg("Connection closed.");
 setIsRecording(false);
 };

 socket.onerror = (e) => {
 console.error("Deepgram WebSocket Error:", e);
 setStatusMsg("Error connecting to Deepgram.");
 setIsRecording(false);
 };

 } catch (e) {
 console.error(e);
 alert("Microphone access denied or error starting recording.");
 }
 }
 };

 const getFullRawTranscript = () => {
 return transcriptParts
 .map(part => `Speaker ${part.speaker}: ${part.text}`)
 .join('\n\n');
 };

 const processAndSaveNote = async () => {
 const fullTranscript = getFullRawTranscript();
 if (!fullTranscript.trim()) return;
 
 setIsSaving(true);
 setStatusMsg("Gemini is processing and formatting...");
 try {
 const result = await cleanAndSaveTranscript(fullTranscript);
 if (result.success) {
 setTranscriptParts([]);
 router.push('/notes');
 } else {
 alert("Failed to process transcript with Gemini.");
 }
 } catch (e) {
 console.error(e);
 alert("Error contacting Gemini.");
 } finally {
 setIsSaving(false);
 setStatusMsg("Ready");
 }
 };

 return (
 <div className="space-y-6">
 <Card className="bg-card border-black/10 shadow-sm ">
 <CardContent className="p-6">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
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
 {languages.map((lang) => (
 <option key={lang.code} value={lang.code}>{lang.name}</option>
 ))}
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
 
 {statusMsg !== "Ready" && !isRecording && (
 <div className="flex items-center gap-2 px-4 py-2 bg-black/5 rounded-xl border border-black/10">
 {isSaving && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
 <span className="text-sm font-medium text-muted-foreground">{statusMsg}</span>
 </div>
 )}
 </div>
 </CardContent>
 </Card>

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
 <div className="p-4 border-t border-border bg-black/5 dark:bg-black/20 flex justify-end gap-3">
 <button
 onClick={processAndSaveNote}
 disabled={isSaving}
 className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm disabled:opacity-50"
 >
 {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
 Process with Gemini & Save
 </button>
 </div>
 )}
 </Card>
 </div>
 );
}
