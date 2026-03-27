import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Brain, Upload, Loader2, CheckCircle, AlertCircle, Play, Info } from 'lucide-react';
import StaggeredHeading from '@/components/ui/StaggeredHeading';
import { uploadMRI, checkServerStatus } from '@/services/api';
import { dataStore } from '@/store/dataStore';
import RiskGauge from '@/components/ui/RiskGauge';
import Heatmap from '@/components/ui/Heatmap';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { MRIResult } from '@/types';
import PageShell from '@/components/ui/PageShell';
import { useLanguage } from '@/contexts/LanguageContext';

const MRIUpload: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MRIResult | null>(null);
  const [progress, setProgress] = useState(0);
  const isHindi = language === 'hi';

  const copy = isHindi
    ? {
        module: 'न्यूरोनल इमेजिंग मॉड्यूल',
        titleA: 'स्ट्रक्चरल',
        titleB: 'इमेजिंग असेसमेंट',
        description: 'T2-weighted MRI स्कैन अपलोड करें। हमारा रेसनेट-18 (ResNet-18) आधारित न्यूरल नेटवर्क डेपेंथ में डेमेंशिया के अर्ली साइन डिटेक्ट करेगा।',
        analysisDone: 'न्यूरल एनालिसिस सिंक्रोनाइज़्ड',
        confidence: 'डायग्नोस्टिक कॉन्फिडेंस',
        classification: 'स्टेज क्लासिफिकेशन',
        inference: 'न्यूरल इन्फेरेंस रेटिंग',
        heatmap: 'न्यूरल एक्टिवेशन मैप (Grad-CAM)',
        findings: 'बायोमार्कर्स और प्रिमिटिव फाइंडिंग्स',
        clinicalMetadata: 'क्लिनिकल मेटाडेटा',
        reset: 'न्यूरल कोर रीसेट करें',
        start: 'न्यूरल एनालिसिस शुरू करें',
        drop: 'MRI स्कैन यहाँ छोड़ें या ब्राउज़ करें',
      }
    : {
        module: 'Neuronal Imaging Module',
        titleA: 'Structural',
        titleB: 'Imaging Assessment',
        description: 'Upload T2-weighted MRI scans for deep-feature extraction. Our fine-tuned ResNet-18 architecture evaluates cortical atrophy and ventricular enlargement protocols.',
        analysisDone: 'Neural Analysis Synchronized',
        confidence: 'Diagnostic Confidence',
        classification: 'Stage Classification',
        inference: 'Neural Inference Rating',
        heatmap: 'Neural Activation Map (Grad-CAM)',
        findings: 'Biomarkers & Primitive Findings',
        clinicalMetadata: 'Clinical Metadata',
        reset: 'Reset Neural Core',
        start: 'START NEURAL ANALYSIS',
        drop: 'Drop MRI Scan here or browse',
      };

  // --- STEP 1: SELECTING THE FILE ---
  // When you click the upload box, this function runs.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; // Get the first file selected
    if (f) {
      setFile(f); // Store the physical file in "state"
      const reader = new FileReader();
      // Generate a "Preview Image" so the user can see their brain scan on screen
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
      setResult(null); // Clear any old results
    }
  };

  /**
   * --- STEP 2: THE BRAIN ANALYSIS ENGINE ---
   * This is the bridge to the ResNet-18 Neural Network.
   */
  const analyze = async () => {
    if (!file || !user) return; // Can't analyze if no file or no logged-in user
    
    // Security check: Only allow standard images (JPEG/PNG)
    if (!file.type.startsWith('image/') || file.type === 'image/dicom') {
      toast.error('Please upload a valid MRI image (JPEG/PNG)');
      return;
    }

    setAnalyzing(true);
    setProgress(0);

    // VISUAL EFFECT: We simulate a progress bar to show the "Neural Core" is working.
    const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 15, 90)), 400);

    try {
      // WAKE UP CHECK: Only show cloud wake-up toast if connecting to a remote server (not localhost)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const isCloudDeployment = !apiUrl.includes('localhost') && !apiUrl.includes('127.0.0.1');
      const isLive = await checkServerStatus();
      if (!isLive && isCloudDeployment) {
        toast.info("Backend is waking up from sleep (Render/Railway Free Tier)... Please wait 15-20 seconds.");
      }

      // THE MOST IMPORTANT LINE: We send the image to the Python FastAPI backend.
      const analysis = await uploadMRI(file); 
      
      clearInterval(interval);
      setProgress(100); // Analysis finished successfully

      // --- STEP 3: MAPPING THE RESULTS ---
      // We take the raw numbers from the AI and turn them into a 'Result' object.
      const mriResult: MRIResult = {
        id: uuidv4(),
        userId: user.id,
        date: new Date().toISOString(),
        precisionScore: analysis.confidence, // Probability from Softmax (0 to 100)
        modelAccuracy: analysis.modelAccuracy, // Static metric (85.4%)
        classification: analysis.classification, // "Non-Demented", "Mild", or "Demented"
        imageUrl: preview,
        heatmapData: analysis.heatmapData, // The Grad-CAM "Glow" points for the Brain Heatmap
        findings: analysis.findings || [], // List of clinical biomarkers detected
        metadata: analysis.metadata || {}, // Technical info like Image Dimensions
      };

      // We save this permanently into the browser's storage
      dataStore.saveMRIResult(user.id, mriResult);
      setResult(mriResult); // Display the results on the screen
      toast.success('MRI analysis complete');
    } catch (error: any) {
      toast.error(error.message || 'Analysis failed');
    }
    setAnalyzing(false);
  };

  return (
    <PageShell glowClassName="bg-primary/10" secondaryGlowClassName="bg-indigo-400/5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-primary uppercase">{copy.module}</span>
        </div>
        <StaggeredHeading 
          text={`${copy.titleA} ${copy.titleB}`} 
          className="text-6xl font-bold font-display text-white mb-2 tracking-tighter" 
        />
        <p className="text-muted-foreground text-lg max-w-2xl font-light border-l border-white/10 pl-5">
          {copy.description}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7">
          {!result ? (
            <div className="space-y-8">
              <div 
                className="relative group glass-card p-12 rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/40 transition-all duration-700 min-h-[400px] flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.02]"
                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
              >
                {!preview ? (
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-10">
                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                         <div className="relative w-24 h-24 rounded-full bg-[#0a0b14] border border-white/10 flex items-center justify-center transform group-hover:scale-110 transition-all duration-700 shadow-2xl overflow-hidden">
                           <img src="/upload-icon.png" alt="Upload" className="w-14 h-14 object-contain opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                           <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(0,245,155,0.4)]">
                            <Brain className="w-4 h-4 text-black" />
                        </div>
                    </div>
                    <p className="text-xl font-bold text-white mb-2 tracking-tight uppercase">{copy.drop}</p>
                  </div>
                ) : (
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-2xl group/preview">
                    <img src={preview} alt="MRI Preview" className="w-full h-full object-cover transform group-hover/preview:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 group-hover/preview:opacity-100 transition-all duration-500 translate-y-4 group-hover/preview:translate-y-0">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                             <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{file?.name}</span>
                        </div>
                    </div>
                  </div>
                )}
                <input type="file" onChange={handleFileChange} accept="image/jpeg,image/png" className="hidden" />
              </div>

              {analyzing && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 rounded-3xl border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 font-mono text-[10px] text-primary uppercase tracking-[0.4em]">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      Protocol: Analyzing Cortical Voxel Density
                    </div>
                    <span className="font-mono text-xs text-primary font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-primary shadow-[0_0_20px_rgba(0,245,155,0.5)]" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </motion.div>
              )}

              <button 
                onClick={analyze} 
                disabled={!file || analyzing} 
                className="w-full h-18 rounded-full bg-primary hover:bg-white text-black font-bold text-xl transition-all duration-700 disabled:opacity-20 shadow-[0_0_50px_rgba(0,245,155,0.2)] group flex items-center justify-center gap-4 border-0"
              >
                {analyzing ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> MAPPING NEURAL FEATURES...</>
                ) : (
                  <><Play className="w-6 h-6 group-hover:scale-110 transition-transform" /> {copy.start}</>
                )}
              </button>
            </div>
          ) : (
            <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-3 text-primary mb-12 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit">
                <CheckCircle className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] font-bold">{copy.analysisDone}</span>
              </div>

              <div className="grid gap-8">
                <div className="glass-card rounded-3xl p-10 flex flex-col items-center border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 self-start mb-10">{copy.confidence}</h3>
                  <RiskGauge score={result.precisionScore} size={300} label="System Precision Score" mode="precision" />
                  <div className="mt-12 text-center group">
                       <div className="text-[10px] font-mono text-white/20 mb-3 uppercase tracking-[0.5em] group-hover:text-primary transition-colors">{copy.inference}</div>
                       <h4 className={`text-4xl font-bold tracking-tighter ${result.classification === 'Low' ? 'text-emerald-400' : result.classification === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {result.classification} STAGE
                       </h4>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-10 border-white/5">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8">{copy.heatmap}</h3>
                  <div className="flex justify-center relative">
                    <div className="absolute inset-0 bg-primary/10 blur-[100px] opacity-20" />
                    <Heatmap data={result.heatmapData} size={340} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-5">
           {result && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                 <div className="glass-card p-10 rounded-3xl border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Info className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30">{copy.findings}</h3>
                    </div>
                    <div className="space-y-6">
                        {result.findings.map((finding, index) => (
                           <div key={index} className="flex gap-4 group">
                             <div className="mt-1.5 w-1 h-1 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" />
                             <p className="text-sm font-light text-white/60 leading-relaxed group-hover:text-white/80 transition-colors uppercase tracking-tight">{finding}</p>
                           </div>
                        ))}
                    </div>
                 </div>

                 <div className="glass-card p-10 rounded-3xl border-white/5 bg-white/[0.01]">
                    <div className="text-[10px] font-mono text-white/10 uppercase tracking-[0.5em] mb-10">{copy.clinicalMetadata}</div>
                    <div className="space-y-4">
                        {Object.entries(result.metadata).map(([key, value]) => (
                           <div key={key} className="flex justify-between border-b border-white/[0.03] pb-3">
                              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{key}</span>
                              <span className="text-[11px] font-mono text-white/80">{String(value)}</span>
                           </div>
                        ))}
                    </div>
                    <button 
                      onClick={() => { setResult(null); setFile(null); setPreview(null); }}
                      className="w-full mt-12 py-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-[0.4em] hover:bg-white/10 hover:text-white transition-all text-white/40"
                    >
                      {copy.reset}
                    </button>
                 </div>
              </motion.div>
           )}
           
           {!result && (
             <div className="hidden lg:block space-y-8 opacity-40">
                <div className="glass-card p-10 rounded-3xl border-white/5">
                   <div className="h-4 w-48 bg-white/5 rounded-full mb-8 animate-pulse" />
                   <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex gap-4">
                                <div className="h-3 w-3 rounded-full bg-white/5" />
                                <div className="h-3 flex-1 bg-white/5 rounded-full" />
                            </div>
                        ))}
                   </div>
                </div>
                <div className="glass-card p-10 rounded-3xl border-white/5">
                   <div className="h-4 w-32 bg-white/5 rounded-full mb-8" />
                   <div className="aspect-square bg-white/[0.02] rounded-2xl flex items-center justify-center border border-dashed border-white/5">
                        <Brain className="w-12 h-12 text-white/5" />
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </PageShell>
  );
};

export default MRIUpload;
