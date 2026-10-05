import React, { useState, useCallback } from 'react'
import styles from './CreateModePanel.module.css'

/* Mock artifact data model — frontend-only */
const MOCK_ARTIFACTS = [
  {
    id: 'a1',
    name: 'Onyx Tribute — Print Layout',
    type: 'Layout',
    version: 'v3',
    status: 'Draft',
    primaryPath: '/Projects/onyx-tribute/layout-v3.afpub',
    secondaryPaths: [],
    linkedProject: 'command-center',
    lastModified: Date.now() - 3600000 * 2,
    lastSizeBytes: 12_400_000,
    lastHash: 'a3f2c1',
    notes: [],
  },
  {
    id: 'a2',
    name: 'Casa Plasencio — Label v2',
    type: 'Label',
    version: 'v2',
    status: 'Final',
    primaryPath: '/Projects/casa/label-v2.afdesign',
    secondaryPaths: [],
    linkedProject: null,
    lastModified: Date.now() - 3600000 * 5,
    lastSizeBytes: 2_100_000,
    lastHash: 'b1e4d2',
    notes: [{ ts: Date.now() - 86400000, text: 'Client approved' }],
  },
  {
    id: 'a3',
    name: 'Session 0129 — Contact Sheet',
    type: 'Photo',
    version: 'v1',
    status: 'Proof',
    primaryPath: '/Projects/session-0129/contact.afphoto',
    secondaryPaths: [],
    linkedProject: null,
    lastModified: Date.now() - 86400000,
    lastSizeBytes: 45_000_000,
    lastHash: 'c8d1e0',
    notes: [],
  },
  {
    id: 'a4',
    name: 'Brand Book — Master',
    type: 'Book',
    version: 'v1',
    status: 'Ready',
    primaryPath: '/Projects/brand/book-master.afpub',
    secondaryPaths: ['/Projects/brand/assets'],
    linkedProject: 'brand',
    lastModified: Date.now() - 3600000 * 12,
    lastSizeBytes: 8_500_000,
    lastHash: 'd2f3a1',
    notes: [],
  },
]

/* Mock observed change entry */
function mockObservedChange(artifact, prevSize = null) {
  const sizeDelta = prevSize != null ? artifact.lastSizeBytes - prevSize : 0
  return {
    lastModified: artifact.lastModified,
    sizeDeltaBytes: sizeDelta,
    hashChanged: true,
  }
}

function formatRelativeTime(ts) {
  const d = new Date(ts)
  const now = Date.now()
  const diff = now - ts
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (diff < 172800000)
    return `Yesterday ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatSizeDelta(bytes) {
  if (bytes === 0) return '—'
  const mb = (bytes / 1024 / 1024).toFixed(1)
  const sign = bytes > 0 ? '+' : ''
  return `${sign}${mb} MB`
}

function CreateModePanel() {
  const [activeArtifactId, setActiveArtifactId] = useState('a1')
  const [observed, setObserved] = useState(() =>
    MOCK_ARTIFACTS.slice(0, 4).map((a) => mockObservedChange(a, a.lastSizeBytes - 500_000)),
  )
  const [refreshing, setRefreshing] = useState(false)
  const [readyForPrint, setReadyForPrint] = useState(new Set())
  const [noteModalArtifactId, setNoteModalArtifactId] = useState(null)
  const [noteInput, setNoteInput] = useState('')

  const activeArtifact = MOCK_ARTIFACTS.find((a) => a.id === activeArtifactId) || MOCK_ARTIFACTS[0]
  const statusPill = activeArtifactId ? 'TRACKING' : 'IDLE'

  const refreshObserved = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setObserved((prev) =>
        prev.map((o, i) => ({
          ...o,
          lastModified: activeArtifact.lastModified - i * 60000,
          hashChanged: Math.random() > 0.3,
        })),
      )
      setRefreshing(false)
    }, 420)
  }, [activeArtifact.lastModified])

  const handleMarkReadyForPrint = () => {
    setReadyForPrint((s) => new Set([...s, activeArtifactId]))
  }

  const handoffActions = [
    { id: 'open', label: 'OPEN FILE', icon: '↗' },
    { id: 'reveal', label: 'REVEAL IN FOLDER', icon: '⊞' },
    { id: 'publisher', label: 'LAUNCH PUBLISHER', icon: '⌘' },
    { id: 'ppl', label: 'LAUNCH PPL', icon: '⌘' },
    { id: 'ready', label: 'MARK: READY FOR PRINT', icon: '✓' },
    { id: 'note', label: 'ADD NOTE', icon: '+' },
  ]

  return (
    <div className={styles.panel}>
      <div className={styles.scanlineOverlay} aria-hidden />

      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>ARTIFACT MODE</h2>
          <span
            className={styles.statusPill}
            data-status={statusPill === 'TRACKING' ? 'tracking' : 'idle'}
          >
            {statusPill}
          </span>
        </div>
        <p className={styles.subtitle}>Context + handoff (no automation)</p>
      </header>

      {/* Section 1 — Active Artifact */}
      <section className={styles.activeArtifact} aria-label="Active artifact">
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionTitle}>ACTIVE ARTIFACT</span>
          <span className={styles.truthLabel}>Source of truth: filesystem + your intent</span>
        </div>
        <div className={styles.activeArtifactRail} aria-hidden />
        <div className={styles.artifactGrid}>
          <span className={styles.artifactLabel}>Name</span>
          <span className={styles.artifactValue}>{activeArtifact.name}</span>
          <span className={styles.artifactLabel}>Type</span>
          <span className={styles.artifactValue}>
            <span className={styles.typeBadge} data-type={activeArtifact.type.toLowerCase()}>
              {activeArtifact.type}
            </span>
          </span>
          <span className={styles.artifactLabel}>Version</span>
          <span className={styles.artifactValue}>{activeArtifact.version}</span>
          <span className={styles.artifactLabel}>Primary file</span>
          <span className={styles.artifactValueMono}>{activeArtifact.primaryPath}</span>
          <span className={styles.artifactLabel}>Linked project</span>
          <span className={styles.artifactValue}>{activeArtifact.linkedProject || '—'}</span>
        </div>
      </section>

      {/* Section 2 — Observed Changes */}
      <section className={styles.observedSection} aria-label="Observed changes">
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionTitle}>OBSERVED CHANGES</span>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={refreshObserved}
            disabled={refreshing}
            aria-label="Refresh observed changes"
          >
            {refreshing ? '…' : 'REFRESH'}
          </button>
        </div>
        <div className={styles.refreshSweep} data-active={refreshing} aria-hidden />
        <p className={styles.observedHint}>This does not read app history — it watches files.</p>
        <ul className={styles.observedList}>
          {observed.slice(0, 4).map((entry, i) => (
            <li key={i} className={styles.observedRow}>
              <span className={styles.observedMeta}>Last modified</span>
              <span className={styles.observedValue}>{formatRelativeTime(entry.lastModified)}</span>
              <span className={styles.observedMeta}>Size delta</span>
              <span className={styles.observedValueMono}>
                {formatSizeDelta(entry.sizeDeltaBytes)}
              </span>
              <span className={styles.observedMeta}>Hash changed</span>
              <span className={styles.observedValue}>{entry.hashChanged ? 'Yes' : 'No'}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 3 — Handoff Actions */}
      <section className={styles.handoffSection} aria-label="Handoff actions">
        <div className={styles.sectionTitle}>HANDOFF ACTIONS</div>
        <div className={styles.handoffChips}>
          {handoffActions.map((action) => (
            <button
              key={action.id}
              type="button"
              className={`${styles.handoffChip} ${action.id === 'ready' && readyForPrint.has(activeArtifactId) ? styles.handoffChipActive : ''}`}
              onClick={
                action.id === 'ready'
                  ? handleMarkReadyForPrint
                  : action.id === 'note'
                    ? () => setNoteModalArtifactId(activeArtifactId)
                    : () => console.log(`Handoff: ${action.id}`)
              }
              aria-label={action.label}
            >
              <span className={styles.handoffChipBevel} aria-hidden />
              <span className={styles.handoffChipSheen} aria-hidden />
              <span className={styles.handoffChipIcon}>{action.icon}</span>
              <span className={styles.handoffChipLabel}>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Section 4 — Recent Artifacts */}
      <section className={styles.recentSection} aria-label="Recent artifacts">
        <div className={styles.sectionTitle}>RECENT ARTIFACTS</div>
        <ul className={styles.recentList}>
          {MOCK_ARTIFACTS.slice(0, 5).map((artifact) => (
            <li
              key={artifact.id}
              className={`${styles.recentRow} ${artifact.id === activeArtifactId ? styles.recentRowActive : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setActiveArtifactId(artifact.id)}
              onKeyDown={(e) => e.key === 'Enter' && setActiveArtifactId(artifact.id)}
              aria-pressed={artifact.id === activeArtifactId}
            >
              <span className={styles.recentName}>{artifact.name}</span>
              <span className={styles.typeBadgeSmall} data-type={artifact.type.toLowerCase()}>
                {artifact.type}
              </span>
              <span className={styles.recentMeta}>{formatRelativeTime(artifact.lastModified)}</span>
              <span className={styles.recentStatus} data-status={artifact.status.toLowerCase()}>
                {artifact.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {noteModalArtifactId && (
        <div className={styles.noteModalBackdrop} onClick={() => setNoteModalArtifactId(null)}>
          <div className={styles.noteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.noteModalTitle}>Add note</div>
            <input
              type="text"
              className={styles.noteInput}
              placeholder="Note text…"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              autoFocus
            />
            <div className={styles.noteModalActions}>
              <button
                type="button"
                className={styles.noteModalBtn}
                onClick={() => setNoteModalArtifactId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.noteModalBtnPrimary}
                onClick={() => {
                  console.log('Note added:', noteInput)
                  setNoteInput('')
                  setNoteModalArtifactId(null)
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateModePanel
