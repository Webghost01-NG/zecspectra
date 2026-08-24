'use client';

import React from 'react';
import { Shield, Radio, Activity, Terminal, Layers, Users, RefreshCw, Zap, Cpu } from '@/components/Icons';
import { TelemetrySummary } from '@/types/zcash';

interface NavbarProps {
  telemetry: TelemetrySummary | null;
  activeTab: 'dashboard' | 'streamer' | 'rpc' | 'explorer' | 'tools' | 'peers';
  setActiveTab: (tab: 'dashboard' | 'streamer' | 'rpc' | 'explorer' | 'tools' | 'peers') => void;
  isLoading: boolean;
  onRefresh: () => void;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
  network: 'mainnet' | 'testnet';
  setNetwork: (net: 'mainnet' | 'testnet') => void;
  onOpenConnectModal: () => void;
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
  onOpenConnectModal,
}) => {
  const isConnected = telemetry?.nodeConnected;

  return (
    <header className="sticky top-0 z-50 border-b border-zcash-border/80 bg-zcash-dark/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-zcash-gold/10 border border-zcash-gold/30 shadow-[0_0_15px_rgba(244,183,40,0.2)]">
              <Shield className="h-5 w-5 text-zcash-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Zec<span className="text-zcash-gold">Spectra</span>
                </span>
                {/* Network Switcher Pill */}
                <div className="flex items-center rounded-full bg-zcash-navy border border-zcash-border p-0.5 text-[10px] font-bold">
                  <button
                    onClick={() => setNetwork('mainnet')}
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      network === 'mainnet'
                        ? 'bg-zcash-gold text-zcash-dark font-black shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    MAINNET
                  </button>
                  <button
                    onClick={() => setNetwork('testnet')}
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      network === 'testnet'
                        ? 'bg-zcash-gold text-zcash-dark font-black shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    TESTNET
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400">Zcash Protocol Telemetry & Power Tools</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zcash-navy/90 p-1.5 rounded-xl border border-zcash-border">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-zcash-gold text-zcash-dark shadow-md shadow-zcash-gold/20 font-bold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Activity className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('streamer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'streamer'
                  ? 'bg-zcash-gold text-zcash-dark shadow-md shadow-zcash-gold/20 font-bold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Zap className="h-4 w-4" />
              Streamer
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'tools'
                  ? 'bg-zcash-gold text-zcash-dark shadow-md shadow-zcash-gold/20 font-bold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Cpu className="h-4 w-4" />
              Power Tools
            </button>
            <button
              onClick={() => setActiveTab('rpc')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'rpc'
                  ? 'bg-zcash-gold text-zcash-dark shadow-md shadow-zcash-gold/20 font-bold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Terminal className="h-4 w-4" />
              RPC Studio
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'explorer'
                  ? 'bg-zcash-gold text-zcash-dark shadow-md shadow-zcash-gold/20 font-bold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Layers className="h-4 w-4" />
              Explorer
            </button>
            <button
              onClick={() => setActiveTab('peers')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'peers'
                  ? 'bg-zcash-gold text-zcash-dark shadow-md shadow-zcash-gold/20 font-bold'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Users className="h-4 w-4" />
              Peers ({telemetry?.peerCount ?? 0})
            </button>
          </nav>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-3">
            {/* Auto-refresh Switch */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              title="Toggle 5s Auto-refresh"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                autoRefresh
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-zcash-border bg-zcash-navy text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Radio className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Auto (5s)</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zcash-border bg-zcash-navy text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-zcash-gold' : ''}`} />
            </button>

            {/* Connect Node Modal Trigger Pill */}
            <button
              onClick={onOpenConnectModal}
              title="Click to Connect Custom Local or Remote Node"
              className="flex items-center gap-2.5 rounded-xl border border-zcash-border bg-zcash-navy px-3.5 py-1.5 transition-all hover:border-zcash-gold/60"
            >
              <div className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isConnected ? 'animate-ping bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-zinc-100 leading-none">
                  {isConnected ? `${network.toUpperCase()} Live` : 'Node Offline'}
                </span>
                <span className="text-[9px] text-zcash-gold leading-tight mt-0.5">
                  ⚙️ Connect Node
                </span>
              </div>
            </button>

          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-zcash-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`text-xs px-2 py-1 rounded font-semibold whitespace-nowrap ${activeTab === 'dashboard' ? 'text-zcash-gold' : 'text-zinc-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('streamer')}
            className={`text-xs px-2 py-1 rounded font-semibold whitespace-nowrap ${activeTab === 'streamer' ? 'text-zcash-gold' : 'text-zinc-400'}`}
          >
            Streamer
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`text-xs px-2 py-1 rounded font-semibold whitespace-nowrap ${activeTab === 'tools' ? 'text-zcash-gold' : 'text-zinc-400'}`}
          >
            Power Tools
          </button>
          <button
            onClick={() => setActiveTab('rpc')}
            className={`text-xs px-2 py-1 rounded font-semibold whitespace-nowrap ${activeTab === 'rpc' ? 'text-zcash-gold' : 'text-zinc-400'}`}
          >
            RPC Studio
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`text-xs px-2 py-1 rounded font-semibold whitespace-nowrap ${activeTab === 'explorer' ? 'text-zcash-gold' : 'text-zinc-400'}`}
          >
            Explorer
          </button>
          <button
            onClick={() => setActiveTab('peers')}
            className={`text-xs px-2 py-1 rounded font-semibold whitespace-nowrap ${activeTab === 'peers' ? 'text-zcash-gold' : 'text-zinc-400'}`}
          >
            Peers
          </button>
        </div>
      </div>
    </header>
  );
};
