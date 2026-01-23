"""
Convex HTTP client for writing observations to Convex.

This module provides a client to write observation records to Convex
via HTTP API calls. It handles authentication, batching, and error handling.
"""
import json
import logging
import os
import time
from typing import Callable, Optional
from urllib.parse import urljoin

import requests

from pipeline import ObservationRecord

logger = logging.getLogger(__name__)


class ConvexWriter:
    """HTTP client for writing observations to Convex."""

    def __init__(
        self,
        deployment_url: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        """
        Initialize Convex writer.

        Args:
            deployment_url: Convex deployment URL (e.g., https://xxx.convex.cloud)
            api_key: Convex API key for authentication
        """
        self.deployment_url = deployment_url or os.environ.get("CONVEX_DEPLOYMENT_URL")
        self.api_key = api_key or os.environ.get("CONVEX_API_KEY")

        if not self.deployment_url:
            raise ValueError("CONVEX_DEPLOYMENT_URL environment variable is required")
        if not self.api_key:
            raise ValueError("CONVEX_API_KEY environment variable is required")

        # Ensure URL doesn't end with slash
        self.deployment_url = self.deployment_url.rstrip("/")
        self.base_url = f"{self.deployment_url}/api/mutation"

    def _make_request(
        self,
        function_name: str,
        args: dict,
        max_retries: int = 3,
        retry_delay: float = 1.0,
    ) -> dict:
        """
        Make HTTP request to Convex mutation.

        Args:
            function_name: Name of Convex mutation function
            args: Arguments to pass to the function
            max_retries: Maximum number of retry attempts
            retry_delay: Initial delay between retries (exponential backoff)

        Returns:
            Response JSON as dictionary

        Raises:
            requests.RequestException: If request fails after retries
        """
        url = f"{self.base_url}/{function_name}"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {"args": args}

        for attempt in range(max_retries):
            try:
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                return response.json()
            except requests.RequestException as e:
                if attempt < max_retries - 1:
                    delay = retry_delay * (2 ** attempt)
                    logger.warning(
                        f"Request failed (attempt {attempt + 1}/{max_retries}): {e}. "
                        f"Retrying in {delay}s..."
                    )
                    time.sleep(delay)
                else:
                    logger.error(f"Request failed after {max_retries} attempts: {e}")
                    raise

    def write_observation(self, observation: ObservationRecord) -> str:
        """
        Write a single observation to Convex.

        Args:
            observation: Observation record to write

        Returns:
            Convex document ID
        """
        result = self._make_request("observations:create", observation)
        return result.get("_id", "")

    def write_observations_batch(
        self, observations: list[ObservationRecord], batch_size: int = 50
    ) -> int:
        """
        Write multiple observations to Convex in batches.

        Args:
            observations: List of observation records
            batch_size: Number of observations per batch

        Returns:
            Number of successfully written observations
        """
        total_written = 0

        for i in range(0, len(observations), batch_size):
            batch = observations[i : i + batch_size]
            logger.info(f"Writing batch {i // batch_size + 1} ({len(batch)} observations)")

            try:
                # Write batch using Convex mutation
                # Note: Convex mutation path format is "module:function"
                result = self._make_request(
                    "observations:refreshObservations",
                    {"observations": batch},
                )
                written_count = result.get("inserted", 0) + result.get("updated", 0)
                total_written += written_count
                logger.info(f"  Wrote {written_count} observations")
            except Exception as e:
                logger.error(f"  Error writing batch: {e}")
                # Continue with next batch
                continue

        return total_written


def create_convex_writer() -> Optional[ConvexWriter]:
    """
    Create a Convex writer instance if configuration is available.

    Returns:
        ConvexWriter instance or None if configuration is missing
    """
    try:
        return ConvexWriter()
    except ValueError as e:
        logger.warning(f"Convex writer not available: {e}")
        return None


def write_observations_to_convex(
    observations: list[ObservationRecord],
) -> int:
    """
    Write observations to Convex (convenience function).

    Args:
        observations: List of observation records

    Returns:
        Number of successfully written observations
    """
    writer = create_convex_writer()
    if not writer:
        logger.warning("Convex writer not configured, skipping write")
        return 0

    if not observations:
        logger.info("No observations to write")
        return 0

    return writer.write_observations_batch(observations)
