'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';
import { Shield, AlertTriangle, Activity, DollarSign, Users, CheckCircle, User } from 'lucide-react';

// --- TYPES ---
interface LogEntry {
  timestamp: string;
  team: string;
  user: string;      // New field
  action: string;
  reason: string;
  mode: string;
  cost: number;
}

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
  const fetchLogs = async () => {
    try {
      // Point this to your localhost or App Runner URL
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/logs');
      const data = await res.json();
      setLogs(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  // Poll every 2 seconds
  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- CALCULATIONS ---
  const totalSpend = logs.reduce((acc, log) => acc + (log.cost || 0), 0);
  const blockedCount = logs.filter(l => l.action === 'BLOCKED').length;
  const safeCount = logs.filter(l => l.action === 'ALLOWED').length;

  // Group Spend by Team for the Chart
  const spendByTeam = logs.reduce((acc, log) => {
    acc[log.team] = (acc[log.team] || 0) + (log.cost || 0);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(spendByTeam).map(team => ({
    name: team,
    cost: spendByTeam[team]
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-400" />
            GateKeeper <span className="text-gray-500 font-light">Governance</span>
          </h1>
          <p className="text-gray-400 mt-1">Real-time AI Cost & Security Control Plane</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="font-semibold text-emerald-400">System Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total Spend (Session)</h3>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-bold text-white">${totalSpend.toFixed(5)}</p>
          <p className="text-xs text-gray-500 mt-2">Real-time estimate</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Active Teams</h3>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-white">{Object.keys(spendByTeam).length}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Threats Blocked</h3>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-4xl font-bold text-white">{blockedCount}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Safe Requests</h3>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-bold text-white">{safeCount}</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* COST BY TEAM CHART */}
        <div className="col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Cost Distribution by Team
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  cursor={{fill: '#374151', opacity: 0.4}}
                  formatter={(value: any) => [`$${value}`, 'Cost']}
                />
                <Legend />
                <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Estimated Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LOGS LIST */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
          <h3 className="text-lg font-semibold text-white mb-4">Live Transaction Feed</h3>
          <div className="overflow-y-auto h-64 space-y-3 pr-2">
            {logs.map((log, i) => (
              <div key={i} className={`p-3 rounded-lg border flex justify-between items-center ${
                log.action === 'BLOCKED' 
                  ? 'bg-red-900/20 border-red-800/50' 
                  : 'bg-emerald-900/10 border-emerald-800/30'
              }`}>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-500">{log.timestamp}</span>
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-200 capitalize">
                       <User className="w-3 h-3 text-gray-500" />
                       {log.user || 'Anonymous'} 
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
                        {log.team}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 pl-11">{log.reason}</p>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                    log.action === 'BLOCKED' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {log.action}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">${(log.cost || 0).toFixed(5)}</div>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center text-gray-500 py-10">Waiting for traffic...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}