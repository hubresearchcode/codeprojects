// Stream the patient's response from Claude.
// Calls onChunk(text) for each streamed token, then calls onDone({ latency_ms, first_chunk_ms }).
export async function streamChat({ messages, scenario, onChunk, onDone, onError }) {
  let response;
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, scenario }),
    });
  } catch (err) {
    onError?.('Could not reach the server. Check your connection.');
    return;
  }

  if (!response.ok) {
    onError?.(`Server error: ${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.error) {
          onError?.(data.error);
          return;
        }
        if (data.text) {
          onChunk?.(data.text);
        }
        if (data.done) {
          onDone?.({ latency_ms: data.latency_ms, first_chunk_ms: data.first_chunk_ms });
        }
      } catch {
        // malformed line, skip
      }
    }
  }
}

export async function getFeedback({ transcript, scenario }) {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, scenario }),
  });
  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }
  const data = await response.json();
  return data.feedback;
}
