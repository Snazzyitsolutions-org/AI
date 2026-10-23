// Real browser-based voice recording, microphone audio waveform analysis, and speech recognition
export interface VoiceRecordingResult {
  blob: Blob
  audioUrl: string
  durationSec: number
  formattedDuration: string
  transcript: string
  isSimulated?: boolean
}

export type VoiceRecorderState = {
  isRecording: boolean
  duration: number
  formattedDuration: string
  audioLevels: number[]
  transcript: string
  isListeningSpeech: boolean
  isSimulated: boolean
  error: string | null
}

// Check if browser supports audio recording
export function isVoiceRecordingSupported(): boolean {
  if (typeof window === 'undefined') return false
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function' &&
    typeof window.MediaRecorder !== 'undefined'
  )
}

// Request microphone permission explicitly
export async function requestMicrophonePermission(): Promise<{ granted: boolean; error?: string }> {
  if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { granted: false, error: 'Microphone API not supported' }
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // Stop tracks immediately after granting permission
    stream.getTracks().forEach((t) => {
      try {
        t.stop()
      } catch {}
    })
    return { granted: true }
  } catch (err: any) {
    return { granted: false, error: err.name || err.message || 'PermissionDenied' }
  }
}

// Get supported MediaRecorder audio MIME type
export function getSupportedAudioMimeType(): string | undefined {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return undefined
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
    'audio/aac',
    '',
  ]
  for (const type of candidates) {
    if (!type || MediaRecorder.isTypeSupported(type)) {
      return type || undefined
    }
  }
  return undefined
}

// Format seconds into m:ss
export function formatAudioDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Controller class for managing microphone recording, audio visualizer,
 * and optional speech-to-text recognition.
 */
export class VoiceRecorderController {
  private mediaStream: MediaStream | null = null
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []
  private audioContext: AudioContext | null = null
  private analyserNode: AnalyserNode | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private animFrameId: number | null = null
  private timerId: ReturnType<typeof setInterval> | null = null
  private startTime = 0
  private speechRecognition: any = null

  public duration = 0
  public transcript = ''
  public isRecording = false
  public isSimulated = false
  public micPermissionError: string | null = null

  private onTickCallback?: (duration: number, formatted: string) => void
  private onLevelsCallback?: (levels: number[]) => void
  private onTranscriptCallback?: (transcript: string) => void

  constructor(callbacks?: {
    onTick?: (duration: number, formatted: string) => void
    onLevels?: (levels: number[]) => void
    onTranscript?: (transcript: string) => void
  }) {
    this.onTickCallback = callbacks?.onTick
    this.onLevelsCallback = callbacks?.onLevels
    this.onTranscriptCallback = callbacks?.onTranscript
  }

  public async start(): Promise<{ isSimulated: boolean; error?: string }> {
    this.recordedChunks = []
    this.duration = 0
    this.transcript = ''
    this.isRecording = true
    this.isSimulated = false
    this.micPermissionError = null

    // 1. Attempt Real Hardware Microphone Access
    try {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
        throw new Error('Microphone API not supported or insecure origin.')
      }

      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
      } catch {
        // Fallback to simple audio: true if complex constraints failed
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      this.mediaStream = stream

      // 2. Setup Web Audio Analyser for live visualizer waveforms
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) {
          const audioCtx = new AudioCtx()
          this.audioContext = audioCtx
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 64
          analyser.smoothingTimeConstant = 0.8
          this.analyserNode = analyser

          const source = audioCtx.createMediaStreamSource(stream)
          this.sourceNode = source
          source.connect(analyser)

          this.startVisualizerLoop()
        }
      } catch (audioCtxErr) {
        console.warn('AudioContext visualization setup failed, falling back to simulated wave:', audioCtxErr)
        this.startSimulatedVisualizerLoop()
      }

      // 3. Setup MediaRecorder
      const mimeType = getSupportedAudioMimeType()
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      this.mediaRecorder = recorder
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      recorder.start(100) // 100ms chunk intervals for responsive buffer collection

      // 4. Timer for elapsed recording seconds
      this.startTime = Date.now()
      this.timerId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
        this.duration = elapsed
        this.onTickCallback?.(elapsed, formatAudioDuration(elapsed))
      }, 500)

      // 5. Try Speech Recognition in parallel for voice-to-text preview
      this.startSpeechRecognition()

      return { isSimulated: false }
    } catch (err: any) {
      console.warn('Real microphone unavailable or blocked, activating dynamic demo audio mode:', err)
      this.isSimulated = true
      this.micPermissionError = err.name || err.message || 'PermissionBlocked'

      // Start dynamic simulated recording with timer and animated wave bars
      this.startTime = Date.now()
      this.timerId = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
        this.duration = elapsed
        this.onTickCallback?.(elapsed, formatAudioDuration(elapsed))
      }, 500)

      this.startSimulatedVisualizerLoop()
      this.transcript = 'Demo WhatsApp voice message.'
      this.onTranscriptCallback?.(this.transcript)

      return { isSimulated: true, error: this.micPermissionError || undefined }
    }
  }

  private startSpeechRecognition() {
    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = navigator.language || 'en-US'

        recognition.onresult = (event: any) => {
          let fullTranscript = ''
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript
          }
          this.transcript = fullTranscript.trim()
          this.onTranscriptCallback?.(this.transcript)
        }

        recognition.onerror = () => {
          // Ignore recognition errors silently (e.g. no-speech or network)
        }

        recognition.start()
        this.speechRecognition = recognition
      }
    } catch {
      // SpeechRecognition not supported or blocked, optional feature
    }
  }

  private startVisualizerLoop() {
    if (!this.analyserNode) return
    const bufferLength = this.analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const update = () => {
      if (!this.isRecording || !this.analyserNode) return

      this.analyserNode.getByteFrequencyData(dataArray)

      // Downsample to 14 bars for WhatsApp waveform look
      const barCount = 14
      const step = Math.floor(bufferLength / barCount) || 1
      const levels: number[] = []

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] || 0
        levels.push(Math.max(12, Math.min(100, Math.round((val / 255) * 100))))
      }

      this.onLevelsCallback?.(levels)
      this.animFrameId = requestAnimationFrame(update)
    }

    this.animFrameId = requestAnimationFrame(update)
  }

  private startSimulatedVisualizerLoop() {
    const update = () => {
      if (!this.isRecording) return
      const barCount = 14
      const now = Date.now() / 320
      const levels = Array.from({ length: barCount }, (_, i) => {
        const wave = Math.sin(now + i * 0.5) * 35 + Math.sin(now * 1.5 - i * 0.3) * 25
        return Math.max(15, Math.min(95, Math.round(45 + wave + Math.random() * 15)))
      })
      this.onLevelsCallback?.(levels)
      this.animFrameId = requestAnimationFrame(update)
    }
    this.animFrameId = requestAnimationFrame(update)
  }

  public async stop(): Promise<VoiceRecordingResult> {
    this.isRecording = false
    const finalDuration = Math.max(1, this.duration)
    const formatted = formatAudioDuration(finalDuration)

    // If in simulated demo mode or no recorder:
    if (this.isSimulated || !this.mediaRecorder) {
      this.cleanup()
      const sim = await createSimulatedVoiceNote(finalDuration)
      return {
        blob: sim.blob,
        audioUrl: sim.audioUrl,
        durationSec: finalDuration,
        formattedDuration: formatted,
        transcript: this.transcript || sim.transcript,
        isSimulated: true,
      }
    }

    return new Promise<VoiceRecordingResult>((resolve, reject) => {
      const recorder = this.mediaRecorder
      if (!recorder) {
        this.cleanup()
        return createSimulatedVoiceNote(finalDuration).then(resolve).catch(reject)
      }

      recorder.onstop = () => {
        try {
          const mimeType = recorder.mimeType || 'audio/webm'
          const blob = new Blob(this.recordedChunks, { type: mimeType })
          const audioUrl = URL.createObjectURL(blob)

          this.cleanup()

          resolve({
            blob,
            audioUrl,
            durationSec: finalDuration,
            formattedDuration: formatted,
            transcript: this.transcript,
            isSimulated: false,
          })
        } catch (err) {
          this.cleanup()
          createSimulatedVoiceNote(finalDuration).then(resolve).catch(reject)
        }
      }

      try {
        if (recorder.state !== 'inactive') {
          recorder.stop()
        }
      } catch {
        this.cleanup()
        createSimulatedVoiceNote(finalDuration).then(resolve).catch(reject)
      }
    })
  }

  public cancel(): void {
    this.isRecording = false
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop()
      }
    } catch {}
    this.cleanup()
  }

  private cleanup() {
    this.isRecording = false

    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }

    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop()
      } catch {}
      this.speechRecognition = null
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect()
      } catch {}
      this.sourceNode = null
    }

    if (this.analyserNode) {
      try {
        this.analyserNode.disconnect()
      } catch {}
      this.analyserNode = null
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close()
      } catch {}
      this.audioContext = null
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop()
        } catch {}
      })
      this.mediaStream = null
    }

    this.mediaRecorder = null
    this.recordedChunks = []
  }
}

/**
 * Creates a simulated high-fidelity voice note when hardware microphone
 * access is not available or blocked in the browser environment.
 */
export async function createSimulatedVoiceNote(durationSec = 4): Promise<VoiceRecordingResult> {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioCtx) {
    const emptyBlob = new Blob([], { type: 'audio/webm' })
    return {
      blob: emptyBlob,
      audioUrl: '',
      durationSec,
      formattedDuration: formatAudioDuration(durationSec),
      transcript: 'Hello, this is a simulated WhatsApp voice message.',
      isSimulated: true,
    }
  }

  const sampleRate = 44100
  const audioCtx = new AudioCtx({ sampleRate })
  const frameCount = sampleRate * Math.max(1, durationSec)
  const audioBuffer = audioCtx.createBuffer(1, frameCount, sampleRate)
  const channelData = audioBuffer.getChannelData(0)

  // Generate a warm harmonic voice tone with speech cadence
  for (let i = 0; i < frameCount; i++) {
    const t = i / sampleRate
    const envelope = Math.sin(t * Math.PI * 3) > 0 ? 0.6 : 0.1
    const fundamental = Math.sin(2 * Math.PI * 220 * t)
    const harmonic2 = 0.5 * Math.sin(2 * Math.PI * 440 * t)
    const harmonic3 = 0.25 * Math.sin(2 * Math.PI * 660 * t)
    channelData[i] = (fundamental + harmonic2 + harmonic3) * envelope * 0.22
  }

  const wavBlob = audioBufferToWavBlob(audioBuffer)
  const audioUrl = URL.createObjectURL(wavBlob)

  audioCtx.close()

  return {
    blob: wavBlob,
    audioUrl,
    durationSec,
    formattedDuration: formatAudioDuration(durationSec),
    transcript: 'Voice message audio note preview.',
    isSimulated: true,
  }
}

// Minimal WAV encoder for AudioBuffer
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels
  const length = buffer.length * numOfChan * 2 + 44
  const out = new DataView(new ArrayBuffer(length))
  const channels: Float32Array[] = []
  let sample = 0
  let offset = 0
  let pos = 0

  function setUint16(data: number) {
    out.setUint16(pos, data, true)
    pos += 2
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true)
    pos += 4
  }

  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // file length - 8
  setUint32(0x45564157) // "WAVE"
  setUint32(0x20746d66) // "fmt " chunk
  setUint32(16) // length = 16
  setUint16(1) // PCM (uncompressed)
  setUint16(numOfChan)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * numOfChan)
  setUint16(numOfChan * 2)
  setUint16(16)
  setUint32(0x61746164) // "data" - chunk
  setUint32(length - pos - 4)

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i))
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]))
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0
      out.setInt16(pos, sample, true)
      pos += 2
    }
    offset++
  }

  return new Blob([out.buffer], { type: 'audio/wav' })
}
