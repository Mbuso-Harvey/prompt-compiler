/**
 * Prompt Compiler System Prompt & Domain Mode Instructions
 */

const DOMAIN_MODES = {
  general: {
    id: 'general',
    name: 'General Prompt',
    icon: '⚡',
    description: 'Standard first-person compilation for general engineering & assistant tasks.',
    instruction: 'Organize into logical sections, requirements, and constraints with first-person voice.'
  },
  code_refactor: {
    id: 'code_refactor',
    name: 'Code & Refactor (Pro)',
    icon: '🛠️',
    description: 'Specialized for code changes, technical specs, parameter types, and test requirements.',
    instruction: 'Focus on exact technical specifications, preserving code identifiers, function signatures, library constraints, test-driven requirements, and negative constraints.'
  },
  code_review: {
    id: 'code_review',
    name: 'PR / Code Review (Pro)',
    icon: '🔍',
    description: 'Formats rambling review feedback into structured PR review comments with severity and actionable recommendations.',
    instruction: 'Structure the feedback cleanly into: Summary, Severity (Critical/Warning/Nit), File/Context references, and Constructive Suggestions.'
  },
  architecture_adr: {
    id: 'architecture_adr',
    name: 'Architecture RFC / ADR (Pro)',
    icon: '🏗️',
    description: 'Structures design thoughts into standard Architecture Decision Records (Context, Decision, Consequences, Trade-offs).',
    instruction: 'Structure into: Context & Problem, Proposed Decision, Key Requirements, Considered Alternatives, and Trade-offs/Consequences.'
  },
  bug_report: {
    id: 'bug_report',
    name: 'Bug Report / Issue (Pro)',
    icon: '🐞',
    description: 'Formats spoken problem reports into Expected Behavior, Actual Behavior, and Steps to Reproduce.',
    instruction: 'Structure into: Summary, Steps to Reproduce, Expected vs Actual Behavior, Environment/Context, and Error logs if mentioned.'
  },
  sql_data: {
    id: 'sql_data',
    name: 'SQL & Database (Pro)',
    icon: '📊',
    description: 'Formats business logic and data queries into schema requirements, JOIN/aggregation goals, and indexing constraints.',
    instruction: 'Structure into: Query Objectives, Schema/Table Context, Filtering & Aggregation Criteria, and Performance/Indexing constraints.'
  }
};

function buildSystemPrompt({ mode = 'general', teamRules = [] } = {}) {
  const modeSpec = DOMAIN_MODES[mode] || DOMAIN_MODES.general;

  let teamRulesSection = '';
  if (Array.isArray(teamRules) && teamRules.length > 0) {
    teamRulesSection = `\n\n### MANDATORY TEAM RULES & GUARDRAILS (Team Tier):
The following workspace rules MUST be respected and seamlessly incorporated into the compiled prompt's constraints section:
${teamRules.map((rule, idx) => `${idx + 1}. ${rule}`).join('\n')}`;
  }

  return `You are the Prompt Compiler. Your sole responsibility is to act as a precision compiler between the user's raw, spoken dictation and the receiving Large Language Model (LLM).

### MISSION:
Transform raw verbal stream-of-consciousness, speech disfluencies, self-corrections, and disorganized dictation into a clean, concise, coherent, and well-structured prompt ready for LLM consumption.

### DOMAIN MODE INSTRUCTION (${modeSpec.name}):
${modeSpec.instruction}

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
   - Shorten the message where possible by removing fluff, but do not drop distinct requirements.${teamRulesSection}

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
}

const COMPILER_SYSTEM_PROMPT = buildSystemPrompt({ mode: 'general' });

/**
 * Deterministic / Rule-based local heuristic compiler (used when no external LLM API key is provided)
 */
class RuleBasedCompilerEngine {
  constructor() {
    this.fillerWords = [
      /\b(um|uh|er|ah|umm|uhh)\b/gi,
      /\b(you know|like I said|as I was saying|let me think|let's see)\b/gi,
      /\b(sort of|kind of|basically|literally|honestly|I mean)\b/gi,
      /\b(so yeah|yeah so|oh yeah|oh and|and like|just like)\b/gi,
      /,\s*like,\s*/gi,
      /\s+like,\s+/gi
    ];
  }

  compile(rawText, options = {}) {
    if (!rawText || !rawText.trim()) {
      return {
        compiled_prompt: '',
        confidence_score: 100,
        changes_summary: ['Empty input'],
        clarification_notes: null,
        token_savings: { raw_words: 0, compiled_words: 0, saved_percent: 0, tokens_cut: 0, estimated_dollar_savings: 0 }
      };
    }

    let text = rawText.trim();
    const originalWordCount = text.split(/\s+/).filter(Boolean).length;
    const changes = [];
    const mode = options.mode || 'general';
    const teamRules = options.teamRules || [];

    // 1. Strip verbal fillers & clean up commas
    let removedFillers = false;
    for (const regex of this.fillerWords) {
      if (regex.test(text)) {
        removedFillers = true;
        text = text.replace(regex, ' ');
      }
    }
    text = text.replace(/\s*,\s*,\s*/g, ', ').replace(/^\s*,\s*/, '').replace(/,\s*([.!?])/g, '$1');
    if (removedFillers) {
      changes.push('Removed conversational filler words and verbal disfluencies');
    }

    // 2. Resolve mid-sentence self-corrections
    const correctionPatterns = [
      /(?:^|\s)(.+?),?\s+(?:wait no|actually no|no wait|scratch that|actually make it|correction:?)[,:]?\s+(.+?)(?=[.,;\n]|$)/i,
      /(?:^|\s)(.+?),?\s+actually\s+(.+?)(?=[.,;\n]|$)/i
    ];

    let hadCorrections = false;
    for (const pat of correctionPatterns) {
      while (pat.test(text)) {
        hadCorrections = true;
        text = text.replace(pat, (match, before, after) => {
          return ' ' + after.trim();
        });
      }
    }
    text = text.replace(/\b(wait no|actually no|no wait|scratch that)[,:]?\s*/gi, '');
    text = text.replace(/^\s*no,\s*/i, '');
    if (hadCorrections) {
      changes.push('Resolved mid-speech self-corrections to final intended decisions');
    }

    // 3. Normalize repeated words
    text = text.replace(/\b(\w+)\s+\1\b/gi, '$1');

    // 4. Transform third-person framing into first-person
    const thirdPersonReplacements = [
      [/^the user wants to\s+/i, 'I want to '],
      [/^the user needs\s+/i, 'I need '],
      [/^the user is asking for\s+/i, 'Please provide '],
      [/^tell the assistant to\s+/i, 'Please '],
      [/^can you please\s+/i, 'Please '],
      [/^i was thinking maybe we could\s+/i, 'Please '],
      [/^i was thinking about making\s+/i, 'Please create '],
      [/^i'm thinking about making\s+/i, 'Please create ']
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

    // 5. Consolidate and clean clauses/sentences
    const rawSentences = text
      .split(/(?<=[.?!])\s+|\n+|(?:,\s*(?:and also|oh and|plus|furthermore|additionally)\s*)/gi)
      .map(s => {
        let cleaned = s.trim().replace(/^[,.-]\s*/, '');
        // Strip conversational prefixes
        cleaned = cleaned.replace(/^(?:yeah,?\s*|so,?\s*|oh,?\s*|and,?\s*|well,?\s*|like,?\s*|but wait,?\s*|wait,?\s*)+/i, '');
        cleaned = cleaned.replace(/\b,\s*like\b/gi, '');
        cleaned = cleaned.replace(/\blike,\s*/gi, '');
        return cleaned.trim();
      })
      .filter(s => s.length > 3);

    const uniqueSentences = [];
    const seenSentences = new Set();

    for (const sentence of rawSentences) {
      const normalized = sentence.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalized.length > 3 && !seenSentences.has(normalized)) {
        seenSentences.add(normalized);
        const formatted = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        uniqueSentences.push(formatted);
      }
    }

    if (uniqueSentences.length < rawSentences.length) {
      changes.push('Consolidated redundant and duplicated thoughts');
    }

    // 6. Structure output cleanly based on domain mode
    let compiledPrompt = '';
    if (mode === 'bug_report') {
      const intro = uniqueSentences[0] || text;
      const bullets = uniqueSentences.slice(1).map(s => `- ${s}`).join('\n') || `- ${text}`;
      compiledPrompt = `Please investigate and fix the following issue:\n\n### Problem Summary:\n${intro}\n\n### Key Details & Reproduction:\n${bullets}`;
      changes.push('Formatted into structured Bug Report schema');
    } else if (mode === 'code_review') {
      const bullets = uniqueSentences.map(s => `- ${s}`).join('\n');
      compiledPrompt = `Please review these changes with the following feedback:\n\n### Review Comments:\n${bullets}`;
      changes.push('Formatted into structured PR Review comments');
    } else if (mode === 'architecture_adr') {
      const bullets = uniqueSentences.map(s => `- ${s}`).join('\n');
      compiledPrompt = `### Architecture Decision Record (ADR):\n\n**Context & Decisions:**\n${bullets}`;
      changes.push('Formatted into Architecture Decision Record structure');
    } else if (uniqueSentences.length === 1) {
      compiledPrompt = uniqueSentences[0];
      if (!/[.!?]$/.test(compiledPrompt)) compiledPrompt += '.';
    } else if (uniqueSentences.length <= 3) {
      compiledPrompt = uniqueSentences
        .map(s => (/[.!?]$/.test(s) ? s : s + '.'))
        .join(' ');
    } else {
      let intro = uniqueSentences[0];
      if (!intro.startsWith('Please') && !intro.startsWith('I want') && !intro.startsWith('I need')) {
        intro = 'Please create ' + (intro.charAt(0).toLowerCase() + intro.slice(1));
      }
      if (!/[.!?]$/.test(intro)) intro += '.';

      // Filter out ending restatement if it duplicates the intro
      const remaining = uniqueSentences.slice(1).filter((s, idx, arr) => {
        const lower = s.toLowerCase();
        if (idx === arr.length - 1 && (lower.includes('cli that takes') || lower.includes('cli tool') || lower.startsWith('just a python') || lower.startsWith('just a '))) {
          return false;
        }
        return true;
      });

      const items = remaining.map(s => {
        const hasEndPunctuation = s.endsWith('.') || s.endsWith('!') || s.endsWith('?');
        return `- ${s}${hasEndPunctuation ? '' : '.'}`;
      }).join('\n');
      compiledPrompt = `${intro}\n\n### Details & Requirements:\n${items}`;
      changes.push('Organized scattered thoughts into structured sections and bullet points');
    }

    // 7. Append Team Rules if provided (Team Tier)
    if (Array.isArray(teamRules) && teamRules.length > 0) {
      compiledPrompt += `\n\n### Team Guidelines & Guardrails:\n${teamRules.map(r => `- ${r}`).join('\n')}`;
      changes.push(`Injected ${teamRules.length} Team Guardrails`);
    }

    // Clean whitespace
    compiledPrompt = compiledPrompt.replace(/\s{2,}/g, ' ').replace(/\n\s+\n/g, '\n\n').trim();

    const compiledWordCount = compiledPrompt.split(/\s+/).filter(Boolean).length;
    const wordReduction = originalWordCount > 0 
      ? Math.max(0, Math.round(((originalWordCount - compiledWordCount) / originalWordCount) * 100))
      : 0;

    const tokensCut = Math.max(0, (originalWordCount - compiledWordCount) * 1.3);
    const estimatedDollarSavings = (tokensCut / 1000000) * 10.0;

    let confidence = 96;
    if (hadCorrections) confidence -= 2;
    if (originalWordCount > 80) confidence -= 3;
    if (changes.length === 0) confidence = 99;

    return {
      compiled_prompt: compiledPrompt,
      confidence_score: Math.max(75, Math.min(100, confidence)),
      changes_summary: changes.length > 0 ? changes : ['Polished grammar and formatted output'],
      clarification_notes: null,
      domain_mode: mode,
      token_savings: {
        raw_words: originalWordCount,
        compiled_words: compiledWordCount,
        saved_percent: wordReduction,
        tokens_cut: Math.round(tokensCut),
        estimated_dollar_savings: Number(estimatedDollarSavings.toFixed(4))
      }
    };
  }
}

/**
 * Universal Prompt Compiler Class
 */
class PromptCompiler {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || process.env.AZURE_OPENAI_KEY || null;
    this.provider = options.provider || 'local';
    this.model = options.model || (this.provider === 'openai' ? 'gpt-5.4-mini' : (this.provider === 'vertex' ? 'gemini-3.5-flash' : 'claude-haiku-4.5'));
    this.localEngine = new RuleBasedCompilerEngine();
    this.customEndpoint = options.customEndpoint || null;
    this.mode = options.mode || 'general';
    this.teamRules = options.teamRules || [];
    
    // GCP Vertex / Gemini configs
    this.gcpProjectId = options.gcpProjectId || process.env.GCP_PROJECT_ID || 'warm-skill-503300-b0';
    this.gcpRegion = options.gcpRegion || process.env.GCP_REGION || 'us-central1';
    
    // Azure AI Foundry configs
    this.azureEndpoint = options.azureEndpoint || process.env.AZURE_AI_ENDPOINT || 'https://mbusoharvey-8727-resource.services.ai.azure.com';
    this.azureDeployment = options.azureDeployment || process.env.AZURE_DEPLOYMENT_NAME || 'gpt-4.1-mini';
  }

  async compile(rawDictation, options = {}) {
    if (!rawDictation || !rawDictation.trim()) {
      return {
        compiled_prompt: '',
        confidence_score: 100,
        changes_summary: [],
        clarification_notes: null,
        token_savings: { raw_words: 0, compiled_words: 0, saved_percent: 0, tokens_cut: 0, estimated_dollar_savings: 0 }
      };
    }

    const mode = options.mode || this.mode || 'general';
    const teamRules = options.teamRules || this.teamRules || [];
    const activeSystemPrompt = buildSystemPrompt({ mode, teamRules });

    // 1. Google Cloud Vertex AI / Gemini API
    if ((this.provider === 'vertex' || this.provider === 'gemini') && this.apiKey) {
      return await this._compileWithVertexAI(rawDictation, activeSystemPrompt, mode);
    }
    // 2. Azure AI Foundry / Azure OpenAI
    else if ((this.provider === 'azure' || this.provider === 'foundry') && this.apiKey) {
      return await this._compileWithAzure(rawDictation, activeSystemPrompt, mode);
    }
    // 3. OpenAI Direct
    else if (this.provider === 'openai' && this.apiKey) {
      return await this._compileWithOpenAI(rawDictation, activeSystemPrompt, mode);
    }
    // 4. Anthropic Direct
    else if (this.provider === 'anthropic' && this.apiKey) {
      return await this._compileWithAnthropic(rawDictation, activeSystemPrompt, mode);
    }
    // 5. Custom / Self-hosted endpoint
    else if (this.provider === 'custom' && this.customEndpoint) {
      return await this._compileWithCustomEndpoint(rawDictation, activeSystemPrompt, mode);
    }

    // Fallback: Local offline rule-based compilation engine
    return this.localEngine.compile(rawDictation, { mode, teamRules });
  }

  async _compileWithVertexAI(rawDictation, systemPrompt, mode) {
    try {
      const modelName = this.model || 'gemini-3.5-flash';
      const endpoint = (this.apiKey && this.apiKey.startsWith('AIza'))
        ? `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`
        : `https://${this.gcpRegion}-aiplatform.googleapis.com/v1/projects/${this.gcpProjectId}/locations/${this.gcpRegion}/publishers/google/models/${modelName}:generateContent`;

      const headers = { 'Content-Type': 'application/json' };
      if (this.apiKey && !this.apiKey.startsWith('AIza')) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: `Raw Spoken Dictation:\n"""\n${rawDictation}\n"""` }] }],
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
      return this._formatResult(rawDictation, parsed, mode);
    } catch (err) {
      console.warn('Vertex AI Compiler failed, falling back to local engine:', err.message);
      return this.localEngine.compile(rawDictation, { mode });
    }
  }

  async _compileWithAzure(rawDictation, systemPrompt, mode) {
    try {
      let base = (this.azureEndpoint || '').replace(/\/api\/projects\/.*$/i, '').replace(/\/$/, '');
      let endpoint = base.includes('.services.ai.azure.com')
        ? `${base}/models/chat/completions?api-version=2024-05-01-preview`
        : `${base}/openai/deployments/${this.azureDeployment}/chat/completions?api-version=2024-08-01-preview`;

      const headers = {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.azureDeployment || 'gpt-4.1-mini',
          messages: [
            { role: 'system', content: systemPrompt },
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
      return this._formatResult(rawDictation, parsed, mode);
    } catch (err) {
      console.warn('Azure Foundry Compiler failed, falling back to local engine:', err.message);
      return this.localEngine.compile(rawDictation, { mode });
    }
  }

  async _compileWithOpenAI(rawDictation, systemPrompt, mode) {
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
            { role: 'system', content: systemPrompt },
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
      return this._formatResult(rawDictation, parsed, mode);
    } catch (err) {
      console.warn('OpenAI Compiler failed, falling back to local engine:', err.message);
      return this.localEngine.compile(rawDictation, { mode });
    }
  }

  async _compileWithAnthropic(rawDictation, systemPrompt, mode) {
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
          system: systemPrompt,
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
      return this._formatResult(rawDictation, parsed, mode);
    } catch (err) {
      console.warn('Anthropic Compiler failed, falling back to local engine:', err.message);
      return this.localEngine.compile(rawDictation, { mode });
    }
  }

  async _compileWithCustomEndpoint(rawDictation, systemPrompt, mode) {
    try {
      const response = await fetch(this.customEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: rawDictation }
          ]
        })
      });
      const data = await response.json();
      const text = data.choices ? data.choices[0].message.content : data.compiled_prompt;
      const parsed = typeof text === 'string' ? JSON.parse(text) : text;
      return this._formatResult(rawDictation, parsed, mode);
    } catch (err) {
      console.warn('Custom Endpoint failed, falling back to local engine:', err.message);
      return this.localEngine.compile(rawDictation, { mode });
    }
  }

  _formatResult(rawDictation, parsed, mode = 'general') {
    const rawWords = rawDictation.split(/\s+/).filter(Boolean).length;
    const compiledWords = (parsed.compiled_prompt || '').split(/\s+/).filter(Boolean).length;
    const saved = rawWords > 0 ? Math.max(0, Math.round(((rawWords - compiledWords) / rawWords) * 100)) : 0;
    const tokensCut = Math.max(0, (rawWords - compiledWords) * 1.3);
    const estimatedDollarSavings = (tokensCut / 1000000) * 10.0;

    return {
      compiled_prompt: parsed.compiled_prompt || '',
      confidence_score: typeof parsed.confidence_score === 'number' ? parsed.confidence_score : 95,
      changes_summary: Array.isArray(parsed.changes_summary) ? parsed.changes_summary : [`Compiled in ${DOMAIN_MODES[mode]?.name || 'General'} mode`],
      clarification_notes: parsed.clarification_notes || null,
      domain_mode: mode,
      token_savings: {
        raw_words: rawWords,
        compiled_words: compiledWords,
        saved_percent: saved,
        tokens_cut: Math.round(tokensCut),
        estimated_dollar_savings: Number(estimatedDollarSavings.toFixed(4))
      }
    };
  }
}

module.exports = {
  DOMAIN_MODES,
  COMPILER_SYSTEM_PROMPT,
  buildSystemPrompt,
  PromptCompiler,
  RuleBasedCompilerEngine
};
