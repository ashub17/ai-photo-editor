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
    if (!canGenerate) {
      return;
    }

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
    if (!canEdit) {
      return;
    }

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
    <div className="min-h-screen text-slate-100">
      <Header />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
        <div className="space-y-6">
          <section className="rounded-lg border border-white/10 bg-slate-900/70 p-5">
            <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-slate-950/70 p-1">
              {(["generate", "edit"] as Mode[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    activeTab === tab
                      ? "bg-teal-300 text-slate-950"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {tab === "generate" ? "Generate Image" : "Edit Image"}
                </button>
              ))}
            </div>

            {activeTab === "generate" ? (
              <form className="mt-5 space-y-5" onSubmit={handleGenerate}>
                <PromptBox
                  id="generate-prompt"
                  label="Prompt"
                  value={generatePrompt}
                  disabled={loading}
                  placeholder="A cinematic product photo of a translucent smart speaker on a marble counter..."
                  onChange={setGeneratePrompt}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-200">
                      Aspect ratio
                    </span>
                    <select
                      value={aspectRatio}
                      disabled={loading}
                      onChange={(event) =>
                        setAspectRatio(event.target.value as AspectRatio)
                      }
                      className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-3 text-sm text-white outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {aspectRatios.map((ratio) => (
                        <option key={ratio} value={ratio}>
                          {ratio}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3">
                    <span className="text-sm font-medium text-slate-200">
                      Enhance prompt automatically
                    </span>
                    <input
                      type="checkbox"
                      checked={enhanceGenerate}
                      disabled={loading}
                      onChange={(event) => setEnhanceGenerate(event.target.checked)}
                      className="h-5 w-5 accent-teal-300 disabled:cursor-not-allowed"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!canGenerate}
                  className="w-full rounded-lg bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {loading ? "Generating..." : "Generate image"}
                </button>
              </form>
            ) : (
              <form className="mt-5 space-y-5" onSubmit={handleEdit}>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3">
                    <span className="flex items-center justify-between gap-4 text-sm font-medium text-slate-200">
                      <span>Strength</span>
                      <span className="text-teal-200">{strength.toFixed(1)}</span>
                    </span>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={strength}
                      disabled={loading}
                      onChange={(event) => setStrength(Number(event.target.value))}
                      className="mt-3 w-full accent-teal-300 disabled:cursor-not-allowed"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3">
                    <span className="text-sm font-medium text-slate-200">
                      Enhance edit instruction automatically
                    </span>
                    <input
                      type="checkbox"
                      checked={enhanceEdit}
                      disabled={loading}
                      onChange={(event) => setEnhanceEdit(event.target.checked)}
                      className="h-5 w-5 accent-teal-300 disabled:cursor-not-allowed"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!canEdit}
                  className="w-full rounded-lg bg-teal-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {loading ? "Editing..." : "Edit image"}
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
