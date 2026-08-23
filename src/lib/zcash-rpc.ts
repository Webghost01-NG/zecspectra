import { RpcResponse } from '@/types/zcash';

export const ZCASH_TESTNET_RPC = process.env.ZCASH_TESTNET_RPC || 'http://127.0.0.1:18232';
export const ZCASH_MAINNET_RPC = process.env.ZCASH_MAINNET_RPC || 'https://zcash.drpc.org';

export const ZCASH_DEFAULT_RPC = process.env.ZCASH_RPC_URL || ZCASH_TESTNET_RPC;

export async function callZcashRpc<T = any>(
  method: string,
  params: any[] = [],
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<RpcResponse<T>> {
  const startTime = Date.now();
  const primaryUrl = network === 'mainnet' ? ZCASH_MAINNET_RPC : ZCASH_TESTNET_RPC;

  const tryRpcCall = async (targetUrl: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (process.env.ZCASH_RPC_USER && process.env.ZCASH_RPC_PASSWORD) {
      const auth = Buffer.from(
        `${process.env.ZCASH_RPC_USER}:${process.env.ZCASH_RPC_PASSWORD}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    const res = await fetch(targetUrl, {
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
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  };

  try {
    const data = await tryRpcCall(primaryUrl);
    return {
      ...data,
      durationMs: Date.now() - startTime,
    };
  } catch (err: any) {
    if (network === 'testnet') {
      try {
        const fallbackData = await tryRpcCall(ZCASH_MAINNET_RPC);
        return {
          ...fallbackData,
          durationMs: Date.now() - startTime,
        };
      } catch (fallbackErr) {}
    }

    const durationMs = Date.now() - startTime;
    return {
      jsonrpc: '2.0',
      id: `zecspectra-err`,
      error: {
        code: -32603,
        message: err.name === 'AbortError' ? 'RPC Request Timed Out (6s)' : err.message || 'Internal RPC error',
      },
      durationMs,
    };
  }
}
