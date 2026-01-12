/**
 * Health Check Service
 * Periodically pings the API to keep it awake and prevent timeout
 * Useful for preventing services from sleeping on free/limited tier hosting
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

let healthCheckInterval: NodeJS.Timeout | null = null;

/**
 * Starts periodic health checks
 * This prevents the API/app from going to sleep when not actively used
 */
export function startHealthChecks() {
  if (healthCheckInterval) {
    console.log('Health checks already running');
    return;
  }

  console.log('Starting health checks (every 5 minutes)');

  // Run immediately on start
  performHealthCheck();

  // Then run periodically
  healthCheckInterval = setInterval(performHealthCheck, HEALTH_CHECK_INTERVAL);
}

/**
 * Stops periodic health checks
 */
export function stopHealthChecks() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    console.log('Health checks stopped');
  }
}

/**
 * Performs a single health check
 */
async function performHealthCheck() {
  try {
    const timestamp = new Date().toISOString();
    
    // Ping the detailed health endpoint (includes frontend check)
    const response = await fetch(`${API_URL.replace('/api', '')}/health/detailed`, {
      method: 'GET',
      headers: {
        'User-Agent': 'PortfolioHealthCheck/1.0',
      },
    });

    const data = await response.json();
    console.log(`[${timestamp}] Health check: ${data.status}`, data.checks);
  } catch (error) {
    console.warn(
      `[${new Date().toISOString()}] Health check failed:`,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
