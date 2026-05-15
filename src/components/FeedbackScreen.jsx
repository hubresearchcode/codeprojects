import { useCallback } from 'react';

export default function FeedbackScreen({ scenario, transcript, feedback, onRestart }) {
  const patientName = scenario.patient_persona.name;

  const downloadContent = useCallback(() => {
    const lines = [];
    lines.push(`Session: ${scenario.scenario_title}`);
    lines.push(`Date: ${new Date().toLocaleDateString('en-AU', { dateStyle: 'long' })}`);
    lines.push('');
    lines.push('--- TRANSCRIPT ---');
    lines.push('');
    for (const entry of transcript) {
      const speaker = entry.role === 'learner' ? 'You' : patientName;
      lines.push(`${speaker}: ${entry.text}`);
      lines.push('');
    }
    lines.push('--- FEEDBACK ---');
    lines.push('');
    lines.push(feedback);
    lines.push('');
    lines.push('--- END ---');

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-simulator-session-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [scenario, transcript, feedback, patientName]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <p className="text-sm font-medium text-blue-700 uppercase tracking-wide mb-1">
            Session complete
          </p>
          <h1 className="text-2xl font-bold text-slate-900">{scenario.scenario_title}</h1>
        </header>

        {/* Feedback */}
        <section aria-labelledby="feedback-heading" className="mb-8">
          <h2 id="feedback-heading" className="text-xl font-semibold mb-4">
            Your feedback
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            {feedback ? (
              <div className="prose prose-slate max-w-none text-base leading-relaxed whitespace-pre-wrap">
                {feedback}
              </div>
            ) : (
              <p className="text-slate-400">No feedback available.</p>
            )}
          </div>
        </section>

        {/* Transcript */}
        <section aria-labelledby="transcript-heading" className="mb-8">
          <h2 id="transcript-heading" className="text-xl font-semibold mb-4">
            Conversation transcript
          </h2>
          {transcript.length === 0 ? (
            <p className="text-slate-400">No conversation recorded.</p>
          ) : (
            <div className="space-y-3">
              {transcript.map((entry, i) => (
                <div key={i} className="flex gap-3 text-base">
                  <span
                    className={`font-semibold flex-shrink-0 w-28 text-right ${
                      entry.role === 'learner' ? 'text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    {entry.role === 'learner' ? 'You' : patientName}:
                  </span>
                  <span className="text-slate-800">{entry.text}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={downloadContent}
            className="flex-1 bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 px-5 rounded-lg text-base transition-colors"
          >
            Download transcript and feedback
          </button>
          <button
            onClick={onRestart}
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-medium py-3 px-5 rounded-lg text-base transition-colors"
          >
            Start a new session
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-6 text-center">
          This tool is for practice only. The patient is not real. Do not use it for advice about
          real patients or your own health.
        </p>
      </div>
    </main>
  );
}
