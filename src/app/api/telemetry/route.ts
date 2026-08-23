import { NextRequest, NextResponse } from 'next/server';
import { callZcashRpc } from '@/lib/zcash-rpc';
import { BlockchainInfo, MempoolInfo, PeerInfo, TelemetrySummary } from '@/types/zcash';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = (searchParams.get('network') === 'mainnet' ? 'mainnet' : 'testnet') as 'mainnet' | 'testnet';

  try {
    const [
      blockchainRes,
      mempoolRes,
      peersRes,
      solpsRes,
      deprecationRes
    ] = await Promise.all([
      callZcashRpc<BlockchainInfo>('getblockchaininfo', [], network),
      callZcashRpc<MempoolInfo>('getmempoolinfo', [], network),
      callZcashRpc<PeerInfo[]>('getpeerinfo', [], network),
      callZcashRpc<number>('getnetworksolps', [], network),
      callZcashRpc<any>('getdeprecationinfo', [], network),
    ]);

    const isConnected = !blockchainRes.error && !!blockchainRes.result;
    const info = blockchainRes.result;

    const summary: TelemetrySummary = {
      nodeConnected: isConnected,
      nodeUrl: network === 'mainnet' ? 'Zcash Mainnet RPC' : 'Zcash Zebra Node (Testnet/Local)',
      network: info?.chain || (network === 'mainnet' ? 'main' : 'test'),
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
        nodeUrl: network,
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
        subversion: 'Unknown',
        latencyMs: 0,
        updatedAt: new Date().toISOString(),
        error: err.message,
      },
      { status: 500 }
    );
  }
}
