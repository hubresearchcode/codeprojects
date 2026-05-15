# Voice Patient Simulator

A voice-to-voice AI patient simulator for health literacy communication practice. Built for the Statewide Health Literacy Hub as a working prototype.

## What it does

A health workforce learner opens the app, reads a one-paragraph scenario brief, then has a free-form spoken conversation with a simulated patient. At the end they receive written feedback against a defined rubric and can download the transcript.

## Quick start

### 1. Prerequisites

- Node.js 18 or later
- An Anthropic API key

### 2. Install

```bash
npm install
```

### 3. Configure

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key.

### 4. Run in development

```bash
npm run dev
```

Open `http://localhost:5173` in Chrome, Edge, or Safari (see browser notes below).

### 5. Build for production

```bash
npm run build
npm start
```

The production server runs on port 3001 by default (set `PORT` in `.env` to change).

---

## Adding a second scenario

1. Copy `scenarios/default.json` to a new file (for example `scenarios/asthma-mr-chen.json`).
2. Edit the fields. The required fields are listed below.
3. Restart the server. The app loads the first scenario file alphabetically. To select a specific scenario, rename it so it sorts first (for example prefix with `01-`).

No code changes are needed.

### Scenario file fields

| Field | Description |
|---|---|
| `scenario_id` | Unique identifier string |
| `scenario_title` | Short title shown to the learner |
| `learner_brief` | One paragraph the learner reads before starting |
| `patient_persona` | Object with name, age, presenting_situation, communication_preferences, health_literacy_notes, emotional_state, background |
| `patient_opening_line` | The first thing the patient says |
| `conversation_constraints` | Array of strings - rules for how the patient should behave |
| `feedback_rubric` | Array of criteria objects (see below) |
| `time_limit_minutes` | Session time limit (default 10) |

Each rubric criterion has:
- `criterion_id` - unique string
- `criterion_label` - short label shown in feedback
- `description` - plain-language description of what to look for

---

## Technical choices

### Conversation model
Claude claude-sonnet-4-6 (Anthropic). Chosen for strong instruction following, which is needed to keep the patient in character.

Model version is set in `server.js` at the `anthropic.messages.stream` call.

### Speech to text (STT)
Web Speech API (`SpeechRecognition`) - browser-native. No API cost, low latency (typically under 200ms to transcript).

Limitations:
- Not supported in Firefox. Firefox users fall back to the text input box automatically.
- Requires a secure context (HTTPS or localhost).
- Accuracy varies with accent and background noise. The text input is always available as an alternative.
- Language is set to `en-AU`.

### Text to speech (TTS)
Web Speech API (`SpeechSynthesis`) - browser-native. No API cost. Voice selection depends on the operating system.

Limitations:
- Voice quality varies by OS and browser. On macOS/iOS, quality is good. On Windows with Edge, quality is good. On Linux, quality varies.
- No voice cloning of real people.
- Volume starts at 75% and is adjustable via the slider in the session header.

If you need a higher quality voice, replace the `useSpeechSynthesis` hook with calls to a TTS API (for example ElevenLabs, Google Cloud Text-to-Speech, or AWS Polly). Australian-hosted options include Google Cloud (sydney region) and AWS (ap-southeast-2).

### Latency
Observed end-to-end latency (learner finishes speaking to patient starts speaking):
- Development environment, Sydney to Anthropic US: 1.2 - 2.8 seconds typical
- The app uses streaming: it begins TTS as soon as the first complete sentence arrives from Claude, rather than waiting for the full response. This brings time-to-first-word down significantly.
- Latency for each exchange is logged to the browser console.

Target from brief: under 2 seconds. Actual results depend on network conditions. Anything over 4 seconds shows a "Processing..." indicator.

### Data handling
- No audio is stored at any point.
- Transcripts are kept only in browser memory for the duration of the session.
- No personally identifiable information is collected or sent to any server except the conversation text (which goes to Anthropic's API).
- The Anthropic API data handling policy applies: https://www.anthropic.com/legal/privacy
- For health workforce deployments, review whether the Anthropic API has an Australian data residency option or use an alternative model provider hosted in Australia.

---

## Known limitations for v1

1. Firefox does not support voice input. Text input works.
2. Voice quality depends on the OS voice pack. No control over which voice is selected.
3. If the Claude API is slow (>4s), the conversation feels choppy.
4. Only the first scenario file (alphabetically) loads. Multi-scenario selection UI is out of scope for v1.
5. The feedback quality has not been reviewed by clinical educators. Do not use for real assessment without that review.
6. No session logging or analytics.

---

## Open questions (from brief)

These were raised in the build brief and remain unresolved:

- Who owns scenario authoring and clinical review?
- What is the API cost budget per session? (Current estimate: $0.01-0.05 USD per 10-minute session at claude-sonnet-4-6 pricing.)
- Is there a preferred Australian-hosted STT/TTS provider?
- Who will pilot the prototype and what do they need to see?

---

## Security notes

- The Anthropic API key is never sent to the browser. All Claude calls go through the backend server.
- No user authentication in v1. Do not deploy this on a public URL without adding auth if the API key cost is a concern.
