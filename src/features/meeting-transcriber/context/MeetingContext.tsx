"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

export interface TranscriptPart {
  speaker: number;
  text: string;
}

interface MeetingContextType {
  isRecording: boolean;
  transcriptParts: TranscriptPart[];
  interimText: string;
  recordingSeconds: number;
  statusMsg: string;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  captureSystemAudio: boolean;
  setCaptureSystemAudio: (val: boolean) => void;
  toggleRecording: () => Promise<void>;
  resetRecording: () => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export function MeetingProvider({ children }: { children: ReactNode }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptParts, setTranscriptParts] = useState<TranscriptPart[]>([]);
  const [interimText, setInterimText] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [statusMsg, setStatusMsg] = useState("Ready");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [captureSystemAudio, setCaptureSystemAudio] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null); // For iOS persistent audio

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

  const appendFinalWords = (words: any[]) => {
    setTranscriptParts((prev) => {
      const newParts = [...prev];
      words.forEach((w) => {
        const speaker = w.speaker || 0;
        const text = w.punctuated_word || w.word;
        if (newParts.length > 0 && newParts[newParts.length - 1].speaker === speaker) {
          newParts[newParts.length - 1].text += ` ${text}`;
        } else {
          newParts.push({ speaker, text: text });
        }
      });
      return newParts;
    });
  };

  const resetRecording = () => {
    setTranscriptParts([]);
    setInterimText("");
    setRecordingSeconds(0);
    setStatusMsg("Ready");
  };

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(new Blob([]));
        }
        setTimeout(() => {
          socketRef.current?.close();
        }, 2000);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      setIsRecording(false);
      setInterimText("");
      setStatusMsg("Stopped.");
    } else {
      setTranscriptParts([]);
      setInterimText("");
      setRecordingSeconds(0);
      setStatusMsg("Connecting to Deepgram...");
      
      try {
        let micPromise = navigator.mediaDevices.getUserMedia({ audio: true });
        let sysPromise = captureSystemAudio ? navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }) : Promise.resolve(null);
        
        const [stream, sysStream] = await Promise.all([
          micPromise.catch(e => null), 
          sysPromise.catch(e => null)
        ]);

        if (!stream) {
           throw new Error("Microphone access is required.");
        }

        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ac = new AudioContext();
        audioContextRef.current = ac;
        
        const mixer = ac.createGain();
        mixer.gain.value = 1;
        
        const source = ac.createMediaStreamSource(stream);
        source.connect(mixer);
        
        let sysSource: MediaStreamAudioSourceNode | null = null;
        
        if (sysStream && sysStream.getAudioTracks().length > 0) {
          const sysAudioStream = new MediaStream(sysStream.getAudioTracks());
          sysSource = ac.createMediaStreamSource(sysAudioStream);
          sysSource.connect(mixer);
        }

        const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
        if (!apiKey) {
          alert("Deepgram API Key not found in environment variables.");
          return;
        }

        // We rely on Deepgram's auto-detect for WebM/Opus since we send MediaRecorder chunks!
        const modelParam = (selectedLanguage === 'en' || selectedLanguage === 'hi') ? 'model=nova-2&' : '';
        const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?${modelParam}language=${selectedLanguage}&diarize=true&punctuate=true&interim_results=true&endpointing=300`, [
          'token', apiKey
        ]);
        
        socketRef.current = socket;

        socket.onopen = () => {
          setStatusMsg("Listening (WebM Opus Quality)...");
          setIsRecording(true);
          
          if (ac.state === 'suspended') {
            ac.resume();
          }
          
          const dest = ac.createMediaStreamDestination();
          mixer.connect(dest); // Mixer output goes securely to the destination stream ONLY!

          const mediaRecorder = new MediaRecorder(dest.stream);
          
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
              socket.send(e.data);
            }
          };
          
          mediaRecorder.start(250); // Send audio chunks every 250ms
          
          mediaRecorderRef.current = mediaRecorder;
          
          // Override stop to also clean up our tracks
          const originalStop = mediaRecorder.stop.bind(mediaRecorder);
          mediaRecorder.stop = () => {
            originalStop();
            source.disconnect();
            mixer.disconnect();
            dest.disconnect();
            if (sysSource) sysSource.disconnect();
            if (sysStream) sysStream.getTracks().forEach(t => t.stop());
            if (stream) stream.getTracks().forEach(t => t.stop());
          };
        };

        socket.onmessage = (message) => {
          const data = JSON.parse(message.data);
          if (data.channel && data.channel.alternatives && data.channel.alternatives[0]) {
            const alternative = data.channel.alternatives[0];
            const transcript = alternative.transcript;
            if (data.is_final) {
              if (alternative.words && alternative.words.length > 0) {
                appendFinalWords(alternative.words);
                setInterimText("");
              } else if (transcript && transcript.trim().length > 0) {
                // CRITICAL FALLBACK: If we spoke too fast and Deepgram didn't provide a words array, don't drop the sentence!
                appendFinalWords([{ speaker: 0, word: transcript }]);
                setInterimText("");
              }
            } else {
              setInterimText(transcript);
            }
          }
        };

        socket.onclose = (event) => {
          setStatusMsg(`Connection closed (Code: ${event.code}, Reason: ${event.reason || 'None'})`);
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

  return (
    <MeetingContext.Provider value={{
      isRecording,
      transcriptParts,
      interimText,
      recordingSeconds,
      statusMsg,
      selectedLanguage,
      setSelectedLanguage,
      captureSystemAudio,
      setCaptureSystemAudio,
      toggleRecording,
      resetRecording
    }}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error("useMeeting must be used within a MeetingProvider");
  }
  return context;
}
