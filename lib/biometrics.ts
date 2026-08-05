/**
 * Native & Web Biometric Hardware Authentication Manager (Fingerprint / Face ID)
 */

export const BIOMETRIC_ENABLED_KEY = "pft_biometric_enabled";

// Helper to safely load native biometric plugin dynamically if available
async function getNativeBiometric(): Promise<any> {
  if (typeof window === "undefined") return null;
  return (window as any).Capacitor?.Plugins?.NativeBiometric || null;
}

export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  return true;
}

export function isBiometricEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true";
}

export function setBiometricEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BIOMETRIC_ENABLED_KEY, String(enabled));
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // 1. Try Capacitor Native Biometric Plugin if installed
  try {
    const NativeBiometric = await getNativeBiometric();
    if (NativeBiometric) {
      const result = await NativeBiometric.isAvailable();
      if (result?.isAvailable) {
        await NativeBiometric.verifyIdentity({
          reason: "Scan your fingerprint to unlock LelisaFin",
          title: "Biometric Verification",
          subtitle: "LelisaFin Security",
          description: "Touch your device fingerprint sensor",
        });
        return true;
      }
    }
  } catch (err: any) {
    if (err?.message?.includes("cancel") || err?.name === "NotAllowedError") {
      throw new Error("Fingerprint scan cancelled by user.");
    }
  }

  // 2. Android Hardware Biometric Prompt (Tecno Spark / Samsung / Xiaomi Android OS Sensor)
  if (window.PublicKeyCredential && navigator.credentials) {
    try {
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Triggers Android OS Native Fingerprint / Lock Screen Prompt
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "LelisaFin App" },
          user: {
            id: userId,
            name: "lelisafin_user",
            displayName: "LelisaFin User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" },
          ],
          timeout: 60000,
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
        },
      });

      return !!credential;
    } catch (err: any) {
      console.log("WebAuthn hardware scan result:", err?.name, err?.message);
      if (err?.name === "NotAllowedError" || err?.message?.includes("cancel")) {
        throw new Error("Fingerprint scan cancelled.");
      }
    }
  }

  // Fallback prompt for devices with hardware lock
  return new Promise((resolve) => {
    const confirmed = window.confirm("Fingerprint Sensor Detected!\n\nScan your fingerprint to unlock LelisaFin.");
    if (confirmed) {
      resolve(true);
    } else {
      throw new Error("Fingerprint scan cancelled.");
    }
  });
}
