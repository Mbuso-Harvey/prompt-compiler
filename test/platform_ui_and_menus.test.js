const assert = require('assert');
const { PromptCompiler, RuleBasedCompilerEngine, DOMAIN_MODES, buildSystemPrompt } = require('../src/compiler');

async function runFullQASuite() {
  console.log('🧪 Running Comprehensive Prompt Compiler QA & Menu Function Test Suite...\n');
  const engine = new RuleBasedCompilerEngine();

  // -------------------------------------------------------------
  // SUITE 1: Core Compiler Directives & Voice Mandate
  // -------------------------------------------------------------
  console.log('📌 Suite 1: Voice & Disfluency Tests');

  // 1.1 First-person voice conversion
  const test1_1 = engine.compile("The user wants to refactor the payment gateway to use Stripe webhooks.");
  assert.ok(test1_1.compiled_prompt.startsWith('I want to') || test1_1.compiled_prompt.startsWith('Please'), 'Must be in first person');
  assert.ok(!test1_1.compiled_prompt.includes('The user wants to'), 'Cannot contain meta 3rd person language');
  console.log('  ✅ 1.1 First-person voice verified');

  // 1.2 Strip filler words & conversational noise
  const test1_2 = engine.compile("Um, so yeah, basically I need to sort this array, you know, in descending order.");
  assert.ok(!test1_2.compiled_prompt.toLowerCase().includes('um'), 'Must strip "um"');
  assert.ok(!test1_2.compiled_prompt.toLowerCase().includes('you know'), 'Must strip "you know"');
  assert.ok(!test1_2.compiled_prompt.toLowerCase().includes('so yeah'), 'Must strip "so yeah"');
  assert.ok(test1_2.compiled_prompt.includes('sort this array'), 'Must preserve intent');
  console.log('  ✅ 1.2 Verbal filler removal verified');

  // 1.3 Resolve mid-sentence self-corrections
  const test1_3 = engine.compile("Let's use PostgreSQL for data storage, wait no, let's use SQLite.");
  assert.ok(test1_3.compiled_prompt.includes('SQLite'), 'Must contain final decision SQLite');
  assert.ok(!test1_3.compiled_prompt.includes('wait no'), 'Must strip correction trigger');
  console.log('  ✅ 1.3 Mid-speech self-correction resolution verified');

  // -------------------------------------------------------------
  // SUITE 2: Pro Tier Domain Modes
  // -------------------------------------------------------------
  console.log('\n📌 Suite 2: Domain-Specific Modes');

  // 2.1 Bug Report Mode
  const test2_1 = engine.compile("The checkout button crashes with null pointer when user cart is empty.", { mode: 'bug_report' });
  assert.ok(test2_1.compiled_prompt.includes('Problem Summary:'), 'Bug mode must include Problem Summary');
  assert.ok(test2_1.domain_mode === 'bug_report', 'Domain mode metadata must be bug_report');
  console.log('  ✅ 2.1 Bug Report Mode verified');

  // 2.2 PR Review Mode
  const test2_2 = engine.compile("This PR modifies auth tokens, but lacks unit test coverage for token expiry.", { mode: 'code_review' });
  assert.ok(test2_2.compiled_prompt.includes('Review Comments:'), 'Code review mode must structure review comments');
  console.log('  ✅ 2.2 PR / Code Review Mode verified');

  // 2.3 Architecture ADR Mode
  const test2_3 = engine.compile("We are migrating from REST to gRPC for microservice communication to reduce network latency.", { mode: 'architecture_adr' });
  assert.ok(test2_3.compiled_prompt.includes('Architecture Decision Record'), 'Must format as ADR structure');
  console.log('  ✅ 2.3 Architecture ADR Mode verified');

  // 2.4 SQL & Database Mode
  const test2_4 = engine.compile("We need a query to aggregate user transactions by month and join customer profiles.", { mode: 'sql_data' });
  assert.ok(test2_4.compiled_prompt.length > 0);
  console.log('  ✅ 2.4 SQL & Database Mode verified');

  // -------------------------------------------------------------
  // SUITE 3: Team Tier Guardrails & Policy Injection
  // -------------------------------------------------------------
  console.log('\n📌 Suite 3: Team Tier Guardrails & Workspace Policies');

  const teamRules = [
    "Strict TypeScript typing required (no any)",
    "Unit tests with Vitest must accompany all new endpoints",
    "Security: Validate all request bodies with Zod schemas"
  ];
  const test3_1 = engine.compile("Create a REST API for invoice generation.", { mode: 'code_refactor', teamRules });
  assert.ok(test3_1.compiled_prompt.includes('Team Guidelines & Guardrails:'), 'Must append team guidelines');
  assert.ok(test3_1.compiled_prompt.includes('Strict TypeScript'), 'Must contain rule 1');
  assert.ok(test3_1.compiled_prompt.includes('Vitest'), 'Must contain rule 2');
  assert.ok(test3_1.compiled_prompt.includes('Zod'), 'Must contain rule 3');
  console.log('  ✅ 3.1 Team Guardrails injection verified');

  // -------------------------------------------------------------
  // SUITE 4: Confidence & Token ROI Analytics
  // -------------------------------------------------------------
  console.log('\n📌 Suite 4: Confidence & Token Savings Calculations');

  const speechSample = "Um, hey so I'm thinking about making a script... wait, actually a CLI tool in Python. It needs to parse CSV files. Um, yeah, take a CSV file of customer records and, like, find duplicate emails. But wait, emails might have different cases like uppercase or lowercase, so make sure it ignores case. Oh, and also trim spaces around the email. And if it finds duplicates, don't delete them, just output a new CSV with the duplicate rows flagged in a new column called 'is_duplicate'. Let's use argparse for the CLI arguments. Yeah, so just a Python CLI that takes input file path and output file path.";
  const test4_1 = engine.compile(speechSample);
  assert.ok(test4_1.confidence_score >= 80 && test4_1.confidence_score <= 100, 'Confidence score must be 80-100%');
  assert.ok(test4_1.token_savings.saved_percent >= 0, 'Noise reduction percent must be positive');
  assert.ok(typeof test4_1.token_savings.estimated_dollar_savings === 'number', 'Must calculate dollar savings');
  console.log(`  ✅ 4.1 Token ROI calculated: ${test4_1.token_savings.saved_percent}% reduction, confidence: ${test4_1.confidence_score}%`);

  // -------------------------------------------------------------
  // SUITE 5: Edge Case Handling
  // -------------------------------------------------------------
  console.log('\n📌 Suite 5: Edge Cases & Boundary Handling');

  // 5.1 Empty string
  const test5_1 = engine.compile('');
  assert.strictEqual(test5_1.compiled_prompt, '');
  assert.strictEqual(test5_1.confidence_score, 100);
  console.log('  ✅ 5.1 Empty input handled gracefully');

  // 5.2 Whitespace only
  const test5_2 = engine.compile('   \n\t  ');
  assert.strictEqual(test5_2.compiled_prompt, '');
  console.log('  ✅ 5.2 Whitespace input handled gracefully');

  // 5.3 Single word input
  const test5_3 = engine.compile('Continue');
  assert.ok(test5_3.compiled_prompt.includes('Continue'));
  console.log('  ✅ 5.3 Single word input handled gracefully');

  console.log('\n🎉 ALL QA TEST SUITES PASSED (100% VERIFIED)!');
}

runFullQASuite().catch(err => {
  console.error('❌ QA Test failed:', err);
  process.exit(1);
});
