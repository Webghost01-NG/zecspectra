import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc } from '@/lib/zcash-rpc';
import { BlockchainInfo, MempoolInfo, PeerInfo, TelemetrySummary } from '@/types/zcash';

export const dynamic = 'force-dynamic';

// Server-side cache: deduplicate concurrent requests
const cachedSummary: Record<string, { data: TelemetrySummary; at: number }> = {};
const CACHE_TTL_MS = 10_000;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = (searchParams.get('network') === 'testnet' ? 'testnet' : 'mainnet') as 'mainnet' | 'testnet';
  const nodeMode = (searchParams.get('nodeMode') === 'local' ? 'local' : 'gateway') as 'gateway' | 'local';
  const cacheKey = `${network}-${nodeMode}`;

  // Return cached if fresh
  const cached = cachedSummary[cacheKey];
  if (cached && (Date.now() - cached.at) < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  // === 1. Try Zcash RPC (Gateway or Local Node) with Promise.allSettled ===
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
      callZcashRpc<BlockchainInfo>('getblockchaininfo', [], network, nodeMode),
      callZcashRpc<MempoolInfo>('getmempoolinfo', [], network, nodeMode),
      callZcashRpc<PeerInfo[]>('getpeerinfo', [], network, nodeMode),
      callZcashRpc<number>('getnetworksolps', [], network, nodeMode),
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
    // All RPC calls failed
  }

  // === 2. Build the Telemetry response ===
  let summary: TelemetrySummary;

  if (nodeReachable && rpcBlockchainInfo) {
    const nodeLabel = nodeMode === 'gateway'
      ? 'Zcash Cloud RPC Gateway (24/7 Live Mainnet)'
      : `Local Zebra Node (${network === 'mainnet' ? 'Mainnet' : 'Testnet'})`;

    summary = {
      nodeConnected: true,
      dataSource: 'node',
      nodeMode,
      nodeUrl: nodeLabel,
      network: rpcBlockchainInfo.chain || (network === 'mainnet' ? 'main' : 'test'),
      blockHeight: rpcBlockchainInfo.blocks ?? 0,
      estimatedHeight: rpcBlockchainInfo.estimatedheight ?? rpcBlockchainInfo.headers ?? rpcBlockchainInfo.blocks ?? 0,
      bestBlockHash: rpcBlockchainInfo.bestblockhash ?? '',
      difficulty: rpcBlockchainInfo.difficulty ?? 0,
      verificationProgress: rpcBlockchainInfo.verificationprogress ?? 1.0,
      solps: rpcSolps,
      mempool: rpcMempoolInfo || { size: 0, bytes: 0, usage: 0 },
      peerCount: rpcPeerCount,
      peers: rpcPeers,
      valuePools: rpcBlockchainInfo.valuePools || [],
      upgrades: rpcBlockchainInfo.upgrades || {},
      subversion: nodeMode === 'gateway' ? '/ZecSpectra-CloudGateway:2.0/' : '/Zebra:5.1.0/',
      latencyMs: rpcProof.getblockchaininfo?.latencyMs || 45,
      updatedAt: new Date().toISOString(),
      rpcProof,
    };
  } else {
    // Disconnected state
    summary = {
      nodeConnected: false,
      dataSource: 'none',
      nodeMode,
      nodeUrl: nodeMode === 'local'
        ? 'Local Zebra node unreachable at http://127.0.0.1:8232'
        : 'No data source available',
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

  cachedSummary[cacheKey] = { data: summary, at: Date.now() };
  return NextResponse.json(summary);
}
