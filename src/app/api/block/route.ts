import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc, ZCASH_DEFAULT_RPC } from '@/lib/zcash-rpc';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query'); // height or hash
  const rpcUrl = searchParams.get('rpcUrl') || ZCASH_DEFAULT_RPC;

  if (!query) {
    return NextResponse.json({ error: 'Query parameter (block height or hash) is required' }, { status: 400 });
  }

  try {
    let blockHash = query;

    // If query is an integer height, fetch block hash first using getblockhash
    if (/^\d+$/.test(query)) {
      const hashRes = await callZcashRpc<string>('getblockhash', [parseInt(query, 10)], rpcUrl);
      if (hashRes.error || !hashRes.result) {
        return NextResponse.json({ error: hashRes.error?.message || 'Block height not found' }, { status: 404 });
      }
      blockHash = hashRes.result;
    }

    // Verbose 1 = parsed block object
    const blockRes = await callZcashRpc('getblock', [blockHash, 1], rpcUrl);
    if (blockRes.error) {
      return NextResponse.json({ error: blockRes.error.message }, { status: 404 });
    }

    return NextResponse.json({
      block: blockRes.result,
      durationMs: blockRes.durationMs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
