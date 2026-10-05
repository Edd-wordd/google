import React, { useState } from 'react'
import styles from './MotionClipsPanel.module.css'
import RotaryKnob from './RotaryKnob'

const CLIPS = [
  {
    id: 1,
    title: 'Driveway — Motion',
    timestamp: 'Today · 8:41 PM',
    duration: '00:18',
    tag: 'People',
    confidence: 'High',
  },
  {
    id: 2,
    title: 'Front Door — Motion',
    timestamp: 'Today · 7:22 PM',
    duration: '00:42',
    tag: 'Vehicles',
    confidence: 'Medium',
  },
  {
    id: 3,
    title: 'Backyard — Motion',
    timestamp: 'Today · 6:15 PM',
    duration: '00:05',
    tag: 'Pets',
    confidence: 'High',
  },
  {
    id: 4,
    title: 'Garage — Motion',
    timestamp: 'Yesterday · 11:03 PM',
    duration: '00:31',
    tag: 'Unknown',
    confidence: 'Low',
  },
]

const FILTERS = ['All', 'This Week', 'Last Week', 'Last Month', 'Yesterday']

const SENSITIVITY_DEFAULT = 70

function MotionClipsPanel({ highlightFromExplore }) {
  const [selectedClipId, setSelectedClipId] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [sensitivity, setSensitivity] = useState(SENSITIVITY_DEFAULT)
  const selectedClip = CLIPS.find((c) => c.id === selectedClipId)

  return (
    <div className={`${styles.panel} ${highlightFromExplore ? styles.highlightFromExplore : ''}`}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>MOTION CLIPS</h2>
          <span className={styles.statusPill} data-status="armed">
            ARMED
          </span>
        </div>
        <p className={styles.subtitle}>Motion-detected captures</p>
      </header>

      <div className={styles.statsRow}>
        <span className={styles.stat}>Today: 6 clips</span>
        <span className={styles.stat}>Unread: 2</span>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.filterPills}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={styles.filterPill}
              data-active={activeFilter === f}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search"
          aria-label="Search clips"
          readOnly
        />
      </div>

      <section className={styles.clipsSection}>
        <div className={styles.sectionTitle}>CLIPS</div>
        <ul className={styles.clipsList}>
          {CLIPS.map((clip) => (
            <li
              key={clip.id}
              className={styles.clipRow}
              data-selected={selectedClipId === clip.id}
              onClick={() => setSelectedClipId(selectedClipId === clip.id ? null : clip.id)}
            >
              <div className={styles.thumbnailWrap}>
                <div className={styles.thumbnail} aria-hidden="true">
                  <div className={styles.scanline} />
                </div>
              </div>
              <div className={styles.clipMeta}>
                <span className={styles.clipTitle}>{clip.title}</span>
                <span className={styles.clipTime}>{clip.timestamp}</span>
                <span className={styles.clipDuration}>{clip.duration}</span>
                <span className={styles.clipTag} data-tag={clip.tag.toLowerCase()}>
                  {clip.tag}
                </span>
                <span className={styles.clipConfidence}>{clip.confidence}</span>
              </div>
              <div className={styles.clipActions} onClick={(e) => e.stopPropagation()}>
                <button type="button" className={styles.iconBtn} title="Play" aria-label="Play">
                  ▶
                </button>
                <button
                  type="button"
                  className={styles.iconBtn}
                  title="Download"
                  aria-label="Download"
                >
                  ↓
                </button>
                <button type="button" className={styles.iconBtn} title="Star" aria-label="Star">
                  ★
                </button>
                <button type="button" className={styles.iconBtn} title="More" aria-label="More">
                  ⋯
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {selectedClip && (
        <section className={styles.detailSection}>
          <div className={styles.sectionTitle}>SELECTED CLIP</div>
          <div className={styles.detailContent}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Location</span>
              <span className={styles.detailValue}>Driveway Cam</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Notes</span>
              <span className={styles.detailValue}>Add a note…</span>
            </div>
            <div className={styles.detailActions}>
              <button type="button" className={styles.detailBtn}>
                REVIEW
              </button>
              <button type="button" className={styles.detailBtn}>
                ADD NOTE
              </button>
              <button type="button" className={styles.detailBtn}>
                EXPORT
              </button>
            </div>
          </div>
        </section>
      )}

      <div className={styles.bottomRow}>
        <section className={styles.settingsSection}>
          <div className={styles.sectionTitle}>MOTION SETTINGS</div>
          <div className={styles.sensitivityRow}>
            <RotaryKnob
              value={sensitivity}
              onChange={setSensitivity}
              defaultValue={SENSITIVITY_DEFAULT}
              min={1}
              max={100}
              aria-label="Sensitivity"
            />
            <div className={styles.sensitivityReadout}>
              <span className={styles.sensitivityLabel}>SENSITIVITY</span>
              <span className={styles.sensitivityValue}>{sensitivity}</span>
              <span className={styles.sensitivityCaption}>LOW → HIGH</span>
            </div>
          </div>
          <p className={styles.settingsHint}>Fine-tune detection to reduce false positives.</p>
        </section>

        <div className={styles.footerActions}>
          <button type="button" className={styles.primaryBtn}>
            <span className={styles.footerBtnSheen} aria-hidden />
            <span className={styles.footerBtnLabel}>REVIEW INBOX</span>
            <span className={styles.footerBtnHint}>Triage clips</span>
          </button>
          <button type="button" className={styles.secondaryBtn}>
            <span className={styles.footerBtnSheen} aria-hidden />
            <span className={styles.footerBtnLabel}>ARM/DISARM</span>
            <span className={styles.footerBtnHint}>Toggle capture</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MotionClipsPanel
