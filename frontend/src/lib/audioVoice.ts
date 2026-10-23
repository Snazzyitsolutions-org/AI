// Utility for browser-based realistic voice audio synthesis and simulated waveforms

let currentUtterance: SpeechSynthesisUtterance | null = null

export function speakAgentLine(
  text: string,
  options?: {
    voicePitch?: number
    voiceRate?: number
    onStart?: () => void
    onEnd?: () => void
    onError?: () => void
  },
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options?.onStart?.()
    const timer = setTimeout(() => {
      options?.onEnd?.()
    }, 3500)
    return () => clearTimeout(timer)
  }

  try {
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    currentUtterance = utterance

    // Find best natural voice
    const voices = window.speechSynthesis.getVoices()
    const englishVoice =
      voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Premium'))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0]

    if (englishVoice) {
      utterance.voice = englishVoice
    }

    utterance.rate = options?.voiceRate ?? 1.05
    utterance.pitch = options?.voicePitch ?? 1.0

    utterance.onstart = () => {
      options?.onStart?.()
    }

    utterance.onend = () => {
      currentUtterance = null
      options?.onEnd?.()
    }

    utterance.onerror = () => {
      currentUtterance = null
      options?.onEnd?.()
    }

    window.speechSynthesis.speak(utterance)

    return () => {
      window.speechSynthesis.cancel()
      currentUtterance = null
      options?.onEnd?.()
    }
  } catch (err) {
    console.warn('Speech synthesis not available', err)
    options?.onStart?.()
    const timer = setTimeout(() => options?.onEnd?.(), 3000)
    return () => clearTimeout(timer)
  }
}

export function stopAgentSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (currentUtterance) {
      window.speechSynthesis.cancel()
      currentUtterance = null
    }
  }
}
