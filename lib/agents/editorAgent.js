import { generateText } from "../groq.js";

/*
  Feature 3: Editor-in-Chief Agent — "The Gatekeeper"
  -----------------------------------------------------------------------
  This agent does NOT write. It only critiques and approves.

  Responsibilities:
    1. HALLUCINATION CHECK — Compare every claim in the drafts back to the
         Fact-Sheet. If the Copywriter invented a feature, price, or stat
         not in the Fact-Sheet → REJECT immediately with a Correction Note.
    2. TONE AUDIT — Ensure language is neither too "salesy" nor too "robotic."
    3. FEEDBACK LOOP — If any draft is rejected, produce a specific
         "Correction Note" that tells the Copywriter exactly what to fix
         (e.g., "The blog post is too long; shorten the intro and fix the
         price in paragraph 2").

  Returns:
  {
    approved:        boolean,
    correctionNotes: {          // populated only when approved === false
      blog?:   string,
      social?: string,
      email?:  string
    },
    toneIssues:      string[],  // tone problems found (even when approved)
    hallucinatedClaims: string[], // invented facts that were caught
    rawOutput:       string,
    status:          string
  }
*/

const EDITOR_PROMPT = (factSheet, copy) => `
You are the Editor-in-Chief — the "Gatekeeper" of a marketing content pipeline.
You do NOT rewrite content. You only audit, flag, and approve or reject.

### YOUR FACT-SHEET (the Source of Truth — treat this as ground truth)
- Product: ${factSheet.productName}
- Core Features: ${factSheet.coreFeatures.join("; ")}
- Technical Specs: ${factSheet.technicalSpecs.join("; ")}
- Target Audience: ${factSheet.targetAudience}
- Value Proposition: ${factSheet.valueProposition}
- Pricing: ${factSheet.pricing}
- Verified Facts: ${factSheet.verifiedFacts.join("; ")}

### YOUR AUDIT CHECKLIST
1. HALLUCINATION CHECK: Scan every claim in the drafts. If ANY feature, price, statistic, or promise does not appear in the Fact-Sheet above, mark it as a hallucinated claim and REJECT.
2. TONE AUDIT: Flag any language that sounds too "salesy" (hype, exaggeration) or too "robotic" (stiff, generic filler). List specific phrases.
3. VALUE PROPOSITION CHECK: Confirm the Value Proposition is the hero of each piece (clearly stated or strongly implied near the opening).
4. FEEDBACK LOOP: If rejecting, write a precise Correction Note for each failing piece — e.g., "Blog: Remove the claim about '10x faster' — not in Fact-Sheet. Tighten the intro to under 80 words."

### DRAFTS TO AUDIT

BLOG POST DRAFT:
${copy.blog}

SOCIAL THREAD DRAFT (5 posts):
${Array.isArray(copy.social) ? copy.social.map((p, i) => `Post ${i + 1}: ${p}`).join("\n") : copy.social}
EMAIL TEASER DRAFT:
${copy.email}

### OUTPUT FORMAT
Return ONLY a single valid JSON object — no markdown fences:
{
  "approved": true | false,
  "hallucinatedClaims": ["claim 1 that was invented", "..."],
  "toneIssues": ["specific phrase or issue 1", "..."],
  "correctionNotes": {
    "blog":   "<Correction Note for the blog, or null if no issues>",
    "social": "<Correction Note for the social thread, or null>",
    "email":  "<Correction Note for the email teaser, or null>"
  }
}

Rules:
- Set "approved" to false if there are ANY hallucinated claims.
- Set "approved" to false if tone issues are severe enough to harm the brand.
- Correction Notes must be specific and actionable (name the paragraph, phrase, or post number).
- If all drafts pass, set "approved" to true and leave correctionNotes values as null.
`.trim();

export async function runEditor(source, research, copy) {
  const factSheet = research?.factSheet ?? {
    productName: "",
    coreFeatures: [],
    technicalSpecs: [],
    targetAudience: "",
    valueProposition: "",
    pricing: "Not specified",
    verifiedFacts: [],
  };

  const safeCopy = {
    blog:   String(copy?.blog   ?? ""),
    social: Array.isArray(copy?.social) ? copy.social : [],
    email:  String(copy?.email  ?? ""),
  };

  const output = (await generateText(EDITOR_PROMPT(factSheet, safeCopy))) || "";

  try {
    const clean = output.replace(/```(?:json)?|```/gi, "").trim();
    const parsed = JSON.parse(clean);

    const approved           = parsed.approved === true;
    const hallucinatedClaims = Array.isArray(parsed.hallucinatedClaims) ? parsed.hallucinatedClaims : [];
    const toneIssues         = Array.isArray(parsed.toneIssues)         ? parsed.toneIssues         : [];
    const notes              = parsed.correctionNotes ?? {};

    return {
      approved,
      correctionNotes: {
        blog:   notes.blog   ?? null,
        social: notes.social ?? null,
        email:  notes.email  ?? null,
      },
      toneIssues,
      hallucinatedClaims,
      rawOutput: output,
      status: "complete",
    };
  } catch {
    // Parse failure → treat as a rejection to be safe
    return {
      approved: false,
      correctionNotes: {
        blog:   "Editor output could not be parsed. Rerun required.",
        social: null,
        email:  null,
      },
      toneIssues: [],
      hallucinatedClaims: [],
      rawOutput: output,
      status: "complete:parse_fallback",
    };
  }
}