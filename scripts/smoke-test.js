#!/usr/bin/env node

/**
 * ZecSpectra Automated Smoke Test Suite
 * Tests all required endpoints and security invariants.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTests() {
  console.log(`\n🧪 Running ZecSpectra Smoke Tests against ${BASE_URL}...\n`);
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // 1. Telemetry shape & dataSource test
    const telemetryRes = await fetch(`${BASE_URL}/api/telemetry?network=mainnet`);
    const telemetry = await telemetryRes.json();
    assert(telemetryRes.status === 200, 'GET /api/telemetry returns 200');
    assert(['node', 'indexer', 'none'].includes(telemetry.dataSource), 'Telemetry has valid dataSource ("node" | "indexer" | "none")');
    assert(typeof telemetry.blockHeight === 'number', 'Telemetry blockHeight is a number');

    // 2. Disallowed RPC method returns 403
    const disallowRes = await fetch(`${BASE_URL}/api/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'walletpassphrase', params: ['test', 60] }),
    });
    const disallowData = await disallowRes.json();
    assert(disallowRes.status === 403, 'POST /api/rpc with disallowed method returns 403');
    assert(disallowData.error && disallowData.error.code === -32601, 'Disallowed method error code is -32601');

    // 3. Invalid parameter shape returns 400
    const invalidParamRes = await fetch(`${BASE_URL}/api/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'getblockchaininfo', params: 'not-an-array' }),
    });
    assert(invalidParamRes.status === 400, 'POST /api/rpc with invalid non-array params returns 400');

    // 4. Impossible block returns 404
    const blockRes = await fetch(`${BASE_URL}/api/block?query=999999999&network=mainnet`);
    const blockData = await blockRes.json();
    assert(blockRes.status === 404 || blockData.error, 'GET /api/block with height 999999999 returns error / 404');

    // 5. Testnet does not leak mainnet data
    const testnetTxRes = await fetch(`${BASE_URL}/api/tx-stream?network=testnet`);
    const testnetTxData = await testnetTxRes.json();
    assert(testnetTxData.network === 'testnet', 'Testnet tx-stream returns network=testnet');

    // 6. Allowed RPC methods return valid JSON-RPC 2.0 structure
    const allowedMethods = ['getblockchaininfo', 'getmempoolinfo', 'getpeerinfo'];
    for (const method of allowedMethods) {
      const res = await fetch(`${BASE_URL}/api/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, params: [] }),
      });
      const data = await res.json();
      assert(data.jsonrpc === '2.0', `POST /api/rpc (${method}) conforms to JSON-RPC 2.0 structure`);
    }

    console.log(`\n📊 Summary: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Smoke test suite error:', err);
    process.exit(1);
  }
}

runTests();
