import React, { useState, useEffect } from 'react'
import { getWorkouts } from '../data/lifeOpsAdapter'
import styles from './WorkoutsFeed.module.css'

function formatLogTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function formatLogDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return 'TODAY'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'YEST'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }).toUpperCase()
}

function formatDuration(min) {
  if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60}m`
  return `${min}m`
}

const TYPE_TAG = { run: 'RUN', ride: 'RIDE', walk: 'WALK' }

export default function WorkoutsFeed() {
  const [workouts, setWorkouts] = useState(null)
  const [loading, setLoading] = useState(true)
  const now = Date.now()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  useEffect(() => {
    let cancelled = false
    getWorkouts(14).then((list) => {
      if (!cancelled) setWorkouts(list)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const list = workouts ?? []

  return (
    <div className={styles.logStream}>
      <div className={styles.logScroll}>
        {loading ? (
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.logRow}>
                <span className={styles.logTime}>--:--:--</span>
                <span className={styles.logTag}>---</span>
                <span className={styles.logSummary}>loading...</span>
              </div>
            ))}
          </>
        ) : (
          list.map((w, i) => {
            const ts = new Date(w.started_at).getTime()
            const isToday = ts >= todayStart.getTime()
            const isLatest = i === 0
            const summary = [
              w.distance_km != null ? `${w.distance_km} km` : null,
              formatDuration(w.duration_min),
              w.avg_hr != null ? `${w.avg_hr} bpm` : null,
            ].filter(Boolean).join(' · ')
            return (
              <div
                key={w.id}
                className={styles.logRow}
                data-today={isToday}
                data-latest={isLatest}
              >
                {isLatest && <span className={styles.logCursor} aria-hidden />}
                <span className={styles.logTime}>{formatLogTime(w.started_at)}</span>
                <span className={styles.logDate}>{formatLogDate(w.started_at)}</span>
                <span className={styles.logTag} data-type={w.type}>
                  {TYPE_TAG[w.type] ?? w.type}
                </span>
                <span className={styles.logSummary}>{summary || '—'}</span>
                <span className={styles.logSource}>{w.source === 'healthkit' ? 'HK' : 'STRAVA'}</span>
                <div className={styles.logActions} onClick={(e) => e.stopPropagation()}>
                  <button type="button" className={styles.logBtn} aria-label="View" title="View">◇</button>
                  <button type="button" className={styles.logBtn} aria-label="Map" title="Map">⌖</button>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className={styles.logFade} aria-hidden />
      <div className={styles.logTail}>— END OF BUFFER —</div>
    </div>
  )
}
