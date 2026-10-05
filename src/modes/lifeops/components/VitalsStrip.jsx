import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MetricChip from './MetricChip'
import clsx from 'clsx'
import styles from './VitalsStrip.module.css'

export default function VitalsStrip({ dailyMetrics, loading }) {
  const latest = dailyMetrics?.[dailyMetrics.length - 1]
  const [highlight, setHighlight] = useState(null)

  useEffect(() => {
    if (!latest) return
    const keys = ['rhr', 'hrv', 'sleep', 'steps']
    let i = 0
    const t = setInterval(() => {
      setHighlight(keys[i % keys.length])
      i += 1
      if (i >= keys.length) clearInterval(t)
    }, 400)
    return () => clearInterval(t)
  }, [latest?.resting_hr, latest?.hrv, latest?.sleep_minutes, latest?.steps])

  if (loading) {
    return (
      <div className={styles.strip}>
        {[1, 2, 3, 4].map((k) => (
          <div key={k} className={styles.skeletonChip} />
        ))}
      </div>
    )
  }

  if (!latest) return null

  const sleepHours = Math.floor((latest.sleep_minutes || 0) / 60)
  const sleepMins = (latest.sleep_minutes || 0) % 60
  const sleepStr = `${sleepHours}h ${sleepMins}m`

  return (
    <div className={styles.strip}>
      <MetricChip
        label="RHR"
        value={latest.resting_hr ?? '—'}
        unit=" bpm"
        highlight={highlight === 'rhr'}
      />
      <MetricChip
        label="HRV"
        value={latest.hrv ?? '—'}
        unit=" ms"
        highlight={highlight === 'hrv'}
      />
      <MetricChip
        label="SLEEP"
        value={sleepStr}
        highlight={highlight === 'sleep'}
      />
      <MetricChip
        label="STEPS"
        value={latest.steps != null ? latest.steps.toLocaleString() : '—'}
        highlight={highlight === 'steps'}
      />
    </div>
  )
}
