/**
 * Web Authentication API (WebAuthn) helper for Biometric & Passkey Unlock
 * Supports Mobile Fingerprint, Face Recognition (Face ID / Touch ID / Android Biometrics), and Windows Hello / Security Keys.
 */

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Checks if WebAuthn API is supported by the current browser environment
 */
export function isWebAuthnSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    !!navigator.credentials &&
    typeof navigator.credentials.create === 'function' &&
    typeof navigator.credentials.get === 'function'
  );
}

/**
 * Checks if platform authenticator (Biometrics: Fingerprint / Face ID) is available
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch (err) {
    console.warn('Error checking platform authenticator:', err);
    return false;
  }
}

/**
 * Checks if the user has previously enrolled biometrics in localStorage
 */
export function isBiometricEnrolled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('kiwiledger_biometric_enabled') === 'true';
}

/**
 * Disables stored biometric registration
 */
export function disableBiometrics(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('kiwiledger_biometric_credential_id');
  localStorage.removeItem('kiwiledger_biometric_enabled');
}

/**
 * Registers a new biometric credential using WebAuthn
 */
export async function registerBiometrics(username = 'KiwiLedger User'): Promise<{ success: boolean; credentialId?: string; error?: string }> {
  try {
    if (!isWebAuthnSupported()) {
      return { success: false, error: 'WebAuthn is not supported in this browser environment.' };
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    // Get clean RP Host ID
    let rpHost = window.location.hostname;
    if (!rpHost || rpHost === '') rpHost = 'localhost';

    const credentialOptions: CredentialCreationOptions = {
      publicKey: {
        challenge,
        rp: {
          name: 'KiwiLedger Pro Accounting',
          id: rpHost,
        },
        user: {
          id: userId,
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256 (ECDSA)
          { alg: -257, type: 'public-key' }, // RS256 (RSA)
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Mobile Fingerprint, Face ID, Touch ID
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      },
    };

    const newCredential = (await navigator.credentials.create(credentialOptions)) as PublicKeyCredential;

    if (!newCredential) {
      return { success: false, error: 'Biometric registration was cancelled or failed.' };
    }

    const credentialId = bufferToBase64Url(newCredential.rawId);

    // Store in localStorage
    localStorage.setItem('kiwiledger_biometric_credential_id', credentialId);
    localStorage.setItem('kiwiledger_biometric_enabled', 'true');

    return { success: true, credentialId };
  } catch (err: any) {
    console.warn('WebAuthn Registration Error:', err);
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric prompt was cancelled by user.' };
    }
    if (err.name === 'SecurityError' || err.name === 'InvalidStateError') {
      return { success: false, error: 'Security constraint prevents WebAuthn in current frame.' };
    }
    return { success: false, error: err.message || 'Failed to register biometric data.' };
  }
}

/**
 * Authenticates user using WebAuthn Biometrics
 */
export async function authenticateWithBiometrics(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isWebAuthnSupported()) {
      return { success: false, error: 'WebAuthn is not supported in this browser environment.' };
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const storedCredId = localStorage.getItem('kiwiledger_biometric_credential_id');
    const allowCredentials: PublicKeyCredentialDescriptor[] = [];

    if (storedCredId) {
      try {
        const rawId = base64UrlToBuffer(storedCredId);
        allowCredentials.push({
          id: rawId,
          type: 'public-key',
        });
      } catch (e) {
        console.warn('Failed to parse stored credential ID:', e);
      }
    }

    let rpHost = window.location.hostname;
    if (!rpHost || rpHost === '') rpHost = 'localhost';

    const requestOptions: CredentialRequestOptions = {
      publicKey: {
        challenge,
        rpId: rpHost,
        userVerification: 'required',
        ...(allowCredentials.length > 0 ? { allowCredentials } : {}),
        timeout: 60000,
      },
    };

    const assertion = (await navigator.credentials.get(requestOptions)) as PublicKeyCredential;

    if (assertion && assertion.id) {
      return { success: true };
    }

    return { success: false, error: 'Biometric verification failed.' };
  } catch (err: any) {
    console.warn('WebAuthn Authentication Error:', err);
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric verification was cancelled.' };
    }
    return { success: false, error: err.message || 'Biometric authentication failed.' };
  }
}
