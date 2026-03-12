import { useState, useRef, useCallback, useEffect } from "react";
import { blobToBase64, convertAudioBlobToWav, detectAudioFormat } from "@/lib/audio";

const TRANSCRIBE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`;
const MIN_AUDIO_SIZE_BYTES = 1024;
const RMS_SPEECH_THRESHOLD = 0.035;
const MIN_SPEECH_DURATION_MS = 500;
const MAX_RECORDING_MS = 15000;

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
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const onAutoStopRef = useRef(onAutoStop);
  const isTranscribingRef = useRef(false);
  const recordingMimeTypeRef = useRef("audio/webm");
  const lastSpeechAtRef = useRef<number | null>(null);
  onAutoStopRef.current = onAutoStop;

  const isSupported = typeof window !== "undefined"
    && typeof navigator !== "undefined"
    && !!navigator.mediaDevices?.getUserMedia
    && typeof MediaRecorder !== "undefined";

  const clearDetectionLoop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    analyserRef.current = null;
    lastSpeechAtRef.current = null;
  }, []);

  const releaseMediaResources = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearDetectionLoop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      releaseMediaResources();
    };
  }, [clearDetectionLoop, releaseMediaResources]);

  const transcribeAudio = useCallback(async (audioBlob: Blob, mimeType: string) => {
    if (isTranscribingRef.current) return;
    if (audioBlob.size < MIN_AUDIO_SIZE_BYTES) {
      setTranscript("");
      setInterimTranscript("");
      return;
    }

    isTranscribingRef.current = true;
    setInterimTranscript("Transcribing...");

    try {
      let payloadBlob = audioBlob;
      let format = detectAudioFormat(mimeType);

      if (format !== "wav") {
        try {
          payloadBlob = await convertAudioBlobToWav(audioBlob);
          format = "wav";
        } catch (conversionError) {
          console.warn("Audio conversion fallback:", conversionError);
        }
      }

      const base64 = await blobToBase64(payloadBlob);
      const resp = await fetch(TRANSCRIBE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          audio: base64,
          format,
          languageHint: navigator.language || "en-US",
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Transcription failed (${resp.status})`);
      }

      const data = await resp.json();
      const text = (data.transcript || "").trim();
      setTranscript(text);
      setInterimTranscript("");

      if (text) {
        onAutoStopRef.current?.(text);
      }
    } catch (e) {
      console.error("Transcription error:", e);
      setTranscript("");
      setInterimTranscript("");
    } finally {
      isTranscribingRef.current = false;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported || isListening || isTranscribingRef.current) return;

    clearDetectionLoop();
    releaseMediaResources();
    setTranscript("");
    setInterimTranscript("Listening...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.2;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
        .find((candidate) => MediaRecorder.isTypeSupported(candidate));
      const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordingMimeTypeRef.current = mimeType || mediaRecorder.mimeType || "audio/webm";
      audioChunksRef.current = [];
      lastSpeechAtRef.current = null;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        clearDetectionLoop();
        releaseMediaResources();
        mediaRecorderRef.current = null;
        setIsListening(false);
        setInterimTranscript("");
      };

      mediaRecorder.onstop = () => {
        const chunks = [...audioChunksRef.current];
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
        clearDetectionLoop();
        releaseMediaResources();

        const audioBlob = new Blob(chunks, { type: recordingMimeTypeRef.current });
        if (audioBlob.size >= MIN_AUDIO_SIZE_BYTES) {
          void transcribeAudio(audioBlob, recordingMimeTypeRef.current);
        } else {
          setTranscript("");
          setInterimTranscript("");
        }
      };

      mediaRecorder.start(250);
      setIsListening(true);

      let speechDetected = false;
      let firstSpeechAt: number | null = null;
      const startedAt = performance.now();
      const pcmData = new Uint8Array(analyser.fftSize);

      const stopRecording = () => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
        setIsListening(false);
      };

      const checkSilence = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteTimeDomainData(pcmData);
        let sumSquares = 0;

        for (let index = 0; index < pcmData.length; index += 1) {
          const normalized = (pcmData[index] - 128) / 128;
          sumSquares += normalized * normalized;
        }

        const rms = Math.sqrt(sumSquares / pcmData.length);
        const now = performance.now();

        if (rms >= RMS_SPEECH_THRESHOLD) {
          if (!speechDetected) firstSpeechAt = now;
          speechDetected = true;
          lastSpeechAtRef.current = now;
        } else if (speechDetected && lastSpeechAtRef.current && now - lastSpeechAtRef.current >= silenceTimeout) {
          // Only transcribe if speech lasted long enough
          const speechDuration = firstSpeechAt ? (lastSpeechAtRef.current - firstSpeechAt) : 0;
          if (speechDuration < MIN_SPEECH_DURATION_MS) {
            // Too short — discard
            if (mediaRecorderRef.current?.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            setIsListening(false);
            setTranscript("");
            setInterimTranscript("");
            return;
          }
          stopRecording();
          return;
        }

        if (now - startedAt >= MAX_RECORDING_MS) {
          stopRecording();
          return;
        }

        animFrameRef.current = requestAnimationFrame(checkSilence);
      };

      animFrameRef.current = requestAnimationFrame(checkSilence);
    } catch (e) {
      console.error("Microphone access error:", e);
      clearDetectionLoop();
      releaseMediaResources();
      mediaRecorderRef.current = null;
      setIsListening(false);
      setInterimTranscript("");
    }
  }, [clearDetectionLoop, isListening, isSupported, releaseMediaResources, silenceTimeout, transcribeAudio]);

  const stopListening = useCallback(() => {
    clearDetectionLoop();

    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    } else {
      releaseMediaResources();
      setInterimTranscript("");
    }

    setIsListening(false);
  }, [clearDetectionLoop, releaseMediaResources]);

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
