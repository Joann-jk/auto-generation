import { runResearch } from "./agents/researchAgent.js";
import { runCopywriter } from "./agents/copywriterAgent.js";
import { runEditor } from "./agents/editorAgent.js";

/*
  Sequential pipeline:
  1. runResearch(input)
  2. runCopywriter(research)
  3. runEditor(research, copywriter)
  Returns structured JSON and an activity feed.
*/

function parseDeliverables(text) {
  const blogMatch = text.match(/BLOG_POST:\s*([\s\S]*?)SOCIAL_THREAD:/i);
  const socialMatch = text.match(/SOCIAL_THREAD:\s*([\s\S]*?)EMAIL_TEASER:/i);
  const emailMatch = text.match(/EMAIL_TEASER:\s*([\s\S]*)/i);

  return {
    blogPost: (blogMatch?.[1]?.trim()) || "",
    socialThread: (socialMatch?.[1]?.trim()) || "",
    emailTeaser: (emailMatch?.[1]?.trim()) || "",
  };
}

export async function executePipeline(input) {
  const safeInput = (typeof input === "string" ? input : (input ?? "").toString()).trim();
  const activityFeed = [];

  // stable unique id generator with fallback
  const genId = () =>
    (globalThis?.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

  const push = (msg) =>
    activityFeed.push({ id: genId(), message: msg ?? "", ts: new Date().toISOString() });

  try {
    push("Pipeline started");

    push("Research Agent: extracting facts");
    const researchResult = await runResearch(safeInput);
    push("Research Agent: completed");

    push("Copywriter Agent: creating initial drafts");
    const copyResult = await runCopywriter(safeInput, researchResult);
    push("Copywriter Agent: completed");

    push("Editor Agent: reviewing drafts and fact-checking");
    const editorResult = await runEditor(safeInput, researchResult, copyResult);
    push("Editor Agent: completed review");

    // Prefer editor's rawOutput for final deliverables; fallback to copywriter raw
    const editorOutput = (editorResult?.rawOutput ?? copyResult?.rawOutput ?? "");

    const finalDeliverables = parseDeliverables(editorOutput);

    return {
      success: true,
      research: { ...researchResult, status: researchResult?.status ?? "complete" },
      copywriter: { ...copyResult, status: copyResult?.status ?? "complete" },
      editor: {
        ...editorResult,
        status: editorResult?.status ?? "complete",
        rawOutput: editorOutput,
      },
      activityFeed,
      finalDeliverables,
      timestamp: Date.now(),
    };
  } catch (err) {
    push(`Pipeline error: ${err?.message ?? "unknown"}`);
    return {
      success: false,
      error: err?.message ?? "Pipeline failed",
      activityFeed,
      timestamp: Date.now(),
    };
  }
}
