import React, { useRef, useEffect, useCallback } from 'react'
import styles from './RotaryKnob.module.css'

const DEFAULT_VALUE = 70
const MIN = 1
const MAX = 100

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}

function RotaryKnob({
  value,
  onChange,
  defaultValue = DEFAULT_VALUE,
  min = MIN,
  max = MAX,
  'aria-label': ariaLabel = 'Sensitivity',
  className = '',
}) {
  const knobRef = useRef(null)
  const dragRef = useRef({ active: false, startValue: 0, startX: 0, startY: 0 })
  const isAdjustingRef = useRef(false)
  const adjustTimeoutRef = useRef(null)

  const setAdjusting = useCallback((on) => {
    if (isAdjustingRef.current === on) return
    isAdjustingRef.current = on
    if (adjustTimeoutRef.current) clearTimeout(adjustTimeoutRef.current)
    if (on) {
      knobRef.current?.setAttribute('data-adjusting', 'true')
    } else {
      adjustTimeoutRef.current = setTimeout(() => {
        knobRef.current?.removeAttribute('data-adjusting')
        adjustTimeoutRef.current = null
      }, 300)
    }
  }, [])

  const updateValue = useCallback(
    (delta) => {
      const next = clamp(value + delta, min, max)
      if (next !== value) onChange(next)
    },
    [value, min, max, onChange],
  )

  const handlePointerDown = useCallback(
    (e) => {
      if (e.button !== 0) return
      e.preventDefault()
      dragRef.current = { active: true, startValue: value, startX: e.clientX, startY: e.clientY }
      setAdjusting(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    [value, setAdjusting],
  )

  const handlePointerMove = useCallback(
    (e) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      const delta = Math.round(-dy / 2 + dx / 2)
      if (delta !== 0) {
        dragRef.current.startX = e.clientX
        dragRef.current.startY = e.clientY
        updateValue(delta)
      }
    },
    [updateValue],
  )

  const handlePointerUp = useCallback(
    (e) => {
      if (e.button !== 0) return
      dragRef.current.active = false
      setAdjusting(false)
      e.currentTarget.releasePointerCapture(e.pointerId)
    },
    [setAdjusting],
  )

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault()
      const step = e.shiftKey ? 5 : 1
      const delta = e.deltaY > 0 ? -step : step
      updateValue(delta)
      setAdjusting(true)
    },
    [updateValue, setAdjusting],
  )

  const handleDoubleClick = useCallback(() => {
    const reset = clamp(defaultValue, min, max)
    onChange(reset)
    setAdjusting(true)
  }, [defaultValue, min, max, onChange, setAdjusting])

  const handleKeyDown = useCallback(
    (e) => {
      const step = e.shiftKey ? 5 : 1
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault()
        updateValue(step)
        setAdjusting(true)
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault()
        updateValue(-step)
        setAdjusting(true)
      }
    },
    [updateValue, setAdjusting],
  )

  useEffect(() => {
    return () => {
      if (adjustTimeoutRef.current) clearTimeout(adjustTimeoutRef.current)
    }
  }, [])

  const pct = (value - min) / (max - min)
  const angle = 360 * pct

  return (
    <div
      ref={knobRef}
      className={`${styles.knobWrap} ${className}`}
      role="spinbutton"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.knobRing}>
        <div
          className={styles.knobArc}
          style={{
            background: `conic-gradient(rgba(0, 220, 200, 0.85) 0deg, rgba(0, 220, 200, 0.85) ${angle}deg, transparent ${angle}deg)`,
          }}
        />
        <div className={styles.knobTicks} aria-hidden />
        <div
          className={styles.knobNotch}
          style={{ transform: `rotate(${angle}deg)` }}
          aria-hidden
        />
      </div>
    </div>
  )
}

export default RotaryKnob
