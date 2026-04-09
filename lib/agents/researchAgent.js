import { generateText } from "../groq.js";

/*
  Lead Research & Fact-Check Agent
  - returns structured object:
    { research: string, facts: string[], ambiguities: string[], sources: string[], status: string }
  - generateText is null-safe; we still guard parsing.
*/

export async function runResearch(source) {
  const safeSource = (typeof source === "string" ? source : (source ?? "").toString()).trim();
  const prompt = `
You are a Lead Research & Fact-Check Agent. Given the following source material, extract verified facts only, identify ambiguous statements, and list sources or places to verify.
Return a JSON object with keys:
{
  "research": "<summary text>",
  "facts": ["fact 1", "fact 2"],
  "ambiguities": ["ambig 1", "..."],
  "sources": ["source 1", "..."]
}
Source:
${safeSource}
  `.trim();

  const output = (await generateText(prompt)) || "";
  // Try to parse JSON from the agent
  try {
    const parsed = JSON.parse(output);
    return {
      research: (parsed.research ?? "") + "",
      facts: Array.isArray(parsed.facts) ? parsed.facts : [],
      ambiguities: Array.isArray(parsed.ambiguities) ? parsed.ambiguities : [],
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
      status: "complete",
    };
  } catch {
    // Fallback: return raw text in research, empty arrays for structured lists
    return {
      research: output ?? "",
      facts: [],
      ambiguities: [],
      sources: [],
      status: "complete",
    };
  }
}
