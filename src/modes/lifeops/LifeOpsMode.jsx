import React from 'react'
import LifeOpsPanel from './components/LifeOpsPanel'
import styles from './LifeOpsMode.module.css'

/**
 * Life Ops mode — single panel: Biometric Console (hero + body), Workouts Feed, and Readiness / Alerts in one box.
 */
export default function LifeOpsMode() {
  return (
    <div className={styles.layout}>
      <LifeOpsPanel />
    </div>
  )
}
