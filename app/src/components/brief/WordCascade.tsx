import { useState, useEffect, useCallback, useRef } from 'react'
import confetti from 'canvas-confetti'

const WORDS = [
  'Connecting to Satellite',
  'Retrieving Sentinel-2 Imagery',
  'Calculating NDVI',
  'Analyzing Vegetation Health',
  'Assessing Rest Periods',
  'Determining Ideal Grazing Location',
  'Optimizing Rotation Schedule',
] as const

interface WordCascadeProps {
  isGenerating: boolean
  onGenerate: () => void
  onAnimationComplete: () => void
}

export function WordCascade({ isGenerating, onGenerate, onAnimationComplete }: WordCascadeProps) {
  // Single-layer word swap (fade out -> swap -> fade in) to avoid any chance of
  // two overlapping layers fighting each other and producing flicker.
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [showButton, setShowButton] = useState(true)
  const [showReady, setShowReady] = useState(false)
  const cycleTimeoutRef = useRef<number | null>(null)
  const swapTimeoutRef = useRef<number | null>(null)

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#525252', '#737373', '#a3a3a3', '#d4d4d4', '#e5e5e5'],
    })
  }, [])

  useEffect(() => {
    if (isGenerating && showButton) {
      setShowButton(false)
    }
  }, [isGenerating, showButton])

  useEffect(() => {
    if (!isGenerating || showReady) return

    const CYCLE_MS = 1500
    const FADE_MS = 220

    const clearTimers = () => {
      if (cycleTimeoutRef.current) window.clearTimeout(cycleTimeoutRef.current)
      if (swapTimeoutRef.current) window.clearTimeout(swapTimeoutRef.current)
      cycleTimeoutRef.current = null
      swapTimeoutRef.current = null
    }

    // Defensive cleanup (handles rapid toggles + dev StrictMode effect replay).
    clearTimers()

    const scheduleNext = () => {
      cycleTimeoutRef.current = window.setTimeout(() => {
        setIsFadingOut(true)

        swapTimeoutRef.current = window.setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % WORDS.length)
          setIsFadingOut(false)
          scheduleNext()
        }, FADE_MS)
      }, CYCLE_MS)
    }

    scheduleNext()

    return () => {
      clearTimers()
    }
  }, [isGenerating, showReady])

  useEffect(() => {
    if (!isGenerating && !showReady && !showButton) {
      triggerConfetti()
      setShowReady(true)
    }
  }, [isGenerating, showReady, showButton, triggerConfetti])

  useEffect(() => {
    if (!isGenerating && showReady) {
      const timeout = setTimeout(() => {
        onAnimationComplete()
      }, 1200)
      return () => clearTimeout(timeout)
    }
  }, [isGenerating, showReady, onAnimationComplete])

  const handleClick = () => {
    onGenerate()
  }

  if (showReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <div className="text-2xl font-semibold text-neutral-700 animate-in fade-in zoom-in duration-400">
          Ready!
        </div>
      </div>
    )
  }

  if (showButton) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <button
          onClick={handleClick}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md text-base font-medium transition-all active:scale-95 hover:scale-105"
        >
          Generate Plan
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className="w-[480px] text-center h-8 relative">
        <span
          className={`absolute inset-0 flex items-center justify-center text-base text-neutral-700 transition-opacity duration-200 ${
            isFadingOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {WORDS[currentIndex]}
        </span>
      </div>
    </div>
  )
}
