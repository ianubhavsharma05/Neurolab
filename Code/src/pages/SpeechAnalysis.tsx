import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Mic, Upload, Loader2, CheckCircle, Square, ArrowRight, Activity, Music, Share2 } from 'lucide-react';
import StaggeredHeading from '@/components/ui/StaggeredHeading';
import { uploadSpeech, checkServerStatus } from '@/services/api';
import { dataStore } from '@/store/dataStore';
import RiskGauge from '@/components/ui/RiskGauge';
import Waveform from '@/components/ui/Waveform';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { SpeechResult } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import PageShell from '@/components/ui/PageShell';
import { useLanguage } from '@/contexts/LanguageContext';

const SpeechAnalysis: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SpeechResult | null>(null);
  const [progress, setProgress] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const isHindi = language === 'hi';
  const copy = isHindi
    ? {
        module: 'अकूस्टिक इंटेलिजेंस मॉड्यूल',
        title: 'सिंक्ड वोकल एनालिसिस',
        description: 'Whisper v3 ट्रांसक्रिप्शन के साथ सब-लेक्सिकल पैटर्न एक्सट्रैक्शन और प्रोसोडिक वैरिएंस डिटेक्शन चलाएं।',
        stop: 'रिकॉर्डिंग रोकें',
        capture: 'वोकल फीड कैप्चर',
        ready: 'न्यूरल माइक्रो-सेंसर: तैयार',
        remote: 'रिमोट फीड',
        awaiting: 'इनपुट की प्रतीक्षा',
        synchronized: 'सिग्नल सिंक्रोनाइज़्ड',
        extracting: 'प्रोसोडिक फीचर एक्सट्रैक्शन',
        start: 'वोकल एनालिसिस शुरू करें',
        acousticCore: 'अकूस्टिक कोर सिंक्रोनाइज़्ड',
        consensus: 'डायग्नोस्टिक कंसेंसस',
        classification: 'न्यूरल क्लासिफिकेशन',
        waveform: 'अकूस्टिक वेवफॉर्म प्रोफाइल',
        matrix: 'प्रोप्रायटरी फीचर मैट्रिक्स',
        transcription: 'न्यूरल ट्रांसक्रिप्शन (Whisper v3)',
        biomarker: 'वोकल बायोमार्कर इनसाइट्स',
        acousticMetadata: 'अकूस्टिक मेटाडेटा',
        reset: 'अकूस्टिक कोर रीसेट करें',
      }
    : {
        module: 'Acoustic Intelligence Module',
        title: 'Synchronized Vocal Analysis',
        description: 'Execute sub-lexical pattern extraction and prosodic variance detection using neural Whisper v3 transcriptions.',
        stop: 'STOP RECORDING',
        capture: 'Vocal Feed Capture',
        ready: 'Neural Micro-Sensor: Ready',
        remote: 'Remote Feed',
        awaiting: 'Awaiting Input',
        synchronized: 'Signal Synchronized',
        extracting: 'Prosodic Feature Extraction',
        start: 'START VOCAL ANALYSIS',
        acousticCore: 'Acoustic Core Synchronized',
        consensus: 'Diagnostic Consensus',
        classification: 'Neural Classification',
        waveform: 'Acoustic Waveform Profile',
        matrix: 'Proprietary Feature Matrix',
        transcription: 'Neural Transcription (Whisper v3)',
        biomarker: 'Vocal Biomarker Insights',
        acousticMetadata: 'Acoustic Metadata',
        reset: 'Reset Acoustic Core',
      };

  /**
   * --- HELPER: audioBufferToWav ---
   * PURPOSE: This is a mathematical "transcoder". 
   * Browsers record audio in '.webm' or '.mp4' formats. These are COMPRESSED containers.
   * Our Python Backend (Librosa) needs raw '.wav' (PCM) to analyze Jitter/Shimmer.
   * This function manually builds a WAV file byte-by-byte from raw sound signals.
   */
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const interleaved = buffer.getChannelData(0); // Take first channel (mono)
    const dataLength = interleaved.length * 2;
    const arrayBuffer = new ArrayBuffer(44 + dataLength); // 44 bytes is the standard WAV 'Header' size
    const view = new DataView(arrayBuffer);

    // Writes the text strings required in a WAV header
    const writeString = (view: DataView, offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    // RIFF chunk descriptor: Tells the computer this is a valid audio file
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    
    // fmt sub-chunk: Defines the quality (Sample Rate, Mono vs Stereo)
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM Encoding
    view.setUint16(22, 1, true); // Mono (Single Mic)
    view.setUint32(24, buffer.sampleRate, true); 
    view.setUint32(28, buffer.sampleRate * 2, true); 
    view.setUint16(32, 2, true); 
    view.setUint16(34, 16, true); // 16-bit audio depth
    
    // data sub-chunk: The actual sound vibrations
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write the raw Sound Waves (PCM samples)
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
      let s = Math.max(-1, Math.min(1, interleaved[i]));
      // Convert decimal waves into 16-bit Integer waves
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([view], { type: 'audio/wav' });
  };

  /**
   * --- FUNCTION: startRecording ---
   * Starts the Microphone and begins listening to your voice patterns.
   */
  const startRecording = async () => {
    try {
      // 1. Ask browser for permission to use the Mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      
      // 2. As sound comes in, we save it in small chunks
      mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data);
      
      mediaRecorder.current.onstop = async () => {
        stream.getTracks().forEach(t => t.stop()); // Turn off the "Recording" red light in the browser
        const originalBlob = new Blob(chunks.current);
        
        try {
          /**
           * CRITICAL STEP: Vercel/Cloud Fix
           * Vercel's serverless backend DOES NOT have 'ffmpeg' installed. 
           * If we send a 'WebM' file from Chrome, the server can't read it.
           * So, we decode the audio in YOUR browser and send a "True WAV" instead.
           */
          const arrayBuffer = await originalBlob.arrayBuffer();
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const wavBlob = audioBufferToWav(audioBuffer); // Convert to WAV
          setAudioBlob(wavBlob); // Ready for analysis
        } catch (err) {
          console.error('[Speech] Conversion to true WAV failed:', err);
          setAudioBlob(new Blob(chunks.current, { type: 'audio/wav' })); // fallback
        }
      };
      
      mediaRecorder.current.start();
      setRecording(true);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setAudioBlob(f);
  };

  const analyze = async () => {
    if (!audioBlob || !user) return;
    
    
    // Explicit validation for WAV as per backend requirement
    const isWav = audioBlob.type === 'audio/wav' || 
                  audioBlob.type === 'audio/x-wav' || 
                  (audioBlob as File).name?.toLowerCase().endsWith('.wav');

    if (!isWav) {
      toast.error("Please upload a valid audio file (WAV format only)");
      return;
    }

    setAnalyzing(true);
    setProgress(0);

    const interval = setInterval(() => setProgress(p => Math.min(p + Math.random() * 20, 95)), 400);

    try {
      // WAKE UP CHECK: Only show cloud wake-up toast on Vercel/Railway, not local dev
      const isCloudDeployment = !!import.meta.env.VITE_API_URL;
      const isLive = await checkServerStatus();
      if (!isLive && isCloudDeployment) {
        toast.info("Acoustic Core is waking up... (Render/Railway Free Tier window initiated)");
      }

      const analysis = await uploadSpeech(audioBlob);
      clearInterval(interval);
      setProgress(100);

      const speechResult: SpeechResult = {
        id: uuidv4(),
        userId: user.id,
        date: new Date().toISOString(),
        ...analysis,
        precisionScore: analysis.confidence,
      };
      dataStore.saveSpeechResult(user.id, speechResult);
      setResult(speechResult);
      toast.success('Vocal telemetry synchronized');
    } catch (error: any) {
      toast.error(error.message || 'Analysis handshake failed');
    }
    setAnalyzing(false);
  };

  const featureChartData = result ? [
    { name: 'Spectral Centroid', value: (result.features.spectralCentroid || 0) / 35 },
    { name: 'Zero Crossing', value: (result.features.zeroCrossingRate || 0) * 1000 },
    { name: 'RMS Energy', value: (result.features.rmsEnergy || 0) * 1000 },
    { name: 'Pitch', value: result.features.pitch || 0 },
    { name: 'Pause Duration', value: (result.features.pauseDuration || 0) * 30 },
  ] : [];

  return (
    <PageShell glowClassName="bg-cyan-400/12" secondaryGlowClassName="bg-primary/10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-accent uppercase">{copy.module}</span>
        </div>
        <StaggeredHeading 
          text={copy.title} 
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
              <div className="grid lg:grid-cols-2 gap-6">
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={`group relative glass-card p-12 rounded-3xl border-2 border-dashed transition-all duration-700 min-h-[300px] flex flex-col items-center justify-center ${recording ? 'border-red-500/50 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/10 hover:border-accent/40 hover:bg-white/[0.02]'}`}
                >
                  {recording ? (
                    <>
                      <div className="relative mb-8">
                        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                          <Square className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150 animate-ping opacity-20" />
                      </div>
                      <p className="text-2xl font-bold text-red-500 tracking-tighter mb-2">{copy.stop}</p>
                      <div className="flex gap-1">
                          {[1,2,3,4,5,6].map(i => (
                              <motion.div 
                                key={i} 
                                animate={{ height: [4, 16, 4] }} 
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                className="w-1 bg-red-500/40 rounded-full"
                              />
                          ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative w-24 h-24 mx-auto mb-10">
                        <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full animate-pulse" />
                        <div className="relative w-24 h-24 rounded-full bg-[#0a0b14] border border-white/10 flex items-center justify-center transform group-hover:scale-110 transition-all duration-700 shadow-2xl overflow-hidden">
                           <Mic className="w-10 h-10 text-accent/40 group-hover:text-accent transition-colors duration-500" />
                           <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                            <Activity className="w-4 h-4 text-black" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-accent transition-colors uppercase">{copy.capture}</p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.3em] opacity-60">{copy.ready}</p>
                    </>
                  )}
                </button>

                <div className="flex flex-col gap-6">
                   <div className="relative glass-card p-10 rounded-3xl border-white/5 group hover:border-accent/30 hover:bg-white/[0.02] transition-all cursor-pointer overflow-hidden" onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-6">
                          <div className="relative w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:rotate-6 transition-all duration-500">
                              <Music className="w-6 h-6 text-white/30 group-hover:text-accent transition-colors" />
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent animate-pulse" />
                          </div>
                          <div>
                              <p className="font-bold text-white text-lg tracking-tight uppercase group-hover:text-accent transition-colors">{copy.remote}</p>
                              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Protocol: WAV only</p>
                          </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center group-hover:border-accent group-hover:scale-110 transition-all">
                        <Share2 className="w-4 h-4 text-white/10 group-hover:text-accent transition-colors" />
                      </div>
                    </div>
                    <input type="file" accept="audio/wav" className="hidden" onChange={handleFileUpload} />
                   </div>

                   <div className={`flex-1 glass-card p-8 rounded-3xl border-white/5 transition-all duration-700 flex flex-col items-center justify-center text-center ${audioBlob ? 'bg-accent/5 border-accent/20' : ''}`}>
                      {!audioBlob ? (
                          <div className="space-y-3 opacity-20">
                              <Activity className="w-8 h-8 mx-auto" />
                              <p className="font-mono text-[9px] uppercase tracking-[0.4em]">{copy.awaiting}</p>
                          </div>
                      ) : (
                          <div className="w-full space-y-4">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                                  <CheckCircle className="w-3 h-3 text-accent" />
                                  <span className="text-[9px] font-mono text-accent uppercase tracking-widest font-bold">{copy.synchronized}</span>
                              </div>
                              <audio controls src={URL.createObjectURL(audioBlob)} className="w-full h-8 custom-audio" />
                          </div>
                      )}
                   </div>
                </div>
              </div>

              {analyzing && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 rounded-3xl border-accent/30 bg-accent/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 font-mono text-[10px] text-accent uppercase tracking-[0.4em]">
                      <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                      {copy.extracting}
                    </div>
                    <span className="font-mono text-xs text-accent font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-accent shadow-[0_0_20px_rgba(34,211,238,0.5)]" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </motion.div>
              )}

              <button 
                  onClick={analyze} 
                  disabled={!audioBlob || analyzing} 
                  className="w-full h-18 rounded-full bg-accent hover:bg-white text-black font-bold text-xl transition-all duration-700 disabled:opacity-20 shadow-[0_0_50px_rgba(34,211,238,0.2)] group flex items-center justify-center gap-4 border-0"
              >
                {analyzing ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> MAPPING BIOMARKERS...</>
                ) : (
                  <><CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" /> {copy.start}</>
                )}
              </button>
            </div>
          ) : (
            <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-3 text-accent mb-8 px-6 py-2 rounded-full bg-accent/10 border border-accent/20 w-fit">
                <CheckCircle className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-[0.4em] font-bold">{copy.acousticCore}</span>
              </div>

              <div className="grid gap-8">
                <div className="glass-card rounded-3xl p-10 flex flex-col items-center border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full" />
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 self-start mb-10">{copy.consensus}</h3>
                  <RiskGauge score={result.precisionScore} size={280} label="Inference Precision" />
                   <div className="mt-12 text-center group">
                       <div className="text-[10px] font-mono text-white/20 mb-3 uppercase tracking-[0.5em] group-hover:text-accent transition-colors">{copy.classification}</div>
                       <h4 className={`text-4xl font-bold tracking-tighter ${result.classification === 'Low' ? 'text-emerald-400' : result.classification === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {result.classification} STAGE
                       </h4>
                  </div>
                </div>

                <div className="glass-card rounded-3xl p-10 border-white/5">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 mb-10">{copy.waveform}</h3>
                  <div className="h-[200px] flex items-center justify-center">
                    <Waveform data={result.waveformData} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Side Visuals / Results Extras */}
        <div className="lg:col-span-5">
           {!result ? (
               <div className="hidden lg:block space-y-8">
                  <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 0.8, scale: 1 }}
                      transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                      className="relative rounded-3xl overflow-hidden border border-white/10"
                  >
                    <img src="/vocal-footprint.png" alt="Spectral Footprint" className="w-full h-auto" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                             <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Spectral Footprint v3</span>
                        </div>
                        <p className="text-white/40 text-xs font-light leading-relaxed">System performs sub-lexical mapping of jitter, shimmer, and MFCC coefficients to detect neurological variance.</p>
                    </div>
                  </motion.div>

                  <div className="space-y-6">
                    {[
                      { icon: Activity, title: 'Prosodic Nuance', text: 'Evaluation of intonation, stress patterns, and rhythmic stability.' },
                      { icon: Mic, title: 'Lexical Density', text: 'Analysis of vocabulary complexity and frequency of filled pauses.' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 items-start p-6 glass-card rounded-2xl border-white/5 group hover:bg-white/[0.02] transition-all">
                        <item.icon className="w-5 h-5 text-accent/40 group-hover:text-accent transition-colors mt-1" />
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-2">{item.title}</h4>
                            <p className="text-white/40 text-[11px] font-light leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
           ) : (
                <div className="space-y-8">
                   <div className="glass-card rounded-3xl p-10 border-white/5">
                      <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8">{copy.matrix}</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={featureChartData}>
                          <XAxis dataKey="name" hide />
                          <Tooltip 
                            cursor={{ fill: 'rgba(34,211,238,0.05)' }}
                            contentStyle={{ backgroundColor: '#0a0b14', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '12px', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
                          />
                          <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-5 gap-2 mt-6">
                        {featureChartData.map(f => (
                            <div key={f.name} className="text-[8px] font-mono text-white/20 uppercase text-center leading-tight truncate">{f.name}</div>
                        ))}
                      </div>
                   </div>

                   <div className="glass-card rounded-3xl p-10 border-white/5">
                      <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30 mb-8">{copy.transcription}</h3>
                      <div className="relative pl-6">
                          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-accent/20" />
                          <p className="text-lg text-white font-light leading-relaxed italic">
                             "{result.transcript ? result.transcript.split(' | ')[0] + "..." : "Not available"}"
                          </p>
                      </div>
                   </div>
                </div>
           )}
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 glass-card rounded-3xl p-10 border-white/5">
             <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/30">{copy.biomarker}</h3>
                <span className="text-[10px] font-mono text-accent bg-accent/10 px-3 py-1 rounded-full uppercase tracking-widest">Module: Synchronized</span>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  {result.transcript ? result.transcript.split(' | ').map((finding, i) => (
                    <div key={i} className="flex items-start gap-6 group">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_15px_rgba(34,211,238,0.8)] flex-shrink-0 group-hover:scale-150 transition-transform" />
                        <p className="text-base text-white/70 leading-relaxed font-light">{finding}</p>
                    </div>
                  )) : (
                    <div className="flex items-start gap-6 group">
                        <p className="text-base text-white/70 leading-relaxed font-light">Not available</p>
                    </div>
                  )}
               </div>
               <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                    <div>
                        <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] mb-8">{copy.acousticMetadata}</div>
                        <div className="space-y-4">
                            {[
                                { k: 'Jitter (ppq5)', v: result.features.jitter !== null ? `${result.features.jitter.toFixed(3)}%` : "Not available" },
                                { k: 'Shimmer (apq3)', v: result.features.shimmer !== null ? `${result.features.shimmer.toFixed(3)}%` : "Not available" },
                                { k: 'Pitch Variance', v: result.features.pitch !== null ? `${(result.features.pitch * 0.12).toFixed(1)} Hz` : "Not available" },
                                { k: 'Pause Ratio', v: result.features.pauseDuration !== null ? `${(result.features.pauseDuration * 2.5).toFixed(1)}%` : "Not available" },
                                { k: 'HNR Matrix', v: '21.4 dB' }
                            ].map(item => (
                                <div key={item.k} className="flex justify-between border-b border-white/[0.03] pb-3">
                                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">{item.k}</span>
                                    <span className="text-xs font-mono text-white/80">{item.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={() => { setResult(null); setAudioBlob(null); setProgress(0); }}
                        className="w-full mt-12 py-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-[0.4em] hover:bg-white/10 hover:text-white transition-all text-white/40"
                    >
                        {copy.reset}
                    </button>
               </div>
            </div>
        </motion.div>
      )}
    </PageShell>
  );
};

export default SpeechAnalysis;
