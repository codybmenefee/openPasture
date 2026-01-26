"""
Convex HTTP client for the satellite pipeline.

Provides a simple interface to query and mutate Convex data
via the HTTP API.
"""
import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)


class ConvexClient:
    """
    HTTP client for Convex backend.

    Uses the Convex HTTP API to execute queries and mutations.
    """

    def __init__(self, deployment_url: str, api_key: str):
        """
        Initialize the Convex client.

        Args:
            deployment_url: Convex deployment URL (https://xxx.convex.cloud)
            api_key: Convex deploy key
        """
        self.deployment_url = deployment_url.rstrip("/")
        self.api_key = api_key
        self._client = httpx.Client(timeout=60.0)

    def query(self, function_name: str, args: dict | None = None) -> Any:
        """
        Execute a Convex query function.

        Args:
            function_name: Full function path (e.g., "farms:list")
            args: Query arguments

        Returns:
            Query result

        Raises:
            RuntimeError: If query fails
        """
        url = f"{self.deployment_url}/api/query"

        payload = {
            "path": function_name,
            "args": args or {},
            "format": "json",
        }

        response = self._client.post(
            url,
            json=payload,
            headers={
                "Authorization": f"Convex {self.api_key}",
                "Content-Type": "application/json",
            },
        )

        if response.status_code != 200:
            logger.error(f"Query failed: {response.status_code} - {response.text}")
            raise RuntimeError(f"Convex query failed: {response.status_code}")

        result = response.json()

        if "value" in result:
            return result["value"]
        elif "error" in result:
            raise RuntimeError(f"Convex query error: {result['error']}")
        else:
            return result

    def mutation(self, function_name: str, args: dict | None = None) -> Any:
        """
        Execute a Convex mutation function.

        Args:
            function_name: Full function path (e.g., "observations:create")
            args: Mutation arguments

        Returns:
            Mutation result

        Raises:
            RuntimeError: If mutation fails
        """
        url = f"{self.deployment_url}/api/mutation"

        payload = {
            "path": function_name,
            "args": args or {},
            "format": "json",
        }

        response = self._client.post(
            url,
            json=payload,
            headers={
                "Authorization": f"Convex {self.api_key}",
                "Content-Type": "application/json",
            },
        )

        if response.status_code != 200:
            logger.error(f"Mutation failed: {response.status_code} - {response.text}")
            raise RuntimeError(f"Convex mutation failed: {response.status_code}")

        result = response.json()

        if "value" in result:
            return result["value"]
        elif "error" in result:
            raise RuntimeError(f"Convex mutation error: {result['error']}")
        else:
            return result

    def action(self, function_name: str, args: dict | None = None) -> Any:
        """
        Execute a Convex action function.

        Args:
            function_name: Full function path (e.g., "ai:generate")
            args: Action arguments

        Returns:
            Action result

        Raises:
            RuntimeError: If action fails
        """
        url = f"{self.deployment_url}/api/action"

        payload = {
            "path": function_name,
            "args": args or {},
            "format": "json",
        }

        response = self._client.post(
            url,
            json=payload,
            headers={
                "Authorization": f"Convex {self.api_key}",
                "Content-Type": "application/json",
            },
        )

        if response.status_code != 200:
            logger.error(f"Action failed: {response.status_code} - {response.text}")
            raise RuntimeError(f"Convex action failed: {response.status_code}")

        result = response.json()

        if "value" in result:
            return result["value"]
        elif "error" in result:
            raise RuntimeError(f"Convex action error: {result['error']}")
        else:
            return result

    def close(self):
        """Close the HTTP client."""
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
