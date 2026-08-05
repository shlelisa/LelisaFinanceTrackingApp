"use client";

import { useState, useEffect } from "react";
import { getStoredPin, setStoredPin, removeStoredPin } from "@/lib/storage/localStorage";
import { Lock, Unlock, KeyRound, Check } from "lucide-react";

export default function PinLockModal({
  open,
  onClose,
  mode = "verify",
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  mode?: "setup" | "verify";
  onSuccess?: () => void;
}) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setPin("");
      setConfirmPin("");
      setError("");
      setIsSuccess(false);
    }
  }, [open]);

  if (!open) return null;

  const checkPin = (p: string) => {
    const stored = getStoredPin();
    if (stored && p === stored) {
      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 400);
    } else {
      setError("Incorrect PIN. Please try again.");
      setPin("");
    }
  };

  const handleDigit = (digit: string) => {
    setError("");
    if (mode === "setup" && pin.length === 4) {
      if (confirmPin.length < 4) setConfirmPin((prev) => prev + digit);
    } else {
      if (pin.length < 4) {
        const next = pin + digit;
        setPin(next);
        if (mode === "verify" && next.length === 4) {
          checkPin(next);
        }
      }
    }
  };

  const handleClear = () => {
    setError("");
    if (mode === "setup" && confirmPin.length > 0) {
      setConfirmPin((prev) => prev.slice(0, -1));
    } else {
      setPin((prev) => prev.slice(0, -1));
    }
  };

  const handleVerify = () => {
    checkPin(pin);
  };

  const handleSetupSave = () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match");
      setConfirmPin("");
      return;
    }
    setStoredPin(pin);
    setIsSuccess(true);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="w-full max-w-xs rounded-2xl border bg-card p-6 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isSuccess ? <Unlock className="size-6 text-emerald-500" /> : <Lock className="size-6" />}
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {mode === "setup" ? "Set 4-Digit Security PIN" : "Enter Security PIN"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {mode === "setup"
              ? pin.length < 4
                ? "Enter a 4-digit PIN"
                : "Confirm your 4-digit PIN"
              : "Enter your 4-digit PIN to unlock"}
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const currentStr = mode === "setup" && pin.length === 4 ? confirmPin : pin;
            const filled = currentStr.length > idx;
            return (
              <div
                key={idx}
                className={`size-4 rounded-full border-2 transition-all ${
                  filled ? "bg-primary border-primary scale-110" : "border-muted-foreground/30 bg-muted"
                }`}
              />
            );
          })}
        </div>

        {error && <p className="text-xs font-semibold text-destructive">{error}</p>}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-[200px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"].map((btn) => (
            <button
              key={btn}
              type="button"
              onClick={() => {
                if (btn === "C") handleClear();
                else if (btn === "OK") {
                  if (mode === "setup") handleSetupSave();
                  else handleVerify();
                } else handleDigit(btn);
              }}
              className="flex size-12 items-center justify-center rounded-full border bg-background font-bold text-base text-foreground shadow-xs transition-colors hover:bg-muted active:scale-95"
            >
              {btn}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground pt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
