import { useRef, useState } from 'react';
import { analyzeText, analyzePDF, generatePlan } from '../api/index.js';
import { saveSession } from '../api/history.js';

export function useAnalysis() {
  const [analysis, setAnalysis] = useState(null); // { summary, keyConcepts, quiz }
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false); // analyzing step
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('idle'); // idle | analyzing | planning | done
  const requestIdRef = useRef(0);

  async function runText(text) {
    const requestId = ++requestIdRef.current;
    setError(null);
    setAnalysis(null);
    setPlan(null);
    setPlanning(false);
    setLoading(true);
    setStep('analyzing');
    try {
      const result = await analyzeText(text);
      if (requestId !== requestIdRef.current) return;

      setAnalysis(result);
      setLoading(false);

      setStep('planning');
      setPlanning(true);

      let studyPlan = null;
      try {
        studyPlan = await generatePlan({
          topic: result.summary.split('.')[0],
          keyConcepts: result.keyConcepts.map((c) => c.term),
          durationDays: 5,
        });
      } catch (planErr) {
        if (requestId !== requestIdRef.current) return;
        setError(`Analysis is ready, but study plan generation failed: ${planErr.message}`);
      }

      if (requestId !== requestIdRef.current) return;
      if (studyPlan) {
        setPlan(studyPlan);
      }
      setStep('done');

      saveSession({ type: 'text', preview: text.substring(0, 80), analysis: result, plan: studyPlan });
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      setError(e.message);
      setStep('idle');
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
      setPlanning(false);
    }
  }

  async function runPDF(file) {
    const requestId = ++requestIdRef.current;
    setError(null);
    setAnalysis(null);
    setPlan(null);
    setPlanning(false);
    setLoading(true);
    setStep('analyzing');
    try {
      const result = await analyzePDF(file);
      if (requestId !== requestIdRef.current) return;

      setAnalysis(result);
      setLoading(false);

      setStep('planning');
      setPlanning(true);

      let studyPlan = null;
      try {
        studyPlan = await generatePlan({
          topic: result.summary.split('.')[0],
          keyConcepts: result.keyConcepts.map((c) => c.term),
          durationDays: 5,
        });
      } catch (planErr) {
        if (requestId !== requestIdRef.current) return;
        setError(`Analysis is ready, but study plan generation failed: ${planErr.message}`);
      }

      if (requestId !== requestIdRef.current) return;
      if (studyPlan) {
        setPlan(studyPlan);
      }
      setStep('done');

      saveSession({ type: 'pdf', preview: file.name, analysis: result, plan: studyPlan });
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      setError(e.message);
      setStep('idle');
    } finally {
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
      setPlanning(false);
    }
  }

  function reset() {
    requestIdRef.current += 1;
    setAnalysis(null);
    setPlan(null);
    setError(null);
    setStep('idle');
    setLoading(false);
    setPlanning(false);
  }

  function loadSession(session) {
    if (!session) return;
    requestIdRef.current += 1;
    setError(null);
    setLoading(false);
    setPlanning(false);
    setStep('done');
    setAnalysis(session.analysis ?? null);
    setPlan(session.plan ?? null);
  }

  return { analysis, plan, loading, planning, error, step, runText, runPDF, reset, loadSession };
}
