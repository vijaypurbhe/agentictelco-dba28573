import { useState, useRef, useCallback, useEffect } from "react";

const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;

interface UseVoiceInputOptions {
  silenceTimeout?: number;
  onAutoStop?: (transcript: string) => void;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { silenceTimeout = 1500, onAutoStop } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const onAutoStopRef = useRef(onAutoStop);
  const isTranscribingRef = useRef(false);
  onAutoStopRef.current = onAutoStop;

  const isSupported = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    clearSilenceTimer();
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    mediaRecorderRef.current = null;
  }, [clearSilenceTimer]);

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    if (isTranscribingRef.current) return;
    isTranscribingRef.current = true;
    setInterimTranscript("Transcribing...");

    try {
      // Convert to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const resp = await fetch(TRANSCRIBE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ audio: base64 }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Transcription failed (${resp.status})`);
      }

      const data = await resp.json();
      const text = (data.transcript || "").trim();

      if (text) {
        setTranscript(text);
        setInterimTranscript("");
        onAutoStopRef.current?.(text);
      } else {
        setInterimTranscript("");
      }
    } catch (e) {
      console.error("Transcription error:", e);
      setInterimTranscript("");
    } finally {
      isTranscribingRef.current = false;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analyser for silence detection
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Use a widely supported format
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 0) {
          transcribeAudio(audioBlob);
        }
        audioCtx.close();
      };

      mediaRecorder.start(250); // collect in 250ms chunks
      setIsListening(true);
      setTranscript("");
      setInterimTranscript("");

      // Silence detection via analyser
      let speechDetected = false;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkSilence = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;

        if (avg > 15) {
          // Speech detected
          speechDetected = true;
          setInterimTranscript("Listening...");
          clearSilenceTimer();
          silenceTimerRef.current = setTimeout(() => {
            // Silence after speech → stop and transcribe
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
              setIsListening(false);
              streamRef.current?.getTracks().forEach((t) => t.stop());
            }
          }, silenceTimeout);
        } else if (!speechDetected) {
          setInterimTranscript("Listening...");
        }

        animFrameRef.current = requestAnimationFrame(checkSilence);
      };

      animFrameRef.current = requestAnimationFrame(checkSilence);
    } catch (e) {
      console.error("Microphone access error:", e);
      setIsListening(false);
    }
  }, [isSupported, silenceTimeout, clearSilenceTimer, transcribeAudio]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsListening(false);
  }, [clearSilenceTimer]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
