/**
 * Prompt Compiler — Browser Extension Content Script
 * Injects a lightweight compilation layer directly into LLM chat boxes (ChatGPT, Claude, Gemini, etc.)
 */

(function () {
  console.log('⚡ Prompt Compiler extension initialized');

  // Rule-based heuristic compiler for zero-network instantaneous offline use
  const FILLER_PATTERNS = [
    /\b(um|uh|er|ah|umm|uhh)\b/gi,
    /\b(you know|like I said|as I was saying|let me think|let's see)\b/gi,
    /\b(sort of|kind of|basically|literally|honestly)\b/gi
  ];

  function compileLocally(rawText) {
    if (!rawText || !rawText.trim()) return rawText;
    let text = rawText.trim();

    // 1. Strip fillers
    for (const regex of FILLER_PATTERNS) {
      text = text.replace(regex, ' ');
    }
    text = text.replace(/\s*,\s*,\s*/g, ', ').replace(/^\s*,\s*/, '');

    // 2. Resolve self-corrections
    const correctionPat = /(?:^|\s)(.+?),?\s+(?:wait no|actually no|no wait|scratch that|actually make it)\s+(.+?)(?=[.,;\n]|$)/gi;
    text = text.replace(correctionPat, ' $2');
    text = text.replace(/^\s*no,\s*/i, '');

    // 3. Convert 3rd person to 1st person
    const thirdPerson = [
      [/^the user wants to\s+/i, 'I want to '],
      [/^the user needs\s+/i, 'I need '],
      [/^the user is asking for\s+/i, 'Please provide '],
      [/^tell the assistant to\s+/i, 'Please '],
      [/^can you please\s+/i, 'Please ']
    ];
    for (const [pat, repl] of thirdPerson) {
      text = text.replace(pat, repl);
    }

    text = text.replace(/\s{2,}/g, ' ').trim();
    if (text && !/[.!?]$/.test(text)) text += '.';
    return text;
  }

  // Inject floating button when user is focused on a prompt textarea or contenteditable div
  document.addEventListener('focusin', (e) => {
    const target = e.target;
    if (target.matches('textarea, [contenteditable="true"]')) {
      attachCompilerButton(target);
    }
  });

  function attachCompilerButton(inputElem) {
    if (document.getElementById('prompt-compiler-widget')) return;

    const btn = document.createElement('button');
    btn.id = 'prompt-compiler-widget';
    btn.innerHTML = '✨ Compile Voice/Prompt';
    btn.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 30px;
      z-index: 999999;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: all 0.2s ease;
    `;

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });

    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const currentText = inputElem.value !== undefined ? inputElem.value : inputElem.innerText;
      if (!currentText || !currentText.trim()) {
        alert('Please type or dictate your raw prompt first.');
        return;
      }
      const compiled = compileLocally(currentText);
      if (inputElem.value !== undefined) {
        inputElem.value = compiled;
      } else {
        inputElem.innerText = compiled;
      }
      btn.innerHTML = '✅ Compiled!';
      setTimeout(() => {
        btn.innerHTML = '✨ Compile Voice/Prompt';
      }, 1800);
    });

    document.body.appendChild(btn);
  }
})();
