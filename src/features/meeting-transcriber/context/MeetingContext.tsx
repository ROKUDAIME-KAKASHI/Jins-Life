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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // iOS/Android persistent background audio recording trick
        // Create an AudioContext to keep the browser alive
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioContextRef.current = new AudioContext();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const silentGain = audioContextRef.current.createGain();
            silentGain.gain.value = 0; // completely silent
            source.connect(silentGain);
            silentGain.connect(audioContextRef.current.destination);
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        }

        const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
        if (!apiKey) {
          alert("Deepgram API Key not found in environment variables.");
          return;
        }

        const modelParam = (selectedLanguage === 'en' || selectedLanguage === 'hi') ? 'model=nova-2&' : '';
        const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?${modelParam}language=${selectedLanguage}&diarize=true&smart_format=true&interim_results=true&endpointing=500&utterance_end_ms=1000`, [
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
          
          mediaRecorder.start(1000);
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
              }
            } else {
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

  return (
    <MeetingContext.Provider value={{
      isRecording,
      transcriptParts,
      interimText,
      recordingSeconds,
      statusMsg,
      selectedLanguage,
      setSelectedLanguage,
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
