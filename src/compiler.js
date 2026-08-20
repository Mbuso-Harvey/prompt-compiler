/**
 * Prompt Compiler System Prompt & Instructions
 */
const COMPILER_SYSTEM_PROMPT = `You are the Prompt Compiler. Your sole responsibility is to act as a precision compiler between the user's raw, spoken dictation and the receiving Large Language Model (LLM).

### MISSION:
Transform raw verbal stream-of-consciousness, speech disfluencies, self-corrections, and disorganized dictation into a clean, concise, coherent, and well-structured prompt ready for LLM consumption.

### STRICT RULES:

1. FIRST-PERSON VOICE MANDATE:
   - Output MUST ALWAYS be written from the user's first-person perspective ("I want...", "I need...", "Please build...", "Do not...").
   - NEVER use meta-commentary, third-person descriptions ("The user wants...", "The user asks..."), or explain what the user is trying to do.
   - The output is the EXACT text the user will send to the target model.

2. PRESERVE INTENT & ZERO HALLUCINATED ADDITIONS:
   - Compile the user's thinking; DO NOT think on the user's behalf.
   - DO NOT insert new recommendations, suggestions, unrequested features, solutions, or interpretations.
   - DO NOT alter constraints, scope, or logic.
   - If the user used informal, imprecise, or colloquial terminology but their intended meaning is clear, replace it with standard, precise terminology.

3. CLEANUP DISFLUENCIES & REPETITION:
   - Strip out verbal filler ("um", "uh", "you know", "like", "let's see", "actually wait", "I mean").
   - Strip out verbal false starts, hesitation, and accidental repetitions.
   - When the user self-corrects mid-speech (e.g., "let's make it 5, no wait make it 10"), retain only the final intended decision ("10").
   - Consolidate points mentioned multiple times into a single clear statement.

4. STRUCTURE & CLARITY:
   - Organize scattered thoughts into a logical order.
   - Structure using paragraphs, bullet points, headers, or numbered lists when helpful for clarity.
   - Preserve all concrete details, requirements, constraints, examples, do's and don'ts.
   - Shorten the message where possible by removing fluff, but do not drop distinct requirements.

5. CONFIDENCE SCORING:
   - Assess your confidence (0% to 100%) in how accurately and faithfully the compiled prompt captures the user's intended meaning without ambiguity.
   - High coherence / clear intent: 95-100%
   - Minor ambiguity or self-corrections resolved: 85-94%
   - Significant ambiguity or conflicting statements: <85%

### OUTPUT FORMAT:
Respond with a JSON object matching this schema:
{
  "compiled_prompt": "string",
  "confidence_score": number, // 0-100
  "changes_summary": ["string"], // list of transformations made
  "clarification_notes": "string | null"
}`;

/**
 * Deterministic / Rule-based local heuristic compiler (used when no external LLM API key is provided)
 * Cleans speech disfluencies, resolves self-corrections, fixes voice, removes redundancy, and formats structure.
 */
class RuleBasedCompilerEngine {
  constructor() {
    this.fillerWords = [
      /\b(um|uh|er|ah|umm|uhh)\b/gi,
      /\b(you know|like I said|as I was saying|let me think|let's see)\b/gi,
      /\b(sort of|kind of|basically|literally|honestly)\b/gi
    ];
  }

  compile(rawText) {
    if (!rawText || !rawText.trim()) {
      return {
        compiled_prompt: '',
        confidence_score: 100,
        changes_summary: ['Empty input'],
        clarification_notes: null,
        token_savings: { raw_words: 0, compiled_words: 0, saved_percent: 0 }
      };
    }

    let text = rawText.trim();
    const originalWordCount = text.split(/\s+/).filter(Boolean).length;
    const changes = [];

    // 1. Strip verbal fillers & clean up commas
    let removedFillers = false;
    for (const regex of this.fillerWords) {
      if (regex.test(text)) {
        removedFillers = true;
        text = text.replace(regex, ' ');
      }
    }
    // Clean dangling commas or leading/trailing commas left by stripped fillers
    text = text.replace(/\s*,\s*,\s*/g, ', ').replace(/^\s*,\s*/, '').replace(/,\s*([.!?])/g, '$1');
    if (removedFillers) {
      changes.push('Removed conversational filler words and verbal disfluencies');
    }

    // 2. Resolve mid-sentence self-corrections (e.g., "X, wait no Y" / "X, actually Y")
    const correctionPatterns = [
      /(?:^|\s)(.+?),?\s+(?:wait no|actually no|no wait|scratch that|actually make it|correction:?)\s+(.+?)(?=[.,;\n]|$)/gi,
      /(?:^|\s)(.+?),?\s+actually\s+(.+?)(?=[.,;\n]|$)/gi
    ];

    let hadCorrections = false;
    for (const pat of correctionPatterns) {
      if (pat.test(text)) {
        hadCorrections = true;
        text = text.replace(pat, (match, before, after) => {
          return ' ' + after.trim();
        });
      }
    }
    // Strip leading "no, " if left from "actually no"
    text = text.replace(/^\s*no,\s*/i, '');
    if (hadCorrections) {
      changes.push('Resolved mid-speech self-corrections to final intended decisions');
    }

    // 3. Normalize repeated words (e.g. "I I want", "the the")
    text = text.replace(/\b(\w+)\s+\1\b/gi, '$1');

    // 4. Transform third-person framing into first-person if user spoke in third-person meta language
    const thirdPersonReplacements = [
      [/^the user wants to\s+/i, 'I want to '],
      [/^the user needs\s+/i, 'I need '],
      [/^the user is asking for\s+/i, 'Please provide '],
      [/^tell the assistant to\s+/i, 'Please '],
      [/^can you please\s+/i, 'Please '],
      [/^i was thinking maybe we could\s+/i, 'Please ']
    ];
    let convertedVoice = false;
    for (const [pattern, replacement] of thirdPersonReplacements) {
      if (pattern.test(text)) {
        convertedVoice = true;
        text = text.replace(pattern, replacement);
      }
    }
    if (convertedVoice) {
      changes.push('Standardized voice into direct first-person prompt');
    }

    // 5. Consolidate sentences and organize into logical points if multiple clauses exist
    // Split into sentences / thoughts
    const rawSentences = text
      .split(/(?<=[.?!])\s+|\n+|(?:,\s*(?:and also|oh and|plus|furthermore|additionally)\s*)/gi)
      .map(s => s.trim().replace(/^[,.-]\s*/, ''))
      .filter(s => s.length > 0);

    // Deduplicate near-identical sentences
    const uniqueSentences = [];
    const seenSentences = new Set();

    for (const sentence of rawSentences) {
      const normalized = sentence.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalized.length > 3 && !seenSentences.has(normalized)) {
        seenSentences.add(normalized);
        // Capitalize first letter
        const formatted = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        uniqueSentences.push(formatted);
      }
    }

    if (uniqueSentences.length < rawSentences.length) {
      changes.push('Consolidated redundant and duplicated thoughts');
    }

    // 6. Structure output cleanly
    let compiledPrompt = '';
    if (uniqueSentences.length === 1) {
      compiledPrompt = uniqueSentences[0];
      if (!/[.!?]$/.test(compiledPrompt)) compiledPrompt += '.';
    } else if (uniqueSentences.length <= 3) {
      compiledPrompt = uniqueSentences
        .map(s => (/[.!?]$/.test(s) ? s : s + '.'))
        .join(' ');
    } else {
      const intro = uniqueSentences[0] + (/[.!?]$/.test(uniqueSentences[0]) ? '' : '.');
      const items = uniqueSentences.slice(1).map(s => {
        const hasEndPunctuation = s.endsWith('.') || s.endsWith('!') || s.endsWith('?');
        return `- ${s}${hasEndPunctuation ? '' : '.'}`;
      }).join('\n');
      compiledPrompt = `${intro}\n\n### Details & Requirements:\n${items}`;
      changes.push('Organized scattered thoughts into structured sections and bullet points');
    }

    // Clean whitespace
    compiledPrompt = compiledPrompt.replace(/\s{2,}/g, ' ').replace(/\n\s+\n/g, '\n\n').trim();

    const compiledWordCount = compiledPrompt.split(/\s+/).filter(Boolean).length;
    const wordReduction = originalWordCount > 0 
      ? Math.max(0, Math.round(((originalWordCount - compiledWordCount) / originalWordCount) * 100))
      : 0;

    // Confidence heuristic
    let confidence = 96;
    if (hadCorrections) confidence -= 2;
    if (originalWordCount > 80) confidence -= 3;
    if (changes.length === 0) confidence = 99;

    return {
      compiled_prompt: compiledPrompt,
      confidence_score: Math.max(75, Math.min(100, confidence)),
      changes_summary: changes.length > 0 ? changes : ['Polished grammar and formatted output'],
      clarification_notes: null,
      token_savings: {
        raw_words: originalWordCount,
        compiled_words: compiledWordCount,
        saved_percent: wordReduction
      }
    };
  }
}

/**
 * Universal Prompt Compiler Class
 * Supports:
 * - Local rule engine (default offline / instant)
 * - Remote LLM API provider (OpenAI, Anthropic, Gemini, Groq, Ollama, OpenRouter, etc.)
 */
class PromptCompiler {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || process.env.AZURE_OPENAI_KEY || null;
    this.provider = options.provider || 'local'; // 'local' | 'openai' | 'anthropic' | 'vertex' | 'azure' | 'custom'
    this.model = options.model || (this.provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash');
    this.localEngine = new RuleBasedCompilerEngine();
    this.customEndpoint = options.customEndpoint || null;
    // GCP Vertex / Gemini configs
    this.gcpProjectId = options.gcpProjectId || process.env.GCP_PROJECT_ID || null;
    this.gcpRegion = options.gcpRegion || process.env.GCP_REGION || 'us-central1';
    // Azure AI Foundry / Azure OpenAI configs
    this.azureEndpoint = options.azureEndpoint || process.env.AZURE_AI_ENDPOINT || null;
    this.azureDeployment = options.azureDeployment || process.env.AZURE_DEPLOYMENT_NAME || 'gpt-4o-mini';
  }

  async compile(rawDictation) {
    if (!rawDictation || !rawDictation.trim()) {
      return {
        compiled_prompt: '',
        confidence_score: 100,
        changes_summary: [],
        clarification_notes: null,
        token_savings: { raw_words: 0, compiled_words: 0, saved_percent: 0 }
      };
    }

    // 1. Google Cloud Vertex AI / Gemini API
    if (this.provider === 'vertex' || this.provider === 'gemini') {
      return await this._compileWithVertexAI(rawDictation);
    }
    // 2. Azure AI Foundry / Azure OpenAI
    else if (this.provider === 'azure' || this.provider === 'foundry') {
      return await this._compileWithAzure(rawDictation);
    }
    // 3. OpenAI Direct
    else if (this.provider === 'openai' && this.apiKey) {
      return await this._compileWithOpenAI(rawDictation);
    }
    // 4. Anthropic Direct
    else if (this.provider === 'anthropic' && this.apiKey) {
      return await this._compileWithAnthropic(rawDictation);
    }
    // 5. Custom / Self-hosted endpoint (e.g. Ollama, vLLM, OpenRouter)
    else if (this.provider === 'custom' && this.customEndpoint) {
      return await this._compileWithCustomEndpoint(rawDictation);
    }

    // Fallback: Local offline rule-based compilation engine
    return this.localEngine.compile(rawDictation);
  }

  async _compileWithVertexAI(rawDictation) {
    try {
      // Direct Gemini REST endpoint using API key or Vertex OAuth bearer token
      const endpoint = this.apiKey.startsWith('AIza')
        ? `https://generativelanguage.googleapis.com/v1beta/models/${this.model || 'gemini-1.5-flash'}:generateContent?key=${this.apiKey}`
        : `https://${this.gcpRegion}-aiplatform.googleapis.com/v1/projects/${this.gcpProjectId}/locations/${this.gcpRegion}/publishers/google/models/${this.model || 'gemini-1.5-flash'}:generateContent`;

      const headers = { 'Content-Type': 'application/json' };
      if (!this.apiKey.startsWith('AIza')) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: COMPILER_SYSTEM_PROMPT }]
          },
          contents: [
            { role: 'user', parts: [{ text: `Raw Spoken Dictation:\n"""\n${rawDictation}\n"""` }] }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Vertex AI error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsed = JSON.parse(text);
      return this._formatResult(rawDictation, parsed);
    } catch (err) {
      console.warn('Vertex AI Compiler failed, falling back to local engine:', err.message);
      return this.localEngine.compile(rawDictation);
    }
  }

  async _compileWithAzure(rawDictation) {
    try {
      const endpoint = `${this.azureEndpoint.replace(/\/$/, '')}/openai/deployments/${this.azureDeployment}/chat/completions?api-version=2024-08-01-preview`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: COMPILER_SYSTEM_PROMPT },
            { role: 'user', content: `Raw Spoken Dictation:\n"""\n${rawDictation}\n"""` }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`Azure Foundry API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return this._formatResult(rawDictation, parsed);
    } catch (err) {
      console.warn('Azure Foundry Compiler failed, falling back to local engine:', err.message);
      return this.localEngine.compile(rawDictation);
    }
  }

  async _compileWithOpenAI(rawDictation) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: COMPILER_SYSTEM_PROMPT },
            { role: 'user', content: `Raw Spoken Dictation:\n"""\n${rawDictation}\n"""` }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return this._formatResult(rawDictation, parsed);
    } catch (err) {
      console.warn('LLM Compiler failed, falling back to local engine:', err.message);
      return this.localEngine.compile(rawDictation);
    }
  }

  async _compileWithAnthropic(rawDictation) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          system: COMPILER_SYSTEM_PROMPT,
          messages: [
            { role: 'user', content: `Please compile this raw spoken dictation into JSON according to your instructions:\n"""\n${rawDictation}\n"""` }
          ],
          temperature: 0.2,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      return this._formatResult(rawDictation, parsed);
    } catch (err) {
      console.warn('Anthropic Compiler failed, falling back to local engine:', err.message);
      return this.localEngine.compile(rawDictation);
    }
  }

  async _compileWithCustomEndpoint(rawDictation) {
    try {
      const response = await fetch(this.customEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: COMPILER_SYSTEM_PROMPT },
            { role: 'user', content: rawDictation }
          ]
        })
      });
      const data = await response.json();
      const text = data.choices ? data.choices[0].message.content : data.compiled_prompt;
      const parsed = typeof text === 'string' ? JSON.parse(text) : text;
      return this._formatResult(rawDictation, parsed);
    } catch (err) {
      console.warn('Custom Endpoint failed, falling back to local engine:', err.message);
      return this.localEngine.compile(rawDictation);
    }
  }

  _formatResult(rawDictation, parsed) {
    const rawWords = rawDictation.split(/\s+/).filter(Boolean).length;
    const compiledWords = (parsed.compiled_prompt || '').split(/\s+/).filter(Boolean).length;
    const saved = rawWords > 0 ? Math.max(0, Math.round(((rawWords - compiledWords) / rawWords) * 100)) : 0;

    return {
      compiled_prompt: parsed.compiled_prompt || '',
      confidence_score: typeof parsed.confidence_score === 'number' ? parsed.confidence_score : 95,
      changes_summary: Array.isArray(parsed.changes_summary) ? parsed.changes_summary : ['Compiled speech to structured prompt'],
      clarification_notes: parsed.clarification_notes || null,
      token_savings: {
        raw_words: rawWords,
        compiled_words: compiledWords,
        saved_percent: saved
      }
    };
  }
}

module.exports = {
  COMPILER_SYSTEM_PROMPT,
  PromptCompiler,
  RuleBasedCompilerEngine
};
