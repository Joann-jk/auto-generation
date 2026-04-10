import { runResearch } from "./agents/researchAgent.js";
import {  runCopywriter } from "./agents/copywriterAgent.js";
import { runEditor} from "./agents/editorAgent.js";
function parseDeliverables(copywriter) {
  return {
    blogPost: copywriter?.blog ?? "",
    socialThread: Array.isArray(copywriter?.social)
      ? copywriter.social.join("\n")
      : copywriter?.social ?? "",
    emailTeaser: copywriter?.email ?? "",
  };
}
export async function executePipeline(input) {
  const feed = [];

  const log = (msg) =>
    feed.push({
      id: crypto.randomUUID(),
      message: msg,
      ts: new Date().toISOString(),
    });

  log("Pipeline started");

  // Step 1: Research
  const research = await runResearch(input);
  log("Research complete");
  console.log("RESEARCH OUTPUT:");
  console.log("RESEARCH OUTPUT:", research);

  // Step 2: Copywriter
  const copywriter = await runCopywriter(input, research);
  log("Copywriter complete");

  // Step 3: Editor
  const editor = await runEditor(input, research, copywriter);
  log("Editor complete");

  log("Pipeline finished");

  const finalDeliverables = parseDeliverables(copywriter);

return {
  success: true,
  research,
  copywriter,
  editor,
  finalDeliverables,
  activityFeed: feed,
};
}
