import React from 'react'
import TinySparkline from './TinySparkline'
import clsx from 'clsx'
import styles from './SystemsColumn.module.css'

/**
 * Dense micro-stats: operational efficiency, stability, 7d sparklines.
 */
export default function SystemsColumn({ dailyMetrics, readiness, loading }) {
  if (loading) {
    return (
      <div className={styles.wrap}>
        <span className={styles.sectionTitle}>SYSTEMS</span>
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} />
        <div className={styles.sparkGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.sparkSkeleton} />
          ))}
        </div>
      </div>
    )
  }

  const latest = dailyMetrics?.[dailyMetrics.length - 1]
  const operationalEfficiency = readiness?.score ?? 0
  const hrv = latest?.hrv ?? 0
  const sleepMin = latest?.sleep_minutes ?? 0
  const sleepScore = Math.min(100, Math.round((sleepMin / 480) * 100))
  const stabilityScore = Math.round((hrv / 80) * 40 + (sleepScore / 100) * 60)

  const sparkData = {
    hrv: dailyMetrics?.map((d) => d.hrv) ?? [],
    rhr: dailyMetrics?.map((d) => d.resting_hr) ?? [],
    sleep: dailyMetrics?.map((d) => (d.sleep_minutes ?? 0) / 60) ?? [],
    steps: dailyMetrics?.map((d) => (d.steps ?? 0) / 1000) ?? [],
  }

  const rhr = latest?.resting_hr ?? '—'
  const steps = latest?.steps ?? '—'
  const sleepH = latest?.sleep_minutes != null ? (latest.sleep_minutes / 60).toFixed(1) : '—'

  return (
    <div className={styles.wrap}>
      <span className={styles.sectionTitle}>SYSTEMS</span>
      <div className={styles.matrix}>
        <span className={styles.matrixLabel}>RHR</span>
        <span className={styles.matrixLabel}>HRV</span>
        <span className={styles.matrixLabel}>REC</span>
        <span className={styles.matrixVal}>{rhr}</span>
        <span className={styles.matrixVal}>{latest?.hrv ?? '—'}</span>
        <span className={styles.matrixVal}>{operationalEfficiency}</span>
        <span className={styles.matrixLabel}>STP</span>
        <span className={styles.matrixLabel}>SLP</span>
        <span className={styles.matrixLabel}>STB</span>
        <span className={styles.matrixVal}>{steps}</span>
        <span className={styles.matrixVal}>{sleepH}</span>
        <span className={styles.matrixVal}>{Math.min(100, stabilityScore)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Operational efficiency</span>
        <span className={styles.pct}>{operationalEfficiency}%</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Stability score</span>
        <span className={styles.pct}>{Math.min(100, stabilityScore)}</span>
      </div>
      <div className={styles.sparkGrid}>
        <div className={styles.sparkItem}>
          <span className={styles.sparkLabel}>HRV</span>
          <TinySparkline data={sparkData.hrv} width={36} height={14} />
        </div>
        <div className={styles.sparkItem}>
          <span className={styles.sparkLabel}>RHR</span>
          <TinySparkline data={sparkData.rhr} width={36} height={14} />
        </div>
        <div className={styles.sparkItem}>
          <span className={styles.sparkLabel}>Sleep</span>
          <TinySparkline data={sparkData.sleep} width={36} height={14} />
        </div>
        <div className={styles.sparkItem}>
          <span className={styles.sparkLabel}>Steps</span>
          <TinySparkline data={sparkData.steps} width={36} height={14} />
        </div>
      </div>
    </div>
  )
}
