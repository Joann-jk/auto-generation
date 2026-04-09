import { generateText } from "../groq.js";

/* Editor-in-Chief Agent
   - Must return ONLY the labeled sections:
     BLOG_POST:
     SOCIAL_THREAD:
     EMAIL_TEASER:
   - No JSON, no commentary.
   - Pipeline will parse final deliverables from this output.
*/

export async function runEditor(source, research, copy) {
  const researchSummary = (research?.research ?? "").toString();
  const blogDraft = (copy?.blog ?? "").toString();
  const socialDraft = Array.isArray(copy?.social) ? copy.social.join("\n\n") : (copy?.social ?? "").toString();
  const emailDraft = (copy?.email ?? "").toString();

  const prompt = `
You are Editor-in-Chief. Fact-check the drafts against the research summary, detect hallucinations, and polish tone.
Return ONLY these three labeled sections EXACTLY as shown (no JSON, no extra commentary):

BLOG_POST:
<final polished blog post>

SOCIAL_THREAD:
<final social thread posts; separate posts with a blank line>

EMAIL_TEASER:
<final short email teaser>

Research:
${researchSummary}

Draft Blog:
${blogDraft}

Draft Social:
${socialDraft}

Draft Email:
${emailDraft}
`.trim();

  const raw = (await generateText(prompt)) || "";

  // We return the raw labeled output so pipeline can parse it and decide approvals.
  return {
    rawOutput: raw,
    notes: "",
    approved: true, // default; pipeline may implement additional checks
    status: "complete",
  };
}
