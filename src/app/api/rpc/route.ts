import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc, RPC_ALLOWLIST } from '@/lib/zcash-rpc';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, params = [], network = 'mainnet' } = body;

    if (!method) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: 'error',
          error: { code: -32600, message: 'Invalid Request: RPC method name is required' },
        },
        { status: 400 }
      );
    }

    // Security: only allow read-only methods
    if (!RPC_ALLOWLIST.has(method)) {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: 'error',
          error: {
            code: -32601,
            message: `Method not allowed: "${method}". Only read-only Zcash RPC methods are permitted.`,
          },
        },
        { status: 403 }
      );
    }

    const result = await callZcashRpc(method, params, network);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: 'error',
        error: {
          code: -32603,
          message: err.message || 'Failed to connect to Zcash node.',
        },
      },
      { status: 502 }
    );
  }
}
