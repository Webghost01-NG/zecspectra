import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc, CustomRpcConfig } from '@/lib/zcash-rpc';

export const dynamic = 'force-dynamic';

// Per-network cache to prevent testnet/mode cross-data leakage
const txCache: Record<string, { data: any; at: number }> = {};
const TX_CACHE_TTL = 10_000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = (searchParams.get('network') === 'testnet' ? 'testnet' : 'mainnet') as 'mainnet' | 'testnet';
  const customUrl = searchParams.get('customUrl') || '';
  const cacheKey = `${network}-${customUrl}`;

  // Return cached per-network/mode
  const cached = txCache[cacheKey];
  if (cached && (Date.now() - cached.at) < TX_CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const customRpc: CustomRpcConfig | null = customUrl ? { url: customUrl } : null;

  // === 1. Try Zcash RPC (Custom Node or 24/7 Cloud Gateway) ===
  try {
    const infoRes = await callZcashRpc('getblockchaininfo', [], network, customRpc);
    if (infoRes.result && infoRes.result.blocks > 0) {
      const bestHash = infoRes.result.bestblockhash;
      const blockHeight = infoRes.result.blocks;
      const blockRes = await callZcashRpc('getblock', [bestHash, 1], network, customRpc);
      const block = blockRes.result;
      if (block && Array.isArray(block.tx)) {
        const result = {
          source: 'node',
          network,
          transactions: block.tx.map((txid: string, idx: number) => ({
            txid: typeof txid === 'string' ? txid : (txid as any).hash,
            height: blockHeight,
            blockHash: bestHash,
            time: new Date(block.time * 1000).toISOString(),
            blockTimestamp: block.time,
            isCoinbase: idx === 0,
          })),
          blockHeight,
          bestHash,
          blockTime: new Date(block.time * 1000).toISOString(),
          txCount: block.tx.length,
          updatedAt: new Date().toISOString(),
        };
        txCache[cacheKey] = { data: result, at: Date.now() };
        return NextResponse.json(result);
      }
    }
  } catch (err) {}

  // === 2. Blockchair fallback (mainnet only) ===
  if (network === 'mainnet') {
    try {
      const statsRes = await fetch('https://api.blockchair.com/zcash/stats', {
        headers: { 'User-Agent': 'ZecSpectra/1.0' },
        signal: AbortSignal.timeout(6000),
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const indexedHeight = typeof statsData.context?.state === 'number'
          ? statsData.context.state
          : (statsData.data?.blocks ? statsData.data.blocks - 1 : 0);
        const latestHash = statsData.data?.best_block_hash || '';
        if (indexedHeight > 0) {
          const blockRes = await fetch(
            `https://api.blockchair.com/zcash/dashboards/block/${indexedHeight}`,
            { headers: { 'User-Agent': 'ZecSpectra/1.0' }, signal: AbortSignal.timeout(6000) }
          );
          if (blockRes.ok) {
            const blockData = await blockRes.json();
            const bd = blockData.data && typeof blockData.data === 'object' && !Array.isArray(blockData.data)
              ? blockData.data[String(indexedHeight)] : null;
            if (bd && Array.isArray(bd.transactions) && bd.transactions.length > 0) {
              const result = {
                source: 'indexer',
                network,
                transactions: bd.transactions.map((txid: string, idx: number) => ({
                  txid: typeof txid === 'string' ? txid : (txid as any).hash,
                  height: indexedHeight,
                  blockHash: latestHash,
                  time: bd.block?.time || new Date().toISOString(),
                  blockTimestamp: Math.floor(new Date(bd.block?.time || Date.now()).getTime() / 1000),
                  isCoinbase: idx === 0,
                })),
                blockHeight: indexedHeight,
                bestHash: latestHash,
                blockTime: bd.block?.time || new Date().toISOString(),
                txCount: bd.transactions.length,
                updatedAt: new Date().toISOString(),
              };
              txCache[cacheKey] = { data: result, at: Date.now() };
              return NextResponse.json(result);
            }
          }
        }
      }
    } catch (err) {}
  }

  // === 3. Nothing available ===
  const emptyResult = {
    source: 'none',
    network,
    transactions: [],
    blockHeight: 0,
    bestHash: '',
    blockTime: '',
    txCount: 0,
    updatedAt: new Date().toISOString(),
    error: network === 'testnet'
      ? 'No testnet node connected. Configure your testnet node in Node Settings.'
      : 'No data source available for transaction stream.',
  };
  return NextResponse.json(emptyResult);
}
