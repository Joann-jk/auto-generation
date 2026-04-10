import { generateText } from "../groq.js";

/*
  Feature 1: Lead Research & Fact-Check Agent — "The Analytical Brain"
  -----------------------------------------------------------------------
  Responsibilities:
    1. EXTRACTION      — Identify core product features, technical specs, and
                         target audience from raw source text or a URL.
    2. FACT-SHEET      — Produce a structured "Source of Truth" JSON that ALL
                         downstream agents (Copywriter, Editor) must follow.
    3. CONSTRAINT      — Flag every ambiguous statement that could cause
                         hallucinations or confusion in later agents.

  Returns:
  {
    factSheet: {
      productName:      string,
      coreFeatures:     string[],
      technicalSpecs:   string[],
      targetAudience:   string,
      valueProposition: string,   // ← "hero" claim; all agents must centre on this
      pricing:          string,
      verifiedFacts:    string[]
    },
    ambiguities: string[],        // vague / unverifiable statements
    sources:     string[],        // references / places to verify
    rawMarkdown: string,          // Fact-Sheet as Markdown (human-readable backup)
    status:      string
  }
*/

const FACT_SHEET_PROMPT = (source) => `
You are the Lead Research & Fact-Check Agent — the "Analytical Brain" of a marketing content pipeline.

Your job is to read the raw source material and extract ONLY verified, concrete information. Invent nothing.

### TASKS
1. EXTRACTION: Identify every core product feature, technical specification, and the precise target audience.
2. FACT-SHEET CREATION: Produce a structured "Source of Truth" that downstream agents MUST follow.
3. AMBIGUITY FLAGGING: List every statement in the source that is vague, contradictory, or impossible to verify.

### OUTPUT FORMAT
Return ONLY a single valid JSON object — no markdown fences, no extra commentary:
{
  "factSheet": {
    "productName": "<name of the product or service>",
    "coreFeatures": ["feature 1", "feature 2"],
    "technicalSpecs": ["spec 1", "spec 2"],
    "targetAudience": "<precise description of the intended customer>",
    "valueProposition": "<the single most compelling reason to choose this product — the hero claim>",
    "pricing": "<exact pricing if stated, otherwise 'Not specified'>",
    "verifiedFacts": ["verified fact 1", "verified fact 2"]
  },
  "ambiguities": ["ambiguous statement 1", "ambiguous statement 2"],
  "sources": ["source or verification URL 1"],
  "rawMarkdown": "<the same Fact-Sheet rendered as clean Markdown for human review>"
}

### SOURCE MATERIAL
${source}
`.trim();

export async function runResearch(source) {
  const safeSource = (
    typeof source === "string" ? source : String(source ?? "")
  ).trim();

  if (!safeSource) {
    return {
      factSheet: {
        productName: "",
        coreFeatures: [],
        technicalSpecs: [],
        targetAudience: "",
        valueProposition: "",
        pricing: "Not specified",
        verifiedFacts: [],
      },
      ambiguities: ["No source material was provided."],
      sources: [],
      rawMarkdown: "",
      status: "error:empty_source",
    };
  }

  const output = (await generateText(FACT_SHEET_PROMPT(safeSource))) || "";

  try {
    const clean = output.replace(/```(?:json)?|```/gi, "").trim();
    const parsed = JSON.parse(clean);
    const fs = parsed.factSheet ?? {};

    return {
      factSheet: {
        productName:      String(fs.productName      ?? ""),
        coreFeatures:     Array.isArray(fs.coreFeatures)   ? fs.coreFeatures   : [],
        technicalSpecs:   Array.isArray(fs.technicalSpecs) ? fs.technicalSpecs : [],
        targetAudience:   String(fs.targetAudience   ?? ""),
        valueProposition: String(fs.valueProposition ?? ""),
        pricing:          String(fs.pricing          ?? "Not specified"),
        verifiedFacts:    Array.isArray(fs.verifiedFacts)  ? fs.verifiedFacts  : [],
      },
      ambiguities: Array.isArray(parsed.ambiguities) ? parsed.ambiguities : [],
      sources:     Array.isArray(parsed.sources)     ? parsed.sources     : [],
      rawMarkdown: String(parsed.rawMarkdown ?? output),
      status: "complete",
    };
  } catch {
    // Graceful fallback — pipeline never crashes
    return {
      factSheet: {
        productName: "",
        coreFeatures: [],
        technicalSpecs: [],
        targetAudience: "",
        valueProposition: "",
        pricing: "Not specified",
        verifiedFacts: [],
      },
      ambiguities: [],
      sources: [],
      rawMarkdown: output,
      status: "complete:parse_fallback",
    };
  }
}