import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export function useSpeechRecognition({ onResult, onEnd } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onEndRef = useRef(onEnd);

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  const isSupported = Boolean(SpeechRecognition);

  const start = useCallback(() => {
    if (!SpeechRecognition) return;
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-AU';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setInterimText(interim || final);
      if (final) {
        setInterimText('');
        onResultRef.current?.(final.trim());
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      onEndRef.current?.();
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Speech recognition error:', event.error);
      }
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const abort = useCallback(() => {
    recognitionRef.current?.abort();
    setIsListening(false);
    setInterimText('');
  }, []);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { isSupported, isListening, interimText, start, stop, abort };
}
