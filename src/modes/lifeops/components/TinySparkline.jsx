import React from 'react'
import clsx from 'clsx'
import styles from './TinySparkline.module.css'

export default function TinySparkline({ data, width = 32, height = 14, className }) {
  if (!data?.length) return <div className={clsx(styles.wrap, className)} style={{ width, height }} />
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = width - 2
  const h = height - 2
  const step = w / Math.max(1, data.length - 1)
  const points = data.map((v, i) => {
    const x = 1 + i * step
    const y = 1 + h - ((v - min) / range) * h
    return `${x},${y}`
  })
  const d = `M ${points.join(' L ')}`

  return (
    <div className={clsx(styles.wrap, className)} style={{ width, height }}>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg} preserveAspectRatio="none">
        <path d={d} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
