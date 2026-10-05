import React, { useState, useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './PrinterStatusSignalPanel.module.css'

const TOTAL_CELLS = 24
const BOUNCE_BAND_SIZE = 3
const SPARKLE_MIN_FILLED = 6
const SPARKLE_INTERVAL_MIN = 2500
const SPARKLE_INTERVAL_MAX = 4000

const CHANNEL_COLORS = {
  photoBlack: 'rgba(50, 50, 55, 0.95)',
  matteBlack: 'rgba(60, 60, 65, 0.95)',
  cyan: 'rgba(0, 180, 200, 0.85)',
  magenta: 'rgba(200, 0, 120, 0.85)',
  yellow: 'rgba(255, 200, 60, 0.9)',
  photoCyan: 'rgba(0, 160, 180, 0.8)',
  photoMagenta: 'rgba(180, 0, 110, 0.8)',
  gray: 'rgba(120, 120, 130, 0.9)',
}

function channelSeed(label) {
  return (label || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)
}

function InkBar({
  percent,
  label,
  color,
  animationMode,
  barIndex,
  prefersReducedMotion,
  enableSparkle,
}) {
  const filledCells = Math.round((percent / 100) * TOTAL_CELLS)
  const seed = useMemo(() => channelSeed(label), [label])

  const [sparkleCell, setSparkleCell] = useState(null)
  const [sparkleKey, setSparkleKey] = useState(0)

  useEffect(() => {
    if (
      prefersReducedMotion ||
      !enableSparkle ||
      filledCells < SPARKLE_MIN_FILLED ||
      animationMode !== 'energy'
    ) {
      return
    }
    const schedule = () => {
      const delay =
        SPARKLE_INTERVAL_MIN +
        Math.random() * (SPARKLE_INTERVAL_MAX - SPARKLE_INTERVAL_MIN)
      return window.setTimeout(() => {
        const idx = Math.floor(Math.random() * filledCells)
        setSparkleCell(idx)
        setSparkleKey((k) => k + 1)
        setTimeout(() => setSparkleCell(null), 500)
        timeoutId = schedule()
      }, delay)
    }
    let timeoutId = schedule()
    return () => clearTimeout(timeoutId)
  }, [
    prefersReducedMotion,
    enableSparkle,
    filledCells,
    animationMode,
  ])

  const isEnergy = animationMode === 'energy'
  const isPulse = animationMode === 'pulse'
  const isBounce = animationMode === 'bounce'
  const breathDuration = 1.1 + (seed % 31) * 0.01
  const topBandDuration = 0.9 + ((seed >> 4) % 31) * 0.01

  return (
    <div className={styles.barWrap}>
      <span className={styles.barPct}>{percent}%</span>
      <div className={styles.barColumn}>
        {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
          const isFilled = i < filledCells
          const isTopBand =
            isFilled && i >= filledCells - BOUNCE_BAND_SIZE
          const isSparkleTarget = enableSparkle && sparkleCell === i

          const shouldAnimate =
            !prefersReducedMotion &&
            ((animationMode && isFilled && (isEnergy || isPulse || isBounce)) ||
              isSparkleTarget)

          const energyBreathing =
            isEnergy && isFilled
              ? {
                  opacity: [0.78, 1.0, 0.82],
                  filter: [
                    'brightness(0.98)',
                    'brightness(1.02)',
                    'brightness(0.98)',
                  ],
                }
              : undefined
          const energyBreathTransition =
            isEnergy && isFilled
              ? {
                  duration: breathDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.02,
                }
              : undefined

          const energyTopWobble =
            isEnergy && isTopBand
              ? {
                  y: [0, -1.5, 0, 1.0, 0],
                  opacity: [0.85, 1, 0.88],
                  filter: [
                    'brightness(1)',
                    'brightness(1.08)',
                    'brightness(1)',
                    'brightness(1.05)',
                    'brightness(1)',
                  ],
                }
              : undefined
          const energyTopTransition =
            isEnergy && isTopBand
              ? {
                  duration: topBandDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: (seed % 20) * 0.01,
                }
              : undefined

          const animatePulse =
            isPulse && isFilled
              ? { opacity: [0.72, 1, 0.75] }
              : undefined
          const transitionPulse =
            isPulse && isFilled
              ? {
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.03,
                }
              : undefined

          const animateBounce =
            isBounce && isTopBand
              ? {
                  y: [0, -1, 0, 1, 0],
                  opacity: [0.82, 1, 0.88],
                }
              : undefined
          const transitionBounce =
            isBounce && isTopBand
              ? {
                  duration: 1.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: (barIndex * 0.08 + i * 0.02) % 0.5,
                }
              : undefined

          const sparkleAnimate =
            isSparkleTarget
              ? { opacity: [1, 0.7, 1] }
              : undefined
          const sparkleTransition =
            isSparkleTarget
              ? { duration: 0.45, repeat: 0 }
              : undefined

          let animate
          let transition
          if (isSparkleTarget) {
            animate = sparkleAnimate
            transition = sparkleTransition
          } else if (isEnergy) {
            animate = isTopBand ? energyTopWobble : energyBreathing
            transition = isTopBand ? energyTopTransition : energyBreathTransition
          } else if (isPulse) {
            animate = animatePulse
            transition = transitionPulse
          } else if (isBounce) {
            animate = animateBounce
            transition = transitionBounce
          }

          const hasAnimate = !!animate
          const CellTag = shouldAnimate ? motion.span : 'span'
          const cellKey = isSparkleTarget ? `${i}-s-${sparkleKey}` : i

          return (
            <CellTag
              key={cellKey}
              className={`${styles.cell} ${isFilled ? styles.cellFilled : styles.cellEmpty} ${isEnergy && isTopBand ? styles.cellTopBand : ''}`}
              style={{
                ...(isFilled ? { '--cell-color': color } : {}),
                ...(hasAnimate
                  ? { willChange: 'transform, opacity, filter' }
                  : {}),
              }}
              animate={animate}
              transition={transition}
              aria-hidden
            />
          )
        })}
      </div>
      <span className={styles.barLabel}>{label}</span>
    </div>
  )
}

export default function PrinterStatusSignalPanel({
  inkLevels,
  animationMode = 'energy',
  enableSparkle = true,
}) {
  const prefersReducedMotion = useReducedMotion()
  const effectiveMode = prefersReducedMotion ? null : animationMode

  return (
    <div className={styles.wrap} aria-label="Ink levels">
      <div className={styles.gridBg} aria-hidden />
      <div className={styles.chart}>
        {inkLevels.map((ink, i) => (
          <InkBar
            key={i}
            percent={ink.width}
            label={ink.label}
            color={CHANNEL_COLORS[ink.type] ?? CHANNEL_COLORS.gray}
            animationMode={effectiveMode}
            barIndex={i}
            prefersReducedMotion={!!prefersReducedMotion}
            enableSparkle={enableSparkle}
          />
        ))}
      </div>
    </div>
  )
}
