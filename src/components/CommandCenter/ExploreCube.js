import React, { useState, useRef, useEffect, useCallback } from 'react'
import styles from './ExploreCube.module.css'

const IDLE_SPEED = 360 / 24
const X_CLAMP = 25
const DEBUG_CUBE = false

const SNAP_FACES = [
  { id: 'front', rotX: 0, rotY: 0 },
  { id: 'right', rotX: 0, rotY: 90 },
  { id: 'back', rotX: 0, rotY: 180 },
  { id: 'left', rotX: 0, rotY: -90 },
  { id: 'top', rotX: -90, rotY: 0 },
  { id: 'bottom', rotX: 90, rotY: 0 },
]

const FACE_CONTROLS = [
  { id: 'front', label: 'Explore' },
  { id: 'right', label: 'Outside' },
  { id: 'back', label: 'News' },
  { id: 'left', label: 'Archive' },
  { id: 'top', label: 'Locations' },
]

function angleDiff(a, b) {
  let d = ((b - a) % 360 + 360) % 360
  if (d > 180) d -= 360
  return d
}

function nearestSnapFace(rotX, rotY) {
  let best = SNAP_FACES[0]
  let bestDist = Infinity
  for (const face of SNAP_FACES) {
    const dx = Math.abs(angleDiff(rotX, face.rotX))
    const dy = Math.abs(angleDiff(rotY, face.rotY))
    const dist = dx + dy * 0.5
    if (dist < bestDist) {
      bestDist = dist
      best = face
    }
  }
  return best
}

function ExploreCube({ faces, onFaceChange }) {
  const [rotX, setRotX] = useState(0)
  const [rotY, setRotY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [idleRotY, setIdleRotY] = useState(0)
  const dragStartRef = useRef(null)
  const containerRef = useRef(null)
  const idleRef = useRef(null)

  const isIdle = !isDragging && !isHovering

  useEffect(() => {
    if (!isIdle) return
    let lastT = performance.now()
    const tick = (t) => {
      const dt = (t - lastT) / 1000
      lastT = t
      setIdleRotY((prev) => (prev + IDLE_SPEED * dt) % 360)
      idleRef.current = requestAnimationFrame(tick)
    }
    idleRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(idleRef.current)
  }, [isIdle])

  const snapToFace = useCallback(
    (face) => {
      setRotX(face.rotX)
      setRotY(face.rotY)
      onFaceChange?.(face.id)
    },
    [onFaceChange]
  )

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
      const dx = Math.round(e.clientX - start.clientX)
      const dy = Math.round(e.clientY - start.clientY)
      let newRotY = start.rotY + dx * 0.5
      let newRotX = start.rotX + dy * 0.3
      newRotX = Math.max(-X_CLAMP, Math.min(X_CLAMP, newRotX))
      setRotX(Math.round(newRotX * 10) / 10)
      setRotY(Math.round(newRotY * 10) / 10)
    },
    [isDragging]
  )

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const face = nearestSnapFace(rotX, rotY)
    setRotX(face.rotX)
    setRotY(face.rotY)
    onFaceChange?.(face.id)
  }, [isDragging, rotX, rotY, onFaceChange])

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

  const displayRotY = isIdle ? rotY + idleRotY : rotY

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${DEBUG_CUBE ? styles.debug : ''}`}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
    >
      <div className={styles.scene}>
        <div
          className={`${styles.cube} ${isDragging ? styles.cubeDragging : ''}`}
          style={{
            transform: `rotateX(${rotX}deg) rotateY(${displayRotY}deg)`,
          }}
          onPointerDown={handlePointerDown}
        >
          {(['front', 'right', 'back', 'left', 'top', 'bottom']).map((faceId) => (
            <div
              key={faceId}
              className={`${styles.face} ${styles[`face${faceId.charAt(0).toUpperCase() + faceId.slice(1)}`]}`}
            >
              <div className={styles.faceInner}>{faces[faceId]}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.controls}>
        {FACE_CONTROLS.map(({ id, label }) => {
          const face = SNAP_FACES.find((f) => f.id === id)
          const isActive =
            Math.abs(rotX - face.rotX) < 5 &&
            Math.abs(angleDiff(rotY, face.rotY)) < 5
          return (
            <button
              key={id}
              type="button"
              className={`${styles.controlBtn} ${isActive ? styles.controlBtnActive : ''}`}
              onClick={() => snapToFace(face)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ExploreCube
