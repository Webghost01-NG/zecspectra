# 🛡️ ZecSpectra — Zcash Protocol Telemetry & RPC Studio

> **Submission for the Zcash Mini Build Challenge (August 2026)**  
> *A high-performance, real-time developer cockpit directly connected to a live Zcash Zebra node.*

---

## 🚀 Overview

**ZecSpectra** is an interactive, real-time blockchain telemetry dashboard and JSON-RPC studio for the Zcash network. Built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**, it communicates directly with a local or remote Zcash node (`zebrad` / `zcashd`) over JSON-RPC 2.0 without dummy data or mocked state.

### 🌟 Key Features

1. **Live Network Telemetry Dashboard:** Real-time stream of block height, network Sol/s (Equihash hashrate), target difficulty, mempool size/bytes, active peer count, and node verification progress with 5-second auto-polling.
2. **Shielded & Transparent Pool Breakdown:** Visualizes circulating ZEC across zero-knowledge proving pools (**Sprout**, **Sapling**, **Orchard / Halo 2**, **Lockbox**, and **Transparent**).
3. **Network Consensus Upgrades Tracker:** Monitors network upgrade activation heights (Overwinter, Sapling, Blossom, Heartwood, Canopy, NU5/Halo 2, NU6) and active consensus branch IDs.
4. **Interactive Zcash RPC Studio:** An in-browser RPC playground allowing developers to execute arbitrary JSON-RPC 2.0 commands, test pre-configured queries, inspect raw responses, measure latency in milliseconds, and copy copy-pasteable `cURL` commands.
5. **Block & Transaction Dissector:** Search any block by height or 64-character hash (`getblock` & `getblockhash`) with full header and transaction breakdown.
6. **Peer Network Mesh:** Real-time table of connected P2P nodes, IP addresses, client subversions (e.g., `/Zebra:6.3.0/`), and protocol versions.

---

## 📡 Zcash RPC Methods Used

ZecSpectra integrates **6+ native Zcash JSON-RPC methods**:

| RPC Method | Parameters | Description |
| :--- | :--- | :--- |
| `getblockchaininfo` | `[]` | Retrieves current block height, difficulty, verification progress, value pools (Sprout, Sapling, Orchard), and consensus upgrade activation status. |
| `getpeerinfo` | `[]` | Lists all active connected P2P peers, network addresses, direction (inbound/outbound), and subversion. |
| `getmempoolinfo` | `[]` | Returns unconfirmed transaction count, total memory footprint, and byte usage. |
| `getnetworksolps` | `[]` | Fetches live Equihash solutions-per-second (network hashrate estimate). |
| `getblock` | `[hash, 1]` | Fetches parsed block header, Merkle root, difficulty bits, timestamp, and transaction list. |
| `getblockhash` | `[height]` | Resolves a block height to its canonical 64-character block hash. |
| `getdeprecationinfo`| `[]` | Retrieves node client version, build details, and upgrade sunset height. |

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zero-dependency SVG Icon System.
- **Backend API Layer:** Next.js Server Route Handlers (`/api/telemetry`, `/api/rpc`, `/api/block`) acting as a secure JSON-RPC proxy to avoid CORS and manage RPC credentials.
- **Node Engine:** Official Zcash Foundation **Zebra** Rust Node (`zfnd/zebra:latest`) running via Docker on Testnet.

---

## ⚡ How to Run Locally

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- [Node.js](https://nodejs.org/) v18+ & npm

### Step 1: Start the Zcash Zebra Node
Launch the Zebra node in background:
```bash
docker compose up -d
```
*The node will bind RPC to `http://localhost:18232` and begin syncing Zcash network blocks and peers immediately.*

### Step 2: Start the ZecSpectra Web App
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification / Live RPC Testing

You can verify that the node is running and returning real data via `curl`:

```bash
# Query blockchain info
curl -X POST http://127.0.0.1:18232 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"1","method":"getblockchaininfo","params":[]}'
```

---

## 🏆 Hackathon Criteria Compliance

- ✅ **Landing Page:** Clean dark-mode developer console at `/`.
- ✅ **Connect to a Zcash node:** Connected directly to a local Zebra node on `http://127.0.0.1:18232`.
- ✅ **Use at least 3 RPC methods:** Uses 6+ methods (`getblockchaininfo`, `getpeerinfo`, `getmempoolinfo`, `getnetworksolps`, `getblock`, `getblockhash`).
- ✅ **Display live blockchain data:** Auto-refreshing telemetry for block height, difficulty, mempool, Sol/s, shielded pools, and peers.
- ✅ **README:** Comprehensive documentation and 1-command startup instructions included.
