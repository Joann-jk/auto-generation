import { executePipeline } from "@/lib/pipeline.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const rawInput = body?.input;
    const trimmedInput = typeof rawInput === 'string' ? rawInput.trim() : '';

    if (!trimmedInput) {
      return Response.json(
        { error: "Product description is required" },
        { status: 400 }
      );
    }

    console.log("[API] Received pipeline request with input length:", rawInput?.length ?? 0);
    
    const result = await executePipeline(trimmedInput);
    
    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("[API] Error:", error.message);
    return Response.json(
      { error: "Pipeline execution failed: " + error.message },
      { status: 500 }
    );
  }
}
