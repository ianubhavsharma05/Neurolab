import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowRight, CheckCircle, Timer, Brain as BrainIcon } from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { getOverallRisk } from '@/services/api';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { CognitiveTestResult } from '@/types';

type TestPhase = 'menu' | 'memory-show' | 'memory-recall' | 'reaction-wait' | 'reaction-click' | 'reaction-done' | 'verbal' | 'complete';

const WORDS_POOL = ['Apple', 'Bridge', 'Cloud', 'Dance', 'Eagle', 'Forest', 'Guitar', 'Harbor', 'Island', 'Jungle', 'Kite', 'Lemon', 'Mountain', 'Notebook', 'Ocean', 'Piano', 'Queen', 'River', 'Sunset', 'Turtle'];

const CognitiveTests: React.FC = () => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<TestPhase>('menu');

  // Memory test state
  const [memoryWords, setMemoryWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [recalledWords, setRecalledWords] = useState<string[]>([]);
  const [recallInput, setRecallInput] = useState('');

  // Reaction test state
  const [reactionTrials, setReactionTrials] = useState<number[]>([]);
  const [reactionStart, setReactionStart] = useState(0);
  const [trialCount, setTrialCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Verbal fluency state
  const [verbalWords, setVerbalWords] = useState<string[]>([]);
  const [verbalInput, setVerbalInput] = useState('');
  const [verbalTimeLeft, setVerbalTimeLeft] = useState(30);
  const [verbalRunning, setVerbalRunning] = useState(false);

  // Results
  const [testResult, setTestResult] = useState<CognitiveTestResult | null>(null);

  // Memory Test
  const startMemoryTest = () => {
    const words = [...WORDS_POOL].sort(() => Math.random() - 0.5).slice(0, 8);
    setMemoryWords(words);
    setCurrentWordIndex(0);
    setRecalledWords([]);
    setPhase('memory-show');
  };

  useEffect(() => {
    if (phase === 'memory-show' && currentWordIndex < memoryWords.length) {
      const t = setTimeout(() => setCurrentWordIndex(i => i + 1), 2000);
      return () => clearTimeout(t);
    }
    if (phase === 'memory-show' && currentWordIndex >= memoryWords.length) {
      setTimeout(() => setPhase('memory-recall'), 1000);
    }
  }, [phase, currentWordIndex, memoryWords.length]);

  const submitRecall = (e: React.FormEvent) => {
    e.preventDefault();
    if (recallInput.trim()) {
      setRecalledWords(prev => [...prev, recallInput.trim()]);
      setRecallInput('');
    }
  };

  const finishMemoryTest = () => startReactionTest();

  // Reaction Test
  const startReactionTest = () => {
    setReactionTrials([]);
    setTrialCount(0);
    setPhase('reaction-wait');
    scheduleSignal();
  };

  const scheduleSignal = () => {
    const delay = 2000 + Math.random() * 3000;
    timeoutRef.current = setTimeout(() => {
      setReactionStart(Date.now());
      setPhase('reaction-click');
    }, delay);
  };

  const handleReactionClick = () => {
    if (phase === 'reaction-click') {
      const time = Date.now() - reactionStart;
      const newTrials = [...reactionTrials, time];
      setReactionTrials(newTrials);
      const count = trialCount + 1;
      setTrialCount(count);
      if (count >= 5) {
        setPhase('reaction-done');
      } else {
        setPhase('reaction-wait');
        scheduleSignal();
      }
    }
  };

  const finishReactionTest = () => startVerbalTest();

  // Verbal Fluency Test
  const startVerbalTest = () => {
    setVerbalWords([]);
    setVerbalTimeLeft(30);
    setVerbalRunning(true);
    setPhase('verbal');
  };

  useEffect(() => {
    if (verbalRunning && verbalTimeLeft > 0) {
      const t = setTimeout(() => setVerbalTimeLeft(s => s - 1), 1000);
      return () => clearTimeout(t);
    }
    if (verbalRunning && verbalTimeLeft <= 0) {
      setVerbalRunning(false);
      finishAllTests();
    }
  }, [verbalRunning, verbalTimeLeft]);

  const submitVerbalWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (verbalInput.trim() && verbalRunning) {
      setVerbalWords(prev => [...prev, verbalInput.trim()]);
      setVerbalInput('');
    }
  };

  const finishAllTests = useCallback(() => {
    if (!user) return;

    const memoryScore = Math.round((recalledWords.filter(w => memoryWords.map(m => m.toLowerCase()).includes(w.toLowerCase())).length / memoryWords.length) * 100);
    const avgReaction = reactionTrials.length > 0 ? reactionTrials.reduce((a, b) => a + b, 0) / reactionTrials.length : 999;
    const reactionScore = Math.max(0, Math.min(100, 100 - (avgReaction - 200) / 5));
    const verbalScore = Math.min(100, verbalWords.length * 5);
    const overallScore = Math.round((memoryScore + reactionScore + verbalScore) / 3);

    const cogResult: CognitiveTestResult = {
      id: uuidv4(),
      userId: user.id,
      date: new Date().toISOString(),
      memoryRecall: { score: memoryScore, wordsShown: memoryWords, wordsRecalled: recalledWords },
      reactionTime: { averageMs: Math.round(avgReaction), trials: reactionTrials },
      verbalFluency: { score: verbalScore, words: verbalWords, duration: 30 },
      overallScore,
    };

    dataStore.saveCognitiveResult(user.id, cogResult);

    // Calculate overall risk
    const mriResults = dataStore.getMRIResults(user.id);
    const speechResults = dataStore.getSpeechResults(user.id);
    const latestMRI = mriResults[mriResults.length - 1];
    const latestSpeech = speechResults[speechResults.length - 1];

    const fetchRisk = async () => {
      try {
        const mriAccuracyVal = latestMRI?.precisionScore || 50;
        const speechAccuracyVal = latestSpeech?.precisionScore || 50;
        
        const riskResult = await getOverallRisk(
            mriAccuracyVal,
            speechAccuracyVal,
            100 - overallScore
        );

        dataStore.saveRiskAssessment(user.id, {
          id: uuidv4(),
          userId: user.id,
          date: new Date().toISOString(),
          mriScore: mriAccuracyVal,
          speechScore: speechAccuracyVal,
          cognitiveScore: 100 - overallScore,
          precisionScore: Math.round((mriAccuracyVal * 0.45) + (speechAccuracyVal * 0.25) + (overallScore * 0.30)),
          classification: riskResult.overallRisk < 33 ? 'Low' : riskResult.overallRisk < 66 ? 'Moderate' : 'High',
          explanations: [
            { feature: 'MRI Anomaly', importance: 0.45, description: 'Derived from structural mappings.' },
            { feature: 'Speech Biomarker', importance: 0.25, description: 'Derived from acoustic prosody.' },
            { feature: 'Cognitive Task', importance: 0.30, description: 'Derived from memory and reaction metrics.' }
          ],
          ...riskResult,
        });
      } catch (error: any) {
        toast.error(error.message || 'Failed to update overall risk assessment');
      }
    };

    fetchRisk();

    setTestResult(cogResult);
    setPhase('complete');
    toast.success('All tests complete! Risk assessment updated.');
  }, [user, recalledWords, memoryWords, reactionTrials, verbalWords]);

  // Cleanup
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-display mb-2">Cognitive Assessment</h1>
        <p className="text-muted-foreground mb-8">Complete three cognitive tasks to assess memory, reaction time, and language ability</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {[
              { icon: BrainIcon, title: 'Memory Recall', desc: '8 words shown → recall as many as possible', color: 'text-primary' },
              { icon: Timer, title: 'Reaction Time', desc: '5 trials → click when the signal appears', color: 'text-secondary' },
              { icon: Activity, title: 'Verbal Fluency', desc: 'Name animals in 30 seconds', color: 'text-accent' },
            ].map((test, i) => (
              <div key={test.title} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${test.color}`}>
                  <test.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-sm">{test.title}</h3>
                  <p className="text-xs text-muted-foreground">{test.desc}</p>
                </div>
                <span className="text-xs text-muted-foreground">Test {i + 1}</span>
              </div>
            ))}
            <Button onClick={startMemoryTest} className="w-full gradient-primary text-primary-foreground border-0" size="lg">
              <ArrowRight className="w-4 h-4 mr-2" /> Begin Assessment
            </Button>
          </motion.div>
        )}

        {phase === 'memory-show' && (
          <motion.div key="memory-show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-6">Remember these words ({currentWordIndex}/{memoryWords.length})</p>
            <AnimatePresence mode="wait">
              {currentWordIndex < memoryWords.length && (
                <motion.div key={currentWordIndex} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} className="text-5xl font-display font-bold text-primary">
                  {memoryWords[currentWordIndex]}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex justify-center gap-1 mt-8">
              {memoryWords.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i <= currentWordIndex ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'memory-recall' && (
          <motion.div key="memory-recall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <h2 className="text-xl font-display font-semibold text-center">Recall the words</h2>
            <p className="text-sm text-muted-foreground text-center">Type each word you remember and press Enter</p>
            <form onSubmit={submitRecall} className="flex gap-2">
              <Input value={recallInput} onChange={e => setRecallInput(e.target.value)} placeholder="Type a word..." autoFocus />
              <Button type="submit">Add</Button>
            </form>
            <div className="flex flex-wrap gap-2">
              {recalledWords.map((w, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">{w}</span>
              ))}
            </div>
            <Button onClick={finishMemoryTest} className="w-full" variant="outline">Done — Next Test <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </motion.div>
        )}

        {(phase === 'reaction-wait' || phase === 'reaction-click') && (
          <motion.div key="reaction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-4">Trial {trialCount + 1} of 5</p>
            <button
              onClick={handleReactionClick}
              className={`w-64 h-64 rounded-2xl mx-auto flex items-center justify-center text-xl font-display font-bold transition-all ${
                phase === 'reaction-click'
                  ? 'bg-success text-success-foreground scale-105 cursor-pointer'
                  : 'bg-muted text-muted-foreground cursor-default'
              }`}
            >
              {phase === 'reaction-click' ? 'CLICK NOW!' : 'Wait...'}
            </button>
            {reactionTrials.length > 0 && (
              <p className="text-sm text-muted-foreground mt-4">Last: {reactionTrials[reactionTrials.length - 1]}ms</p>
            )}
          </motion.div>
        )}

        {phase === 'reaction-done' && (
          <motion.div key="reaction-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12 space-y-4">
            <CheckCircle className="w-12 h-12 text-success mx-auto" />
            <h2 className="text-xl font-display font-semibold">Reaction Test Complete</h2>
            <p className="text-muted-foreground">Average: {Math.round(reactionTrials.reduce((a, b) => a + b, 0) / reactionTrials.length)}ms</p>
            <Button onClick={finishReactionTest}>Next Test — Verbal Fluency <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </motion.div>
        )}

        {phase === 'verbal' && (
          <motion.div key="verbal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-display font-semibold">Verbal Fluency Test</h2>
              <p className="text-sm text-muted-foreground mb-2">Name as many <strong>animals</strong> as possible</p>
              <div className="text-4xl font-display font-bold text-primary">{verbalTimeLeft}s</div>
            </div>
            <form onSubmit={submitVerbalWord} className="flex gap-2">
              <Input value={verbalInput} onChange={e => setVerbalInput(e.target.value)} placeholder="Type an animal..." autoFocus disabled={!verbalRunning} />
              <Button type="submit" disabled={!verbalRunning}>Add</Button>
            </form>
            <div className="flex flex-wrap gap-2">
              {verbalWords.map((w, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">{w}</span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">{verbalWords.length} animals named</p>
          </motion.div>
        )}

        {phase === 'complete' && testResult && (
          <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
              <h2 className="text-2xl font-display font-bold">Assessment Complete</h2>
              <p className="text-muted-foreground">Overall Cognitive Score: <span className="font-bold text-foreground">{testResult.overallScore}%</span></p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl border border-border p-5 text-center">
                <BrainIcon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{testResult.memoryRecall.score}%</p>
                <p className="text-xs text-muted-foreground">Memory Recall</p>
                <p className="text-xs text-muted-foreground mt-1">{testResult.memoryRecall.wordsRecalled.length}/{testResult.memoryRecall.wordsShown.length} words</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 text-center">
                <Timer className="w-6 h-6 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold">{testResult.reactionTime.averageMs}ms</p>
                <p className="text-xs text-muted-foreground">Avg Reaction Time</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 text-center">
                <Activity className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold">{testResult.verbalFluency.words.length}</p>
                <p className="text-xs text-muted-foreground">Animals Named</p>
              </div>
            </div>

            <Button onClick={() => setPhase('menu')} variant="outline" className="w-full">Take Again</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CognitiveTests;
