import React, { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './ViewSkyModal.module.css'

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

function getFocusables(container) {
  if (!container) return []
  const nodes = container.querySelectorAll(FOCUSABLE)
  return Array.from(nodes).filter((el) => !el.hasAttribute('disabled'))
}

function ViewSkyModal({ isOpen, onClose, currentTarget }) {
  const panelRef = useRef(null)
  const previousActiveRef = useRef(null)
  const [scrubberPosition, setScrubberPosition] = useState(30) // 0-100 percentage

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const handleScrubberChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setScrubberPosition(percent)
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

  // Calculate time from scrubber position (9:42 PM to 1:15 AM = 3h 33m = 213 minutes)
  const totalMinutes = 213
  const currentMinutes = Math.round((scrubberPosition / 100) * totalMinutes)
  const startHour = 21 // 9:42 PM in 24h
  const startMin = 42
  const totalStartMinutes = startHour * 60 + startMin
  const currentTotalMinutes = totalStartMinutes + currentMinutes
  const currentHour24 = Math.floor(currentTotalMinutes / 60)
  const currentMin = currentTotalMinutes % 60
  
  let displayHour, ampm
  if (currentHour24 >= 24) {
    displayHour = currentHour24 - 24
    ampm = 'AM'
  } else if (currentHour24 >= 12) {
    displayHour = currentHour24 === 12 ? 12 : currentHour24 - 12
    ampm = 'PM'
  } else {
    displayHour = currentHour24 === 0 ? 12 : currentHour24
    ampm = 'AM'
  }
  
  const timeString = `${displayHour}:${String(currentMin).padStart(2, '0')} ${ampm}`

  return createPortal(
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-sky-title"
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
          <div className={styles.headerLeft}>
            <h2 id="view-sky-title" className={styles.title}>VIEW SKY</h2>
            <p className={styles.subtitle}>
              Preview for: Best Window (9:42 PM – 1:15 AM)
            </p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.targetLabel}>
              Target: {currentTarget ? `${currentTarget.name} (${currentTarget.type})` : 'None'}
            </span>
          </div>
        </header>

        <div className={styles.body}>
          <div className={styles.skyDome}>
            <svg
              className={styles.skySvg}
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Horizon arc */}
              <path
                d="M 50 250 Q 200 200 350 250"
                fill="none"
                stroke="rgba(140, 130, 200, 0.3)"
                strokeWidth="1"
              />

              {/* Altitude arcs */}
              <ellipse
                cx="200"
                cy="200"
                rx="100"
                ry="50"
                fill="none"
                stroke="rgba(140, 130, 200, 0.15)"
                strokeWidth="0.5"
              />
              <ellipse
                cx="200"
                cy="150"
                rx="80"
                ry="40"
                fill="none"
                stroke="rgba(140, 130, 200, 0.15)"
                strokeWidth="0.5"
              />
              <ellipse
                cx="200"
                cy="100"
                rx="60"
                ry="30"
                fill="none"
                stroke="rgba(140, 130, 200, 0.15)"
                strokeWidth="0.5"
              />

              {/* Cardinal directions */}
              <text x="200" y="260" className={styles.cardinalText}>N</text>
              <text x="360" y="200" className={styles.cardinalText}>E</text>
              <text x="200" y="30" className={styles.cardinalText}>S</text>
              <text x="40" y="200" className={styles.cardinalText}>W</text>

              {/* Altitude labels */}
              <text x="310" y="200" className={styles.altitudeText}>0°</text>
              <text x="280" y="200" className={styles.altitudeText}>30°</text>
              <text x="260" y="150" className={styles.altitudeText}>60°</text>
              <text x="250" y="100" className={styles.altitudeText}>90°</text>

              {/* Target path arc (if target selected) */}
              {currentTarget && (
                <path
                  d="M 100 240 Q 200 180 300 240"
                  fill="none"
                  stroke="rgba(0, 220, 255, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}

              {/* Target marker (if target selected) */}
              {currentTarget && (
                <g>
                  <circle
                    cx="200"
                    cy="180"
                    r="4"
                    fill="rgba(0, 220, 255, 0.9)"
                    className={styles.targetDot}
                  />
                  <text x="210" y="185" className={styles.targetLabel}>
                    {currentTarget.name}
                  </text>
                </g>
              )}

              {/* Moon arc */}
              <path
                d="M 150 230 Q 200 160 250 230"
                fill="none"
                stroke="rgba(255, 220, 180, 0.3)"
                strokeWidth="1"
                strokeDasharray="1 3"
              />

              {/* Moon marker */}
              <circle
                cx="200"
                cy="190"
                r="3"
                fill="rgba(255, 220, 180, 0.7)"
                className={styles.moonDot}
              />
            </svg>
          </div>

          <div className={styles.timeSection}>
            <div className={styles.timeReadout}>Time: {timeString}</div>
            <div
              className={styles.scrubber}
              onClick={handleScrubberChange}
              onMouseMove={(e) => {
                if (e.buttons === 1) handleScrubberChange(e)
              }}
            >
              <div className={styles.scrubberTrack} />
              <div
                className={styles.scrubberKnob}
                style={{ left: `${scrubberPosition}%` }}
              />
              <div className={styles.scrubberLabels}>
                <span>9:42 PM</span>
                <span>1:15 AM</span>
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.setPlanBtn}>
            SET AS PLAN
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

export default ViewSkyModal
