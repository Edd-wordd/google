import React, { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './GearScanModal.module.css'

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusables(container) {
  if (!container) return []
  const nodes = container.querySelectorAll(FOCUSABLE)
  return Array.from(nodes).filter((el) => !el.hasAttribute('disabled'))
}

const GEAR_ITEMS = [
  { name: 'Sony a7R II', type: 'Camera', status: 'ready' },
  { name: '24mm f/1.8 Lens', type: 'Lens', status: 'ready' },
  { name: 'Tripod', type: 'Support', status: 'ready' },
  { name: 'Star Tracker', type: 'Tracking', status: 'limited' },
  { name: 'Extra Battery', type: 'Power', status: 'ready' },
  { name: 'Intervalometer', type: 'Control', status: 'missing' },
  { name: 'Dew Heater', type: 'Accessory', status: 'ready' },
]

function GearScanModal({ isOpen, onClose, onConfirm }) {
  const panelRef = useRef(null)
  const previousActiveRef = useRef(null)

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  const handleConfirm = useCallback(() => {
    // Calculate gear status based on items
    const readyCount = GEAR_ITEMS.filter((item) => item.status === 'ready').length
    const limitedCount = GEAR_ITEMS.filter((item) => item.status === 'limited').length
    const missingCount = GEAR_ITEMS.filter((item) => item.status === 'missing').length

    let gearStatus = 'suitable'
    if (missingCount > 0 || limitedCount > 2) {
      gearStatus = 'limited'
    }

    onConfirm?.(gearStatus)
    handleClose()
  }, [onConfirm, handleClose])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
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
      aria-labelledby="gear-scan-title"
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
          <h2 id="gear-scan-title" className={styles.title}>GEAR SCAN</h2>
          <p className={styles.description}>
            Confirm which gear is available for tonight's session.
          </p>
        </header>

        <div className={styles.body}>
          <ul className={styles.gearList}>
            {GEAR_ITEMS.map((item, i) => (
              <li key={i} className={styles.gearItem}>
                <div className={styles.gearInfo}>
                  <span className={styles.gearName}>{item.name}</span>
                  <span className={styles.gearType}>{item.type}</span>
                </div>
                <span
                  className={`${styles.gearStatus} ${styles[`gearStatus${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.confirmBtn} onClick={handleConfirm}>
            CONFIRM
          </button>
          <button type="button" className={styles.cancelBtn} onClick={handleClose}>
            CANCEL
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}

export default GearScanModal
