import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mic, Activity, FileText, TrendingUp, ArrowUpRight } from 'lucide-react';
import StaggeredHeading from '@/components/ui/StaggeredHeading';
import RiskGauge from '@/components/ui/RiskGauge';
import { dataStore } from '@/store/dataStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const QUICK_ACTIONS = [
  { icon: Brain, label: 'MRI Analysis', path: '/mri', color: 'text-primary' },
  { icon: Mic, label: 'Vocal Patterns', path: '/speech', color: 'text-accent' },
  { icon: Activity, label: 'Cognitive Test', path: '/cognitive', color: 'text-indigo-400' },
  { icon: FileText, label: 'Session Matrix', path: '/reports', color: 'text-white/70' },
];

const CURVE_PATH =
  'M0,256L60,245.3C120,235,240,213,360,192C480,171,600,149,720,160C840,171,960,213,1080,218.7C1200,224,1320,192,1380,176L1440,160L1440,320L0,320Z';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const Dashboard: React.FC = () => {
  const { user, updateName } = useAuth();
  const { language } = useLanguage();
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [newName, setNewName] = React.useState(user?.name || '');
  const isHindi = language === 'hi';

  React.useEffect(() => {
    setNewName(user?.name || '');
  }, [user?.name]);

  if (!user) return null;

  const handleNameUpdate = () => {
    if (newName.trim()) {
      updateName(newName.trim());
      setIsEditingName(false);
    }
  };

  const mriResults = dataStore.getMRIResults(user.id);
  const speechResults = dataStore.getSpeechResults(user.id);
  const cognitiveResults = dataStore.getCognitiveResults(user.id);
  const riskAssessments = dataStore.getRiskAssessments(user.id);
  const history = dataStore.getHistoricalData(user.id);

  const latestRisk = riskAssessments[riskAssessments.length - 1];
  const latestMRI = mriResults[mriResults.length - 1];
  const latestSpeech = speechResults[speechResults.length - 1];
  const latestCognitive = cognitiveResults[cognitiveResults.length - 1];

  const totalSessions = mriResults.length + speechResults.length + cognitiveResults.length;
  const activeModules = [latestMRI, latestSpeech, latestCognitive].filter(Boolean).length;
  const recentTimeline = [...riskAssessments].slice(-5).reverse();

  const quickActions = isHindi
    ? [
      { icon: Brain, label: 'एमआरआई विश्लेषण', path: '/mri', color: 'text-primary' },
      { icon: Mic, label: 'वोकल पैटर्न', path: '/speech', color: 'text-accent' },
      { icon: Activity, label: 'कॉग्निटिव टेस्ट', path: '/cognitive', color: 'text-indigo-400' },
      { icon: FileText, label: 'सेशन मैट्रिक्स', path: '/reports', color: 'text-white/70' },
    ]
    : QUICK_ACTIONS;

  const copy = isHindi
    ? {
      badge: 'कोर मॉनिटरिंग सिस्टम',
      title: 'इंटेलिजेंस हब',
      patientName: 'रोगी का नाम',
      activeIdentifier: 'सक्रिय पहचान',
      description: 'आपका डैशबोर्ड अब MRI, आवाज़, कॉग्निशन और रिपोर्ट मॉड्यूल्स के साथ एक पारदर्शी इंटेलिजेंस सतह की तरह काम करता है।',
      latestPrecision: 'नवीनतम सटीकता',
      moduleCoverage: 'मॉड्यूल कवरेज',
      sessionsLogged: 'लॉग किए गए सत्र',
      noFusedScore: 'अभी कोई फ्यूज्ड स्कोर नहीं',
      activeEngines: 'सक्रिय विश्लेषण इंजन',
      trackedAssessments: 'ट्रैक किए गए असेसमेंट',
      navModules: 'नेविगेशन मॉड्यूल्स',
      navDescription: 'हर सेक्शन साफ़ स्क्रोल पोज़िशन के साथ खुलता है और वही पारदर्शी डैशबोर्ड स्टाइल बनाए रखता है।',
      quickAccess: 'त्वरित पहुँच',
      open: 'खोलें',
      aggregateScore: 'समेकित स्कोर',
      diagnosticAccuracy: 'डायग्नोस्टिक सटीकता',
      startAssessment: 'असेसमेंट शुरू करें',
      awaitingFused: 'फ्यूज्ड डायग्नोस्टिक स्कोर की गणना के लिए शुरुआती असेसमेंट का इंतज़ार है।',
      chartTitle: 'डायग्नोस्टिक वोलैटिलिटी',
      chartSubtitle: 'लॉन्गिट्यूडिनल विश्लेषण',
      precision: 'सटीकता',
      mriReference: 'एमआरआई रेफरेंस',
      historyEmpty: 'ऐतिहासिक डेटा खाली है',
      moduleScores: 'मॉड्यूल स्कोर',
      moduleScoresDesc: 'पारदर्शी कार्ड्स बैकग्राउंड को दिखाते हुए डैशबोर्ड को पढ़ने योग्य रखते हैं।',
      liveTelemetry: 'लाइव टेलीमेट्री',
      awaitingTelemetry: 'टेलीमेट्री की प्रतीक्षा',
      recentTimeline: 'हाल के सत्रों की टाइमलाइन',
      recentTimelineDesc: 'नवीनतम फ्यूज्ड असेसमेंट स्क्रोल-फ्रेंडली फ्लो में दिखते हैं।',
      recentEntries: 'हाल की प्रविष्टियां',
      completeSessions: 'स्क्रॉल होने वाली टाइमलाइन भरने के लिए MRI, स्पीच और कॉग्निटिव सत्र पूरे करें।',
      signalSnapshot: 'सिग्नल स्नैपशॉट',
      signalSnapshotDesc: 'नेवबार में चुने गए सेक्शनों के लिए तेज़ संदर्भ कार्ड्स।',
      overall: 'कुल',
      speech: 'स्पीच',
    }
    : {
      badge: 'Core Monitoring System',
      title: 'Intelligence Hub',
      patientName: 'Patient Name',
      activeIdentifier: 'Active Identifier',
      description: 'Your dashboard now flows as a transparent intelligence surface with synchronized MRI, voice, cognition, and report modules layered over a curved clinical background.',
      latestPrecision: 'Latest Precision',
      moduleCoverage: 'Module Coverage',
      sessionsLogged: 'Sessions Logged',
      noFusedScore: 'No fused score yet',
      activeEngines: 'Active analysis engines',
      trackedAssessments: 'Tracked assessments',
      navModules: 'Navigation Modules',
      navDescription: 'Each section opens on a clean scroll position with the same transparent dashboard language.',
      quickAccess: 'Quick Access',
      open: 'Open',
      aggregateScore: 'Aggregate Score',
      diagnosticAccuracy: 'Diagnostic Accuracy',
      startAssessment: 'Start Assessment',
      awaitingFused: 'Awaiting initial assessments to compute the fused diagnostic score.',
      chartTitle: 'Diagnostic Volatility',
      chartSubtitle: 'Longitudinal Analysis',
      precision: 'Precision',
      mriReference: 'MRI Reference',
      historyEmpty: 'Historical Vectors Empty',
      moduleScores: 'Module Scores',
      moduleScoresDesc: 'Transparent cards keep the background visible while the dashboard remains easy to scan.',
      liveTelemetry: 'Live Telemetry',
      awaitingTelemetry: 'Awaiting telemetry',
      recentTimeline: 'Recent Session Timeline',
      recentTimelineDesc: 'Latest fused assessments stacked in a scroll-friendly flow.',
      recentEntries: 'Recent Entries',
      completeSessions: 'Complete MRI, speech, and cognitive sessions to populate the scrollable timeline.',
      signalSnapshot: 'Signal Snapshot',
      signalSnapshotDesc: 'Fast context cards for the sections you called out in the navbar.',
      overall: 'Overall',
      speech: 'Speech',
    };

  const moduleCards = [
    {
      icon: Brain,
      title: isHindi ? 'एमआरआई स्ट्रक्चरल विश्लेषण' : 'MRI Structural Analysis',
      score: latestMRI?.precisionScore,
      detail: latestMRI
        ? isHindi
          ? `${latestMRI.classification} स्टेज, ${latestMRI.modelAccuracy}% मॉडल सटीकता के साथ।`
          : `${latestMRI.classification} stage with ${latestMRI.modelAccuracy}% model accuracy.`
        : isHindi
          ? 'इस मॉड्यूल को सक्रिय करने के लिए MRI स्कैन अपलोड करें।'
          : 'Upload an MRI scan to activate this module.',
      count: mriResults.length,
      unit: isHindi ? 'स्कैन' : 'scan',
      color: 'text-primary',
    },
    {
      icon: Mic,
      title: isHindi ? 'वोकल पैटर्न इंटेलिजेंस' : 'Vocal Pattern Intelligence',
      score: latestSpeech?.precisionScore,
      detail: latestSpeech
        ? isHindi
          ? `${latestSpeech.classification} स्टेज, ${(latestSpeech.transcript || '').split(' ').filter(Boolean).length} ट्रांसक्रिप्ट टोकन्स के साथ।`
          : `${latestSpeech.classification} stage with ${(latestSpeech.transcript || '').split(' ').filter(Boolean).length} transcript tokens captured.`
        : isHindi
          ? 'इस मॉड्यूल को सक्रिय करने के लिए वॉइस सैंपल रिकॉर्ड करें।'
          : 'Record a voice sample to activate this module.',
      count: speechResults.length,
      unit: isHindi ? 'टेस्ट' : 'test',
      color: 'text-accent',
    },
    {
      icon: Activity,
      title: isHindi ? 'कॉग्निटिव सेशन मैट्रिक्स' : 'Cognitive Session Matrix',
      score: latestCognitive?.overallScore,
      detail: latestCognitive
        ? isHindi
          ? `${latestCognitive.reactionTime.averageMs} ms रिएक्शन बेसलाइन, ${latestCognitive.reactionTime.trials.length} ट्रायल्स में।`
          : `${latestCognitive.reactionTime.averageMs} ms reaction baseline across ${latestCognitive.reactionTime.trials.length} trials.`
        : isHindi
          ? 'सेशन स्कोर पाने के लिए कॉग्निटिव टेस्ट चलाएं।'
          : 'Run a cognitive test to generate a session score.',
      count: cognitiveResults.length,
      unit: isHindi ? 'सेशन' : 'session',
      color: 'text-indigo-400',
    },
  ];
  const insightCards = [
    {
      label: 'MRI Analysis',
      value: latestMRI ? `${latestMRI.classification} ${isHindi ? 'स्टेज' : 'Stage'}` : isHindi ? 'स्कैन की प्रतीक्षा' : 'Awaiting scan',
      detail: latestMRI ? `${latestMRI.findings.length} ${isHindi ? 'इमेजिंग फाइंडिंग्स नवीनतम सत्र में टैग हुईं।' : 'imaging findings were tagged in the latest session.'}` : isHindi ? 'अभी तक कोई स्ट्रक्चरल इमेजिंग सत्र पूरा नहीं हुआ है।' : 'No structural imaging session has been completed yet.',
      path: '/mri',
    },
    {
      label: isHindi ? 'वोकल पैटर्न' : 'Vocal Patterns',
      value: latestSpeech ? `${latestSpeech.features.pitch.toFixed(1)} Hz` : isHindi ? 'सैंपल की प्रतीक्षा' : 'Awaiting sample',
      detail: latestSpeech ? (isHindi ? `पॉज ड्यूरेशन बेसलाइन ${latestSpeech.features.pauseDuration.toFixed(2)} सेकंड है।` : `Pause duration baseline is ${latestSpeech.features.pauseDuration.toFixed(2)} seconds.`) : isHindi ? 'अभी स्पीच बायोमार्कर्स उपलब्ध नहीं हैं।' : 'No speech biomarkers are available yet.',
      path: '/speech',
    },
    {
      label: isHindi ? 'सेशन मैट्रिक्स' : 'Session Matrix',
      value: latestRisk ? `${latestRisk.precisionScore}% ${isHindi ? 'कुल' : 'overall'}` : isHindi ? 'असेसमेंट की प्रतीक्षा' : 'Awaiting assessment',
      detail: latestRisk ? (isHindi ? `नवीनतम फ्यूज्ड क्लासिफिकेशन ${(latestRisk.classification || 'Low').toLowerCase()} रिस्क है।` : `Latest fused classification is ${(latestRisk.classification || 'Low').toLowerCase()} risk.`) : isHindi ? 'फ्यूज्ड इंटेलिजेंस लेयर भरने के लिए पूरा सत्र चलाएं।' : 'Run a complete session to populate the fused intelligence layer.',
      path: '/reports',
    },
  ];

  return (
    <div className="dashboard-shell relative overflow-hidden min-h-screen bg-[#03040a]">
      {/* Premium Background Elements */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
            <motion.img 
                src="/brain-3d.png" 
                alt="" 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 0.12, scale: 1 }}
                transition={{ duration: 3 }}
                className="w-full h-full object-contain blur-[4px]" 
            />
        </div>
        <div className="dashboard-curve-panel absolute inset-x-[4%] top-8 h-[28rem] rounded-[4rem]" />
        <div className="absolute -left-16 top-16 h-96 w-96 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute right-[-4rem] top-10 h-96 w-[40rem] rounded-[999px] bg-cyan-400/8 blur-[140px]" />
        <svg className="absolute bottom-0 left-0 h-32 w-full text-white/[0.05]" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d={CURVE_PATH} />
        </svg>
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-panel relative mb-10 overflow-hidden rounded-[40px] px-8 py-10 md:px-12 md:py-12"
        >
          <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-gradient-to-l from-primary/10 via-transparent to-transparent lg:block" />
          <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-mono tracking-[0.3em] text-primary uppercase">{copy.badge}</span>
              </div>
              <div className="flex flex-col gap-5">
                <StaggeredHeading
                  text={copy.title}
                  className="text-5xl md:text-6xl font-bold font-display text-white tracking-tighter"
                />
                <div>
                  {isEditingName ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/35">{copy.patientName}</span>
                      <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={handleNameUpdate}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                        className="w-40 bg-transparent text-primary font-semibold outline-none"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="group inline-flex flex-col items-start rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-3 text-left transition-colors hover:border-primary/40"
                    >
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] mb-1">{copy.activeIdentifier}</span>
                      <span className="text-lg font-semibold text-white/90 group-hover:text-white">{user.name}</span>
                    </button>
                  )}
                </div>
                <p className="max-w-2xl border-l border-white/10 pl-5 text-lg font-light leading-relaxed text-muted-foreground">
                  {copy.description}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { label: copy.latestPrecision, value: latestRisk ? `${latestRisk.precisionScore}%` : '--', detail: latestRisk ? `${latestRisk.classification} ${isHindi ? 'रिस्क' : 'risk'}` : copy.noFusedScore },
                { label: copy.moduleCoverage, value: `${activeModules}/3`, detail: copy.activeEngines },
                { label: copy.sessionsLogged, value: `${totalSessions}`, detail: copy.trackedAssessments },
              ].map((item) => (
                <div key={item.label} className="rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/35 mb-2">{item.label}</p>
                  <p className="text-3xl font-bold tracking-tighter text-white">{item.value}</p>
                  <p className="text-sm text-white/45 mt-1">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <section className="mb-10">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{copy.navModules}</h2>
              <p className="text-sm text-white/45">{copy.navDescription}</p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">{copy.quickAccess}</span>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
              >
                <Link
                  to={action.path}
                  className="dashboard-panel group relative flex h-full items-center justify-between overflow-hidden rounded-[30px] px-6 py-6 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-1">{copy.open}</p>
                      <p className="text-sm font-semibold text-white">{action.label}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/20 transition-colors group-hover:text-primary" />
                  <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="mb-10 grid gap-8 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.16, duration: 0.5 }}
            className="dashboard-panel lg:col-span-4 relative flex flex-col items-center justify-center overflow-hidden rounded-[34px] px-8 py-10 text-center"
          >
            <div className="absolute top-5 left-6 flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">{copy.aggregateScore}</span>
            </div>
            {latestRisk ? (
              <RiskGauge score={latestRisk.precisionScore} size={280} label={copy.diagnosticAccuracy} mode="precision" />
            ) : (
              <div className="py-12">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-white/10">
                  <Brain className="h-8 w-8 text-white/10" />
                </div>
                <p className="mx-auto mb-6 max-w-[220px] text-sm text-muted-foreground">
                  {copy.awaitingFused}
                </p>
                <Link to="/mri" className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-xs font-mono text-primary transition-all hover:bg-primary/10">
                  {copy.startAssessment}
                </Link>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.24, duration: 0.5 }}
            className="dashboard-panel lg:col-span-8 rounded-[34px] px-8 py-10 md:px-10"
          >
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{copy.chartTitle}</h3>
                <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/35 mt-1">{copy.chartSubtitle}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-mono text-white/40">{copy.precision}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-mono text-white/40">{copy.mriReference}</span>
                </div>
              </div>
            </div>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)', fontVariant: 'tabular-nums' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10, 11, 20, 0.88)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono',
                      backdropFilter: 'blur(14px)',
                    }}
                    cursor={{ stroke: 'rgba(0,245,155,0.22)', strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="overallRisk"
                    stroke="hsl(var(--primary))"
                    strokeWidth={4}
                    dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#fff', stroke: 'hsl(var(--primary))', strokeWidth: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mriScore"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    opacity={0.35}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[280px] flex-col items-center justify-center gap-4 text-white/10">
                <TrendingUp className="h-12 w-12 opacity-20" />
                <p className="font-mono text-xs uppercase tracking-[0.3em]">{copy.historyEmpty}</p>
              </div>
            )}
          </motion.div>
        </div>

        <section className="mb-10">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold text-white">{copy.moduleScores}</h2>
              <p className="text-sm text-white/45">{copy.moduleScoresDesc}</p>
            </motion.div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">{copy.liveTelemetry}</span>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {moduleCards.map((module, index) => (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.1 + index * 0.1, duration: 0.45 }}
                className="dashboard-panel rounded-[32px] px-7 py-8 transition-colors hover:border-primary/25"
              >
                <div className="mb-8 flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] ${module.color}`}>
                    <module.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25">
                    {module.count} {module.unit}{module.count === 1 ? '' : 's'}
                  </span>
                </div>
                <h3 className="mb-3 text-lg font-bold text-white">{module.title}</h3>
                <p className="mb-6 min-h-[48px] text-sm leading-relaxed text-white/45">{module.detail}</p>
                {typeof module.score === 'number' ? (
                  <div className="space-y-4">
                    <div className="text-5xl font-bold tracking-tighter text-white">
                      {module.score}
                      <span className="ml-1 text-lg text-white/20">%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full bg-gradient-brand shadow-[0_0_14px_rgba(0,245,155,0.28)]" style={{ width: `${module.score}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-white/20">{copy.awaitingTelemetry}</div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="dashboard-panel rounded-[34px] px-8 py-9"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{copy.recentTimeline}</h3>
                <p className="text-sm text-white/45 mt-1">{copy.recentTimelineDesc}</p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">{copy.recentEntries}</span>
            </div>
            {recentTimeline.length > 0 ? (
              <div className="space-y-4">
                {recentTimeline.map((entry) => (
                  <div key={entry.id} className="rounded-[26px] border border-white/10 bg-white/[0.03] px-5 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{entry.classification} Risk Session</p>
                        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/30 mt-1">{formatDate(entry.date)}</p>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/25">{copy.overall}</p>
                          <p className="text-lg font-bold text-white">{entry.overallRisk}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/25">MRI</p>
                          <p className="text-lg font-bold text-white">{entry.mriScore}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/25">{copy.speech}</p>
                          <p className="text-lg font-bold text-white">{entry.speechScore}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[260px] items-center justify-center rounded-[30px] border border-dashed border-white/10 text-center text-white/30">
                {copy.completeSessions}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.45 }}
            className="dashboard-panel rounded-[34px] px-8 py-9"
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white">{copy.signalSnapshot}</h3>
              <p className="text-sm text-white/45 mt-1">{copy.signalSnapshotDesc}</p>
            </div>
            <div className="space-y-4">
              {insightCards.map((card) => (
                <Link
                  key={card.label}
                  to={card.path}
                  className="group block rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-5 transition-colors hover:border-primary/30"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">{card.label}</p>
                      <p className="text-lg font-semibold text-white">{card.value}</p>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 text-white/20 transition-colors group-hover:text-primary" />
                  </div>
                  <p className="text-sm leading-relaxed text-white/45">{card.detail}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
