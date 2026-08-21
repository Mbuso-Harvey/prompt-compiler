const fs = require('fs');
const path = require('path');

const fullUiScript = `<!DOCTYPE html>
<html lang="en" data-theme="system">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prompt Compiler — Speech-to-Prompt Pre-flight Layer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    /* ==========================================================================
       GitHub Copilot / Linear / Raycast Clean Design System
       ========================================================================== */
    :root {
      --bg-canvas: #f8fafc;
      --bg-surface: #ffffff;
      --bg-subtle: #f1f5f9;
      --bg-hover: #e2e8f0;
      --border: #e2e8f0;
      --border-focus: #0969da;
      
      --text-main: #0f172a;
      --text-muted: #64748b;
      --text-faint: #94a3b8;
      
      --accent: #0969da;
      --accent-subtle: #eff6ff;
      --accent-green: #10b981;
      --accent-green-subtle: #ecfdf5;
      --accent-purple: #8b5cf6;
      --accent-purple-subtle: #f5f3ff;
      --accent-red: #ef4444;
      
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 16px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04);
      --shadow-lg: 0 10px 30px -4px rgba(0, 0, 0, 0.12);
      --modal-backdrop: rgba(15, 23, 42, 0.5);
      
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 14px;
      --radius-full: 9999px;
      
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
      --transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        --bg-canvas: #090d16;
        --bg-surface: #0f172a;
        --bg-subtle: #1e293b;
        --bg-hover: #334155;
        --border: #1e293b;
        --border-focus: #38bdf8;
        
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
        --text-faint: #64748b;
        
        --accent: #38bdf8;
        --accent-subtle: rgba(56, 189, 248, 0.12);
        --accent-green: #34d399;
        --accent-green-subtle: rgba(52, 211, 153, 0.12);
        --accent-purple: #a78bfa;
        --accent-purple-subtle: rgba(167, 139, 250, 0.12);
        --modal-backdrop: rgba(0, 0, 0, 0.7);
        
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
        --shadow-md: 0 4px 16px -2px rgba(0, 0, 0, 0.4);
        --shadow-lg: 0 10px 30px -4px rgba(0, 0, 0, 0.6);
      }
    }

    [data-theme="dark"] {
      --bg-canvas: #090d16;
      --bg-surface: #0f172a;
      --bg-subtle: #1e293b;
      --bg-hover: #334155;
      --border: #1e293b;
      --border-focus: #38bdf8;
      
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --text-faint: #64748b;
      
      --accent: #38bdf8;
      --accent-subtle: rgba(56, 189, 248, 0.12);
      --accent-green: #34d399;
      --accent-green-subtle: rgba(52, 211, 153, 0.12);
      --accent-purple: #a78bfa;
      --accent-purple-subtle: rgba(167, 139, 250, 0.12);
      --modal-backdrop: rgba(0, 0, 0, 0.7);
      
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
      --shadow-md: 0 4px 16px -2px rgba(0, 0, 0, 0.4);
      --shadow-lg: 0 10px 30px -4px rgba(0, 0, 0, 0.6);
    }

    [data-theme="light"] {
      --bg-canvas: #f8fafc;
      --bg-surface: #ffffff;
      --bg-subtle: #f1f5f9;
      --bg-hover: #e2e8f0;
      --border: #e2e8f0;
      --border-focus: #0969da;
      
      --text-main: #0f172a;
      --text-muted: #64748b;
      --text-faint: #94a3b8;
      
      --accent: #0969da;
      --accent-subtle: #eff6ff;
      --accent-green: #10b981;
      --accent-green-subtle: #ecfdf5;
      --accent-purple: #8b5cf6;
      --accent-purple-subtle: #f5f3ff;
      --modal-backdrop: rgba(15, 23, 42, 0.5);
      
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 16px -2px rgba(0, 0, 0, 0.08);
      --shadow-lg: 0 10px 30px -4px rgba(0, 0, 0, 0.12);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      background-color: var(--bg-canvas);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* Top Navigation Header */
    header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      padding: 0.65rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      user-select: none;
    }

    .brand-icon {
      width: 26px;
      height: 26px;
      border-radius: var(--radius-sm);
      background: var(--text-main);
      color: var(--bg-surface);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand h1 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    .brand-plan-badge {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 2px 7px;
      border-radius: var(--radius-full);
      background: var(--accent-purple-subtle);
      color: var(--accent-purple);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-nav {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 5px 9px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--bg-surface);
      color: var(--text-main);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      font-family: inherit;
    }

    .btn-nav:hover {
      background: var(--bg-subtle);
    }

    .btn-nav kbd {
      font-size: 0.65rem;
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 3px;
      padding: 1px 4px;
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    /* Dropdown Trigger */
    .dropdown {
      position: relative;
      display: inline-block;
    }

    .dropdown-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 5px 9px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--bg-surface);
      color: var(--text-main);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      font-family: inherit;
    }

    .dropdown-btn:hover {
      background: var(--bg-subtle);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 200px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      padding: 6px;
      display: none;
      z-index: 100;
      animation: menuFade 0.15s ease-out;
    }

    .dropdown-menu.show {
      display: block;
    }

    @keyframes menuFade {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dropdown-header {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-faint);
      padding: 4px 8px;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 6px 8px;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      color: var(--text-main);
      font-size: 0.75rem;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition: var(--transition);
      font-family: inherit;
    }

    .dropdown-item:hover {
      background: var(--bg-subtle);
    }

    .dropdown-item.active {
      color: var(--accent);
      font-weight: 600;
    }

    /* Minimal Switch */
    .switch-wrap {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
      user-select: none;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--bg-surface);
    }

    .switch-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 28px;
      height: 16px;
    }

    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: var(--border);
      transition: var(--transition);
      border-radius: var(--radius-full);
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 10px;
      width: 10px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: var(--transition);
      border-radius: 50%;
    }
    input:checked + .slider { background-color: var(--accent); }
    input:checked + .slider:before { transform: translateX(12px); }

    /* Main Container */
    main {
      max-width: 860px;
      width: 100%;
      margin: 2.25rem auto 1.5rem;
      padding: 0 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      flex: 1;
    }

    /* Single Unified Copilot Composer Card */
    .composer-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: var(--transition);
    }

    .composer-card:focus-within {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px var(--accent-subtle), var(--shadow-md);
    }

    /* Top Bar inside Composer */
    .composer-header {
      padding: 0.65rem 1.15rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-subtle);
    }

    .view-segmented {
      display: inline-flex;
      background: var(--bg-surface);
      padding: 2px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }

    .view-btn {
      padding: 3px 10px;
      border-radius: 4px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      font-family: inherit;
    }

    .view-btn.active {
      background: var(--bg-subtle);
      color: var(--text-main);
    }

    .composer-stats {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    .confidence-pill {
      font-weight: 700;
      color: var(--accent-green);
      background: var(--accent-green-subtle);
      padding: 2px 7px;
      border-radius: var(--radius-full);
    }

    /* Editor / Output Area */
    .composer-body {
      padding: 1.15rem;
      min-height: 190px;
    }

    textarea.composer-input {
      width: 100%;
      height: 190px;
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--font-sans);
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text-main);
      resize: vertical;
    }

    .composer-compiled-view {
      width: 100%;
      min-height: 190px;
      max-height: 460px;
      outline: none;
      background: transparent;
      font-family: var(--font-mono);
      font-size: 0.88rem;
      line-height: 1.65;
      color: var(--text-main);
      white-space: pre-wrap;
      overflow-y: auto;
    }

    /* Team Rules Banner inside Composer (if active) */
    .team-rules-inline {
      margin: 0 1.15rem 0.65rem;
      padding: 0.45rem 0.75rem;
      background: var(--accent-green-subtle);
      border-radius: var(--radius-sm);
      font-size: 0.72rem;
      color: var(--accent-green);
      display: none;
    }

    .team-rules-inline.active {
      display: block;
    }

    /* Bottom Control Bar inside Composer */
    .composer-footer {
      padding: 0.6rem 1.15rem;
      border-top: 1px solid var(--border);
      background: var(--bg-surface);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .footer-left, .footer-right {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .btn-icon {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 5px 9px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--bg-surface);
      color: var(--text-main);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition);
      font-family: inherit;
    }

    .btn-icon:hover {
      background: var(--bg-subtle);
    }

    .btn-icon.recording {
      background: #fef2f2;
      border-color: #ef4444;
      color: #dc2626;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 5px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--accent);
      background: var(--accent);
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      font-family: inherit;
    }

    .btn-primary:hover {
      filter: brightness(1.08);
    }

    /* Subtle Sent/Dispatched Feedback Box */
    .dispatch-box {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 0.85rem 1.15rem;
      display: none;
      box-shadow: var(--shadow-sm);
    }

    .dispatch-box.active {
      display: block;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dispatch-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--accent);
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.4rem;
    }

    .dispatch-content {
      background: var(--bg-subtle);
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: 0.82rem;
      color: var(--text-main);
      white-space: pre-wrap;
    }

    /* ==========================================================================
       MODALS & COMMAND PALETTE (Raycast & Linear style)
       ========================================================================== */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: var(--modal-backdrop);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease-out;
    }

    .modal-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }

    .modal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 640px;
      max-height: 85vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: scale(0.98);
      transition: transform 0.15s ease-out;
    }

    .modal-overlay.active .modal-card {
      transform: scale(1);
    }

    .modal-header {
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-subtle);
    }

    .modal-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      padding: 4px;
      border-radius: 4px;
    }

    .btn-close:hover {
      color: var(--text-main);
      background: var(--bg-hover);
    }

    .modal-body {
      padding: 1.25rem;
      overflow-y: auto;
      flex: 1;
    }

    /* Command Palette Specific */
    .palette-input-wrap {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .palette-input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-size: 0.95rem;
      font-family: var(--font-sans);
      color: var(--text-main);
    }

    .palette-list {
      max-height: 340px;
      overflow-y: auto;
      padding: 6px;
    }

    .palette-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-main);
      transition: var(--transition);
    }

    .palette-item:hover, .palette-item.selected {
      background: var(--bg-subtle);
      color: var(--accent);
    }

    .palette-item-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Tabbed Settings Modal */
    .settings-layout {
      display: grid;
      grid-template-columns: 160px 1fr;
      min-height: 380px;
    }

    .settings-sidebar {
      border-right: 1px solid var(--border);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      background: var(--bg-subtle);
    }

    .settings-tab-btn {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
    }

    .settings-tab-btn:hover {
      background: var(--bg-hover);
      color: var(--text-main);
    }

    .settings-tab-btn.active {
      background: var(--bg-surface);
      color: var(--text-main);
      box-shadow: var(--shadow-sm);
    }

    .settings-content {
      padding: 1.25rem;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 0.35rem;
    }

    .form-input {
      width: 100%;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: var(--bg-surface);
      color: var(--text-main);
      font-size: 0.8rem;
      font-family: var(--font-mono);
      outline: none;
    }

    .form-input:focus {
      border-color: var(--border-focus);
    }

    .form-help {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    footer {
      text-align: center;
      padding: 1.5rem;
      font-size: 0.75rem;
      color: var(--text-faint);
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="brand-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>
      </div>
      <h1>Prompt Compiler</h1>
      <span class="brand-plan-badge" id="planBadge">PRO</span>
    </div>

    <div class="header-actions">
      <!-- Command Palette Trigger -->
      <button class="btn-nav" onclick="openModal('commandPaletteModal')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>Actions</span>
        <kbd>⌘K</kbd>
      </button>

      <!-- History & Macros Trigger -->
      <button class="btn-nav" onclick="openModal('historyModal')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
        <span>History</span>
      </button>

      <!-- Analytics Trigger -->
      <button class="btn-nav" onclick="openModal('analyticsModal')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        <span>ROI Stats</span>
      </button>

      <!-- Plan Selector Dropdown -->
      <div class="dropdown">
        <button class="dropdown-btn" onclick="toggleDropdown('planDropdown', event)">
          <span id="selectedPlanLabel">Plan: Pro ($5/mo)</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="dropdown-menu" id="planDropdown">
          <div class="dropdown-header">Select Plan Tier</div>
          <button class="dropdown-item" onclick="selectTier('free', 'Plan: Free ($0)', event)">
            <span>Free ($0)</span>
            <span style="font-size: 0.68rem; color: var(--text-muted);">Offline & BYOK</span>
          </button>
          <button class="dropdown-item active" onclick="selectTier('pro', 'Plan: Pro ($5/mo)', event)">
            <span>Pro ($5/mo)</span>
            <span style="font-size: 0.68rem; color: var(--accent-purple);">Cloud + Modes</span>
          </button>
          <button class="dropdown-item" onclick="selectTier('team', 'Plan: Team ($15/seat)', event)">
            <span>Team ($15/seat)</span>
            <span style="font-size: 0.68rem; color: var(--accent-green);">Guardrails</span>
          </button>
        </div>
      </div>

      <!-- Theme Selector Dropdown -->
      <div class="dropdown">
        <button class="dropdown-btn" onclick="toggleDropdown('themeDropdown', event)">
          <span id="selectedThemeLabel">Theme: System</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="dropdown-menu" id="themeDropdown">
          <div class="dropdown-header">Theme</div>
          <button class="dropdown-item active" onclick="selectTheme('system', 'Theme: System', event)">System Default</button>
          <button class="dropdown-item" onclick="selectTheme('light', 'Theme: Light', event)">Light</button>
          <button class="dropdown-item" onclick="selectTheme('dark', 'Theme: Dark', event)">Dark</button>
        </div>
      </div>

      <!-- Settings Modal Trigger -->
      <button class="btn-nav" onclick="openModal('settingsModal')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>

      <!-- Compiler On/Off Switch -->
      <div class="switch-wrap" onclick="toggleCompilerMode()">
        <span class="switch-label">Compiler</span>
        <label class="switch">
          <input type="checkbox" id="compilerToggle" checked>
          <span class="slider"></span>
        </label>
      </div>
    </div>
  </header>

  <main>
    <!-- Single Unified Composer Card -->
    <div class="composer-card">
      <!-- Composer Header -->
      <div class="composer-header">
        <div class="view-segmented" id="viewToggle">
          <button class="view-btn active" id="btnTabCompiled" onclick="switchView('compiled')">Compiled</button>
          <button class="view-btn" id="btnTabOriginal" onclick="switchView('original')">Original</button>
        </div>

        <div class="composer-stats">
          <span class="confidence-pill" id="confidenceBadge">98% Match</span>
          <span id="noiseCutLabel">38% Cut</span>
          <span id="savingsLabel" style="color: var(--accent-green); font-weight: 600;">$0.00 Saved</span>
        </div>
      </div>

      <!-- Composer Body -->
      <div class="composer-body">
        <textarea id="rawInput" class="composer-input" placeholder="Dictate speech or type your thoughts freely... (e.g., 'Um, so I was thinking we should build a script to clean CSV files, actually no, make it a CLI tool in Python.')" style="display: none;"></textarea>
        <div id="compiledView" class="composer-compiled-view" contenteditable="true" spellcheck="false">
          <em>Your compiled first-person prompt will appear here.</em>
        </div>
      </div>

      <!-- Team Rules Notice (Only visible when Team Plan is active) -->
      <div class="team-rules-inline" id="teamRulesNotice">
        <strong>🏢 Team Guardrails Active:</strong> Strict TypeScript (no <code>any</code>), Vitest test suite, Zod payload validation.
      </div>

      <!-- Composer Footer Toolbar (Integrated Single Bar) -->
      <div class="composer-footer">
        <div class="footer-left">
          <!-- Dictate Button -->
          <button class="btn-icon" id="micBtn" onclick="toggleSpeechRecognition()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            <span id="micBtnText">Dictate</span>
          </button>

          <!-- Domain Mode Dropdown -->
          <div class="dropdown">
            <button class="dropdown-btn" onclick="toggleDropdown('modeDropdown', event)">
              <span id="selectedModeLabel">Mode: General</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="dropdown-menu" id="modeDropdown">
              <div class="dropdown-header">Compilation Mode</div>
              <button class="dropdown-item active" onclick="selectMode('general', 'Mode: General', event)">General Prompt</button>
              <button class="dropdown-item" onclick="selectMode('code_refactor', 'Mode: Code & Refactor', event)">Code & Refactor</button>
              <button class="dropdown-item" onclick="selectMode('code_review', 'Mode: PR Review', event)">PR / Code Review</button>
              <button class="dropdown-item" onclick="selectMode('architecture_adr', 'Mode: Architecture ADR', event)">Architecture ADR</button>
              <button class="dropdown-item" onclick="selectMode('bug_report', 'Mode: Bug Report', event)">Bug Report</button>
              <button class="dropdown-item" onclick="selectMode('sql_data', 'Mode: SQL & Data', event)">SQL & Database</button>
            </div>
          </div>

          <!-- Model Dropdown -->
          <div class="dropdown">
            <button class="dropdown-btn" onclick="toggleDropdown('modelDropdown', event)">
              <span id="selectedModelLabel">Model: GPT-4.1 Mini</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="dropdown-menu" id="modelDropdown">
              <div class="dropdown-header">LLM Engine</div>
              <button class="dropdown-item" onclick="selectModel('inherit', 'Model: Auto (Inherit)', event)">Auto (Inherit LLM)</button>
              <button class="dropdown-item active" onclick="selectModel('gpt-4.1-mini', 'Model: GPT-4.1 Mini', event)">GPT-4.1 Mini (Azure Foundry)</button>
              <button class="dropdown-item" onclick="selectModel('gemini-3.5-flash', 'Model: Gemini 3.5 Flash', event)">Gemini 3.5 Flash (GCP Vertex)</button>
              <button class="dropdown-item" onclick="selectModel('gemini-3.1-flash', 'Model: Gemini 3.1 Flash', event)">Gemini 3.1 Flash (GCP Vertex)</button>
              <button class="dropdown-item" onclick="selectModel('claude-haiku-4.5', 'Model: Claude Haiku 4.5', event)">Claude Haiku 4.5</button>
              <button class="dropdown-item" onclick="selectModel('local-rule', 'Model: Offline Engine', event)">Offline Engine ($0)</button>
            </div>
          </div>

          <!-- Diff Inspector Button -->
          <button class="btn-icon" onclick="openModal('diffModal')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
            <span>Diff Review</span>
          </button>
        </div>

        <div class="footer-right">
          <button class="btn-icon" onclick="clearInput()">Clear</button>
          <button class="btn-icon" id="compileBtn" onclick="triggerCompilation()">Re-Compile</button>
          <button class="btn-primary" id="sendBtn" onclick="sendMessage()">
            <span>Send to LLM</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Dispatch Preview Box (Unfolds upon Send) -->
    <div class="dispatch-box" id="sentCard">
      <div class="dispatch-title">
        <span>Prompt Dispatched to Target LLM</span>
        <span style="font-weight: 500; color: var(--text-faint);" id="sentTimestamp"></span>
      </div>
      <div class="dispatch-content" id="dispatchedPrompt"></div>
    </div>
  </main>

  <!-- =========================================================================
       MODAL 1: COMMAND PALETTE (Cmd+K / Ctrl+K)
       ========================================================================= -->
  <div class="modal-overlay" id="commandPaletteModal" onclick="closeOnBackdrop(event, 'commandPaletteModal')">
    <div class="modal-card" style="max-width: 520px;">
      <div class="palette-input-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="paletteSearch" class="palette-input" placeholder="Type a command or mode... (Press Esc to exit)" oninput="filterPalette()">
      </div>
      <div class="palette-list" id="paletteList">
        <div class="palette-item" onclick="executePalette('mode', 'general')">
          <div class="palette-item-left"><span>⚡</span> Mode: General Prompt</div>
          <kbd>1</kbd>
        </div>
        <div class="palette-item" onclick="executePalette('mode', 'code_refactor')">
          <div class="palette-item-left"><span>🛠️</span> Mode: Code & Refactor (Pro)</div>
          <kbd>2</kbd>
        </div>
        <div class="palette-item" onclick="executePalette('mode', 'code_review')">
          <div class="palette-item-left"><span>🔍</span> Mode: PR Review (Pro)</div>
          <kbd>3</kbd>
        </div>
        <div class="palette-item" onclick="executePalette('mode', 'architecture_adr')">
          <div class="palette-item-left"><span>🏗️</span> Mode: Architecture ADR (Pro)</div>
          <kbd>4</kbd>
        </div>
        <div class="palette-item" onclick="executePalette('mode', 'bug_report')">
          <div class="palette-item-left"><span>🐞</span> Mode: Bug Report (Pro)</div>
          <kbd>5</kbd>
        </div>
        <div class="palette-item" onclick="executePalette('action', 'dictate')">
          <div class="palette-item-left"><span>🎙️</span> Action: Start Voice Dictation</div>
          <kbd>Ctrl+Alt+V</kbd>
        </div>
        <div class="palette-item" onclick="executePalette('action', 'diff')">
          <div class="palette-item-left"><span>🔍</span> Action: Open Diff Inspector</div>
        </div>
        <div class="palette-item" onclick="executePalette('action', 'settings')">
          <div class="palette-item-left"><span>⚙️</span> Action: Open Settings & BYOK Keys</div>
        </div>
        <div class="palette-item" onclick="executePalette('action', 'analytics')">
          <div class="palette-item-left"><span>📊</span> Action: View Token ROI Analytics</div>
        </div>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       MODAL 2: DIFF & REVIEW INSPECTOR
       ========================================================================= -->
  <div class="modal-overlay" id="diffModal" onclick="closeOnBackdrop(event, 'diffModal')">
    <div class="modal-card" style="max-width: 780px;">
      <div class="modal-header">
        <div class="modal-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"/><path d="M8 21H3v-5"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
          Diff & Refinement Inspector
        </div>
        <button class="btn-close" onclick="closeModal('diffModal')">✕</button>
      </div>
      <div class="modal-body" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-faint); margin-bottom: 4px; text-transform: uppercase;">Original Raw Speech</div>
            <div id="diffOriginal" style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.82rem; min-height: 180px; white-space: pre-wrap; font-family: var(--font-mono); border: 1px solid var(--border);"></div>
          </div>
          <div>
            <div style="font-size: 0.72rem; font-weight: 700; color: var(--accent); margin-bottom: 4px; text-transform: uppercase;">Compiled 1st-Person Prompt</div>
            <div id="diffCompiled" style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.82rem; min-height: 180px; white-space: pre-wrap; font-family: var(--font-mono); border: 1px solid var(--border);"></div>
          </div>
        </div>
        <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.75rem; color: var(--text-secondary);" id="diffRefinementsList">
          <strong>Refinements Applied:</strong> Disfluencies stripped, first-person voice standardized.
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <button class="btn-icon" onclick="copyCompiledPrompt()">Copy to Clipboard</button>
          <button class="btn-primary" onclick="closeModal('diffModal'); sendMessage();">Accept & Send ↵</button>
        </div>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       MODAL 3: TABBED SETTINGS & BYOK PREFERENCES
       ========================================================================= -->
  <div class="modal-overlay" id="settingsModal" onclick="closeOnBackdrop(event, 'settingsModal')">
    <div class="modal-card" style="max-width: 720px;">
      <div class="modal-header">
        <div class="modal-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Preferences & BYOK Configuration
        </div>
        <button class="btn-close" onclick="closeModal('settingsModal')">✕</button>
      </div>
      <div class="settings-layout">
        <div class="settings-sidebar">
          <button class="settings-tab-btn active" onclick="switchSettingsTab('modelsTab', this)">Models & BYOK</button>
          <button class="settings-tab-btn" onclick="switchSettingsTab('guardrailsTab', this)">Team Guardrails</button>
          <button class="settings-tab-btn" onclick="switchSettingsTab('audioTab', this)">Audio & Dictation</button>
          <button class="settings-tab-btn" onclick="switchSettingsTab('shortcutsTab', this)">Shortcuts</button>
        </div>
        <div class="settings-content">
          <!-- Models Tab -->
          <div id="modelsTab" class="settings-pane active">
            <div class="form-group">
              <label class="form-label">Azure AI Foundry Endpoint</label>
              <input type="text" class="form-input" id="cfgAzureEndpoint" value="https://mbusoharvey-8727-resource.services.ai.azure.com">
              <div class="form-help">Your Azure AI Foundry resource URL for GPT-4.1 Mini compilation.</div>
            </div>
            <div class="form-group">
              <label class="form-label">Azure API Key (BYOK)</label>
              <input type="password" class="form-input" id="cfgAzureKey" placeholder="Paste your Azure API key...">
            </div>
            <div class="form-group">
              <label class="form-label">GCP Vertex AI Project ID</label>
              <input type="text" class="form-input" id="cfgGcpProject" value="warm-skill-503300-b0">
            </div>
            <div class="form-group">
              <label class="form-label">Gemini API Key (BYOK)</label>
              <input type="password" class="form-input" id="cfgGeminiKey" placeholder="Paste your Gemini / Vertex key...">
            </div>
          </div>

          <!-- Team Guardrails Tab -->
          <div id="guardrailsTab" class="settings-pane" style="display: none;">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--accent-green); margin-bottom: 6px;">Active Team Guardrails (Team Tier: $15/seat)</div>
            <div id="teamRulesConfigList" style="display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-subtle); padding: 6px 10px; border-radius: 4px; font-size: 0.75rem;">
                <span>Strict TypeScript (no any) & typed API returns</span>
                <span style="color: var(--accent-green); font-weight: 600;">Active</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-subtle); padding: 6px 10px; border-radius: 4px; font-size: 0.75rem;">
                <span>Unit tests with Vitest must accompany all new endpoints</span>
                <span style="color: var(--accent-green); font-weight: 600;">Active</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-subtle); padding: 6px 10px; border-radius: 4px; font-size: 0.75rem;">
                <span>Validate all incoming HTTP request payloads with Zod</span>
                <span style="color: var(--accent-green); font-weight: 600;">Active</span>
              </div>
            </div>
          </div>

          <!-- Audio Tab -->
          <div id="audioTab" class="settings-pane" style="display: none;">
            <div class="form-group">
              <label class="form-label">Speech Recognition Engine</label>
              <select class="form-input" style="font-family: var(--font-sans);">
                <option>Browser Web Speech API (Fast & Local)</option>
                <option>Whisper Cloud STT (Pro - High Noise Cancellation)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Language</label>
              <select class="form-input" style="font-family: var(--font-sans);">
                <option>English (United States)</option>
                <option>English (United Kingdom)</option>
                <option>Multilingual Auto-detect</option>
              </select>
            </div>
          </div>

          <!-- Shortcuts Tab -->
          <div id="shortcutsTab" class="settings-pane" style="display: none;">
            <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.78rem;">
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                <span>Start / Stop Dictation</span>
                <kbd>Ctrl+Alt+V</kbd>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                <span>Open Command Palette</span>
                <kbd>⌘K / Ctrl+K</kbd>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                <span>Re-Compile Prompt</span>
                <kbd>Ctrl+R</kbd>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                <span>Send to LLM</span>
                <kbd>Ctrl+Enter</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       MODAL 4: TOKEN & DOLLAR ROI ANALYTICS
       ========================================================================= -->
  <div class="modal-overlay" id="analyticsModal" onclick="closeOnBackdrop(event, 'analyticsModal')">
    <div class="modal-card" style="max-width: 680px;">
      <div class="modal-header">
        <div class="modal-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Token & Dollar ROI Analytics
        </div>
        <button class="btn-close" onclick="closeModal('analyticsModal')">✕</button>
      </div>
      <div class="modal-body">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1.25rem;">
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm);">
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Total Tokens Cut</div>
            <div style="font-size: 1.1rem; font-weight: 700;">14,820 tokens</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm);">
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Estimated Money Saved</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--accent-green);">$4.44 saved</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm);">
            <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Avg Noise Reduction</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--accent);">39.2% cut</div>
          </div>
        </div>
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">Token Savings by Mode</div>
        <div style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.75rem;">
          <div>Code & Refactor (54%) <div style="height: 6px; background: var(--accent); border-radius: 3px; width: 54%;"></div></div>
          <div>Bug Report (26%) <div style="height: 6px; background: var(--accent-purple); border-radius: 3px; width: 26%;"></div></div>
          <div>PR Review (20%) <div style="height: 6px; background: var(--accent-green); border-radius: 3px; width: 20%;"></div></div>
        </div>
      </div>
    </div>
  </div>

  <!-- =========================================================================
       MODAL 5: PROMPT HISTORY & MACRO SNIPPETS
       ========================================================================= -->
  <div class="modal-overlay" id="historyModal" onclick="closeOnBackdrop(event, 'historyModal')">
    <div class="modal-card" style="max-width: 600px;">
      <div class="modal-header">
        <div class="modal-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          Prompt History & Macros
        </div>
        <button class="btn-close" onclick="closeModal('historyModal')">✕</button>
      </div>
      <div class="modal-body">
        <div id="historyList" style="display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem; cursor: pointer;" onclick="loadHistoryItem(this)">
            <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px;">Python CSV Duplicate Email CLI</div>
            <div style="color: var(--text-muted); font-size: 0.72rem;">Please create a Python CLI tool using argparse that identifies duplicate customer email addresses...</div>
          </div>
          <div style="background: var(--bg-subtle); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem; cursor: pointer;" onclick="loadHistoryItem(this)">
            <div style="font-weight: 700; color: var(--accent); margin-bottom: 2px;">Stateless JWT Auth Endpoint</div>
            <div style="color: var(--text-muted); font-size: 0.72rem;">Please implement stateless authentication endpoints with JWT and bcrypt password hashing...</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <footer>
    Prompt Compiler &bull; Pre-flight Speech-to-Prompt Layer
  </footer>

  <script>
    let currentView = 'compiled';
    let compilerEnabled = true;
    let currentTier = 'pro';
    let currentMode = 'general';
    let currentModel = 'gpt-4.1-mini';
    let recognition = null;
    let isRecording = false;

    const teamGuardrails = [
      "Strict TypeScript typing (no any) and explicit API interfaces",
      "Unit tests with Vitest must accompany all new route handlers",
      "Validate all incoming HTTP request bodies using Zod schemas"
    ];

    // Keyboard Shortcuts (Cmd+K, Escape)
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openModal('commandPaletteModal');
      } else if (e.key === 'Escape') {
        closeAllModals();
      }
    });

    window.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
      }
    });

    function openModal(id) {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.add('active');
        if (id === 'commandPaletteModal') {
          setTimeout(() => document.getElementById('paletteSearch').focus(), 50);
        } else if (id === 'diffModal') {
          document.getElementById('diffOriginal').innerText = document.getElementById('rawInput').value;
          document.getElementById('diffCompiled').innerText = document.getElementById('compiledView').innerText;
        }
      }
    }

    function closeModal(id) {
      const modal = document.getElementById(id);
      if (modal) modal.classList.remove('active');
    }

    function closeAllModals() {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    function closeOnBackdrop(e, id) {
      if (e.target.id === id) closeModal(id);
    }

    function toggleDropdown(id, e) {
      if (e) e.stopPropagation();
      const target = document.getElementById(id);
      const isShowing = target.classList.contains('show');
      document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
      if (!isShowing) target.classList.add('show');
    }

    function selectTier(tier, label, e) {
      if (e) e.stopPropagation();
      currentTier = tier;
      document.getElementById('selectedPlanLabel').innerText = label;
      const planBadge = document.getElementById('planBadge');
      const teamRulesNotice = document.getElementById('teamRulesNotice');

      if (tier === 'free') {
        planBadge.innerText = 'FREE';
        teamRulesNotice.classList.remove('active');
      } else if (tier === 'pro') {
        planBadge.innerText = 'PRO';
        teamRulesNotice.classList.remove('active');
      } else if (tier === 'team') {
        planBadge.innerText = 'TEAM';
        teamRulesNotice.classList.add('active');
      }
      document.querySelectorAll('#planDropdown .dropdown-item').forEach(btn => btn.classList.remove('active'));
      if (e && e.currentTarget) e.currentTarget.classList.add('active');
      document.getElementById('planDropdown').classList.remove('show');
      triggerCompilation();
    }

    function selectMode(mode, label, e) {
      if (e) e.stopPropagation();
      currentMode = mode;
      document.getElementById('selectedModeLabel').innerText = label;
      document.querySelectorAll('#modeDropdown .dropdown-item').forEach(btn => btn.classList.remove('active'));
      if (e && e.currentTarget) e.currentTarget.classList.add('active');
      document.getElementById('modeDropdown').classList.remove('show');
      triggerCompilation();
    }

    function selectModel(model, label, e) {
      if (e) e.stopPropagation();
      currentModel = model;
      document.getElementById('selectedModelLabel').innerText = label;
      document.querySelectorAll('#modelDropdown .dropdown-item').forEach(btn => btn.classList.remove('active'));
      if (e && e.currentTarget) e.currentTarget.classList.add('active');
      document.getElementById('modelDropdown').classList.remove('show');
      triggerCompilation();
    }

    function switchSettingsTab(tabId, btn) {
      document.querySelectorAll('.settings-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.settings-pane').forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      const target = document.getElementById(tabId);
      if (target) target.style.display = 'block';
    }

    function executePalette(type, value) {
      closeModal('commandPaletteModal');
      if (type === 'mode') {
        const modeLabels = {
          general: 'Mode: General',
          code_refactor: 'Mode: Code & Refactor',
          code_review: 'Mode: PR Review',
          architecture_adr: 'Mode: Architecture ADR',
          bug_report: 'Mode: Bug Report',
          sql_data: 'Mode: SQL & Data'
        };
        selectMode(value, modeLabels[value] || 'Mode: General');
      } else if (type === 'action') {
        if (value === 'dictate') toggleSpeechRecognition();
        else if (value === 'diff') openModal('diffModal');
        else if (value === 'settings') openModal('settingsModal');
        else if (value === 'analytics') openModal('analyticsModal');
      }
    }

    function filterPalette() {
      const q = document.getElementById('paletteSearch').value.toLowerCase();
      document.querySelectorAll('#paletteList .palette-item').forEach(item => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    }

    function loadHistoryItem(el) {
      const summary = el.querySelector('div:last-child').innerText;
      document.getElementById('rawInput').value = summary;
      closeModal('historyModal');
      triggerCompilation();
    }

    function copyCompiledPrompt() {
      const text = document.getElementById('compiledView').innerText;
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }

    function selectTheme(theme, label, e) {
      if (e) e.stopPropagation();
      document.getElementById('selectedThemeLabel').innerText = label;
      localStorage.setItem('prompt_compiler_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      document.querySelectorAll('#themeDropdown .dropdown-item').forEach(btn => btn.classList.remove('active'));
      if (e && e.currentTarget) e.currentTarget.classList.add('active');
      document.getElementById('themeDropdown').classList.remove('show');
    }

    function initTheme() {
      const savedTheme = localStorage.getItem('prompt_compiler_theme') || 'system';
      document.documentElement.setAttribute('data-theme', savedTheme);
      const label = savedTheme === 'light' ? 'Theme: Light' : (savedTheme === 'dark' ? 'Theme: Dark' : 'Theme: System');
      document.getElementById('selectedThemeLabel').innerText = label;
    }

    const sample = "Uh, hey so I'm thinking about making a script... wait, actually a CLI tool in Python. It needs to parse CSV files. Um, yeah, take a CSV file of customer records and, like, find duplicate emails. But wait, emails might have different cases like uppercase or lowercase, so make sure it ignores case. Oh, and also trim spaces around the email. And if it finds duplicates, don't delete them, just output a new CSV with the duplicate rows flagged in a new column called 'is_duplicate'. Let's use argparse for the CLI arguments. Yeah, so just a Python CLI that takes input file path and output file path.";

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
        document.getElementById('micBtnText').innerText = 'Listening...';
      }
    }

    function stopRecording() {
      isRecording = false;
      const btn = document.getElementById('micBtn');
      btn.classList.remove('recording');
      document.getElementById('micBtnText').innerText = 'Dictate';
      if (compilerEnabled) triggerCompilation();
    }

    function toggleCompilerMode() {
      compilerEnabled = document.getElementById('compilerToggle').checked;
      const viewToggle = document.getElementById('viewToggle');
      const compileBtn = document.getElementById('compileBtn');

      if (!compilerEnabled) {
        viewToggle.style.opacity = '0.4';
        viewToggle.style.pointerEvents = 'none';
        compileBtn.style.display = 'none';
        switchView('original');
      } else {
        viewToggle.style.opacity = '1';
        viewToggle.style.pointerEvents = 'auto';
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
      document.getElementById('compiledView').innerHTML = '<em>Your compiled first-person prompt will appear here.</em>';
      document.getElementById('sentCard').classList.remove('active');
      document.getElementById('confidenceBadge').innerText = '100% Match';
      document.getElementById('noiseCutLabel').innerText = '0% Cut';
      document.getElementById('savingsLabel').innerText = '$0.00 Saved';
    }

    let debounceTimer;
    function triggerCompilationDebounced() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(triggerCompilation, 600);
    }

    async function triggerCompilation() {
      const rawText = document.getElementById('rawInput').value;
      if (!rawText.trim()) return;

      const payload = {
        raw_text: rawText,
        model: currentModel,
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
        document.getElementById('confidenceBadge').innerText = data.confidence_score + '% Match';
        document.getElementById('noiseCutLabel').innerText = data.token_savings.saved_percent + '% Cut';
        document.getElementById('savingsLabel').innerText = '$' + data.token_savings.estimated_dollar_savings + ' Saved';

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
      document.getElementById('rawInput').value = sample;
      triggerCompilation();
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'index.html'), fullUiScript, 'utf8');
console.log('✅ Generated complete tasks list Master UI at public/index.html');
