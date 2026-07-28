import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, KeyRound, Fingerprint, ScanFace, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import {
  isWebAuthnSupported,
  isBiometricAvailable,
  isBiometricEnrolled,
  authenticateWithBiometrics,
  registerBiometrics,
} from '../services/webauthn';

interface PinLockModalProps {
  correctPin?: string | null;
  onUnlock: (pin?: string) => boolean | void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({ correctPin, onUnlock }) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [isVerifyingBiometrics, setIsVerifyingBiometrics] = useState(false);
  const [biometricMsg, setBiometricMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkSupport() {
      const supported = isWebAuthnSupported();
      const available = await isBiometricAvailable();
      const enrolled = isBiometricEnrolled();
      setBiometricSupported(supported && available);
      setBiometricEnrolled(enrolled);

      // Auto-trigger biometric verification if enrolled
      if (supported && available && enrolled) {
        handleTriggerBiometrics();
      }
    }
    checkSupport();
  }, []);

  const handleTriggerBiometrics = async () => {
    setIsVerifyingBiometrics(true);
    setBiometricMsg(null);
    setError(false);

    const result = await authenticateWithBiometrics();
    setIsVerifyingBiometrics(false);

    if (result.success) {
      onUnlock(correctPin || undefined);
    } else {
      setBiometricMsg(result.error || 'Biometric verification failed.');
    }
  };

  const handleRegisterBiometricsNow = async () => {
    setIsVerifyingBiometrics(true);
    setBiometricMsg(null);
    const result = await registerBiometrics('KiwiLedger User');
    setIsVerifyingBiometrics(false);

    if (result.success) {
      setBiometricEnrolled(true);
      setBiometricMsg('Biometrics enrolled successfully! Unlocking...');
      setTimeout(() => {
        onUnlock(correctPin || undefined);
      }, 600);
    } else {
      setBiometricMsg(result.error || 'Failed to register biometrics.');
    }
  };

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const next = pinInput + num;
      setPinInput(next);
      setError(false);
      setBiometricMsg(null);

      if (next.length === 4) {
        const success = onUnlock(next);
        if (success === false) {
          setError(true);
          setTimeout(() => setPinInput(''), 600);
        }
      }
    }
  };

  const handleClear = () => {
    setPinInput('');
    setError(false);
    setBiometricMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Icon */}
        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs border border-teal-200 dark:border-teal-800/50">
          <Lock className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">KiwiLedger Security</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Unlock NZ accounting records with 4-digit PIN or Mobile Biometrics
        </p>

        {/* Biometric Primary Prompt Option */}
        {biometricSupported && (
          <div className="mt-5 mb-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
            <button
              type="button"
              onClick={biometricEnrolled ? handleTriggerBiometrics : handleRegisterBiometricsNow}
              disabled={isVerifyingBiometrics}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isVerifyingBiometrics ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Face ID / Fingerprint...
                </>
              ) : biometricEnrolled ? (
                <>
                  <Fingerprint className="w-5 h-5 text-emerald-200" />
                  Unlock with Fingerprint / Face ID
                </>
              ) : (
                <>
                  <ScanFace className="w-5 h-5 text-emerald-200" />
                  Enroll Biometrics (Face ID / Fingerprint)
                </>
              )}
            </button>

            {biometricMsg && (
              <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {biometricMsg}
              </p>
            )}
          </div>
        )}

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 my-5">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                error
                  ? 'bg-rose-500 border-rose-500 animate-bounce'
                  : pinInput.length > idx
                  ? 'bg-teal-600 border-teal-600 scale-110 shadow-xs'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-3 bg-rose-50 dark:bg-rose-950/40 py-1 px-3 rounded-lg inline-block border border-rose-200 dark:border-rose-900">
            Incorrect Security PIN. Please try again.
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 text-slate-800 dark:text-slate-100 font-extrabold text-lg transition-all active:scale-95 shadow-2xs border border-slate-200/80 dark:border-slate-700/60"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs transition-all active:scale-95 flex items-center justify-center border border-slate-200/80 dark:border-slate-700/60"
          >
            CLEAR
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 text-slate-800 dark:text-slate-100 font-extrabold text-lg transition-all active:scale-95 shadow-2xs border border-slate-200/80 dark:border-slate-700/60"
          >
            0
          </button>
          {biometricSupported ? (
            <button
              type="button"
              onClick={biometricEnrolled ? handleTriggerBiometrics : handleRegisterBiometricsNow}
              title="Touch ID / Face ID / Fingerprint"
              className="h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold text-xs transition-all active:scale-95 flex items-center justify-center border border-teal-200 dark:border-teal-800"
            >
              <Fingerprint className="w-5 h-5" />
            </button>
          ) : (
            <div className="h-12 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-6 h-6 opacity-40" />
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-5 flex items-center justify-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 shrink-0" /> Encrypted local browser storage & WebAuthn biometrics.
        </p>
      </div>
    </div>
  );
};
