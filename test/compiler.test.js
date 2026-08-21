const assert = require('assert');
const { PromptCompiler, RuleBasedCompilerEngine, DOMAIN_MODES, buildSystemPrompt } = require('../src/compiler');

async function runTests() {
  console.log('🧪 Starting Prompt Compiler Comprehensive Test Suite...\n');
  const engine = new RuleBasedCompilerEngine();

  // Test 1: First person voice enforcement
  console.log('Test 1: Converts third-person meta language to direct first person prompt');
  const input1 = "The user wants to create a function that sorts an array of numbers in ascending order.";
  const res1 = engine.compile(input1);
  assert.ok(res1.compiled_prompt.startsWith('I want to') || res1.compiled_prompt.startsWith('Please'), 'Must be in first person');
  assert.ok(!res1.compiled_prompt.includes('The user wants to'), 'Must not contain third person meta phrasing');
  console.log('  ✅ Passed:', res1.compiled_prompt);

  // Test 2: Strips disfluencies and verbal noise
  console.log('\nTest 2: Strips disfluencies, filler words (um, uh, you know)');
  const input2 = "Um, uh, basically I want to add a login button, you know, at the top right header.";
  const res2 = engine.compile(input2);
  assert.ok(!res2.compiled_prompt.toLowerCase().includes('um'), 'Must not contain "um"');
  assert.ok(!res2.compiled_prompt.toLowerCase().includes('you know'), 'Must not contain "you know"');
  assert.ok(res2.compiled_prompt.includes('login button'), 'Must preserve the login button requirement');
  console.log('  ✅ Passed:', res2.compiled_prompt);

  // Test 3: Resolves mid-speech corrections
  console.log('\nTest 3: Handles mid-speech self corrections');
  const input3 = "Let's use PostgreSQL for the database, actually no, let's use SQLite.";
  const res3 = engine.compile(input3);
  assert.ok(res3.compiled_prompt.includes('SQLite'), 'Must contain final decision SQLite');
  console.log('  ✅ Passed:', res3.compiled_prompt);

  // Test 4: Preserves requirements & structures long dictations
  console.log('\nTest 4: Multi-requirement dictation structure and token savings');
  const input4 = "I need a REST API endpoint for user profile updates. And also ensure email format validation. Plus enforce password minimum length 12 characters.";
  const res4 = engine.compile(input4);
  assert.ok(res4.compiled_prompt.includes('REST API'), 'Must include REST API');
  assert.ok(res4.confidence_score >= 80, 'Confidence score should be reasonable');
  console.log('  ✅ Passed:', res4.compiled_prompt);
  console.log('  📊 Token Savings:', res4.token_savings);

  // Test 5: Pro Tier Domain Mode (Bug Report)
  console.log('\nTest 5: [PRO TIER] Domain Mode specialization (Bug Report Mode)');
  const input5 = "The login modal fails when submitting with empty email, it should show red error border instead of crashing the page.";
  const res5 = engine.compile(input5, { mode: 'bug_report' });
  assert.ok(res5.compiled_prompt.includes('Problem Summary:'), 'Must structure as bug report');
  console.log('  ✅ Passed:', res5.compiled_prompt);

  // Test 6: Team Tier Rules Injection
  console.log('\nTest 6: [TEAM TIER] Team Rules & Guardrails Injection');
  const input6 = "Create an express router for payment checkout.";
  const teamRules = [
    "Strict TypeScript typing required (no any)",
    "Unit tests with Vitest must accompany all routes",
    "Security: Validate all request bodies with Zod"
  ];
  const res6 = engine.compile(input6, { mode: 'code_refactor', teamRules });
  assert.ok(res6.compiled_prompt.includes('Team Guidelines & Guardrails:'), 'Must include team guidelines section');
  assert.ok(res6.compiled_prompt.includes('Strict TypeScript'), 'Must contain rule 1');
  assert.ok(res6.compiled_prompt.includes('Vitest'), 'Must contain rule 2');
  assert.ok(res6.compiled_prompt.includes('Zod'), 'Must contain rule 3');
  console.log('  ✅ Passed:', res6.compiled_prompt);

  // Test 7: Empty input handling
  console.log('\nTest 7: Handles empty input gracefully');
  const res7 = engine.compile('');
  assert.strictEqual(res7.compiled_prompt, '');
  assert.strictEqual(res7.confidence_score, 100);
  console.log('  ✅ Passed');

  console.log('\n🎉 ALL 7 TEST SUITES PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
