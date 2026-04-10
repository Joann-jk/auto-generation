import { generateText } from "../groq.js";

/*
  Feature 2: Creative Copywriter Agent — "The Voice"
  -----------------------------------------------------------------------
  Responsibilities:
    1. MULTI-FORMAT GENERATION — Produce simultaneously:
         • A ~500-word Blog Post  (tone: Professional / Trustworthy)
         • A 5-post Social Media Thread  (tone: Engaging / Punchy)
         • A 1-paragraph Email Teaser  (tone: Warm / Action-oriented)
    2. TONE CONTROL — Strictly switch styles per format as described above.
    3. INSTRUCTION FOLLOWING — The Value Proposition from the Fact-Sheet
         MUST be the hero of every single piece of content.

  Accepts:
    source   — original raw material (string)
    research — output of runResearch() containing factSheet

  Returns:
  {
    blog:         string,     // ~500-word blog post
    social:       string[],   // array of exactly 5 posts
    email:        string,     // 1-paragraph teaser
    rawOutput:    string,
    status:       string
  }
*/

const COPY_PROMPT = (source, factSheet) => `
You are a Creative Copywriter for a premium brand — "The Voice" of the content pipeline.

You will produce three pieces of marketing content. Every piece MUST treat the following Value Proposition as its hero — the central, unmissable idea:

VALUE PROPOSITION (hero): "${factSheet.valueProposition}"

You must also stay faithful to this Fact-Sheet. Do NOT invent features, prices, or claims not listed here:
- Product: ${factSheet.productName}
- Core Features: ${factSheet.coreFeatures.join("; ")}
- Technical Specs: ${factSheet.technicalSpecs.join("; ")}
- Target Audience: ${factSheet.targetAudience}
- Pricing: ${factSheet.pricing}

### TONE RULES
- Blog Post   → Professional and Trustworthy. Authoritative but approachable.
- Social Thread → Engaging and Punchy. Short, bold, scroll-stopping sentences.
- Email Teaser  → Warm and Action-oriented. One clear call to action.

### OUTPUT FORMAT
Return ONLY these three labeled sections — no JSON, no extra commentary, no other headings:

BLOG_POST:
<A ~500-word blog post. Open by leading with the Value Proposition.>

SOCIAL_THREAD:
<Post 1 of 5>

<Post 2 of 5>

<Post 3 of 5>

<Post 4 of 5>

<Post 5 of 5>

EMAIL_TEASER:
<A single paragraph email teaser. End with a clear call to action.>

### ORIGINAL SOURCE (for context only)
${source}
`.trim();

function parseSections(raw) {
  const blogMatch   = raw.match(/BLOG_POST:\s*([\s\S]*?)(?=SOCIAL_THREAD:|$)/i);
  const socialMatch = raw.match(/SOCIAL_THREAD:\s*([\s\S]*?)(?=EMAIL_TEASER:|$)/i);
  const emailMatch  = raw.match(/EMAIL_TEASER:\s*([\s\S]*)/i);

  const blog  = blogMatch?.[1]?.trim()  ?? "";
  const email = emailMatch?.[1]?.trim() ?? "";

  // Split social on blank lines; keep exactly 5 posts (pad or trim)
  let socialPosts = (socialMatch?.[1]?.trim() ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Ensure we always have exactly 5 entries
  while (socialPosts.length < 5) socialPosts.push("");
  if (socialPosts.length > 5) socialPosts = socialPosts.slice(0, 5);

  return { blog, social: socialPosts, email };
}

export async function runCopywriter(source, research) {
  const safeSource = (
    typeof source === "string" ? source : String(source ?? "")
  ).trim();

  const factSheet = research?.factSheet ?? {
    productName: "",
    coreFeatures: [],
    technicalSpecs: [],
    targetAudience: "",
    valueProposition: "",
    pricing: "Not specified",
    verifiedFacts: [],
  };

  const raw = (await generateText(COPY_PROMPT(safeSource, factSheet))) || "";
  const { blog, social, email } = parseSections(raw);

  return {
    blog,
    social,   // string[5]
    email,
    rawOutput: raw,
    status: "complete",
  };
}