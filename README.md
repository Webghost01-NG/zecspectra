# 🔍 ZecSpectra — Zcash Network Telemetry & Developer Tools

> **Zcash Mini Build Challenge Submission**

A developer cockpit that connects to the Zcash network and displays live blockchain data. Built with Next.js 14 and Tailwind CSS.

## 🌐 Live Demo

**[https://zecspectra.vercel.app](https://zecspectra.vercel.app)**

## 🏛️ Dual-Mode Architecture

```
                                  ┌──► ⚡ Zcash Cloud RPC Gateway (24/7 Live Mainnet)
Browser UI ──► Vercel API Routes ─┤
                                  └──► 🖥️ Local Zebra Node (127.0.0.1:8232 via JSON-RPC 2.0)
```

ZecSpectra supports two seamless operational modes:
1. **⚡ Cloud RPC Gateway (Default)**: Connects to a live 24/7 Zcash mainnet RPC gateway with zero setup. Ideal for judges, web visitors, and instant exploratory queries.
2. **🖥️ Local Zebra Node**: For sovereign node operators and local developers running `zebrad` at `http://127.0.0.1:8232`.

The browser communicates exclusively with server-side Next.js Route Handlers (`/api/telemetry`, `/api/block`, `/api/rpc`, `/api/tx-stream`). Server-side handlers enforce strict read-only RPC allowlisting, IP rate-limiting, and input validation before executing queries. Upstream HTTP Basic Authentication is supported via `ZCASH_RPC_USER` and `ZCASH_RPC_PASSWORD` when connecting to password-protected nodes.

## ✅ Challenge Requirements Met

| Requirement | Status |
| :--- | :--- |
| Landing page | ✅ Polished responsive frontend with mode switcher |
| Connect to a Zcash node | ✅ 24/7 Cloud Gateway + Local Zebra node (`127.0.0.1:8232`) |
| Use at least 3 RPC methods | ✅ Uses 6 standard JSON-RPC 2.0 methods (see below) |
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
- **Address Prefix Classifier** — Classify Zcash addresses by prefix (Unified/Sapling/Transparent/Sprout)
- **Privacy Scorer** — Evaluate transaction privacy based on input/output pool combinations
- **ZIP-317 Fee Estimator** — Calculate standard transaction fees based on logical actions
- **ZEC Unit Converter** — Convert between ZEC, Zatoshis, and fiat valuation with real-time CoinGecko rate

## 📊 Data Sources

- **Primary**: Direct JSON-RPC 2.0 to your Zebra node (NU6.3-capable release)
- **Fallback**: Blockchair public indexer API (mainnet only, clearly labeled in the UI)
- **When neither is available**: The UI shows "Node Disconnected" — no fabricated data

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18+
- A running [Zebra](https://github.com/ZcashFoundation/zebra) node (NU6.3-capable release)

### Setup

```bash
# Clone
git clone https://github.com/Webghost01-NG/zecspectra.git
cd zecspectra

# Configure environment
cp .env.example .env.local
# Edit .env.local to point to your Zebra node:
#   ZCASH_MAINNET_RPC=http://127.0.0.1:8232
#   ZCASH_TESTNET_RPC=http://127.0.0.1:18232

# Install & run
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker (Zebra node)

Run Zebra with Docker Compose:

```bash
docker compose up -d
```

> **Configuration Note:** Ensure that the `zebra.toml` configuration file is mounted into the container (`- ./zebra.toml:/etc/zebrad.toml:ro`) to properly configure consensus sync, network parameters, and JSON-RPC endpoints.

### RPC Security & Production Setup

- **Local Development**: JSON-RPC should bind to `127.0.0.1:8232` to ensure local-only access.
- **Production Deployments**: Never expose the Zebra JSON-RPC port directly to the public internet. Use a reverse proxy (e.g. Nginx, Caddy, Cloudflare Tunnel, or an authenticated API gateway) with HTTPS and authentication for production access.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, Route Handlers)
- **Styling**: Tailwind CSS 3
- **Language**: TypeScript
- **Deployment**: Vercel
- **Node Communication**: JSON-RPC 2.0 via Next.js server-side Route Handlers to Zebra

## 📄 License

MIT

