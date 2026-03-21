import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FileText, Download, Brain, Mic, Activity, CheckCircle } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import PageShell from '@/components/ui/PageShell';
import { useLanguage } from '@/contexts/LanguageContext';
import { MRIResult, SpeechResult, CognitiveTestResult, RiskAssessment } from '@/types';

type SessionType = 'MRI' | 'SPEECH' | 'COGNITIVE' | 'FUSED';

interface UnifiedSession {
  id: string;
  date: string;
  type: SessionType;
  score: number;
  classification?: string;
  original: any;
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  if (!user) return null;
  const isHindi = language === 'hi';
  
  const copy = isHindi
    ? {
        badge: 'लॉन्गिट्यूडिनल डेटा आर्काइव',
        titleA: 'इंटेलिजेंस',
        titleB: 'लॉग्स',
        description: 'हाई-फिडेलिटी डायग्नोस्टिक रिकॉर्ड्स और न्यूरल टेलीमेट्री रिपोर्ट्स को एक्सेस और एक्सपोर्ट करें।',
        empty: 'डेटा स्ट्रीम खाली है। डायग्नोस्टिक साइकल पूरा करें।',
        export: 'पीडीएफ एक्सपोर्ट करें',
        accuracy: 'सटीकता',
        module: 'मॉड्यूल: सिंक्रोनाइज़्ड',
      }
    : {
        badge: 'Longitudinal Data Archive',
        titleA: 'Intelligence',
        titleB: 'Logs',
        description: 'Access and export high-fidelity diagnostic records and neural telemetry reports.',
        empty: 'Data stream empty. Complete a diagnostic cycle.',
        export: 'Export PDF',
        accuracy: 'Accuracy',
        module: 'Module: Synchronized',
      };

  const fusedRisks = dataStore.getRiskAssessments(user.id);
  const mriResults = dataStore.getMRIResults(user.id);
  const speechResults = dataStore.getSpeechResults(user.id);
  const cognitiveResults = dataStore.getCognitiveResults(user.id);

  const allSessions: UnifiedSession[] = [
    ...fusedRisks.map(r => ({ id: r.id, date: r.date, type: 'FUSED' as SessionType, score: r.overallRisk, classification: r.classification, original: r })),
    ...mriResults.map(r => ({ id: r.id, date: r.date, type: 'MRI' as SessionType, score: r.precisionScore, classification: r.classification, original: r })),
    ...speechResults.map(r => ({ id: r.id, date: r.date, type: 'SPEECH' as SessionType, score: r.precisionScore, classification: r.classification, original: r })),
    ...cognitiveResults.map(r => ({ id: r.id, date: r.date, type: 'COGNITIVE' as SessionType, score: r.overallScore, original: r })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const generatePDF = (session: UnifiedSession) => {
    const doc = new jsPDF();
    let y = 20;

    // Report Header
    doc.setFontSize(22);
    doc.setTextColor(0, 245, 155); // Primary color
    doc.text('NEUROSENSE AI', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`PRECISION ${session.type} DIAGNOSTIC REPORT`, 20, y);
    y += 15;

    doc.setDrawColor(30, 30, 40);
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Patient Identifier: ${user.name}`, 20, y); y += 6;
    doc.text(`Synchronization Date: ${new Date(session.date).toUTCString()}`, 20, y); y += 6;
    doc.text(`Protocol ID: ${session.id.toUpperCase()}`, 20, y); y += 12;

    doc.setFontSize(14);
    doc.setTextColor(0, 245, 155);
    doc.text('Metric Analysis', 20, y); y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Precision/Risk Score: ${Math.round(session.score)}%`, 20, y); y += 6;
    if (session.classification) {
      doc.text(`Clinical Stage Classification: ${session.classification}`, 20, y); y += 6;
    }
    y += 6;

    if (session.type === 'FUSED') {
      const r = session.original as RiskAssessment;
      doc.text(`MRI Signal processing: ${r.mriScore}%`, 20, y); y += 6;
      doc.text(`Vocal Pattern Intelligence: ${r.speechScore}%`, 20, y); y += 6;
      doc.text(`Cognitive Response Matrix: ${r.cognitiveScore}%`, 20, y); y += 12;
    } else if (session.type === 'MRI') {
      const r = session.original as MRIResult;
      doc.text('Imaging Findings:', 20, y); y += 8;
      doc.setFontSize(10);
      r.findings.forEach(f => { doc.text(`[SCAN] ${f}`, 25, y); y += 5; });
    } else if (session.type === 'SPEECH') {
      const r = session.original as SpeechResult;
      doc.text('Transcription Segment:', 20, y); y += 8;
      doc.setFontSize(10);
      doc.text(r.transcript ? r.transcript.slice(0, 100) + '...' : 'Not available', 25, y);
    }

    doc.save(`NEUROSENSE_${session.type}_${session.id.slice(0, 8)}.pdf`);
    toast.success('Clinical telemetry exported');
  };

  const getIcon = (type: SessionType) => {
    switch(type) {
      case 'MRI': return <Brain className="w-5 h-5" />;
      case 'SPEECH': return <Mic className="w-5 h-5" />;
      case 'COGNITIVE': return <Activity className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <PageShell glowClassName="bg-indigo-400/5" secondaryGlowClassName="bg-primary/10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-primary uppercase">{copy.badge}</span>
        </div>
        <h1 className="text-6xl font-bold font-display text-white mb-2 tracking-tighter">
          {copy.titleA} <span className="text-gradient-brand">{copy.titleB}</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl font-light border-l border-white/10 pl-5">
           {copy.description}
        </p>
      </motion.div>

      {allSessions.length === 0 ? (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 rounded-[40px] border border-dashed border-white/5 bg-white/[0.01]"
        >
          <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-8">
            <FileText className="w-8 h-8 text-white/10" />
          </div>
          <p className="text-white/20 font-mono text-sm uppercase tracking-[0.4em]">{copy.empty}</p>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {allSessions.map((session, i) => (
            <motion.div 
                key={session.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group glass-card rounded-3xl p-8 flex items-center justify-between border-white/5 hover:border-primary/20 hover:bg-white/[0.02] transition-all duration-500"
            >
              <div className="flex items-center gap-8">
                <div className={`w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:border-primary/40 transition-all duration-700 ${session.type === 'FUSED' ? 'bg-primary/5 border-primary/20' : ''}`}>
                  <div className={`${session.type === 'FUSED' ? 'text-primary' : 'text-white/20 group-hover:text-primary'} transition-colors`}>
                    {getIcon(session.type)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-2">
                      <p className="font-bold text-white text-xl tracking-tighter group-hover:text-primary transition-colors">{session.type}_LOG_{session.id.slice(0, 8).toUpperCase()}</p>
                      <div className="h-1 w-1 rounded-full bg-white/10" />
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {session.classification && (
                      <span className={`text-[10px] font-mono px-3 py-1 rounded-full border tracking-widest uppercase font-bold ${
                          session.classification === 'Low' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-400/5' : 
                          session.classification === 'Moderate' ? 'border-yellow-500/20 text-yellow-400 bg-yellow-400/5' : 
                          'border-red-500/20 text-red-400 bg-red-400/5'
                      }`}>
                        {session.classification} STAGE
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em] font-medium">Session Precision: {Math.round(session.score)}%</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => generatePDF(session)}
                className="h-14 px-10 rounded-full bg-white/5 border border-white/10 text-white hover:bg-primary hover:text-black hover:border-primary transition-all duration-500 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] font-bold"
              >
                <Download className="w-4 h-4" /> {copy.export}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default Reports;
