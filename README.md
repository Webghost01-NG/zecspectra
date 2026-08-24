# 🔍 ZecSpectra — Zcash Network Telemetry & Developer Tools

> **Zcash Mini Build Challenge Submission**

A developer cockpit that connects to the Zcash network and displays live blockchain data. Built with Next.js 14 and Tailwind CSS.

## 🌐 Live Demo

**[https://zecspectra.vercel.app](https://zecspectra.vercel.app)**

## ✅ Challenge Requirements Met

| Requirement | Status |
| :--- | :--- |
| Landing page | ✅ Polished responsive frontend |
| Connect to a Zcash node | ✅ Configure via `.env` (local Zebra/zcashd or remote) |
| Use at least 3 RPC methods | ✅ Uses 6 RPC methods (see below) |
| Display live blockchain data | ✅ Block height, difficulty, mempool, peers, hashrate |

## 📡 RPC Methods Used

| # | Method | What it provides |
| :--- | :--- | :--- |
| 1 | `getblockchaininfo` | Block height, difficulty, value pools, consensus upgrades |
| 2 | `getpeerinfo` | Connected P2P nodes, versions, latency |
| 3 | `getmempoolinfo` | Unconfirmed transaction count and mempool size |
| 4 | `getnetworksolps` | Equihash proof-of-work hashrate (solutions/sec) |
| 5 | `getblock` | Block header, Merkle root, and transaction list |
| 6 | `getblockhash` | Look up block hash by height |

## 🏗️ Features

- **Dashboard** — Live network metrics: block height, difficulty, hashrate, mempool, peer count
- **Transaction Streamer** — Confirmed transactions from the latest mined block
- **Block Explorer** — Look up any block by height or hash, view header and transactions
- **RPC Studio** — Execute raw JSON-RPC 2.0 commands against the node and view responses
- **Address Inspector** — Classify Zcash addresses by prefix (Unified/Sapling/Transparent/Sprout)
- **Privacy Scorer** — Evaluate transaction privacy based on input/output pool combinations
- **ZIP-317 Fee Estimator** — Calculate standard transaction fees based on logical actions
- **ZEC Unit Converter** — Convert between ZEC, Zatoshis, and fiat valuation

## 📊 Data Sources

- **Primary**: Direct JSON-RPC 2.0 to your Zcash node (Zebra or zcashd)
- **Fallback**: Blockchair public indexer API (mainnet only, clearly labeled in the UI)
- **When neither is available**: The UI shows "Node Disconnected" — no fabricated data

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18+
- A running Zcash node ([Zebra](https://github.com/ZcashFoundation/zebra) or [zcashd](https://github.com/zcash/zcash))

### Setup

```bash
# Clone
git clone https://github.com/Webghost01-NG/zecspectra.git
cd zecspectra

# Configure environment
cp .env.example .env.local
# Edit .env.local to point to your node:
#   ZCASH_MAINNET_RPC=http://127.0.0.1:8232
#   ZCASH_TESTNET_RPC=http://127.0.0.1:18232

# Install & run
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker (Zebra node)

```bash
docker run -p 8232:8232 zfnd/zebra:latest
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Route Handlers)
- **Styling**: Tailwind CSS 3
- **Language**: TypeScript
- **Deployment**: Vercel
- **Node Communication**: JSON-RPC 2.0 via Next.js server-side Route Handlers

## 📄 License

MIT
