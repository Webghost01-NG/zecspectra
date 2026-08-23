'use client';

import React from 'react';
import { Shield, Radio, Activity, Terminal, Layers, Users, RefreshCw } from '@/components/Icons';
import { TelemetrySummary } from '@/types/zcash';

interface NavbarProps {
  telemetry: TelemetrySummary | null;
  activeTab: 'dashboard' | 'rpc' | 'explorer' | 'peers';
  setActiveTab: (tab: 'dashboard' | 'rpc' | 'explorer' | 'peers') => void;
  isLoading: boolean;
  onRefresh: () => void;
  autoRefresh: boolean;
  setAutoRefresh: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  telemetry,
  activeTab,
  setActiveTab,
  isLoading,
  onRefresh,
  autoRefresh,
  setAutoRefresh,
}) => {
  const isConnected = telemetry?.nodeConnected;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <Shield className="h-5 w-5 text-amber-400" />
              <div className="absolute -inset-0.5 rounded-xl bg-amber-500/20 blur-sm -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white">
                  Zec<span className="text-amber-400">Spectra</span>
                </span>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-amber-300">
                  {telemetry?.network?.toUpperCase() || 'TESTNET'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Zcash Protocol Telemetry & RPC Studio</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('rpc')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'rpc'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Terminal className="h-3.5 w-3.5" />
              RPC Studio
            </button>
            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'explorer'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Block Explorer
            </button>
            <button
              onClick={() => setActiveTab('peers')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'peers'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Peers ({telemetry?.peerCount ?? 0})
            </button>
          </nav>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-3">
            {/* Auto-refresh Switch */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              title="Toggle 5s Auto-refresh"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                autoRefresh
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Radio className={`h-3 w-3 ${autoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Auto (5s)</span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 transition-all hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* Node Connection Pill */}
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-1.5">
              <div className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isConnected ? 'animate-ping bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-zinc-200 leading-none">
                  {isConnected ? 'Zebra Node Live' : 'Node Disconnected'}
                </span>
                {isConnected && (
                  <span className="text-[9px] text-zinc-400 leading-tight">
                    {telemetry?.latencyMs}ms RPC ping
                  </span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-zinc-850">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`text-xs px-2 py-1 rounded ${activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('rpc')}
            className={`text-xs px-2 py-1 rounded ${activeTab === 'rpc' ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}
          >
            RPC Studio
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`text-xs px-2 py-1 rounded ${activeTab === 'explorer' ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}
          >
            Explorer
          </button>
          <button
            onClick={() => setActiveTab('peers')}
            className={`text-xs px-2 py-1 rounded ${activeTab === 'peers' ? 'text-amber-400 font-bold' : 'text-zinc-400'}`}
          >
            Peers
          </button>
        </div>
      </div>
    </header>
  );
};
