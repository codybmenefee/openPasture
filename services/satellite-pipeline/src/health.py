"""
Health check server for Railway deployment.

Provides a /health endpoint for deployment health monitoring.
"""
import json
import logging
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler

logger = logging.getLogger(__name__)

# Global state for health status
_health_status = {
    "status": "healthy",
    "last_run": None,
    "last_run_result": None,
    "started_at": datetime.now().isoformat(),
}


def update_health_status(run_result: dict | None = None, error: str | None = None):
    """Update the health status after a pipeline run."""
    _health_status["last_run"] = datetime.now().isoformat()

    if error:
        _health_status["status"] = "degraded"
        _health_status["last_run_result"] = {"error": error}
    elif run_result:
        _health_status["status"] = "healthy"
        _health_status["last_run_result"] = run_result


class HealthHandler(BaseHTTPRequestHandler):
    """HTTP handler for health check endpoint."""

    def do_GET(self):
        """Handle GET requests."""
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()

            response = {
                **_health_status,
                "timestamp": datetime.now().isoformat(),
            }
            self.wfile.write(json.dumps(response).encode())

        elif self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Satellite Pipeline Service")

        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        """Suppress default logging for health checks."""
        if "/health" not in args[0]:
            logger.debug(format % args)


def start_health_server(port: int = 8080):
    """Start the health check HTTP server."""
    server = HTTPServer(("0.0.0.0", port), HealthHandler)
    logger.info(f"Health server listening on port {port}")
    server.serve_forever()
