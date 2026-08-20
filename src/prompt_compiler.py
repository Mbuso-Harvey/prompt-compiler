"""
Prompt Compiler — Python Reference Implementation & SDK
A lightweight compilation layer between natural speech/dictation and LLMs.
"""

import re
from typing import Dict, Any, List, Optional

COMPILER_SYSTEM_PROMPT = """You are the Prompt Compiler. Your sole responsibility is to act as a precision compiler between the user's raw, spoken dictation and the receiving Large Language Model (LLM).

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

### OUTPUT FORMAT:
Respond with a JSON object matching this schema:
{
  "compiled_prompt": "string",
  "confidence_score": 95,
  "changes_summary": ["string"],
  "clarification_notes": null
}"""


class PromptCompiler:
    """Local rule-based compiler & LLM wrapper for prompt compilation."""

    FILLER_PATTERNS = [
        r'\b(um|uh|er|ah|umm|uhh)\b',
        r'\b(you know|like I said|as I was saying|let me think|let\'s see)\b',
        r'\b(sort of|kind of|basically|literally|honestly)\b'
    ]

    def __init__(self, api_key: Optional[str] = None, provider: str = 'local'):
        self.api_key = api_key
        self.provider = provider

    def compile(self, raw_text: str) -> Dict[str, Any]:
        """Compiles raw speech/dictation into a refined first-person prompt."""
        if not raw_text or not raw_text.strip():
            return {
                "compiled_prompt": "",
                "confidence_score": 100,
                "changes_summary": ["Empty input"],
                "clarification_notes": None,
                "token_savings": {"raw_words": 0, "compiled_words": 0, "saved_percent": 0}
            }

        text = raw_text.strip()
        raw_words = len(text.split())
        changes: List[str] = []

        # 1. Strip verbal fillers
        for pat in self.FILLER_PATTERNS:
            if re.search(pat, text, flags=re.IGNORECASE):
                text = re.sub(pat, ' ', text, flags=re.IGNORECASE)
                changes.append("Removed conversational filler words")

        # Clean dangling commas
        text = re.sub(r'\s*,\s*,\s*', ', ', text)
        text = re.sub(r'^\s*,\s*', '', text)

        # 2. Resolve mid-speech self-corrections
        correction_pat = r'(?:^|\s)(.+?),?\s+(?:wait no|actually no|no wait|scratch that|actually make it)\s+(.+?)(?=[.,;\n]|$)'
        if re.search(correction_pat, text, flags=re.IGNORECASE):
            text = re.sub(correction_pat, r' \2', text, flags=re.IGNORECASE)
            changes.append("Resolved mid-speech self-corrections")

        text = re.sub(r'^\s*no,\s*', '', text, flags=re.IGNORECASE)

        # 3. Third person to first person conversion
        third_person_maps = [
            (r'^the user wants to\s+', 'I want to '),
            (r'^the user needs\s+', 'I need '),
            (r'^the user is asking for\s+', 'Please provide '),
            (r'^tell the assistant to\s+', 'Please '),
            (r'^can you please\s+', 'Please ')
        ]
        for pattern, repl in third_person_maps:
            if re.search(pattern, text, flags=re.IGNORECASE):
                text = re.sub(pattern, repl, text, flags=re.IGNORECASE)
                changes.append("Enforced first-person perspective")

        # 4. Clean extra spaces
        text = re.sub(r'\s+', ' ', text).strip()
        if text and not text[-1] in '.!?':
            text += '.'

        compiled_words = len(text.split())
        saved_pct = round(((raw_words - compiled_words) / raw_words) * 100) if raw_words > 0 else 0

        return {
            "compiled_prompt": text,
            "confidence_score": 96,
            "changes_summary": list(set(changes)) or ["Refined grammar and normalized tone"],
            "clarification_notes": None,
            "token_savings": {
                "raw_words": raw_words,
                "compiled_words": compiled_words,
                "saved_percent": max(0, saved_pct)
            }
        }


if __name__ == '__main__':
    compiler = PromptCompiler()
    sample = "Um, uh, the user wants to implement a payment gateway, actually no, let's use Stripe Checkout."
    res = compiler.compile(sample)
    print("--- RAW DICTATION ---")
    print(sample)
    print("\n--- COMPILED PROMPT ---")
    print(res["compiled_prompt"])
    print(f"Confidence: {res['confidence_score']}% | Changes: {res['changes_summary']}")
