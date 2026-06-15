export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-app-border bg-app-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-accent/20 ring-1 ring-app-accent/40">
          <svg
            className="h-4 w-4 text-app-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>
        <h1 className="text-base font-semibold tracking-tight text-app-text">
          Image Studio
        </h1>
        <span className="ml-auto hidden text-xs text-app-muted sm:block">
          AI-powered generation &amp; editing
        </span>
      </div>
    </header>
  );
}
