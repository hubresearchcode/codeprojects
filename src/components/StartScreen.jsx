export default function StartScreen({ scenario, onStart }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-xl w-full">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-700 uppercase tracking-wide mb-1">
            Patient Simulator
          </p>
          <h1 className="text-2xl font-bold text-slate-900">{scenario.scenario_title}</h1>
        </header>

        {/* Safety disclaimer */}
        <div
          role="note"
          className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-900"
        >
          <strong>Practice tool only.</strong> The patient is not real. Do not use this tool for
          advice about real patients or your own health.
        </div>

        {/* Scenario brief */}
        <section aria-labelledby="briefing-heading" className="mb-6">
          <h2 id="briefing-heading" className="text-lg font-semibold mb-2">
            Your task
          </h2>
          <p className="text-slate-700 text-base leading-relaxed">{scenario.learner_brief}</p>
        </section>

        {/* What to expect */}
        <section aria-labelledby="expect-heading" className="mb-8">
          <h2 id="expect-heading" className="text-lg font-semibold mb-2">
            How it works
          </h2>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 text-base">
            <li>The patient will speak first.</li>
            <li>When the microphone light turns on, speak your response.</li>
            <li>
              If you prefer to type, use the text box instead of speaking.
            </li>
            <li>
              When you are ready to finish, press{' '}
              <strong>End session</strong>.
            </li>
            <li>You will receive written feedback and a transcript to download.</li>
          </ol>
        </section>

        {/* Data notice */}
        <p className="text-xs text-slate-500 mb-6">
          No audio is stored. The conversation transcript is kept only for this session and is
          deleted when you close or reload the page. No personal information is collected.
        </p>

        <button
          onClick={onStart}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-4 px-6 rounded-lg text-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Start session
        </button>

        <p className="text-center text-sm text-slate-500 mt-4">
          Session time limit: {scenario.time_limit_minutes} minutes
        </p>
      </div>
    </main>
  );
}
