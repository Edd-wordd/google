import React from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import styles from './RepoTelemetryTile.module.css'

/* Simple hash from string for deterministic variation */
function hashStr(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/* Generate schematic SVG based on repo name — circuit/robot glyph */
function SchematicGlyph({ repoName }) {
  const h = hashStr(repoName)
  const variant = h % 3
  const offset = (h % 5) * 2
  const strokeOpacity = 0.4 + ((h % 7) / 20)

  if (variant === 0) {
    return (
      <svg viewBox="0 0 32 32" className={styles.schematicSvg} aria-hidden>
        <rect x="4" y="8" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" opacity={strokeOpacity} />
        <rect x="20" y="8" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" opacity={strokeOpacity} />
        <line x1="12" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="0.8" opacity={strokeOpacity} />
        <circle cx="16" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" opacity={strokeOpacity} />
        <line x1="16" y1="12" x2="16" y2="16" stroke="currentColor" strokeWidth="0.6" opacity={strokeOpacity} />
      </svg>
    )
  }
  if (variant === 1) {
    return (
      <svg viewBox="0 0 32 32" className={styles.schematicSvg} aria-hidden>
        <path d="M8 16 L16 8 L24 16 L16 24 Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity={strokeOpacity} />
        <circle cx="16" cy="16" r="3" fill="none" stroke="currentColor" strokeWidth="0.6" opacity={strokeOpacity} />
        <line x1={8 + offset} y1="16" x2={12 + offset} y2="16" stroke="currentColor" strokeWidth="0.6" opacity={strokeOpacity} />
        <line x1="20" y1="16" x2="24" y2="16" stroke="currentColor" strokeWidth="0.6" opacity={strokeOpacity} />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 32 32" className={styles.schematicSvg} aria-hidden>
      <rect x="6" y="6" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="0.8" opacity={strokeOpacity} />
      <line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="0.5" opacity={strokeOpacity * 0.8} />
      <line x1="16" y1="6" x2="16" y2="26" stroke="currentColor" strokeWidth="0.5" opacity={strokeOpacity * 0.8} />
      <circle cx="16" cy="16" r="2" fill="none" stroke="currentColor" strokeWidth="0.6" opacity={strokeOpacity} />
    </svg>
  )
}

/* Circular dial with ticks + indicator dot */
function Dial({ delay = 0, reducedMotion }) {
  return (
    <div className={styles.dialWrap}>
      <div className={styles.dialRing} aria-hidden />
      <div className={styles.dialTicks} aria-hidden />
      <div
        className={`${styles.dialIndicator} ${reducedMotion ? styles.dialIndicatorStatic : ''}`}
        style={{ animationDelay: `${delay}s` }}
        aria-hidden
      />
    </div>
  )
}

function RepoTelemetryTile({
  repo,
  index,
  isActive,
  onClick,
  onExternalLink,
  staggerIndex = 0,
}) {
  const prefersReducedMotion = useReducedMotion()
  const rid = 150 + index

  return (
    <motion.article
      className={`${styles.tile} ${isActive ? styles.tileActive : ''}`}
      initial={{ opacity: 0, scale: 0.97, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: staggerIndex * 0.08,
        ease: [0.2, 0.9, 0.2, 1],
      }}
      whileHover={prefersReducedMotion ? {} : { y: -1, transition: { duration: 0.2 } }}
    >
      <button
        type="button"
        className={styles.tileButton}
        onClick={onClick}
        aria-pressed={isActive}
        aria-label={`Select ${repo.name}`}
      >
        {/* Top micro header */}
        <div className={styles.tileHeader}>
          <span className={styles.tileRepoName}>{repo.name}</span>
          {isActive && (
            <span className={styles.tileStatus}>LIVE</span>
          )}
        </div>

        {/* Main row: RID | viewport | dials */}
        <div className={styles.tileMain}>
          <div className={styles.tileRid}>{rid}</div>
          <div className={styles.tileViewport}>
            <div className={styles.viewportScan} aria-hidden />
            <div className={styles.viewportContent}>
              <SchematicGlyph repoName={repo.name} />
            </div>
          </div>
          <div className={styles.tileDials}>
            <Dial delay={0} reducedMotion={!!prefersReducedMotion} />
            <Dial delay={0.5} reducedMotion={!!prefersReducedMotion} />
          </div>
        </div>

        {/* Bottom footer */}
        <div className={styles.tileFooter}>
          <span className={styles.footerItem}>PRs {repo.pr}</span>
          <span className={styles.footerSep}>/</span>
          <span className={styles.footerItem}>Issues {repo.issues}</span>
        </div>
      </button>

      {/* External link — angled corner */}
      <button
        type="button"
        className={styles.externalLink}
        onClick={(e) => {
          e.stopPropagation()
          onExternalLink?.()
        }}
        aria-label="Open repository"
      >
        ↗
      </button>
    </motion.article>
  )
}

export default RepoTelemetryTile
