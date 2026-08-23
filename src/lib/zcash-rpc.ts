import { BlockchainInfo, MempoolInfo, PeerInfo, RpcResponse, TelemetrySummary } from '@/types/zcash';

export const ZCASH_DEFAULT_RPC = process.env.ZCASH_RPC_URL || 'http://127.0.0.1:18232';

export async function callZcashRpc<T = any>(
  method: string,
  params: any[] = [],
  rpcUrl: string = ZCASH_DEFAULT_RPC
): Promise<RpcResponse<T>> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (process.env.ZCASH_RPC_USER && process.env.ZCASH_RPC_PASSWORD) {
      const auth = Buffer.from(
        `${process.env.ZCASH_RPC_USER}:${process.env.ZCASH_RPC_PASSWORD}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

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
    const durationMs = Date.now() - startTime;

    if (!res.ok) {
      const errorText = await res.text();
      return {
        jsonrpc: '2.0',
        id: `zecspectra-err`,
        error: {
          code: res.status,
          message: `HTTP ${res.status}: ${errorText || res.statusText}`,
        },
        durationMs,
      };
    }

    const data = await res.json();
    return {
      ...data,
      durationMs,
    };
  } catch (err: any) {
    const durationMs = Date.now() - startTime;
    return {
      jsonrpc: '2.0',
      id: `zecspectra-err`,
      error: {
        code: -32603,
        message: err.name === 'AbortError' ? 'RPC Request Timed Out (10s)' : err.message || 'Internal RPC error',
      },
      durationMs,
    };
  }
}
