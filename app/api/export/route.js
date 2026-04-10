/**
 * app/api/export/route.js
 * POST /api/export — returns campaign JSON as a downloadable file
 * GET  /api/export — health check
 */

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!body || typeof body !== "object") {
      return Response.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    const exportPayload = {
      ...body,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    return new Response(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="campaign-${Date.now()}.json"`,
      },
    });
  } catch (err) {
    console.error("[export] error:", err?.message);
    return Response.json({ ok: false, error: err?.message ?? "Export failed" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({
    ok: true,
    description: "Campaign export endpoint. POST a campaign object to download as JSON.",
  });
}