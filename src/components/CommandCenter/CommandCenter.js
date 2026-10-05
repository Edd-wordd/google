import React, { useState } from "react";
import clsx from "clsx";
import styles from "./CommandCenter.module.css";
import ModeCore from "./ModeCore";
import StatusBridgeHUD from "../StatusBridgeHUD";
import FocusOpsPanel from "./FocusOpsPanel";
import DevModePanel from "./DevModePanel";
import CreateModePanel from "./CreateModePanel";
import ExploreView from "./ExploreView";
import PhotoAstroPanel from "./PhotoAstroPanel";
import PrintModePanel from "./PrintModePanel";
import MotionClipsPanel from "./MotionClipsPanel";
import LifeOpsMode from "../../modes/lifeops/LifeOpsMode";

function CommandCenter() {
  const [activeMode, setActiveMode] = useState("atlas");
  const [exploreContext, setExploreContext] = useState({
    project: null,
    target: null,
    location: null,
    highlightedPanel: null,
  });

  return (
    <div className={styles.root}>
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.particles} aria-hidden="true" />
      <div className={styles.hudBg} aria-hidden="true" />
      <div className={styles.layoutWrap}>
        <div className={styles.modeStrip} role="tablist" aria-label="Mode">
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "atlas"}
            className={clsx(styles.modeTab, activeMode === "atlas" && styles.modeTabActive)}
            onClick={() => setActiveMode("atlas")}
          >
            ATLAS
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "lifeops"}
            className={clsx(styles.modeTab, activeMode === "lifeops" && styles.modeTabActive)}
            onClick={() => setActiveMode("lifeops")}
          >
            LIFE OPS
          </button>
        </div>

        {activeMode === "lifeops" ? (
          <div className={styles.lifeOpsWrap}>
            <LifeOpsMode />
          </div>
        ) : (
        <div
          className={styles.grid}
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(420px, 1.9fr) minmax(280px, 2fr) minmax(420px, 1.9fr)",
            gridTemplateRows: "auto auto auto",
            gap: "1rem",
            alignItems: "start",
            alignContent: "start",
          }}
        >
          {/* Left column — 3 cards */}
          <div className={styles.topLeft} style={{ gridColumn: 1, gridRow: 1 }}>
            <FocusOpsPanel />
          </div>
          <div
            className={styles.leftMiddle}
            style={{ gridColumn: 1, gridRow: 2 }}
          >
            <DevModePanel activeExploreProject={exploreContext.project} />
          </div>
          <div
            className={styles.bottomLeft}
            style={{ gridColumn: 1, gridRow: 3 }}
          >
            <CreateModePanel />
          </div>

          {/* Center — JARVIS (spans rows 1–2) */}
          <div
            className={styles.center}
            style={{
              gridColumn: 2,
              gridRow: "1 / span 2",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "0.75rem",
            }}
          >
            <StatusBridgeHUD />
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 0,
                width: "100%",
              }}
            >
              <ModeCore />
            </div>
          </div>

          {/* Right column — 3 cards */}
          <div
            className={styles.topRight}
            style={{ gridColumn: 3, gridRow: 1 }}
          >
            <ExploreView
              exploreContext={exploreContext}
              setExploreContext={setExploreContext}
            />
          </div>
          <div
            className={styles.middleRight}
            style={{ gridColumn: 3, gridRow: 2 }}
          >
            <PhotoAstroPanel
              activeExploreTarget={exploreContext.target}
              activeExploreLocation={exploreContext.location}
              highlightFromExplore={exploreContext.highlightedPanel === "astro"}
            />
          </div>
          <div
            className={styles.bottomRight}
            style={{ gridColumn: 3, gridRow: 3 }}
          >
            <PrintModePanel activeExploreProject={exploreContext.project} />
          </div>

          {/* Motion — center of row 3, between artifact and print */}
          <div
            className={styles.motionClips}
            style={{ gridColumn: 2, gridRow: 3 }}
          >
            <MotionClipsPanel
              highlightFromExplore={
                exploreContext.highlightedPanel === "motion"
              }
            />
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default CommandCenter;
