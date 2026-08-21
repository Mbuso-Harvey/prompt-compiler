# Prompt Compiler — Complete Design System, Wireframes & Screen Architecture

> **"Don't reinvent the wheel. Take the best-in-class features from top industry platforms (GitHub Copilot, Raycast, Cursor, Wispr Flow, Linear), adapt their proven UX patterns, and assemble a seamless, distraction-free speech-to-prompt experience."**

---

## 📑 Table of Contents
1. [Core Design Philosophy](#1-core-design-philosophy)
2. [Comparative Analysis of Benchmark Platforms](#2-comparative-analysis-of-benchmark-platforms)
3. [Component Provenance & Borrowed Patterns](#3-component-provenance--borrowed-patterns)
4. [Master Navigation & Screen Transition Flow](#4-master-navigation--screen-transition-flow)
5. [Screen-by-Screen ASCII Wireframes](#5-screen-by-screen-ascii-wireframes)
   - [Screen 1: The Unified Composer (Main Workspace)](#screen-1-the-unified-composer-main-workspace)
   - [Screen 2: Active Voice Dictation Overlay](#screen-2-active-voice-dictation-overlay)
   - [Screen 3: Diff & Refinement Inspector](#screen-3-diff--refinement-inspector)
   - [Screen 4: Command Palette / Action Menu (`Cmd+K`)](#screen-4-command-palette--action-menu-cmdk)
   - [Screen 5: Settings & Model Management Modal](#screen-5-settings--model-management-modal)
   - [Screen 6: Team Rules & Guardrails Manager](#screen-6-team-rules--guardrails-manager)
   - [Screen 7: Token & Cost ROI Analytics Dashboard](#screen-7-token--cost-roi-analytics-dashboard)
   - [Screen 8: Prompt History & Macro Library](#screen-8-prompt-history--macro-library)
6. [Design System Tokens, Typography & Iconography](#6-design-system-tokens-typography--iconography)

---

## 1. Core Design Philosophy

When engineers use tools like **GitHub Copilot, Cursor, Raycast, and Linear**, they expect:
1. **Zero Cognitive Friction:** Familiar keyboard shortcuts, instant response times (<150ms), and predictable component placement.
2. **Generous White Space & Minimalist Cards:** Eliminating cluttered outer boxes and playful emojis in favor of crisp borders, neutral tones, and clear typographic hierarchy.
3. **Progressive Disclosure:** Advanced options (Models, Modes, Team Guardrails, Settings) stay neatly tucked into inline dropdowns or command palettes until explicitly needed.
4. **Theme Native:** Automatically inherits the host IDE, OS, or browser color scheme (`system` by default, with crisp `light` and deep `dark` modes).

---

## 2. Comparative Analysis of Benchmark Platforms

We evaluated the top 4 products in this domain:

| Benchmark Product | Primary Strength | Component We Learn & Adopt From Them |
| :--- | :--- | :--- |
| **1. GitHub Copilot (VS Code / Web)** | Industry-standard inline prompt bar, model switcher pill, quiet diff review drawer, status bar quick actions. | **Composer Structure & Model Selector:** Single integrated input box with model selector pill and quiet bottom toolbar. |
| **2. Raycast** | Best-in-class keyboard navigation, floating command palette (`Cmd+K`), fast dropdown menus, and settings tabs. | **Command Palette & Settings Modal:** Tabbed preferences layout, keyboard-first action menus, and shortcut triggers. |
| **3. Cursor / Windsurf** | Contextual `.cursorrules` injection, chat composer layout, real-time token metrics, seamless theme inheritance. | **Team Guardrails & Diff Review:** Woven workspace rule injection and side-by-side / toggleable diff view. |
| **4. Wispr Flow / Superwhisper** | Voice-first dictation overlay, live microphone audio wave visualizer, local offline speech processing. | **Voice Dictation HUD:** Subtle recording pulse, real-time streaming speech preview, and disfluency cleanup trigger. |

---

## 3. Component Provenance & Borrowed Patterns

| UI Component | Borrowed From | Design Rationale & Exact Styling |
| :--- | :--- | :--- |
| **Single Central Composer** | **Linear & Raycast** | Centered canvas, single clean card with subtle 1px border (`#e2e8f0` light, `#1e293b` dark), generous 20px padding, no distracting nested containers. |
| **Model & Mode Dropdown Pills** | **Cursor & GitHub Copilot** | Inline rounded button triggers (`[Mode: General ▾]`, `[Model: GPT-4.1 Mini ▾]`) placed directly on the composer footer. |
| **Status Bar Trigger** | **VS Code / GitHub Copilot** | Quiet `$(sparkle) Compile Prompt` item in the bottom right status bar with `Ctrl+Alt+V` hotkey. |
| **Command Palette (`Cmd+K`)** | **Raycast** | Centered floating modal with instant fuzzy search for compilation modes, settings, and macros. |
| **Diff & Review Segmented Toggle** | **GitHub PR Diff View** | Understated `[Compiled | Original]` tab segment showing confidence percentage (`98% Match`) and noise reduction rate (`38% Cut`). |
| **Settings Preferences Dialog** | **Raycast Settings** | Clean left-sidebar tabbed modal: *General*, *Models / BYOK*, *Team Rules*, *Audio & Dictation*, *Shortcuts*. |
| **Team Guardrails Notice** | **GitHub Copilot Enterprise** | Contextual inline banner appearing only when Team Tier is active, showing active workspace rules. |

---

## 4. Master Navigation & Screen Transition Flow

```
                                  ┌────────────────────────┐
                                  │   Global Hotkey / UI   │
                                  │  (Ctrl+Alt+V / Click)  │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                 ┌──────────────────────────┐
                       ┌─────────┤ Screen 1: Main Composer  ├─────────┐
                       │         │  (Dictate / Text Input)  │         │
                       │         └────────────┬─────────────┘         │
                       │                      │                       │
      [Press Mic / Dictate]                   │ [Press Cmd+K]         │ [Click ⚙️ Settings]
                       │                      │                       │
                       ▼                      ▼                       ▼
          ┌──────────────────────┐  ┌───────────────────┐  ┌───────────────────────┐
          │ Screen 2: Voice HUD  │  │ Screen 4: Command │  │  Screen 5: Settings   │
          │  (Speech Streaming)  │  │ Palette (Cmd+K)   │  │   (BYOK, Models, UI)  │
          └───────────┬──────────┘  └─────────┬─────────┘  └───────────┬───────────┘
                      │                       │                        │
                      │ [Speech Ends]         │ [Select Action]        │ [Switch Tab]
                      │                       │                        │
                      ▼                       │                        ▼
          ┌──────────────────────┐            │            ┌───────────────────────┐
          │ Screen 3: Diff View  │◄───────────┘            │ Screen 6: Team Rules  │
          │ (Compiled vs Raw)    │                         │ Screen 7: ROI Stats   │
          └───────────┬──────────┘                         │ Screen 8: Macro Lib   │
                      │                                    └───────────────────────┘
                      │ [Press Send / Enter]
                      ▼
          ┌──────────────────────┐
          │ Screen 4: Dispatched │
          │  (Target LLM Stream) │
          └──────────────────────┘
```

---

## 5. Screen-by-Screen ASCII Wireframes

### Screen 1: The Unified Composer (Main Workspace)
*Origin: Linear Issue Composer + GitHub Copilot Chat Box*

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ✦ Prompt Compiler  PRO                           [Plan: Pro ($5/mo) ▾]  [Theme: 🖥️ ▾] [Compiler ●]│
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│                                                                                        │
│         ┌────────────────────────────────────────────────────────────────────┐         │
│         │  [ Compiled  |  Original ]         ✨ 98% Match   38% Cut   $0.00 Saved  │         │
│         ├────────────────────────────────────────────────────────────────────┤         │
│         │                                                                    │         │
│         │  Please create a Python CLI tool using `argparse` that identifies  │         │
│         │  duplicate customer email addresses in a CSV file.                 │         │
│         │                                                                    │         │
│         │  ### Requirements:                                                 │         │
│         │  1. Input & Output: Accept --input and --output file paths.        │         │
│         │  2. Email Normalization: Trim whitespace and ignore case.          │         │
│         │  3. Duplicate Detection: Identify duplicates across records.       │         │
│         │  4. Flagging: Output CSV with new 'is_duplicate' boolean column.   │         │
│         │                                                                    │         │
│         ├────────────────────────────────────────────────────────────────────┤         │
│         │  🎙️ Dictate   [Mode: General ▾]   [Model: GPT-4.1 Mini ▾]          │         │
│         │                                       [Clear]  [Re-Compile]  [Send to LLM ↵]│
│         └────────────────────────────────────────────────────────────────────┘         │
│                                                                                        │
│                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  Prompt Compiler • Speech-to-Prompt Pre-flight Layer • Professional Edition            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 2: Active Voice Dictation Overlay
*Origin: Wispr Flow / Superwhisper Live HUD*

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                        │
│         ┌────────────────────────────────────────────────────────────────────┐         │
│         │  [ Compiled  |  Original ]                            00:14 / 05:00│         │
│         ├────────────────────────────────────────────────────────────────────┤         │
│         │                                                                    │         │
│         │  "Um, hey, so I was thinking maybe we should add rate limiting to  │         │
│         │   our express routes, wait no, let's use Redis with a sliding       │         │
│         │   window of 100 requests per minute per IP address..."             │         │
│         │                                                                    │         │
│         ├────────────────────────────────────────────────────────────────────┤         │
│         │  🔴 Listening...  ||| | | |||| || | |||| |   [Finish Speaking ↵]   │         │
│         └────────────────────────────────────────────────────────────────────┘         │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 3: Diff & Refinement Inspector
*Origin: VS Code Side-by-Side Diff Editor*

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  COMPILER REVIEW & DIFF INSPECTOR                                           [Close ✕]  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   ORIGINAL RAW DICTATION (78 words)          COMPILED 1ST-PERSON PROMPT (32 words)     │
│  ┌──────────────────────────────────────┐   ┌──────────────────────────────────────┐   │
│  │ "Um, hey so I'm thinking about       │   │ Please create an Express rate        │   │
│  │ making a rate limiter... wait,       │   │ limiter middleware using Redis.      │   │
│  │ actually let's use Redis with a      │   │                                      │   │
│  │ sliding window of 100 requests       │   │ Requirements:                        │   │
│  │ per minute. Don't block health       │   │ 1. Sliding window algorithm: 100     │   │
│  │ check endpoints though."             │   │    requests / minute per IP.         │   │
│  │                                      │   │ 2. Exclude /health check route.      │   │
│  └──────────────────────────────────────┘   └──────────────────────────────────────┘   │
│                                                                                        │
│   Refinements Applied:                                                                 │
│   ✓ Stripped 6 verbal fillers ("um", "hey so", "I'm thinking about")                   │
│   ✓ Resolved self-correction: Selected Redis sliding window                            │
│   ✓ Converted to direct first-person prompt                                            │
│   ✓ Noise reduction: 58.9% tokens saved ($0.004 saved on Claude Opus)                  │
│                                                                                        │
│                                           [Edit Prompt]  [Copy]  [Accept & Send ↵]     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 4: Command Palette / Action Menu (`Cmd+K`)
*Origin: Raycast / Linear Command Menu*

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             ┌────────────────────────────────────────┐                 │
│                             │ 🔍 Type a command, mode, or action...  │                 │
│                             ├────────────────────────────────────────┤                 │
│                             │ COMPILATION MODES                      │                 │
│                             │   ⚡ General Prompt                    │                 │
│                             │   🛠️ Code & Refactor (Pro)             │                 │
│                             │   🔍 PR / Code Review (Pro)            │                 │
│                             │   🏗️ Architecture ADR (Pro)            │                 │
│                             │   🐞 Bug Report (Pro)                  │                 │
│                             │   📊 SQL & Database (Pro)              │                 │
│                             │                                        │                 │
│                             │ ACTIONS                                │                 │
│                             │   🎙️ Start Voice Dictation   [Ctrl+Alt+V]│               │
│                             │   🔄 Re-Compile Current Prompt   [Ctrl+R]│               │
│                             │   📋 Copy Compiled Prompt        [Cmd+C]│                │
│                             │   ⚙️ Open Settings & Models     [Cmd+,]│                 │
│                             │   🏢 View Team Guardrails              │                 │
│                             │   📈 Open Token ROI Analytics          │                 │
│                             └────────────────────────────────────────┘                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Screen 5: Settings & Model Management Modal
*Origin: Raycast Preferences & VS Code Settings UI*

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  PREFERENCES & CONFIGURATION                                                [Done ✕]   │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│                   │                                                                    │
│  ⚙️ General        │  ACTIVE LLM BACKEND PROVIDER                                       │
│  🤖 Models & BYOK  │  ( ) Local Offline Heuristic (100% Free, Zero API calls)           │
│  🏢 Team Rules    │  (•) Azure AI Foundry (GPT-4.1 Mini)                               │
│  🎙️ Audio & Voice │  ( ) Google Cloud Vertex AI (Gemini 3.5 Flash / 3.1 Flash)         │
│  ⌨️ Shortcuts     │  ( ) Anthropic Model Garden (Claude Haiku 4.5)                     │
│  💳 Subscription  │                                                                    │
│                   │  AZURE AI FOUNDRY CONFIGURATION                                    │
│                   │  Resource Endpoint:                                                │
│                   │  [https://mbusoharvey-8727-resource.services.ai.azure.com        ] │
│                   │                                                                    │
│                   │  API Key (BYOK):                                                   │
│                   │  [************************************************               ] │
│                   │                                                                    │
│                   │  Model Deployment:                                                 │
│                   │  [gpt-4.1-mini                                                   ] │
│                   │                                                                    │
│                   │                                     [Test Connection]  [Save]      │
└───────────────────┴────────────────────────────────────────────────────────────────────┘
```

---

### Screen 6: Team Rules & Guardrails Manager
*Origin: GitHub Copilot Enterprise Repository Policies*

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  PREFERENCES & CONFIGURATION                                                [Done ✕]   │
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│                   │                                                                    │
│  ⚙️ General        │  TEAM GUARDRAILS & STANDARDS INJECTION (Team Tier: $15/seat)       │
│  🤖 Models & BYOK  │  Rules are automatically woven into every prompt's constraints.    │
│  🏢 Team Rules    │                                                                    │
│  🎙️ Audio & Voice │  Active Workspace: [ Engineering-Core ▾ ]                          │
│  ⌨️ Shortcuts     │                                                                    │
│  💳 Subscription  │  [✓] 1. Strict TypeScript: Enforce strict typing (no `any`)        │
│                   │  [✓] 2. Unit Testing: Require Vitest test suite for all endpoints  │
│                   │  [✓] 3. Input Validation: Validate HTTP request payloads with Zod  │
│                   │  [✓] 4. Security: Adhere to OWASP Top 10 API Security standards    │
│                   │                                                                    │
│                   │  [+ Add New Team Rule...]                                          │
│                   │                                                                    │
│                   │                                                     [Save Rules]   │
└───────────────────┴────────────────────────────────────────────────────────────────────┘
```

---

### Screen 7: Token & Cost ROI Analytics Dashboard
*Origin: Vercel Analytics / Linear Insights*

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  ORGANIZATION PROMPT ROI & TOKEN ANALYTICS                                  [Export ⤓] │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  ┌──────────────────────┐┌──────────────────────┐┌──────────────────────┐             │
│  │ TOTAL TOKENS SAVED   ││ ESTIMATED $ SAVED    ││ AVG NOISE REDUCTION  │             │
│  │ 1,420,800 tokens     ││ $426.24 (vs Opus/o1) ││ 41.8% noise cut      │             │
│  └──────────────────────┘└──────────────────────┘└──────────────────────┘             │
│                                                                                        │
│  MONTHLY TOKEN COMPRESSION HISTORY                                                     │
│  Tokens (k)                                                                            │
│   400 |                     ■                                                          │
│   300 |             ■       ■       ■                                                  │
│   200 |     ■       ■       ■       ■       ■                                          │
│   100 |     ■       ■       ■       ■       ■                                          │
│     0 └───────────────────────────────────────────                                     │
│            Week 1  Week 2  Week 3  Week 4  Week 5                                      │
│                                                                                        │
│  TOP COMPILATION MODES: 1. Code & Refactor (52%)  2. Bug Report (24%)  3. General (14%)│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Design System Tokens, Typography & Iconography

### 6.1 Typography Scale
- **UI Font:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- **Code & Prompt Font:** `JetBrains Mono`, `SF Mono`, `Consolas`, `monospace`
- **Hierarchy:**
  - `H1 (Brand)`: 15px / 600 weight / letter-spacing -0.01em
  - `Body Text`: 14px / 400 weight / line-height 1.6
  - `Compiled Code`: 13px / 500 weight / line-height 1.65
  - `Badges & Labels`: 11px / 600 weight / uppercase / letter-spacing 0.04em
  - `Subtext / Footers`: 12px / 400 weight

### 6.2 Iconography (Lucide & Octicons Mapping)
All playful emojis are eliminated in the UI and replaced with crisp, standardized SVG vector icons:

| Action / Feature | Vector Icon (SVG) | Origin |
| :--- | :--- | :--- |
| **Brand Sparkle** | `<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9..."/>` | Lucide Sparkle |
| **Microphone Dictate** | `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5..."/>` | Octicon Mic |
| **Model / CPU** | `<rect x="4" y="4" width="16" height="16" rx="2"/>...` | Lucide Cpu |
| **Settings** | `<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1..."/>` | Octicon Gear |
| **Team Shield** | `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>` | Lucide Shield |
| **Send Action** | `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22..."/>` | Lucide Send |
| **Chevron Dropdown** | `<path d="m6 9 6 6 6-6"/>` | Lucide ChevronDown |
