/**
 * Mock data for Life Ops — frontend only.
 * Expanded for HUMAN.EXE dossier: placeholders for vo2max, respiratory, sleep stages, etc.
 * TODO: Replace with real API / Supabase when backend is wired.
 */

const now = Date.now()
const dayMs = 86400000

export const MOCK_CONNECTIONS = {
  stravaConnected: true,
  healthkitConnected: false,
  stravaLastSync: now - 3600000 * 2,
  healthkitLastSync: null,
}

// Some days populated with full metrics, some nulls for LOCKED states
export const MOCK_DAILY_METRICS = Array.from({ length: 7 }, (_, i) => {
  const d = 6 - i
  const hasHealthKit = i >= 4 // days 4,5,6 have "synced" placeholder data
  return {
    date: new Date(now - d * dayMs).toISOString().slice(0, 10),
    resting_hr: 58 + (i % 3) * 2,
    hrv: 42 + (i % 4) * 3,
    sleep_minutes: 420 + (i % 2) * 30,
    steps: 7200 + (i % 5) * 800,
    spo2: i >= 3 ? 97 + (i % 2) : null,
    respiratoryRate: hasHealthKit ? 14 + (i % 2) : null,
    sleepStages: hasHealthKit ? { rem: 90 + i * 5, core: 180 + i * 10, deep: 80 + i * 5 } : null,
    activeCalories: hasHealthKit ? 420 + i * 80 : null,
    walkingHR: hasHealthKit ? 72 + (i % 4) : null,
    temperatureDelta: hasHealthKit ? (i % 2 ? 0.1 : 0) : null,
    vo2max: i >= 5 ? 48 + (i % 3) : null,
  }
}).reverse()

export const MOCK_WORKOUTS = [
  { id: 'w1', type: 'run', started_at: now - dayMs, duration_min: 32, distance_km: 5.2, avg_hr: 142, elevation_gain_m: 85, source: 'strava' },
  { id: 'w2', type: 'ride', started_at: now - dayMs * 2, duration_min: 75, distance_km: 28, avg_hr: 128, elevation_gain_m: 420, source: 'strava' },
  { id: 'w3', type: 'walk', started_at: now - dayMs * 3, duration_min: 45, distance_km: 3.5, avg_hr: 98, elevation_gain_m: null, source: 'strava' },
  { id: 'w4', type: 'run', started_at: now - dayMs * 5, duration_min: 28, distance_km: 4.1, avg_hr: 138, elevation_gain_m: 62, source: 'strava' },
  { id: 'w5', type: 'ride', started_at: now - dayMs * 7, duration_min: 60, distance_km: 22, avg_hr: 122, elevation_gain_m: 310, source: 'strava' },
]

export const MOCK_READINESS = {
  score: 72,
  trend: 'down', // up | down | flat
  alerts: [
    { id: 'a1', type: 'warning', text: 'Low sleep last night (6h 12m)', dot: 'warning' },
    { id: 'a2', type: 'info', text: 'HRV dip vs 7d avg', dot: 'info' },
    { id: 'a3', type: 'warning', text: 'RHR elevated +4 bpm', dot: 'warning' },
  ],
  causes: {
    sleep: 28,   // contribution to score 0–100
    hrv: 38,
    rhr: 34,
  },
}

export const DEFAULT_HR_BPM = 68
