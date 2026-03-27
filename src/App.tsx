/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Home, Smartphone, Wifi, Zap, Tv, PlusCircle, 
  Utensils, Car, Shirt, ShieldCheck, ChevronRight, ChevronLeft, ChevronDown,
  RotateCcw, DollarSign, Info, CheckCircle2, Calculator,
  Save, Loader2, Check, Sparkles, GraduationCap, TrendingUp, Briefcase, 
  PieChart as PieChartIcon 
} from 'lucide-react';
import { REGIONS, HOUSING_OPTIONS, PHONE_OPTIONS, PHONE_PLAN_OPTIONS, INTERNET_OPTIONS, UTILITY_OPTIONS, STREAMING_OPTIONS, SUBSCRIPTION_OPTIONS, FOOD_OPTIONS, TRANSPORT_OPTIONS, CLOTHING_OPTIONS, INSURANCE_OPTIONS, OTHER_OPTIONS } from './data/texasData';
import { QuizState, STEPS, Option } from './types';
import { supabase } from './lib/supabase';
import { getCareerSuggestions, CareerSuggestion } from './services/gemini';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const INITIAL_STATE: QuizState = {
  currentStep: 0,
  regionId: 'dallas',
  selections: {
    housing: '',
    phone: '',
    phonePlan: '',
    internet: '',
    utilities: [],
    streaming: [],
    subscriptions: [],
    food: '',
    transportation: [],
    clothing: '',
    insurance: [],
    other: [],
  },
};

const CATEGORY_EMOJIS: Record<string, string> = {
  'Shopping': '🛒',
  'Gaming': '🎮',
  'Music': '🎵',
  'Entertainment': '🎬',
  'News & Books': '📚',
  'AI & Tech': '🤖',
  'Productivity': '📝',
  'Cloud Storage': '☁️',
  'Security': '🛡️',
  'Fitness': '💪',
  'Wellness': '🧘',
  'Auto Care': '🧼',
  'Auto': '🚗',
  'Home': '🏠',
  'Health': '🏥',
  'Life': '👨‍👩‍👧‍👦',
  'Utilities': '⚡',
  'Personal Vehicles': '🚗',
  'Electric Vehicles': '🔋',
  'Cycling': '🚲',
  'General': '✨'
};

export default function App() {
  const [state, setState] = useState<QuizState>(() => {
    const saved = localStorage.getItem('lifestyle_calculator_state');
    if (!saved) return INITIAL_STATE;
    
    const parsed = JSON.parse(saved);
    // Migration: ensure transportation is an array
    if (typeof parsed.selections.transportation === 'string') {
      parsed.selections.transportation = parsed.selections.transportation 
        ? [parsed.selections.transportation] 
        : [];
    }
    return parsed;
  });

  useEffect(() => {
    localStorage.setItem('lifestyle_calculator_state', JSON.stringify(state));
  }, [state]);

  const currentRegion = useMemo(() => 
    REGIONS.find(r => r.id === state.regionId) || REGIONS[5], 
  [state.regionId]);

  const calculateMonthlyTotal = () => {
    let total = 0;
    const multiplier = currentRegion.costMultiplier;

    // Housing
    const housing = HOUSING_OPTIONS.find(o => o.id === state.selections.housing);
    if (housing) total += housing.monthlyCost * multiplier;

    // Phone
    const phone = PHONE_OPTIONS.find(o => o.id === state.selections.phone);
    if (phone) total += phone.monthlyCost;

    // Phone Plan
    const phonePlan = PHONE_PLAN_OPTIONS.find(o => o.id === state.selections.phonePlan);
    if (phonePlan) total += phonePlan.monthlyCost;

    // Internet
    const internet = INTERNET_OPTIONS.find(o => o.id === state.selections.internet);
    if (internet) total += internet.monthlyCost;

    // Utilities
    state.selections.utilities.forEach(id => {
      const opt = UTILITY_OPTIONS.find(o => o.id === id);
      if (opt) total += opt.monthlyCost * multiplier;
    });

    // Streaming
    state.selections.streaming.forEach(id => {
      const opt = STREAMING_OPTIONS.find(o => o.id === id);
      if (opt) total += opt.monthlyCost;
    });

    // Subscriptions
    state.selections.subscriptions.forEach(id => {
      const opt = SUBSCRIPTION_OPTIONS.find(o => o.id === id);
      if (opt) total += opt.monthlyCost;
    });

    // Food
    const food = FOOD_OPTIONS.find(o => o.id === state.selections.food);
    if (food) total += food.monthlyCost * multiplier;

    // Transportation
    state.selections.transportation.forEach(id => {
      const opt = TRANSPORT_OPTIONS.find(o => o.id === id);
      if (opt) total += opt.monthlyCost;
    });

    // Clothing
    const clothing = CLOTHING_OPTIONS.find(o => o.id === state.selections.clothing);
    if (clothing) total += clothing.monthlyCost;

    // Insurance
    state.selections.insurance.forEach(id => {
      const opt = INSURANCE_OPTIONS.find(o => o.id === id);
      if (opt) total += opt.monthlyCost * multiplier;
    });

    // Other
    state.selections.other.forEach(id => {
      const opt = OTHER_OPTIONS.find(o => o.id === id);
      if (opt) total += opt.monthlyCost;
    });

    return total;
  };

  const monthlyTotal = calculateMonthlyTotal();
  const annualTotal = monthlyTotal * 12;
  const recommendedSalary = annualTotal / 0.7; // Assuming 30% for taxes and savings

  const nextStep = () => {
    if (state.currentStep < STEPS.length - 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (state.currentStep > 0) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
      window.scrollTo(0, 0);
    }
  };

  const resetQuiz = () => {
    setState(INITIAL_STATE);
    window.scrollTo(0, 0);
  };

  const handleSelection = (category: keyof QuizState['selections'] | 'regionId', value: string | string[]) => {
    if (category === 'regionId') {
      setState(prev => ({ ...prev, regionId: value as string }));
    } else {
      setState(prev => ({
        ...prev,
        selections: {
          ...prev.selections,
          [category as keyof QuizState['selections']]: value
        }
      }));
    }
  };

  const toggleMultiSelection = (category: keyof QuizState['selections'], value: string) => {
    const current = state.selections[category] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleSelection(category, updated);
  };

  const renderStep = () => {
    const stepName = STEPS[state.currentStep];

    switch (stepName) {
      case 'Welcome':
        return (
          <div className="flex flex-col items-center text-center space-y-8 py-12">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-200"
            >
              <Calculator className="w-16 h-16 text-white" />
            </motion.div>
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                The Lifestyle <span className="text-orange-500">Calculator</span>
              </h1>
              <p className="text-xl text-slate-600 font-medium leading-relaxed">
                Ever wondered what it actually costs to live the life you want in Texas? 
                Let's build your future budget together.
              </p>
            </div>
            <button 
              onClick={nextStep}
              className="px-10 py-5 bg-slate-900 text-white rounded-2xl text-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-3"
            >
              Start My Journey <ChevronRight className="w-6 h-6" />
            </button>
            <div className="grid grid-cols-3 gap-6 w-full max-w-3xl mt-12">
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <MapPin className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-bold text-slate-900">28 Regions</h3>
                <p className="text-sm text-slate-500">Real Texas data</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <Home className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="font-bold text-slate-900">Custom Living</h3>
                <p className="text-sm text-slate-500">Choose your home</p>
              </div>
              <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="font-bold text-slate-900">Real Prices</h3>
                <p className="text-sm text-slate-500">Accurate estimates</p>
              </div>
            </div>
          </div>
        );

      case 'Location':
        return (
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900">Where will you live?</h2>
              <p className="text-slate-500 text-lg">Prices change depending on where you are in Texas!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {REGIONS.map(region => (
                <button
                  key={region.id}
                  onClick={() => {
                    handleSelection('regionId' as any, region.id);
                    nextStep();
                  }}
                  className={`p-6 rounded-3xl text-left transition-all border-2 ${
                    state.regionId === region.id 
                      ? 'border-orange-500 bg-orange-50 ring-4 ring-orange-100' 
                      : 'border-slate-100 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                        <span className="text-2xl">{region.emoji}</span> {region.name}
                      </h3>
                      <p className="text-slate-500 font-medium">{region.majorCity}</p>
                    </div>
                    {state.regionId === region.id && <CheckCircle2 className="w-6 h-6 text-orange-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'Housing':
        return <SelectionStep 
          title="Choose Your New Home" 
          description="Where will you hang your hat?" 
          options={HOUSING_OPTIONS} 
          category="housing" 
          state={state} 
          onSelect={handleSelection} 
          onNext={nextStep}
          multiplier={currentRegion.costMultiplier}
        />;

      case 'Phone':
        return <SelectionStep 
          title="Choose Your Phone" 
          description="Which device will you carry?" 
          options={PHONE_OPTIONS} 
          category="phone" 
          state={state} 
          onSelect={handleSelection} 
          onNext={nextStep}
        />;

      case 'Phone Plan':
        return <SelectionStep 
          title="Choose Your Phone Plan" 
          description="How much data do you need?" 
          options={PHONE_PLAN_OPTIONS} 
          category="phonePlan" 
          state={state} 
          onSelect={handleSelection} 
          onNext={nextStep}
        />;

      case 'Internet':
        return <SelectionStep 
          title="Choose Your Internet Plan" 
          description="Fast speeds for gaming and streaming." 
          options={INTERNET_OPTIONS} 
          category="internet" 
          state={state} 
          onSelect={handleSelection} 
          onNext={nextStep}
        />;

      case 'Utilities':
        return <MultiSelectionStep 
          title="Choose Your Utilities" 
          description="Don't forget the basics! (Select all that apply)" 
          options={UTILITY_OPTIONS} 
          category="utilities" 
          state={state} 
          onToggle={toggleMultiSelection} 
          onNext={nextStep}
          multiplier={currentRegion.costMultiplier}
        />;

      case 'Streaming':
        return <StreamingSelectionStep 
          title="Choose Your Streaming Plans" 
          description="What will you watch and listen to? Compare 'With Ads' vs 'No Ads' options." 
          options={STREAMING_OPTIONS} 
          category="streaming" 
          state={state} 
          onToggle={toggleMultiSelection} 
          onNext={nextStep}
        />;

      case 'Subscriptions':
        return <MultiSelectionStep 
          title="More Subscriptions" 
          description="Extra perks for your lifestyle." 
          options={SUBSCRIPTION_OPTIONS} 
          category="subscriptions" 
          state={state} 
          onToggle={toggleMultiSelection} 
          onNext={nextStep}
        />;

      case 'Food':
        return <SelectionStep 
          title="Food & Groceries" 
          description="How do you plan to eat?" 
          options={FOOD_OPTIONS} 
          category="food" 
          state={state} 
          onSelect={handleSelection} 
          onNext={nextStep}
          multiplier={currentRegion.costMultiplier}
        />;

      case 'Transportation':
        return <MultiSelectionStep 
          title="Choose Your Transportation" 
          description="How will you get around Texas? (Select all that apply)" 
          options={TRANSPORT_OPTIONS} 
          category="transportation" 
          state={state} 
          onToggle={toggleMultiSelection} 
          onNext={nextStep}
        />;

      case 'Clothing':
        return <SelectionStep 
          title="Choose Your Clothing Package" 
          description="What's your style budget?" 
          options={CLOTHING_OPTIONS} 
          category="clothing" 
          state={state} 
          onSelect={handleSelection} 
          onNext={nextStep}
        />;

      case 'Insurance Info':
        return (
          <div className="space-y-8 py-8">
            <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
                  <Info className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900">All About Insurance</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-blue-900">What is it?</h3>
                  <p className="text-blue-800/80">Insurance is a way to protect yourself from big financial losses. You pay a small amount every month so you don't have to pay a huge amount if something bad happens.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-blue-900">Auto Insurance</h3>
                  <p className="text-blue-800/80">Required by law if you drive. It covers damage to your car and others if you're in an accident.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-blue-900">Health Insurance</h3>
                  <p className="text-blue-800/80">Covers doctor visits, medicine, and hospital stays. Very important for staying healthy!</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl text-blue-900">Home/Renters</h3>
                  <p className="text-blue-800/80">Protects your stuff (like your laptop or clothes) if they are stolen or damaged in a fire.</p>
                </div>
              </div>
              <button 
                onClick={nextStep}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg"
              >
                I Understand, Let's Choose!
              </button>
            </div>
          </div>
        );

      case 'Insurance Selection':
        return <MultiSelectionStep 
          title="Choose Your Insurance" 
          description="Protect your future self." 
          options={INSURANCE_OPTIONS} 
          category="insurance" 
          state={state} 
          onToggle={toggleMultiSelection} 
          onNext={nextStep}
          multiplier={currentRegion.costMultiplier}
        />;

      case 'Other Services':
        return <MultiSelectionStep 
          title="Other Services" 
          description="The little things that add up." 
          options={OTHER_OPTIONS} 
          category="other" 
          state={state} 
          onToggle={toggleMultiSelection} 
          onNext={nextStep}
        />;

      case 'Results':
        return <ResultsStep state={state} monthlyTotal={monthlyTotal} annualTotal={annualTotal} recommendedSalary={recommendedSalary} onReset={resetQuiz} />;

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-32">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-100">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight hidden sm:block">Lifestyle Calculator</span>
          </div>
          
          {state.currentStep > 0 && state.currentStep < STEPS.length - 1 && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {state.currentStep} of {STEPS.length - 2}</span>
                <span className="font-bold text-slate-700">{STEPS[state.currentStep]}</span>
              </div>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(state.currentStep / (STEPS.length - 2)) * 100}%` }}
                />
              </div>
            </div>
          )}

          <button 
            onClick={resetQuiz}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-orange-600 font-bold text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Quiz</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Rolling Footer */}
      {state.currentStep > 0 && state.currentStep < STEPS.length - 1 && (
        <motion.footer 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 z-50 shadow-2xl"
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Total</span>
                <span className="text-3xl font-black text-slate-900">${monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="h-10 w-px bg-slate-100 hidden sm:block" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Annual Salary Needed</span>
                <span className="text-xl font-bold text-orange-500">${recommendedSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
              <button 
                onClick={prevStep}
                className="flex-1 sm:flex-none px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <button 
                onClick={nextStep}
                className="flex-1 sm:flex-none px-10 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
              >
                Next Step <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.footer>
      )}
    </div>
  );
}

function SelectionStep({ title, description, options, category, state, onSelect, onNext, multiplier = 1 }: any) {
  const selectedId = state.selections[category];
  
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900">{title}</h2>
        <p className="text-slate-500 text-lg">{description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {options.map((opt: Option) => (
          <button
            key={opt.id}
            onClick={() => onSelect(category, opt.id)}
            className={`rounded-2xl text-left transition-all border-2 flex flex-col h-full overflow-hidden group ${
              selectedId === opt.id 
                ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-100' 
                : 'border-slate-100 bg-white hover:border-slate-300'
            }`}
          >
            {opt.image && (
              <div className="w-full aspect-video overflow-hidden border-b border-slate-50">
                <img 
                  src={opt.image} 
                  alt={opt.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="p-3 flex flex-col justify-between flex-1">
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 leading-tight">
                    <span className="text-lg">{opt.emoji}</span> {opt.name}
                  </h3>
                  {selectedId === opt.id && <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-tight line-clamp-2">{opt.description}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center">
                <span className="text-lg font-black text-slate-900">${(opt.monthlyCost * multiplier).toLocaleString()} <span className="text-[10px] font-bold text-slate-400 uppercase">/mo</span></span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiSelectionStep({ title, description, options, category, state, onToggle, onNext, multiplier = 1 }: any) {
  const selectedIds = state.selections[category] as string[];
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const groupedOptions = useMemo(() => {
    const groups: Record<string, any[]> = {};
    let hasCategories = false;
    
    options.forEach((opt: any) => {
      if (opt.category) {
        hasCategories = true;
        if (!groups[opt.category]) groups[opt.category] = [];
        groups[opt.category].push(opt);
      } else {
        if (!groups['General']) groups['General'] = [];
        groups['General'].push(opt);
      }
    });
    
    return { groups, hasCategories };
  }, [options]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Initialize all categories as expanded on first load
  useEffect(() => {
    if (groupedOptions.hasCategories) {
      const initial: Record<string, boolean> = {};
      Object.keys(groupedOptions.groups).forEach(cat => {
        initial[cat] = true;
      });
      setExpandedCategories(initial);
    }
  }, [groupedOptions.hasCategories]);

  const renderOptionGrid = (opts: any[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {opts.map((opt: Option) => (
        <button
          key={opt.id}
          onClick={() => onToggle(category, opt.id)}
          className={`rounded-2xl text-left transition-all border-2 flex flex-col h-full overflow-hidden group ${
            selectedIds.includes(opt.id)
              ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-100' 
              : 'border-slate-100 bg-white hover:border-slate-300'
          }`}
        >
          {opt.image && (
            <div className="w-full aspect-video overflow-hidden border-b border-slate-50">
              <img 
                src={opt.image} 
                alt={opt.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div className="p-3 flex flex-col justify-between flex-1">
            <div className="space-y-1">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 leading-tight">
                  <span className="text-lg">{opt.emoji}</span> {opt.name}
                </h3>
                <div className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                  selectedIds.includes(opt.id) ? 'bg-orange-500 border-orange-500' : 'border-slate-200'
                }`}>
                  {selectedIds.includes(opt.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-tight line-clamp-2">{opt.description}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center">
              <span className="text-lg font-black text-slate-900">${(opt.monthlyCost * multiplier).toLocaleString()} <span className="text-[10px] font-bold text-slate-400 uppercase">/mo</span></span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900">{title}</h2>
        <p className="text-slate-500 text-lg">{description}</p>
      </div>

      {groupedOptions.hasCategories ? (
        <div className="space-y-6">
          {Object.entries(groupedOptions.groups).map(([catName, opts]) => (
            <div key={catName} className="space-y-3">
              <button 
                onClick={() => toggleCategory(catName)}
                className="flex items-center gap-2 w-full text-left group"
              >
                <div className={`transition-transform duration-200 ${expandedCategories[catName] ? 'rotate-0' : '-rotate-90'}`}>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-orange-500" />
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_EMOJIS[catName] || '✨'}</span>
                  {catName}
                  <span className="text-sm font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{(opts as any[]).length}</span>
                </h3>
                <div className="flex-1 h-px bg-slate-100" />
              </button>
              
              <AnimatePresence>
                {expandedCategories[catName] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {renderOptionGrid(opts as any[])}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      ) : (
        renderOptionGrid(options)
      )}
    </div>
  );
}

function StreamingSelectionStep({ title, description, options, category, state, onToggle }: any) {
  const selectedIds = state.selections[category] as string[];
  
  const services = useMemo(() => {
    const groups: Record<string, { ads?: Option, noAds?: Option, standard?: Option }> = {};
    
    options.forEach((opt: Option) => {
      const serviceName = opt.service || 'Other';
      if (!groups[serviceName]) groups[serviceName] = {};
      
      const group = groups[serviceName];
      if (opt.planType === 'ads') group.ads = opt;
      else if (opt.planType === 'no-ads') group.noAds = opt;
      else group.standard = opt;
    });
    
    return groups;
  }, [options]);

  const renderOption = (opt: Option) => (
    <button
      key={opt.id}
      onClick={() => onToggle(category, opt.id)}
      className={`w-full rounded-2xl text-left transition-all border-2 flex items-center gap-4 p-4 group h-full ${
        selectedIds.includes(opt.id)
          ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-100' 
          : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
      }`}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-inner">
        <img src={opt.image} alt={opt.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-bold text-sm text-slate-900 leading-tight">
            {opt.name}
          </h4>
          <div className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
            selectedIds.includes(opt.id) ? 'bg-orange-500 border-orange-500' : 'border-slate-200'
          }`}>
            {selectedIds.includes(opt.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-black text-slate-900">${opt.monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/mo</span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
        <p className="text-slate-500 text-xl font-medium">{description}</p>
      </div>

      <div className="space-y-12">
        {/* Desktop Header */}
        <div className="grid grid-cols-2 gap-12 px-6 hidden md:grid">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">With Ads / Standard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-300" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No Ads / Premium</span>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(services).map(([serviceName, group]: [string, any]) => (
            <div key={serviceName} className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">{serviceName}</h3>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">
                <div className="space-y-3">
                  {group.ads ? renderOption(group.ads) : group.standard ? renderOption(group.standard) : (
                    <div className="h-full min-h-[88px] border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Ads Only</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {group.noAds ? renderOption(group.noAds) : (
                    <div className="hidden md:flex h-full min-h-[88px] border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Single Option Only</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultsStep({ state, monthlyTotal, annualTotal, recommendedSalary, onReset }: any) {
  const currentRegion = REGIONS.find(r => r.id === state.regionId) || REGIONS[5];
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [careers, setCareers] = useState<CareerSuggestion[]>([]);
  const [isLoadingCareers, setIsLoadingCareers] = useState(true);

  useEffect(() => {
    const fetchCareers = async () => {
      setIsLoadingCareers(true);
      try {
        const suggestions = await getCareerSuggestions(recommendedSalary, currentRegion.name);
        setCareers(suggestions);
      } catch (err) {
        console.error('Failed to fetch careers:', err);
      } finally {
        setIsLoadingCareers(false);
      }
    };
    fetchCareers();
  }, [recommendedSalary, currentRegion.name]);

  const handleSaveResult = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const { error } = await supabase
        .from('lifestyle_results')
        .insert([
          {
            region: currentRegion.name,
            monthly_total: monthlyTotal,
            annual_salary: recommendedSalary,
            selections: state.selections,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Error saving result:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const details = useMemo(() => {
    const items: { name: string; cost: number; category: string; emoji?: string }[] = [];
    const m = currentRegion.costMultiplier;

    const add = (opt: Option | undefined, cat: string, mult = 1) => {
      if (opt) items.push({ name: opt.name, cost: opt.monthlyCost * mult, category: cat, emoji: opt.emoji });
    };

    add(HOUSING_OPTIONS.find(o => o.id === state.selections.housing), 'Housing', m);
    add(PHONE_OPTIONS.find(o => o.id === state.selections.phone), 'Phone');
    add(PHONE_PLAN_OPTIONS.find(o => o.id === state.selections.phonePlan), 'Phone Plan');
    add(INTERNET_OPTIONS.find(o => o.id === state.selections.internet), 'Internet');
    
    state.selections.utilities.forEach((id: string) => add(UTILITY_OPTIONS.find(o => o.id === id), 'Utilities', m));
    state.selections.streaming.forEach((id: string) => add(STREAMING_OPTIONS.find(o => o.id === id), 'Streaming'));
    state.selections.subscriptions.forEach((id: string) => add(SUBSCRIPTION_OPTIONS.find(o => o.id === id), 'Subscriptions'));
    
    add(FOOD_OPTIONS.find(o => o.id === state.selections.food), 'Food', m);
    state.selections.transportation.forEach((id: string) => add(TRANSPORT_OPTIONS.find(o => o.id === id), 'Transportation'));
    add(CLOTHING_OPTIONS.find(o => o.id === state.selections.clothing), 'Clothing');
    
    state.selections.insurance.forEach((id: string) => add(INSURANCE_OPTIONS.find(o => o.id === id), 'Insurance', m));
    state.selections.other.forEach((id: string) => add(OTHER_OPTIONS.find(o => o.id === id), 'Other'));

    return items;
  }, [state.selections, currentRegion.costMultiplier]);

  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    details.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + item.cost;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [details]);

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  return (
    <div className="space-y-12 py-8">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-4"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h2 className="text-5xl font-black text-slate-900">Your Future Awaits!</h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">Based on your choices in <span className="text-slate-900 font-bold">{currentRegion.emoji} {currentRegion.name}</span>, here is what you'll need to earn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-2xl font-bold">Lifestyle Breakdown</h3>
              <div className="text-right">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Monthly Total</p>
                <p className="text-3xl font-black">${monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="p-8 space-y-4">
              {details.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg">{item.emoji}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                      <span className="font-bold text-slate-700">{item.name}</span>
                    </div>
                  </div>
                  <span className="font-black text-slate-900">${item.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <PieChartIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Budget Visualization</h3>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monthly Cost']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {categoryData.map((item, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{item.name}</p>
                  <p className="text-sm font-black text-slate-900">${item.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-orange-500 rounded-3xl p-8 text-white shadow-xl shadow-orange-200 space-y-6">
            <div className="space-y-1">
              <p className="text-orange-100 text-sm font-bold uppercase tracking-widest">Minimum Annual Salary</p>
              <h4 className="text-5xl font-black">${recommendedSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
            </div>
            <p className="text-orange-50/80 font-medium leading-relaxed">
              This includes your lifestyle choices plus an estimated 30% for taxes, savings, and unexpected costs.
            </p>
            
            <button 
              onClick={handleSaveResult}
              disabled={isSaving}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                saveStatus === 'success' 
                  ? 'bg-green-400 text-white' 
                  : saveStatus === 'error'
                  ? 'bg-red-400 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : saveStatus === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error Saving' : 'Save My Result'}
            </button>

            <div className="pt-6 border-t border-white/20">
              <p className="text-sm font-bold text-orange-100 uppercase tracking-widest mb-4">What's Next?</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">1</div>
                  Research careers that pay this much
                </li>
                <li className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">2</div>
                  Look at college majors or trade schools
                </li>
                <li className="flex items-center gap-3 text-sm font-bold">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">3</div>
                  Talk to a counselor about your goals
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">AI Career Matcher</h3>
            </div>
            
            <p className="text-sm text-slate-500 leading-relaxed">
              Based on your target salary of <span className="font-bold text-slate-900">${recommendedSalary.toLocaleString()}</span>, here are some high-demand careers in <span className="font-bold text-slate-900">{currentRegion.name}</span>:
            </p>

            <div className="space-y-4">
              {isLoadingCareers ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest">Finding your matches...</p>
                </div>
              ) : careers.length > 0 ? (
                careers.map((career, i) => (
                  <motion.div 
                    key={i}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{career.title}</h4>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">{career.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        <GraduationCap className="w-3 h-3" />
                        {career.education}
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        <Briefcase className="w-3 h-3" />
                        {career.avgSalary}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matches found. Try again!</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={onReset}
            className="w-full py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-3xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-6 h-6" /> Retake the Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
