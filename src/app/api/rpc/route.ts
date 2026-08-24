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
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: 'error',
        error: { code: -32603, message: err.message || 'Internal Server Error' },
      },
      { status: 500 }
    );
  }
}
