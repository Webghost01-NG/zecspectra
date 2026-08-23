import { BlockchainInfo, MempoolInfo, PeerInfo, RpcResponse, TelemetrySummary } from '@/types/zcash';

export const ZCASH_DEFAULT_LOCAL_RPC = 'http://127.0.0.1:8232';
export const ZCASH_PUBLIC_FALLBACK_RPC = 'https://zcash.drpc.org';

export const ZCASH_DEFAULT_RPC = process.env.ZCASH_RPC_URL || ZCASH_DEFAULT_LOCAL_RPC;

export async function callZcashRpc<T = any>(
  method: string,
  params: any[] = [],
  rpcUrl: string = ZCASH_DEFAULT_RPC
): Promise<RpcResponse<T>> {
  const startTime = Date.now();
  
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
    const data = await tryRpcCall(rpcUrl);
    return {
      ...data,
      durationMs: Date.now() - startTime,
    };
  } catch (err: any) {
    // If primary local URL fails, fallback to Mainnet RPC endpoint
    if (rpcUrl === ZCASH_DEFAULT_LOCAL_RPC) {
      try {
        const fallbackData = await tryRpcCall(ZCASH_PUBLIC_FALLBACK_RPC);
        return {
          ...fallbackData,
          durationMs: Date.now() - startTime,
        };
      } catch (fallbackErr: any) {
        // Return original error if fallback also fails
      }
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
