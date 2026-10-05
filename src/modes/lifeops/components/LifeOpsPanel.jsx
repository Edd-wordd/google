/**
 * LIFE OPS — BIOMETRIC CONSOLE
 *
 * PLAN (files changed):
 * - LifeOpsPanel.jsx: Page structure. Three-column layout: left stats pod, center body stage (canvas + readout), right stats pod.
 *   No horizontal divider that splits the page in half.
 * - LifeOpsPanel.module.css: .biometricConsole grid 320px 1fr 320px, gap 18px. Responsive at 1100px: single column, body first.
 * - BodyHologram3D.jsx: GLTF body with fit-camera-to-object (Box3, center, near/far, distance from FOV). Grey-blue material override.
 *   MODEL_SCALE ~5×; camera fitted so full body visible (no clipping).
 */

import React, { useState, useEffect } from 'react'
import DossierModules from './DossierModules'
import TelemetryRack from './TelemetryRack'
import ReadoutDock from './ReadoutDock'
import BodyHologram3D from './BodyHologram3D'
import WorkoutsFeed from './WorkoutsFeed'
import ReadinessAlerts from './ReadinessAlerts'
import { getConnections, getDailyMetrics, getWorkouts, getReadiness, simulateSync } from '../data/lifeOpsAdapter'
import clsx from 'clsx'
import styles from './LifeOpsPanel.module.css'

class HologramErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export default function LifeOpsPanel() {
  const [connections, setConnections] = useState(null)
  const [dailyMetrics, setDailyMetrics] = useState(null)
  const [workouts, setWorkouts] = useState(null)
  const [readiness, setReadiness] = useState(null)
  const [syncing, setSyncing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      getConnections(),
      getDailyMetrics(7),
      getWorkouts(14),
      getReadiness(),
    ])
      .then(([conn, daily, wos, read]) => {
        if (!cancelled) {
          setConnections(conn)
          setDailyMetrics(daily)
          setWorkouts(wos)
          setReadiness(read)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const handleSync = async (source) => {
    setSyncing(source)
    try {
      const conn = await simulateSync(source)
      setConnections(conn)
      const [daily, wos, read] = await Promise.all([
        getDailyMetrics(7),
        getWorkouts(14),
        getReadiness(),
      ])
      setDailyMetrics(daily)
      setWorkouts(wos)
      setReadiness(read)
    } finally {
      setSyncing(null)
    }
  }

  const isLive = !loading && !!connections?.stravaConnected
  const lastSyncText = isLive ? '2m' : '—'

  return (
    <div className={clsx(styles.panel, styles.hero)}>
      {isLive && <div className={styles.scanlineOverlay} aria-hidden />}
      <div className={styles.dossierStrip}>
        <span className={styles.dossierLeft}>PROJECT: HUMAN.EXE — LIFE OPS</span>
        <div className={styles.dossierRight}>
          <span>CLASSIFICATION: TOP SECRET</span>
          <span className={styles.waveTag}>WAVE I</span>
        </div>
      </div>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>LIFE OPS — BIOMETRIC CONSOLE</h2>
          <span className={styles.statusPill} data-status={syncing ? 'syncing' : connections?.stravaConnected ? 'connected' : 'disconnected'}>
            {syncing ? 'SYNCING' : connections?.stravaConnected ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>
        <p className={styles.subtitle}>Vitals · 7d trend</p>
      </header>

      <div className={styles.contentWrap}>
        <div className={styles.lifeOpsBay}>
          <div className={styles.bayBackground} aria-hidden />

          <div className={styles.biometricConsole}>
            <div className={styles.statsPodLeft}>
              <DossierModules
                latest={dailyMetrics?.[dailyMetrics.length - 1]}
                lastWorkout={workouts?.[0]}
                readiness={readiness}
                loading={loading}
              />
            </div>

            <div className={styles.bodyStage}>
              <div className={styles.bodyStageCanvasWrap}>
                <div className={styles.bodyStageCanvasInner}>
                  <HologramErrorBoundary
                    fallback={<div className={styles.modelNotFound}>MODEL NOT FOUND</div>}
                  >
                    <React.Suspense fallback={null}>
                      <BodyHologram3D />
                    </React.Suspense>
                  </HologramErrorBoundary>
                </div>
                <div className={styles.reticleOverlay}>
                  <svg className={styles.reticleSvg} viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="70" cy="90" r="42" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
                    <circle cx="70" cy="90" r="28" stroke="currentColor" strokeWidth="0.35" opacity="0.2" />
                    <line x1="70" y1="48" x2="70" y2="58" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
                    <line x1="70" y1="122" x2="70" y2="132" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
                    <line x1="28" y1="90" x2="38" y2="90" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
                    <line x1="102" y1="90" x2="112" y2="90" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
                  </svg>
                </div>
              </div>
              <div className={styles.readoutDockWrap}>
                <ReadoutDock
                  dailyMetrics={dailyMetrics}
                  loading={loading}
                  isLive={isLive}
                  syncing={syncing}
                  lastSyncText={lastSyncText}
                />
              </div>
            </div>

            <div className={styles.statsPodRight}>
              <TelemetryRack
                connections={connections}
                syncing={syncing}
                dailyMetrics={dailyMetrics}
                readiness={readiness}
                loading={loading}
                onSyncClick={handleSync}
              />
              <div className={styles.rightPodSection}>
                <div className={styles.rightPodHeader}>
                  <span className={styles.rightPodTitle}>ACTIVITY LOG</span>
                  <span className={styles.rightPodMicroline}>
                    {workouts?.[0]?.started_at
                      ? (() => {
                          const s = Math.round((Date.now() - new Date(workouts[0].started_at).getTime()) / 1000)
                          return s < 60 ? `LAST: ${s}s` : `LAST: ${Math.floor(s / 60)}m`
                        })()
                      : '—'}
                  </span>
                </div>
                <WorkoutsFeed />
              </div>
              <div className={styles.rightPodSection}>
                <div className={styles.rightPodHeader}>
                  <span className={styles.rightPodTitle}>DIAGNOSTICS</span>
                  <span className={styles.rightPodMicroline}>
                    {loading ? 'PENDING' : 'CURRENT'}
                  </span>
                </div>
                <ReadinessAlerts />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
