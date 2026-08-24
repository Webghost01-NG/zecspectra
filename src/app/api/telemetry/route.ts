import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc } from '@/lib/zcash-rpc';
import { BlockchainInfo, MempoolInfo, PeerInfo, TelemetrySummary } from '@/types/zcash';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = (searchParams.get('network') === 'testnet' ? 'testnet' : 'mainnet') as 'mainnet' | 'testnet';

  // === 1. Try direct Zcash node RPC (local or configured remote) ===
  try {
    const [blockchainRes, mempoolRes, peersRes, solpsRes] = await Promise.all([
      callZcashRpc<BlockchainInfo>('getblockchaininfo', [], network),
      callZcashRpc<MempoolInfo>('getmempoolinfo', [], network),
      callZcashRpc<PeerInfo[]>('getpeerinfo', [], network),
      callZcashRpc<number>('getnetworksolps', [], network),
    ]);

    const info = blockchainRes.result;
    if (info && (info.blocks > 0 || info.chain)) {
      const summary: TelemetrySummary = {
        nodeConnected: true,
        dataSource: 'node',
        nodeUrl: network === 'mainnet' ? 'Local/Remote Zcash Node (Mainnet)' : 'Local/Remote Zcash Node (Testnet)',
        network: info.chain || (network === 'mainnet' ? 'main' : 'test'),
        blockHeight: info.blocks ?? 0,
        estimatedHeight: info.estimatedheight ?? info.headers ?? info.blocks ?? 0,
        bestBlockHash: info.bestblockhash ?? '',
        difficulty: info.difficulty ?? 0,
        verificationProgress: info.verificationprogress ?? 1.0,
        solps: typeof solpsRes.result === 'number' ? solpsRes.result : 0,
        mempool: mempoolRes.result || { size: 0, bytes: 0, usage: 0 },
        peerCount: Array.isArray(peersRes.result) ? peersRes.result.length : 0,
        peers: Array.isArray(peersRes.result) ? peersRes.result : [],
        valuePools: info.valuePools || [],
        upgrades: info.upgrades || {},
        subversion: '',
        latencyMs: blockchainRes.durationMs || 0,
        updatedAt: new Date().toISOString(),
      };
      return NextResponse.json(summary);
    }
  } catch (rpcErr) {
    // Node unreachable — fall through to Blockchair indexer
  }

  // === 2. Fallback: Blockchair public indexer (labeled honestly) ===
  if (network === 'mainnet') {
    try {
      const bcRes = await fetch('https://api.blockchair.com/zcash/stats', {
        headers: { 'User-Agent': 'ZecSpectra/1.0' },
        signal: AbortSignal.timeout(6000),
      });

      if (bcRes.ok) {
        const bcData = await bcRes.json();
        const stats = bcData.data;

        if (stats && stats.blocks) {
          const summary: TelemetrySummary = {
            nodeConnected: false,
            dataSource: 'indexer',
            nodeUrl: 'Blockchair Public Indexer API (No direct node connection)',
            network: 'main',
            blockHeight: stats.blocks,
            estimatedHeight: stats.blocks,
            bestBlockHash: stats.best_block_hash || '',
            difficulty: stats.difficulty || 0,
            verificationProgress: 1.0,
            solps: stats.hashrate_24h || 0,
            mempool: {
              size: stats.mempool_transactions || 0,
              bytes: stats.mempool_size || 0,
              usage: stats.mempool_size || 0,
            },
            peerCount: stats.nodes || 0,
            peers: [], // Blockchair does not provide individual peer info
            valuePools: [], // Blockchair does not provide value pool breakdown
            upgrades: {},   // Blockchair does not provide upgrade info
            subversion: '',
            latencyMs: 0,
            updatedAt: new Date().toISOString(),
          };
          return NextResponse.json(summary);
        }
      }
    } catch (bcErr) {
      // Blockchair also failed
    }
  }

  // === 3. No data available — return honest disconnected state ===
  const disconnectedSummary: TelemetrySummary = {
    nodeConnected: false,
    dataSource: 'none',
    nodeUrl: 'No Zcash node connected',
    network: network === 'mainnet' ? 'main' : 'test',
    blockHeight: 0,
    estimatedHeight: 0,
    bestBlockHash: '',
    difficulty: 0,
    verificationProgress: 0,
    solps: 0,
    mempool: { size: 0, bytes: 0, usage: 0 },
    peerCount: 0,
    peers: [],
    valuePools: [],
    upgrades: {},
    subversion: '',
    latencyMs: 0,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(disconnectedSummary);
}
