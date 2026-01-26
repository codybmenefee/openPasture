"""
Farm scheduling logic for satellite pipeline.

Determines which farms need processing based on their last observation
date and subscription status.
"""
import logging
from datetime import datetime, timedelta
from typing import Any

from convex_client import ConvexClient

logger = logging.getLogger(__name__)


class FarmScheduler:
    """
    Scheduler for determining which farms need satellite data updates.

    Checks each farm's subscription status and last observation date
    to prioritize processing.
    """

    def __init__(
        self,
        convex: ConvexClient,
        observation_threshold_days: int = 2,
    ):
        """
        Initialize the scheduler.

        Args:
            convex: Convex client for database queries
            observation_threshold_days: Days since last observation to trigger update
        """
        self.convex = convex
        self.observation_threshold_days = observation_threshold_days

    def get_farms_needing_update(self, max_farms: int = 50) -> list[dict]:
        """
        Get list of farms that need satellite data updates.

        Criteria:
        1. Farm has an active subscription (or free tier)
        2. Last observation is older than threshold
        3. Farm has a valid boundary geometry

        Args:
            max_farms: Maximum number of farms to return

        Returns:
            List of farm data dictionaries
        """
        logger.info("Querying farms from Convex...")

        # Get all farms with their settings and subscriptions
        farms = self.convex.query("farms:listAllWithSettings", {})

        if not farms:
            logger.warning("No farms found in database")
            return []

        logger.info(f"Found {len(farms)} total farms")

        # Filter farms that need updates
        farms_needing_update = []
        threshold_date = datetime.now() - timedelta(days=self.observation_threshold_days)

        for farm in farms:
            farm_id = farm.get("externalId")

            # Check if farm has geometry
            if not farm.get("geometry"):
                logger.debug(f"Skipping farm {farm_id}: no geometry")
                continue

            # Check subscription status
            subscription = farm.get("subscription")
            if subscription:
                if subscription.get("status") not in ["active", None]:
                    logger.debug(f"Skipping farm {farm_id}: subscription status {subscription.get('status')}")
                    continue

            # Check last observation date
            last_observation = self._get_last_observation_date(farm_id)

            if last_observation:
                last_obs_dt = datetime.fromisoformat(last_observation.replace("Z", "+00:00"))
                if last_obs_dt.replace(tzinfo=None) > threshold_date:
                    logger.debug(f"Skipping farm {farm_id}: recent observation on {last_observation}")
                    continue

            farms_needing_update.append(farm)

            if len(farms_needing_update) >= max_farms:
                break

        logger.info(f"Found {len(farms_needing_update)} farms needing updates")
        return farms_needing_update

    def _get_last_observation_date(self, farm_external_id: str) -> str | None:
        """Get the date of the most recent observation for a farm."""
        try:
            result = self.convex.query(
                "observations:getLatestObservationDate",
                {"farmExternalId": farm_external_id}
            )
            return result
        except Exception as e:
            logger.warning(f"Error getting last observation for {farm_external_id}: {e}")
            return None

    def process_farm(self, farm: dict, config: dict) -> dict:
        """
        Process satellite data for a single farm.

        Args:
            farm: Farm data dictionary
            config: Pipeline configuration

        Returns:
            Processing result dictionary
        """
        import sys
        import os

        # Add ingestion module to path
        ingestion_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "..", "..", "src", "ingestion"
        )
        sys.path.insert(0, ingestion_path)

        from pipeline import run_pipeline_for_farm
        from config import FarmConfig, PipelineConfig

        # Get subscription info for tier
        subscription = farm.get("subscription", {})
        tier = subscription.get("tier", "free")

        # Get farm settings
        settings = farm.get("settings", {})

        # Build FarmConfig
        farm_config = FarmConfig(
            farm_id=str(farm.get("_id")),
            external_id=farm.get("externalId"),
            name=farm.get("name"),
            geometry=farm.get("geometry"),
            paddocks=farm.get("paddocks", []),
            subscription_tier=tier,
            planet_api_key=settings.get("planetScopeApiKey"),
        )

        # Build PipelineConfig
        pipeline_config = PipelineConfig(
            composite_window_days=21,
            max_cloud_cover=50,
            write_to_convex=True,
        )

        # Run the pipeline
        result = run_pipeline_for_farm(
            farm_config=farm_config,
            pipeline_config=pipeline_config,
        )

        # Handle R2 uploads for paid tiers
        tiles_uploaded = 0
        if tier != "free" and config.get("r2_account_id"):
            tiles_uploaded = self._upload_tiles_to_r2(farm, result, config)

        return {
            "observations_written": len(result.get("observations", [])),
            "tiles_uploaded": tiles_uploaded,
            "provider_used": result.get("provider_used"),
        }

    def _upload_tiles_to_r2(self, farm: dict, pipeline_result: dict, config: dict) -> int:
        """
        Upload processed tiles to Cloudflare R2.

        Only for paid tiers with R2 configured.
        """
        # R2 upload implementation would go here
        # For now, return 0 as placeholder
        logger.info("R2 tile upload not yet implemented")
        return 0
