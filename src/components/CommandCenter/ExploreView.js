import React, { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ExploreOrbSwitcher from './ExploreOrbSwitcher'
import ExplorePanel from './ExplorePanel'
import styles from './ExploreView.module.css'
import tileStyles from './ExplorePanel.module.css'
import {
  SQUARES,
  OUTSIDE_WORLD_SQUARES,
  NEWS_PLACEHOLDERS,
  ARCHIVE_PLACEHOLDERS,
  LOCATIONS_PLACEHOLDERS,
  GRID_SIZE,
  OUTSIDE_WORLD_SIZE,
} from './exploreData'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusables(container) {
  if (!container) return []
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter((el) => !el.hasAttribute('disabled'))
}

function ExploreView({ exploreContext, setExploreContext }) {
  const [viewMode, setViewMode] = useState('orb')
  const [previewModal, setPreviewModal] = useState(null)
  const [connectionModal, setConnectionModal] = useState(null)
  const previewRef = React.useRef(null)
  const connectionRef = React.useRef(null)

  const activeProjectId = exploreContext?.project?.id ?? null
  const activeTargetId = exploreContext?.target?.id ?? null
  const activeLocationId = exploreContext?.location?.id ?? null
  const highlightedPanel = exploreContext?.highlightedPanel ?? null

  const handleSquareClick = useCallback(
    (square) => {
      if (square.type === 'project') {
        setExploreContext((prev) => ({
          ...prev,
          project: prev.project?.id === square.id ? null : { id: square.id, label: square.label },
        }))
      } else if (square.type === 'target') {
        setExploreContext((prev) => ({
          ...prev,
          target: prev.target?.id === square.id ? null : { id: square.id, label: square.label },
        }))
      } else if (square.type === 'capture' || square.type === 'event') {
        setPreviewModal({
          label: square.label,
          timestamp: square.timestamp || '—',
          linked: square.linked || '—',
        })
      } else if (square.type === 'system') {
        setConnectionModal({
          label: square.label,
          status: square.status || 'Unknown',
          description: square.description || 'System connection',
        })
      } else if (square.type === 'signal') {
        setExploreContext((prev) => ({
          ...prev,
          highlightedPanel:
            prev.highlightedPanel === square.highlightPanel ? null : square.highlightPanel || null,
        }))
      } else if (square.type === 'location') {
        setExploreContext((prev) => ({
          ...prev,
          location: prev.location?.id === square.id ? null : { id: square.id, label: square.label, distance: square.distance },
        }))
      }
    },
    [setExploreContext]
  )

  useEffect(() => {
    if (previewModal || connectionModal) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [previewModal, connectionModal])

  const handleKeyDown = useCallback((e, focusRef) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setPreviewModal(null)
      setConnectionModal(null)
      return
    }
    if (e.key !== 'Tab') return
    const focusables = getFocusables(focusRef?.current)
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }, [])

  const renderExploreGrid = () => {
    const cells = []
    for (let i = 0; i < GRID_SIZE; i++) {
      const square = SQUARES.find((s) => s.gridIndex === i)
      if (square) {
        const isActiveProject = square.type === 'project' && activeProjectId === square.id
        const isActiveTarget = square.type === 'target' && activeTargetId === square.id
        cells.push(
          <button
            key={square.id}
            type="button"
            className={`${tileStyles.square} ${tileStyles[`square_${square.type}`]} ${isActiveProject ? tileStyles.squareActive : ''} ${isActiveTarget ? tileStyles.squareTargetLoaded : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleSquareClick(square)
            }}
            data-type={square.type}
            aria-label={`${square.label} (${square.type})`}
          >
            <span className={tileStyles.squareIcon} aria-hidden>
              {square.type === 'project' && '⌂'}
              {square.type === 'target' && '◎'}
              {square.type === 'capture' && '◉'}
              {square.type === 'system' && '⚙'}
            </span>
            <span className={tileStyles.squareLabel}>{square.label}</span>
            <span className={tileStyles.squareBadge}>{square.type}</span>
          </button>
        )
      } else {
        cells.push(<div key={`empty-${i}`} className={tileStyles.cellEmpty} aria-hidden="true" />)
      }
    }
    return cells
  }

  const renderOutsideGrid = () => {
    const cells = []
    for (let i = 0; i < OUTSIDE_WORLD_SIZE; i++) {
      const square = OUTSIDE_WORLD_SQUARES.find((s) => s.gridIndex === i)
      if (square) {
        const isActiveLocation = square.type === 'location' && activeLocationId === square.id
        const isActiveSignal =
          square.type === 'signal' && square.highlightPanel && highlightedPanel === square.highlightPanel
        cells.push(
          <button
            key={square.id}
            type="button"
            className={`${tileStyles.square} ${tileStyles[`square_${square.type}`]} ${isActiveLocation ? tileStyles.squareLocationActive : ''} ${isActiveSignal ? tileStyles.squareSignalActive : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleSquareClick(square)
            }}
            data-type={square.type}
            aria-label={`${square.label} (${square.type})`}
          >
            <span className={tileStyles.squareIcon} aria-hidden>
              {square.type === 'system' && '⚙'}
              {square.type === 'signal' && '◐'}
              {square.type === 'location' && '⌖'}
              {square.type === 'event' && '◉'}
            </span>
            <span className={tileStyles.squareLabel}>{square.label}</span>
            {square.type === 'system' && (
              <span className={tileStyles.squareStatus} data-status={square.status?.toLowerCase()}>
                {square.status}
              </span>
            )}
            {square.type === 'location' && square.distance && (
              <span className={tileStyles.squareDistance}>{square.distance}</span>
            )}
            <span className={tileStyles.squareBadge}>
              {square.type === 'event' ? 'Event' : square.type}
            </span>
          </button>
        )
      } else {
        cells.push(<div key={`ow-empty-${i}`} className={tileStyles.cellEmpty} aria-hidden="true" />)
      }
    }
    return cells
  }

  const exploreGridContent = (
    <>
      <div className={styles.panelHeader}>EXPLORE MODE</div>
      <div className={styles.panelContent}>
        <div
          className={`${tileStyles.grid} ${styles.orbGrid}`}
          role="grid"
          aria-label="Explore grid"
        >
          {renderExploreGrid()}
        </div>
      </div>
    </>
  )

  const outsideGridContent = (
    <>
      <div className={styles.panelHeader}>OUTSIDE WORLD</div>
      <div className={styles.panelContent}>
        <div
          className={`${tileStyles.outsideWorldGrid} ${styles.orbGrid}`}
          role="grid"
          aria-label="Outside world"
        >
          {renderOutsideGrid()}
        </div>
      </div>
    </>
  )

  const newsGridContent = (
    <>
      <div className={styles.panelHeader}>NEWS</div>
      <div className={`${styles.panelContent} ${styles.placeholderGrid}`}>
        {NEWS_PLACEHOLDERS.map((item) => (
          <div key={item.id} className={styles.placeholderTile}>
            <span className={styles.placeholderLabel}>{item.label}</span>
            <span className={styles.placeholderMeta}>{item.time}</span>
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${viewMode === 'orb' ? styles.toggleBtnActive : ''}`}
          onClick={() => setViewMode('orb')}
        >
          ORB
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${viewMode === 'flat' ? styles.toggleBtnActive : ''}`}
          onClick={() => setViewMode('flat')}
        >
          FLAT
        </button>
      </div>
      {viewMode === 'orb' ? (
        <div className={styles.orbContainer}>
          <ExploreOrbSwitcher
            exploreGrid={exploreGridContent}
            outsideGrid={outsideGridContent}
            newsGrid={newsGridContent}
          />
        </div>
      ) : (
        <ExplorePanel exploreContext={exploreContext} setExploreContext={setExploreContext} />
      )}

      {previewModal &&
        createPortal(
          <div
            className={tileStyles.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
            onClick={(e) => e.target === e.currentTarget && setPreviewModal(null)}
            onKeyDown={(e) => handleKeyDown(e, previewRef)}
          >
            <div ref={previewRef} className={tileStyles.modalPanel} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={tileStyles.modalClose}
                onClick={() => setPreviewModal(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 id="preview-modal-title" className={tileStyles.modalTitle}>
                PREVIEW
              </h2>
              <p className={tileStyles.modalSubtitle}>{previewModal.label}</p>
              <div className={tileStyles.modalPreviewThumb} aria-hidden="true" />
              <div className={tileStyles.modalMeta}>
                <div className={tileStyles.modalMetaRow}>
                  <span className={tileStyles.modalMetaLabel}>Timestamp</span>
                  <span className={tileStyles.modalMetaValue}>{previewModal.timestamp}</span>
                </div>
                <div className={tileStyles.modalMetaRow}>
                  <span className={tileStyles.modalMetaLabel}>Linked</span>
                  <span className={tileStyles.modalMetaValue}>{previewModal.linked}</span>
                </div>
              </div>
              <footer className={tileStyles.modalFooter}>
                <button type="button" className={tileStyles.modalBtnSecondary}>VIEW</button>
                <button type="button" className={tileStyles.modalBtnSecondary}>LINK</button>
                <button type="button" className={tileStyles.modalBtnPrimary} onClick={() => setPreviewModal(null)}>
                  CLOSE
                </button>
              </footer>
            </div>
          </div>,
          document.body
        )}

      {connectionModal &&
        createPortal(
          <div
            className={tileStyles.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="connection-modal-title"
            onClick={(e) => e.target === e.currentTarget && setConnectionModal(null)}
            onKeyDown={(e) => handleKeyDown(e, connectionRef)}
          >
            <div ref={connectionRef} className={tileStyles.modalPanel} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={tileStyles.modalClose}
                onClick={() => setConnectionModal(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 id="connection-modal-title" className={tileStyles.modalTitle}>
                CONNECTION
              </h2>
              <p className={tileStyles.modalSubtitle}>{connectionModal.label}</p>
              <div className={tileStyles.modalMeta}>
                <div className={tileStyles.modalMetaRow}>
                  <span className={tileStyles.modalMetaLabel}>Status</span>
                  <span className={tileStyles.modalMetaValue} data-status={connectionModal.status.toLowerCase()}>
                    {connectionModal.status}
                  </span>
                </div>
                <p className={tileStyles.modalDescription}>{connectionModal.description}</p>
              </div>
              <footer className={tileStyles.modalFooter}>
                <button type="button" className={tileStyles.modalBtnSecondary}>OPEN DASHBOARD</button>
                <button type="button" className={tileStyles.modalBtnSecondary}>VIEW LIVE FEED</button>
                <button type="button" className={tileStyles.modalBtnPrimary} onClick={() => setConnectionModal(null)}>
                  CLOSE
                </button>
              </footer>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default ExploreView
