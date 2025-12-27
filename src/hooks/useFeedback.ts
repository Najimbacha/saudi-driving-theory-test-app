import { useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';

export function useFeedback() {
  const { soundEnabled, vibrationEnabled } = useApp();
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextConstructor =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) {
        throw new Error("AudioContext not supported");
      }
      audioContextRef.current = new AudioContextConstructor();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    if (!soundEnabled) return;

    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Audio playback failed:', error);
      }
    }
  }, [soundEnabled, getAudioContext]);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!vibrationEnabled) return;

    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Vibration failed:', error);
      }
    }
  }, [vibrationEnabled]);

  // Correct answer feedback - pleasant ascending chime
  const playCorrectSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const audioContext = getAudioContext();
      const now = audioContext.currentTime;

      // First tone (lower)
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      osc1.frequency.value = 523.25; // C5
      osc1.type = 'sine';
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Second tone (higher) - delayed
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 659.25; // E5
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.3);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Correct sound failed:', error);
      }
    }
  }, [soundEnabled, getAudioContext]);

  // Incorrect answer feedback - low buzz
  const playIncorrectSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const audioContext = getAudioContext();
      const now = audioContext.currentTime;

      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.frequency.value = 200; // Low frequency
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Incorrect sound failed:', error);
      }
    }
  }, [soundEnabled, getAudioContext]);

  // Quiz passed - celebration sound
  const playSuccessSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const audioContext = getAudioContext();
      const now = audioContext.currentTime;

      // Play ascending chord: C5, E5, G5
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.25, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Success sound failed:', error);
      }
    }
  }, [soundEnabled, getAudioContext]);

  // Quiz failed - sad sound
  const playFailSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const audioContext = getAudioContext();
      const now = audioContext.currentTime;

      // Descending tones
      [400, 350, 300].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.2);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.2);
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Fail sound failed:', error);
      }
    }
  }, [soundEnabled, getAudioContext]);

  // Haptic patterns
  const triggerCorrectHaptic = useCallback(() => {
    vibrate(50); // Short single pulse
  }, [vibrate]);

  const triggerIncorrectHaptic = useCallback(() => {
    vibrate([100, 50, 100]); // Double buzz
  }, [vibrate]);

  const triggerSuccessHaptic = useCallback(() => {
    vibrate(200); // Long celebration pulse
  }, [vibrate]);

  const triggerFailHaptic = useCallback(() => {
    vibrate([100, 100, 100, 100, 100]); // Multiple short pulses
  }, [vibrate]);

  // Combined feedback functions
  const triggerCorrectFeedback = useCallback(() => {
    playCorrectSound();
    triggerCorrectHaptic();
  }, [playCorrectSound, triggerCorrectHaptic]);

  const triggerIncorrectFeedback = useCallback(() => {
    playIncorrectSound();
    triggerIncorrectHaptic();
  }, [playIncorrectSound, triggerIncorrectHaptic]);

  const triggerSuccessFeedback = useCallback(() => {
    playSuccessSound();
    triggerSuccessHaptic();
  }, [playSuccessSound, triggerSuccessHaptic]);

  const triggerFailFeedback = useCallback(() => {
    playFailSound();
    triggerFailHaptic();
  }, [playFailSound, triggerFailHaptic]);

  return {
    // Individual controls
    playTone,
    vibrate,
    playCorrectSound,
    playIncorrectSound,
    playSuccessSound,
    playFailSound,
    triggerCorrectHaptic,
    triggerIncorrectHaptic,
    triggerSuccessHaptic,
    triggerFailHaptic,
    // Combined feedback
    triggerCorrectFeedback,
    triggerIncorrectFeedback,
    triggerSuccessFeedback,
    triggerFailFeedback,
  };
}
