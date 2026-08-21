const vscode = require('vscode');

const COMPILER_SYSTEM_PROMPT = `You are the Prompt Compiler. Your sole responsibility is to act as a precision compiler between the user's raw, spoken dictation and the receiving Large Language Model (LLM).

### STRICT RULES:
1. FIRST-PERSON VOICE MANDATE: Output MUST ALWAYS be written from the user's first-person perspective ("I want...", "I need...", "Please build...", "Do not..."). NEVER use meta-commentary ("The user wants...").
2. PRESERVE INTENT & ZERO HALLUCINATED ADDITIONS: Compile the user's thinking; DO NOT think on the user's behalf or add unrequested suggestions.
3. CLEANUP DISFLUENCIES & REPETITION: Strip out filler words ("um", "uh", "you know"), resolve mid-speech corrections, and remove duplicates.
4. STRUCTURE: Use paragraphs/markdown bullets for clarity while preserving all constraints and details.

Respond strictly with a JSON object:
{
  "compiled_prompt": "string",
  "confidence_score": number,
  "changes_summary": ["string"]
}`;

function compileThoughtStreamLocally(rawText) {
  if (!rawText || !rawText.trim()) return rawText;
  let text = rawText.trim();

  // 1. Strip fillers
  const fillers = [
    /\b(um|uh|er|ah|umm|uhh)\b/gi,
    /\b(you know|like I said|as I was saying|let me think|let's see)\b/gi,
    /\b(sort of|kind of|basically|literally|honestly)\b/gi
  ];
  for (const f of fillers) text = text.replace(f, ' ');
  text = text.replace(/\s*,\s*,\s*/g, ', ').replace(/^\s*,\s*/, '');

  // 2. Resolve self-corrections
  text = text.replace(/(?:^|\s)(.+?),?\s+(?:wait no|actually no|no wait|scratch that|actually make it)\s+(.+?)(?=[.,;\n]|$)/gi, ' $2');
  text = text.replace(/^\s*no,\s*/i, '');

  // 3. Normalize to first person
  const thirdPerson = [
    [/^the user wants to\s+/i, 'I want to '],
    [/^the user needs\s+/i, 'I need '],
    [/^the user is asking for\s+/i, 'Please provide '],
    [/^tell the assistant to\s+/i, 'Please '],
    [/^can you please\s+/i, 'Please ']
  ];
  for (const [p, r] of thirdPerson) text = text.replace(p, r);

  text = text.replace(/\s{2,}/g, ' ').trim();
  if (text && !/[.!?]$/.test(text)) text += '.';
  return text;
}

async function compileWithRemoteLLM(rawText, config) {
  const provider = config.get('provider', 'local');
  const apiKey = config.get('apiKey', '');
  const endpoint = config.get('endpoint', '');
  const model = config.get('model', 'gpt-4.1-mini');

  if (provider === 'local' || !apiKey) {
    return { compiled_prompt: compileThoughtStreamLocally(rawText), confidence: 98, source: 'local' };
  }

  try {
    // 1. Azure AI Foundry
    if (provider === 'azure') {
      let base = endpoint.replace(/\/api\/projects\/.*$/i, '').replace(/\/$/, '');
      const url = base.includes('.services.ai.azure.com')
        ? `${base}/models/chat/completions?api-version=2024-05-01-preview`
        : `${base}/openai/deployments/${model}/chat/completions?api-version=2024-08-01-preview`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: COMPILER_SYSTEM_PROMPT },
            { role: 'user', content: rawText }
          ],
          response_format: { type: 'json_object' }
        })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return { compiled_prompt: parsed.compiled_prompt, confidence: parsed.confidence_score || 95, source: 'azure' };
    }

    // 2. GCP Vertex AI / Gemini Direct
    if (provider === 'vertex') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-3.5-flash'}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: COMPILER_SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: rawText }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsed = JSON.parse(text);
      return { compiled_prompt: parsed.compiled_prompt, confidence: parsed.confidence_score || 95, source: 'vertex' };
    }
  } catch (err) {
    console.warn('Remote compilation failed, falling back to local engine:', err.message);
  }

  return { compiled_prompt: compileThoughtStreamLocally(rawText), confidence: 95, source: 'local fallback' };
}

function activate(context) {
  // 1. Status Bar Item for 1-click access
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.command = 'promptCompiler.compileDictation';
  statusBar.text = '$(sparkle) Compile Prompt';
  statusBar.tooltip = 'Prompt Compiler: Refine speech dictation into first-person prompt (Ctrl+Alt+V)';
  statusBar.show();
  context.subscriptions.push(statusBar);

  // 2. Command: Compile Dictation
  let compileCommand = vscode.commands.registerCommand('promptCompiler.compileDictation', async () => {
    const raw = await vscode.window.showInputBox({
      title: 'Prompt Compiler — Speech Dictation & Thought Stream',
      prompt: 'Speak or paste your raw thought stream / dictation:',
      placeHolder: 'e.g., Um, let\'s create a fast REST API for user auth, actually no, let\'s make it GraphQL...'
    });

    if (!raw || !raw.trim()) return;

    const config = vscode.workspace.getConfiguration('promptCompiler');
    const showReview = config.get('showReviewDiff', true);

    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Prompt Compiler: Refining thought stream...',
      cancellable: false
    }, async () => {
      const result = await compileWithRemoteLLM(raw, config);
      const compiled = result.compiled_prompt;

      if (showReview) {
        const choice = await vscode.window.showInformationMessage(
          `✨ [Confidence: ${result.confidence}%] Compiled:\n"${compiled}"`,
          { modal: false },
          'Insert into Editor / Chat',
          'Copy to Clipboard',
          'Edit Before Sending'
        );

        if (choice === 'Insert into Editor / Chat') {
          await insertPrompt(compiled);
        } else if (choice === 'Copy to Clipboard') {
          await vscode.env.clipboard.writeText(compiled);
          vscode.window.showInformationMessage('📋 Copied compiled prompt to clipboard.');
        } else if (choice === 'Edit Before Sending') {
          const edited = await vscode.window.showInputBox({
            title: 'Edit Compiled Prompt',
            value: compiled
          });
          if (edited) await insertPrompt(edited);
        }
      } else {
        await insertPrompt(compiled);
      }
    });
  });

  // 3. Command: Configure Settings
  let configCommand = vscode.commands.registerCommand('promptCompiler.configureSettings', async () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'promptCompiler');
  });

  context.subscriptions.push(compileCommand, configCommand);
}

async function insertPrompt(text) {
  await vscode.env.clipboard.writeText(text);

  // If editor is open, insert directly at cursor
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    await editor.edit(editBuilder => {
      editBuilder.insert(editor.selection.active, text);
    });
  }

  vscode.window.showInformationMessage(`✨ Inserted and copied to clipboard: "${text.substring(0, 50)}..."`);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};

