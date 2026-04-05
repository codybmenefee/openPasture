/**
 * Barrel file for grazing agent tools.
 * Re-exports all tool primitives from their individual modules.
 */

export {
  getAllPaddocksWithObservations,
  getPaddockData,
  getPaddockContextForAgent,
} from './readPaddockState'

export { getFarmSettings, getLivestockContextForAgent, getGrazingPrinciples } from './farmContext'

export { createPlanWithSection, finalizePlan, getPreviousSections } from './planManagement'

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

export {
  getOrCreateForecast,
  getActiveForecast,
  deleteForecast,
  evaluateForecastContext,
  drawSection,
  clearForecastSections,
} from './forecastManagement'
