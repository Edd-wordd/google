import React, { useState, useEffect } from 'react'
import { getReadiness } from '../data/lifeOpsAdapter'
import styles from './ReadinessAlerts.module.css'

function alertCode(alert) {
  const t = (alert.type || '').toUpperCase()
  const text = (alert.text || '').toLowerCase()
  if (text.includes('sleep')) return 'SLEEP-LOW'
  if (text.includes('hrv')) return 'HRV-DIP'
  if (text.includes('rhr') || text.includes('elevated')) return 'RHR-ELEV'
  return t ? `${t}-01` : 'WARN'
}

export default function ReadinessAlerts() {
  const [readiness, setReadiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    let cancelled = false
    getReadiness().then((r) => {
      if (!cancelled) setReadiness(r)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => p + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const score = readiness?.score ?? 0
  const alerts = readiness?.alerts ?? []
  const causes = readiness?.causes ?? { sleep: 0, hrv: 0, rhr: 0 }

  return (
    <div className={styles.diagnostics}>
      <div className={styles.diagBody}>
        <div className={styles.scoreBarWrap}>
          <span className={styles.scoreBarLabel}>READINESS SCORE</span>
          <div className={styles.scoreBarTrack}>
            <div
              className={styles.scoreBarFill}
              style={{ width: `${score}%` }}
              data-tier={score >= 70 ? 'ok' : score >= 40 ? 'warn' : 'low'}
            />
          </div>
          <span className={styles.scoreBarValue}>
            {loading ? '—' : `${score}/100`}
          </span>
        </div>

        <div className={styles.subsystemBlock}>
          <span className={styles.subsystemTitle}>SUBSYSTEM LOAD</span>
          {loading ? (
            <>
              <div className={styles.subRow}><span className={styles.subLabel}>SLEEP</span><div className={styles.subBar}><span className={styles.subBarFill} style={{ width: '0%' }} /></div><span className={styles.subPct}>—</span></div>
              <div className={styles.subRow}><span className={styles.subLabel}>HRV</span><div className={styles.subBar}><span className={styles.subBarFill} style={{ width: '0%' }} /></div><span className={styles.subPct}>—</span></div>
              <div className={styles.subRow}><span className={styles.subLabel}>RHR</span><div className={styles.subBar}><span className={styles.subBarFill} style={{ width: '0%' }} /></div><span className={styles.subPct}>—</span></div>
            </>
          ) : (
            <>
              <div className={styles.subRow}>
                <span className={styles.subLabel}>SLEEP</span>
                <div className={styles.subBar}>
                  <span className={styles.subBarFill} style={{ width: `${causes.sleep}%` }} />
                </div>
                <span className={styles.subPct}>{causes.sleep}%</span>
              </div>
              <div className={styles.subRow}>
                <span className={styles.subLabel}>HRV</span>
                <div className={styles.subBar}>
                  <span className={styles.subBarFill} style={{ width: `${causes.hrv}%` }} />
                </div>
                <span className={styles.subPct}>{causes.hrv}%</span>
              </div>
              <div className={styles.subRow}>
                <span className={styles.subLabel}>RHR</span>
                <div className={styles.subBar}>
                  <span className={styles.subBarFill} style={{ width: `${causes.rhr}%` }} />
                </div>
                <span className={styles.subPct}>{causes.rhr}%</span>
              </div>
            </>
          )}
        </div>

        <div className={styles.warningsBlock}>
          <span className={styles.warningsTitle}>WARNINGS</span>
          {loading ? (
            <div className={styles.warnSkeleton}>—</div>
          ) : alerts.length === 0 ? (
            <div className={styles.warnNone}>NO ACTIVE WARNINGS</div>
          ) : (
            <ul className={styles.warnList}>
              {alerts.map((a) => (
                <li key={a.id} className={styles.warnLine}>
                  <span className={styles.warnMarker} data-dot={a.dot} aria-hidden>▸</span>
                  <span className={styles.warnCode}>[{alertCode(a)}]</span>
                  <span className={styles.warnText}>{a.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className={styles.pulseIndicator} aria-hidden>
        <span className={styles.pulseLine} style={{ opacity: pulse % 2 === 0 ? 0.9 : 0.3 }} />
      </div>
    </div>
  )
}
