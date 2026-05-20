export default function Header() {
  return (
    <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-teal-300">
            OpenRouter
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            OpenRouter Image Studio
          </h1>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
          Generate new visuals, edit uploaded images, and optionally normalize
          prompts through OpenRouter Auto Router before sending them to your
          configured image model.
        </p>
      </div>
    </header>
  );
}
