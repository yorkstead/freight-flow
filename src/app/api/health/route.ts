import { NextResponse } from "next/server";

/**
 * GET /api/health
 *
 * Simple health check endpoint. Use this for:
 * - Docker HEALTHCHECK instructions
 * - Load balancer health probes
 * - Uptime monitoring (e.g., UptimeRobot, Healthchecks.io)
 *
 * Returns: { status: "ok", timestamp: "ISO 8601" }
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
