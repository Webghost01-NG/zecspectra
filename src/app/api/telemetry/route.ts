import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc } from '@/lib/zcash-rpc';
import { BlockchainInfo, MempoolInfo, PeerInfo, TelemetrySummary } from '@/types/zcash';

export const dynamic = 'force-dynamic';

// Server-side cache: avoid hammering the node/indexer on every visitor request
let cachedSummary: TelemetrySummary | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 15_000; // 15 seconds

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = (searchParams.get('network') === 'testnet' ? 'testnet' : 'mainnet') as 'mainnet' | 'testnet';

  // Return cached if fresh
  if (cachedSummary && (Date.now() - cachedAt) < CACHE_TTL_MS && cachedSummary.network === (network === 'mainnet' ? 'main' : 'test')) {
    return NextResponse.json(cachedSummary);
  }

  // === 1. Try direct Zcash node RPC ===
  let nodeReachable = false;
  let nodeLatency = 0;
  let rpcBlockchainInfo: any = null;
  let rpcMempoolInfo: any = null;
  let rpcPeerCount = 0;
  let rpcPeers: PeerInfo[] = [];
  let rpcSolps = 0;

  try {
    const startRpc = Date.now();
    const [blockchainRes, mempoolRes, peersRes, solpsRes] = await Promise.all([
      callZcashRpc<BlockchainInfo>('getblockchaininfo', [], network),
      callZcashRpc<MempoolInfo>('getmempoolinfo', [], network),
      callZcashRpc<PeerInfo[]>('getpeerinfo', [], network),
      callZcashRpc<number>('getnetworksolps', [], network),
    ]);
    nodeLatency = Date.now() - startRpc;

    if (blockchainRes.result && (blockchainRes.result.chain || blockchainRes.result.blocks !== undefined)) {
      nodeReachable = true;
      rpcBlockchainInfo = blockchainRes.result;
      rpcMempoolInfo = mempoolRes.result || { size: 0, bytes: 0, usage: 0 };
      rpcPeers = Array.isArray(peersRes.result) ? peersRes.result : [];
      rpcPeerCount = rpcPeers.length;
      rpcSolps = typeof solpsRes.result === 'number' ? solpsRes.result : 0;
    }
  } catch (rpcErr) {
    // Node unreachable
  }

  // === 2. Get live chain data from Blockchair (mainnet only) ===
  let indexerHeight = 0;
  let indexerHash = '';
  let indexerDifficulty = 0;
  let indexerHashrate = 0;
  let indexerMempoolTxs = 0;
  let indexerMempoolSize = 0;
  let indexerNodes = 0;
  let indexerAvailable = false;

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
          indexerAvailable = true;
          indexerHeight = stats.blocks;
          indexerHash = stats.best_block_hash || '';
          indexerDifficulty = stats.difficulty || 0;
          indexerHashrate = stats.hashrate_24h || 0;
          indexerMempoolTxs = stats.mempool_transactions || 0;
          indexerMempoolSize = stats.mempool_size || 0;
          indexerNodes = stats.nodes || 0;
        }
      }
    } catch (e) {}
  }

  // === 3. Build the response ===
  let summary: TelemetrySummary;

  if (nodeReachable && rpcBlockchainInfo) {
    // Node is connected — use node data, supplement with indexer for live height if node is syncing
    const nodeHeight = rpcBlockchainInfo.blocks || 0;
    const displayHeight = nodeHeight > 0 ? nodeHeight : (indexerAvailable ? indexerHeight : 0);

    summary = {
      nodeConnected: true,
      dataSource: 'node',
      nodeUrl: `Zcash Node (${network === 'mainnet' ? 'Mainnet' : 'Testnet'})`,
      network: rpcBlockchainInfo.chain || (network === 'mainnet' ? 'main' : 'test'),
      blockHeight: displayHeight,
      estimatedHeight: rpcBlockchainInfo.estimatedheight ?? rpcBlockchainInfo.headers ?? (indexerAvailable ? indexerHeight : 0),
      bestBlockHash: rpcBlockchainInfo.bestblockhash ?? (indexerAvailable ? indexerHash : ''),
      difficulty: rpcBlockchainInfo.difficulty ?? (indexerAvailable ? indexerDifficulty : 0),
      verificationProgress: rpcBlockchainInfo.verificationprogress ?? 0,
      solps: rpcSolps > 0 ? rpcSolps : (indexerAvailable ? indexerHashrate : 0),
      mempool: rpcMempoolInfo,
      peerCount: rpcPeerCount > 0 ? rpcPeerCount : (indexerAvailable ? indexerNodes : 0),
      peers: rpcPeers,
      valuePools: rpcBlockchainInfo.valuePools || [],
      upgrades: rpcBlockchainInfo.upgrades || {},
      subversion: '',
      latencyMs: nodeLatency,
      updatedAt: new Date().toISOString(),
      rpcProof: {
        getblockchaininfo: { success: true, latencyMs: nodeLatency },
        getmempoolinfo: { success: !!rpcMempoolInfo, latencyMs: nodeLatency },
        getpeerinfo: { success: true, latencyMs: nodeLatency },
        getnetworksolps: { success: rpcSolps !== undefined, latencyMs: nodeLatency },
      },
    };
  } else if (indexerAvailable) {
    // No node — indexer only
    summary = {
      nodeConnected: false,
      dataSource: 'indexer',
      nodeUrl: 'Blockchair Public Indexer API (No direct node connection)',
      network: 'main',
      blockHeight: indexerHeight,
      estimatedHeight: indexerHeight,
      bestBlockHash: indexerHash,
      difficulty: indexerDifficulty,
      verificationProgress: 0, // Cannot measure sync without a node
      solps: indexerHashrate,
      mempool: {
        size: indexerMempoolTxs,
        bytes: indexerMempoolSize,
        usage: indexerMempoolSize,
      },
      peerCount: indexerNodes,
      peers: [],
      valuePools: [],
      upgrades: {},
      subversion: '',
      latencyMs: 0,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Nothing available
    summary = {
      nodeConnected: false,
      dataSource: 'none',
      nodeUrl: 'No Zcash node or indexer available',
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
  }

  cachedSummary = summary;
  cachedAt = Date.now();

  return NextResponse.json(summary);
}
