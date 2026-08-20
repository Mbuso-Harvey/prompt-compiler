const assert = require('assert');
const { PromptCompiler, RuleBasedCompilerEngine } = require('../src/compiler');

async function runTests() {
  console.log('🧪 Starting Prompt Compiler Test Suite...\n');
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

  // Test 5: Empty input handling
  console.log('\nTest 5: Handles empty input gracefully');
  const res5 = engine.compile('');
  assert.strictEqual(res5.compiled_prompt, '');
  assert.strictEqual(res5.confidence_score, 100);
  console.log('  ✅ Passed');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
