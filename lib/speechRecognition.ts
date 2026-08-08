/**
 * Cross-platform Speech Recognition wrapper.
 * Uses the native Capacitor speech-recognition plugin on Android/iOS
 * and falls back to the Web Speech API in browsers.
 */

export interface SpeechRecognitionResult {
  transcript: string;
}

export interface SpeechOptions {
  language?: string;
  onStart?: () => void;
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

let nativeSpeech: any = null;
let nativeListeners: any[] = [];

function getNativeSpeech(): any {
  if (typeof window === "undefined") return null;
  if (nativeSpeech) return nativeSpeech;
  try {
    const cap = (window as any)?.Capacitor;
    if (cap?.isNativePlatform && cap.isNativePlatform()) {
      const plugin = (window as any)?.Capacitor?.Plugins?.SpeechRecognition;
      if (plugin) nativeSpeech = plugin;
    }
  } catch {
    nativeSpeech = null;
  }
  return nativeSpeech;
}

export function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (getNativeSpeech()) return true;
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  return !!SpeechRecognition;
}

export async function requestSpeechPermission(): Promise<boolean> {
  const plugin = getNativeSpeech();
  if (!plugin) return true; // Web API handled via start()

  try {
    const status = await plugin.checkPermissions();
    if (status?.speechRecognition === "granted") return true;
    const result = await plugin.requestPermissions();
    return result?.speechRecognition === "granted";
  } catch {
    return false;
  }
}

export function startSpeechRecognition(options: SpeechOptions = {}): void {
  const plugin = getNativeSpeech();
  if (plugin) {
    startNative(plugin, options);
  } else {
    startWeb(options);
  }
}

export function stopSpeechRecognition(): void {
  const plugin = getNativeSpeech();
  if (plugin) {
    try {
      plugin.stop();
    } catch {
      // ignore
    }
  } else {
    stopWeb();
  }
}

// --- Native (Capacitor) implementation ---

function startNative(plugin: any, options: SpeechOptions): void {
  (async () => {
    try {
      const available = await plugin.available();
      if (!available?.available) {
        options.onError?.("Speech recognition is not available on this device.");
        return;
      }

      for (const listener of nativeListeners) {
        try {
          await listener.remove();
        } catch {
          // ignore
        }
      }
      nativeListeners = [];

      const onPartial = await plugin.addListener("partialResults", (data: any) => {
        const matches: string[] = data?.matches || [];
        if (matches.length > 0) {
          options.onResult?.(matches[0]);
        }
      });

      const onState = await plugin.addListener("listeningState", (data: any) => {
        if (data?.status === "started") options.onStart?.();
        if (data?.status === "stopped") options.onEnd?.();
      });

      nativeListeners.push(onPartial, onState);
      options.onStart?.();

      await plugin.start({
        language: options.language || "en-US",
        maxResults: 5,
        popup: false,
        partialResults: true,
      });
    } catch (err: any) {
      options.onError?.(err?.message || "Failed to start speech recognition.");
    }
  })();
}

// --- Web (SpeechRecognition API) implementation ---

let webRecognition: any = null;

function startWeb(options: SpeechOptions): void {
  if (typeof window === "undefined") return;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    options.onError?.("Web Speech API is not supported on this browser/device.");
    return;
  }

  try {
    const recognition = new SpeechRecognition();
    webRecognition = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = options.language || "en-US";

    recognition.onstart = () => options.onStart?.();
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0]?.transcript || "";
      if (transcript) options.onResult?.(transcript);
    };
    recognition.onerror = (err: any) => {
      if (err.error !== "no-speech") {
        options.onError?.("Speech recognition failed: " + err.error);
      }
    };
    recognition.onend = () => {
      webRecognition = null;
      options.onEnd?.();
    };

    recognition.start();
  } catch (err: any) {
    options.onError?.(err?.message || "Failed to start speech recognition.");
  }
}

function stopWeb(): void {
  if (webRecognition) {
    try {
      webRecognition.stop();
    } catch {
      // ignore
    }
    webRecognition = null;
  }
}
