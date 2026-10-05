import React, { useState, useId, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MODE_COLORS } from '../HudRingChart/HudRingChart'
import styles from './FocusMixPanel.module.css'

const GAP_ANGLE_DEG = 3
const SEGMENT_STROKE = 6
const INNER_R = 26
const OUTER_R = 38

function polarToCart(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const start = polarToCart(cx, cy, r, startDeg)
  const end = polarToCart(cx, cy, r, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

function buildSegments(items, isDominant) {
  const segments = []
  let currentAngle = 0
  items.forEach((item) => {
    const sweepDeg = Math.max(0, (item.percent / 100) * 360 - GAP_ANGLE_DEG)
    const endAngle = currentAngle + sweepDeg
    if (sweepDeg > 0) {
      segments.push({
        ...item,
        startDeg: currentAngle,
        endDeg: endAngle,
        dominant: isDominant(item.label),
        color: MODE_COLORS[item.label] ?? MODE_COLORS.Other,
      })
    }
    currentAngle = endAngle + GAP_ANGLE_DEG
  })
  if (segments.length > 0 && currentAngle > 360) {
    const last = segments[segments.length - 1]
    last.endDeg = Math.max(last.startDeg, last.endDeg - (currentAngle - 360) - GAP_ANGLE_DEG)
  }
  return segments
}

export default function FocusMixPanel({ todayItems, monthItems }) {
  const filterId = useId().replace(/:/g, '-')
  const prefersReducedMotion = useReducedMotion()
  const [hoveredLabel, setHoveredLabel] = useState(null)
  const cx = 50
  const cy = 50

  const todayMax = useMemo(
    () => todayItems?.reduce((a, b) => (a.percent >= b.percent ? a : b)) ?? { label: 'Dev', percent: 35 },
    [todayItems]
  )
  const monthMax = useMemo(
    () => monthItems?.reduce((a, b) => (a.percent >= b.percent ? a : b)) ?? { label: 'Dev', percent: 38 },
    [monthItems]
  )

  const todaySegments = useMemo(
    () => buildSegments(todayItems ?? [], (l) => l === todayMax?.label),
    [todayItems, todayMax?.label]
  )
  const monthSegments = useMemo(
    () => buildSegments(monthItems ?? [], (l) => l === monthMax?.label),
    [monthItems, monthMax?.label]
  )

  const legendRows = useMemo(() => {
    const todayMap = Object.fromEntries((todayItems ?? []).map((i) => [i.label, i.percent]))
    const monthMap = Object.fromEntries((monthItems ?? []).map((i) => [i.label, i.percent]))
    return ['Dev', 'Create', 'Astro', 'Print', 'Explore', 'Other'].map((label) => ({
      label,
      todayPct: todayMap[label] ?? 0,
      monthPct: monthMap[label] ?? 0,
    }))
  }, [todayItems, monthItems])

  const drift = (monthMax?.percent ?? 38) - (todayMax?.percent ?? 35)
  const driftStr = drift >= 0 ? `+${drift}%` : `${drift}%`

  const drawTransition = prefersReducedMotion
    ? { duration: 0.1 }
    : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }

  return (
    <div className={styles.wrap} aria-label="Focus Mix">
      <div className={styles.titleTop}>FOCUS MIX</div>
      <div className={styles.body}>
        <div className={styles.chartArea}>
          <svg
            className={styles.ringSvg}
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <defs>
              <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Inner frame */}
            <circle
              className={styles.innerRing}
              cx={cx}
              cy={cy}
              r={INNER_R - SEGMENT_STROKE / 2 - 2}
              fill="none"
              strokeWidth="1"
              strokeLinecap="butt"
            />
            <circle
              className={styles.baseRing}
              cx={cx}
              cy={cy}
              r={INNER_R}
              fill="none"
              strokeWidth="1"
              strokeLinecap="butt"
            />

            {/* Inner ring — Today */}
            <g className={styles.segmentGroup}>
              {todaySegments.map((seg, i) => (
                <motion.path
                  key={`today-${i}`}
                  className={`${styles.segmentPath} ${hoveredLabel !== null && hoveredLabel !== seg.label ? styles.segmentDimmed : ''}`}
                  d={describeArc(cx, cy, INNER_R, seg.startDeg, seg.endDeg)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={SEGMENT_STROKE}
                  strokeLinecap="butt"
                  filter={seg.dominant ? `url(#${filterId})` : undefined}
                  initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={drawTransition}
                />
              ))}
            </g>

            {/* Outer ring frame */}
            <circle
              className={styles.baseRing}
              cx={cx}
              cy={cy}
              r={OUTER_R}
              fill="none"
              strokeWidth="1"
              strokeLinecap="butt"
            />

            {/* Outer ring — Month */}
            <g className={styles.segmentGroup}>
              {monthSegments.map((seg, i) => (
                <motion.path
                  key={`month-${i}`}
                  className={`${styles.segmentPath} ${hoveredLabel !== null && hoveredLabel !== seg.label ? styles.segmentDimmed : ''}`}
                  d={describeArc(cx, cy, OUTER_R, seg.startDeg, seg.endDeg)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={SEGMENT_STROKE}
                  strokeLinecap="butt"
                  filter={seg.dominant ? `url(#${filterId})` : undefined}
                  initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={drawTransition}
                />
              ))}
            </g>

            {/* Ticks */}
            {Array.from({ length: 24 }).map((_, i) => {
              const deg = i * 15
              const p1 = polarToCart(cx, cy, OUTER_R + 2, deg)
              const p2 = polarToCart(cx, cy, OUTER_R + 4, deg)
              return (
                <line
                  key={i}
                  className={styles.tick}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                />
              )
            })}
          </svg>

          <div className={styles.centerContent}>
            <div className={styles.centerRow}>
              <span className={styles.centerTag}>TODAY</span>
              <span className={styles.centerValue}>{todayMax?.percent ?? 35}%</span>
              <span className={styles.centerLabel}>{todayMax?.label ?? 'Dev'}</span>
            </div>
            <div className={styles.centerRow}>
              <span className={styles.centerTag}>MONTH</span>
              <span className={styles.centerValue}>{monthMax?.percent ?? 38}%</span>
              <span className={styles.centerLabel}>{monthMax?.label ?? 'Dev'}</span>
            </div>
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendHeader}>
            <span className={styles.legendColDot} aria-hidden />
            <span className={styles.legendColMode}>MODE</span>
            <span className={styles.legendColPct}>TODAY</span>
            <span className={styles.legendColPct}>MONTH</span>
          </div>
          {legendRows.map((row, i) => (
            <div
              key={i}
              className={styles.legendRow}
              data-label={row.label}
              onMouseEnter={() => setHoveredLabel(row.label)}
              onMouseLeave={() => setHoveredLabel(null)}
            >
              <span
                className={styles.legendDot}
                style={{ background: MODE_COLORS[row.label] ?? MODE_COLORS.Other }}
              />
              <span className={styles.legendName}>{row.label}</span>
              <span className={styles.legendPct}>{row.todayPct}%</span>
              <span className={styles.legendPct}>{row.monthPct}%</span>
            </div>
          ))}
        </div>
      </div>
      <p className={styles.insight}>
        Primary focus: {todayMax?.label ?? 'Dev'} (Today). Drift: {driftStr} Month.
      </p>
    </div>
  )
}
