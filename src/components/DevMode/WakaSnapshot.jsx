import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './WakaSnapshot.module.css'

/* Hardcoded placeholder data — match reference gauge structure */
const GAUGES = [
  {
    id: 'wakatime',
    value: '643h',
    sub: '23m',
    label: 'WAKATIME',
    micro: 'Lifetime tracked',
  },
  {
    id: 'week',
    value: '7h',
    sub: '15m',
    label: 'LAST WEEK',
    micro: 'Active coding time',
  },
  {
    id: 'avg',
    value: '1h',
    sub: '12m',
    label: 'DAILY AVG',
    micro: 'Rolling average',
  },
  {
    id: 'editor',
    value: '88%',
    sub: 'Cursor',
    label: 'EDITOR',
    micro: 'Primary environment',
  },
]

/* Hardcoded detail content per gauge */
const DETAILS = {
  wakatime: [
    'Total tracked: 643h 23m',
    'Top languages: JavaScript, JSON, Markdown',
    'Last 7 days: 7h 15m',
    'Streak: 4 days',
  ],
  week: [
    'Daily sessions: 5',
    'Peak day: Tue (2h 10m)',
    'Focus split: Dev 55% / Create 25% / Other 20%',
  ],
  avg: ['Rolling avg: 1h 12m', 'Best window: 9:00–11:00 PM', 'Suggestion: protect a 60-min block'],
  editor: [
    'Primary: Cursor (88%)',
    'Secondary: VS Code (12%)',
    'OS: macOS',
    'Project context: command-center',
  ],
}

function GaugeButton({ gauge, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.gaugeBtn} ${isActive ? styles.gaugeBtnActive : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`${gauge.label} - ${gauge.micro}`}
    >
      <div className={styles.gaugeOuter}>
        <div className={styles.outerRing} aria-hidden />
        <div className={styles.tickRing} aria-hidden />
        <div className={styles.innerDisc} aria-hidden />
        <div className={styles.gaugeCenter}>
          <span className={styles.gaugeValue}>{gauge.value}</span>
          <span className={styles.gaugeSub}>{gauge.sub}</span>
        </div>
      </div>
      <div className={styles.gaugeLabels}>
        <span className={styles.gaugeLabel}>{gauge.label}</span>
        <span className={styles.gaugeMicro}>{gauge.micro}</span>
      </div>
    </button>
  )
}

function WakaSnapshot() {
  const [activeGauge, setActiveGauge] = useState('')

  const handleGaugeClick = (id) => {
    setActiveGauge((prev) => (prev === id ? prev : id))
  }

  const handleCloseDock = () => {
    setActiveGauge(null)
  }

  const detailRows = activeGauge ? DETAILS[activeGauge] : []

  return (
    <section className={styles.wrap} aria-label="WakaTime snapshot">
      <div className={styles.gaugesStrip} role="group" aria-label="Gauge selector">
        {GAUGES.map((g) => (
          <GaugeButton
            key={g.id}
            gauge={g}
            isActive={activeGauge === g.id}
            onClick={() => handleGaugeClick(g.id)}
          />
        ))}
      </div>

      <AnimatePresence initial={false}>
        {activeGauge && detailRows.length > 0 && (
          <motion.div
            className={styles.detailsDock}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.9, 0.2, 1] }}
          >
            <div className={styles.dockHeader}>
              <span className={styles.dockTitle}>
                {GAUGES.find((g) => g.id === activeGauge)?.label ?? ''}
              </span>
              <button
                type="button"
                className={styles.dockClose}
                onClick={handleCloseDock}
                aria-label="Close details"
              >
                ×
              </button>
            </div>
            <ul className={styles.dockList}>
              {detailRows.map((row, i) => (
                <li key={i} className={styles.dockRow}>
                  {row}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default WakaSnapshot
