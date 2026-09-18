const mongoose = require('mongoose');
const logger = require('../utils/logger');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const RAG_HEALTH_TIMEOUT_MS = 2000;

const MONGO_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/**
 * Checks MongoDB connection state without issuing a query — readyState is
 * kept live by the driver's connection pool, so this is effectively free.
 */
const checkMongo = () => {
  const readyState = mongoose.connection.readyState;
  return {
    status: MONGO_STATES[readyState] || 'unknown',
    readyState,
  };
};

/**
 * Pings the RAG microservice's own /health endpoint with a short timeout so
 * a hung dependency can't stall this health check (and in turn Docker's
 * healthcheck / depends_on gating).
 */
const checkRagService = async () => {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RAG_HEALTH_TIMEOUT_MS);

  try {
    const base = process.env.RAG_SERVICE_URL || '';
    const url = `${base.endsWith('/') ? base.slice(0, -1) : base}/health`;
    const res = await fetch(url, { signal: controller.signal });
    const latencyMs = Date.now() - start;

    if (!res.ok) {
      return { status: 'unhealthy', httpStatus: res.status, latencyMs };
    }
    return { status: 'reachable', httpStatus: res.status, latencyMs };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const reason = error.name === 'AbortError' ? 'timeout' : error.message;
    return { status: 'unreachable', reason, latencyMs };
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * GET /health
 *
 * Always returns 200 as long as the Express process itself can respond —
 * mirrors the app's existing "never crash on a dependency outage" design
 * (see connectDB in config/mongodb.js). Dependency states are reported in
 * the body so operators/monitoring can detect degradation without Docker
 * restarting or Caddy/other services blocking on a transient outage of a
 * single dependency. See Decisions.md for the reasoning.
 */
const getHealth = async (req, res) => {
  const [mongodb, ragService] = await Promise.all([
    Promise.resolve(checkMongo()),
    checkRagService(),
  ]);

  const degraded = mongodb.status !== 'connected' || ragService.status !== 'reachable';
  if (degraded) {
    logger.warn(`Health check degraded — mongodb=${mongodb.status} ragService=${ragService.status}`);
  }

  res.status(200).json({
    success: true,
    status: degraded ? 'degraded' : 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    dependencies: {
      mongodb,
      ragService,
    },
    memory: { rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024) },
  });
};

module.exports = { getHealth };
