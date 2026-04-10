'use client';

import { useState, useEffect } from "react";
import {
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  Edit3,
  FileText,
  RefreshCw,
  Download,
  Monitor,
  Smartphone,
} from "lucide-react";



export default function Home() {
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState(null); // structured pipeline result
  const [error, setError] = useState("");
  const [agentStatuses, setAgentStatuses] = useState({
    research: "idle",
    copywriter: "idle",
    editor: "idle",
  });
  const [activityFeed, setActivityFeed] = useState([]);
  const [finalTab, setFinalTab] = useState("Blog Post");
  const [previewMode, setPreviewMode] = useState("desktop"); // desktop | mobile

  // stable unique id generator (browser-safe)
  const genId = () =>
    (globalThis?.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    // keep local activity feed in sync with campaign result if present
    if (campaign?.activityFeed) {
      setActivityFeed(campaign.activityFeed || []);
      setAgentStatuses({
        research: campaign.research?.status ?? "idle",
        copywriter: campaign.copywriter?.status ?? "idle",
        editor: campaign.editor?.status ?? "idle",
      });
    }
  }, [campaign]);

  const pushActivity = (message) => {
    setActivityFeed((prev) => [
      { id: genId(), message: message ?? "", ts: new Date().toISOString() },
      ...prev,
    ]);
  };

  const handleLaunchCampaign = async () => {
    if (!(sourceMaterial ?? "").trim()) {
      setError("Please provide source material or paste technical docs/transcripts.");
      return;
    }

    setLoading(true);
    setError("");
    setCampaign(null);
    setAgentStatuses({ research: "thinking", copywriter: "idle", editor: "idle" });
    setActivityFeed([
      { id: genId(), message: "Campaign intake submitted", ts: new Date().toISOString() },
    ]);

    try {
      pushActivity("Submitting material to Research Agent");

      const resp = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: (sourceMaterial ?? "").trim() }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.error || "Pipeline failed");
      }

      const data = await resp.json();

      // Null-safety: ensure structured fields exist
      const structured = {
        research: data?.research ?? { text: "" },
        copywriter: data?.copywriter ?? { text: "" },
        editor: data?.editor ?? { text: "" },
        activityFeed: data?.activityFeed ?? [],
        finalDeliverables: data?.finalDeliverables ?? {},
        timestamp: data?.timestamp ?? Date.now(),
        success: data?.success ?? true,
      };

      setCampaign(structured);
      setAgentStatuses({
        research: structured.research?.status ?? "complete",
        copywriter: structured.copywriter?.status ?? "complete",
        editor: structured.editor?.status ?? "complete",
      });
      setActivityFeed((prev) => [...structured.activityFeed, ...prev]);
      pushActivity("Campaign pipeline completed");
    } catch (err) {
      setError(err?.message ?? "Unexpected error");
      pushActivity(`Pipeline error: ${err?.message ?? "unknown"}`);
      setAgentStatuses({ research: "error", copywriter: "idle", editor: "idle" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSourceMaterial("");
    setCampaign(null);
    setError("");
    setAgentStatuses({ research: "idle", copywriter: "idle", editor: "idle" });
    setActivityFeed([]);
  };

  const handleDownloadCampaign = () => {
    const payload = JSON.stringify(campaign ?? { timestamp: Date.now() }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    pushActivity("Campaign kit downloaded");
  };

  const handleRegenerate = async () => {
    // Re-run pipeline with same source material
    await handleLaunchCampaign();
    pushActivity("Regenerate requested from UI");
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* HERO */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--brand-cream)]">
              Autonomous Content Factory
            </h1>
            <p className="mt-3 text-sm md:text-base text-slate-400 max-w-2xl">
              Enterprise collaborative workflow to craft brand-aligned marketing campaigns.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-xs text-slate-400">Workspace</div>
            <div className="card-glass px-3 py-2 flex items-center gap-3">
              <span className="text-xs text-slate-300">Campaign Studio</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campaign Start / Intake */}
        <aside className="lg:col-span-1 card-glass p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-[var(--brand-gold)]" />
              <h2 className="text-lg font-semibold">Campaign Start Page</h2>
            </div>
            <div className="text-xs text-slate-400">Step 1</div>
          </div>

          <label className="block text-slate-300 text-sm mb-2">Upload or paste source material</label>

          {/* Simple file input (drag/drop can be added later) */}
          <div className="mb-3">
            <input
              id="file-upload"
              type="file"
              accept=".txt,.md,.pdf"
              className="hidden"
              onChange={async (e) => {
                const file = e.target?.files?.[0];
                if (file) {
                  try {
                    const text = await file.text();
                    setSourceMaterial((prev) => (prev ? `${prev}\n\n${text}` : text));
                    pushActivity(`Uploaded file: ${file.name}`);
                  } catch {
                    pushActivity(`Failed to read file: ${file?.name ?? "unknown"}`);
                  }
                }
              }}
            />
            <label
              htmlFor="file-upload"
              className="w-full cursor-pointer card-glass p-4 rounded-xl flex items-center justify-between border border-[rgba(200,155,60,0.06)]"
            >
              <div className="text-sm text-slate-300">Drag & drop or click to upload</div>
              <div className="text-xs text-slate-400">Supported: .txt, .md, .pdf</div>
            </label>
          </div>

          <textarea
            value={sourceMaterial ?? ""}
            onChange={(e) => setSourceMaterial(e.target?.value ?? "")}
            placeholder="Paste transcripts, technical docs, brand guidelines, or source links..."
            className="w-full min-h-[180px] p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(200,155,60,0.06)] text-brand-cream placeholder:text-slate-500 input-focus-gold"
            disabled={loading}
          />

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleLaunchCampaign}
              disabled={loading || !(sourceMaterial ?? "").trim()}
              className="btn-gold px-5 py-3 rounded-2xl shadow-lg transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  Launching...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Launch Campaign
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-2xl border border-[rgba(255,255,255,0.04)] text-sm text-slate-300 hover:bg-[rgba(255,255,255,0.02)] transition"
            >
              Reset
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.03)]">
            <h3 className="text-sm text-slate-300 mb-3">Agent Room</h3>

            <div className="space-y-3">
              {/* Research Agent */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.02)]">
                    <Search className="w-5 h-5 text-[var(--brand-gold-soft)]" />
                  </div>
                  <div>
                    <div className="text-sm">Lead Research Agent</div>
                    <div className="text-xs text-slate-400">Fact-check & source extraction</div>
                  </div>
                </div>
                <div>
                  <AgentStatusBadge status={agentStatuses.research} />
                </div>
              </div>

              {/* Copywriter Agent */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.02)]">
                    <Edit3 className="w-5 h-5 text-[var(--brand-gold-soft)]" />
                  </div>
                  <div>
                    <div className="text-sm">Creative Copywriter</div>
                    <div className="text-xs text-slate-400">Drafts blog, social, email</div>
                  </div>
                </div>
                <div>
                  <AgentStatusBadge status={agentStatuses.copywriter} />
                </div>
              </div>

              {/* Editor Agent */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.02)]">
                    <FileText className="w-5 h-5 text-[var(--brand-gold-soft)]" />
                  </div>
                  <div>
                    <div className="text-sm">Editor-in-Chief</div>
                    <div className="text-xs text-slate-400">Quality, accuracy, tone</div>
                  </div>
                </div>
                <div>
                  <AgentStatusBadge status={agentStatuses.editor} />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Workspace / Outputs */}
        <section className="lg:col-span-2 space-y-6">
          {/* Activity & Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Feed */}
            <div className="card-glass p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[var(--brand-gold-soft)]" />
                  <h3 className="font-semibold">Workflow Activity</h3>
                </div>
                <div className="text-xs text-slate-400">{activityFeed.length} events</div>
              </div>

              <div className="max-h-56 overflow-auto space-y-3">
                {activityFeed.length === 0 && <div className="text-sm text-slate-500">No activity yet</div>}
                {activityFeed.map((ev, index) => (
                  <div key={`${ev.id}-${index}`} className="text-sm text-slate-300">
                    <div className="text-xs text-slate-500">{new Date(ev.ts).toLocaleTimeString()}</div>
                    <div>{ev.message}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side-by-Side Review */}
            <div className="card-glass p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Side-by-Side Review</h3>
                <div className="text-xs text-slate-400">Source vs Approved</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[rgba(255,255,255,0.01)] p-4 rounded-xl min-h-[160px]">
                  <div className="text-xs text-slate-400 mb-2">Original Source</div>
                  <div className="text-sm text-slate-200 whitespace-pre-wrap max-h-40 overflow-auto">{(sourceMaterial ?? "").toString()}</div>
                </div>

                <div className="bg-[rgba(255,255,255,0.01)] p-4 rounded-xl min-h-[160px]">
                  <div className="text-xs text-slate-400 mb-2">Approved Output</div>
                  <div className="text-sm text-slate-200 whitespace-pre-wrap max-h-40 overflow-auto">
                    {/* Show only blogPost in small preview */}
                    {(campaign?.finalDeliverables?.blogPost ?? "").toString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Review Tabs + Preview + Export */}
          <div className="card-glass p-6 rounded-3xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold">Final Review View</h3>
                <div className="text-xs text-slate-400">Deliverables</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-300">Preview</div>
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`px-3 py-1 rounded-lg text-sm ${previewMode === "desktop" ? "bg-[rgba(224,184,90,0.12)]" : "bg-transparent"}`}
                >
                  <Monitor className="w-4 h-4 inline-block mr-2" /> Desktop
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`px-3 py-1 rounded-lg text-sm ${previewMode === "mobile" ? "bg-[rgba(224,184,90,0.12)]" : "bg-transparent"}`}
                >
                  <Smartphone className="w-4 h-4 inline-block mr-2" /> Mobile
                </button>

                <button
                  onClick={handleDownloadCampaign}
                  disabled={!campaign}
                  className="px-3 py-2 rounded-lg border border-[rgba(255,255,255,0.04)] text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Campaign Kit
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              {["Blog Post", "Social Thread", "Email Teaser"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFinalTab(tab)}
                  className={`px-4 py-2 rounded-2xl ${finalTab === tab ? "bg-[rgba(224,184,90,0.12)]" : "bg-transparent"} text-sm`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="min-h-[220px]">
              {/* Render selected deliverable with preview chrome */}
              <DeliverablePreview
                mode={previewMode}
                title={finalTab}
                content={
                  finalTab === "Blog Post"
                    ? ((campaign?.finalDeliverables?.blogPost ?? "") || "No content generated")
                    : finalTab === "Social Thread"
                    ? ((campaign?.finalDeliverables?.socialThread ?? "") || "No content generated")
                    : ((campaign?.finalDeliverables?.emailTeaser ?? "") || "No content generated")
                }
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => {
                  // Approve action (local for now)
                  pushActivity("Final deliverable approved");
                  setAgentStatuses({ research: "complete", copywriter: "complete", editor: "approved" });
                }}
                disabled={!campaign}
                className="btn-gold px-5 py-2 rounded-2xl"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
              </button>

              <button
                onClick={handleRegenerate}
                disabled={!campaign}
                className="px-4 py-2 rounded-2xl border border-[rgba(255,255,255,0.04)]"
              >
                <RefreshCw className="w-4 h-4 mr-2 inline-block" /> Regenerate
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-6 right-6 card-glass p-4 rounded-xl border-l-4 border-red-600">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="text-sm text-slate-200">{error}</div>
          </div>
        </div>
      )}
    </main>
  );
}

/* small presentational components */

function AgentStatusBadge({ status }) {
  const st = status ?? "idle";
  const classes =
    st === "thinking"
      ? "agent-badge bg-yellow-900/20 text-yellow-300"
      : st === "reviewing"
      ? "agent-badge bg-blue-900/10 text-blue-300"
      : st === "approved"
      ? "agent-badge bg-green-900/10 text-green-300"
      : st === "revising"
      ? "agent-badge bg-orange-900/10 text-orange-300"
      : st === "complete"
      ? "agent-badge bg-green-900/10 text-green-300"
      : st === "error"
      ? "agent-badge bg-red-900/10 text-red-300"
      : "agent-badge bg-[rgba(255,255,255,0.02)] text-slate-400";

  return <div className={classes}>{st}</div>;
}

function DeliverablePreview({ mode = "desktop", title = "", content = "" }) {
  const safeContent = (content ?? "").toString();
  const frameClass =
    mode === "mobile"
      ? "w-80 h-[600px] border border-[rgba(255,255,255,0.04)] rounded-2xl p-4 bg-[rgba(255,255,255,0.01)]"
      : "w-full border border-[rgba(255,255,255,0.04)] rounded-2xl p-6 bg-[rgba(255,255,255,0.01)]";

  return (
    <div className={frameClass}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-slate-400">{title}</div>
          <div className="font-semibold text-slate-200">{title}</div>
        </div>
        <div className="text-xs text-slate-500">Preview ({mode})</div>
      </div>

      <div className="text-sm text-slate-200 whitespace-pre-wrap overflow-auto max-h-[420px]">
        {safeContent || <span className="text-slate-500">No content available</span>}
      </div>
    </div>
  );
}
