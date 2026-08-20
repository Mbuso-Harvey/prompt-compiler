# Prompt Compiler — Integration & Architecture Guide

This guide explains **how the Prompt Compiler works under the hood**, how to **bring it into your daily environments** (VS Code, Copilot, Cursor, Web Chat, and OS-level dictation), and how to configure it to run using **Google Cloud Vertex AI** or **Azure AI Foundry** credits.

---

## 1. How Does the Prompt Compiler Work?

The compiler is a **pre-flight transformation layer** between human speech/dictation input and the target LLM.

```
┌─────────────────────────┐
│     User Dictates       │  "Um, hey, so I was thinking maybe we make a Python CLI...
│ (Stream-of-Consciousness│   wait no, let's use SQLite, not Postgres. Make sure it trims
│   + Verbal Disfluency)  │   emails and ignores case. Don't delete duplicates..."
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│     Prompt Compiler     │  1. Strips verbal filler ("um", "uh", "you know")
│   (Fast LLM / Heuristic)│  2. Resolves self-corrections (Postgres -> SQLite)
│                         │  3. Formats to 1st person ("I want...", "Please...")
│                         │  4. Preserves 100% of constraints & details
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Review & Diff Overlay  │  User views:
│   (Original vs Compiled)│  ✨ Compiled prompt (First-Person, structured)
│                         │  📊 Confidence score (e.g. 98%) & noise reduction %
└────────────┬────────────┘
             │  User presses [Send] (or edits if needed)
             ▼
┌─────────────────────────┐
│  Target Model / Copilot │  Receives the crystal-clear prompt directly
│  (Claude, GPT-4o, etc.) │  without wasting context window or token budget.
└─────────────────────────┘
```

### The 4 Core Principles:
1. **Compile my thinking; do not think on my behalf:** Zero unrequested solutions or hallucinated requirements.
2. **First-Person Voice Only:** Always output `I want...`, `Please create...`, `Do not...` (never `The user wants...`).
3. **Intent & Detail Preservation:** Retains every edge case, parameter, and negative constraint.
4. **Lightweight & Ephemeral:** The compiler terminates its role the moment the prompt is sent.

---

## 2. Bringing Prompt Compiler Into Your Environments

### Option A: VS Code / GitHub Copilot Chat Integration

You can integrate Prompt Compiler directly into VS Code in two ways:

#### 1. VS Code Extension / Command Wrapper (Recommended)
Add a command or keybinding (e.g., `Ctrl+Alt+V` / `Cmd+Shift+D` for *Dictate & Compile*):
- When triggered, it records dictation via Web Speech / Whisper API.
- Sends the transcript to the Prompt Compiler.
- Inserts the compiled first-person prompt directly into the **Copilot Chat input box** or the active editor window.

```typescript
// Sample VS Code extension snippet (extension.ts)
import * as vscode from 'vscode';
import { PromptCompiler } from './compiler';

const compiler = new PromptCompiler({ provider: 'vertex' });

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('promptCompiler.compileAndInsert', async () => {
    const rawInput = await vscode.window.showInputBox({
      prompt: 'Dictate or speak your prompt (or paste raw stream of consciousness):',
      placeHolder: 'e.g. Um, let\'s build a REST endpoint for auth...'
    });

    if (rawInput) {
      const result = await compiler.compile(rawInput);
      // Opens review quickpick or pastes directly to Copilot Chat
      await vscode.commands.executeCommand('workbench.action.chat.open', {
        query: result.compiled_prompt
      });
    }
  });

  context.subscriptions.push(disposable);
}
```

#### 2. Copilot Participant / Tool (`@compile`)
If registered as a Copilot Chat participant or tool:
```
@compile Um, hey, I was thinking we should add rate limiting to our express routes, let's use redis with a sliding window of 100 requests per minute.
```
The participant returns the formatted prompt and executes the task with the target model.

---

### Option B: Browser Extension (ChatGPT, Claude.ai, Gemini Web)
A lightweight Chrome / Edge extension that injects a **"✨ Compile"** toggle button right next to the message input box in web interfaces:
1. Dictate naturally into the text box.
2. If **Compiler Mode** is ON, pressing `Enter` intercepts the send, displays the compiled preview with confidence score, and sends upon confirmation.
3. If OFF, sends the raw text directly.

---

### Option C: Global Desktop Dictation Utility (Windows / macOS)
Run Prompt Compiler as a background tray tool:
1. Press global hotkey (e.g. `Win + Alt + Space` / `Cmd + Option + Space`).
2. Dictate your thoughts for 1–5 minutes.
3. Release hotkey $\rightarrow$ compiled prompt is instantly copied to your clipboard and pasted into whatever window is focused (Copilot, Slack, Terminal, etc.).

---

## 3. Configuring Cloud Providers (GCP Vertex AI & Azure AI Foundry)

You can power the compiler using your **Google Cloud Platform (Vertex AI)** or **Azure AI Foundry** credits for ultra-low latency, cost-effective compilation.

### 🌟 Recommended Model for Compilation:
- **GCP:** `gemini-1.5-flash` or `gemini-2.0-flash` (near-zero cost, ~150ms latency).
- **Azure:** `gpt-4o-mini` (cost-efficient, high structured JSON fidelity).

---

### 3.1 Google Cloud Vertex AI Setup

Set your environment variables in `.env` or your system environment:

```bash
# Option 1: Using Gemini API Key
export GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
export COMPILER_PROVIDER="vertex"
export COMPILER_MODEL="gemini-1.5-flash"

# Option 2: Using GCP Service Account / Vertex AI Endpoint
export GCP_PROJECT_ID="your-gcp-project-id"
export GCP_REGION="us-central1"
export VERTEX_BEARER_TOKEN="$(gcloud auth print-access-token)"
```

#### Code Initialization (Node.js & Python):
```javascript
// Node.js
const { PromptCompiler } = require('./src/compiler');

const compiler = new PromptCompiler({
  provider: 'vertex',
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-1.5-flash'
});

const result = await compiler.compile("Um, let's write a function to parse JWTs, wait no, validate JWT signatures.");
console.log(result.compiled_prompt);
// Output: "Please write a function to validate JWT signatures."
```

```python
# Python
from src.prompt_compiler import PromptCompiler

compiler = PromptCompiler(provider='vertex', api_key='YOUR_API_KEY')
result = compiler.compile("Um, hey, create a docker compose file for Postgres and Redis.")
print(result["compiled_prompt"])
```

---

### 3.2 Azure AI Foundry / Azure OpenAI Setup

```bash
export AZURE_AI_ENDPOINT="https://your-foundry-resource.openai.azure.com"
export AZURE_OPENAI_KEY="your-azure-api-key"
export AZURE_DEPLOYMENT_NAME="gpt-4o-mini"
export COMPILER_PROVIDER="azure"
```

#### Code Initialization (Node.js):
```javascript
const { PromptCompiler } = require('./src/compiler');

const compiler = new PromptCompiler({
  provider: 'azure',
  apiKey: process.env.AZURE_OPENAI_KEY,
  azureEndpoint: process.env.AZURE_AI_ENDPOINT,
  azureDeployment: process.env.AZURE_DEPLOYMENT_NAME || 'gpt-4o-mini'
});

const result = await compiler.compile(rawSpeech);
```

---

## 4. Architectural Comparison: Cloud vs Local Compiler

| Feature | GCP Vertex AI (`gemini-1.5-flash`) | Azure AI Foundry (`gpt-4o-mini`) | Local Rule Engine (Offline) |
| :--- | :--- | :--- | :--- |
| **Speed / Latency** | ~150ms - 250ms | ~250ms - 400ms | < 5ms (Instant) |
| **Cost** | Negligible (uses GCP credits) | Negligible (uses Azure credits) | $0.00 (Zero network) |
| **Complex Disfluency Handling** | Excellent (handles 10-minute long rambles) | Excellent | Good for standard patterns & filler words |
| **Offline Support** | No | No | 100% Offline |
| **Privacy / Enterprise** | Enterprise VPC compliant | Enterprise Tenant compliant | Local device only |

---

## 5. Summary & Recommendation

- **Best for Daily Use with GCP Credits:** Use **`vertex`** with **`gemini-1.5-flash`** — it is extremely fast, processes large transcripts instantly, and costs fractions of a cent.
- **Best for Azure Ecosystem:** Use **`azure`** with **`gpt-4o-mini`** through your Azure AI Foundry resource.
- **Default Fallback:** The local engine automatically kicks in if no network or API keys are present.
