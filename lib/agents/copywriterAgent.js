import { generateText } from "../groq.js";

/* Creative Copywriter Agent
   - Mandates labeled sections:
     BLOG_POST:
     SOCIAL_THREAD:
     EMAIL_TEASER:
   - Parses the labeled output into structured fields (safe fallbacks)
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

export async function runCopywriter(source, research) {
  const safeSource = (typeof source === "string" ? source : (source ?? "").toString()).trim();
  const researchSummary = (research?.research ?? "").toString();

  const prompt = `
You are a Creative Copywriter for a premium brand. Using the source material and the research summary, produce three deliverables EXACTLY and ONLY in this format (no JSON, no headings, no extra commentary):

BLOG_POST:
<full blog post here>

SOCIAL_THREAD:
<short multi-post thread; separate posts with blank lines>

EMAIL_TEASER:
<short email teaser here>

Use the research to ensure accuracy and brand-aligned persuasive tone.
Source:
${safeSource}

Research Summary:
${researchSummary}
`.trim();

  const raw = (await generateText(prompt)) || "";
  const parsed = parseDeliverables(raw);

  // Normalize social into array of posts (split on double newlines or single newlines)
  const socialArray = parsed.socialThread
    ? parsed.socialThread.split(/\n{2,}|\r\n{2,}|\r\n|\n/).map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    rawOutput: raw,
    blog: parsed.blogPost,
    social: socialArray,
    email: parsed.emailTeaser,
    status: "complete",
  };
}
