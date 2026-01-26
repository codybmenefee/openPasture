"""
Satellite Pipeline Service - Main Entry Point

This service runs as a Railway cron job to process satellite imagery
for all active farms with subscriptions.

Schedule: Every 8 hours (0 */8 * * *)

Flow:
1. Query Convex for all active farms with subscriptions
2. Check each farm's last observation date
3. If > 2 days since last observation, process farm
4. Upload tiles to R2 for paid tiers
5. Write results to Convex
"""
import logging
import os
import sys
import threading
from datetime import datetime, timedelta
from typing import Optional

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from health import start_health_server
from scheduler import FarmScheduler
from convex_client import ConvexClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


def load_config() -> dict:
    """Load configuration from environment variables."""
    required_vars = [
        "CONVEX_DEPLOYMENT_URL",
        "CONVEX_API_KEY",
    ]

    # Check required variables
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

    return {
        "convex_url": os.getenv("CONVEX_DEPLOYMENT_URL"),
        "convex_api_key": os.getenv("CONVEX_API_KEY"),
        "copernicus_client_id": os.getenv("COPERNICUS_CLIENT_ID"),
        "copernicus_client_secret": os.getenv("COPERNICUS_CLIENT_SECRET"),
        "r2_account_id": os.getenv("R2_ACCOUNT_ID"),
        "r2_access_key_id": os.getenv("R2_ACCESS_KEY_ID"),
        "r2_secret_access_key": os.getenv("R2_SECRET_ACCESS_KEY"),
        "r2_bucket_name": os.getenv("R2_BUCKET_NAME", "grazing-satellite-tiles"),
        "observation_threshold_days": int(os.getenv("OBSERVATION_THRESHOLD_DAYS", "2")),
        "max_farms_per_run": int(os.getenv("MAX_FARMS_PER_RUN", "50")),
        "dry_run": os.getenv("DRY_RUN", "false").lower() == "true",
    }


def run_pipeline(config: dict) -> dict:
    """
    Run the satellite processing pipeline.

    Returns:
        Summary of processing results
    """
    logger.info("=" * 60)
    logger.info("Starting satellite pipeline run")
    logger.info(f"Timestamp: {datetime.now().isoformat()}")
    logger.info("=" * 60)

    # Initialize Convex client
    convex = ConvexClient(
        deployment_url=config["convex_url"],
        api_key=config["convex_api_key"],
    )

    # Initialize scheduler
    scheduler = FarmScheduler(
        convex=convex,
        observation_threshold_days=config["observation_threshold_days"],
    )

    # Get farms that need processing
    logger.info("Fetching farms to process...")
    farms_to_process = scheduler.get_farms_needing_update(
        max_farms=config["max_farms_per_run"]
    )

    logger.info(f"Found {len(farms_to_process)} farms to process")

    if config["dry_run"]:
        logger.info("DRY RUN - No actual processing will occur")
        for farm in farms_to_process:
            logger.info(f"  Would process: {farm['name']} ({farm['externalId']})")
        return {
            "farms_found": len(farms_to_process),
            "farms_processed": 0,
            "dry_run": True,
        }

    # Process each farm
    results = {
        "farms_found": len(farms_to_process),
        "farms_processed": 0,
        "farms_succeeded": 0,
        "farms_failed": 0,
        "observations_written": 0,
        "tiles_uploaded": 0,
        "errors": [],
    }

    for farm in farms_to_process:
        farm_id = farm["externalId"]
        farm_name = farm["name"]

        logger.info("-" * 40)
        logger.info(f"Processing farm: {farm_name} ({farm_id})")

        try:
            result = scheduler.process_farm(farm, config)
            results["farms_processed"] += 1
            results["farms_succeeded"] += 1
            results["observations_written"] += result.get("observations_written", 0)
            results["tiles_uploaded"] += result.get("tiles_uploaded", 0)

            logger.info(f"  Success: {result.get('observations_written', 0)} observations written")

        except Exception as e:
            logger.error(f"  Failed to process farm {farm_id}: {e}", exc_info=True)
            results["farms_processed"] += 1
            results["farms_failed"] += 1
            results["errors"].append({
                "farm_id": farm_id,
                "error": str(e),
            })

    # Log summary
    logger.info("=" * 60)
    logger.info("Pipeline run complete")
    logger.info(f"  Farms processed: {results['farms_processed']}/{results['farms_found']}")
    logger.info(f"  Succeeded: {results['farms_succeeded']}")
    logger.info(f"  Failed: {results['farms_failed']}")
    logger.info(f"  Observations written: {results['observations_written']}")
    logger.info(f"  Tiles uploaded: {results['tiles_uploaded']}")
    logger.info("=" * 60)

    return results


def main():
    """Main entry point."""
    try:
        # Load configuration
        config = load_config()
        logger.info("Configuration loaded successfully")

        # Start health check server in background
        health_thread = threading.Thread(target=start_health_server, daemon=True)
        health_thread.start()
        logger.info("Health check server started on port 8080")

        # Run the pipeline
        results = run_pipeline(config)

        # Exit with appropriate code
        if results.get("farms_failed", 0) > 0:
            # Some farms failed, but not a critical error
            logger.warning("Pipeline completed with some failures")
            sys.exit(0)  # Still exit 0 so cron continues
        else:
            logger.info("Pipeline completed successfully")
            sys.exit(0)

    except Exception as e:
        logger.error(f"Pipeline failed with critical error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
