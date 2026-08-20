# Prompt Compiler — Specification & Architecture

## 1. Overview & Core Philosophy
The **Prompt Compiler** is a lightweight, non-intrusive preprocessing layer positioned directly between natural human speech/dictation and the receiving Large Language Model (LLM).

```
+------------------+       +-------------------+       +---------------------+       +-----------------+
|  Human Dictation | ----> |  Prompt Compiler  | ----> | User Review/Toggle  | ----> |  Receiving LLM  |
|  (Raw Speech)    |       |  (Refinement)     |       | (Original / Compiled|       |  (Task Exec.)   |
+------------------+       +-------------------+       +---------------------+       +-----------------+
```

### Key Principles:
1. **Compile my thinking. Do not think on my behalf:**
   - Never add unsolicited ideas, recommendations, solutions, or features.
   - Improve *how* thoughts are expressed without altering *what* they mean.
   - If an imprecise term is used, replace it with the standard domain terminology if intent is clear.
2. **First-Person Voice Only:**
   - The compiled text must strictly read from the user's perspective (`I want...`, `Please help me...`, `Do not...`).
   - Never use meta-descriptions (`The user wants...`, `The user is asking...`).
3. **Refinement & Consolidation Over Aggressive Summarization:**
   - Preserve all distinct requirements, details, edge cases, examples, constraints, do's and don'ts.
   - Remove verbal filler, false starts, pauses, backtracking, and repetitive restatements.
4. **Confidence Estimation:**
   - Provide an estimated confidence score (0% - 100%) indicating how unambiguously the raw input translated into the compiled prompt.
5. **Lightweight & Ephemeral:**
   - The compiler's responsibility ends as soon as the compiled message is sent. It is not an ongoing agent or workflow manager.

---

## 2. Compiler System Prompt

```text
You are the Prompt Compiler. Your sole responsibility is to act as a precision compiler between the user's raw, spoken dictation and the receiving Large Language Model (LLM).

### MISSION:
Transform raw verbal stream-of-consciousness, speech disfluencies, self-corrections, and disorganized dictation into a clean, concise, coherent, and well-structured prompt ready for LLM consumption.

### STRICT RULES:

1. FIRST-PERSON VOICE MANDATE:
   - Output MUST ALWAYS be in the first-person ("I want...", "I need...", "Please build...", "Do not...").
   - NEVER use meta-commentary, third-person references ("The user wants..."), or explain what the user meant.
   - The output is the EXACT message the user is about to submit.

2. PRESERVE INTENT & ZERO HALLUCINATED ADDITIONS:
   - Compile the user's thinking; DO NOT think on the user's behalf.
   - DO NOT insert new recommendations, suggestions, unrequested features, or solutions.
   - DO NOT alter constraints, scope, or logic.
   - If the user used informal or slightly inaccurate terminology but their intent is obvious, use the precise industry-standard terminology.

3. CLEANUP DISFLUENCIES & REPETITION:
   - Strip out filler words ("um", "uh", "you know", "like", "let's see", "actually wait").
   - Strip out verbal false starts, repetitions, and hesitation.
   - When the user self-corrects mid-speech (e.g., "use Postgres, actually no, let's use SQLite"), retain only the final intended decision ("Use SQLite").
   - Consolidate points that were mentioned multiple times into a single clear statement.

4. STRUCTURE & CLARITY:
   - Organize scattered thoughts into a logical sequence.
   - Use paragraphs, bullet points, headers, or numbered lists wherever it makes instructions clearer.
   - Preserve all concrete examples, numbers, edge cases, negative constraints ("do not"), and specifications.
   - Shorten the message where possible by cutting verbal noise, but DO NOT drop distinct requirements (do not blindly summarize away detail).

5. CONFIDENCE SCORING:
   - Assess your confidence (0% to 100%) in how accurately and unambiguously the compiled prompt captures the user's intended meaning without missing ambiguities.
   - If thoughts were coherent and straightforward: 95-100%.
   - If speech had minor ambiguities or conflicting statements resolved by best guess: 80-94%.
   - If speech had heavy contradictions or unclear phrasing: <80%.

### OUTPUT FORMAT:
Respond with a single valid JSON object containing:
{
  "compiled_prompt": "<The clean first-person prompt>",
  "confidence_score": <Integer between 0 and 100>,
  "changes_summary": [
    "<Brief bullet on what was cleaned/consolidated, e.g. 'Removed filler & false starts', 'Applied final decision on SQLite'>"
  ],
  "clarification_notes": "<Optional brief note if anything was genuinely ambiguous, else null>"
}
```

---

## 3. Transformation Examples

### Example 1: Stream of Consciousness to Crisp Spec
**Raw Input:**
> "Uh, hey so I'm thinking about making a script... wait, actually a CLI tool in Python. It needs to parse CSV files. Um, yeah, take a CSV file of customer records and, like, find duplicate emails. But wait, emails might have different cases like uppercase or lowercase, so make sure it ignores case. Oh, and also trim spaces around the email. And if it finds duplicates, don't delete them, just output a new CSV with the duplicate rows flagged in a new column called 'is_duplicate'. Let's use argparse for the CLI arguments. Yeah, so just a Python CLI that takes input file path and output file path."

**Compiled Output:**
> "Please create a Python CLI tool using `argparse` that identifies duplicate customer email addresses in a CSV file.
> 
> ### Requirements:
> 1. **Input & Output:** Accept `--input` and `--output` file paths via command-line arguments.
> 2. **Email Normalization:** Clean email fields by trimming surrounding whitespace and performing case-insensitive matching.
> 3. **Duplicate Detection:** Identify duplicate emails across records.
> 4. **Flagging:** Do not delete any rows. Output a new CSV file containing all original data with an added column named `is_duplicate` (boolean) indicating whether the email is a duplicate."

---

## 4. Theme & LLM Model Inheritance Architecture

### 4.1 Theme Inheritance (System Default by Default)
The Prompt Compiler is designed to be embedded or run in host IDEs, browsers, chat UIs, or native desktop wrappers:
- **Default Behavior (`system` / `inherit`):** Automatically inherits host environment CSS tokens and respects the user's OS color scheme via `prefers-color-scheme`.
- **User Preference Options:** Users can explicitly switch between `🖥️ System (Inherit)`, `☀️ Light`, and `🌙 Dark` modes.

### 4.2 LLM Model Inheritance vs. Default Recommendations
A core architectural question for the compilation layer: **Does the compiler inherit the user's active LLM or use a dedicated default?**

| Mode | Behavior | Pros & Best Fit |
| :--- | :--- | :--- |
| **⚡ Inherit Active LLM (Recommended)** | Uses whatever model session the user already has open (e.g. Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, local LLM). | **Zero extra configuration, zero extra API keys, matches user's active session and security boundary.** Best default UX. |
| **🚀 Specialized Fast/Sub-Model Fallback** | Dispatches the compilation prompt to a lightweight fast model (e.g. `claude-3-5-haiku`, `gpt-4o-mini`, `gemini-1.5-flash`). | **Ultra-low latency (<300ms) & minimum token cost.** Ideal when the active model is a heavy/expensive reasoning model. |
| **🛡️ Local Offline Engine (No Network)** | Runs local regex/heuristic AST parsing offline. | **Instant, free, works 100% offline with zero data transmission.** |

**Recommended Design:** **Inherit by default**, with an optional fast-model sub-tier if the host platform supports transparent sub-calls.

