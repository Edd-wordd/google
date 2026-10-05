import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import styles from './MetricChip.module.css'

export default function MetricChip({ label, value, unit, highlight }) {
  return (
    <motion.div
      className={clsx(styles.chip, highlight && styles.chipHighlight)}
      initial={false}
      animate={highlight ? { boxShadow: ['0 0 0 0 rgba(255,46,245,0)', '0 0 8px 0 rgba(255,46,245,0.2)', '0 0 0 0 rgba(255,46,245,0)'] } : {}}
      transition={{ duration: 0.4 }}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}{unit != null ? unit : ''}</span>
    </motion.div>
  )
}
