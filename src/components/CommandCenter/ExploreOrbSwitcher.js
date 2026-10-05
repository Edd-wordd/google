import React, { useState, useRef, useEffect, useCallback } from 'react'
import styles from './ExploreOrbSwitcher.module.css'

const X_CLAMP = 35
const SNAP_EXPLORE_X = -14
const SNAP_OUTSIDE_X = 14
const IDLE_DELAY_MS = 1000
const IDLE_DRIFT_SPEED = 360 / 30

function ExploreOrbSwitcher({ exploreGrid, outsideGrid, newsGrid }) {
  const [selected, setSelected] = useState('explore')
  const [rotX, setRotX] = useState(-12)
  const [rotY, setRotY] = useState(18)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const dragStartRef = useRef(null)
  const idleTimerRef = useRef(null)
  const idleRef = useRef(null)

  const displayGrid = selected === 'explore' ? exploreGrid : outsideGrid

  const isIdle = !isDragging && !isHovering

  const snapTo = useCallback((mode) => {
    setSelected(mode)
    setRotX(mode === 'explore' ? SNAP_EXPLORE_X : SNAP_OUTSIDE_X)
  }, [])

  const handlePointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return
      if (e.target.closest('button, [role="button"], a')) return
      setIsDragging(true)
      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        rotX,
        rotY,
      }
    },
    [rotX, rotY]
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || !dragStartRef.current) return
      const start = dragStartRef.current
      const dx = e.clientX - start.clientX
      const dy = e.clientY - start.clientY
      let newRotY = start.rotY + dx * 0.2
      let newRotX = start.rotX - dy * 0.2
      newRotX = Math.max(-X_CLAMP, Math.min(X_CLAMP, newRotX))
      setRotX(newRotX)
      setRotY(newRotY)
    },
    [isDragging]
  )

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const newSelected = rotX <= 0 ? 'explore' : 'outside'
    setSelected(newSelected)
    setRotX(newSelected === 'explore' ? SNAP_EXPLORE_X : SNAP_OUTSIDE_X)
  }, [isDragging, rotX])

  useEffect(() => {
    if (!isDragging) return
    const onUp = () => handlePointerUp()
    const onMove = (e) => handlePointerMove(e)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointermove', onMove)
    }
  }, [isDragging, handlePointerUp, handlePointerMove])

  useEffect(() => {
    if (!isIdle) return
    let lastT = performance.now()
    const tick = (t) => {
      const dt = (t - lastT) / 1000
      lastT = t
      setRotY((prev) => (prev + IDLE_DRIFT_SPEED * dt) % 360)
      idleRef.current = requestAnimationFrame(tick)
    }
    idleTimerRef.current = setTimeout(() => {
      idleRef.current = requestAnimationFrame(tick)
    }, IDLE_DELAY_MS)
    return () => {
      clearTimeout(idleTimerRef.current)
      cancelAnimationFrame(idleRef.current)
    }
  }, [isIdle])

  return (
    <div
      className={styles.wrapper}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
    >
      <div className={styles.orbSection}>
        <div
          className={`${styles.orbLabel} ${selected === 'explore' ? styles.orbLabelActive : ''}`}
        >
          EXPLORE
        </div>
        <div className={styles.orbWrap}>
          <div
            className={`${styles.orb} ${isDragging ? styles.orbDragging : ''}`}
            style={{
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            }}
            onPointerDown={handlePointerDown}
            role="slider"
            aria-label="Orb selector: drag to switch between Explore and Outside"
            aria-valuenow={selected === 'explore' ? 0 : 1}
            aria-valuemin={0}
            aria-valuemax={1}
          >
            <span className={styles.terminator} aria-hidden />
          </div>
        </div>
        <div
          className={`${styles.orbLabel} ${selected === 'outside' ? styles.orbLabelActive : ''}`}
        >
          OUTSIDE
        </div>
      </div>
      <div className={styles.pills}>
        <button
          type="button"
          className={`${styles.pill} ${selected === 'explore' ? styles.pillActive : ''}`}
          onClick={() => snapTo('explore')}
        >
          EXPLORE
        </button>
        <button
          type="button"
          className={`${styles.pill} ${selected === 'outside' ? styles.pillActive : ''}`}
          onClick={() => snapTo('outside')}
        >
          OUTSIDE
        </button>
      </div>
      <div className={styles.panelWrap}>
        <div
          key={selected}
          className={styles.panel}
        >
          {displayGrid}
        </div>
      </div>
    </div>
  )
}

export default ExploreOrbSwitcher
