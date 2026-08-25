#!/usr/bin/env node

/**
 * ZecSpectra Automated Smoke Test Suite
 * Strict verification of live Zcash node connectivity, RPC execution, security controls, and data integrity.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function runTests() {
  console.log(`\n🧪 Running ZecSpectra Strict Smoke Tests against ${BASE_URL}...\n`);
  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Strict Node Telemetry verification
    const telemetryRes = await fetch(`${BASE_URL}/api/telemetry?network=mainnet`);
    const telemetry = await telemetryRes.json();
    assert(telemetryRes.status === 200, 'GET /api/telemetry returns HTTP 200');
    assert(telemetry.nodeConnected === true, 'Telemetry reports nodeConnected: true', `got: ${telemetry.nodeConnected}`);
    assert(telemetry.dataSource === 'node', 'Telemetry reports dataSource: "node"', `got: ${telemetry.dataSource}`);
    assert(typeof telemetry.blockHeight === 'number' && telemetry.blockHeight >= 0, 'Telemetry blockHeight is a valid non-negative number');

    // 2. Disallowed RPC method returns 403
    const disallowRes = await fetch(`${BASE_URL}/api/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'walletpassphrase', params: ['test', 60] }),
    });
    const disallowData = await disallowRes.json();
    assert(disallowRes.status === 403, 'POST /api/rpc with disallowed method returns HTTP 403');
    assert(disallowData.error && disallowData.error.code === -32601, 'Disallowed method error code is -32601');

    // 3. Invalid parameter shape returns 400
    const invalidParamRes = await fetch(`${BASE_URL}/api/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'getblockchaininfo', params: 'not-an-array' }),
    });
    assert(invalidParamRes.status === 400, 'POST /api/rpc with invalid non-array params returns HTTP 400');

    // 4. Invalid network returns 400
    const invalidNetRes = await fetch(`${BASE_URL}/api/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'getblockchaininfo', params: [], network: 'regtest' }),
    });
    assert(invalidNetRes.status === 400, 'POST /api/rpc with invalid network (regtest) returns HTTP 400');

    // 5. Impossible block returns 404
    const blockRes = await fetch(`${BASE_URL}/api/block?query=999999999&network=mainnet`);
    const blockData = await blockRes.json();
    assert(blockRes.status === 404 || blockData.error, 'GET /api/block with height 999999999 returns error / 404');

    // 6. Testnet does not leak mainnet data
    const testnetTxRes = await fetch(`${BASE_URL}/api/tx-stream?network=testnet`);
    const testnetTxData = await testnetTxRes.json();
    assert(testnetTxData.network === 'testnet', 'Testnet tx-stream returns network=testnet');

    // 7. Strict RPC method execution: must return HTTP 200, result !== undefined, error === undefined
    const requiredMethods = ['getblockchaininfo', 'getmempoolinfo', 'getpeerinfo'];
    for (const method of requiredMethods) {
      const res = await fetch(`${BASE_URL}/api/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, params: [] }),
      });
      const data = await res.json();
      assert(res.status === 200, `POST /api/rpc (${method}) returns HTTP 200`, `got status: ${res.status}`);
      assert(data.jsonrpc === '2.0', `POST /api/rpc (${method}) has jsonrpc: "2.0"`);
      assert(data.result !== undefined, `POST /api/rpc (${method}) returns valid result object`, `got: ${JSON.stringify(data)}`);
      assert(data.error === undefined, `POST /api/rpc (${method}) returns error === undefined`);
    }

    console.log(`\n📊 Summary: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Smoke test suite error:', err);
    process.exit(1);
  }
}

runTests();
