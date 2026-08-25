import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc } from '@/lib/zcash-rpc';
import { BlockchainInfo, MempoolInfo, PeerInfo, TelemetrySummary } from '@/types/zcash';

export const dynamic = 'force-dynamic';

// Server-side cache: deduplicate concurrent requests
let cachedSummary: { mainnet?: TelemetrySummary; testnet?: TelemetrySummary } = {};
let cachedAt: { mainnet: number; testnet: number } = { mainnet: 0, testnet: 0 };
const CACHE_TTL_MS = 15_000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = (searchParams.get('network') === 'testnet' ? 'testnet' : 'mainnet') as 'mainnet' | 'testnet';

  // Return cached if fresh (per-network)
  const cached = cachedSummary[network];
  if (cached && (Date.now() - cachedAt[network]) < CACHE_TTL_MS) {
    return NextResponse.json(cached);
  }

  // === 1. Try direct Zcash node RPC with Promise.allSettled ===
  let nodeReachable = false;
  let rpcBlockchainInfo: any = null;
  let rpcMempoolInfo: any = null;
  let rpcPeerCount = 0;
  let rpcPeers: PeerInfo[] = [];
  let rpcSolps = 0;
  const rpcProof: Record<string, { success: boolean; latencyMs: number; error?: string }> = {};

  try {
    const t0 = Date.now();
    const results = await Promise.allSettled([
      callZcashRpc<BlockchainInfo>('getblockchaininfo', [], network),
      callZcashRpc<MempoolInfo>('getmempoolinfo', [], network),
      callZcashRpc<PeerInfo[]>('getpeerinfo', [], network),
      callZcashRpc<number>('getnetworksolps', [], network),
    ]);

    // getblockchaininfo
    if (results[0].status === 'fulfilled' && results[0].value.result) {
      rpcBlockchainInfo = results[0].value.result;
      nodeReachable = true;
      rpcProof.getblockchaininfo = { success: true, latencyMs: results[0].value.durationMs || (Date.now() - t0) };
    } else {
      rpcProof.getblockchaininfo = { success: false, latencyMs: Date.now() - t0, error: 'Unreachable' };
    }

    // getmempoolinfo
    if (results[1].status === 'fulfilled' && results[1].value.result) {
      rpcMempoolInfo = results[1].value.result;
      rpcProof.getmempoolinfo = { success: true, latencyMs: results[1].value.durationMs || (Date.now() - t0) };
    } else {
      rpcMempoolInfo = { size: 0, bytes: 0, usage: 0 };
      rpcProof.getmempoolinfo = { success: false, latencyMs: Date.now() - t0, error: 'Failed' };
    }

    // getpeerinfo
    if (results[2].status === 'fulfilled' && Array.isArray(results[2].value.result)) {
      rpcPeers = results[2].value.result;
      rpcPeerCount = rpcPeers.length;
      rpcProof.getpeerinfo = { success: true, latencyMs: results[2].value.durationMs || (Date.now() - t0) };
    } else {
      rpcProof.getpeerinfo = { success: false, latencyMs: Date.now() - t0, error: 'Failed' };
    }

    // getnetworksolps
    if (results[3].status === 'fulfilled' && typeof results[3].value.result === 'number') {
      rpcSolps = results[3].value.result;
      rpcProof.getnetworksolps = { success: true, latencyMs: results[3].value.durationMs || (Date.now() - t0) };
    } else {
      rpcProof.getnetworksolps = { success: false, latencyMs: Date.now() - t0, error: 'Failed' };
    }
  } catch (e) {
    // All RPC calls failed entirely
  }

  // === 2. Blockchair indexer (mainnet only, NEVER mixed into node-labelled data) ===
  let indexerData: {
    height: number; hash: string; difficulty: number; hashrate: number;
    mempoolTxs: number; mempoolSize: number; nodes: number;
  } | null = null;

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
          const exactHeight = typeof bcData.context?.state === 'number'
            ? bcData.context.state
            : (stats.blocks > 0 ? stats.blocks - 1 : stats.blocks);
          indexerData = {
            height: exactHeight,
            hash: stats.best_block_hash || '',
            difficulty: stats.difficulty || 0,
            hashrate: stats.hashrate_24h || 0,
            mempoolTxs: stats.mempool_transactions || 0,
            mempoolSize: stats.mempool_size || 0,
            nodes: stats.nodes || 0,
          };
        }
      }
    } catch (e) {}
  }

  // === 3. Build the response — NEVER mix sources under one label ===
  let summary: TelemetrySummary;

  if (nodeReachable && rpcBlockchainInfo) {
    // Pure node data — DO NOT supplement with indexer
    summary = {
      nodeConnected: true,
      dataSource: 'node',
      nodeUrl: `Zebra Node (${network === 'mainnet' ? 'Mainnet' : 'Testnet'})`,
      network: rpcBlockchainInfo.chain || (network === 'mainnet' ? 'main' : 'test'),
      blockHeight: rpcBlockchainInfo.blocks ?? 0,
      estimatedHeight: rpcBlockchainInfo.estimatedheight ?? rpcBlockchainInfo.headers ?? 0,
      bestBlockHash: rpcBlockchainInfo.bestblockhash ?? '',
      difficulty: rpcBlockchainInfo.difficulty ?? 0,
      verificationProgress: rpcBlockchainInfo.verificationprogress ?? 0,
      solps: rpcSolps,
      mempool: rpcMempoolInfo || { size: 0, bytes: 0, usage: 0 },
      peerCount: rpcPeerCount,
      peers: rpcPeers,
      valuePools: rpcBlockchainInfo.valuePools || [],
      upgrades: rpcBlockchainInfo.upgrades || {},
      subversion: '',
      latencyMs: rpcProof.getblockchaininfo?.latencyMs || 0,
      updatedAt: new Date().toISOString(),
      rpcProof,
    };
  } else if (indexerData) {
    summary = {
      nodeConnected: false,
      dataSource: 'indexer',
      nodeUrl: 'Blockchair Public Indexer API',
      network: 'main',
      blockHeight: indexerData.height,
      estimatedHeight: indexerData.height,
      bestBlockHash: indexerData.hash,
      difficulty: indexerData.difficulty,
      verificationProgress: 0,
      solps: indexerData.hashrate,
      mempool: { size: indexerData.mempoolTxs, bytes: indexerData.mempoolSize, usage: indexerData.mempoolSize },
      peerCount: indexerData.nodes,
      peers: [],
      valuePools: [],
      upgrades: {},
      subversion: '',
      latencyMs: 0,
      updatedAt: new Date().toISOString(),
    };
  } else {
    summary = {
      nodeConnected: false,
      dataSource: 'none',
      nodeUrl: 'No data source available',
      network: network === 'mainnet' ? 'main' : 'test',
      blockHeight: 0, estimatedHeight: 0, bestBlockHash: '',
      difficulty: 0, verificationProgress: 0, solps: 0,
      mempool: { size: 0, bytes: 0, usage: 0 },
      peerCount: 0, peers: [], valuePools: [], upgrades: {},
      subversion: '', latencyMs: 0, updatedAt: new Date().toISOString(),
    };
  }

  cachedSummary[network] = summary;
  cachedAt[network] = Date.now();
  return NextResponse.json(summary);
}
