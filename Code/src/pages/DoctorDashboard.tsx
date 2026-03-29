import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, FileText, Brain, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchPatients } from '../services/api';
import { useEffect } from 'react';

// Patient data overview for clinical monitoring
const INITIAL_PATIENT_DATA = [
  { id: 'p1', name: 'Anubhav', lastScore: 32, trend: 'stable', lastVisit: '2024-12-01', sessions: 5 },
  { id: 'p2', name: 'Robert Williams', lastScore: 58, trend: 'increasing', lastVisit: '2024-11-28', sessions: 8 },
  { id: 'p3', name: 'Maria Garcia', lastScore: 74, trend: 'increasing', lastVisit: '2024-12-03', sessions: 12 },
  { id: 'p4', name: 'James Anderson', lastScore: 21, trend: 'decreasing', lastVisit: '2024-11-30', sessions: 3 },
  { id: 'p5', name: 'Emily Davis', lastScore: 45, trend: 'stable', lastVisit: '2024-12-02', sessions: 6 },
];

const precisionTrendData = [
  { month: 'Jul', avgPrecision: 38 },
  { month: 'Aug', avgPrecision: 40 },
  { month: 'Sep', avgPrecision: 42 },
  { month: 'Oct', avgPrecision: 39 },
  { month: 'Nov', avgPrecision: 44 },
  { month: 'Dec', avgPrecision: 43 },
];

const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        const result = await fetchPatients(15, 0, search);
        setPatients(result.data);
        setTotalPatients(result.total);
      } catch (err) {
        console.error('Failed to load subjects', err);
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(loadPatients, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSave = (id: string) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, name: editName } : p));
    setEditingId(null);
  };

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-primary uppercase">Clinical Surveillance Matrix</span>
        </div>
        <h1 className="text-6xl font-bold font-display text-white mb-2 tracking-tighter">
          Clinician <span className="text-gradient">Command</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-light border-l border-white/10 pl-5">
           Deep-tier monitoring of multidimensional cognitive assessment vectors across active subject pools.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: Users, label: 'Active Subjects', value: totalPatients.toLocaleString(), color: 'text-primary' },
          { icon: Brain, label: 'Implementation Pool', value: '10k+', color: 'text-accent' },
          { icon: TrendingUp, label: 'Clinical Reach', value: '6000+', color: 'text-red-400' },
          { icon: FileText, label: 'Analytics Syncs', value: 'Instant', color: 'text-indigo-400' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 rounded-2xl border-white/5 relative overflow-hidden group"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-6 group-hover:scale-110 transition-transform`} />
            <div className="text-4xl font-bold text-white mb-1 tracking-tighter font-mono">{stat.value}</div>
            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{stat.label}</div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-primary/5 transition-all" />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 glass-card rounded-[32px] border-white/5 p-10 relative">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Global Precision Delta</h3>
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.4em]">Mean Population Intelligence</p>
            </div>
            <div className="px-4 py-1.5 bg-white/[0.03] border border-white/10 rounded-full text-[10px] font-mono text-primary/60">
              STATUS: AGGREGATING
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={precisionTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontVariant: 'small-caps', fontWeight: 600 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis domain={[0, 100]} hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0b14', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '16px', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="avgPrecision" 
                stroke="hsl(var(--primary))" 
                strokeWidth={4} 
                dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }} 
                activeDot={{ r: 6, fill: '#fff', stroke: 'hsl(var(--primary))', strokeWidth: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-4 glass-card rounded-[32px] border-white/5 p-10 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/5 blur-[80px] rounded-full" />
          <h3 className="text-xl font-bold text-white mb-8">Subject Distribution</h3>
          <div className="space-y-10">
            {[
              { label: 'Baseline (Sync High)', count: 2, color: 'bg-primary' },
              { label: 'Moderate Offset', count: 2, color: 'bg-accent' },
              { label: 'Critical Variance', count: 1, color: 'bg-red-400' },
            ].map((r, i) => (
              <div key={r.label} className="relative pl-8 group">
                <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${r.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-1">{r.label}</p>
                        <p className="text-lg font-bold text-white/80">{r.count} SUBJECTS</p>
                    </div>
                    <span className="text-xs font-mono text-white/10 italic">#{i+102}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[32px] border-white/5 overflow-hidden">
        <div className="p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Active Surveillance List</h3>
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mt-1">Cross-referencing {totalPatients} implementations</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative group w-full md:w-64">
              <input 
                type="text" 
                placeholder="Search Subjects..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary/50 transition-all font-mono"
              />
            </div>
            <div className="flex gap-2 shrink-0">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-mono text-primary uppercase tracking-widest">Live Sync</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="p-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Subject Identifier</th>
                <th className="p-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Sync Accuracy</th>
                <th className="p-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Trajectory</th>
                <th className="p-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Session Count</th>
                <th className="p-8 text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">Last Pulse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {patients.map(p => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-[10px] text-white/30 font-mono">
                          {p.id}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{p.name}</span>
                        <span className="text-[10px] font-mono text-white/20 uppercase">{p.gender}, Age {p.age}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-2">
                        <span className={`text-xl font-bold font-mono tracking-tighter ${p.riskLevel === 'Low' ? 'text-primary' : p.riskLevel === 'Early' ? 'text-accent' : 'text-red-400'}`}>
                          {p.condition}
                        </span>
                    </div>
                  </td>
                  <td className="p-8">
                      <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
                        {p.riskLevel}
                      </span>
                  </td>
                  <td className="p-8">
                      <span className="text-sm font-light text-white/60">{p.status}</span>
                  </td>
                  <td className="p-8">
                      <span className="text-xs font-mono text-white/20">{p.lastConsultation}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
