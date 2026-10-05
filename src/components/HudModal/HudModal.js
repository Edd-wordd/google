import React, { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './HudModal.module.css'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusables(container) {
  if (!container) return []
  const nodes = container.querySelectorAll(FOCUSABLE)
  return Array.from(nodes).filter((el) => !el.hasAttribute('disabled'))
}

function computeConnector(triggerEl, panelEl) {
  if (!triggerEl || !panelEl) return null
  const trigger = triggerEl.getBoundingClientRect()
  const panel = panelEl.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const triggerCenterX = trigger.left + trigger.width / 2
  const panelCenterX = panel.left + panel.width / 2
  const isTriggerLeft = triggerCenterX < panelCenterX
  const startX = isTriggerLeft ? trigger.right : trigger.left
  const startY = trigger.top + trigger.height / 2
  const endX = isTriggerLeft ? panel.left : panel.right
  const endY = panel.top + panel.height / 2
  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2 + (isTriggerLeft ? 20 : -20)
  return { startX, startY, endX, endY, midX, midY, vw, vh }
}

function HudModal({ isOpen, onClose, title, subtitle, diagnostics = [], prList = [], triggerRef }) {
  const panelRef = useRef(null)
  const previousActiveRef = useRef(null)
  const [connector, setConnector] = useState(null)
  const [snapFrom, setSnapFrom] = useState({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  const updateConnector = useCallback(() => {
    const triggerEl = triggerRef?.current
    const panelEl = panelRef.current
    const next = computeConnector(triggerEl, panelEl)
    if (next) {
      setConnector(next)
      const trigger = triggerEl?.getBoundingClientRect()
      const panel = panelEl?.getBoundingClientRect()
      if (trigger && panel) {
        const dx = panel.left + panel.width / 2 - (trigger.left + trigger.width / 2)
        const dy = panel.top + panel.height / 2 - (trigger.top + trigger.height / 2)
        const dist = Math.hypot(dx, dy)
        const scale = Math.min(12 / (dist || 1), 1)
        setSnapFrom({ x: -dx * scale * 0.15, y: -dy * scale * 0.15 })
      }
    } else {
      setConnector(null)
      setSnapFrom({ x: 0, y: 0 })
    }
  }, [triggerRef])

  useEffect(() => {
    if (!isOpen) return
    const raf = () => {
      rafRef.current = null
      updateConnector()
    }
    rafRef.current = requestAnimationFrame(raf)
    const delayedUpdate = setTimeout(raf, 100)
    const onResizeScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(raf)
    }
    window.addEventListener('resize', onResizeScroll)
    window.addEventListener('scroll', onResizeScroll, true)
    return () => {
      clearTimeout(delayedUpdate)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResizeScroll)
      window.removeEventListener('scroll', onResizeScroll, true)
    }
  }, [isOpen, updateConnector])

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
    [isOpen, handleClose],
  )

  useEffect(() => {
    if (!isOpen) return
    previousActiveRef.current = document.activeElement
    const firstFocusable = getFocusables(panelRef.current)[0]
    if (firstFocusable) {
      firstFocusable.focus()
    }
    return () => {
      if (previousActiveRef.current?.focus) {
        previousActiveRef.current.focus()
      }
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
      aria-labelledby="hud-modal-title"
    >
      <div className={styles.hudOverlay} aria-hidden="true" />
      <motion.div
        ref={panelRef}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
        initial={prefersReducedMotion ? false : { opacity: 0.85, x: -120 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.9, 0.2, 1] }}
      >
        <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          ×
        </button>

        <header className={styles.header}>
          <h2 id="hud-modal-title" className={styles.title}>
            {title}
          </h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>

        <div className={styles.body}>
          <aside className={styles.diagnostics}>
            <div className={styles.diagnosticsCard}>
              <div className={styles.diagnosticsTitle}>DIAGNOSTICS</div>
              {diagnostics.map((d, i) => (
                <div key={i} className={styles.meter}>
                  <span className={styles.meterLabel}>{d.label}</span>
                  <span className={styles.meterValue}>{d.value}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className={styles.mainArea}>
            <div className={styles.hudGraphic} aria-hidden="true" />
            <ul className={styles.prList}>
              {prList.map((pr, i) => (
                <li key={i} className={styles.prRow}>
                  <span className={styles.prAvatar} aria-hidden="true" />
                  <div className={styles.prInfo}>
                    <span className={styles.prTitle}>{pr.title}</span>
                    <span className={styles.prMeta}>
                      #{pr.number}
                      <span className={`${styles.prPill} ${styles[`prPill${pr.statusKey}`] || ''}`}>
                        {pr.status}
                      </span>
                      <span className={styles.prAge}>{pr.age}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.filterBtn}>
            FILTER
          </button>
          <button type="button" className={styles.closeFooterBtn} onClick={handleClose}>
            CLOSE
          </button>
        </footer>
      </motion.div>
    </div>,
    document.body,
  )
}

export default HudModal
