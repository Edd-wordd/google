import React, { useState, useEffect, useCallback } from "react";
import styles from "./FocusOpsPanel.module.css";
import FocusMixPanel from "./FocusMixPanel";
import CornerActionButton from "../CornerActionButton";

const GOALS_STORAGE_KEY = "focus-ops-goals";

const FOCUS_BREAKDOWN_ITEMS = [
  { label: "Dev", percent: 35 },
  { label: "Create", percent: 15 },
  { label: "Astro", percent: 12 },
  { label: "Print", percent: 10 },
  { label: "Explore", percent: 18 },
  { label: "Other", percent: 10 },
];

const MONTHLY_ITEMS = [
  { label: "Dev", percent: 38 },
  { label: "Create", percent: 12 },
  { label: "Astro", percent: 14 },
  { label: "Print", percent: 8 },
  { label: "Explore", percent: 16 },
  { label: "Other", percent: 12 },
];

function FocusOpsPanel() {
  const [goals, setGoals] = useState(() => {
    try {
      const raw = localStorage.getItem(GOALS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (_) {}
    return [];
  });
  const [goalInput, setGoalInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    } catch (_) {}
  }, [goals]);

  const addGoal = useCallback(() => {
    const text = goalInput.trim();
    if (!text) return;
    setGoals((prev) => [...prev, text]);
    setGoalInput("");
  }, [goalInput]);

  const removeGoal = useCallback((index) => {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleGoalKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addGoal();
    }
  };

  return (
    <div className={styles.hudFrame}>
      <div className={styles.gridTexture} aria-hidden />
      <div className={styles.rail} aria-hidden>
        <span className={styles.railLed} data-pos="1" />
        <span className={styles.railLed} data-pos="2" />
        <span className={styles.railLed} data-pos="3" />
      </div>
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 className={styles.title}>FOCUS & OPS</h2>
          <div className={styles.headerRight}>
            <CornerActionButton
              label="START"
              onClick={() => console.log("Start focus")}
              aria-label="Start focus"
            />
          </div>
        </header>

        <section className={styles.sessionBlock}>
          <div className={styles.sessionRow}>
            <span className={styles.sessionLabel}>Session Start</span>
            <span className={styles.sessionValue}>9:12 PM</span>
          </div>
          <div className={styles.sessionRow}>
            <span className={styles.sessionLabel}>Active For</span>
            <span className={styles.sessionValue}>1h 08m</span>
          </div>
        </section>

        <section
          className={styles.goalsSection}
          aria-label="Goals and ambitions"
        >
          <div className={styles.goalsTitle}>GOALS / AMBITIONS</div>
          <div className={styles.goalsInputRow}>
            <input
              type="text"
              className={styles.goalsInput}
              placeholder="e.g. Hit 1000 hours on coding"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={handleGoalKeyDown}
              aria-label="New goal"
            />
            <button
              type="button"
              className={styles.goalsAddBtn}
              onClick={addGoal}
              aria-label="Add goal"
            >
              ADD
            </button>
          </div>
          {goals.length > 0 && (
            <ul className={styles.goalsList}>
              {goals.map((text, index) => (
                <li
                  key={`${index}-${text.slice(0, 12)}`}
                  className={styles.goalsItem}
                >
                  <span className={styles.goalsItemText}>{text}</span>
                  <button
                    type="button"
                    className={styles.goalsRemoveBtn}
                    onClick={() => removeGoal(index)}
                    aria-label={`Remove goal: ${text}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className={styles.focusMixRow}
          aria-label="Focus mix and mode activity"
        >
          <div className={styles.focusMixLeft}>
            <FocusMixPanel
              todayItems={FOCUS_BREAKDOWN_ITEMS}
              monthItems={MONTHLY_ITEMS}
            />
          </div>
          <div className={styles.modeActivityRight}>
            <div className={styles.modeActivityHeader}>
              <span className={styles.modeActivityTitle}>MODE ACTIVITY</span>
              <span className={styles.modeActivityScale}>WEEK</span>
            </div>
            <div className={styles.modeActivityBody}>
              <div className={styles.modeActivityRail} aria-hidden>
                {["Dev", "Create", "Astro", "Print", "Explore", "Other"].map(
                  (l) => (
                    <span key={l}>{l}</span>
                  ),
                )}
              </div>
              <div className={styles.modeTrackerRows}>
                <div className={styles.modeTrackerRow} data-mode="dev">
                  <span className={styles.modeTrackerDots} aria-hidden>
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} data-filled />
                  </span>
                </div>
                <div className={styles.modeTrackerRow} data-mode="create">
                  <span className={styles.modeTrackerDots} aria-hidden>
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} />
                  </span>
                </div>
                <div className={styles.modeTrackerRow} data-mode="astro">
                  <span className={styles.modeTrackerDots} aria-hidden>
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} data-filled />
                  </span>
                </div>
                <div className={styles.modeTrackerRow} data-mode="print">
                  <span className={styles.modeTrackerDots} aria-hidden>
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                  </span>
                </div>
                <div className={styles.modeTrackerRow} data-mode="explore">
                  <span className={styles.modeTrackerDots} aria-hidden>
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} />
                  </span>
                </div>
                <div className={styles.modeTrackerRow} data-mode="other">
                  <span className={styles.modeTrackerDots} aria-hidden>
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} data-filled />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} />
                    <span className={styles.modeDot} />
                  </span>
                </div>
              </div>
            </div>
            <p className={styles.monthlyInsight}>
              Dev Mode dominates long-term focus.
            </p>
          </div>
        </section>

        <section
          className={styles.suggestedFocusSection}
          aria-label="Suggested focus"
        >
          <div className={styles.suggestedFocusTitle}>SUGGESTED FOCUS</div>
          <p className={styles.suggestedFocusText}>
            Consider scheduling focused time in Create Mode.
          </p>
        </section>

        {/* <section className={styles.monthlyNudgeSection} aria-label="Monthly suggestion">
        <div className={styles.monthlyNudgeTitle}>SUGGESTION</div>
        <p className={styles.monthlyNudgeText}>Consider scheduling protected creative time weekly.</p>
      </section> */}
      </div>
    </div>
  );
}

export default FocusOpsPanel;
