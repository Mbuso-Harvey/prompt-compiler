const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="en" data-theme="system">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prompt Compiler — Speech-to-Prompt Layer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #f8fafc;
      --bg-secondary: #ffffff;
      --bg-card: #ffffff;
      --bg-input: #f1f5f9;
      --bg-compiled: #f8fafc;
      --border-color: #e2e8f0;
      --border-focus: #2563eb;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --header-bg: rgba(255, 255, 255, 0.9);
      --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      --gradient-bg: radial-gradient(circle at 50% 0%, #dbeafe 0%, #f8fafc 70%);
      --brand-gradient: linear-gradient(to right, #0f172a, #2563eb);
      --badge-bg: rgba(37, 99, 235, 0.08);
      --badge-border: rgba(37, 99, 235, 0.2);
      --badge-color: #2563eb;
      --sent-bg: #f8fafc;
      --sent-border: #cbd5e1;
      --sent-text: #0f172a;

      --accent-blue: #2563eb;
      --accent-cyan: #06b6d4;
      --accent-purple: #7c3aed;
      --accent-green: #059669;
      --accent-amber: #d97706;
      --accent-red: #dc2626;
      --radius: 12px;
      --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        --bg-primary: #0b0f19;
        --bg-secondary: #131b2e;
        --bg-card: #1a233a;
        --bg-input: #0e1526;
        --bg-compiled: #0d1527;
        --border-color: #24304f;
        --border-focus: #3b82f6;
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
        --header-bg: rgba(11, 15, 25, 0.9);
        --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        --gradient-bg: radial-gradient(circle at 50% 0%, #172554 0%, #0b0f19 70%);
        --brand-gradient: linear-gradient(to right, #ffffff, #93c5fd);
        --badge-bg: rgba(59, 130, 246, 0.15);
        --badge-border: rgba(59, 130, 246, 0.3);
        --badge-color: #93c5fd;
        --sent-bg: #090e1a;
        --sent-border: #1e293b;
        --sent-text: #e2e8f0;
        --accent-blue: #3b82f6;
        --accent-purple: #8b5cf6;
      }
    }

    [data-theme="dark"] {
      --bg-primary: #0b0f19;
      --bg-secondary: #131b2e;
      --bg-card: #1a233a;
      --bg-input: #0e1526;
      --bg-compiled: #0d1527;
      --border-color: #24304f;
      --border-focus: #3b82f6;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --header-bg: rgba(11, 15, 25, 0.9);
      --card-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      --gradient-bg: radial-gradient(circle at 50% 0%, #172554 0%, #0b0f19 70%);
      --brand-gradient: linear-gradient(to right, #ffffff, #93c5fd);
      --badge-bg: rgba(59, 130, 246, 0.15);
      --badge-border: rgba(59, 130, 246, 0.3);
      --badge-color: #93c5fd;
      --sent-bg: #090e1a;
      --sent-border: #1e293b;
      --sent-text: #e2e8f0;
      --accent-blue: #3b82f6;
      --accent-purple: #8b5cf6;
    }

    [data-theme="light"] {
      --bg-primary: #f8fafc;
      --bg-secondary: #ffffff;
      --bg-card: #ffffff;
      --bg-input: #f1f5f9;
      --bg-compiled: #f8fafc;
      --border-color: #e2e8f0;
      --border-focus: #2563eb;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --header-bg: rgba(255, 255, 255, 0.9);
      --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      --gradient-bg: radial-gradient(circle at 50% 0%, #dbeafe 0%, #f8fafc 70%);
      --brand-gradient: linear-gradient(to right, #0f172a, #2563eb);
      --badge-bg: rgba(37, 99, 235, 0.08);
      --badge-border: rgba(37, 99, 235, 0.2);
      --badge-color: #2563eb;
      --sent-bg: #f8fafc;
      --sent-border: #cbd5e1;
      --sent-text: #0f172a;
      --accent-blue: #2563eb;
      --accent-purple: #7c3aed;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--gradient-bg);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    header {
      padding: 0.85rem 2rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--header-bg);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
      transition: var(--transition);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 16px rgba(37, 99, 235, 0.3);
    }

    .brand-icon svg {
      width: 20px;
      height: 20px;
      fill: white;
    }

    .brand h1 {
      font-size: 1.2rem;
      font-weight: 700;
      background: var(--brand-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand span {
      font-size: 0.75rem;
      color: var(--badge-color);
      margin-left: 0.5rem;
      padding: 2px 8px;
      border-radius: 12px;
      background: var(--badge-bg);
      border: 1px solid var(--badge-border);
      font-weight: 600;
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .selector-group {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 4px 10px;
      border-radius: 20px;
    }

    .selector-group label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .selector-select {
      background: transparent;
      border: none;
      color: var(--text-main);
      font-size: 0.8rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
    }

    .selector-select option {
      background: var(--bg-card);
      color: var(--text-main);
    }

    .compiler-toggle-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--bg-secondary);
      padding: 5px 12px;
      border-radius: 30px;
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: var(--transition);
      user-select: none;
    }

    .compiler-toggle-wrap:hover {
      border-color: var(--accent-blue);
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 38px;
      height: 20px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e1;
      transition: var(--transition);
      border-radius: 20px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: var(--transition);
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: var(--accent-blue);
      box-shadow: 0 0 10px rgba(37, 99, 235, 0.4);
    }

    input:checked + .slider:before {
      transform: translateX(18px);
    }

    .toggle-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .tier-badge-group {
      display: flex;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 2px;
    }

    .tier-btn {
      padding: 3px 10px;
      border-radius: 16px;
      border: none;
      background: transparent;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      color: var(--text-muted);
      transition: var(--transition);
    }

    .tier-btn.active {
      background: var(--accent-blue);
      color: white;
    }

    .tier-btn.pro.active {
      background: linear-gradient(135deg, var(--accent-purple), #6366f1);
    }

    .tier-btn.team.active {
      background: linear-gradient(135deg, var(--accent-green), #0d9488);
    }

    main {
      flex: 1;
      max-width: 1120px;
      width: 100%;
      margin: 0 auto;
      padding: 1.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .roi-dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .roi-stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 0.85rem 1.15rem;
      display: flex;
      align-items: center;
      gap: 0.85rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }

    .roi-stat-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      background: var(--badge-bg);
      color: var(--badge-color);
    }

    .roi-stat-info {
      display: flex;
      flex-direction: column;
    }

    .roi-stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .roi-stat-value {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .mode-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .mode-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: var(--transition);
    }

    .mode-chip:hover {
      border-color: var(--accent-blue);
      color: var(--accent-blue);
    }

    .mode-chip.active {
      background: var(--badge-bg);
      border-color: var(--accent-blue);
      color: var(--accent-blue);
      box-shadow: 0 0 10px rgba(37, 99, 235, 0.15);
    }

    .cards-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
      box-shadow: var(--card-shadow);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: var(--transition);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-main);
    }

    .view-segmented-control {
      display: flex;
      background: var(--bg-input);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .segment-btn {
      padding: 5px 14px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .segment-btn.active {
      background: var(--accent-blue);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
    }

    textarea {
      width: 100%;
      height: 170px;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1rem;
      color: var(--text-main);
      font-family: inherit;
      font-size: 0.95rem;
      line-height: 1.6;
      resize: vertical;
      transition: var(--transition);
    }

    textarea:focus {
      outline: none;
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .compiled-view-box {
      width: 100%;
      min-height: 170px;
      background: var(--bg-compiled);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 1.25rem;
      font-size: 0.92rem;
      line-height: 1.7;
      color: var(--text-main);
      white-space: pre-wrap;
      overflow-y: auto;
      font-family: 'JetBrains Mono', monospace;
    }

    .meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--bg-secondary);
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .confidence-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.12);
      color: var(--accent-green);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }

    .team-rules-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.85rem 1rem;
      display: none;
    }

    .team-rules-card.active {
      display: block;
    }

    .team-rules-header {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--accent-green);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .team-rules-list {
      list-style-type: disc;
      padding-left: 1.25rem;
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .controls-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .mic-btn-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .mic-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: var(--bg-secondary);
      color: var(--text-main);
      border: 1px solid var(--border-color);
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      transition: var(--transition);
    }

    .mic-btn:hover {
      border-color: var(--accent-blue);
    }

    .mic-btn.recording {
      background: rgba(220, 38, 38, 0.15);
      border-color: var(--accent-red);
      color: var(--accent-red);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
      100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
    }

    .action-btn-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 9px 20px;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      border: none;
    }

    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-main);
      border: 1px solid var(--border-color);
    }

    .btn-primary {
      background: var(--accent-blue);
      color: white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }

    .btn-compile {
      background: var(--accent-purple);
      color: white;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
    }

    .sent-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 1.5rem;
      display: none;
      box-shadow: var(--card-shadow);
    }

    .sent-card.active {
      display: block;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .changes-list {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .changes-list li:before {
      content: "✓ ";
      color: var(--accent-green);
      font-weight: bold;
    }

    footer {
      text-align: center;
      padding: 1.5rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="brand-icon">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
      </div>
      <div>
        <h1>Prompt Compiler</h1>
      </div>
      <span id="tierBadge">PRO PLAN</span>
    </div>

    <div class="header-controls">
      <!-- Tier Switcher -->
      <div class="tier-badge-group">
        <button class="tier-btn" id="tierBtnFree" onclick="setTier('free')">Free ($0)</button>
        <button class="tier-btn pro active" id="tierBtnPro" onclick="setTier('pro')">💎 Pro ($5/mo)</button>
        <button class="tier-btn team" id="tierBtnTeam" onclick="setTier('team')">🏢 Team ($15/seat)</button>
      </div>

      <!-- Backend Model Selector -->
      <div class="selector-group">
        <label for="modelSelect">🤖 Model:</label>
        <select id="modelSelect" class="selector-select" onchange="onModelChange()">
          <option value="inherit">⚡ Inherit Active LLM (Auto)</option>
          <option value="gpt-4.1-mini" selected>GPT-4.1 Mini (Azure AI Foundry)</option>
          <option value="gemini-3.5-flash">Gemini 3.5 Flash (GCP Vertex)</option>
          <option value="gemini-3.1-flash">Gemini 3.1 Flash (GCP Vertex)</option>
          <option value="claude-haiku-4.5">Claude Haiku 4.5 (Fast)</option>
          <option value="local-rule">Local Offline Engine ($0)</option>
        </select>
      </div>

      <!-- Theme Selector -->
      <div class="selector-group">
        <label for="themeSelect">🎨 Theme:</label>
        <select id="themeSelect" class="selector-select" onchange="onThemeChange()">
          <option value="system" selected>🖥️ System</option>
          <option value="light">☀️ Light</option>
          <option value="dark">🌙 Dark</option>
        </select>
      </div>

      <!-- Compiler Toggle -->
      <div class="compiler-toggle-wrap" onclick="toggleCompilerMode()">
        <span class="toggle-label">Compiler Mode</span>
        <label class="switch">
          <input type="checkbox" id="compilerToggle" checked>
          <span class="slider"></span>
        </label>
      </div>
    </div>
  </header>

  <main>
    <!-- Real-time Token & Dollar Savings ROI Dashboard -->
    <div class="roi-dashboard">
      <div class="roi-stat-card">
        <div class="roi-stat-icon">📉</div>
        <div class="roi-stat-info">
          <span class="roi-stat-label">Total Tokens Cut</span>
          <span class="roi-stat-value" id="roiTokensCut">12,450 tokens</span>
        </div>
      </div>
      <div class="roi-stat-card">
        <div class="roi-stat-icon">💰</div>
        <div class="roi-stat-info">
          <span class="roi-stat-label">Estimated Model $ Saved</span>
          <span class="roi-stat-value" id="roiDollarsSaved" style="color: var(--accent-green);">$3.74 saved</span>
        </div>
      </div>
      <div class="roi-stat-card">
        <div class="roi-stat-icon">🎯</div>
        <div class="roi-stat-info">
          <span class="roi-stat-label">Average Noise Reduction</span>
          <span class="roi-stat-value" id="roiAvgNoise">38.5% cut</span>
        </div>
      </div>
      <div class="roi-stat-card">
        <div class="roi-stat-icon">🛡️</div>
        <div class="roi-stat-info">
          <span class="roi-stat-label">Active Guardrails</span>
          <span class="roi-stat-value" id="roiGuardrailsCount">3 Team Rules</span>
        </div>
      </div>
    </div>

    <!-- Pro Domain Modes Selector -->
    <div class="mode-bar">
      <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); margin-right: 4px;">Mode:</span>
      <button class="mode-chip active" onclick="setDomainMode('general', this)">⚡ General Prompt</button>
      <button class="mode-chip" onclick="setDomainMode('code_refactor', this)">🛠️ Code & Refactor (Pro)</button>
      <button class="mode-chip" onclick="setDomainMode('code_review', this)">🔍 PR Review (Pro)</button>
      <button class="mode-chip" onclick="setDomainMode('architecture_adr', this)">🏗️ Architecture ADR (Pro)</button>
      <button class="mode-chip" onclick="setDomainMode('bug_report', this)">🐞 Bug Report (Pro)</button>
      <button class="mode-chip" onclick="setDomainMode('sql_data', this)">📊 SQL & Database (Pro)</button>
    </div>

    <div class="cards-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <span id="cardTitleText">Dictation & Compilation Stage</span>
          </div>

          <div class="view-segmented-control" id="segmentedControl">
            <button class="segment-btn active" id="btnTabCompiled" onclick="switchView('compiled')">
              <span>✨ Compiled</span>
            </button>
            <button class="segment-btn" id="btnTabOriginal" onclick="switchView('original')">
              <span>🎙️ Original</span>
            </button>
          </div>
        </div>

        <div class="input-area-wrapper">
          <textarea id="rawInput" placeholder="Start speaking or type your raw thought stream here... (e.g. 'Um, hey, so I was thinking maybe we could make a script to...')" style="display: none;"></textarea>
          <div id="compiledView" class="compiled-view-box" contenteditable="true" spellcheck="false">
            <em>Your compiled first-person prompt will appear here once compiled. Click 'Compile Now' or start dictation.</em>
          </div>
        </div>

        <!-- Team Rules Display Box (Visible when Team Tier is active) -->
        <div class="team-rules-card" id="teamRulesCard">
          <div class="team-rules-header">
            <span>🏢 Active Team Guardrails (Injected into Prompt):</span>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Workspace: Engineering-Core</span>
          </div>
          <ul class="team-rules-list">
            <li>Strict TypeScript (no <code>any</code>) & typed API returns</li>
            <li>Unit tests with Vitest must accompany all new endpoints</li>
            <li>Validate all incoming HTTP request payloads with Zod</li>
          </ul>
        </div>

        <div class="meta-bar" id="metaBar">
          <div class="confidence-badge" id="confidenceBadge">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            <span id="confidenceValue">Confidence: 98%</span>
          </div>

          <div style="font-size: 0.82rem; color: var(--text-muted);">
            Reduction: <strong id="savingsValue" style="color: var(--accent-blue);">0% noise cut</strong>
          </div>

          <div style="font-size: 0.82rem; color: var(--text-muted);">
            Estimated Query Savings: <strong id="queryDollarSaved" style="color: var(--accent-green);">$0.00</strong>
          </div>

          <div style="font-size: 0.82rem; color: var(--text-muted);">
            Voice: <strong style="color: var(--accent-purple);">First-Person ("I")</strong>
          </div>
        </div>

        <div id="changesBox" style="background: var(--bg-input); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--border-color);">
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">Applied Refinements:</div>
          <ul class="changes-list" id="changesList">
            <li>Removed conversational filler & verbal noise</li>
            <li>Consolidated repeated ideas & structured with markdown</li>
          </ul>
        </div>

        <div class="controls-row">
          <div class="mic-btn-group">
            <button class="mic-btn" id="micBtn" onclick="toggleSpeechRecognition()">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
              <span id="micBtnText">Dictate Speech</span>
            </button>
            <button class="btn btn-secondary" onclick="clearInput()">Clear</button>
          </div>

          <div class="action-btn-group">
            <button class="btn btn-compile" id="compileBtn" onclick="triggerCompilation()">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/></svg>
              Re-Compile
            </button>
            <button class="btn btn-primary" id="sendBtn" onclick="sendMessage()">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
              Send to LLM
            </button>
          </div>
        </div>
      </div>

      <div class="sent-card" id="sentCard">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: var(--accent-blue);">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            Prompt Dispatched to Target LLM
          </div>
          <span style="font-size: 0.8rem; color: var(--text-muted);" id="sentTimestamp"></span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">The message received by the task-executing model:</div>
        <div id="dispatchedPrompt" style="background: var(--sent-bg); padding: 1rem; border-radius: 8px; border: 1px solid var(--sent-border); font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; white-space: pre-wrap; color: var(--sent-text);"></div>
      </div>
    </div>
  </main>

  <footer>
    Prompt Compiler &bull; Speech-to-Prompt Layer &bull; Free Tier ($0) &bull; Pro Tier ($5/mo) &bull; Team Tier ($15/seat/mo)
  </footer>

  <script>
    let currentView = 'compiled';
    let compilerEnabled = true;
    let currentTier = 'pro';
    let currentMode = 'general';
    let recognition = null;
    let isRecording = false;

    let cumulativeTokensCut = 12450;
    let cumulativeDollarsSaved = 3.74;

    const teamGuardrails = [
      "Strict TypeScript (no any) & typed API returns",
      "Unit tests with Vitest must accompany all new endpoints",
      "Validate all incoming HTTP request payloads with Zod"
    ];

    function setTier(tier) {
      currentTier = tier;
      document.querySelectorAll('.tier-btn').forEach(btn => btn.classList.remove('active'));
      const badge = document.getElementById('tierBadge');
      const teamRulesCard = document.getElementById('teamRulesCard');

      if (tier === 'free') {
        document.getElementById('tierBtnFree').classList.add('active');
        badge.innerText = 'FREE PLAN';
        badge.style.background = 'rgba(100, 116, 139, 0.15)';
        badge.style.color = '#94a3b8';
        teamRulesCard.classList.remove('active');
      } else if (tier === 'pro') {
        document.getElementById('tierBtnPro').classList.add('active');
        badge.innerText = 'PRO PLAN ($5/mo)';
        badge.style.background = 'rgba(124, 58, 237, 0.15)';
        badge.style.color = '#a78bfa';
        teamRulesCard.classList.remove('active');
      } else if (tier === 'team') {
        document.getElementById('tierBtnTeam').classList.add('active');
        badge.innerText = 'TEAM PLAN ($15/seat)';
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
        badge.style.color = '#34d399';
        teamRulesCard.classList.add('active');
      }
      triggerCompilation();
    }

    function setDomainMode(mode, element) {
      currentMode = mode;
      document.querySelectorAll('.mode-chip').forEach(c => c.classList.remove('active'));
      element.classList.add('active');
      triggerCompilation();
    }

    function initTheme() {
      const savedTheme = localStorage.getItem('prompt_compiler_theme') || 'system';
      const themeSelect = document.getElementById('themeSelect');
      if (themeSelect) themeSelect.value = savedTheme;
      applyTheme(savedTheme);
    }

    function onThemeChange() {
      const selected = document.getElementById('themeSelect').value;
      localStorage.setItem('prompt_compiler_theme', selected);
      applyTheme(selected);
    }

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }

    function onModelChange() {
      triggerCompilation();
    }

    const samples = {
      1: "Uh, hey so I'm thinking about making a script... wait, actually a CLI tool in Python. It needs to parse CSV files. Um, yeah, take a CSV file of customer records and, like, find duplicate emails. But wait, emails might have different cases like uppercase or lowercase, so make sure it ignores case. Oh, and also trim spaces around the email. And if it finds duplicates, don't delete them, just output a new CSV with the duplicate rows flagged in a new column called 'is_duplicate'. Let's use argparse for the CLI arguments. Yeah, so just a Python CLI that takes input file path and output file path."
    };

    function initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;

      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        document.getElementById('rawInput').value = transcript;
        if (compilerEnabled) triggerCompilationDebounced();
      };

      recognition.onerror = () => stopRecording();
      recognition.onend = () => stopRecording();
    }

    function toggleSpeechRecognition() {
      if (!recognition) initSpeechRecognition();
      if (!recognition) {
        alert('Voice dictation is supported in modern browsers. You can also type directly in the field.');
        return;
      }
      if (isRecording) {
        recognition.stop();
        stopRecording();
      } else {
        recognition.start();
        isRecording = true;
        const btn = document.getElementById('micBtn');
        btn.classList.add('recording');
        document.getElementById('micBtnText').innerText = 'Listening... (Speak naturally)';
      }
    }

    function stopRecording() {
      isRecording = false;
      const btn = document.getElementById('micBtn');
      btn.classList.remove('recording');
      document.getElementById('micBtnText').innerText = 'Dictate Speech';
      if (compilerEnabled) triggerCompilation();
    }

    function toggleCompilerMode() {
      compilerEnabled = document.getElementById('compilerToggle').checked;
      const segmented = document.getElementById('segmentedControl');
      const metaBar = document.getElementById('metaBar');
      const changesBox = document.getElementById('changesBox');
      const compileBtn = document.getElementById('compileBtn');

      if (!compilerEnabled) {
        segmented.style.opacity = '0.4';
        segmented.style.pointerEvents = 'none';
        metaBar.style.display = 'none';
        changesBox.style.display = 'none';
        compileBtn.style.display = 'none';
        switchView('original');
      } else {
        segmented.style.opacity = '1';
        segmented.style.pointerEvents = 'auto';
        metaBar.style.display = 'flex';
        changesBox.style.display = 'block';
        compileBtn.style.display = 'inline-flex';
        switchView('compiled');
        triggerCompilation();
      }
    }

    function switchView(tab) {
      currentView = tab;
      const btnCompiled = document.getElementById('btnTabCompiled');
      const btnOriginal = document.getElementById('btnTabOriginal');
      const rawInput = document.getElementById('rawInput');
      const compiledView = document.getElementById('compiledView');

      if (tab === 'compiled') {
        btnCompiled.classList.add('active');
        btnOriginal.classList.remove('active');
        rawInput.style.display = 'none';
        compiledView.style.display = 'block';
      } else {
        btnOriginal.classList.add('active');
        btnCompiled.classList.remove('active');
        compiledView.style.display = 'none';
        rawInput.style.display = 'block';
        rawInput.focus();
      }
    }

    function clearInput() {
      document.getElementById('rawInput').value = '';
      document.getElementById('compiledView').innerHTML = '<em>Your compiled first-person prompt will appear here once compiled.</em>';
      document.getElementById('sentCard').classList.remove('active');
      document.getElementById('changesList').innerHTML = '<li>Cleared input</li>';
      document.getElementById('confidenceValue').innerText = 'Confidence: 100%';
      document.getElementById('savingsValue').innerText = '0% noise cut';
      document.getElementById('queryDollarSaved').innerText = '$0.00';
    }

    let debounceTimer;
    function triggerCompilationDebounced() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(triggerCompilation, 600);
    }

    async function triggerCompilation() {
      const rawText = document.getElementById('rawInput').value;
      if (!rawText.trim()) return;

      const model = document.getElementById('modelSelect').value;
      const payload = {
        raw_text: rawText,
        model: model,
        mode: currentMode,
        team_rules: currentTier === 'team' ? teamGuardrails : []
      };

      try {
        const response = await fetch('/api/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await response.json();

        document.getElementById('compiledView').innerText = data.compiled_prompt;
        document.getElementById('confidenceValue').innerText = 'Confidence: ' + data.confidence_score + '%';
        document.getElementById('savingsValue').innerText = data.token_savings.saved_percent + '% noise cut';
        document.getElementById('queryDollarSaved').innerText = '$' + data.token_savings.estimated_dollar_savings;

        // Update cumulative ROI
        cumulativeTokensCut += (data.token_savings.tokens_cut || 0);
        cumulativeDollarsSaved += (data.token_savings.estimated_dollar_savings || 0);
        document.getElementById('roiTokensCut').innerText = cumulativeTokensCut.toLocaleString() + ' tokens';
        document.getElementById('roiDollarsSaved').innerText = '$' + cumulativeDollarsSaved.toFixed(2) + ' saved';

        const changesList = document.getElementById('changesList');
        changesList.innerHTML = '';
        data.changes_summary.forEach(change => {
          const li = document.createElement('li');
          li.innerText = change;
          changesList.appendChild(li);
        });

        if (currentView !== 'compiled') switchView('compiled');
      } catch (err) {
        console.error('Compilation failed:', err);
      }
    }

    function sendMessage() {
      const messageToSend = compilerEnabled
        ? document.getElementById('compiledView').innerText
        : document.getElementById('rawInput').value;

      if (!messageToSend.trim()) {
        alert('Please dictate or enter a prompt first.');
        return;
      }

      const card = document.getElementById('sentCard');
      document.getElementById('dispatchedPrompt').innerText = messageToSend;
      document.getElementById('sentTimestamp').innerText = new Date().toLocaleTimeString();
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth' });
    }

    window.addEventListener('DOMContentLoaded', () => {
      initTheme();
      initSpeechRecognition();
      document.getElementById('rawInput').value = samples[1];
      triggerCompilation();
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'index.html'), htmlContent, 'utf8');
console.log('✅ Successfully generated public/index.html with ROI dashboard and tier management');
