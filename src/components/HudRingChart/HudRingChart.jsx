import React, { useId } from 'react'
import styles from './HudRingChart.module.css'

/* Shared color map — muted for precision HUD, used by ring and legend */
export const MODE_COLORS = {
  Dev: 'rgba(255, 190, 100, 0.65)',
  Create: 'rgba(170, 150, 220, 0.6)',
  Astro: 'rgba(150, 135, 200, 0.6)',
  Print: 'rgba(220, 160, 80, 0.6)',
  Explore: 'rgba(0, 180, 170, 0.6)',
  Other: 'rgba(120, 130, 150, 0.5)',
}

const GAP_ANGLE_DEG = 3
const SEGMENT_STROKE = 10

/* deg: 0 = top, 90 = right, 180 = bottom, 270 = left (clockwise) */
function polarToCart(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const start = polarToCart(cx, cy, r, startDeg)
  const end = polarToCart(cx, cy, r, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

function HudRingChart({
  title,
  items = [],
  subtitle = '',
  variant = 'daily',
}) {
  const filterId = useId().replace(/:/g, '-')
  const cx = 50
  const cy = 50
  const r = 42

  /* Normalize items: support { label, percent } or { name, percent, mode } */
  const normalizedItems = items.map((item) => ({
    label: item.label ?? item.name ?? 'Other',
    percent: item.percent ?? 0,
    mode: (item.label ?? item.name ?? 'other').toLowerCase(),
  }))

  /* Highest category for center display */
  const maxItem = normalizedItems.reduce((a, b) =>
    (a.percent >= b.percent ? a : b)
  )
  const centerValue = maxItem?.percent ?? 0
  const centerLabel = maxItem?.label ?? ''
  const isDominant = (label) => label === (maxItem?.label ?? '')

  /* Build arc segments: start at 0 (top), crisp arcs with gaps */
  const segments = []
  let currentAngle = 0

  normalizedItems.forEach((item) => {
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

  /* Ensure no 360 wrap overlap — clamp last segment if needed */
  if (segments.length > 0 && currentAngle > 360) {
    const last = segments[segments.length - 1]
    const overflow = currentAngle - 360
    last.endDeg = Math.max(last.startDeg, last.endDeg - overflow - GAP_ANGLE_DEG)
  }

  /* Outer broken dashes: 6 short arc segments */
  const dashCount = 6
  const dashGap = 360 / dashCount
  const dashArcLen = 20

  /* Radial tick marks (gauge-style) */
  const tickCount = 24
  const tickGap = 360 / tickCount

  /* Callout angles */
  const calloutCount = Math.min(3, normalizedItems.length)
  const calloutAngles = normalizedItems
    .slice(0, calloutCount)
    .map((_, i) => (50 / (calloutCount - 1 || 1)) * -i)

  return (
    <div className={`${styles.wrap} ${styles[variant]}`} aria-label={title}>
      <div className={styles.chartCol}>
        {/* Title above ring — HUD tab style */}
        <div className={styles.titleTop}>{title}</div>
        <div className={styles.chartArea}>
          <svg
            className={styles.ringSvg}
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <defs>
              <filter
                id={filterId}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="0.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Inner ring — thin frame */}
            <circle
              className={styles.innerRing}
              cx={cx}
              cy={cy}
              r={r - SEGMENT_STROKE / 2 - 2}
              fill="none"
              strokeWidth="1"
              strokeLinecap="butt"
            />

            {/* Base ring — thin, low opacity */}
            <circle
              className={styles.baseRing}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              strokeWidth="1"
              strokeLinecap="butt"
            />

            {/* Multi-segment ring — crisp arcs, butt caps, constant width */}
            <g className={styles.segmentGroup}>
              {segments.map((seg, i) => (
                <path
                  key={i}
                  className={styles.segmentPath}
                  d={describeArc(cx, cy, r, seg.startDeg, seg.endDeg)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={SEGMENT_STROKE}
                  strokeLinecap="butt"
                  filter={seg.dominant ? `url(#${filterId})` : undefined}
                />
              ))}
            </g>

            {/* Outer broken dashes — technical feel */}
            {Array.from({ length: dashCount }).map((_, i) => {
              const startDeg = i * dashGap + 4
              const endDeg = startDeg + dashArcLen
              return (
                <path
                  key={i}
                  className={styles.outerDash}
                  d={describeArc(cx, cy, r + SEGMENT_STROKE / 2 + 4, startDeg, endDeg)}
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="butt"
                />
              )
            })}

            {/* Radial tick marks — gauge style */}
            <g className={styles.ticks}>
              {Array.from({ length: tickCount }).map((_, i) => {
                const deg = i * tickGap
                const outerR = r + SEGMENT_STROKE / 2 + 3
                const innerR = r + SEGMENT_STROKE / 2
                const p1 = polarToCart(cx, cy, innerR, deg)
                const p2 = polarToCart(cx, cy, outerR, deg)
                return (
                  <line
                    key={i}
                    className={styles.tick}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    strokeWidth="0.8"
                    strokeLinecap="butt"
                  />
                )
              })}
            </g>
          </svg>

          {/* Center content */}
          <div className={styles.centerContent}>
            <span className={styles.percent}>{centerValue}%</span>
            {centerLabel && (
              <span className={styles.centerLabel}>{centerLabel}</span>
            )}
            {subtitle && (
              <span className={styles.subtitle}>{subtitle}</span>
            )}
          </div>

          {/* Callout lines */}
          {calloutAngles.map((angle, i) => (
            <div
              key={i}
              className={styles.callout}
              style={{ '--angle': `${angle}deg` }}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {normalizedItems.map((item, i) => (
          <div
            key={i}
            className={styles.legendRow}
            data-label={item.label}
          >
            <span
              className={styles.legendDot}
              style={{ background: MODE_COLORS[item.label] ?? MODE_COLORS.Other }}
            />
            <span className={styles.legendName}>{item.label}</span>
            <span className={styles.legendPct}>{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HudRingChart
