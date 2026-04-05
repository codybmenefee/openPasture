/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bugReports from "../bugReports.js";
import type * as bugReportsAction from "../bugReportsAction.js";
import type * as crons from "../crons.js";
import type * as data_farmerObservations from "../data/farmerObservations.js";
import type * as data_farms from "../data/farms.js";
import type * as data_livestock from "../data/livestock.js";
import type * as data_noGrazeZones from "../data/noGrazeZones.js";
import type * as data_observations from "../data/observations.js";
import type * as data_organizations from "../data/organizations.js";
import type * as data_paddocks from "../data/paddocks.js";
import type * as data_satelliteTiles from "../data/satelliteTiles.js";
import type * as data_settings from "../data/settings.js";
import type * as data_users from "../data/users.js";
import type * as data_waterSources from "../data/waterSources.js";
import type * as data_zones from "../data/zones.js";
import type * as demo from "../demo.js";
import type * as featureRequests from "../featureRequests.js";
import type * as featureRequestsAction from "../featureRequestsAction.js";
import type * as geocoding from "../geocoding.js";
import type * as harness_agent_agentAdmin from "../harness/agent/agentAdmin.js";
import type * as harness_agent_grazingAgentDirect from "../harness/agent/grazingAgentDirect.js";
import type * as harness_agent_grazingAgentGateway from "../harness/agent/grazingAgentGateway.js";
import type * as harness_agent_types from "../harness/agent/types.js";
import type * as harness_tools__helpers from "../harness/tools/_helpers.js";
import type * as harness_tools_farmContext from "../harness/tools/farmContext.js";
import type * as harness_tools_forecastManagement from "../harness/tools/forecastManagement.js";
import type * as harness_tools_grazingAgentTools from "../harness/tools/grazingAgentTools.js";
import type * as harness_tools_planManagement from "../harness/tools/planManagement.js";
import type * as harness_tools_readPaddockState from "../harness/tools/readPaddockState.js";
import type * as harness_tools_recordObservation from "../harness/tools/recordObservation.js";
import type * as harness_tools_rotationManagement from "../harness/tools/rotationManagement.js";
import type * as http from "../http.js";
import type * as internal_ from "../internal.js";
import type * as lib_agentAccess from "../lib/agentAccess.js";
import type * as lib_areaConstants from "../lib/areaConstants.js";
import type * as lib_geoCompat from "../lib/geoCompat.js";
import type * as lib_grazingPrinciples from "../lib/grazingPrinciples.js";
import type * as lib_logger from "../lib/logger.js";
import type * as lib_paddockVisualization from "../lib/paddockVisualization.js";
import type * as lib_s3Signer from "../lib/s3Signer.js";
import type * as lib_sectionSizing from "../lib/sectionSizing.js";
import type * as migrations_backfillObservationSourceType from "../migrations/backfillObservationSourceType.js";
import type * as migrations_deleteBadFarmSettings from "../migrations/deleteBadFarmSettings.js";
import type * as migrations_migrateToClerkOrgs from "../migrations/migrateToClerkOrgs.js";
import type * as migrations_updateDemoGeometries from "../migrations/updateDemoGeometries.js";
import type * as seedData from "../seedData.js";
import type * as subscriptions from "../subscriptions.js";
import type * as workflows_intelligence from "../workflows/intelligence.js";
import type * as workflows_intelligenceActions from "../workflows/intelligenceActions.js";
import type * as workflows_ndviGrid from "../workflows/ndviGrid.js";
import type * as workflows_notifications from "../workflows/notifications.js";
import type * as workflows_onboarding from "../workflows/onboarding.js";
import type * as workflows_photoAnalysis from "../workflows/photoAnalysis.js";
import type * as workflows_satelliteFetchJobs from "../workflows/satelliteFetchJobs.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bugReports: typeof bugReports;
  bugReportsAction: typeof bugReportsAction;
  crons: typeof crons;
  "data/farmerObservations": typeof data_farmerObservations;
  "data/farms": typeof data_farms;
  "data/livestock": typeof data_livestock;
  "data/noGrazeZones": typeof data_noGrazeZones;
  "data/observations": typeof data_observations;
  "data/organizations": typeof data_organizations;
  "data/paddocks": typeof data_paddocks;
  "data/satelliteTiles": typeof data_satelliteTiles;
  "data/settings": typeof data_settings;
  "data/users": typeof data_users;
  "data/waterSources": typeof data_waterSources;
  "data/zones": typeof data_zones;
  demo: typeof demo;
  featureRequests: typeof featureRequests;
  featureRequestsAction: typeof featureRequestsAction;
  geocoding: typeof geocoding;
  "harness/agent/agentAdmin": typeof harness_agent_agentAdmin;
  "harness/agent/grazingAgentDirect": typeof harness_agent_grazingAgentDirect;
  "harness/agent/grazingAgentGateway": typeof harness_agent_grazingAgentGateway;
  "harness/agent/types": typeof harness_agent_types;
  "harness/tools/_helpers": typeof harness_tools__helpers;
  "harness/tools/farmContext": typeof harness_tools_farmContext;
  "harness/tools/forecastManagement": typeof harness_tools_forecastManagement;
  "harness/tools/grazingAgentTools": typeof harness_tools_grazingAgentTools;
  "harness/tools/planManagement": typeof harness_tools_planManagement;
  "harness/tools/readPaddockState": typeof harness_tools_readPaddockState;
  "harness/tools/recordObservation": typeof harness_tools_recordObservation;
  "harness/tools/rotationManagement": typeof harness_tools_rotationManagement;
  http: typeof http;
  internal: typeof internal_;
  "lib/agentAccess": typeof lib_agentAccess;
  "lib/areaConstants": typeof lib_areaConstants;
  "lib/geoCompat": typeof lib_geoCompat;
  "lib/grazingPrinciples": typeof lib_grazingPrinciples;
  "lib/logger": typeof lib_logger;
  "lib/paddockVisualization": typeof lib_paddockVisualization;
  "lib/s3Signer": typeof lib_s3Signer;
  "lib/sectionSizing": typeof lib_sectionSizing;
  "migrations/backfillObservationSourceType": typeof migrations_backfillObservationSourceType;
  "migrations/deleteBadFarmSettings": typeof migrations_deleteBadFarmSettings;
  "migrations/migrateToClerkOrgs": typeof migrations_migrateToClerkOrgs;
  "migrations/updateDemoGeometries": typeof migrations_updateDemoGeometries;
  seedData: typeof seedData;
  subscriptions: typeof subscriptions;
  "workflows/intelligence": typeof workflows_intelligence;
  "workflows/intelligenceActions": typeof workflows_intelligenceActions;
  "workflows/ndviGrid": typeof workflows_ndviGrid;
  "workflows/notifications": typeof workflows_notifications;
  "workflows/onboarding": typeof workflows_onboarding;
  "workflows/photoAnalysis": typeof workflows_photoAnalysis;
  "workflows/satelliteFetchJobs": typeof workflows_satelliteFetchJobs;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
