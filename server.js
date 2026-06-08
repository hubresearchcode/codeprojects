import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { readdir, readFile, writeFile, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json());

// Serve built frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
}

// List available scenarios
app.get('/api/scenarios', async (req, res) => {
  try {
    const scenarioDir = join(__dirname, 'scenarios');
    const files = await readdir(scenarioDir);
    const scenarios = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const raw = await readFile(join(scenarioDir, file), 'utf-8');
      const s = JSON.parse(raw);
      scenarios.push({ id: s.scenario_id, title: s.scenario_title, file });
    }
    res.json(scenarios);
  } catch (err) {
    res.status(500).json({ error: 'Could not load scenarios.' });
  }
});

// Get a specific scenario by file name
app.get('/api/scenarios/:file', async (req, res) => {
  try {
    const safe = req.params.file.replace(/[^a-zA-Z0-9._-]/g, '');
    const raw = await readFile(join(__dirname, 'scenarios', safe), 'utf-8');
    res.json(JSON.parse(raw));
  } catch {
    res.status(404).json({ error: 'Scenario not found.' });
  }
});

function buildSystemPrompt(scenario) {
  const p = scenario.patient_persona;
  const constraints = scenario.conversation_constraints.map((c, i) => `${i + 1}. ${c}`).join('\n');
  return `You are roleplaying as a patient in a health communication training simulation. Stay in character at all times.

PATIENT IDENTITY
Name: ${p.name}
Age: ${p.age}
Situation: ${p.presenting_situation}
Emotional state: ${p.emotional_state}
Background: ${p.background}

COMMUNICATION STYLE
${p.communication_preferences}
Health literacy context: ${p.health_literacy_notes}

RULES FOR THIS CONVERSATION
${constraints}

SAFETY RULES
- Never give medical advice that could be applied outside this simulation.
- If the learner asks you to act as a medical reference or asks for advice for a real person, gently redirect in character.
- Never simulate self-harm, suicide, or sexual content.
- If the learner says they want to end or stop the session, acknowledge this naturally and wish them well.

IMPORTANT: You are a patient, not a teacher. Keep responses short (2-4 sentences). Do not summarise or give feedback on what the learner said. Just respond naturally as ${p.name} would.`;
}

// Streaming chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, scenario } = req.body;
  if (!messages || !scenario) {
    return res.status(400).json({ error: 'messages and scenario are required.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const startTime = Date.now();

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: buildSystemPrompt(scenario),
      messages,
    });

    let firstChunkTime = null;

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        if (!firstChunkTime) {
          firstChunkTime = Date.now() - startTime;
        }
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    const totalTime = Date.now() - startTime;
    res.write(`data: ${JSON.stringify({ done: true, latency_ms: totalTime, first_chunk_ms: firstChunkTime })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Chat error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// Feedback endpoint (non-streaming, returns structured feedback)
app.post('/api/feedback', async (req, res) => {
  const { transcript, scenario } = req.body;
  if (!transcript || !scenario) {
    return res.status(400).json({ error: 'transcript and scenario are required.' });
  }

  const rubricText = scenario.feedback_rubric
    .map((r) => `- ${r.criterion_label}: ${r.description}`)
    .join('\n');

  const transcriptText = transcript
    .map((t) => `${t.role === 'patient' ? scenario.patient_persona.name : 'Learner'}: ${t.text}`)
    .join('\n');

  const prompt = `You are reviewing a health communication practice session. A learner had a spoken conversation with a simulated patient named ${scenario.patient_persona.name} (${scenario.patient_persona.presenting_situation}).

Here is the full conversation transcript:
---
${transcriptText}
---

Please give feedback on how the learner communicated, using ONLY these criteria:

${rubricText}

FORMAT RULES
- Address each criterion in order, using the criterion label as a heading.
- Under each heading, quote one or two specific things the learner actually said (use their exact words from the transcript).
- Give one concrete suggestion the learner can try next time.
- Use plain language throughout. Write as if talking to a colleague, not writing a report.
- Do not give a numeric score.
- Total feedback should be around 300 words. No more than 350.
- If the learner did not address a criterion at all, say so briefly and give a suggestion.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ feedback: message.content[0].text });
  } catch (err) {
    console.error('Feedback error:', err.message);
    res.status(500).json({ error: 'Could not generate feedback.' });
  }
});

// --- Team Chat ---

const CHAT_FILE = join(__dirname, 'chat-messages.json');

async function loadMessages() {
  try {
    await access(CHAT_FILE);
    const raw = await readFile(CHAT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveMessages(messages) {
  await writeFile(CHAT_FILE, JSON.stringify(messages, null, 2), 'utf-8');
}

app.get('/api/chat-thread', async (req, res) => {
  const since = req.query.since ? Number(req.query.since) : 0;
  const messages = await loadMessages();
  const filtered = since ? messages.filter(m => m.timestamp > since) : messages;
  res.json(filtered);
});

app.post('/api/chat-thread', async (req, res) => {
  const { author, text, replyTo } = req.body;
  if (!author || !text) {
    return res.status(400).json({ error: 'author and text are required.' });
  }
  const messages = await loadMessages();
  const msg = {
    id: randomUUID(),
    author: author.trim(),
    text: text.trim(),
    timestamp: Date.now(),
    replyTo: replyTo || null,
  };
  messages.push(msg);
  await saveMessages(messages);
  res.status(201).json(msg);
});

app.delete('/api/chat-thread/:id', async (req, res) => {
  const messages = await loadMessages();
  const idx = messages.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Message not found.' });
  messages.splice(idx, 1);
  await saveMessages(messages);
  res.json({ ok: true });
});

app.use('/chat', express.static(join(__dirname, 'public', 'chat')));

// Catch-all for production SPA routing
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
