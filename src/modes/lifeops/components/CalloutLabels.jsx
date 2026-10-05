import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import styles from './CalloutLabels.module.css'

const LOCKED = 'LOCKED (HK)'

/** Subject node positions for leader lines (x%, y% within content area). */
export const NODES = { head: [50, 22], chest: [50, 42], abdomen: [50, 62] }

export function buildCalloutsData(latest, lastWorkout, readiness) {
  if (!latest) return { leftCallouts: [], rightCallouts: [] }
  const rhr = latest.resting_hr
  const avgHrWorkout = lastWorkout?.avg_hr
  const hrv = latest.hrv
  const hrvDelta = latest.hrv != null ? (latest.hrv - 40) : null
  const sleepMin = latest.sleep_minutes
  const sleepStr = sleepMin != null ? `${Math.floor(sleepMin / 60)}h ${sleepMin % 60}m` : null
  const sleepStages = latest.sleepStages
  const steps = latest.steps
  const activeCal = latest.activeCalories
  const spo2 = latest.spo2
  const respRate = latest.respiratoryRate
  const dist = lastWorkout?.distance_km != null ? `${lastWorkout.distance_km} km` : null
  const lastActivityType = lastWorkout?.type ? lastWorkout.type.toUpperCase() : null
  const score = readiness?.score
  const trend = readiness?.trend
  const hrvVal = latest?.hrv ?? 0
  const sleepMinVal = latest?.sleep_minutes ?? 0
  const stabilityScore = Math.min(100, Math.round((hrvVal / 80) * 40 + Math.min(100, (sleepMinVal / 480) * 100) * 0.6))

  const leftCallouts = [
    { id: 'cardiac', title: 'CARDIAC CORE', node: 'chest', lines: [['RHR', rhr != null ? `${rhr} bpm` : null], ['Avg HR (last)', avgHrWorkout != null ? `${avgHrWorkout} bpm` : null]] },
    { id: 'autonomic', title: 'AUTONOMIC BALANCE', node: 'chest', lines: [['HRV', hrv != null ? `${hrv} ms` : null], ['Δ vs 7d', hrvDelta != null ? `${hrvDelta >= 0 ? '+' : ''}${hrvDelta}` : null]] },
    { id: 'energy', title: 'ENERGY OUTPUT', node: 'abdomen', lines: [['Steps', steps != null ? steps.toLocaleString() : null], ['Active cal', activeCal != null ? `${activeCal}` : null]] },
    { id: 'sleep', title: 'SLEEP SYNC HUB', node: 'head', lines: [['Duration', sleepStr], ['Stages', sleepStages ? `${sleepStages.rem}m REM` : null]] },
  ]
  const rightCallouts = [
    { id: 'respiration', title: 'RESPIRATION', node: 'head', lines: [['SpO₂', spo2 != null ? `${spo2}%` : null], ['Resp rate', respRate != null ? `${respRate}/min` : null]] },
    { id: 'locomotion', title: 'LOCOMOTION', node: 'abdomen', lines: [['Distance', dist], ['Last', lastActivityType]] },
    { id: 'recovery', title: 'RECOVERY', node: 'chest', lines: [['Readiness', score != null ? `${score}` : null], ['Trend', trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→']] },
    { id: 'integrity', title: 'INTEGRITY', node: 'abdomen', lines: [['Stability', stabilityScore != null ? `${stabilityScore}` : null]] },
  ]
  return { leftCallouts, rightCallouts }
}

function Val({ value, showLocked }) {
  if (value != null && value !== '') return <span className={styles.val}>{value}</span>
  return (
    <span className={styles.locked}>
      —{showLocked ? <span className={styles.lockedHint}> {LOCKED}</span> : null}
    </span>
  )
}

/** Leader lines SVG overlay — pass leftCallouts and rightCallouts from buildCalloutsData. */
export function LeaderLines({ leftCallouts, rightCallouts, className }) {
  const lineSegments = []
  const leftYStep = leftCallouts.length ? 100 / (leftCallouts.length + 1) : 25
  const rightYStep = rightCallouts.length ? 100 / (rightCallouts.length + 1) : 25
  leftCallouts.forEach((c, i) => {
    const [nx, ny] = NODES[c.node] || [50, 50]
    const boxY = leftYStep * (i + 1)
    lineSegments.push({ x1: 18, y1: boxY, x2: 38, y2: ny })
  })
  rightCallouts.forEach((c, i) => {
    const [nx, ny] = NODES[c.node] || [50, 50]
    const boxY = rightYStep * (i + 1)
    lineSegments.push({ x1: 82, y1: boxY, x2: 62, y2: ny })
  })
  return (
    <div className={className} aria-hidden>
      <svg className={styles.leaderSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
        {lineSegments.map((seg, i) => (
          <line
            key={i}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke="var(--life-accent-dim, rgba(255, 46, 245, 0.18))"
            strokeWidth="0.4"
            vectorEffect="nonScalingStroke"
          />
        ))}
      </svg>
    </div>
  )
}

function CalloutBox({ c, index }) {
  return (
    <motion.div
      key={c.id}
      className={styles.box}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      data-node={c.node}
    >
      <div className={styles.boxTitle}>{c.title}</div>
      {c.lines.map(([label, value], j) => (
        <div key={j} className={styles.row}>
          <span className={styles.label}>{label}</span>
          <Val value={value} showLocked={value == null} />
        </div>
      ))}
    </motion.div>
  )
}

export default function CalloutLabels({ side, callouts, latest, lastWorkout, readiness, loading }) {
  if (loading || !latest) return null
  const data = callouts ?? buildCalloutsData(latest, lastWorkout, readiness)
  const list = side === 'left' ? data.leftCallouts : data.rightCallouts
  if (!list.length) return null
  return (
    <>
      {list.map((c, i) => (
        <CalloutBox key={c.id} c={c} index={i} />
      ))}
    </>
  )
}
