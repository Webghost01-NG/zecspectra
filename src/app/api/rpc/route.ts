import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc } from '@/lib/zcash-rpc';

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

    const result = await callZcashRpc(method, params, network);
    return NextResponse.json(result);
  } catch (err: any) {
    // Real error — node unreachable or method failed
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: 'error',
        error: {
          code: -32603,
          message: err.message || 'Failed to connect to Zcash node. Ensure a node is running and accessible.',
        },
      },
      { status: 502 }
    );
  }
}
