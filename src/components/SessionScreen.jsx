import { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis.js';
import { streamChat, getFeedback } from '../services/api.js';

const TURN = {
  PATIENT_SPEAKING: 'patient_speaking',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  ENDING: 'ending',
};

export default function SessionScreen({ scenario, onEnd }) {
  const [turnState, setTurnState] = useState(TURN.PATIENT_SPEAKING);
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(scenario.time_limit_minutes * 60);

  // Refs that stay current inside callbacks without stale closure issues
  const turnStateRef = useRef(TURN.PATIENT_SPEAKING);
  const messagesRef = useRef([]);
  const transcriptRef = useRef([]);
  const sessionStartedRef = useRef(false);

  useEffect(() => { turnStateRef.current = turnState; }, [turnState]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  const transcriptEndRef = useRef(null);
  const tts = useSpeechSynthesis();

  const addToTranscript = useCallback((role, text) => {
    setTranscript((prev) => {
      const next = [...prev, { role, text, timestamp: new Date().toISOString() }];
      transcriptRef.current = next;
      return next;
    });
  }, []);

  const startListening = useCallback(() => {
    setTurnState(TURN.LISTENING);
    turnStateRef.current = TURN.LISTENING;
  }, []);

  const stt = useSpeechRecognition({
    onResult: useCallback((text) => {
      if (turnStateRef.current === TURN.LISTENING) {
        handleLearnerTurn(text);
      }
    }, []),
  });

  // Auto-start STT when it's the learner's turn
  useEffect(() => {
    if (turnState === TURN.LISTENING && stt.isSupported) {
      stt.start();
    }
  }, [turnState, stt.isSupported]);

  const handleLearnerTurn = useCallback(async (text) => {
    if (!text.trim() || turnStateRef.current === TURN.ENDING) return;

    stt.abort();
    setTurnState(TURN.PROCESSING);
    turnStateRef.current = TURN.PROCESSING;
    setErrorMessage('');

    addToTranscript('learner', text);

    const newMessages = [...messagesRef.current, { role: 'user', content: text }];
    setMessages(newMessages);
    messagesRef.current = newMessages;

    let streamBuffer = '';
    let pendingSentence = '';
    let ttsStarted = false;

    await streamChat({
      messages: newMessages,
      scenario,
      onChunk: (chunk) => {
        streamBuffer += chunk;
        pendingSentence += chunk;

        // Flush complete sentences to TTS as they arrive
        const match = pendingSentence.match(/^([\s\S]*[.!?])\s*([\s\S]*)$/);
        if (match) {
          const toSpeak = match[1].trim();
          pendingSentence = match[2] || '';
          if (!ttsStarted) {
            ttsStarted = true;
            setTurnState(TURN.PATIENT_SPEAKING);
            turnStateRef.current = TURN.PATIENT_SPEAKING;
            tts.speak(toSpeak);
          } else {
            tts.appendToQueue(toSpeak);
          }
        }
      },
      onDone: ({ latency_ms, first_chunk_ms }) => {
        console.log(`Latency: ${latency_ms}ms total, ${first_chunk_ms}ms to first chunk`);

        // Flush any remaining sentence fragment
        if (pendingSentence.trim()) {
          if (!ttsStarted) {
            ttsStarted = true;
            setTurnState(TURN.PATIENT_SPEAKING);
            turnStateRef.current = TURN.PATIENT_SPEAKING;
            tts.speak(pendingSentence.trim());
          } else {
            tts.appendToQueue(pendingSentence.trim());
          }
        }

        const fullText = streamBuffer.trim();

        // When TTS queue drains, record the response and hand back to learner
        tts.finalizeQueue(() => {
          addToTranscript('patient', fullText);
          const assistantMsg = { role: 'assistant', content: fullText };
          setMessages((prev) => {
            const next = [...prev, assistantMsg];
            messagesRef.current = next;
            return next;
          });
          if (turnStateRef.current !== TURN.ENDING) {
            startListening();
          }
        });

        // Edge case: Claude returned nothing (empty response)
        if (!ttsStarted) {
          startListening();
        }
      },
      onError: (err) => {
        setErrorMessage(`Something went wrong: ${err}`);
        setTurnState(TURN.LISTENING);
        turnStateRef.current = TURN.LISTENING;
      },
    });
  }, [scenario, tts, stt, addToTranscript, startListening]);

  // Play the patient's opening line on mount
  useEffect(() => {
    if (sessionStartedRef.current) return;
    sessionStartedRef.current = true;
    tts.speak(scenario.patient_opening_line);
    tts.finalizeQueue(() => {
      addToTranscript('patient', scenario.patient_opening_line);
      const openingMsg = { role: 'assistant', content: scenario.patient_opening_line };
      setMessages([openingMsg]);
      messagesRef.current = [openingMsg];
      startListening();
    });
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleEndSession();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleEndSession = useCallback(async () => {
    if (turnStateRef.current === TURN.ENDING) return;
    setTurnState(TURN.ENDING);
    turnStateRef.current = TURN.ENDING;
    tts.cancel();
    stt.abort();

    let feedbackText = '';
    try {
      feedbackText = await getFeedback({ transcript: transcriptRef.current, scenario });
    } catch {
      feedbackText = 'Feedback could not be generated. Please review the transcript above.';
    }
    onEnd(transcriptRef.current, feedbackText);
  }, [scenario, tts, stt, onEnd]);

  const handleTextSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const text = textInput.trim();
      if (!text || turnStateRef.current !== TURN.LISTENING) return;
      setTextInput('');
      handleLearnerTurn(text);
    },
    [textInput, handleLearnerTurn]
  );

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const isListening = turnState === TURN.LISTENING;
  const isPatientSpeaking = turnState === TURN.PATIENT_SPEAKING;
  const isProcessing = turnState === TURN.PROCESSING;
  const isEnding = turnState === TURN.ENDING;

  const statusText = isListening
    ? 'Microphone on - speak now'
    : isProcessing
    ? 'Processing...'
    : isPatientSpeaking
    ? `${scenario.patient_persona.name} is speaking...`
    : isEnding
    ? 'Generating your feedback...'
    : '';

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 max-w-2xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
        <div>
          <p className="text-sm font-medium text-slate-900">{scenario.scenario_title}</p>
          <p className="text-xs text-slate-500">
            Time remaining:{' '}
            <span
              aria-live="polite"
              aria-label={`${formatTime(timeLeft)} remaining`}
              className={timeLeft < 60 ? 'text-red-600 font-semibold' : ''}
            >
              {formatTime(timeLeft)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={tts.volume}
              onChange={(e) => tts.setVolume(parseFloat(e.target.value))}
              className="w-20 accent-blue-700"
              aria-label="Patient voice volume"
            />
          </label>
          <button
            onClick={handleEndSession}
            disabled={isEnding}
            className="bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            End session
          </button>
        </div>
      </header>

      {/* Live caption bar */}
      {isPatientSpeaking && tts.caption && (
        <div
          role="status"
          aria-live="polite"
          className="bg-blue-700 text-white px-4 py-3 text-base leading-snug"
        >
          <span className="text-xs uppercase tracking-wide opacity-75 block mb-0.5">
            {scenario.patient_persona.name} is saying:
          </span>
          {tts.caption}
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <div role="alert" className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Transcript */}
      <section aria-label="Conversation transcript" className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {transcript.length === 0 && (
          <p className="text-slate-400 text-sm text-center mt-8">
            The conversation will appear here as you speak.
          </p>
        )}
        {transcript.map((entry, i) => (
          <div key={i} className={`flex ${entry.role === 'learner' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-sm rounded-2xl px-4 py-3 text-base leading-relaxed ${
                entry.role === 'learner'
                  ? 'bg-blue-700 text-white rounded-br-sm'
                  : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm shadow-sm'
              }`}
            >
              <p className="text-xs font-medium mb-1 opacity-70">
                {entry.role === 'learner' ? 'You' : scenario.patient_persona.name}
              </p>
              <p>{entry.text}</p>
            </div>
          </div>
        ))}
        {/* Interim STT text */}
        {isListening && stt.interimText && (
          <div className="flex justify-end">
            <div className="max-w-sm rounded-2xl px-4 py-3 bg-blue-100 text-blue-800 text-base opacity-70 rounded-br-sm">
              <p className="text-xs font-medium mb-1">You (speaking...)</p>
              <p>{stt.interimText}</p>
            </div>
          </div>
        )}
        <div ref={transcriptEndRef} />
      </section>

      {/* Input footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-4">
        <div
          role="status"
          aria-live="polite"
          className={`text-sm mb-3 flex items-center gap-2 ${
            isListening ? 'text-red-600 font-medium' : isEnding ? 'text-blue-700' : 'text-slate-400'
          }`}
        >
          {stt.isSupported ? (
            <>
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-300'
                }`}
                aria-hidden="true"
              />
              {statusText}
            </>
          ) : (
            <span className="text-amber-700">
              Voice input is not supported in this browser. Use the text box below.
            </span>
          )}
        </div>

        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <label htmlFor="text-input" className="sr-only">
            Type your response
          </label>
          <input
            id="text-input"
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={!isListening || isEnding}
            placeholder={isListening ? 'Or type your response here...' : 'Wait for your turn...'}
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-base disabled:opacity-50 disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!isListening || !textInput.trim() || isEnding}
            className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </footer>
    </main>
  );
}
