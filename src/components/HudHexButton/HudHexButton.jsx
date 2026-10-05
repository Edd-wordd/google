import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './HudHexButton.module.css'

export default function HudHexButton({
  variant = 'secondary',
  icon,
  label,
  microText,
  onClick,
  'aria-label': ariaLabel,
  type = 'button',
}) {
  const prefersReducedMotion = useReducedMotion()
  const isPrimary = variant === 'primary'

  return (
    <motion.button
      type={type}
      className={`${styles.btn} ${isPrimary ? styles.btnPrimary : styles.btnSecondary}`}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      style={{ transformStyle: 'preserve-3d' }}
      whileHover={
        prefersReducedMotion
          ? {}
          : {
              y: -2,
              rotateX: -1.5,
              rotateY: 1,
              transition: { duration: 0.15, ease: 'easeOut' },
            }
      }
      whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
    >
      <span className={styles.rim} aria-hidden />
      <span className={styles.bevel} aria-hidden />
      <span className={styles.scanTexture} aria-hidden />
      <span className={styles.cornerNotch} aria-hidden />
      <span className={styles.scanSweep} aria-hidden />
      {icon != null && icon !== '' && (
        <span className={styles.icon} aria-hidden>{icon}</span>
      )}
      <span className={styles.label}>{label}</span>
      {microText && <span className={styles.micro}>{microText}</span>}
    </motion.button>
  )
}
