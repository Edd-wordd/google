import React from 'react'
import styles from './ModeCore.module.css'

const SEGMENT_ICONS = ['◆', '◇', '○', '●', '▸', '▹', '▪', '▫']

function ModeCore() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>DEV MODE</div>
      <div className={styles.subtitle}>Active · 3h 25m</div>
      <div className={styles.coreArea}>
        <div className={styles.orb} aria-hidden="true" />
        <div className={styles.ring} aria-hidden="true" />
        <div className={styles.ringSegments} aria-hidden="true">
          {SEGMENT_ICONS.map((icon, i) => (
            <div key={i} className={styles.segment}>
              <span className={styles.segmentIcon}>{icon}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ModeCore
