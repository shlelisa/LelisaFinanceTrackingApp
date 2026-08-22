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

type NativePermissionStatus = {
  speechRecognition?: "granted" | "denied" | "prompt" | "prompt-with-rationale";
};

interface NativeSpeechPlugin {
  available: () => Promise<{ available: boolean }>;
  start: (options?: {
    language?: string;
    maxResults?: number;
    popup?: boolean;
    partialResults?: boolean;
  }) => Promise<{ matches?: string[] }>;
  stop: () => Promise<void>;
  checkPermissions: () => Promise<NativePermissionStatus>;
  requestPermissions: () => Promise<NativePermissionStatus>;
  addListener: (
    eventName: string,
    listenerFunc: (data: unknown) => void
  ) => Promise<{ remove: () => Promise<void> }>;
}

interface CapacitorLike {
  isNativePlatform?: () => boolean;
  Plugins?: {
    SpeechRecognition?: NativeSpeechPlugin;
  };
}

interface WebRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: { results: Array<Array<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => WebRecognitionLike;

let nativeSpeech: NativeSpeechPlugin | null = null;
let nativeListeners: Array<{ remove: () => Promise<void> }> = [];

function getNativeSpeech(): NativeSpeechPlugin | null {
  if (typeof window === "undefined") return null;
  if (nativeSpeech) return nativeSpeech;
  try {
    const cap = (window as unknown as { Capacitor?: CapacitorLike }).Capacitor;
    if (cap?.isNativePlatform?.() && cap.Plugins?.SpeechRecognition) {
      nativeSpeech = cap.Plugins.SpeechRecognition;
    }
  } catch {
    nativeSpeech = null;
  }
  return nativeSpeech;
}

export function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (getNativeSpeech()) return true;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return !!w.SpeechRecognition || !!w.webkitSpeechRecognition;
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
    void startNative(plugin, options);
  } else {
    startWeb(options);
  }
}

export function stopSpeechRecognition(): void {
  const plugin = getNativeSpeech();
  if (plugin) {
    void plugin.stop().catch(() => undefined);
  } else {
    stopWeb();
  }
}

// --- Native (Capacitor) implementation ---

async function startNative(plugin: NativeSpeechPlugin, options: SpeechOptions): Promise<void> {
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

    const onPartial = await plugin.addListener("partialResults", (data) => {
      const matches = (data as { matches?: string[] })?.matches || [];
      if (matches.length > 0) {
        options.onResult?.(matches[0]);
      }
    });

    const onState = await plugin.addListener("listeningState", (data) => {
      const status = (data as { status?: "started" | "stopped" })?.status;
      if (status === "started") options.onStart?.();
      if (status === "stopped") options.onEnd?.();
    });

    nativeListeners.push(onPartial, onState);
    options.onStart?.();

    await plugin.start({
      language: options.language || "en-US",
      maxResults: 5,
      popup: false,
      partialResults: true,
    });
  } catch (err) {
    options.onError?.(err instanceof Error ? err.message : "Failed to start speech recognition.");
  }
}

// --- Web (SpeechRecognition API) implementation ---

let webRecognition: WebRecognitionLike | null = null;

function startWeb(options: SpeechOptions): void {
  if (typeof window === "undefined") return;

  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

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
    recognition.onresult = (event) => {
      const transcript = event.results[0][0]?.transcript || "";
      if (transcript) options.onResult?.(transcript);
    };
    recognition.onerror = (err) => {
      if (err.error !== "no-speech") {
        options.onError?.("Speech recognition failed: " + err.error);
      }
    };
    recognition.onend = () => {
      webRecognition = null;
      options.onEnd?.();
    };

    recognition.start();
  } catch (err) {
    options.onError?.(err instanceof Error ? err.message : "Failed to start speech recognition.");
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
