import React from 'react'
import TinySparkline from './TinySparkline'
import clsx from 'clsx'
import styles from './TelemetryRack.module.css'

function formatLastSync(ts) {
  if (!ts) return '—'
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60000) return 'Now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  return '—'
}

export default function TelemetryRack({ connections, syncing, dailyMetrics, readiness, loading, onSyncClick }) {
  const latest = dailyMetrics?.[dailyMetrics.length - 1]
  const strava = connections?.stravaConnected
  const healthkit = connections?.healthkitConnected

  const sparkData = {
    rhr: dailyMetrics?.map((d) => d.resting_hr) ?? [],
    hrv: dailyMetrics?.map((d) => d.hrv) ?? [],
  }

  if (loading) {
    return (
      <div className={styles.rack}>
        <div className={styles.capsule}>
          <span className={styles.capsuleLabel}>CONNECTIONS</span>
          <div className={styles.ledRow}>
            <span className={styles.led} />
            <span className={styles.led} />
          </div>
        </div>
        <div className={styles.table}>
          <div className={styles.tableRow}><span>—</span><span>—</span></div>
        </div>
        <div className={styles.charts}>
          <div className={styles.chartSkeleton} />
          <div className={styles.chartSkeleton} />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.rack}>
      <div className={styles.capsule}>
        <span className={styles.capsuleLabel}>CONNECTIONS</span>
        <div className={styles.ledRow}>
          <span className={styles.source}>Strava</span>
          <span className={clsx(styles.led, strava && styles.ledOn, syncing === 'strava' && styles.ledBlink)} />
          <span className={styles.meta}>{formatLastSync(connections?.stravaLastSync)}</span>
        </div>
        <div className={styles.ledRow}>
          <span className={styles.source}>HealthKit</span>
          <span className={clsx(styles.led, healthkit && styles.ledOn, syncing === 'healthkit' && styles.ledBlink)} />
          <span className={styles.meta}>{formatLastSync(connections?.healthkitLastSync)}</span>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.syncBtn} onClick={() => onSyncClick?.('strava')} disabled={!!syncing}>Sync</button>
        </div>
      </div>

      <div className={styles.table}>
        <div className={styles.tableRow}>
          <span className={styles.tableKey}>Steps</span>
          <span className={styles.tableVal}>{latest?.steps != null ? latest.steps.toLocaleString() : '—'}</span>
        </div>
        <div className={styles.tableRow}>
          <span className={styles.tableKey}>Sleep</span>
          <span className={styles.tableVal}>{latest?.sleep_minutes != null ? `${(latest.sleep_minutes / 60).toFixed(1)}h` : '—'}</span>
        </div>
        <div className={styles.tableRow}>
          <span className={styles.tableKey}>HRV</span>
          <span className={styles.tableVal}>{latest?.hrv ?? '—'}</span>
        </div>
        <div className={styles.tableRow}>
          <span className={styles.tableKey}>RHR</span>
          <span className={styles.tableVal}>{latest?.resting_hr ?? '—'}</span>
        </div>
      </div>

      <div className={styles.charts}>
        <div className={styles.chart}>
          <span className={styles.chartLabel}>RHR 7d</span>
          <TinySparkline data={sparkData.rhr} width={72} height={20} />
        </div>
        <div className={styles.chart}>
          <span className={styles.chartLabel}>HRV 7d</span>
          <TinySparkline data={sparkData.hrv} width={72} height={20} />
        </div>
      </div>
    </div>
  )
}
