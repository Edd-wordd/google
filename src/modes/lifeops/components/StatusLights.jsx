import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import styles from './StatusLights.module.css'

function formatLastSync(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  const now = Date.now()
  const diff = now - ts
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function StatusLights({ connections, syncing, onSyncClick }) {
  const strava = connections?.stravaConnected
  const healthkit = connections?.healthkitConnected

  return (
    <div className={styles.wrap}>
      <div className={styles.lights}>
        <div className={styles.lightRow}>
          <span className={styles.sourceLabel}>Strava</span>
          <motion.span
            className={clsx(styles.led, strava && styles.ledOn, syncing === 'strava' && styles.ledBlink)}
            animate={syncing === 'strava' ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
          <span className={styles.syncTime}>{formatLastSync(connections?.stravaLastSync)}</span>
        </div>
        <div className={styles.lightRow}>
          <span className={styles.sourceLabel}>HealthKit</span>
          <motion.span
            className={clsx(styles.led, healthkit && styles.ledOn, syncing === 'healthkit' && styles.ledBlink)}
            animate={syncing === 'healthkit' ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
          <span className={styles.syncTime}>{formatLastSync(connections?.healthkitLastSync)}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.syncBtn}
          onClick={() => onSyncClick?.('strava')}
          disabled={!!syncing}
          aria-label="Simulate Strava sync"
        >
          Sync Strava
        </button>
        <button
          type="button"
          className={styles.syncBtn}
          onClick={() => onSyncClick?.('healthkit')}
          disabled={!!syncing}
          aria-label="Simulate HealthKit sync"
        >
          Sync HK
        </button>
      </div>
    </div>
  )
}
