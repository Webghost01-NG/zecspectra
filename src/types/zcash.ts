export interface ValuePool {
  id: 'transparent' | 'sprout' | 'sapling' | 'orchard' | 'lockbox' | 'ironwood' | string;
  chainValue: number;
  chainValueZat: number;
  monitored: boolean;
}

export interface NetworkUpgrade {
  name: string;
  activationheight: number;
  status: 'pending' | 'active' | 'disabled';
}

export interface BlockchainInfo {
  chain: string;
  blocks: number;
  headers: number;
  difficulty: number;
  verificationprogress: number;
  chainwork: string | number;
  pruned: boolean;
  size_on_disk?: number;
  commitments?: number;
  bestblockhash: string;
  estimatedheight?: number;
  chainSupply?: {
    chainValue: number;
    chainValueZat: number;
    monitored: boolean;
  };
  valuePools?: ValuePool[];
  upgrades?: Record<string, NetworkUpgrade>;
  consensus?: {
    chaintip: string;
    nextblock: string;
  };
}

export interface PeerInfo {
  addr: string;
  services: string;
  lastrecv: number;
  inbound: boolean;
  banscore: number;
  subver: string;
  version: number;
  connection_state?: string;
  synced_blocks?: number;
  pingtime?: number;
}

export interface MempoolInfo {
  size: number;
  bytes: number;
  usage: number;
}

export interface BlockHeader {
  hash: string;
  confirmations: number;
  height: number;
  version: number;
  merkleroot: string;
  time: number;
  nonce: string;
  bits: string;
  difficulty: number;
  chainwork: string;
  previousblockhash?: string;
  nextblockhash?: string;
  tx?: string[];
  trees?: {
    sapling?: { size: number };
    orchard?: { size: number };
  };
}

export interface TelemetrySummary {
  nodeConnected: boolean;
  nodeUrl: string;
  network: string;
  blockHeight: number;
  estimatedHeight: number;
  bestBlockHash: string;
  difficulty: number;
  verificationProgress: number;
  solps: number;
  mempool: MempoolInfo;
  peerCount: number;
  peers: PeerInfo[];
  valuePools: ValuePool[];
  upgrades: Record<string, NetworkUpgrade>;
  subversion: string;
  latencyMs: number;
  updatedAt: string;
}

export interface RpcResponse<T = any> {
  jsonrpc: string;
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  } | null;
  durationMs?: number;
}
