import React, { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './TargetsModal.module.css'

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusables(container) {
  if (!container) return []
  const nodes = container.querySelectorAll(FOCUSABLE)
  return Array.from(nodes).filter((el) => !el.hasAttribute('disabled'))
}

const STATIC_TARGETS = [
  {
    name: 'Milky Way Timelapse',
    type: 'Wide Field',
    requirements: 'Dark sky, clear horizon',
  },
  {
    name: 'Orion Nebula',
    type: 'Deep Sky',
    requirements: 'Long exposure, tracking',
  },
  {
    name: 'Andromeda Galaxy',
    type: 'Deep Sky',
    requirements: 'Dark sky, tracking recommended',
  },
  {
    name: 'Jupiter',
    type: 'Planet',
    requirements: 'Clear seeing, high magnification',
  },
  {
    name: 'Landscape Night Shot',
    type: 'Wide Field',
    requirements: 'Foreground interest, clear sky',
  },
]

function TargetsModal({ isOpen, onClose, onSelectTarget }) {
  const panelRef = useRef(null)
  const previousActiveRef = useRef(null)
  const [newTargetName, setNewTargetName] = useState('')
  const [newTargetType, setNewTargetType] = useState('Wide Field')
  const [newTargetNotes, setNewTargetNotes] = useState('')

  const handleClose = useCallback(() => {
    onClose?.()
    setNewTargetName('')
    setNewTargetType('Wide Field')
    setNewTargetNotes('')
  }, [onClose])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const handleSelectTarget = (target) => {
    onSelectTarget?.(target)
    handleClose()
  }

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
        return
      }
      if (e.key !== 'Tab') return
      const focusables = getFocusables(panelRef.current)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [isOpen, handleClose]
  )

  useEffect(() => {
    if (!isOpen) return
    previousActiveRef.current = document.activeElement
    const firstFocusable = getFocusables(panelRef.current)[0]
    if (firstFocusable) firstFocusable.focus()
    return () => {
      if (previousActiveRef.current?.focus) previousActiveRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return createPortal(
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="targets-modal-title"
    >
      <div
        ref={panelRef}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>

        <header className={styles.header}>
          <h2 id="targets-modal-title" className={styles.title}>TARGETS</h2>
        </header>

        <div className={styles.body}>
          <ul className={styles.targetsList}>
            {STATIC_TARGETS.map((target, i) => (
              <li
                key={i}
                className={styles.targetRow}
                onClick={() => handleSelectTarget(target)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectTarget(target)
                  }
                }}
              >
                <div className={styles.targetInfo}>
                  <span className={styles.targetName}>{target.name}</span>
                  <span className={styles.targetType}>{target.type}</span>
                </div>
                <span className={styles.targetRequirements}>{target.requirements}</span>
              </li>
            ))}
          </ul>

          <div className={styles.newTargetSection}>
            <h3 className={styles.newTargetTitle}>+ New Target</h3>
            <div className={styles.newTargetForm}>
              <div className={styles.formRow}>
                <label className={styles.label}>Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={newTargetName}
                  onChange={(e) => setNewTargetName(e.target.value)}
                  placeholder="Target name"
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.label}>Type</label>
                <select
                  className={styles.select}
                  value={newTargetType}
                  onChange={(e) => setNewTargetType(e.target.value)}
                >
                  <option>Wide Field</option>
                  <option>Deep Sky</option>
                  <option>Planet</option>
                  <option>Lunar</option>
                </select>
              </div>
              <div className={styles.formRow}>
                <label className={styles.label}>Notes</label>
                <textarea
                  className={styles.textarea}
                  value={newTargetNotes}
                  onChange={(e) => setNewTargetNotes(e.target.value)}
                  placeholder="Optional notes"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.closeFooterBtn} onClick={handleClose}>
            CLOSE
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}

export default TargetsModal
