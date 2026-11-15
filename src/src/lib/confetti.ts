export const fireConfetti = async (options?: {
  particleCount?: number;
  spread?: number;
  origin?: { y?: number; x?: number };
  colors?: string[];
}) => {
  if (typeof window !== 'undefined') {
    try {
      const confettiModule = await import('canvas-confetti');
      const confetti = (confettiModule as any).default || confettiModule;
      confetti(options);
    } catch (e) {
      console.warn('Confetti could not be loaded:', e);
    }
  }
};
