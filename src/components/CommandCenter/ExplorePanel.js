import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './ExplorePanel.module.css'
import {
  SQUARES,
  OUTSIDE_WORLD_SQUARES,
  GRID_SIZE,
  OUTSIDE_WORLD_SIZE,
} from './exploreData'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusables(container) {
  if (!container) return []
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter((el) => !el.hasAttribute('disabled'))
}

function ExplorePanel({ exploreContext, setExploreContext }) {
  const [previewModal, setPreviewModal] = useState(null)
  const [connectionModal, setConnectionModal] = useState(null)
  const previewRef = useRef(null)
  const connectionRef = useRef(null)

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

  useEffect(() => {
    if (previewModal || connectionModal) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [previewModal, connectionModal])

  useEffect(() => {
    if (previewModal && previewRef.current) {
      const focusable = getFocusables(previewRef.current)[0]
      focusable?.focus()
    }
  }, [previewModal])

  useEffect(() => {
    if (connectionModal && connectionRef.current) {
      const focusable = getFocusables(connectionRef.current)[0]
      focusable?.focus()
    }
  }, [connectionModal])

  const gridCells = []
  for (let i = 0; i < GRID_SIZE; i++) {
    const square = SQUARES.find((s) => s.gridIndex === i)
    if (square) {
      const isActiveProject = square.type === 'project' && activeProjectId === square.id
      const isActiveTarget = square.type === 'target' && activeTargetId === square.id
      gridCells.push(
        <button
          key={square.id}
          type="button"
          className={`${styles.square} ${styles[`square_${square.type}`]} ${isActiveProject ? styles.squareActive : ''} ${isActiveTarget ? styles.squareTargetLoaded : ''}`}
          onClick={() => handleSquareClick(square)}
          data-type={square.type}
          aria-label={`${square.label} (${square.type})`}
        >
          <span className={styles.squareIcon} aria-hidden>
            {square.type === 'project' && '⌂'}
            {square.type === 'target' && '◎'}
            {square.type === 'capture' && '◉'}
            {square.type === 'system' && '⚙'}
          </span>
          <span className={styles.squareLabel}>{square.label}</span>
          <span className={styles.squareBadge}>{square.type}</span>
        </button>
      )
    } else {
      gridCells.push(<div key={`empty-${i}`} className={styles.cellEmpty} aria-hidden="true" />)
    }
  }

  return (
    <div className={styles.panel}>
      <header className={styles.header}>
        <h2 className={styles.title}>EXPLORE MODE</h2>
        <p className={styles.subtitle}>Safe navigation & discovery</p>
      </header>
      {(activeProjectId || activeTargetId || activeLocationId || highlightedPanel) && (
        <div className={styles.contextBar}>
          {activeProjectId && (
            <span className={styles.contextPill} data-type="project">
              Project: {SQUARES.find((s) => s.id === activeProjectId)?.label}
            </span>
          )}
          {activeTargetId && (
            <span className={styles.contextPill} data-type="target">
              Target: {SQUARES.find((s) => s.id === activeTargetId)?.label}
            </span>
          )}
          {exploreContext?.location && (
            <span className={styles.contextPill} data-type="location">
              Location: {exploreContext.location.label}
            </span>
          )}
          {highlightedPanel && (
            <span className={styles.contextPill} data-type="signal">
              Highlighted: {highlightedPanel === 'astro' ? 'Astro' : 'Motion'}
            </span>
          )}
        </div>
      )}
      <div className={styles.grid} role="grid" aria-label="Explore grid">
        {gridCells}
      </div>

      <div className={styles.outsideWorldSection}>
        <div className={styles.outsideWorldLabel}>OUTSIDE WORLD</div>
        <div className={styles.outsideWorldGrid} role="grid" aria-label="Outside world">
          {(() => {
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
                    className={`${styles.square} ${styles[`square_${square.type}`]} ${isActiveLocation ? styles.squareLocationActive : ''} ${isActiveSignal ? styles.squareSignalActive : ''}`}
                    onClick={() => handleSquareClick(square)}
                    data-type={square.type}
                    aria-label={`${square.label} (${square.type})`}
                  >
                    <span className={styles.squareIcon} aria-hidden>
                      {square.type === 'system' && '⚙'}
                      {square.type === 'signal' && '◐'}
                      {square.type === 'location' && '⌖'}
                      {square.type === 'event' && '◉'}
                    </span>
                    <span className={styles.squareLabel}>{square.label}</span>
                    {square.type === 'system' && (
                      <span className={styles.squareStatus} data-status={square.status?.toLowerCase()}>
                        {square.status}
                      </span>
                    )}
                    {square.type === 'location' && square.distance && (
                      <span className={styles.squareDistance}>{square.distance}</span>
                    )}
                    <span className={styles.squareBadge}>
                      {square.type === 'event' ? 'Event' : square.type}
                    </span>
                  </button>
                )
              } else {
                cells.push(<div key={`ow-empty-${i}`} className={styles.cellEmpty} aria-hidden="true" />)
              }
            }
            return cells
          })()}
        </div>
      </div>

      {previewModal &&
        createPortal(
          <div
            className={styles.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
            onClick={(e) => e.target === e.currentTarget && setPreviewModal(null)}
            onKeyDown={(e) => handleKeyDown(e, previewRef)}
          >
            <div ref={previewRef} className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setPreviewModal(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 id="preview-modal-title" className={styles.modalTitle}>
                PREVIEW
              </h2>
              <p className={styles.modalSubtitle}>{previewModal.label}</p>
              <div className={styles.modalPreviewThumb} aria-hidden="true" />
              <div className={styles.modalMeta}>
                <div className={styles.modalMetaRow}>
                  <span className={styles.modalMetaLabel}>Timestamp</span>
                  <span className={styles.modalMetaValue}>{previewModal.timestamp}</span>
                </div>
                <div className={styles.modalMetaRow}>
                  <span className={styles.modalMetaLabel}>Linked</span>
                  <span className={styles.modalMetaValue}>{previewModal.linked}</span>
                </div>
              </div>
              <footer className={styles.modalFooter}>
                <button type="button" className={styles.modalBtnSecondary}>VIEW</button>
                <button type="button" className={styles.modalBtnSecondary}>LINK</button>
                <button type="button" className={styles.modalBtnPrimary} onClick={() => setPreviewModal(null)}>
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
            className={styles.modalOverlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="connection-modal-title"
            onClick={(e) => e.target === e.currentTarget && setConnectionModal(null)}
            onKeyDown={(e) => handleKeyDown(e, connectionRef)}
          >
            <div ref={connectionRef} className={styles.modalPanel} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setConnectionModal(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 id="connection-modal-title" className={styles.modalTitle}>
                CONNECTION
              </h2>
              <p className={styles.modalSubtitle}>{connectionModal.label}</p>
              <div className={styles.modalMeta}>
                <div className={styles.modalMetaRow}>
                  <span className={styles.modalMetaLabel}>Status</span>
                  <span className={styles.modalMetaValue} data-status={connectionModal.status.toLowerCase()}>
                    {connectionModal.status}
                  </span>
                </div>
                <p className={styles.modalDescription}>{connectionModal.description}</p>
              </div>
              <footer className={styles.modalFooter}>
                <button type="button" className={styles.modalBtnSecondary}>OPEN DASHBOARD</button>
                <button type="button" className={styles.modalBtnSecondary}>VIEW LIVE FEED</button>
                <button type="button" className={styles.modalBtnPrimary} onClick={() => setConnectionModal(null)}>
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

export default ExplorePanel
