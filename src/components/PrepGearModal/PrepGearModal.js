import React, { useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './PrepGearModal.module.css'

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusables(container) {
  if (!container) return []
  const nodes = container.querySelectorAll(FOCUSABLE)
  return Array.from(nodes).filter((el) => !el.hasAttribute('disabled'))
}

function PrepGearModal({ isOpen, onClose }) {
  const panelRef = useRef(null)
  const previousActiveRef = useRef(null)

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

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
      aria-labelledby="prep-gear-title"
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
          <h2 id="prep-gear-title" className={styles.title}>
            PREP GEAR
          </h2>
          <p className={styles.subtitle}>Astrophotography setup checklist</p>
        </header>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              SONY a7R II — Recommended Settings
            </h3>
            <ul className={styles.settingsList}>
              <li><span className={styles.settingLabel}>Mode:</span> Manual (M)</li>
              <li><span className={styles.settingLabel}>File Format:</span> RAW</li>
              <li><span className={styles.settingLabel}>White Balance:</span> Daylight or 3800–4200K</li>
              <li><span className={styles.settingLabel}>ISO:</span> 1600–3200</li>
              <li><span className={styles.settingLabel}>Aperture:</span> f/1.8 – f/2.8 (depending on lens)</li>
              <li>
                <span className={styles.settingLabel}>Shutter Speed:</span>
                <ul className={styles.sublist}>
                  <li>10–15s (no tracker)</li>
                  <li>20–30s (with star tracker)</li>
                </ul>
              </li>
              <li>
                <span className={styles.settingLabel}>Focus:</span>
                <ul className={styles.sublist}>
                  <li>Manual Focus</li>
                  <li>Focus on bright star using magnification</li>
                </ul>
              </li>
              <li><span className={styles.settingLabel}>Image Stabilization:</span> OFF</li>
              <li><span className={styles.settingLabel}>Long Exposure NR:</span> OFF</li>
              <li><span className={styles.settingLabel}>High ISO NR:</span> OFF</li>
              <li><span className={styles.settingLabel}>Drive Mode:</span> 2s timer or remote</li>
            </ul>
            <p className={styles.note}>
              Settings may vary based on lens, sky quality, and tracking.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Lens & Stability</h3>
            <ul className={styles.checklist}>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>Fast lens mounted (f/2.8 or faster recommended)</li>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>Lens hood removed</li>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>Tripod stable and level</li>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>Ball head locked</li>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>Tracker aligned (if applicable)</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Environment</h3>
            <ul className={styles.checklist}>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>Allow camera to thermally stabilize (5–10 min)</li>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>Shield lens from dew (dew heater or hood)</li>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>Check wind conditions</li>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>Dark-adapt eyes (avoid bright screens)</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Power & Storage</h3>
            <ul className={styles.checklist}>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>Battery ≥ 60%</li>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>Spare battery available</li>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>SD card with ≥ 20GB free</li>
              <li><span className={styles.checkIcon} aria-hidden>✓</span>USB power bank ready (if used)</li>
            </ul>
          </section>

          <section className={styles.sectionTips}>
            <h3 className={styles.sectionTitleTips}>Tips</h3>
            <ul className={styles.tipsList}>
              <li>Shoot test frames before full session</li>
              <li>Slightly underexpose to protect highlights</li>
              <li>Re-check focus every temperature change</li>
            </ul>
          </section>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.readyBtn}>
            READY
          </button>
          <button type="button" className={styles.closeFooterBtn} onClick={handleClose}>
            CLOSE
          </button>
        </footer>
      </div>
    </div>,
    document.body
  )
}

export default PrepGearModal
