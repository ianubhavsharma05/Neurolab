import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { dataStore } from '@/store/dataStore';
import RiskGauge from '@/components/ui/RiskGauge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Results: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const risks = dataStore.getRiskAssessments(user.id);
  const latest = risks[risks.length - 1];

  if (!latest) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center py-20">
        <h1 className="text-3xl font-bold font-display mb-4">Results</h1>
        <p className="text-muted-foreground">Complete MRI, speech, and cognitive assessments to see your multimodal risk analysis.</p>
      </div>
    );
  }

  const radarData = [
    { subject: 'MRI', score: latest.mriScore },
    { subject: 'Speech', score: latest.speechScore },
    { subject: 'Cognitive', score: latest.cognitiveScore },
    { subject: 'Overall', score: latest.overallRisk },
  ];

  const explanationData = latest.explanations.map(e => ({
    name: e.feature,
    importance: Math.round(e.importance * 100),
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-display mb-2">Risk Assessment Results</h1>
        <p className="text-muted-foreground mb-8">Multimodal AI analysis combining MRI, speech, and cognitive data</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center">
          <RiskGauge score={latest.overallRisk} size={200} label="Overall Risk" />
          <p className={`text-lg font-bold mt-2 ${latest.classification === 'Low' ? 'risk-low' : latest.classification === 'Moderate' ? 'risk-moderate' : 'risk-high'}`}>
            {latest.classification} Risk
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-display font-semibold mb-4 text-sm">Module Scores</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-display font-semibold mb-3 text-sm">Score Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'MRI Analysis', score: latest.mriScore, color: 'bg-primary' },
              { label: 'Speech Analysis', score: latest.speechScore, color: 'bg-secondary' },
              { label: 'Cognitive Tests', score: latest.cognitiveScore, color: 'bg-accent' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.label}</span>
                  <span className="font-semibold">{Math.round(item.score)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${item.color}`} initial={{ width: 0 }} animate={{ width: `${item.score}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explainability */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-display font-semibold mb-4">Explainable AI — Feature Importance (SHAP)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={explanationData} layout="vertical" margin={{ left: 120 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={120} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
            <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {latest.explanations.slice(0, 3).map((e, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              <strong className="text-foreground">{e.feature}:</strong> {e.description}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
