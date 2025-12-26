'use client';

import { useState, useEffect } from 'react';
import { Shield, DollarSign, AlertTriangle, Activity, Server } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LogEntry {
  timestamp: string;
  action: string;
  reason: string;
  mode: string;
}

const CHART_DATA = [
  { time: '10am', actualSpend: 120, unprotectedSpend: 380 },
  { time: '11am', actualSpend: 140, unprotectedSpend: 420 },
  { time: '12pm', actualSpend: 110, unprotectedSpend: 450 },
  { time: '1pm', actualSpend: 160, unprotectedSpend: 520 },
  { time: '2pm', actualSpend: 130, unprotectedSpend: 480 },
  { time: '3pm', actualSpend: 150, unprotectedSpend: 510 },
  { time: '4pm', actualSpend: 140, unprotectedSpend: 490 },
];

export default function Dashboard() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState("CONNECTING...");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080';
      
        const response = await fetch(`${apiUrl}/logs`);
        if (response.ok) {
          const data = await response.json();
          // FIX: Ensure data is actually an array before setting it
          if (Array.isArray(data)) {
            setLogs(data);
            setConnectionStatus("ONLINE");
          } else {
            console.error("Received non-array data:", data);
            setLogs([]); // Fallback to empty list
          }
        } else {
          setConnectionStatus("ERROR");
        }
      } catch (error) {
        setConnectionStatus("OFFLINE");
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  // FIX: Safety check before running .filter or accessing index [0]
  const safeLogs = Array.isArray(logs) ? logs : [];
  const currentMode = safeLogs.length > 0 ? safeLogs[0].mode : "UNKNOWN";
  const blockedCount = safeLogs.filter(l => l.action === 'BLOCKED').length;

  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="text-blue-500" size={32} />
              GateKeeper Policy Studio
            </h1>
            <p className="text-gray-400">AI Firewall Monitoring Dashboard</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${connectionStatus === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            Server: {connectionStatus}
          </div>
        </div>

        {/* Status Cards - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Status Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">System Mode</h3>
              <Activity className="text-gray-400" size={20} />
            </div>
            <div className="flex items-center gap-3">
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  currentMode === 'ENFORCE' ? 'bg-red-600' : 'bg-yellow-600'
                }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    currentMode === 'ENFORCE' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
              <span className={`font-bold tracking-wider ${currentMode === 'ENFORCE' ? 'text-red-400' : 'text-yellow-400'}`}>
                {currentMode} MODE
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Controlled via AWS S3</p>
          </div>

          {/* Savings Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">Projected Savings</h3>
              <DollarSign className="text-green-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-green-400">$1,420.50</div>
            <p className="text-sm text-gray-400 mt-1">Based on token reduction</p>
          </div>

          {/* Threats Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">Threats Blocked</h3>
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <div className="text-3xl font-bold text-red-400">{blockedCount}</div>
            <p className="text-sm text-gray-400 mt-1">In current session</p>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-200 mb-6">Cost Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#F3F4F6' }}
                  formatter={(value: number, name: string) => [`$${value}`, name === 'actualSpend' ? 'Actual Spend' : 'Unprotected Spend']}
                />
                <Area type="monotone" dataKey="unprotectedSpend" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} />
                <Area type="monotone" dataKey="actualSpend" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Logs */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <Server size={18} className="text-blue-400" />
              Live Activity Logs
            </h3>
            <span className="text-xs text-gray-500 animate-pulse">● Polling http://127.0.0.1:3000/logs</span>
          </div>
          
          <div className="bg-black rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm border border-gray-800 custom-scrollbar">
            {safeLogs.length === 0 ? (
              <div className="text-gray-600 text-center py-10">Waiting for traffic...</div>
            ) : (
              safeLogs.map((log, index) => (
                <div key={index} className="mb-3 pb-3 border-b border-gray-900 last:border-0 hover:bg-gray-900/30 p-2 rounded transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">[{log.timestamp}]</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                        log.action === 'BLOCKED' ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 'bg-green-900/30 text-green-400 border border-green-900/50'
                      }`}>
                        {log.action}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 uppercase">{log.mode} MODE</span>
                  </div>
                  <div className="pl-[5.5rem] text-gray-300">
                    {log.reason}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}