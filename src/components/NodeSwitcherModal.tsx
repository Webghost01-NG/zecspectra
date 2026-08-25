'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Zap, Server, Globe, CheckCircle2, AlertTriangle, RefreshCw, X } from '@/components/Icons';

export interface NodeConfig {
  mode: 'gateway' | 'local' | 'custom';
  localHost: string;
  localPort: string;
  customUrl: string;
  rpcUser?: string;
  rpcPassword?: string;
}

export const DEFAULT_NODE_CONFIG: NodeConfig = {
  mode: 'gateway',
  localHost: '127.0.0.1',
  localPort: '8232',
  customUrl: '',
  rpcUser: '',
  rpcPassword: '',
};

interface NodeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: NodeConfig;
  onSaveConfig: (config: NodeConfig) => void;
}

export const NodeSwitcherModal: React.FC<NodeSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
}) => {
  const [config, setConfig] = useState<NodeConfig>(currentConfig);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  useEffect(() => {
    setConfig(currentConfig);
    setTestResult(null);
  }, [currentConfig, isOpen]);

  if (!isOpen) return null;

  const getComputedUrl = () => {
    if (config.mode === 'gateway') return 'Zcash Cloud RPC Gateway (24/7 Live Mainnet)';
    if (config.mode === 'local') return `http://${config.localHost || '127.0.0.1'}:${config.localPort || '8232'}`;
    return config.customUrl || 'Not configured';
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const targetUrl = config.mode === 'local'
      ? `http://${config.localHost || '127.0.0.1'}:${config.localPort || '8232'}`
      : config.customUrl;

    try {
      const res = await fetch('/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'getblockchaininfo',
          params: [],
          network: 'mainnet',
          nodeMode: config.mode,
          customRpc: config.mode !== 'gateway' ? {
            url: targetUrl,
            user: config.rpcUser,
            password: config.rpcPassword,
          } : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.result) {
        setTestResult({
          success: true,
          message: `Connected! Chain: ${data.result.chain}, Height: #${data.result.blocks?.toLocaleString()}`,
          latencyMs: data.durationMs || 45,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error?.message || 'Connection failed. Check host, port, or CORS.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to reach endpoint.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveConfig(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl border border-zcash-border bg-zcash-dark p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6 text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zcash-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zcash-gold/10 border border-zcash-gold/30 text-zcash-gold">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">Zcash Node RPC Settings</h2>
              <p className="text-xs text-zinc-400">Configure your connection to any local or remote Zcash node</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-zcash-navy border border-zcash-border text-xs font-bold">
          <button
            onClick={() => { setConfig({ ...config, mode: 'gateway' }); setTestResult(null); }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all ${
              config.mode === 'gateway'
                ? 'bg-emerald-500 text-zinc-950 font-black shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Zap className="h-4 w-4 shrink-0" />
            <span>Cloud Gateway</span>
          </button>

          <button
            onClick={() => { setConfig({ ...config, mode: 'local' }); setTestResult(null); }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all ${
              config.mode === 'local'
                ? 'bg-zcash-gold text-zinc-950 font-black shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Server className="h-4 w-4 shrink-0" />
            <span>Local Node</span>
          </button>

          <button
            onClick={() => { setConfig({ ...config, mode: 'custom' }); setTestResult(null); }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all ${
              config.mode === 'custom'
                ? 'bg-blue-500 text-zinc-950 font-black shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span>Remote RPC</span>
          </button>
        </div>

        {/* Mode Content */}
        <div className="space-y-4">
          {config.mode === 'gateway' && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>24/7 Zero-Config Cloud RPC Gateway</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">
                Connects to high-availability Zcash JSON-RPC 2.0 endpoints streaming real-time mainnet blocks, mempool, and pool balances.
              </p>
            </div>
          )}

          {config.mode === 'local' && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-zinc-300">
                <p className="font-bold text-amber-400 mb-1">Local Node Configuration</p>
                <p>Enter the host and port where your local node (Zebra or zcashd) is running.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Host / IP</label>
                  <input
                    type="text"
                    value={config.localHost}
                    onChange={(e) => setConfig({ ...config, localHost: e.target.value })}
                    placeholder="127.0.0.1 or localhost"
                    className="w-full rounded-xl border border-zcash-border bg-zcash-navy px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-zcash-gold focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">Port</label>
                  <input
                    type="text"
                    value={config.localPort}
                    onChange={(e) => setConfig({ ...config, localPort: e.target.value })}
                    placeholder="8232"
                    className="w-full rounded-xl border border-zcash-border bg-zcash-navy px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-zcash-gold focus:outline-none font-mono"
                  />
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 font-mono">
                Target URL: <span className="text-zcash-gold">{getComputedUrl()}</span>
              </p>
            </div>
          )}

          {config.mode === 'custom' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase">Remote RPC URL</label>
                <input
                  type="text"
                  value={config.customUrl}
                  onChange={(e) => setConfig({ ...config, customUrl: e.target.value })}
                  placeholder="https://your-remote-node.com:8232"
                  className="w-full rounded-xl border border-zcash-border bg-zcash-navy px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-zcash-gold focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">RPC Username (Optional)</label>
                  <input
                    type="text"
                    value={config.rpcUser || ''}
                    onChange={(e) => setConfig({ ...config, rpcUser: e.target.value })}
                    placeholder="zcashrpc"
                    className="w-full rounded-xl border border-zcash-border bg-zcash-navy px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-zcash-gold focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase">RPC Password (Optional)</label>
                  <input
                    type="password"
                    value={config.rpcPassword || ''}
                    onChange={(e) => setConfig({ ...config, rpcPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-zcash-border bg-zcash-navy px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-zcash-gold focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test Result Box */}
          {testResult && (
            <div className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
              testResult.success
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <span>{testResult.message}</span>
              </div>
              {testResult.latencyMs && (
                <span className="font-mono text-[11px] font-bold">{testResult.latencyMs}ms</span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-zcash-border pt-4">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-1.5 rounded-xl border border-zcash-border bg-zcash-navy px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin text-zcash-gold' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl bg-zcash-gold px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-zcash-gold/20 hover:bg-yellow-400 transition-all"
            >
              Apply & Save
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
