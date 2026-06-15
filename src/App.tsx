import { FormEvent, useMemo, useState } from "react";
import Header from "./components/Header";
import HistoryPanel from "./components/HistoryPanel";
import ImageUploader from "./components/ImageUploader";
import PromptBox from "./components/PromptBox";
import ResultPanel from "./components/ResultPanel";
import { editImage, generateImage } from "./lib/api";
import type { AspectRatio, HistoryItem, ImageResult, Mode } from "./types";

const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

export default function App() {
  const [activeTab, setActiveTab] = useState<Mode>("generate");
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [enhanceGenerate, setEnhanceGenerate] = useState(true);
  const [editPrompt, setEditPrompt] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [strength, setStrength] = useState(0.65);
  const [enhanceEdit, setEnhanceEdit] = useState(true);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canGenerate = useMemo(
    () => generatePrompt.trim().length > 0 && !loading,
    [generatePrompt, loading]
  );

  const canEdit = useMemo(
    () => editPrompt.trim().length > 0 && imageDataUrl.length > 0 && !loading,
    [editPrompt, imageDataUrl, loading]
  );

  function addHistory(type: Mode, imageResult: ImageResult) {
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      type,
      imageUrl: imageResult.imageUrl,
      prompt: imageResult.finalPrompt,
      timestamp: new Date().toISOString()
    };
    setHistory((items) => [item, ...items].slice(0, 8));
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canGenerate) return;
    setLoading(true);
    setError("");
    try {
      const imageResult = await generateImage({
        prompt: generatePrompt.trim(),
        aspectRatio,
        enhance: enhanceGenerate
      });
      setResult(imageResult);
      addHistory("generate", imageResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEdit) return;
    setLoading(true);
    setError("");
    try {
      const imageResult = await editImage({
        prompt: editPrompt.trim(),
        imageDataUrl,
        strength,
        enhance: enhanceEdit
      });
      setResult(imageResult);
      addHistory("edit", imageResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image editing failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-app-text">
      <Header />
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
        <div className="space-y-5">
          <section className="rounded-xl border border-app-border bg-app-surface shadow-card">
            {/* Tab switcher */}
            <div className="border-b border-app-border p-4 pb-0">
              <div className="grid grid-cols-2 rounded-lg bg-app-input p-1">
                {(["generate", "edit"] as Mode[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition-all duration-150 ${
                      activeTab === tab
                        ? "bg-app-accent text-app-bg shadow-accent-sm"
                        : "text-app-secondary hover:text-app-text"
                    }`}
                  >
                    {tab === "generate" ? "Generate" : "Edit"}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "generate" ? (
              <form className="space-y-4 p-4" onSubmit={handleGenerate}>
                <PromptBox
                  id="generate-prompt"
                  label="Prompt"
                  value={generatePrompt}
                  disabled={loading}
                  placeholder="A cinematic product photo of a translucent smart speaker on a marble counter..."
                  onChange={setGeneratePrompt}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-app-secondary">
                      Aspect ratio
                    </span>
                    <select
                      value={aspectRatio}
                      disabled={loading}
                      onChange={(event) =>
                        setAspectRatio(event.target.value as AspectRatio)
                      }
                      className="w-full rounded-lg border border-app-border bg-app-input px-3 py-2.5 text-sm text-app-text outline-none transition-colors duration-150 focus:border-app-accent focus:ring-2 focus:ring-app-accent/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {aspectRatios.map((ratio) => (
                        <option key={ratio} value={ratio}>
                          {ratio}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-app-border bg-app-input px-4 py-2.5 transition-colors duration-150 hover:border-app-line">
                    <span className="text-sm text-app-secondary">
                      Enhance prompt
                    </span>
                    <input
                      type="checkbox"
                      checked={enhanceGenerate}
                      disabled={loading}
                      onChange={(event) => setEnhanceGenerate(event.target.checked)}
                      className="h-4 w-4 accent-app-accent disabled:cursor-not-allowed"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!canGenerate}
                  className="w-full rounded-lg bg-app-accent px-4 py-2.5 text-sm font-semibold text-app-bg shadow-accent-sm transition-all duration-150 hover:bg-app-accent-lt active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-app-elevated disabled:text-app-muted disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-app-bg/30 border-t-app-bg" />
                      Generating…
                    </span>
                  ) : (
                    "Generate image"
                  )}
                </button>
              </form>
            ) : (
              <form className="space-y-4 p-4" onSubmit={handleEdit}>
                <ImageUploader
                  imageDataUrl={imageDataUrl}
                  onImageChange={setImageDataUrl}
                  disabled={loading}
                />

                <PromptBox
                  id="edit-prompt"
                  label="Edit instruction"
                  value={editPrompt}
                  disabled={loading}
                  placeholder="Replace the background with a warm sunset studio set while keeping the subject unchanged..."
                  onChange={setEditPrompt}
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block rounded-lg border border-app-border bg-app-input px-4 py-2.5">
                    <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-app-secondary">
                      <span>Strength</span>
                      <span className="rounded bg-app-accent/15 px-1.5 py-0.5 font-mono text-app-accent">
                        {strength.toFixed(1)}
                      </span>
                    </span>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={strength}
                      disabled={loading}
                      onChange={(event) => setStrength(Number(event.target.value))}
                      className="mt-3 w-full accent-app-accent disabled:cursor-not-allowed"
                    />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-app-border bg-app-input px-4 py-2.5 transition-colors duration-150 hover:border-app-line">
                    <span className="text-sm text-app-secondary">
                      Enhance instruction
                    </span>
                    <input
                      type="checkbox"
                      checked={enhanceEdit}
                      disabled={loading}
                      onChange={(event) => setEnhanceEdit(event.target.checked)}
                      className="h-4 w-4 accent-app-accent disabled:cursor-not-allowed"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!canEdit}
                  className="w-full rounded-lg bg-app-accent px-4 py-2.5 text-sm font-semibold text-app-bg shadow-accent-sm transition-all duration-150 hover:bg-app-accent-lt active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-app-elevated disabled:text-app-muted disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-app-bg/30 border-t-app-bg" />
                      Editing…
                    </span>
                  ) : (
                    "Edit image"
                  )}
                </button>
              </form>
            )}
          </section>

          <ResultPanel result={result} loading={loading} error={error} />
        </div>

        <HistoryPanel
          items={history}
          onSelect={(item) =>
            setResult({ imageUrl: item.imageUrl, finalPrompt: item.prompt })
          }
        />
      </main>
    </div>
  );
}
