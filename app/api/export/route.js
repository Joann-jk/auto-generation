/*
  Optional export route (kept minimal).
  Accepts POST with campaign JSON and returns it back — frontend handles download.
*/
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: true, payload: body }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: (err?.message ?? "export failed") }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}