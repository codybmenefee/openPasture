/**
 * Grazing Agent Tools - Backward-compatible re-export barrel.
 *
 * All implementations have been split into focused modules:
 *   - readPaddockState.ts   (paddock queries)
 *   - farmContext.ts         (farm settings, livestock, grazing principles)
 *   - planManagement.ts      (plan creation, finalization, previous sections)
 *   - rotationManagement.ts  (rotation lifecycle, ungrazed geometry)
 *   - forecastManagement.ts  (paddock forecasts, section drawing)
 *   - _helpers.ts            (shared utilities)
 *
 * This file re-exports everything so that existing Convex API paths
 * like `api.harness.tools.grazingAgentTools.*` continue to work.
 */

// Read-only paddock state queries
export {
  getAllPaddocksWithObservations,
  getPaddockData,
  getPaddockContextForAgent,
} from './readPaddockState'

// Farm-level context
export { getFarmSettings, getLivestockContextForAgent, getGrazingPrinciples } from './farmContext'

// Plan creation and management
export { createPlanWithSection, finalizePlan, getPreviousSections } from './planManagement'

// Rotation lifecycle
export {
  getActiveRotation,
  getRotationSections,
  getPreviousRotation,
  initializeRotation,
  recordSectionGrazed,
  recordUngrazedArea,
  completeRotation,
  calculatePaddockGrazedPercentage,
  computeUngrazedGeometry,
  getUngrazedRemaining,
} from './rotationManagement'

// Paddock forecast system
export {
  getOrCreateForecast,
  getActiveForecast,
  deleteForecast,
  evaluateForecastContext,
  drawSection,
  clearForecastSections,
} from './forecastManagement'

// Observation recording (unified ingestion)
export { recordObservation, recordNote } from './recordObservation'
