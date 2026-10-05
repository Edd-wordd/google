import React from 'react'
import styles from './ReadoutDock.module.css'

function deltaStr(curr, prev) {
  if (curr == null || prev == null) return null
  const d = curr - prev
  if (d === 0) return '→'
  return d > 0 ? `+${d}` : `${d}`
}

export default function ReadoutDock({ dailyMetrics, loading, isLive, syncing, lastSyncText }) {
  const latest = dailyMetrics?.[dailyMetrics.length - 1]
  const prev = dailyMetrics?.length >= 2 ? dailyMetrics[dailyMetrics.length - 2] : null

  const rhr = latest?.resting_hr ?? '—'
  const hrv = latest?.hrv ?? '—'
  const sleepMin = latest?.sleep_minutes
  const sleepStr = sleepMin != null ? `${Math.floor(sleepMin / 60)}h ${sleepMin % 60}m` : '—'
  const steps = latest?.steps != null ? latest.steps.toLocaleString() : '—'

  const rhrDelta = deltaStr(latest?.resting_hr, prev?.resting_hr)
  const hrvDelta = deltaStr(latest?.hrv, prev?.hrv)
  const sleepDelta = latest?.sleep_minutes != null && prev?.sleep_minutes != null
    ? (latest.sleep_minutes - prev.sleep_minutes) >= 0
      ? `+${Math.round((latest.sleep_minutes - prev.sleep_minutes) / 60)}h`
      : `${Math.round((latest.sleep_minutes - prev.sleep_minutes) / 60)}h`
    : null
  const stepsDelta = deltaStr(latest?.steps, prev?.steps)

  const status = syncing ? 'SYNCING' : isLive ? 'STABLE' : 'OFFLINE'

  if (loading) {
    return (
      <div className={styles.dock}>
        <div className={styles.slab}>
          <div className={styles.segments}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.segment}>
                <span className={styles.label}>—</span>
                <span className={styles.value}>—</span>
                <span className={styles.delta}>—</span>
              </div>
            ))}
          </div>
          <div className={styles.pulse} />
        </div>
        <div className={styles.subjectLine}>SUBJECT READOUT: —</div>
      </div>
    )
  }

  return (
    <div className={styles.dock}>
      <div className={styles.slab}>
        <div className={styles.segments}>
          <div className={styles.segment}>
            <span className={styles.label}>RHR</span>
            <span className={styles.value}>{rhr}</span>
            <span className={styles.delta}>{rhrDelta != null ? 'Δ ' + rhrDelta : ''}</span>
          </div>
          <div className={styles.segment}>
            <span className={styles.label}>HRV</span>
            <span className={styles.value}>{hrv}</span>
            <span className={styles.delta}>{hrvDelta != null ? 'Δ ' + hrvDelta : ''}</span>
          </div>
          <div className={styles.segment}>
            <span className={styles.label}>Sleep</span>
            <span className={styles.value}>{sleepStr}</span>
            <span className={styles.delta}>{sleepDelta ?? ''}</span>
          </div>
          <div className={styles.segment}>
            <span className={styles.label}>Steps</span>
            <span className={styles.value}>{steps}</span>
            <span className={styles.delta}>{stepsDelta != null ? 'Δ ' + stepsDelta : ''}</span>
          </div>
        </div>
        <div className={styles.pulse} />
      </div>
      <div className={styles.subjectLine}>
        SUBJECT READOUT: USER_01 · STATUS: {status} · LAST SYNC: {lastSyncText}
      </div>
    </div>
  )
}
