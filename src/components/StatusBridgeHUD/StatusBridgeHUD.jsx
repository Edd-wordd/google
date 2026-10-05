import React, { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './StatusBridgeHUD.module.css'

/* Hardcoded placeholder data */
const DATA = {
  healthPct: 70,
  chargePct: 82,
  time: '18:42:09',
  coords: '17.7421 N • 64.7419 W',
  pingMs: 24,
  events: 3,
  queue: 1,
}

/* Robot silhouette — simple placeholder SVG */
function RobotIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={styles.robotIcon}
      aria-hidden
    >
      <rect x="6" y="8" width="12" height="10" rx="2" fill="currentColor" opacity="0.8" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <rect x="10" y="16" width="4" height="2" rx="0.5" fill="currentColor" opacity="0.6" />
      <rect x="11" y="4" width="2" height="4" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

/* Battery icon */
function BatteryIcon({ pct }) {
  return (
    <svg viewBox="0 0 16 8" className={styles.batteryIcon} aria-hidden>
      <rect x="0" y="1" width="14" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <rect x="14" y="2.5" width="1" height="3" rx="0.3" fill="currentColor" opacity="0.6" />
      <rect x="1" y="2" width={`${(pct / 100) * 12}`} height="4" rx="0.5" fill="currentColor" opacity="0.8" />
    </svg>
  )
}

/* Signal bars */
function SignalBars() {
  return (
    <div className={styles.signalBars} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={styles.signalBar} data-active={i <= 4} />
      ))}
    </div>
  )
}

/* Compass N/E/S/W ring */
function CompassChip() {
  return (
    <div className={styles.compassChip} aria-hidden>
      <span className={styles.compassN}>N</span>
      <span className={styles.compassE}>E</span>
      <span className={styles.compassS}>S</span>
      <span className={styles.compassW}>W</span>
      <svg viewBox="0 0 24 24" className={styles.compassArrow}>
        <path d="M12 4 L12 20 M12 4 L10 8 M12 4 L14 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

/* ECG heartbeat monitor — SVG path with stroke-dashoffset animation */
function EcgMonitor({ healthPct, prefersReducedMotion }) {
  const filterId = useId().replace(/:/g, '-')
  /* Heartbeat path: baseline → spike → dip → recovery (×2 per cycle) */
  const pathD = 'M 0 10 L 15 10 L 18 2 L 20 18 L 25 10 L 40 10 L 43 2 L 45 18 L 50 10 L 65 10 L 68 2 L 70 18 L 75 10 L 90 10'

  return (
    <div className={styles.ecgRow}>
      <div className={styles.ecgWindow}>
        <div className={styles.ecgCornerTicks} aria-hidden />
        <div className={styles.ecgGridDots} aria-hidden />
        <svg
          className={styles.ecgSvg}
          viewBox="0 0 90 20"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <filter id={filterId} x="-10%" y="-20%" width="120%" height="140%">
              <feGaussianBlur stdDeviation="0.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            className={`${styles.ecgPath} ${prefersReducedMotion ? styles.ecgPathStatic : ''}`}
            d={pathD}
            fill="none"
            stroke="rgba(0, 220, 180, 0.75)"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
            filter={`url(#${filterId})`}
          />
        </svg>
        {!prefersReducedMotion && (
          <div className={styles.ecgPulseDot} aria-hidden />
        )}
      </div>
      <span className={styles.ecgValue}>{healthPct}%</span>
    </div>
  )
}

function StatusBridgeHUD() {
  const { healthPct, chargePct, time, coords, pingMs, events, queue } = DATA
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={styles.wrap}>
      <div className={styles.frame}>
        <div className={styles.gridOverlay} aria-hidden />

        {/* LEFT ZONE — Robot / Atlas */}
        <div className={styles.zoneLeft}>
          <div className={styles.robotBadge}>
            <div className={styles.robotIconWrap}>
              <RobotIcon />
            </div>
            <span className={styles.robotLabel}>ATLAS</span>
          </div>
          <div className={styles.healthBlock}>
            <span className={styles.healthLabel}>HEALTH</span>
            <EcgMonitor healthPct={healthPct} prefersReducedMotion={!!prefersReducedMotion} />
          </div>
          <div className={styles.chargeRow}>
            <BatteryIcon pct={chargePct} />
            <span className={styles.chargeLabel}>CHARGE</span>
            <span className={styles.chargeValue}>{chargePct}%</span>
          </div>
        </div>

        {/* Tech divider */}
        <div className={styles.divider} aria-hidden />

        {/* CENTER ZONE — Time / Coords */}
        <div className={styles.zoneCenter}>
          <div className={styles.timeReadout}>{time}</div>
          <div className={styles.coordsReadout}>{coords}</div>
          <div className={styles.compassWrap}>
            <CompassChip />
          </div>
          <div className={styles.microStats}>
            <span className={styles.microStat}>ALT 120m</span>
            <span className={styles.microStat}>SPD 0.0</span>
          </div>
        </div>

        {/* Tech divider */}
        <div className={styles.divider} aria-hidden />

        {/* RIGHT ZONE — Link / Signal */}
        <div className={styles.zoneRight}>
          <motion.div
            className={styles.linkBadge}
            animate={
              prefersReducedMotion
                ? { boxShadow: '0 0 8px rgba(0, 220, 180, 0.15)' }
                : {
                    boxShadow: [
                      '0 0 8px rgba(0, 220, 180, 0.15)',
                      '0 0 14px rgba(0, 220, 180, 0.25)',
                      '0 0 8px rgba(0, 220, 180, 0.15)',
                    ],
                  }
            }
            transition={
              prefersReducedMotion ? { duration: 0 } : { duration: 3, repeat: Infinity, repeatType: 'reverse' }
            }
          >
            LINK: STABLE
          </motion.div>
          <div className={styles.signalRow}>
            <span className={styles.pingValue}>{pingMs} ms</span>
            <span className={styles.pingLabel}>PING</span>
            <SignalBars />
          </div>
          <div className={styles.chipRow}>
            <span className={styles.chip} data-type="events">EVENTS {events}</span>
            <span className={styles.chip} data-type="queue">QUEUE {queue}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusBridgeHUD
