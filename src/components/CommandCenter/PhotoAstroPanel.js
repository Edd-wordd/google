import React, { useState } from "react";
import styles from "./PhotoAstroPanel.module.css";
import PrepGearModal from "../PrepGearModal";
import TargetsModal from "../TargetsModal";
import GearScanModal from "../GearScanModal";
import ViewSkyModal from "../ViewSkyModal";

function PhotoAstroPanel({
  activeExploreTarget,
  activeExploreLocation,
  highlightFromExplore,
}) {
  const [isPrepGearOpen, setPrepGearOpen] = useState(false);
  const [isTargetsOpen, setTargetsOpen] = useState(false);
  const [isGearScanOpen, setGearScanOpen] = useState(false);
  const [isViewSkyOpen, setViewSkyOpen] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [gearStatus, setGearStatus] = useState("suitable");
  const [showGearNote, setShowGearNote] = useState(false);
  const displayTarget = currentTarget || activeExploreTarget;

  const handleSelectTarget = (target) => {
    setCurrentTarget(target);
  };

  const handleGearConfirm = (status) => {
    setGearStatus(status);
    setShowGearNote(true);
    setTimeout(() => setShowGearNote(false), 3000);
  };

  const telescopeStatus = "Offline";

  return (
    <div
      className={`${styles.panel} ${highlightFromExplore ? styles.highlightFromExplore : ""}`}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>ASTRO CONDITIONS</h2>
        <p className={styles.subtitle}>Night sky readiness</p>
      </header>

      <div className={styles.content}>
        {activeExploreLocation && (
          <p className={styles.exploreLocation}>
            Location: {activeExploreLocation.label}
          </p>
        )}

        <div className={styles.targetRow}>
          <span className={styles.targetRowLabel}>
            CURRENT TARGET:{" "}
            <span className={styles.targetRowValue}>
              {displayTarget
                ? displayTarget.name || displayTarget.label
                : "None selected"}
            </span>
            {activeExploreTarget && !currentTarget && (
              <span className={styles.exploreTargetBadge}> from Explore</span>
            )}
          </span>
          <button
            type="button"
            className={styles.loadTargetBtn}
            onClick={() => setTargetsOpen(true)}
          >
            LOAD TARGET
          </button>
        </div>

        <div className={styles.nextBestPlan}>
          <div className={styles.nextBestPlanTitle}>NEXT BEST PLAN</div>
          {!displayTarget ? (
            <p className={styles.nextBestPlanEmpty}>
              Select a target to generate a plan.
            </p>
          ) : (
            <div className={styles.planCompact}>
              <span className={styles.planLine}>
                Mon · 10:15 PM – 1:05 AM · Desert Pull-off · 3.1 mi
              </span>
              <span className={styles.planLine}>
                Confidence: Medium · Moon: Low · Clouds: 12%
              </span>
            </div>
          )}
        </div>

        <div className={styles.statusRow}>
          <span className={styles.pill}>
            <span className={styles.pillDot} data-seeing="good" aria-hidden />
            Seeing: Good
          </span>
          <span className={styles.pill}>Cloud: 12%</span>
          <span className={styles.pill}>
            <span className={styles.moonIcon} aria-hidden>
              ☽
            </span>
            Waxing Crescent
          </span>
        </div>

        <div className={styles.shootBlock}>
          <div className={styles.shootBar}>
            <span className={styles.shootBarLabel}>SHOOT WINDOW</span>
            <span className={styles.shootBarStatus} data-status="open">
              Open
            </span>
          </div>
          <div className={styles.timingGrid}>
            <span className={styles.timingLabel}>Best Window</span>
            <span className={styles.timingValue}>9:42 PM – 1:15 AM</span>
            <span className={styles.timingLabel}>From</span>
            <span className={styles.timingValue}>9:42 PM</span>
            <span className={styles.timingLabel}>To</span>
            <span className={styles.timingValue}>1:15 AM</span>
          </div>
        </div>

        <div className={styles.bestFor}>
          <span className={styles.bestForTitle}>BEST FOR</span>
          <span className={styles.targetHighlighted}>Deep Sky</span>
          <span className={styles.targetHighlighted}>Wide Field</span>
          <span className={styles.targetMuted}>Milky Way</span>
          <span className={styles.targetMuted}>Planets</span>
          <span className={styles.targetMuted}>Lunar</span>
        </div>

        <dl className={styles.signals}>
          <dt className={styles.signalLabel}>SKY QUALITY</dt>
          <dd className={styles.signalValue}>Good</dd>
          <dt className={styles.signalLabel}>MOON IMPACT</dt>
          <dd className={styles.signalValue}>Low</dd>
          <dt className={styles.signalLabel}>EFFORT</dt>
          <dd className={styles.signalValue}>Moderate</dd>
          <dt className={styles.signalLabel}>YOUR GEAR</dt>
          <dd className={styles.signalValue}>
            {gearStatus === "suitable" ? "Suitable" : "Limited"}
          </dd>
        </dl>
        {showGearNote && (
          <div className={styles.gearNote}>Gear scan updated</div>
        )}

        <div className={styles.telescope}>
          <div className={styles.telescopeHead}>
            <span className={styles.telescopeTitle}>TELESCOPE</span>
            <span className={styles.telescopeStatus}>
              Controller · {telescopeStatus}
            </span>
          </div>
          <div className={styles.telescopeBtns}>
            <a
              href="http://astroberry.local"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openAstroberryBtn}
            >
              OPEN ASTROBERRY
            </a>
            {telescopeStatus === "Ready" ? (
              <a
                href="http://astroberry.local/live"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.viewLiveFeedBtn}
              >
                VIEW LIVE FEED
              </a>
            ) : (
              <button
                type="button"
                className={styles.viewLiveFeedBtn}
                disabled
                title="Telescope offline"
                aria-label="View live feed (telescope offline)"
              >
                VIEW LIVE FEED
              </button>
            )}
          </div>
          <p className={styles.telescopeHelper}>
            Launch telescope control interface
            {telescopeStatus === "Ready"
              ? " · Opens live camera preview from Astroberry"
              : " · Telescope offline"}
          </p>
        </div>

        <div className={styles.skyVisual} aria-hidden />
      </div>

      <footer className={styles.actions}>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => setPrepGearOpen(true)}
        >
          PREP GEAR
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => setGearScanOpen(true)}
        >
          SCAN GEAR
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => setViewSkyOpen(true)}
        >
          VIEW SKY
        </button>
      </footer>
      <PrepGearModal
        isOpen={isPrepGearOpen}
        onClose={() => setPrepGearOpen(false)}
      />
      <TargetsModal
        isOpen={isTargetsOpen}
        onClose={() => setTargetsOpen(false)}
        onSelectTarget={handleSelectTarget}
      />
      <GearScanModal
        isOpen={isGearScanOpen}
        onClose={() => setGearScanOpen(false)}
        onConfirm={handleGearConfirm}
      />
      <ViewSkyModal
        isOpen={isViewSkyOpen}
        onClose={() => setViewSkyOpen(false)}
        currentTarget={displayTarget}
      />
    </div>
  );
}

export default PhotoAstroPanel;
