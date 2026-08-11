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
        const captureSystem = window.confirm("To capture what OTHER people say (System Audio), you must share your screen or tab and ensure 'Share Audio' is checked.\\n\\nClick OK to capture system audio + mic, or Cancel to only record your microphone.");
        
        let micPromise = navigator.mediaDevices.getUserMedia({ audio: true });
        let sysPromise = captureSystem ? navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }) : Promise.resolve(null);
        
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
        
        const source = ac.createMediaStreamSource(stream);
        let sysSource: MediaStreamAudioSourceNode | null = null;
        
        if (sysStream && sysStream.getAudioTracks().length > 0) {
          const sysAudioStream = new MediaStream(sysStream.getAudioTracks());
          sysSource = ac.createMediaStreamSource(sysAudioStream);
        }

        const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
        if (!apiKey) {
          alert("Deepgram API Key not found in environment variables.");
          return;
        }

        const modelParam = (selectedLanguage === 'en' || selectedLanguage === 'hi') ? 'model=nova-2&' : '';
        const socket = new WebSocket(`wss://api.deepgram.com/v1/listen?\${modelParam}language=\${selectedLanguage}&diarize=true&punctuate=true&interim_results=true&endpointing=300&encoding=linear16&sample_rate=\${ac.sampleRate}`, [
          'token', apiKey
        ]);
        
        socketRef.current = socket;

        socket.onopen = () => {
          setStatusMsg("Listening (Raw PCM - Microsoft Word Quality)...");
          setIsRecording(true);
          
          if (ac.state === 'suspended') {
            ac.resume();
          }
          
          const processor = ac.createScriptProcessor(4096, 1, 1);
          
          // CRITICAL: Anchor the processor to window so Chrome doesn't kill it after 10s
          (window as any).__sharedAudioProcessor = processor;
          
          source.connect(processor);
          if (sysSource) sysSource.connect(processor);
          
          processor.connect(ac.destination);
          
          processor.onaudioprocess = (e) => {
            if (socket.readyState === WebSocket.OPEN) {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16Data = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              socket.send(int16Data.buffer);
            }
          };
          
          // Dummy MediaRecorder interface for the stop function
          (mediaRecorderRef as any).current = {
            state: 'recording',
            stop: () => {
              processor.disconnect();
              source.disconnect();
              if (sysSource) sysSource.disconnect();
              if (sysStream) sysStream.getTracks().forEach(t => t.stop());
              (window as any).__sharedAudioProcessor = null;
            },
            stream: stream
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
