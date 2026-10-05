import React, { useId } from 'react'
import clsx from 'clsx'
import styles from './SubjectStage.module.css'

/**
 * HUMAN.EXE-style blueprint: front-facing human silhouette (inline SVG only).
 * Layered: grid + base fill + outline + inner anatomy + circuit traces + node points.
 * Opacity ~0.10–0.18; vignette holds center; optional slow scan in Live mode.
 */
export default function SubjectStage({ live = false, className }) {
  const uid = useId().replace(/:/g, '-')

  // Front-facing silhouette: head → neck → shoulders → torso → waist → hips (symmetric)
  const bodyPath =
    'M 50 3.5 A 11 9 0 0 1 61 10.5 A 11 9 0 0 1 50 19 L 41 19 L 36 25 L 28 29 L 26 35 L 25 50 L 28 64 L 50 74 L 72 64 L 75 50 L 74 35 L 72 29 L 64 25 L 59 19 L 50 19 Z'

  // Inner anatomy: neck tendons (horizontal), pectoral curve, ribs, center line
  const neckContours = [
    'M 40 18 L 60 18',
    'M 38 21 L 62 21',
  ]
  const pectoralLeft = 'M 32 30 Q 38 38 36 48'
  const pectoralRight = 'M 68 30 Q 62 38 64 48'
  const ribLeft = 'M 28 36 Q 30 42 28 50'
  const ribRight = 'M 72 36 Q 70 42 72 50'
  const centerLine = 'M 50 24 L 50 68'
  const abdomenContour = 'M 32 58 Q 50 62 68 58'

  // Circuit traces: orthogonal + a few diagonals (technical blueprint feel)
  const circuitTraces = [
    'M 22 28 L 78 28',
    'M 24 50 L 76 50',
    'M 50 20 L 50 72',
    'M 34 34 L 66 34',
    'M 34 34 L 34 58',
    'M 66 34 L 66 58',
    'M 34 58 L 66 58',
    'M 38 42 L 62 42',
    'M 42 38 L 42 62',
    'M 58 38 L 58 62',
    'M 36 46 L 64 54',
    'M 64 46 L 36 54',
  ]

  // Node points: head, sternum, heart-left, abdomen (for callout alignment)
  const nodes = [
    { id: 'head', cx: 50, cy: 20 },
    { id: 'sternum', cx: 50, cy: 38 },
    { id: 'heart-left', cx: 42, cy: 40 },
    { id: 'abdomen', cx: 50, cy: 60 },
  ]

  return (
    <div className={clsx(styles.wrap, live && styles.live, className)} aria-hidden>
      <svg
        className={styles.svg}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id={`grid-${uid}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.15" opacity="0.4" />
          </pattern>
          <filter id={`node-glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {live && (
            <linearGradient id={`scan-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,220,200,0)" />
              <stop offset="50%" stopColor="rgba(0,220,200,0.03)" />
              <stop offset="100%" stopColor="rgba(0,220,200,0)" />
            </linearGradient>
          )}
        </defs>

        {/* 1) Grid + ticks behind */}
        <rect width="100" height="100" fill={`url(#grid-${uid})`} className={styles.grid} />
        {[20, 40, 60, 80].map((x) => (
          <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={100} stroke="currentColor" strokeWidth={0.12} opacity={0.35} />
        ))}
        {[25, 50, 75].map((y) => (
          <line key={`h-${y}`} x1={0} y1={y} x2={100} y2={y} stroke="currentColor" strokeWidth={0.12} opacity={0.35} />
        ))}

        {/* 2) Base body fill (very faint) */}
        <path d={bodyPath} fill="currentColor" className={styles.bodyFill} />

        {/* 3) Outline stroke */}
        <path d={bodyPath} fill="none" stroke="currentColor" strokeWidth="0.35" className={styles.outline} />

        {/* 4) Inner anatomy contours */}
        {neckContours.map((d, i) => (
          <path key={`neck-${i}`} d={d} fill="none" stroke="currentColor" strokeWidth="0.2" className={styles.contour} />
        ))}
        <path d={pectoralLeft} fill="none" stroke="currentColor" strokeWidth="0.2" className={styles.contour} />
        <path d={pectoralRight} fill="none" stroke="currentColor" strokeWidth="0.2" className={styles.contour} />
        <path d={ribLeft} fill="none" stroke="currentColor" strokeWidth="0.18" className={styles.contour} />
        <path d={ribRight} fill="none" stroke="currentColor" strokeWidth="0.18" className={styles.contour} />
        <path d={centerLine} fill="none" stroke="currentColor" strokeWidth="0.15" className={styles.contour} />
        <path d={abdomenContour} fill="none" stroke="currentColor" strokeWidth="0.18" className={styles.contour} />

        {/* 5) Circuit traces */}
        {circuitTraces.map((d, i) => (
          <path key={`circuit-${i}`} d={d} fill="none" stroke="currentColor" strokeWidth="0.12" className={styles.circuit} />
        ))}

        {/* 6) Node points with 2px glow */}
        {nodes.map((n) => (
          <circle
            key={n.id}
            data-node={n.id}
            cx={n.cx}
            cy={n.cy}
            r="1.4"
            fill="currentColor"
            className={styles.node}
            filter={`url(#node-glow-${uid})`}
          />
        ))}

        {/* Optional: very slow scan gradient in Live mode */}
        {live && (
          <rect
            width="100"
            height="100"
            fill={`url(#scan-${uid})`}
            className={styles.scanLayer}
          />
        )}
      </svg>
      <div className={styles.vignette} aria-hidden />
      {live && <div className={styles.glow} aria-hidden />}
    </div>
  )
}
