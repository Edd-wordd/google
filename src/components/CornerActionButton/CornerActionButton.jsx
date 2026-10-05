import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './CornerActionButton.module.css'

function CornerActionButton({
  label = 'START',
  onClick = () => {},
  'aria-label': ariaLabel = 'Start focus',
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>{label}</span>
      <motion.button
        type="button"
        className={styles.btn}
        onClick={onClick}
        aria-label={ariaLabel}
        style={{ transformStyle: 'preserve-3d', perspective: '120px' }}
        whileHover={
          prefersReducedMotion
            ? {}
            : {
                scale: 1.02,
                rotateX: -2,
                rotateY: 2,
                transition: { duration: 0.18, ease: 'easeOut' },
              }
        }
        whileTap={
          prefersReducedMotion ? {} : { scale: 0.96, transition: { duration: 0.08 } }
        }
        transition={{ duration: 0.15 }}
      >
        <span className={styles.rimRing} aria-hidden />
        <span className={styles.tickRing} aria-hidden />
        <span className={styles.glassInner} aria-hidden />
        <span className={styles.icon} aria-hidden>
          ▶
        </span>
      </motion.button>
      <span className={styles.cornerBracket} aria-hidden />
    </div>
  )
}

export default CornerActionButton
