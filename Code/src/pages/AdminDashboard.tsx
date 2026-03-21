import React from 'react';
import { motion } from 'framer-motion';
import { Users, Database, Shield, Settings, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';

const INITIAL_USERS = [
  { id: '1', name: 'Anubhav', role: 'Patient', status: 'Active' },
  { id: '2', name: 'Dr. Michael Chen', role: 'Doctor', status: 'Active' },
  { id: '3', name: 'Robert Williams', role: 'Patient', status: 'Active' },
  { id: '4', name: 'Dr. Lisa Park', role: 'Doctor', status: 'Inactive' },
];

const AdminDashboard: React.FC = () => {
  const [usersList, setUsersList] = useState(INITIAL_USERS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSave = (id: string) => {
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, name: editName } : u));
    setEditingId(null);
  };

  return (
    <div className="container mx-auto px-6 py-16 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-primary uppercase">Infrastructure Control Panel</span>
        </div>
        <h1 className="text-6xl font-bold font-display text-white mb-2 tracking-tighter">
          System <span className="text-gradient">Root</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-light border-l border-white/10 pl-5">
           High-level orchestration of neural models, subject data lakes, and clinical access partitions.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { icon: Users, label: 'Population Count', value: '156' },
          { icon: Database, label: 'Records Ingested', value: '1,247' },
          { icon: Shield, label: 'Live Encryptions', value: '23' },
          { icon: Settings, label: 'Ensemble Nodes', value: '4' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-10 rounded-2xl border-white/5 relative group overflow-hidden"
          >
            <stat.icon className="w-5 h-5 text-primary mb-6 group-hover:scale-110 transition-transform" />
            <div className="text-4xl font-bold text-white mb-1 tracking-tighter font-mono">{stat.value}</div>
            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{stat.label}</div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 glass-card rounded-[32px] border-white/5 p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-brand opacity-20" />
          <h3 className="text-2xl font-bold text-white mb-8 tracking-tight flex items-center gap-4">
              Access Governance
              <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">v4.2.0</span>
          </h3>
          <div className="space-y-4">
            {usersList.map(u => (
              <div key={u.id} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                <div className="flex-1">
                  {editingId === u.id ? (
                    <div className="flex items-center gap-4">
                       <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave(u.id)}
                        className="bg-white/5 border border-primary/30 rounded-xl px-4 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-primary flex-1 font-light"
                      />
                      <button onClick={() => handleSave(u.id)} className="text-primary">
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="group/edit cursor-pointer" onClick={() => handleEdit(u.id, u.name)}>
                      <div className="flex items-center gap-3">
                        <p className="text-white font-medium group-hover/edit:text-primary transition-colors">{u.name}</p>
                        <Edit2 className="w-3 h-3 text-white/10 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mt-1">{u.role}</p>
                    </div>
                  )}
                </div>
                {!editingId && (
                  <span className={`text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full border ${u.status === 'Active' ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white/5 border-white/5 text-white/20'}`}>
                    {u.status}
                  </span>
                )}
              </div>
            ))}
          </div>
          <button className="mt-10 w-full py-4 rounded-full border border-dashed border-white/10 text-[10px] font-mono text-white/20 hover:text-white hover:border-white/30 transition-all uppercase tracking-[0.4em]">
            Sync LDAP Directory
          </button>
        </div>

        <div className="lg:col-span-6 glass-card rounded-[32px] border-white/5 p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full" />
          <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Intelligence Lake</h3>
          <div className="space-y-4">
            {[
              { name: 'ADNI MRI Dataset', size: '45.2 GB', records: '12,450', status: 'SYNCHRONIZED' },
              { name: 'Speech Corpus v2', size: '8.7 GB', records: '3,200', status: 'ACTIVE' },
              { name: 'Cognitive Test Results', size: '256 MB', records: '28,000', status: 'LIVE_STREAM' },
              { name: 'Facial Response Mesh', size: '1.2 GB', records: '900', status: 'ENCRYPTING' },
            ].map(d => (
              <div key={d.name} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                <div>
                  <p className="text-white font-medium mb-1">{d.name}</p>
                  <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{d.size} • {d.records} VECTORS</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Database className="w-4 h-4 text-white/10 group-hover:text-accent transition-colors" />
                    <span className="text-[8px] font-mono text-accent/40 group-hover:text-accent transition-colors">{d.status}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
             <div className="flex justify-between items-center mb-4">
                 <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.2em]">Model Persistence</span>
                 <span className="text-xs text-indigo-400 font-bold">99.98%</span>
             </div>
             <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 w-[99.98%]" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
