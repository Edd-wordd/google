import React from 'react'
import { buildCalloutsData } from './CalloutLabels'
import styles from './DossierModules.module.css'

export default function DossierModules({ latest, lastWorkout, readiness, loading }) {
  const data = buildCalloutsData(latest, lastWorkout, readiness)
  const modules = data.leftCallouts

  if (loading || !latest) {
    return (
      <div className={styles.stack}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.slab}>
            <div className={styles.slabTitle}>—</div>
            <div className={styles.skeletonBar} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.stack}>
      {modules.map((m) => (
        <div key={m.id} className={styles.slab}>
          <div className={styles.slabTitle}>{m.title}</div>
          <div className={styles.rows}>
            {m.lines.map(([label, value], j) => (
              <div key={j} className={styles.row}>
                <span className={styles.key}>{label}</span>
                <span className={styles.val}>{value ?? '—'}</span>
              </div>
            ))}
          </div>
          <div className={styles.bar}>
            <div
              className={styles.barFill}
              style={{
                width: `${Math.min(100, m.id === 'cardiac' ? ((latest.resting_hr ?? 0) / 120) * 100 : m.id === 'autonomic' ? ((latest.hrv ?? 0) / 80) * 100 : m.id === 'sleep' ? ((latest.sleep_minutes ?? 0) / 480) * 100 : Math.min(100, ((latest.steps ?? 0) / 15000) * 100))}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
