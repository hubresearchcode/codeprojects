import { useState, useRef, useCallback, useEffect } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [caption, setCaption] = useState('');
  const [volume, setVolumeState] = useState(0.75);

  const volumeRef = useRef(0.75);
  const queueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const finalizedRef = useRef(false);
  const onFinalizedDoneRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => { volumeRef.current = volume; }, [volume]);

  const setVolume = useCallback((v) => setVolumeState(v), []);

  const playnext = useCallback(() => {
    if (cancelledRef.current) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      setCaption('');
      return;
    }

    if (queueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsSpeaking(false);
      setCaption('');
      if (finalizedRef.current && onFinalizedDoneRef.current) {
        const cb = onFinalizedDoneRef.current;
        onFinalizedDoneRef.current = null;
        finalizedRef.current = false;
        cb();
      }
      return;
    }

    const text = queueRef.current.shift();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volumeRef.current;
    utterance.rate = 0.95;
    utterance.lang = 'en-AU';

    setCaption(text);
    setIsSpeaking(true);
    isPlayingRef.current = true;

    utterance.onend = () => {
      if (!cancelledRef.current) playnext();
    };
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('TTS error:', e.error);
      }
      if (!cancelledRef.current) playnext();
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  function splitSentences(text) {
    const parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    return parts.map((p) => p.trim()).filter(Boolean);
  }

  // Begin speaking fresh text (clears any existing queue)
  const speak = useCallback(
    (text) => {
      cancelledRef.current = false;
      finalizedRef.current = false;
      onFinalizedDoneRef.current = null;
      window.speechSynthesis.cancel();
      queueRef.current = splitSentences(text);
      playnext();
    },
    [playnext]
  );

  // Add more text to the end of the current queue
  const appendToQueue = useCallback(
    (text) => {
      if (cancelledRef.current) return;
      queueRef.current.push(...splitSentences(text));
      if (!isPlayingRef.current) playnext();
    },
    [playnext]
  );

  // Mark queue as complete. onDone fires when the last utterance finishes.
  const finalizeQueue = useCallback(
    (onDone) => {
      finalizedRef.current = true;
      onFinalizedDoneRef.current = onDone || null;
      // If queue is already empty and not playing, fire immediately
      if (!isPlayingRef.current && queueRef.current.length === 0) {
        finalizedRef.current = false;
        onFinalizedDoneRef.current = null;
        onDone?.();
      }
    },
    []
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    finalizedRef.current = false;
    onFinalizedDoneRef.current = null;
    queueRef.current = [];
    window.speechSynthesis.cancel();
    isPlayingRef.current = false;
    setIsSpeaking(false);
    setCaption('');
  }, []);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return { isSpeaking, caption, volume, setVolume, speak, appendToQueue, finalizeQueue, cancel };
}
