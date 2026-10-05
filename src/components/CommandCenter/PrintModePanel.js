import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './PrintModePanel.module.css'
import PrinterStatusSignalPanel from './PrinterStatusSignalPanel'

const ACTIVE_JOB = [
  { label: 'Job Name', value: 'Onyx Tribute — 17×22' },
  { label: 'Output', value: 'Canon PRO-1000' },
  { label: 'Paper', value: 'Red River Matte' },
  { label: 'Size', value: '17×22' },
  { label: 'Copies', value: '1' },
  { label: 'Profile', value: 'Canon PRO-1000 / Matte ICC' },
]

const QUEUE_ITEMS = [
  { name: 'Casa Plasencio Labels — Batch A', status: 'Queued' },
  { name: '5×7 Postcards — Set 01', status: 'Printing' },
]

const INK_LEVELS = [
  { label: 'PK', width: 88, type: 'photoBlack' },
  { label: 'MK', width: 72, type: 'matteBlack' },
  { label: 'C', width: 65, type: 'cyan' },
  { label: 'M', width: 78, type: 'magenta' },
  { label: 'Y', width: 92, type: 'yellow' },
  { label: 'PC', width: 55, type: 'photoCyan' },
  { label: 'PM', width: 60, type: 'photoMagenta' },
  { label: 'GY', width: 45, type: 'gray' },
]

const PROGRESS_PERCENT = 50
const RAIL_SEGMENTS = 36
const TICK_EVERY = 4

/* Tool Handoff grid — 2×3, exact order */
const TOOL_HANDOFF = [
  { id: 'ppl', label: 'PPL' },
  { id: 'indesign', label: 'INDESIGN' },
  { id: 'affinity-photo', label: 'AFF PHOTO' },
  { id: 'affinity-pub', label: 'AFF PUB' },
  { id: 'assets', label: 'ASSETS' },
  { id: 'scan', label: 'SCAN' },
]

// TODO: wire to real handlers when available
function noop() {}

function PrintModePanel({ activeExploreProject, onStartJob = noop, onExportPackage = noop }) {
  const prefersReducedMotion = useReducedMotion()
  const filledCount = Math.round((RAIL_SEGMENTS * PROGRESS_PERCENT) / 100)

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.headerRow}>
            <h2 className={styles.title}>PRINT MODE</h2>
            <div className={styles.headerRight}>
              <span className={styles.statusPill} data-status="ready">
                READY
              </span>
            </div>
          </div>
          <p className={styles.subtitle}>Print pipeline & output control</p>
          {activeExploreProject && (
            <p className={styles.exploreProject}>Project: {activeExploreProject.label}</p>
          )}
        </header>

        <div className={styles.cardBody}>
          <div className={styles.cardBodyMain}>
            <section className={styles.jobAndProgressRow}>
              <div className={styles.activeJob}>
                <div className={styles.sectionTitle}>ACTIVE JOB</div>
                <div className={styles.jobGrid}>
                  {ACTIVE_JOB.map((row, i) => (
                    <React.Fragment key={i}>
                      <span className={styles.jobLabel}>{row.label}</span>
                      <span className={styles.jobValue}>{row.value}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.sectionTitle}>PRINT PROGRESS</div>
                <div className={styles.progressWidget}>
                  <div className={styles.progressRailPanel}>
                    <div className={styles.progressRailRow}>
                      <div className={styles.progressRailWrap}>
                        <div className={styles.progressRailGrid} aria-hidden />
                        <div className={styles.progressRail}>
                          {Array.from({ length: RAIL_SEGMENTS }).map((_, i) => {
                            const isFilled = i < filledCount
                            const isLastFilled = i === filledCount - 1
                            const Tag = isLastFilled && !prefersReducedMotion ? motion.span : 'span'
                            return (
                              <Tag
                                key={i}
                                className={`${styles.railSegment} ${isFilled ? styles.railSegmentFilled : styles.railSegmentEmpty} ${isLastFilled ? styles.railSegmentShimmer : ''}`}
                                animate={
                                  isLastFilled && !prefersReducedMotion
                                    ? {
                                        opacity: [0.9, 1, 0.9],
                                        boxShadow: [
                                          '0 0 4px rgba(255, 180, 80, 0.4)',
                                          '0 0 8px rgba(255, 180, 80, 0.6)',
                                          '0 0 4px rgba(255, 180, 80, 0.4)',
                                        ],
                                      }
                                    : undefined
                                }
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                              />
                            )
                          })}
                        </div>
                        <div className={styles.progressRailTicks} aria-hidden>
                          {Array.from({ length: RAIL_SEGMENTS / TICK_EVERY + 1 }).map((_, i) => (
                            <span
                              key={i}
                              className={styles.railTick}
                              style={{
                                left: `${(i * TICK_EVERY * 100) / RAIL_SEGMENTS}%`,
                              }}
                            />
                          ))}
                        </div>
                        <motion.div
                          className={styles.progressCarriage}
                          style={{ left: `${PROGRESS_PERCENT}%` }}
                          animate={
                            !prefersReducedMotion
                              ? {
                                  opacity: [0.85, 1, 0.85],
                                  boxShadow: [
                                    '0 0 6px rgba(255, 180, 80, 0.5)',
                                    '0 0 12px rgba(255, 180, 80, 0.75)',
                                    '0 0 6px rgba(255, 180, 80, 0.5)',
                                  ],
                                }
                              : undefined
                          }
                          transition={{
                            duration: 1.25,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          aria-hidden
                        />
                      </div>
                      <span className={styles.progressPercent}>{PROGRESS_PERCENT}%</span>
                    </div>
                    <div className={styles.progressQueueHeader}>
                      <span className={styles.progressQueueHeaderLabel}>Queue</span>
                      <span className={styles.progressQueueHeaderCount}>
                        {QUEUE_ITEMS.length} {QUEUE_ITEMS.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <ul className={styles.progressQueueList}>
                      {QUEUE_ITEMS.map((item, i) => {
                        const isPrinting = item.status.toLowerCase() === 'printing'
                        return (
                          <li key={i} className={styles.progressQueueRow}>
                            <span
                              className={`${styles.progressQueueSignal} ${isPrinting ? styles.progressQueueSignalActive : ''}`}
                              aria-hidden
                            >
                              {isPrinting && !prefersReducedMotion ? (
                                <motion.span
                                  className={styles.progressQueueSignalDot}
                                  animate={{ opacity: [0.4, 1, 0.4] }}
                                  transition={{
                                    duration: 1.1,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                  }}
                                />
                              ) : (
                                <span className={styles.progressQueueSignalDot} />
                              )}
                            </span>
                            <span className={styles.progressQueueName}>{item.name}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.printerSection}>
              <div className={styles.sectionTitle}>PRINTER STATUS</div>
              <div className={styles.printerGrid}>
                <span className={styles.printerLabel}>Printer</span>
                <span className={styles.printerValue}>Canon PRO-1000</span>
                <span className={styles.printerLabel}>Connection</span>
                <span className={styles.printerValue}>Online</span>
                <span className={styles.printerLabel}>Paper Loaded</span>
                <span className={styles.printerValue}>17×22</span>
              </div>
              <PrinterStatusSignalPanel inkLevels={INK_LEVELS} />
            </section>
          </div>
        </div>

        <div className={styles.toolsStrip} role="group" aria-label="Tools">
          {TOOL_HANDOFF.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.toolsStripModule}
              onClick={() => console.log(`Tool: ${item.id}`)}
              aria-label={`Launch ${item.label}`}
            >
              <span className={styles.toolsStripBevel} aria-hidden />
              <span className={styles.toolsStripLabel}>{item.label}</span>
              <span className={styles.toolsStripHint}>Launch</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PrintModePanel
