import React, { useId } from 'react'
import clsx from 'clsx'
import styles from './BlueprintOverlay.module.css'

/**
 * Inline SVG humanoid wireframe + grid + node points. No external images.
 * Opacity 0.06–0.12; scanline only when live (controlled by parent).
 */
export default function BlueprintOverlay({ live = false, className }) {
  const gridId = useId().replace(/:/g, '-')
  // Simple humanoid outline: head, torso, arms, legs (wireframe style)
  const outlinePath = [
    'M 50 8 L 50 12',           // head center
    'M 42 12 Q 50 10 58 12',    // head ellipse
    'M 50 18 L 50 38',          // spine
    'M 50 22 L 32 28 M 50 22 L 68 28',  // shoulders
    'M 32 28 L 28 42 M 68 28 L 72 42',  // arms
    'M 50 38 L 38 58 M 50 38 L 62 58',  // hips to knees
    'M 38 58 L 36 78 M 62 58 L 64 78',  // lower legs
  ].join(' ')

  const nodePoints = [
    [50, 10], [50, 22], [50, 38], [50, 58],
    [32, 28], [68, 28], [38, 58], [62, 58],
  ]

  return (
    <div className={clsx(styles.wrap, className)} aria-hidden>
      <svg
        className={styles.svg}
        viewBox="0 0 100 86"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" opacity="0.4" />
          </pattern>
        </defs>
        <g className={styles.outline}>
          <rect width="100" height="86" fill={`url(#${gridId})`} />
          <path d={outlinePath} fill="none" stroke="currentColor" strokeWidth="0.35" />
          {nodePoints.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.2" fill="currentColor" />
          ))}
        </g>
      </svg>
      {live && <div className={styles.scanline} aria-hidden />}
    </div>
  )
}
