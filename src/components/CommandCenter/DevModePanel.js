import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import styles from './DevModePanel.module.css'
import HudModal from '../HudModal/HudModal'
import { WakaSnapshot } from '../DevMode'

const REPO_SLIDES = [
  {
    id: 'command-center',
    name: 'nexusrift / command-center',
    last: '2h ago',
    status: 'ACTIVE',
    prs: 2,
    issues: 5,
    env: 'Production',
    backend: 'Supabase',
    live: true,
    recentScansCount: 2,
    lastScanLabel: 'Architecture Notes',
    url: 'https://github.com/nexusrift/command-center',
    lastActivityType: 'commit',
    lastActivityLabel: 'Commit · 2h ago',
    focusThread: 'PR #12 – Auth Refactor',
    nextAction: 'Review PR #12',
    health: 'green',
    linkedAssets: ['github', 'supabase', 'scanner'],
  },
  {
    id: 'photo-spotter',
    name: 'moonlit / photo-spotter',
    last: 'Yesterday',
    status: 'IDLE',
    prs: 1,
    issues: 3,
    env: 'Staging',
    backend: 'None',
    live: false,
    recentScansCount: 0,
    lastScanLabel: null,
    url: 'https://github.com/moonlit/photo-spotter',
    lastActivityType: 'pr',
    lastActivityLabel: 'PR Review · Yesterday',
    focusThread: null,
    nextAction: 'Address Issue #3',
    health: 'amber',
    linkedAssets: ['github'],
  },
  {
    id: 'travel-aid',
    name: 'journeyly / travel-aid',
    last: '3d',
    status: 'DEPLOYING',
    prs: 0,
    issues: 2,
    env: 'Local',
    backend: 'None',
    live: false,
    recentScansCount: 1,
    lastScanLabel: 'API sketch',
    url: 'https://github.com/journeyly/travel-aid',
    lastActivityType: 'scan',
    lastActivityLabel: 'Scan Linked · 3d ago',
    focusThread: null,
    nextAction: 'Deploy to Staging',
    health: 'green',
    linkedAssets: ['github', 'scanner'],
  },
]

const ASSET_LABELS = {
  github: 'GitHub',
  supabase: 'Supabase',
  scanner: 'Scanner',
  printer: 'Printer',
  astroberry: 'Astroberry',
}

const PR_MODAL_DIAGNOSTICS = [
  { label: 'Open PRs', value: '5' },
  { label: 'Review Needed', value: '2' },
  { label: 'Checks Failing', value: '0' },
  { label: 'Last Updated', value: '2h ago' },
]

const PR_MODAL_LIST = [
  {
    title: 'Add HUD modal for pull requests',
    number: 12,
    status: 'OPEN',
    statusKey: 'OPEN',
    age: '2d',
  },
  {
    title: 'Refactor DevModePanel deployment status',
    number: 11,
    status: 'NEEDS REVIEW',
    statusKey: 'NEEDS_REVIEW',
    age: '3d',
  },
  {
    title: 'WIP: Scope connection styling',
    number: 10,
    status: 'DRAFT',
    statusKey: 'DRAFT',
    age: '5d',
  },
  {
    title: 'Fix focus trap in modal overlay',
    number: 9,
    status: 'OPEN',
    statusKey: 'OPEN',
    age: '1w',
  },
  {
    title: 'Update README with command center screenshots',
    number: 8,
    status: 'OPEN',
    statusKey: 'OPEN',
    age: '1w',
  },
]

const INFRA_LINKS = [
  {
    id: 'supabase',
    label: 'SUPABASE',
    type: 'DB',
    status: 'ONLINE',
    url: 'https://supabase.com/dashboard',
    glyph: '▣',
    details: [
      { label: 'Last ping', value: '2m ago' },
      { label: 'Env', value: 'Production' },
      { label: 'Project', value: 'command-center' },
    ],
  },
  {
    id: 'postgres',
    label: 'POSTGRES',
    type: 'DB',
    status: 'ONLINE',
    url: 'https://supabase.com/dashboard/project/_/database/tables',
    glyph: '⌘',
    details: [
      { label: 'Last ping', value: '2m ago' },
      { label: 'Env', value: 'Production' },
      { label: 'Tables', value: '14' },
    ],
  },
  {
    id: 'aws',
    label: 'AWS',
    type: 'CONSOLE',
    status: 'LINK',
    url: 'https://console.aws.amazon.com/',
    glyph: '☁',
    details: [
      { label: 'Region', value: 'us-east-1' },
      { label: 'Services', value: 'EC2, S3, Lambda' },
      { label: 'Last accessed', value: 'Yesterday' },
    ],
  },
  {
    id: 's3',
    label: 'S3',
    type: 'STORAGE',
    status: 'ONLINE',
    url: 'https://s3.console.aws.amazon.com/',
    glyph: '⬡',
    details: [
      { label: 'Buckets', value: '3' },
      { label: 'Usage', value: '1.2 GB' },
      { label: 'Region', value: 'us-east-1' },
    ],
  },
  {
    id: 'logs',
    label: 'LOGS',
    type: 'OBSERVABILITY',
    status: 'LINK',
    url: 'https://console.aws.amazon.com/cloudwatch/',
    glyph: '⋯',
    details: [
      { label: 'Log groups', value: '5' },
      { label: 'Last entry', value: '12s ago' },
      { label: 'Alerts', value: '0 active' },
    ],
  },
  {
    id: 'redis',
    label: 'REDIS',
    type: 'CACHE',
    status: 'OFFLINE',
    url: 'https://app.redislabs.com/',
    glyph: '◈',
    details: [
      { label: 'Status', value: 'Not configured' },
      { label: 'Env', value: '—' },
      { label: 'Keys', value: '—' },
    ],
  },
]

function LastActivityIcon({ type }) {
  const icons = {
    commit: '●',
    pr: '⚏',
    scan: '▤',
  }
  return (
    <span className={styles.activityIcon} aria-hidden>
      {icons[type] ?? '·'}
    </span>
  )
}

function HealthIndicator({ health }) {
  const colors = {
    green: 'rgba(0, 220, 140, 0.8)',
    amber: 'rgba(255, 180, 80, 0.8)',
    red: 'rgba(255, 100, 100, 0.8)',
  }
  return (
    <span
      className={styles.healthIndicator}
      style={{ background: colors[health] ?? colors.green }}
      title={health === 'green' ? 'Clean' : health === 'amber' ? 'Needs review' : 'Blocked'}
      aria-label={health === 'green' ? 'Clean' : health === 'amber' ? 'Needs review' : 'Blocked'}
    />
  )
}

function LinkedAssetIcon({ id, linked }) {
  const glyphs = { github: '⌘', supabase: '▣', scanner: '▤', printer: '⌨', astroberry: '⊕' }
  return (
    <span
      className={`${styles.linkedAssetIcon} ${linked ? styles.linkedAssetLinked : ''}`}
      title={ASSET_LABELS[id]}
    >
      {glyphs[id] ?? '·'}
    </span>
  )
}

function EcgChip({ isActive, prefersReducedMotion }) {
  const pathD = 'M 0 6 L 4 6 L 5 2 L 6 10 L 8 6 L 12 6'
  return (
    <span className={styles.liveEcgChip} aria-hidden>
      <svg viewBox="0 0 12 12" className={styles.liveEcgSvg}>
        <path
          className={prefersReducedMotion ? styles.liveEcgPathStatic : styles.liveEcgPath}
          d={pathD}
          fill="none"
          stroke="rgba(0, 220, 140, 0.8)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="100"
        />
      </svg>
      <span className={styles.liveLabel}>Live</span>
    </span>
  )
}

function DevModePanel({ activeExploreProject }) {
  const [isPrModalOpen, setPrModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [expandedInfra, setExpandedInfra] = useState(null)
  const viewPrsRef = useRef(null)
  const sectionRef = useRef(null)
  const carouselRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  const activeFromExplore =
    activeExploreProject != null
      ? REPO_SLIDES.findIndex((r) =>
          r.name.toLowerCase().includes(activeExploreProject.label.toLowerCase()),
        )
      : -1
  const effectiveIndex = activeFromExplore >= 0 ? activeFromExplore : activeIndex

  useEffect(() => {
    if (activeFromExplore >= 0) setActiveIndex(activeFromExplore)
  }, [activeFromExplore])

  const goToSlide = useCallback((index) => {
    setActiveIndex(Math.max(0, Math.min(index, REPO_SLIDES.length - 1)))
  }, [])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      e.preventDefault()
      const dir = e.key === 'ArrowRight' ? 1 : -1
      goToSlide(effectiveIndex + dir)
    },
    [effectiveIndex, goToSlide],
  )

  const handleWheel = useCallback(
    (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 20) return
      e.preventDefault()
      goToSlide(effectiveIndex + (e.deltaX > 0 ? -1 : 1))
    },
    [effectiveIndex, goToSlide],
  )

  return (
    <div className={styles.panel}>
      <div className={styles.titleRow}>
        <div className={styles.titleLeft}>
          <span className={styles.title}>DEV MODE Edward</span>
        </div>
        <div className={styles.controlCluster} role="group" aria-label="Editor and review controls">
          <motion.button
            type="button"
            className={`${styles.cyberControlBtn} ${styles.cyberControlEditor}`}
            aria-label="Engage Editor"
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <span className={styles.cyberControlRing} aria-hidden />
            <span className={styles.cyberControlPulse} aria-hidden />
            <span className={styles.cyberControlIcon}>⌨</span>
            <span className={styles.cyberControlLabel}>EDITOR</span>
          </motion.button>
          <motion.button
            type="button"
            className={`${styles.cyberControlBtn} ${styles.cyberControlReview}`}
            aria-label="Initiate Review"
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <span className={styles.cyberControlRing} aria-hidden />
            <span className={styles.cyberControlPulse} aria-hidden />
            <span className={styles.cyberControlIcon}>⚏</span>
            <span className={styles.cyberControlLabel}>REVIEW</span>
          </motion.button>
          <motion.a
            href={REPO_SLIDES[effectiveIndex]?.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.cyberControlBtn} ${styles.cyberControlRepo}`}
            aria-label="Open Repository"
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <span className={styles.cyberControlRing} aria-hidden />
            <span className={styles.cyberControlPulse} aria-hidden />
            <span className={styles.cyberControlIcon}>↗</span>
            <span className={styles.cyberControlLabel}>REPO</span>
          </motion.a>
        </div>
      </div>
      {activeExploreProject && (
        <p className={styles.exploreContext}>From Explore: {activeExploreProject.label}</p>
      )}
      <div ref={sectionRef} className={styles.repoSection} onWheel={handleWheel}>
        <div
          ref={carouselRef}
          className={styles.repoCarousel}
          role="region"
          aria-label="Repositories"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            className={styles.repoCarouselTrack}
            drag={prefersReducedMotion ? false : 'x'}
            dragConstraints={() => {
              const w = carouselRef.current?.clientWidth ?? 200
              return { left: -w, right: w }
            }}
            dragElastic={0.15}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              const velocity = info.velocity.x
              const offset = info.offset.x
              let next = effectiveIndex
              if (Math.abs(velocity) > 150) next += velocity > 0 ? -1 : 1
              else if (Math.abs(offset) > 40) next += offset > 0 ? -1 : 1
              goToSlide(next)
            }}
            animate={{ x: `-${effectiveIndex * 100}%` }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            style={{ cursor: prefersReducedMotion ? 'default' : 'grab' }}
            whileDrag={{ cursor: 'grabbing' }}
          >
            {REPO_SLIDES.map((repo, i) => {
              const isActive = i === effectiveIndex
              const statusClass =
                repo.status === 'ACTIVE'
                  ? styles.statusActive
                  : repo.status === 'DEPLOYING'
                    ? styles.statusDeploying
                    : styles.statusIdle
              const allAssetIds = ['github', 'supabase', 'scanner', 'printer', 'astroberry']
              return (
                <motion.div
                  key={repo.id}
                  className={`${styles.repoSlide} ${isActive ? styles.repoSlideActive : ''}`}
                  whileHover={prefersReducedMotion ? {} : {}}
                  transition={{ duration: 0.15 }}
                >
                  <div className={styles.hudGridOverlay} aria-hidden />
                  <div className={styles.slideTopRow}>
                    <div className={styles.activityHeader}>
                      <span className={styles.timestamp}>{repo.last}</span>
                      <span className={styles.repoName}>{repo.name}</span>
                    </div>
                    <div className={styles.statusCore}>
                      <span
                        className={`${styles.statusPill} ${statusClass} ${repo.status === 'ACTIVE' ? styles.statusPillActive : ''}`}
                      >
                        {repo.status}
                        {repo.status === 'ACTIVE' && (
                          <span className={styles.statusScanSweep} aria-hidden />
                        )}
                        {repo.status === 'ACTIVE' && (
                          <span className={styles.statusGlowPulse} aria-hidden />
                        )}
                      </span>
                      <HealthIndicator health={repo.health} />
                    </div>
                  </div>
                  <div className={styles.operationalLine}>
                    <span className={styles.opSegment}>[ PRs: {repo.prs} ]</span>
                    <span className={styles.opDivider} />
                    <span className={styles.opSegment}>[ ISS: {repo.issues} ]</span>
                    <span className={styles.opDivider} />
                    <span className={styles.opSegment}>[ ENV: {repo.env} ]</span>
                    <span className={styles.opDivider} />
                    <span className={styles.opSegment}>[ BACKEND: {repo.backend} ]</span>
                    <span className={styles.opDivider} />
                    <span className={styles.opSegment}>
                      {repo.live && isActive ? (
                        <span className={styles.liveSegment}>
                          <EcgChip
                            isActive={isActive}
                            prefersReducedMotion={!!prefersReducedMotion}
                          />
                        </span>
                      ) : repo.live ? (
                        <span className={styles.liveSegment}>
                          <span className={styles.livePulseDot} /> LIVE
                        </span>
                      ) : (
                        <span className={styles.liveMuted}>LIVE: NO</span>
                      )}
                    </span>
                  </div>
                  <div className={styles.lastActivity}>
                    <LastActivityIcon type={repo.lastActivityType} />
                    <span>Last activity: {repo.lastActivityLabel}</span>
                  </div>
                  <div className={styles.focusThread}>FOCUS: {repo.focusThread || 'None'}</div>
                  <div className={styles.nextAction}>
                    <span className={styles.nextPrefix}>▶</span>
                    <span>NEXT: {repo.nextAction}</span>
                  </div>
                  <div className={styles.footerRow}>
                    <div className={styles.linkedAssetsRow}>
                      {allAssetIds.map((aid) => (
                        <LinkedAssetIcon
                          key={aid}
                          id={aid}
                          linked={repo.linkedAssets?.includes(aid)}
                        />
                      ))}
                    </div>
                    <span className={styles.scanSummary}>
                      {repo.recentScansCount} scans linked
                      {repo.lastScanLabel ? ` – ${repo.lastScanLabel}` : ''}
                    </span>
                  </div>
                  {repo.status === 'ACTIVE' && <div className={styles.slideScanBand} aria-hidden />}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
        <div className={styles.repoDots} role="tablist" aria-label="Slide navigation">
          {REPO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === effectiveIndex}
              aria-label={`Go to repo ${i + 1}`}
              className={`${styles.repoDot} ${i === effectiveIndex ? styles.repoDotActive : ''}`}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>
      </div>

      {/* INFRA DOCK */}
      <section className={styles.infraDock} aria-label="Infrastructure links">
        <div className={styles.infraHeader}>
          <span className={styles.infraTitle}>INFRA DOCK</span>
          <span className={styles.infraSub}>SYSTEMS / TELEMETRY</span>
        </div>
        <div className={styles.infraTiles}>
          {INFRA_LINKS.map((link) => {
            const isExpanded = expandedInfra === link.id
            const statusClass =
              link.status === 'ONLINE'
                ? styles.infraStatusOnline
                : link.status === 'OFFLINE'
                  ? styles.infraStatusOffline
                  : styles.infraStatusLink
            return (
              <motion.button
                key={link.id}
                type="button"
                className={`${styles.infraTile} ${isExpanded ? styles.infraTileActive : ''}`}
                onClick={() => setExpandedInfra(isExpanded ? null : link.id)}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                transition={{ duration: 0.12 }}
                aria-expanded={isExpanded}
              >
                <span className={styles.infraTileScan} aria-hidden />
                <span className={styles.infraTileGlyph} aria-hidden>
                  {link.glyph}
                </span>
                <span className={styles.infraTileInfo}>
                  <span className={styles.infraTileLabel}>{link.label}</span>
                  <span className={styles.infraTileType}>{link.type}</span>
                </span>
                <span className={`${styles.infraTileStatus} ${statusClass}`}>{link.status}</span>
                <span className={styles.infraTileChevron} aria-hidden>
                  ↗
                </span>
                {isExpanded && (
                  <>
                    <span className={styles.infraTileBracketTL} aria-hidden />
                    <span className={styles.infraTileBracketBR} aria-hidden />
                  </>
                )}
              </motion.button>
            )
          })}
        </div>
        <AnimatePresence>
          {expandedInfra && (
            <motion.div
              className={styles.infraDrawer}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {(() => {
                const link = INFRA_LINKS.find((l) => l.id === expandedInfra)
                if (!link) return null
                return (
                  <div className={styles.infraDrawerInner}>
                    <div className={styles.infraDrawerHeader}>
                      <span className={styles.infraDrawerTitle}>
                        {link.glyph} {link.label}
                      </span>
                      <button
                        type="button"
                        className={styles.infraDrawerClose}
                        onClick={() => setExpandedInfra(null)}
                        aria-label="Close details"
                      >
                        ×
                      </button>
                    </div>
                    <div className={styles.infraDrawerRows}>
                      {link.details.map((d, i) => (
                        <div key={i} className={styles.infraDrawerRow}>
                          <span className={styles.infraDrawerLabel}>{d.label}</span>
                          <span className={styles.infraDrawerValue}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.infraDrawerActions}>
                      <button
                        type="button"
                        className={styles.infraDrawerBtn}
                        onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                      >
                        Open Console ↗
                      </button>
                      <button
                        type="button"
                        className={styles.infraDrawerBtn}
                        onClick={() =>
                          window.open(link.url + '/logs', '_blank', 'noopener,noreferrer')
                        }
                      >
                        Open Logs ↗
                      </button>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <WakaSnapshot />
      <motion.button
        type="button"
        className={styles.cyberScanBtn}
        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <span className={styles.cyberScanGlow} aria-hidden />
        <span className={styles.cyberScanBeam} aria-hidden />
        <span className={styles.cyberScanIcon} aria-hidden>▤</span>
        <span className={styles.cyberScanText}>
          <span className={styles.cyberScanLabel}>SCAN DOCS</span>
          <span className={styles.cyberScanSub}>Capture notes & diagrams</span>
        </span>
        <span className={styles.cyberScanCornerTL} aria-hidden />
        <span className={styles.cyberScanCornerBR} aria-hidden />
      </motion.button>

      <HudModal
        isOpen={isPrModalOpen}
        onClose={() => setPrModalOpen(false)}
        title="PULL REQUESTS"
        subtitle={`Current Repo: ${REPO_SLIDES[effectiveIndex]?.name ?? 'nexusrift / command-center'}`}
        diagnostics={PR_MODAL_DIAGNOSTICS}
        prList={PR_MODAL_LIST}
        triggerRef={viewPrsRef}
      />
    </div>
  )
}

export default DevModePanel
