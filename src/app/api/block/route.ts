import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc } from '@/lib/zcash-rpc';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const network = (searchParams.get('network') === 'testnet' ? 'testnet' : 'mainnet') as 'mainnet' | 'testnet';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter (block height or hash) is required' }, { status: 400 });
  }

  try {
    let blockHash = query.trim();

    if (/^\d+$/.test(blockHash)) {
      const heightNum = parseInt(blockHash, 10);
      const hashRes = await callZcashRpc<string>('getblockhash', [heightNum], network);
      if (hashRes.result) {
        blockHash = hashRes.result;
      }
    }

    const blockRes = await callZcashRpc('getblock', [blockHash, 1], network);
    if (blockRes.result) {
      return NextResponse.json({
        block: blockRes.result,
        durationMs: blockRes.durationMs,
      });
    }

    return NextResponse.json({ error: 'Block not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Block query failed' }, { status: 500 });
  }
}
