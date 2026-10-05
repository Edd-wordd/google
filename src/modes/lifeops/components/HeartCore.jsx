import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getCurrentHR } from '../data/lifeOpsAdapter'
import clsx from 'clsx'
import styles from './HeartCore.module.css'

export default function HeartCore({ className }) {
  const [hr, setHr] = useState(68)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    let cancelled = false
    getCurrentHR().then((bpm) => {
      if (!cancelled) setHr(bpm)
    })
    return () => { cancelled = true }
  }, [])

  const periodSec = 60 / Math.max(40, Math.min(120, hr))
  // Simple waveform: flat then spike (one beat)
  const waveformPoints = '0,8 8,8 10,2 12,14 14,8 24,8'

  return (
    <div className={clsx(styles.wrap, className)} aria-hidden>
      <div className={styles.coreModule}>
        {/* Radar ring — pulses with heart */}
        {!prefersReducedMotion && (
          <motion.div
            className={styles.radarRing}
            animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{
              duration: periodSec,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          />
        )}
        <motion.div
          className={styles.heart}
          animate={
            prefersReducedMotion
              ? { scale: 1 }
              : { scale: [1, 1.04, 1] }
          }
          transition={{
            duration: periodSec,
            repeat: Infinity,
            repeatType: 'loop',
          }}
        >
          <svg viewBox="0 0 24 24" className={styles.heartSvg} aria-hidden>
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
        {!prefersReducedMotion && (
          <motion.div
            className={styles.glowRing}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.08, 1] }}
            transition={{
              duration: periodSec,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          />
        )}
      </div>
      <div className={styles.readout}>
        <span className={styles.bpm}>{hr}</span>
        <span className={styles.bpmLabel}>bpm</span>
      </div>
      <div className={styles.waveformWrap}>
        <svg viewBox="0 0 24 16" className={styles.waveformSvg} preserveAspectRatio="none">
          <motion.g
            animate={{
              opacity: [0.8, 1, 0.8],
              x: [0, -6, 0],
            }}
            transition={{
              duration: periodSec,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          >
            <polyline
              points={waveformPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        </svg>
      </div>
    </div>
  )
}
