/**
 * Mock data provider for Life Ops — frontend only.
 * TODO: Swap for real API / Supabase when backend is wired.
 */

import {
  MOCK_CONNECTIONS,
  MOCK_DAILY_METRICS,
  MOCK_WORKOUTS,
  MOCK_READINESS,
  DEFAULT_HR_BPM,
} from '../demoData'

const FAKE_LATENCY_MS = 300

function delay(ms = FAKE_LATENCY_MS) {
  return new Promise((r) => setTimeout(r, ms))
}

let connections = { ...MOCK_CONNECTIONS }
let dailyMetrics = [...MOCK_DAILY_METRICS]
let workouts = [...MOCK_WORKOUTS]
let readiness = { ...MOCK_READINESS }

export async function getConnections() {
  await delay()
  return { ...connections }
}

export async function getDailyMetrics(days = 7) {
  await delay()
  return dailyMetrics.slice(-Math.min(days, dailyMetrics.length))
}

export async function getWorkouts(days = 14) {
  await delay()
  const cutoff = Date.now() - days * 86400000
  return workouts.filter((w) => w.started_at >= cutoff)
}

export async function getReadiness() {
  await delay()
  return { ...readiness }
}

export async function getCurrentHR() {
  await delay(50)
  return DEFAULT_HR_BPM
}

/**
 * Simulate sync from Strava or HealthKit.
 * Updates last sync time and may add 0–2 workouts + update daily rollups.
 * TODO: Wire to real OAuth + sync pipeline.
 */
export async function simulateSync(source) {
  await delay(800)
  const now = Date.now()
  if (source === 'strava') {
    connections.stravaLastSync = now
    if (workouts.length < 8) {
      workouts.unshift({
        id: `ws-${now}`,
        type: 'run',
        started_at: now - 3600000,
        duration_min: 25,
        distance_km: 4,
        avg_hr: 135,
        elevation_gain_m: 45,
        source: 'strava',
      })
    }
  } else if (source === 'healthkit') {
    connections.healthkitConnected = true
    connections.healthkitLastSync = now
  }
  return getConnections()
}
