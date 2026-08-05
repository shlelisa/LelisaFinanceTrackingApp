"use client";

import { useState, useEffect } from "react";
import { parseVoiceCommand, type ParsedVoiceCommand } from "@/lib/voiceParser";
import { saveStoredTransaction } from "@/lib/storage/localStorage";
import { Mic, MicOff, Check, X, Sparkles, AlertCircle } from "lucide-react";
import Money from "./Money";

interface VoiceTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function VoiceTransactionModal({ open, onClose, onSuccess }: VoiceTransactionModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState<ParsedVoiceCommand | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTranscript("");
      setParsed(null);
      setError("");
      startListening();
    } else {
      stopListening();
    }
  }, [open]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Web Speech API is not supported on this browser/device. You can type commands manually below.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setError("");
      };

      recognition.onresult = (event: any) => {
        const current = event.results[0][0].transcript;
        setTranscript(current);
        const result = parseVoiceCommand(current);
        setParsed(result);
      };

      recognition.onerror = (err: any) => {
        setIsListening(false);
        if (err.error !== "no-speech") {
          setError("Speech recognition failed: " + err.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e: any) {
      setError("Failed to start speech recognition.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const handleConfirmSave = () => {
    if (!parsed || !parsed.amount) {
      setError("No valid amount detected in voice command.");
      return;
    }

    try {
      saveStoredTransaction({
        type: parsed.type,
        amount: parsed.amount,
        currency: parsed.currency,
        category: parsed.category,
        description: parsed.description || "Voice Transaction",
        date: new Date().toISOString(),
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to save transaction.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-center">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <h3 className="font-bold text-foreground text-sm">Voice AI Assistant</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        {/* Pulse Microphone Button */}
        <div className="flex justify-center py-3">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative flex size-20 items-center justify-center rounded-full transition-transform active:scale-95 ${
              isListening
                ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                : "bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105"
            }`}
          >
            {isListening ? <Mic className="size-9 animate-bounce" /> : <MicOff className="size-9" />}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {isListening ? "Listening... Speak naturally (e.g. 'Spent 200 birr on lunch')" : "Tap microphone to speak command"}
        </p>

        {transcript && (
          <div className="rounded-xl bg-muted/60 p-3 text-xs italic text-foreground border">
            "{transcript}"
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-xs font-medium text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Parsed Result Preview */}
        {parsed && parsed.amount && (
          <div className="rounded-xl border bg-card p-4 text-left space-y-2 shadow-xs border-primary/30">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Detected Transaction
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground">{parsed.description}</span>
              <span className={`font-black text-sm ${parsed.type === "income" ? "text-emerald-600" : "text-destructive"}`}>
                {parsed.type === "income" ? "+" : "-"}
                <Money amount={parsed.amount} currency={parsed.currency} />
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-primary/10 text-primary px-2 py-0.5 font-semibold text-[10px]">
                {parsed.category}
              </span>
              <span className="text-[10px] uppercase font-bold">{parsed.type}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmSave}
            disabled={!parsed || !parsed.amount}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Check className="size-4" /> Save Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
