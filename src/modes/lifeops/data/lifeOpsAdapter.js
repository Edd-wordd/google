/**
 * Life Ops data adapter — async API used by components.
 * Components must not import mock data directly; use this adapter.
 *
 * TODO: Replace mock provider with real API when backend is wired.
 * TODO: getConnections / getDailyMetrics / getWorkouts → REST or Supabase.
 * TODO: simulateSync → real OAuth + sync pipeline (Strava / HealthKit).
 */

import * as provider from './providers/mockProvider'

export async function getConnections() {
  return provider.getConnections()
}

export async function getDailyMetrics(days = 7) {
  return provider.getDailyMetrics(days)
}

export async function getWorkouts(days = 14) {
  return provider.getWorkouts(days)
}

export async function simulateSync(source) {
  if (source !== 'strava' && source !== 'healthkit') return provider.getConnections()
  return provider.simulateSync(source)
}

export async function getReadiness() {
  return provider.getReadiness()
}

export async function getCurrentHR() {
  return provider.getCurrentHR()
}
