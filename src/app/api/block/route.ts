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

  const trimmedQuery = query.trim();

  // === 1. Try direct Zcash node RPC ===
  try {
    let blockHash = trimmedQuery;
    if (/^\d+$/.test(trimmedQuery)) {
      const hashRes = await callZcashRpc<string>('getblockhash', [parseInt(trimmedQuery, 10)], network);
      if (hashRes.result) {
        blockHash = hashRes.result;
      }
    }
    const blockRes = await callZcashRpc('getblock', [blockHash, 1], network);
    if (blockRes.result && blockRes.result.hash) {
      return NextResponse.json({
        source: 'node',
        block: blockRes.result,
        durationMs: blockRes.durationMs,
      });
    }
  } catch (err) {
    // Node not available, try indexer
  }

  // === 2. Fallback: Blockchair indexer (mainnet only) ===
  if (network === 'mainnet') {
    try {
      const res = await fetch(
        `https://api.blockchair.com/zcash/dashboards/block/${encodeURIComponent(trimmedQuery)}`,
        {
          headers: { 'User-Agent': 'ZecSpectra/1.0' },
          signal: AbortSignal.timeout(6000),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const blockKey = Object.keys(data.data || {})[0];
        const blockData = data.data?.[blockKey];

        if (blockData && blockData.block) {
          const b = blockData.block;
          const txs: string[] = Array.isArray(blockData.transactions) ? blockData.transactions : [];

          const formattedBlock = {
            hash: b.hash,
            height: b.id,
            size: b.size,
            version: b.version,
            merkleroot: b.merkleroot || '',
            tx: txs,
            time: Math.floor(new Date(b.time).getTime() / 1000),
            nonce: String(b.nonce || ''),
            bits: b.bits || '',
            difficulty: b.difficulty || 0,
            chainwork: b.chainwork || '',
            previousblockhash: b.previous_block_hash || '',
            nextblockhash: b.next_block_hash || '',
            confirmations: b.confirmations || 0,
          };

          return NextResponse.json({
            source: 'indexer',
            block: formattedBlock,
            durationMs: 0,
          });
        }
      }
    } catch (err) {
      // Indexer also failed
    }
  }

  // === 3. Not found ===
  return NextResponse.json(
    { error: `Block "${trimmedQuery}" not found. Ensure a Zcash node is connected or the block exists on mainnet.` },
    { status: 404 }
  );
}
