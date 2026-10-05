/* Shared explore data — UI-only, static placeholders */

export const SQUARES = [
  { id: 'cmd', type: 'project', label: 'command-center', gridIndex: 2 },
  { id: 'photo', type: 'project', label: 'photo-spotter', gridIndex: 3 },
  { id: 'milky', type: 'target', label: 'Milky Way Timelapse', gridIndex: 6 },
  { id: 'orion', type: 'target', label: 'Orion Nebula', gridIndex: 7 },
  { id: 'gh', type: 'system', label: 'GitHub', gridIndex: 12, status: 'Online', description: 'Code hosting and collaboration' },
  { id: 'supa', type: 'system', label: 'Supabase', gridIndex: 13, status: 'Online', description: 'Backend and database' },
  { id: 'motion', type: 'capture', label: 'Motion clip', gridIndex: 14, timestamp: 'Today · 8:41 PM', linked: 'Driveway Cam' },
  { id: 'scan', type: 'capture', label: 'Scan', gridIndex: 15, timestamp: 'Today · 2:15 PM', linked: 'command-center' },
  { id: 'photo-c', type: 'capture', label: 'Photo', gridIndex: 16, timestamp: 'Yesterday · 6:22 PM', linked: 'Orion Nebula' },
  { id: 'proof', type: 'capture', label: 'Proof', gridIndex: 17, timestamp: 'Yesterday · 11:00 AM', linked: 'Print job' },
  { id: 'astro', type: 'system', label: 'Astroberry', gridIndex: 18, status: 'Offline', description: 'Telescope controller' },
  { id: 'nas', type: 'system', label: 'NAS', gridIndex: 19, status: 'Online', description: 'Network storage' },
]

export const OUTSIDE_WORLD_SQUARES = [
  { id: 'ow-gh', type: 'system', label: 'GitHub', gridIndex: 0, status: 'Online', description: 'Code hosting and collaboration' },
  { id: 'ow-supa', type: 'system', label: 'Supabase', gridIndex: 1, status: 'Online', description: 'Backend and database' },
  { id: 'ow-astro', type: 'system', label: 'Astroberry', gridIndex: 2, status: 'Offline', description: 'Telescope controller' },
  { id: 'ow-nas', type: 'system', label: 'NAS / Storage', gridIndex: 3, status: 'Online', description: 'Network storage' },
  { id: 'ow-printer', type: 'system', label: 'Printer Console', gridIndex: 4, status: 'Online', description: 'Print queue and device' },
  { id: 'ow-sky', type: 'signal', label: 'Sky Conditions', gridIndex: 6, highlightPanel: 'astro' },
  { id: 'ow-weather', type: 'signal', label: 'Weather', gridIndex: 7, highlightPanel: null },
  { id: 'ow-motion', type: 'signal', label: 'Motion Detection', gridIndex: 8, highlightPanel: 'motion' },
  { id: 'ow-scanner', type: 'signal', label: 'Scanner Ready', gridIndex: 9, highlightPanel: 'motion' },
  { id: 'ow-telescope', type: 'signal', label: 'Telescope Online', gridIndex: 10, highlightPanel: 'astro' },
  { id: 'ow-darksky', type: 'location', label: 'Dark Sky Spot', gridIndex: 12, distance: '12 mi' },
  { id: 'ow-shooting', type: 'location', label: 'Shooting Location', gridIndex: 13, distance: '3 mi' },
  { id: 'ow-facility', type: 'location', label: 'Facility / Studio', gridIndex: 14, distance: '—' },
  { id: 'ow-ev-motion', type: 'event', label: 'Motion Clip Captured', gridIndex: 15, timestamp: 'Today · 8:41 PM', linked: 'Driveway Cam' },
  { id: 'ow-ev-scan', type: 'event', label: 'Scan Completed', gridIndex: 16, timestamp: 'Today · 2:15 PM', linked: 'command-center' },
  { id: 'ow-ev-print', type: 'event', label: 'Print Finished', gridIndex: 17, timestamp: 'Yesterday · 4:20 PM', linked: 'Onyx Tribute' },
]

export const NEWS_PLACEHOLDERS = [
  { id: 'n1', label: 'Astro window', time: '2h' },
  { id: 'n2', label: 'System update', time: '5h' },
  { id: 'n3', label: 'New capture', time: 'Yesterday' },
  { id: 'n4', label: 'Print queue', time: '1d' },
  { id: 'n5', label: 'Weather alert', time: '2d' },
  { id: 'n6', label: 'Milky Way peak', time: '3d' },
]

export const ARCHIVE_PLACEHOLDERS = [
  { id: 'a1', label: 'Session 0128', date: 'Jan 28' },
  { id: 'a2', label: 'Session 0127', date: 'Jan 27' },
  { id: 'a3', label: 'Export batch', date: 'Jan 26' },
]

export const LOCATIONS_PLACEHOLDERS = [
  { id: 'l1', label: 'Dark Sky Spot', distance: '12 mi' },
  { id: 'l2', label: 'Shooting Location', distance: '3 mi' },
  { id: 'l3', label: 'Studio', distance: '—' },
]

export const GRID_COLS = 6
export const GRID_ROWS = 4
export const GRID_SIZE = GRID_COLS * GRID_ROWS
export const OUTSIDE_WORLD_COLS = 6
export const OUTSIDE_WORLD_ROWS = 3
export const OUTSIDE_WORLD_SIZE = OUTSIDE_WORLD_COLS * OUTSIDE_WORLD_ROWS
