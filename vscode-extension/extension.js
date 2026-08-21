const vscode = require('vscode');

function compileThoughtStream(rawText) {
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

function activate(context) {
  let disposable = vscode.commands.registerCommand('promptCompiler.compileDictation', async () => {
    const raw = await vscode.window.showInputBox({
      title: 'Prompt Compiler — Speech Dictation & Thought Stream',
      prompt: 'Speak or paste your raw thought stream / dictation:',
      placeHolder: 'e.g., Um, let\'s write a function to parse CSV, wait no, JSON files...'
    });

    if (raw) {
      const compiled = compileThoughtStream(raw);
      
      // Copy to clipboard
      await vscode.env.clipboard.writeText(compiled);
      
      // Optionally insert into active editor or open chat
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        editor.edit(editBuilder => {
          editBuilder.insert(editor.selection.active, compiled);
        });
      }

      vscode.window.showInformationMessage(`✨ Compiled & copied to clipboard: "${compiled}"`);
    }
  });

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
