import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning';
export type SoundId = 'tap' | 'vote' | 'correct' | 'wrong' | 'win';

const soundFrequencies: Record<SoundId, number> = {
  tap: 440,
  vote: 620,
  correct: 740,
  wrong: 180,
  win: 880
};

export function haptic(type: HapticType = 'light') {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    if (type === 'success') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (type === 'warning') {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    const style =
      type === 'heavy'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : type === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;

    void Haptics.impactAsync(style);
  } catch {
    // Feedback should never block gameplay.
  }
}

export async function playSound(id: SoundId) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }

  try {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const duration = id === 'win' ? 0.55 : id === 'tap' ? 0.05 : 0.18;

    oscillator.frequency.value = soundFrequencies[id];
    oscillator.type = id === 'wrong' ? 'sawtooth' : 'sine';
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch {
    // Audio is best-effort and may be blocked by browser autoplay policies.
  }
}
