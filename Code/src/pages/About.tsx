import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Activity, Mic, Shield, FileText, TrendingUp, Eye, BarChart3 } from 'lucide-react';
import PageShell from '@/components/ui/PageShell';
import { useLanguage } from '@/contexts/LanguageContext';

const About: React.FC = () => {
  const { language } = useLanguage();
  const isHindi = language === 'hi';
  const modules = isHindi
    ? [
        { icon: Brain, title: 'स्ट्रक्चरल न्यूरोइमेजिंग', desc: 'ResNet50/EfficientNet एन्सेम्बल्स मल्टी-प्लेनर MRI डेटा का विश्लेषण करते हैं। हाई-रिज़ॉल्यूशन Grad-CAM हीटमैप शुरुआती एट्रॉफी को चिन्हित करते हैं।' },
        { icon: Mic, title: 'वोकल बायोमार्कर्स', desc: 'Librosa के जरिए MFCC, स्पेक्ट्रल और प्रोसोडी फीचर्स निकाले जाते हैं। Whisper और XGBoost के साथ स्पीच-टू-इंटेंट वर्गीकरण किया जाता है।' },
        { icon: Activity, title: 'कॉग्निटिव रिस्पॉन्स', desc: 'रियल-टाइम साइकोमेट्रिक लेटेंसी टेस्ट, मेमोरी रिकंस्ट्रक्शन और लेक्सिकल फ्लुएंसी असेसमेंट।' },
        { icon: BarChart3, title: 'मल्टीमॉडल फ्यूजन', desc: 'असिंक्रोनस सिग्नल स्ट्रीम्स का डायनेमिक वेटेड एग्रीगेशन कर हाई-कॉन्फिडेंस स्कोर तैयार किया जाता है।' },
        { icon: Shield, title: 'इंटरप्रिटेबिलिटी (XAI)', desc: 'SHAP आधारित फीचर इम्पोर्टेंस के साथ क्लिनिशियंस के लिए पारदर्शी लोकल और ग्लोबल एक्सप्लेनेशन।' },
        { icon: Eye, title: 'ऑक्युलोमेट्रिक ट्रैकिंग', desc: 'सैकैडिक आई मूवमेंट और फेसियल माइक्रो-एक्सप्रेशन्स का सब-मिलीसेकंड विश्लेषण।' },
        { icon: TrendingUp, title: 'टेम्पोरल डेल्टा ट्रैकिंग', desc: 'लॉन्गिट्यूडिनल वैरिएंस एनालिसिस और कॉग्निटिव ट्राजेक्टरी का प्रेडिक्टिव मॉडलिंग।' },
        { icon: FileText, title: 'हाई-फिडेलिटी रिपोर्ट्स', desc: 'क्लिनिकल फाइंडिंग्स को ऑटोमेटेड और सुरक्षित PDF इंटेलिजेंस लॉग्स में संकलित किया जाता है।' },
      ]
    : [
        { icon: Brain, title: 'Structural Neuroimaging', desc: 'ResNet50/EfficientNet ensembles analyze multi-planar MRI data. High-resolution Grad-CAM heatmaps localize early-stage atrophy.' },
        { icon: Mic, title: 'Vocal Biomarkers', desc: 'Acoustic feature extraction (MFCC, Spectral, Prosody) via Librosa. Neural speech-to-intent classification using Whisper & XGBoost.' },
        { icon: Activity, title: 'Cognitive Response', desc: 'Real-time psychometric latency tests. Multi-vector memory reconstruction and lexical fluency assessment.' },
        { icon: BarChart3, title: 'Multimodal Fusion', desc: 'Dynamic weighted aggregation of asynchronous sensor streams for high-confidence precision scoring.' },
        { icon: Shield, title: 'Interpretability (XAI)', desc: 'Trust-aware feature importance via SHAP. Transparent local and global decision explanations for clinicians.' },
        { icon: Eye, title: 'Oculometric Tracking', desc: 'Sub-millisecond analysis of saccadic eye movement and facial micro-expressions for non-invasive risk detection.' },
        { icon: TrendingUp, title: 'Temporal Delta Tracking', desc: 'Longitudinal variance analysis. Predictive modeling of cognitive trajectories over extended clinical periods.' },
        { icon: FileText, title: 'High-Fidelity Reports', desc: 'Automated synthesis of clinical findings into cryptographically signed PDF intelligence logs.' },
      ];

  const copy = isHindi
    ? {
        projectName: 'प्रोजेक्ट नाम',
        coreCapability: 'मुख्य क्षमता',
        title: 'NeuroLab',
        description: 'MRI विश्लेषण, स्पीच बायोमार्कर्स, कॉग्निटिव टेस्टिंग और एक्सप्लेनेबल एआई रिपोर्टिंग के साथ मल्टीमॉडल डिमेंशिया रिस्क असेसमेंट।',
        architecture: 'सिस्टम आर्किटेक्चर',
        architectureText: 'NeuroLab एक हाई-फिडेलिटी डायग्नोस्टिक एनवायरनमेंट है जो मल्टीमॉडल इंटेलिजेंस स्ट्रीम्स और एक्सप्लेनेबल न्यूरल आर्किटेक्चर को जोड़कर शुरुआती डिमेंशिया रिस्क असेसमेंट को सपोर्ट करता है।',
        techTitle: 'टेक्नोलॉजी इंटीग्रेशन मैट्रिक्स',
      }
    : {
        projectName: 'Project Name',
        coreCapability: 'Core Capability',
        title: 'NeuroLab',
        description: 'Multimodal dementia risk assessment across MRI analysis, speech biomarkers, cognitive testing, and explainable AI reporting.',
        architecture: 'System Architecture',
        architectureText: 'NeuroLab is a high-fidelity diagnostic environment that fuses multimodal intelligence streams with explainable neural architectures to support early dementia risk assessment.',
        techTitle: 'Technology Integration Matrix',
      };

  return (
    <PageShell>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-primary uppercase">{copy.projectName}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
            <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="text-[10px] font-mono tracking-[0.3em] text-white/60 uppercase">{copy.coreCapability}</span>
          </div>
        </div>
        <h1 className="text-6xl font-bold font-display text-white mb-4 tracking-tighter">
          {copy.title.split(' ')[0]} <span className="text-gradient">{copy.title.split(' ')[1]}</span>
        </h1>
        <p className="text-muted-foreground text-xl max-w-3xl font-light border-l border-white/10 pl-6 leading-relaxed">
          {copy.description}
        </p>
        <div className="mt-8 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-[10px] font-mono tracking-[0.3em] text-primary uppercase mb-3">{copy.architecture}</p>
          <p className="text-white/70 text-base leading-relaxed font-light">
            {copy.architectureText}
          </p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {modules.map((m, i) => (
          <motion.div 
            key={m.title} 
            className="glass-card rounded-2xl p-6 border-white/5 hover:border-primary/20 hover:bg-white/[0.03] transition-all group" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
              <m.icon className="w-6 h-6 text-white/20 group-hover:text-primary transition-colors duration-500" />
            </div>
            <h3 className="font-display font-bold text-white mb-3 text-sm tracking-tight text-balance">{m.title}</h3>
            <p className="text-[11px] text-white/40 leading-relaxed font-light">{m.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="dashboard-panel rounded-[32px] p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        <h2 className="text-2xl font-bold font-display text-white mb-10 tracking-tight flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            {copy.techTitle}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-8">
          {[
            { label: 'Neural Core', text: 'React 18 / Tailwind Engine' },
            { label: 'Intelligence API', text: 'FastAPI / Persistent Socket' },
            { label: 'Biosignal Engine', text: 'Librosa / Whisper ASR' },
            { label: 'Decision Logic', text: 'PyTorch / XGBoost Ensemble' },
            { label: 'Explainability', text: 'SHAP / Grad-CAM V2' },
            { label: 'Data Lake', text: 'PostgreSQL / Vector Store' },
            { label: 'Protocol Port', text: 'Docker Containerization' },
            { label: 'Telemetry Export', text: 'jsPDF High-Res' }
          ].map(tech => (
            <div key={tech.label} className="space-y-1">
                <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">{tech.label}</p>
                <p className="text-sm text-white/70 font-light">{tech.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </PageShell>
  );
};

export default About;
