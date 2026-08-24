import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc } from '@/lib/zcash-rpc';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = (searchParams.get('network') === 'testnet' ? 'testnet' : 'mainnet') as 'mainnet' | 'testnet';

  // === 1. Try direct node RPC: getblockchaininfo -> getblock ===
  try {
    const infoRes = await callZcashRpc('getblockchaininfo', [], network);
    if (infoRes.result && infoRes.result.blocks > 0) {
      const bestHash = infoRes.result.bestblockhash;
      const blockHeight = infoRes.result.blocks;

      const blockRes = await callZcashRpc('getblock', [bestHash, 1], network);
      const block = blockRes.result;

      if (block && Array.isArray(block.tx)) {
        const transactions = block.tx.map((txid: string, idx: number) => ({
          txid,
          height: blockHeight,
          blockHash: bestHash,
          time: new Date(block.time * 1000).toLocaleTimeString(),
          blockTimestamp: block.time,
          isCoinbase: idx === 0,
        }));

        return NextResponse.json({
          source: 'node',
          transactions,
          blockHeight,
          bestHash,
          blockTime: new Date(block.time * 1000).toLocaleString(),
          txCount: block.tx.length,
          network,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    // Node unreachable, try indexer
  }

  // === 2. Fallback: Blockchair latest block transactions ===
  if (network === 'mainnet') {
    try {
      const statsRes = await fetch('https://api.blockchair.com/zcash/stats', {
        headers: { 'User-Agent': 'ZecSpectra/1.0' },
        signal: AbortSignal.timeout(6000),
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const latestHeight = statsData.data?.blocks;
        const latestHash = statsData.data?.best_block_hash;

        if (latestHeight) {
          // Get the latest block's transactions from Blockchair
          const blockRes = await fetch(
            `https://api.blockchair.com/zcash/dashboards/block/${latestHeight}`,
            {
              headers: { 'User-Agent': 'ZecSpectra/1.0' },
              signal: AbortSignal.timeout(6000),
            }
          );

          if (blockRes.ok) {
            const blockData = await blockRes.json();
            const blockKey = Object.keys(blockData.data || {})[0];
            const bd = blockData.data?.[blockKey];

            if (bd && Array.isArray(bd.transactions)) {
              const transactions = bd.transactions.map((txid: string, idx: number) => ({
                txid,
                height: latestHeight,
                blockHash: latestHash || '',
                time: bd.block?.time || new Date().toISOString(),
                blockTimestamp: Math.floor(new Date(bd.block?.time || Date.now()).getTime() / 1000),
                isCoinbase: idx === 0,
              }));

              return NextResponse.json({
                source: 'indexer',
                transactions,
                blockHeight: latestHeight,
                bestHash: latestHash || '',
                blockTime: bd.block?.time || new Date().toISOString(),
                txCount: bd.transactions.length,
                network,
                updatedAt: new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch (err) {
      // Indexer also failed
    }
  }

  // === 3. No data — return empty, honest response ===
  return NextResponse.json({
    source: 'none',
    transactions: [],
    blockHeight: 0,
    bestHash: '',
    blockTime: '',
    txCount: 0,
    network,
    updatedAt: new Date().toISOString(),
    error: 'No Zcash node or indexer available. Connect a node to see live transactions.',
  });
}
