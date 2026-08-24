import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc } from '@/lib/zcash-rpc';

export const dynamic = 'force-dynamic';

// Cache to avoid hammering Blockchair
let txCache: any = null;
let txCacheAt = 0;
const TX_CACHE_TTL = 15_000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = (searchParams.get('network') === 'testnet' ? 'testnet' : 'mainnet') as 'mainnet' | 'testnet';

  // Return cached if fresh
  if (txCache && (Date.now() - txCacheAt) < TX_CACHE_TTL) {
    return NextResponse.json(txCache);
  }

  // === 1. Try direct node RPC ===
  try {
    const infoRes = await callZcashRpc('getblockchaininfo', [], network);
    if (infoRes.result && infoRes.result.blocks > 0) {
      const bestHash = infoRes.result.bestblockhash;
      const blockHeight = infoRes.result.blocks;
      const blockRes = await callZcashRpc('getblock', [bestHash, 1], network);
      const block = blockRes.result;
      if (block && Array.isArray(block.tx)) {
        const result = {
          source: 'node',
          transactions: block.tx.map((txid: string, idx: number) => ({
            txid, height: blockHeight, blockHash: bestHash,
            time: new Date(block.time * 1000).toISOString(),
            blockTimestamp: block.time, isCoinbase: idx === 0,
          })),
          blockHeight, bestHash,
          blockTime: new Date(block.time * 1000).toISOString(),
          txCount: block.tx.length, network,
          updatedAt: new Date().toISOString(),
        };
        txCache = result; txCacheAt = Date.now();
        return NextResponse.json(result);
      }
    }
  } catch (err) {}

  // === 2. Blockchair: use context.state (last indexed block) ===
  if (network === 'mainnet') {
    try {
      const statsRes = await fetch('https://api.blockchair.com/zcash/stats', {
        headers: { 'User-Agent': 'ZecSpectra/1.0' },
        signal: AbortSignal.timeout(6000),
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        // Use context.state which is the last fully indexed block
        const indexedHeight = statsData.context?.state || (statsData.data?.blocks ? statsData.data.blocks - 1 : 0);
        const latestHash = statsData.data?.best_block_hash || '';

        if (indexedHeight > 0) {
          const blockRes = await fetch(
            `https://api.blockchair.com/zcash/dashboards/block/${indexedHeight}`,
            { headers: { 'User-Agent': 'ZecSpectra/1.0' }, signal: AbortSignal.timeout(6000) }
          );
          if (blockRes.ok) {
            const blockData = await blockRes.json();
            // Blockchair returns data as object keyed by block height string
            const bd = blockData.data && typeof blockData.data === 'object' && !Array.isArray(blockData.data)
              ? blockData.data[String(indexedHeight)]
              : null;

            if (bd && Array.isArray(bd.transactions) && bd.transactions.length > 0) {
              const result = {
                source: 'indexer',
                transactions: bd.transactions.map((txid: string, idx: number) => ({
                  txid, height: indexedHeight, blockHash: latestHash,
                  time: bd.block?.time || new Date().toISOString(),
                  blockTimestamp: Math.floor(new Date(bd.block?.time || Date.now()).getTime() / 1000),
                  isCoinbase: idx === 0,
                })),
                blockHeight: indexedHeight, bestHash: latestHash,
                blockTime: bd.block?.time || new Date().toISOString(),
                txCount: bd.transactions.length, network,
                updatedAt: new Date().toISOString(),
              };
              txCache = result; txCacheAt = Date.now();
              return NextResponse.json(result);
            }
          }
        }
      }
    } catch (err) {}
  }

  // === 3. Nothing available ===
  return NextResponse.json({
    source: 'none', transactions: [], blockHeight: 0, bestHash: '',
    blockTime: '', txCount: 0, network, updatedAt: new Date().toISOString(),
    error: 'No data source available for transaction stream.',
  });
}
