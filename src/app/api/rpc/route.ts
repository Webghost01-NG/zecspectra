import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc, RPC_ALLOWLIST, CustomRpcConfig } from '@/lib/zcash-rpc';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter (per-IP, 60 req/min)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { jsonrpc: '2.0', id: 'error', error: { code: -32000, message: 'Rate limit exceeded. Try again in 60 seconds.' } },
      { status: 429 }
    );
  }

  // Body size limit (10KB)
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
  if (contentLength > 10240) {
    return NextResponse.json(
      { jsonrpc: '2.0', id: 'error', error: { code: -32600, message: 'Request body too large.' } },
      { status: 413 }
    );
  }

  try {
    const body = await req.json();
    const { method, params, network, customRpc } = body;

    // Validate method
    if (!method || typeof method !== 'string') {
      return NextResponse.json(
        { jsonrpc: '2.0', id: 'error', error: { code: -32600, message: 'Invalid Request: method must be a non-empty string.' } },
        { status: 400 }
      );
    }

    // Security: only allow read-only methods
    if (!RPC_ALLOWLIST.has(method)) {
      return NextResponse.json(
        { jsonrpc: '2.0', id: 'error', error: { code: -32601, message: `Method not allowed: "${method}". Only read-only Zcash RPC methods are permitted.` } },
        { status: 403 }
      );
    }

    // Validate params is an array (or undefined)
    const validatedParams = params === undefined ? [] : params;
    if (!Array.isArray(validatedParams)) {
      return NextResponse.json(
        { jsonrpc: '2.0', id: 'error', error: { code: -32602, message: 'Invalid params: must be an array.' } },
        { status: 400 }
      );
    }

    // Validate network strictly (must be 'mainnet' or 'testnet')
    if (network !== undefined && network !== 'mainnet' && network !== 'testnet') {
      return NextResponse.json(
        { jsonrpc: '2.0', id: 'error', error: { code: -32602, message: 'Invalid network. Must be "mainnet" or "testnet".' } },
        { status: 400 }
      );
    }
    const validatedNetwork = (network === 'testnet' ? 'testnet' : 'mainnet') as 'mainnet' | 'testnet';
    const validatedCustomRpc = customRpc && typeof customRpc === 'object' ? (customRpc as CustomRpcConfig) : null;

    const result = await callZcashRpc(method, validatedParams, validatedNetwork, validatedCustomRpc);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[RPC Route Error]', err.message);
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: 'error',
        error: {
          code: -32603,
          message: err.message || 'Zcash node/gateway is not reachable.',
        },
      },
      { status: 502 }
    );
  }
}
