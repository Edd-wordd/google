import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './HudActionButton.module.css'

export default function HudActionButton({
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
      whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
    >
      <span className={styles.scan} aria-hidden />
      {icon && <span className={styles.icon} aria-hidden>{icon}</span>}
      <span className={styles.label}>{label}</span>
      {microText && <span className={styles.micro}>{microText}</span>}
    </motion.button>
  )
}
