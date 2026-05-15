import { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen.jsx';
import SessionScreen from './components/SessionScreen.jsx';
import FeedbackScreen from './components/FeedbackScreen.jsx';

export default function App() {
  const [screen, setScreen] = useState('start'); // 'start' | 'session' | 'feedback'
  const [scenario, setScenario] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetch('/api/scenarios')
      .then((r) => r.json())
      .then((list) => {
        if (!list.length) {
          setLoadError('No scenarios found. Add a JSON file to the scenarios folder.');
          return;
        }
        return fetch(`/api/scenarios/${list[0].file}`);
      })
      .then((r) => r && r.json())
      .then((data) => data && setScenario(data))
      .catch(() => setLoadError('Could not connect to the server. Make sure it is running.'));
  }, []);

  function handleSessionEnd(sessionTranscript, sessionFeedback) {
    setTranscript(sessionTranscript);
    setFeedback(sessionFeedback);
    setScreen('feedback');
  }

  function handleRestart() {
    setTranscript([]);
    setFeedback('');
    setScreen('start');
  }

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div role="alert" className="max-w-md text-center">
          <h1 className="text-xl font-bold mb-3">Could not load the simulator</h1>
          <p className="text-slate-600">{loadError}</p>
        </div>
      </main>
    );
  }

  if (!scenario) {
    return (
      <main className="min-h-screen flex items-center justify-center" aria-label="Loading">
        <p className="text-slate-500">Loading scenario...</p>
      </main>
    );
  }

  return (
    <>
      {screen === 'start' && (
        <StartScreen scenario={scenario} onStart={() => setScreen('session')} />
      )}
      {screen === 'session' && (
        <SessionScreen scenario={scenario} onEnd={handleSessionEnd} />
      )}
      {screen === 'feedback' && (
        <FeedbackScreen
          scenario={scenario}
          transcript={transcript}
          feedback={feedback}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
