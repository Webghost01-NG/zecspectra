'use client';

import React from 'react';
import { Shield, Radio, Activity, Terminal, Layers, RefreshCw, Zap, Cpu, Server } from '@/components/Icons';
import { TelemetrySummary } from '@/types/zcash';

interface NavbarProps {
  telemetry: TelemetrySummary | null;
  activeTab: 'dashboard' | 'streamer' | 'rpc' | 'explorer' | 'tools';
  setActiveTab: (tab: 'dashboard' | 'streamer' | 'rpc' | 'explorer' | 'tools') => void;
  isLoading: boolean;
  onRefresh: () => void;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
  network: 'mainnet' | 'testnet';
  setNetwork: (net: 'mainnet' | 'testnet') => void;
  nodeMode: 'gateway' | 'local';
  setNodeMode: (mode: 'gateway' | 'local') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  telemetry,
  activeTab,
  setActiveTab,
  isLoading,
  onRefresh,
  autoRefresh,
  setAutoRefresh,
  network,
  setNetwork,
  nodeMode,
  setNodeMode,
}) => {
  const isConnected = telemetry?.nodeConnected;
  const dataSource = telemetry?.dataSource || 'none';

  return (
    <header className="sticky top-0 z-50 border-b border-zcash-border/80 bg-zcash-dark/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2">
          
          {/* Logo & Node Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-zcash-gold/10 border border-zcash-gold/30 shadow-[0_0_15px_rgba(244,183,40,0.2)]">
              <Shield className="h-4.5 w-4.5 text-zcash-gold" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Zec<span className="text-zcash-gold">Spectra</span>
                </span>

                {/* Connection Mode Toggle: Gateway vs Local Node */}
                <div className="flex items-center rounded-full bg-zcash-navy border border-zcash-border p-0.5 text-[10px] font-bold">
                  <button
                    onClick={() => setNodeMode('gateway')}
                    title="24/7 Live Cloud RPC Gateway for instant zero-config testing"
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${
                      nodeMode === 'gateway'
                        ? 'bg-emerald-500 text-zinc-950 font-black shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Zap className="h-2.5 w-2.5" />
                    <span>Gateway</span>
                  </button>
                  <button
                    onClick={() => setNodeMode('local')}
                    title="Connect to a local Zebra node running at http://127.0.0.1:8232"
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${
                      nodeMode === 'local'
                        ? 'bg-amber-500 text-zinc-950 font-black shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Server className="h-2.5 w-2.5" />
                    <span>Local Zebra</span>
                  </button>
                </div>

                {/* Mainnet vs Testnet Toggle */}
                <div className="flex items-center rounded-full bg-zcash-navy border border-zcash-border p-0.5 text-[10px] font-bold">
                  <button
                    onClick={() => setNetwork('mainnet')}
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      network === 'mainnet'
                        ? 'bg-zcash-gold text-zcash-dark font-black shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    MAIN
                  </button>
                  <button
                    onClick={() => setNetwork('testnet')}
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      network === 'testnet'
                        ? 'bg-zcash-gold text-zcash-dark font-black shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    TEST
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500">Zcash Protocol Telemetry & RPC Studio</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-zcash-navy/90 p-1 rounded-xl border border-zcash-border">
            {([
              { key: 'dashboard', label: 'Dashboard', icon: Activity },
              { key: 'streamer', label: 'Streamer', icon: Zap },
              { key: 'tools', label: 'Tools', icon: Cpu },
              { key: 'rpc', label: 'RPC Studio', icon: Terminal },
              { key: 'explorer', label: 'Explorer', icon: Layers },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === key
                    ? 'bg-zcash-gold text-zcash-dark shadow-md shadow-zcash-gold/20 font-bold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              title="Toggle 15s Auto-refresh"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                autoRefresh
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-zcash-border bg-zcash-navy text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Radio className={`h-3 w-3 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Auto</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zcash-border bg-zcash-navy text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-zcash-gold' : ''}`} />
            </button>

            {/* Status Pill */}
            <div className="flex items-center gap-2 rounded-xl border border-zcash-border bg-zcash-navy px-3 py-1.5">
              <div className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isConnected ? 'animate-ping bg-emerald-400' : 'bg-rose-400'
                }`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${
                  isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
              </div>
              <span className="text-[10px] font-bold text-zinc-200 leading-none">
                {isConnected
                  ? (nodeMode === 'gateway' ? 'Cloud Gateway' : 'Local Zebra')
                  : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex lg:hidden items-center justify-between gap-1 py-2 border-t border-zcash-border">
          <div className="flex items-center gap-0.5 sm:gap-1">
            {([
              { key: 'dashboard', label: 'Dash' },
              { key: 'streamer', label: 'Stream' },
              { key: 'tools', label: 'Tools' },
              { key: 'rpc', label: 'RPC' },
              { key: 'explorer', label: 'Explorer' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`text-[11px] sm:text-xs px-2 py-1 rounded font-semibold whitespace-nowrap transition-colors ${
                  activeTab === key ? 'text-zcash-gold bg-zcash-gold/10' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Mobile mode switch */}
          <div className="flex items-center rounded-full bg-zcash-navy border border-zcash-border p-0.5 text-[9px] font-bold shrink-0">
            <button
              onClick={() => setNodeMode(nodeMode === 'gateway' ? 'local' : 'gateway')}
              className="px-1.5 py-0.5 rounded-full bg-zcash-gold text-zcash-dark"
            >
              {nodeMode === 'gateway' ? 'GATEWAY' : 'LOCAL'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
