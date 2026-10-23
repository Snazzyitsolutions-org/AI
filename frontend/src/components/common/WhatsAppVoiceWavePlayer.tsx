import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { speakAgentLine, stopAgentSpeech } from '../../lib/audioVoice'

interface WhatsAppVoiceWavePlayerProps {
  id: string
  mediaUrl?: string
  text?: string
  audioDuration?: string
  isOutgoing?: boolean
  activePlayingId: string | null
  onPlayStateChange: (id: string | null) => void
  onNotify?: (message: string) => void
}

/**
 * Computes proportional waveform geometry and natural speech amplitude
 * profile matching the exact duration of the voice note.
 * Zero artificial padding, no extra bars, and no dead void before timestamp.
 */
function computeVoiceWaveform(totalSeconds: number) {
  // Proportional bar count: short clips have fewer bars; longer clips scale up smoothly
  // e.g. 5s -> 15 bars (~66px); 19s -> 22 bars (~97px); 24s -> 24 bars (~106px); 40s+ -> 30 bars (~133px)
  const numBars = Math.max(14, Math.min(30, Math.round(12 + Math.min(totalSeconds, 36) * 0.5)))
  const barWidth = 2.5 // px
  const barGap = 2.0 // px
  const totalWidth = numBars * barWidth + (numBars - 1) * barGap // px

  // Generate authentic speech amplitude profile for this exact duration:
  // Natural vocal attack, syllable cadence (~3.5 Hz), vowel peaks, and clean conclusion decay
  const profile: number[] = []
  for (let i = 0; i < numBars; i++) {
    const normT = numBars > 1 ? i / (numBars - 1) : 0 // 0 to 1
    const secAtBar = normT * totalSeconds

    // Vocal attack & release envelope (smooth ramp-up at start, clean decay at end, no trailing dead bars)
    const attack = Math.min(1, (i + 1) / 2.8)
    const release = Math.min(1, (numBars - i) / 2.8)
    const naturalArc = Math.sin(normT * Math.PI) * 0.35 + 0.65

    // Rhythmic syllable cadence and vocal harmonic stress
    const syllableWave = Math.sin(secAtBar * 3.6 * Math.PI) * 0.28
    const vowelPeak = Math.sin(secAtBar * 1.5 * Math.PI + 0.3) * 0.34
    const fineFriction = Math.cos(secAtBar * 7.5 * Math.PI + i * 0.6) * 0.12

    // Brief natural speech pause/dip at ~42% and ~74% of sentence
    const isPause = (normT > 0.40 && normT < 0.47) || (normT > 0.72 && normT < 0.77)
    const pauseFactor = isPause ? 0.35 : 1.0

    const rawAmp = (0.38 + syllableWave + vowelPeak + fineFriction) * pauseFactor
    const clampedAmp = Math.max(0.18, Math.min(1.0, rawAmp * naturalArc * attack * release))

    // Height in px between 4px (whisper/pause) and 22px (full vocal volume)
    const heightPx = Math.max(4, Math.min(22, Math.round(clampedAmp * 22)))
    profile.push(heightPx)
  }

  return {
    numBars,
    barWidth,
    barGap,
    totalWidth,
    baseProfile: profile,
  }
}

export function WhatsAppVoiceWavePlayer({
  id,
  mediaUrl,
  text,
  audioDuration = '0:24',
  isOutgoing = false,
  activePlayingId,
  onPlayStateChange,
  onNotify,
}: WhatsAppVoiceWavePlayerProps) {
  const isPlaying = activePlayingId === id

  // Parse total duration in seconds from "M:SS" string
  const totalSeconds = useMemo(() => {
    const parts = audioDuration.split(':')
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0
      const secs = parseInt(parts[1], 10) || 0
      return Math.max(2, mins * 60 + secs)
    }
    return 18
  }, [audioDuration])

  // Compute waveform geometry directly proportional to actual audio duration
  const waveformMeta = useMemo(() => {
    return computeVoiceWaveform(totalSeconds)
  }, [totalSeconds])

  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1)
  const [waveHeights, setWaveHeights] = useState<number[]>(waveformMeta.baseProfile)

  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const intervalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const waveformContainerRef = useRef<HTMLDivElement | null>(null)
  const isDraggingRef = useRef<boolean>(false)

  // Update base heights when waveformMeta changes
  useEffect(() => {
    if (!isPlaying) {
      setWaveHeights(waveformMeta.baseProfile)
    }
  }, [waveformMeta, isPlaying])

  // Format seconds to M:SS
  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs))
    const m = Math.floor(s / 60)
    const rem = s % 60
    return `${m}:${rem < 10 ? '0' : ''}${rem}`
  }

  // Cleanup on unmount or when playing stops
  const cleanupAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current)
      intervalTimerRef.current = null
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current = null
    }
    stopAgentSpeech()
  }, [])

  // When another audio starts or activePlayingId changes
  useEffect(() => {
    if (!isPlaying) {
      cleanupAudio()
      setWaveHeights(waveformMeta.baseProfile)
    }
  }, [isPlaying, cleanupAudio, waveformMeta.baseProfile])

  useEffect(() => {
    return () => {
      cleanupAudio()
    }
  }, [cleanupAudio])

  // Real Traveling Wave Animation Loop (60 FPS) across only the existing bars
  useEffect(() => {
    if (!isPlaying) return

    let isMounted = true
    const { baseProfile, numBars } = waveformMeta

    const animateWave = () => {
      if (!isMounted) return

      const now = performance.now() / 1000 // seconds
      const progress = currentTime / totalSeconds
      const currentBarIndex = Math.min(numBars - 1, Math.floor(progress * numBars))

      // Calculate organic traveling sinusoidal wave with fluid phase velocity
      // v = omega / k -> speed 5.8 rad/s, spatial ripple 0.42 rad/bar
      const nextHeights = baseProfile.map((baseH, i) => {
        const phase = now * 5.8 - i * 0.42
        const harmonic1 = Math.sin(phase)
        const harmonic2 = Math.sin(phase * 1.7 + 0.35) * 0.32
        const combined = (harmonic1 + harmonic2) / 1.32 // -1 to 1

        // Smooth wave modulation between 0.35 and 1.10
        const waveMod = 0.36 + 0.64 * ((combined + 1) / 2)

        // Resonant reaction near current playhead position
        const distFromPlayhead = Math.abs(i - currentBarIndex)
        const resonance = distFromPlayhead <= 2 ? (1 - distFromPlayhead / 2.5) * 0.28 : 0

        return Math.max(3, Math.min(22, Math.round(baseH * (waveMod + resonance))))
      })

      setWaveHeights(nextHeights)
      animFrameRef.current = requestAnimationFrame(animateWave)
    }

    animFrameRef.current = requestAnimationFrame(animateWave)

    return () => {
      isMounted = false
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isPlaying, currentTime, totalSeconds, waveformMeta])

  // Start Playback
  const startPlayback = useCallback(() => {
    onPlayStateChange(id)

    if (mediaUrl) {
      // Real recorded audio URL playback
      const audio = new Audio(mediaUrl)
      audio.playbackRate = playbackSpeed
      audioElementRef.current = audio

      audio.ontimeupdate = () => {
        if (!isDraggingRef.current) {
          setCurrentTime(audio.currentTime)
        }
      }

      audio.onended = () => {
        onPlayStateChange(null)
        setCurrentTime(0)
      }

      audio.onerror = () => {
        console.warn('Real audio playback failed, falling back to simulated speech')
        playSynthesizedVoice()
      }

      audio.play().catch((err) => {
        console.warn('Audio play catch error:', err)
        playSynthesizedVoice()
      })
    } else {
      playSynthesizedVoice()
    }
  }, [id, mediaUrl, playbackSpeed, onPlayStateChange, onNotify])

  // Synthesized / Speech Fallback Playback
  const playSynthesizedVoice = useCallback(() => {
    const textToSpeak =
      text && text !== 'Voice note'
        ? text
        : 'Hello, this is a verified WhatsApp voice compliance note from CallWave.'

    const tickIntervalMs = 100
    const startOffset = currentTime >= totalSeconds - 0.5 ? 0 : currentTime
    setCurrentTime(startOffset)

    let currentSec = startOffset

    intervalTimerRef.current = setInterval(() => {
      currentSec += (tickIntervalMs / 1000) * playbackSpeed
      if (currentSec >= totalSeconds) {
        if (intervalTimerRef.current) {
          clearInterval(intervalTimerRef.current)
          intervalTimerRef.current = null
        }
        setCurrentTime(0)
        onPlayStateChange(null)
        stopAgentSpeech()
      } else {
        setCurrentTime(currentSec)
      }
    }, tickIntervalMs)

    speakAgentLine(textToSpeak, {
      voiceRate: playbackSpeed,
      onEnd: () => {
        if (intervalTimerRef.current) {
          clearInterval(intervalTimerRef.current)
          intervalTimerRef.current = null
        }
        setCurrentTime(0)
        onPlayStateChange(null)
      },
      onError: () => {
        // Interval ticker will handle time
      },
    })
  }, [text, totalSeconds, playbackSpeed, currentTime, onPlayStateChange])

  // Pause Playback
  const pausePlayback = useCallback(() => {
    cleanupAudio()
    onPlayStateChange(null)
  }, [cleanupAudio, onPlayStateChange])

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      pausePlayback()
    } else {
      startPlayback()
    }
  }

  // Handle speed change (1x -> 1.5x -> 2x -> 1x)
  const handleCycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1
    setPlaybackSpeed(nextSpeed)
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = nextSpeed
    }
  }

  // Handle Scrub / Seek on waveform click or drag with 100% boundary precision
  const handleSeekFromEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformContainerRef.current) return
    const rect = waveformContainerRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const pct = clickX / rect.width
    const targetTime = Math.max(0, Math.min(totalSeconds, pct * totalSeconds))

    setCurrentTime(targetTime)

    if (audioElementRef.current) {
      audioElementRef.current.currentTime = targetTime
    }
  }

  // Exact progress percentage (0 to 100)
  const progressPct = Math.min(100, Math.max(0, (currentTime / totalSeconds) * 100))

  return (
    <div className="flex flex-col gap-1 py-0.5 w-fit max-w-full select-none">
      {/* Player Header Row: Play Button, Exactly-Sized Waveform, Speed Pill, and Timestamp */}
      <div className="flex items-center gap-2.5 py-0.5">
        {/* WhatsApp Circular Play / Pause Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className="w-10 h-10 rounded-full bg-[#008069] hover:bg-[#00705c] active:scale-95 text-white flex items-center justify-center flex-shrink-0 transition-all cursor-pointer shadow-sm relative group"
          title={isPlaying ? 'Pause voice note' : 'Play voice note'}
        >
          {isPlaying ? (
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}

          {/* Subtle pulse indicator when actively playing */}
          {isPlaying && (
            <span className="absolute inset-0 rounded-full bg-[#008069] opacity-30 animate-ping pointer-events-none" />
          )}
        </button>

        {/* Dynamic Waveform Track: Sized exactly to the bars, zero dead space, zero mismatch */}
        <div
          ref={waveformContainerRef}
          onClick={handleSeekFromEvent}
          style={{ width: `${waveformMeta.totalWidth}px` }}
          className="flex items-center justify-between h-7 cursor-pointer relative py-1 select-none flex-shrink-0 group/wave"
          title="Click or drag to seek in the voice note"
        >
          {waveHeights.map((h, i) => {
            const barFraction = waveformMeta.numBars > 1 ? (i / (waveformMeta.numBars - 1)) * 100 : 0
            const isPlayed = barFraction <= progressPct

            return (
              <span
                key={i}
                className={`w-[2.5px] rounded-full transition-[height,background-color] duration-75 flex-shrink-0 ${
                  isPlayed
                    ? 'bg-[#008069]'
                    : isOutgoing
                    ? 'bg-[#8696a0]/70'
                    : 'bg-[#8696a0]'
                }`}
                style={{
                  height: `${h}px`,
                }}
              />
            )
          })}

          {/* Gliding Playhead Scrubber Dot directly traversing bar 0 to bar N-1 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
            style={{
              left: `${progressPct}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`w-3 h-3 rounded-full bg-[#008069] border-2 border-white shadow-md transition-transform ${
                isPlaying ? 'scale-110' : 'group-hover/wave:scale-125'
              }`}
            />
          </div>
        </div>

        {/* Playback Speed Pill (1x / 1.5x / 2x) */}
        {isPlaying && (
          <button
            type="button"
            onClick={handleCycleSpeed}
            className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-black/10 hover:bg-black/15 text-[#111b21] transition-colors cursor-pointer flex-shrink-0"
            title="Playback Speed (Click to change: 1x, 1.5x, 2x)"
          >
            {playbackSpeed}x
          </button>
        )}

        {/* Duration / Elapsed Time - sitting right beside waveform with no blank void */}
        <span className="text-[11px] font-mono font-semibold text-[#54656f] flex-shrink-0 min-w-[28px] text-right">
          {isPlaying ? formatTime(currentTime) : audioDuration}
        </span>
      </div>

      {/* Message Text accompaniment if present */}
      {text && text !== 'Voice note' && (
        <p className="text-[11px] text-[#54656f] italic pl-1 leading-snug break-words max-w-sm">
          {text}
        </p>
      )}
    </div>
  )
}
