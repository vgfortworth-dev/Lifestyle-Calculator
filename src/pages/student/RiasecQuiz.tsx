import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { RiasecIntro } from '../../components/riasec/RiasecIntro';
import { RiasecProgress } from '../../components/riasec/RiasecProgress';
import { RiasecQuestionCard } from '../../components/riasec/RiasecQuestionCard';
import { RiasecResults } from '../../components/riasec/RiasecResults';
import { loadRiasecQuestions } from '../../lib/riasecQuestionSource';
import { RiasecAnswers, calculateRiasecResult } from '../../lib/riasecScoring';
import { RiasecAnswerValue, RiasecQuestion, RiasecResult, RiasecSummary } from '../../types/riasec';

type RiasecQuizProps = {
  onTryLifestyle: (summary: RiasecSummary) => void;
};

export function RiasecQuiz({ onTryLifestyle }: RiasecQuizProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<RiasecAnswers>({});
  const [result, setResult] = useState<RiasecResult | null>(null);
  const [questions, setQuestions] = useState<RiasecQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionSource, setQuestionSource] = useState<'supabase' | 'fallback' | null>(null);
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const progressQuestion = Math.min(currentQuestionIndex + 1, questions.length);
  const nextQuestionImageUrl = questions[currentQuestionIndex + 1]?.imageUrl;
  const sortedScores = useMemo(() => {
    if (!result) return [];
    return result.rankedCategories.map((category) => ({
      category,
      score: result.scores[category],
    }));
  }, [result]);

  useEffect(() => {
    let isActive = true;

    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      const loaded = await loadRiasecQuestions();
      if (!isActive) return;

      setQuestions(loaded.questions);
      setQuestionSource(loaded.source);
      setIsLoadingQuestions(false);

      if (import.meta.env.DEV) {
        console.info(`[RIASEC] Quiz is using ${loaded.source} with ${loaded.questions.length} question(s).`);
      }
    };

    fetchQuestions();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!nextQuestionImageUrl) return;

    const preloadImage = new Image();
    preloadImage.decoding = 'async';
    preloadImage.src = nextQuestionImageUrl;
  }, [nextQuestionImageUrl]);

  const handleAnswer = (value: RiasecAnswerValue) => {
    if (!currentQuestion) return;

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };

    setAnswers(nextAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo(0, 0);
      return;
    }

    setResult(calculateRiasecResult(nextAnswers, questions));
    setAnswers({});
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo(0, 0);
    } else {
      setHasStarted(false);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setResult(null);
    setCurrentQuestionIndex(0);
    setHasStarted(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          onClick={() => {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
          }}
          className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-700"
        >
          Back to Lifestyle Calculator
        </button>

        {!hasStarted && !result && (
          <RiasecIntro onStart={() => setHasStarted(true)} />
        )}

        {hasStarted && !result && isLoadingQuestions && (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest">Loading RIASEC questions...</p>
            </div>
          </div>
        )}

        {hasStarted && !result && !isLoadingQuestions && currentQuestion && (
          <div className="space-y-5">
            <RiasecProgress current={progressQuestion} total={questions.length} />
            {questionSource === 'fallback' && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                Using backup RIASEC questions because the Supabase question set was unavailable.
              </div>
            )}
            <RiasecQuestionCard
              question={currentQuestion}
              selectedValue={currentAnswer}
              onAnswer={handleAnswer}
            />
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        )}

        {hasStarted && !result && !isLoadingQuestions && !currentQuestion && (
          <div className="rounded-3xl border border-red-100 bg-white p-8 shadow-xl">
            <p className="text-center text-sm font-bold text-red-600">
              No active RIASEC questions were available.
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-5">
            <RiasecResults
              result={result}
              onTryLifestyle={(summary) => {
                setAnswers({});
                onTryLifestyle(summary);
              }}
              onRestart={handleRestart}
            />
            {sortedScores.length > 0 && (
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Score detail</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-6">
                  {sortedScores.map(({ category, score }) => (
                    <div key={category} className="rounded-2xl bg-slate-50 px-3 py-2 text-center">
                      <p className="font-black text-[#3372B2]">{category}</p>
                      <p className="text-sm font-bold text-slate-500">{score}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
