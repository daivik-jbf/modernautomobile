import { connection } from "next/server";

/**
 * Health check used by the maintenance screen to know when the site is back.
 * Returns 503 while MAINTENANCE_MODE=1, otherwise 200. Never cached.
 */
export async function GET() {
  await connection(); // always evaluate per request, never at build time
  const maintenance = process.env.MAINTENANCE_MODE === "1";
  return Response.json(
    { ok: !maintenance, maintenance },
    { status: maintenance ? 503 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
