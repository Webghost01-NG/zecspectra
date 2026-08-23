import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc, ZCASH_DEFAULT_RPC } from '@/lib/zcash-rpc';
import { BlockchainInfo, MempoolInfo, PeerInfo, TelemetrySummary } from '@/types/zcash';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rpcUrl = searchParams.get('rpcUrl') || ZCASH_DEFAULT_RPC;

  try {
    // Dispatch parallel RPC calls directly to the Zcash node
    const [
      blockchainRes,
      mempoolRes,
      peersRes,
      solpsRes,
      deprecationRes
    ] = await Promise.all([
      callZcashRpc<BlockchainInfo>('getblockchaininfo', [], rpcUrl),
      callZcashRpc<MempoolInfo>('getmempoolinfo', [], rpcUrl),
      callZcashRpc<PeerInfo[]>('getpeerinfo', [], rpcUrl),
      callZcashRpc<number>('getnetworksolps', [], rpcUrl),
      callZcashRpc<any>('getdeprecationinfo', [], rpcUrl),
    ]);

    const isConnected = !blockchainRes.error && !!blockchainRes.result;
    const info = blockchainRes.result;

    const summary: TelemetrySummary = {
      nodeConnected: isConnected,
      nodeUrl: rpcUrl,
      network: info?.chain || 'testnet',
      blockHeight: info?.blocks ?? 0,
      estimatedHeight: info?.estimatedheight ?? info?.headers ?? info?.blocks ?? 0,
      bestBlockHash: info?.bestblockhash ?? '',
      difficulty: info?.difficulty ?? 0,
      verificationProgress: info?.verificationprogress ?? 0,
      solps: typeof solpsRes.result === 'number' ? solpsRes.result : 0,
      mempool: mempoolRes.result || { size: 0, bytes: 0, usage: 0 },
      peerCount: Array.isArray(peersRes.result) ? peersRes.result.length : 0,
      peers: Array.isArray(peersRes.result) ? peersRes.result : [],
      valuePools: info?.valuePools || [],
      upgrades: info?.upgrades || {},
      subversion: deprecationRes.result?.subversion || '/Zebra:6.3.0/',
      latencyMs: blockchainRes.durationMs || 0,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json(
      {
        nodeConnected: false,
        nodeUrl: rpcUrl,
        network: 'unknown',
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
        subversion: 'Unknown',
        latencyMs: 0,
        updatedAt: new Date().toISOString(),
        error: err.message,
      },
      { status: 500 }
    );
  }
}
