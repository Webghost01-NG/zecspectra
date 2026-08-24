import { RpcResponse } from '@/types/zcash';

// Mainnet: try configured env first, then local Zebra default
export const ZCASH_MAINNET_RPC = process.env.ZCASH_MAINNET_RPC || 'http://127.0.0.1:8232';
export const ZCASH_TESTNET_RPC = process.env.ZCASH_TESTNET_RPC || 'http://127.0.0.1:18232';

// Read-only methods that are safe to expose publicly
export const RPC_ALLOWLIST = new Set([
  'getblockchaininfo',
  'getpeerinfo',
  'getmempoolinfo',
  'getnetworksolps',
  'getblock',
  'getblockhash',
  'getblockcount',
  'getbestblockhash',
  'getinfo',
  'getdeprecationinfo',
]);

/**
 * Send a JSON-RPC 2.0 call to a Zcash node (Zebra or zcashd).
 * Returns the raw RPC response. If the call fails, throws an error.
 * NO mock data. NO synthetic fallbacks.
 */
export async function callZcashRpc<T = any>(
  method: string,
  params: any[] = [],
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<RpcResponse<T>> {
  const startTime = Date.now();
  const rpcUrl = network === 'testnet' ? ZCASH_TESTNET_RPC : ZCASH_MAINNET_RPC;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (process.env.ZCASH_RPC_USER && process.env.ZCASH_RPC_PASSWORD) {
    const auth = Buffer.from(
      `${process.env.ZCASH_RPC_USER}:${process.env.ZCASH_RPC_PASSWORD}`
    ).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
  }

  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `zecspectra-${Date.now()}`,
        method,
        params,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`RPC HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      ...data,
      durationMs: Date.now() - startTime,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    // Log detailed error server-side only
    console.error(`[ZecSpectra RPC] ${method} failed on ${rpcUrl}:`, err.message);
    // Return sanitized error — NEVER expose internal URLs
    throw new Error(
      err.name === 'AbortError'
        ? 'Zcash node did not respond within 8 seconds.'
        : 'Zcash node is not reachable.'
    );
  }
}
