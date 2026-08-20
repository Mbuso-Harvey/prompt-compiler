# Prompt Compiler

An intelligent, lightweight compilation layer positioned directly between natural speech/dictation and LLMs.

> **"I speak naturally → my speech is compiled → I review the refined version → I send it."**

---

## 🎯 What it Solves
When speaking or dictating instructions to AI models, people naturally:
- Think out loud and ramble
- Self-correct mid-sentence (*"use Postgres, wait no, let's use SQLite"*)
- Use verbal filler (*"um", "uh", "you know", "like"*)
- Repeat requirements multiple times across several minutes

Instead of sending 5 minutes of verbal noise and consuming unnecessary context window tokens, the **Prompt Compiler** compiles your thinking into a crisp, first-person prompt that preserves **100% of your requirements and intent without thinking on your behalf**.

---

## 🌟 Key Principles

1. **Compile my thinking. Do not think on my behalf:**
   - Zero hallucinated additions, recommendations, or unsolicited solutions.
   - Refines *how* you express your thoughts without changing *what* they mean.
2. **First-Person Voice Mandate:**
   - Always outputs direct first-person instructions (`I want...`, `Please implement...`, `Do not...`).
   - Never outputs third-person meta descriptions (`The user wants...`).
3. **Intent & Detail Preservation:**
   - Consolidates duplicate thoughts and strips verbal noise.
   - Preserves all concrete parameters, constraints, edge cases, and examples.
4. **Confidence Score:**
   - Displays estimated confidence (e.g. `Confidence: 98%`) that the compilation faithfully captures your speech.
5. **Lightweight & Ephemeral:**
   - The compiler's responsibility ends as soon as you hit **Send**.

---

## 🚀 Quick Start

### 1. Launch the Interactive Web App
```bash
npm start
# or: node src/server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to test live speech dictation, toggle between Original vs Compiled views, adjust confidence thresholds, and simulate sending to an LLM.

### 2. Run the Node.js Test Suite
```bash
npm test
```

### 3. Use as a Node / TypeScript Library
```javascript
const { PromptCompiler } = require('./src/compiler');

const compiler = new PromptCompiler();
const rawSpeech = "Um, so I was thinking we need a script to clean CSVs, actually no, make it a CLI tool.";

const result = await compiler.compile(rawSpeech);
console.log(result.compiled_prompt);
// Output: "Make it a CLI tool to clean CSVs."
console.log(`Confidence: ${result.confidence_score}%`);
```

### 4. Use in Python
```python
from src.prompt_compiler import PromptCompiler

compiler = PromptCompiler()
result = compiler.compile("Um, I want a fast REST API endpoint for login.")
print(result["compiled_prompt"])
# Output: "I want a fast REST API endpoint for login."
```

---

### 4. Use with Cloud Providers (GCP Vertex AI & Azure AI Foundry)
```javascript
// Google Cloud Vertex AI (Gemini 3.5 Flash / Gemini 3.1 Flash)
const vertexCompiler = new PromptCompiler({
  provider: 'vertex',
  apiKey: process.env.GEMINI_API_KEY,
  gcpProjectId: 'warm-skill-503300-b0',
  gcpRegion: 'us-central1',
  model: 'gemini-3.5-flash'
});

// Azure AI Foundry / Azure OpenAI (GPT-5.4 Mini)
const azureCompiler = new PromptCompiler({
  provider: 'azure',
  apiKey: process.env.AZURE_OPENAI_KEY,
  azureEndpoint: process.env.AZURE_AI_ENDPOINT,
  azureDeployment: 'gpt-5.4-mini'
});
```

---

## 📖 Guides & Documentation
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)**: How to bring the compiler into VS Code, Copilot, browser extensions, and OS-level dictation workflows.
- **[SPECIFICATION.md](SPECIFICATION.md)**: Complete Prompt Compiler system prompt instructions, JSON schemas, and architectural breakdown.

