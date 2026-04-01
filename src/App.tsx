/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { 
  MapPin, Home, Smartphone, Wifi, Zap, Tv, PlusCircle, 
  Utensils, Car, Shirt, ShieldCheck, ChevronRight, ChevronLeft, ChevronDown,
  RotateCcw, DollarSign, Info, CheckCircle2, Calculator,
  Save, Loader2, Check, Sparkles, GraduationCap, TrendingUp, Briefcase,
  Camera, MessageSquare, History, X,
  PieChart as PieChartIcon 
} from 'lucide-react';
import { REGIONS, HOUSING_OPTIONS, PHONE_OPTIONS, PHONE_SUB_OPTIONS, PHONE_PLAN_OPTIONS, INTERNET_OPTIONS, UTILITY_OPTIONS, STREAMING_OPTIONS, SUBSCRIPTION_OPTIONS, FOOD_OPTIONS, TRANSPORT_OPTIONS, CLOTHING_OPTIONS, INSURANCE_OPTIONS, OTHER_OPTIONS } from './data/texasData';
import { QuizState, STEPS, Option } from './types';
import { supabase } from './lib/supabase';
import { getCareerSuggestions, CareerSuggestion } from './services/gemini';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useCalculatorData } from './hooks/useCalculatorData';
import AdminPage from './pages/AdminPage';

const INITIAL_STATE: QuizState = {
  currentStep: 0,
  regionId: 'tarrant',
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

const COLORS = {
  headerBlue: '#3372B2',
  valueTeal: '#2D9B8E',
  selectedGreen: '#10B981',
  borderSlate: '#E2E8F0'
};

const TRANSPORT_GRID_DATA = [
  { id: 'borrow', name: 'Borrow', emoji: '🔑', options: [{ type: 'new', price: 0, label: 'Borrow a family member or friend’s vehicle' }] },
  { id: 'bike', name: 'Bike', emoji: '🚲', options: [{ type: 'new', price: 386.49 }, { type: 'used', price: 188.0 }] },
  { id: 'micro', name: 'Micro', emoji: '👚', options: [{ type: 'new', price: 35978.73 }, { type: 'used', price: 12929.75 }] },
  { id: 'sedan', name: 'Sedan', emoji: '🚗', options: [{ type: 'new', price: 25679.30 }, { type: 'used', price: 19479.86 }, { type: 'new-ev', price: 65686.43 }, { type: 'used-ev', price: 33998.0 }] },
  { id: 'luxury-sedan', name: 'Luxury Sedan', emoji: '🏎️', options: [{ type: 'new', price: 66229.0 }, { type: 'used', price: 35122.86 }] },
  { id: 'suv', name: 'SUV', emoji: '🚙', options: [{ type: 'new', price: 37971.48 }, { type: 'used', price: 22761.0 }, { type: 'new-ev', price: 55001.10 }, { type: 'used-ev', price: 38848.0 }] },
  { id: 'truck', name: 'Truck', emoji: '🛻', options: [{ type: 'new', price: 39491.73 }, { type: 'used', price: 24664.67 }, { type: 'new-ev', price: 64406.0 }, { type: 'used-ev', price: 46284.0 }] },
  { id: 'luxury-truck', name: 'Luxury Truck', emoji: '🚚', options: [{ type: 'new', price: 63524.58 }, { type: 'used', price: 47414.67 }] },
] as const;

const INTEREST_RATES = {
  new: 6.5,
  used: 11.5,
  'new-ev': 6.5,
  'used-ev': 11.5
} as const;

const USE_SUPABASE = true;

function calculateTransportMonthly(price: number, annualRate: number) {
  if (price === 0) return 0;
  const r = annualRate / 100 / 12;
  const n = 60;
  return (price * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function getTransportRateKey(category?: string) {
  if (category === 'new' || category === 'used') return category;
  if (category === 'new_ev') return 'new-ev';
  if (category === 'used_ev') return 'used-ev';
  return null;
}

function getTransportMonthlyCost(opt: any) {
  if (!opt) return 0;
  if (typeof opt.monthlyCost === 'number') return opt.monthlyCost;

  const rateKey = getTransportRateKey(opt.category);
  if (!rateKey || typeof opt.price !== 'number') return 0;

  return calculateTransportMonthly(opt.price, INTEREST_RATES[rateKey]);
}

function getTransportationOption(id: string): Option | undefined {
  const [rowId, type] = id.split(/-(?=new|used)/);
  const row = TRANSPORT_GRID_DATA.find(item => item.id === rowId);
  const match = row?.options.find(opt => opt.type === type);
  if (!row || !match) return undefined;

  const rate = INTEREST_RATES[match.type as keyof typeof INTEREST_RATES] || 0;
  const monthly = calculateTransportMonthly(match.price, rate);
  const suffix =
    match.type === 'new' ? 'New' :
    match.type === 'used' ? 'Used' :
    match.type === 'new-ev' ? 'New EV' :
    'Used EV';

  return {
    id,
    name: `${row.name} (${suffix})`,
    description: match.label || `${suffix} ${row.name}`,
    monthlyCost: monthly,
    emoji: row.emoji
  };
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const {
    regions,
    internetOptions,
    utilityOptions,
    streamingOptions,
    subscriptionOptions,
    clothingOptions,
    insuranceOptions,
    phonePlanOptions,
    phoneDeviceOptions,
    transportOptions,
    loading: calculatorDataLoading,
    error: calculatorDataError
  } = useCalculatorData();
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
    if (parsed.selections.phone === 'keep-current') {
      parsed.selections.phone = 'keep-phone';
    }
    if (parsed.selections.phone === 'new-21') {
      parsed.selections.phone = 'new-21-256';
    }
    return parsed;
  });

  // Region-based data
  const activeRegions = USE_SUPABASE && regions.length ? regions : REGIONS;
  const activeInternetOptions = USE_SUPABASE && internetOptions.length ? internetOptions : INTERNET_OPTIONS;
  const activeUtilityOptions = USE_SUPABASE && utilityOptions.length ? utilityOptions : UTILITY_OPTIONS;

  // Global data
  const activeStreamingOptions = USE_SUPABASE && streamingOptions.length ? streamingOptions : STREAMING_OPTIONS;
  const activeSubscriptionOptions = USE_SUPABASE && subscriptionOptions.length ? subscriptionOptions : SUBSCRIPTION_OPTIONS;
  const activeClothingOptions = USE_SUPABASE && clothingOptions.length ? clothingOptions : CLOTHING_OPTIONS;
  const activeInsuranceOptions = USE_SUPABASE && insuranceOptions.length ? insuranceOptions : INSURANCE_OPTIONS;
  const activePhonePlanOptions = USE_SUPABASE && phonePlanOptions.length ? phonePlanOptions : PHONE_PLAN_OPTIONS;
  const activeTransportOptions = transportOptions.length ? transportOptions : TRANSPORT_OPTIONS;
  const activePhoneDeviceOptions = USE_SUPABASE && phoneDeviceOptions.length
    ? phoneDeviceOptions
    : [
        ...PHONE_SUB_OPTIONS.refurbished.map(p => ({ ...p, category: 'refurbished' })),
        ...PHONE_SUB_OPTIONS.new.map(p => ({ ...p, category: 'new' }))
      ];

  useEffect(() => {
    localStorage.setItem('lifestyle_calculator_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (event === 'PASSWORD_RECOVERY') {
        const newPassword = prompt('What would you like your new password to be?');
        if (newPassword) {
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) alert('Error resetting password: ' + error.message);
          else alert('Password updated successfully!');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const currentRegion = useMemo(() =>
    activeRegions.find((r: any) => r.id === state.regionId) || activeRegions[0],
  [state.regionId, activeRegions]);

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
    const phonePlan = activePhonePlanOptions.find((o: any) => o.id === state.selections.phonePlan);
    if (phonePlan) total += phonePlan.monthlyCost;

    // Internet
    const internet = activeInternetOptions.find((o: any) => o.id === state.selections.internet);
    if (internet) total += internet.monthlyCost;

    // Utilities
    state.selections.utilities.forEach(id => {
      const opt = activeUtilityOptions.find((o: any) => o.id === id);
      if (opt) total += opt.monthlyCost * multiplier;
    });

    // Streaming
    state.selections.streaming.forEach(id => {
      const opt = activeStreamingOptions.find((o: any) => o.id === id);
      if (opt) total += opt.monthlyCost;
    });

    // Subscriptions
    state.selections.subscriptions.forEach(id => {
      const opt = activeSubscriptionOptions.find((o: any) => o.id === id);
      if (opt) total += opt.monthlyCost;
    });

    // Food
    const food = FOOD_OPTIONS.find(o => o.id === state.selections.food);
    if (food) total += food.monthlyCost * multiplier;

    // Transportation
    state.selections.transportation.forEach(id => {
      const opt = activeTransportOptions.find((o: any) => o.id === id) || getTransportationOption(id);
      total += getTransportMonthlyCost(opt);
    });

    // Clothing
    const clothing = activeClothingOptions.find((o: any) => o.id === state.selections.clothing);
    if (clothing) total += clothing.monthlyCost;

    // Insurance
    state.selections.insurance.forEach(id => {
      const opt = activeInsuranceOptions.find((o: any) => o.id === id);
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
  const recommendedSalary = annualTotal; // Simple 12-month total
  const firstQuestionStep = 1;
  const lastQuestionStep = STEPS.length - 2;
  const totalQuestionSteps = lastQuestionStep - firstQuestionStep + 1;
  const currentQuestionStep = Math.max(0, Math.min(state.currentStep - firstQuestionStep + 1, totalQuestionSteps));
  const progressPercent = totalQuestionSteps > 0 ? (currentQuestionStep / totalQuestionSteps) * 100 : 0;

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
          <QuizWrapper title="Where Will You Live?" description="Prices change depending on where you are in Texas!">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...activeRegions]
                .sort((a, b) => a.majorCity.localeCompare(b.majorCity))
                .map(region => (
                <button
                  key={region.id}
                  onClick={() => {
                    handleSelection('regionId' as any, region.id);
                    nextStep();
                  }}
                  className={`p-6 rounded-3xl text-left transition-all border-2 ${
                    state.regionId === region.id 
                      ? 'bg-emerald-50/40 ring-4 ring-emerald-100' 
                      : 'border-slate-100 bg-white hover:border-slate-300'
                  }`}
                  style={state.regionId === region.id ? { borderColor: COLORS.selectedGreen } : undefined}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                        <span className="text-2xl">{region.emoji}</span> {region.majorCity}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">
                        {region.name}
                      </p>
                    </div>
                    {state.regionId === region.id && <CheckCircle2 className="w-6 h-6" style={{ color: COLORS.selectedGreen }} />}
                  </div>
                </button>
              ))}
            </div>
          </QuizWrapper>
        );

      case 'Housing':
        return (
          <QuizWrapper title="Choose Your New Home" description="Where will you hang your hat?">
            <HousingSelectionStep
              options={HOUSING_OPTIONS}
              category="housing"
              state={state}
              onSelect={handleSelection}
              onNext={nextStep}
              multiplier={currentRegion.costMultiplier}
            />
          </QuizWrapper>
        );

      case 'Phone':
        return (
          <QuizWrapper title="Choose Your Phone" description="Decide whether to keep your current device, go refurbished, or buy new.">
            <PhoneSelectionStep
              state={state}
              onSelect={handleSelection}
              onNext={nextStep}
              deviceOptions={activePhoneDeviceOptions}
            />
          </QuizWrapper>
        );

      case 'Phone Plan':
        return (
          <QuizWrapper title="Choose Your Phone Plan">
            <PhonePlanSelectionStep
              options={activePhonePlanOptions}
              category="phonePlan"
              state={state}
              onSelect={handleSelection}
            />
          </QuizWrapper>
        );

      case 'Internet':
        return (
          <QuizWrapper title="Choose Your Internet Plan" description="Fast speeds for gaming and streaming.">
            <SelectionStep
              options={activeInternetOptions.filter((o: any) => o.region_id === state.regionId)}
              category="internet"
              state={state}
              onSelect={handleSelection}
              onNext={nextStep}
            />
          </QuizWrapper>
        );

      case 'Utilities':
        return (
          <QuizWrapper title="Choose Your Utilities" description="Don't forget the basics! Select all that apply.">
            <MultiSelectionStep
              options={activeUtilityOptions.filter((o: any) => o.region_id === state.regionId)}
              category="utilities"
              state={state}
              onToggle={toggleMultiSelection}
              onNext={nextStep}
              multiplier={currentRegion.costMultiplier}
            />
          </QuizWrapper>
        );

      case 'Streaming':
        return (
          <QuizWrapper title="Choose Your Streaming Plans" description="What will you watch and listen to? Compare with ads and premium options.">
            <StreamingSelectionStep
              options={activeStreamingOptions}
              category="streaming"
              state={state}
              onToggle={toggleMultiSelection}
              onNext={nextStep}
            />
          </QuizWrapper>
        );

      case 'Subscriptions':
        return (
          <QuizWrapper title="More Subscriptions" description="Extra perks for your lifestyle.">
            <MultiSelectionStep
              options={activeSubscriptionOptions}
              category="subscriptions"
              state={state}
              onToggle={toggleMultiSelection}
              onNext={nextStep}
            />
          </QuizWrapper>
        );

      case 'Food':
        return (
          <QuizWrapper title="Food & Groceries" description="How do you plan to eat?">
            <FoodSelectionStep
              options={FOOD_OPTIONS}
              category="food"
              state={state}
              onSelect={handleSelection}
              multiplier={currentRegion.costMultiplier}
            />
          </QuizWrapper>
        );

      case 'Transportation':
        return (
          <QuizWrapper title="Choose Your Transportation" description="How will you get around Texas?">
            <TransportationGridStep
              state={state}
              onSelect={handleSelection}
              options={activeTransportOptions}
            />
          </QuizWrapper>
        );

      case 'Clothing':
        return (
          <QuizWrapper title="Choose Your Clothing Package" description="What's your style budget?">
            <SelectionStep
              options={activeClothingOptions}
              category="clothing"
              state={state}
              onSelect={handleSelection}
              onNext={nextStep}
            />
          </QuizWrapper>
        );

      case 'Insurance Info':
        return (
          <QuizWrapper title="All About Insurance">
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
          </QuizWrapper>
        );

      case 'Insurance Selection':
        return (
          <QuizWrapper title="Choose Your Insurance" description="Protect your future self.">
            <MultiSelectionStep
              options={activeInsuranceOptions}
              category="insurance"
              state={state}
              onToggle={toggleMultiSelection}
              onNext={nextStep}
              multiplier={currentRegion.costMultiplier}
            />
          </QuizWrapper>
        );

      case 'Other Services':
        return (
          <QuizWrapper title="Other Services" description="The little things that add up.">
            <MultiSelectionStep
              options={OTHER_OPTIONS}
              category="other"
              state={state}
              onToggle={toggleMultiSelection}
              onNext={nextStep}
            />
          </QuizWrapper>
        );

      case 'Results':
        return <ResultsStep state={state} monthlyTotal={monthlyTotal} annualTotal={annualTotal} recommendedSalary={recommendedSalary} onReset={resetQuiz} userId={session?.user?.id} streamingOptions={activeStreamingOptions} subscriptionOptions={activeSubscriptionOptions} clothingOptions={activeClothingOptions} insuranceOptions={activeInsuranceOptions} phonePlanOptions={activePhonePlanOptions} transportOptions={activeTransportOptions} />;

      default:
        return <div>Step not found</div>;
    }
  };

  if (!session) {
    if (window.location.pathname === '/admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <PilotAuthGate />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <PilotAuthGate />
      </div>
    );
  }

  if (window.location.pathname === '/admin') {
    return <AdminPage />;
  }

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans text-slate-900 pb-52 sm:pb-32">
      <Nav
        session={session}
        stepLabel={showHistory ? 'History' : STEPS[state.currentStep]}
        currentQuestionStep={currentQuestionStep}
        totalQuestionSteps={totalQuestionSteps}
        progressPercent={progressPercent}
        showProgress={!showHistory && state.currentStep > 0 && state.currentStep < STEPS.length - 1}
        onReset={resetQuiz}
        onToggleHistory={() => setShowHistory(!showHistory)}
      />

      <main className="max-w-5xl mx-auto px-6 pt-8">
        {showHistory ? (
          <HistoryPage userId={session.user.id} />
        ) : (
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
        )}
      </main>

      <FeedbackTool stepName={showHistory ? 'History' : STEPS[state.currentStep]} userId={session.user.id} />

      {!showHistory && state.currentStep > 0 && state.currentStep < STEPS.length - 1 && (
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

function SelectionStep({ options, category, state, onSelect, multiplier = 1 }: any) {
  const selectedId = state.selections[category];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {options.map((opt: any) => {
        const isSelected = selectedId === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => onSelect(category, opt.id)}
            className={`relative flex flex-col items-center text-center p-6 transition-all border-2 rounded-3xl group ${
              isSelected 
                ? 'border-[#10B981] ring-2 ring-emerald-50 bg-emerald-50/10' 
                : 'border-slate-100 hover:border-slate-200 bg-white'
            }`}
          >
            {opt.image && (
              <div className="h-32 w-full flex items-center justify-center mb-4">
                <img
                  src={opt.image}
                  alt={opt.name}
                  className="max-h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="text-[#3372B2] font-black text-2xl mb-2">
              <span className="mr-2">{opt.emoji}</span>
              ${(opt.monthlyCost * multiplier).toLocaleString()}/mo
            </div>
            <div className="space-y-1">
              <p className="text-[#3372B2] font-bold text-lg">{opt.name}</p>
              <p className="text-[#2D9B8E] text-sm font-medium">{opt.description}</p>
            </div>
            {isSelected && (
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#10B981] border-4 border-white text-white rounded-full flex items-center justify-center shadow-md">
                <Check className="w-4 h-4 stroke-[4px]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function HousingSelectionStep({ options, category, state, onSelect, multiplier = 1 }: any) {
  const selectedId = state.selections[category];
  const [activeTooltip, setActiveTooltip] = useState<{id: string, type: 'info' | 'income'} | null>(null);

  const calculateAnnualIncome = (monthlyCost: number) => {
    return (monthlyCost * multiplier) * 3 * 12;
  };

  return (
    <div className="space-y-6 relative pb-8">
      {options.map((opt: any) => {
        const isSelected = selectedId === opt.id;
        const isBuy = opt.id.includes('buy') || opt.name.toLowerCase().includes('buy');
        const isFamily = opt.monthlyCost === 0;
        const annualIncomeNeeded = calculateAnnualIncome(opt.monthlyCost);

        return (
          <div key={opt.id} className="relative flex flex-col md:flex-row gap-6 items-start">
            <button
              onClick={() => onSelect(category, opt.id)}
              className="flex-1 flex flex-col md:flex-row overflow-hidden rounded-3xl transition-all border-4 text-left group bg-white shadow-md"
              style={{
                borderColor: isSelected ? COLORS.selectedGreen : 'white',
                boxShadow: isSelected ? '0 0 0 4px rgba(16, 185, 129, 0.12)' : undefined
              }}
            >
              <div className="w-full md:w-56 h-48 md:h-auto shrink-0 overflow-hidden bg-slate-100">
                <img
                  src={opt.image}
                  alt={opt.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-8 flex-1 flex flex-col items-center text-center justify-center space-y-2 relative">
                <h3 className="font-black text-xl uppercase tracking-wider" style={{ color: COLORS.headerBlue }}>{opt.name}</h3>
                <p className="font-medium" style={{ color: COLORS.valueTeal }}>{opt.description}</p>

                <div className="pt-2">
                  <span className="text-2xl font-black" style={{ color: COLORS.headerBlue }}>
                    ${(opt.monthlyCost * multiplier).toLocaleString(undefined, { minimumFractionDigits: 2 })}/MO
                  </span>
                </div>

                {!isFamily && (
                  <div className="pt-4 space-y-1">
                    <p className="text-sm font-medium text-slate-600 italic">
                      Minimum Total{' '}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTooltip({ id: opt.id, type: 'income' });
                        }}
                        className="underline decoration-dotted hover:text-orange-600 transition-colors cursor-help"
                      >
                        Household Income
                      </button>{' '}
                      Needed
                    </p>
                    <p className="text-xl font-bold text-slate-800">
                      ${annualIncomeNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                )}

                {!isFamily && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTooltip({ id: opt.id, type: 'info' });
                    }}
                    className="absolute bottom-4 right-4 p-2 text-slate-400 hover:text-orange-500 transition-colors"
                  >
                    <Info className="w-6 h-6" />
                  </button>
                )}

                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-8 h-8" style={{ color: COLORS.selectedGreen }} />
                  </div>
                )}
              </div>
            </button>

            <AnimatePresence>
              {activeTooltip?.id === opt.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  className={`absolute z-[100] left-full ml-4 top-0 w-72 p-6 rounded-2xl shadow-2xl text-sm font-medium leading-relaxed hidden xl:block ${
                    activeTooltip.type === 'income'
                      ? 'bg-lime-300 text-lime-900'
                      : isBuy
                      ? 'bg-orange-300 text-orange-900'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  <div className={`absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 rotate-45 ${
                    activeTooltip.type === 'income'
                      ? 'bg-lime-300'
                      : isBuy
                      ? 'bg-orange-300'
                      : 'bg-blue-500'
                  }`} />

                  <button
                    onClick={() => setActiveTooltip(null)}
                    className="absolute top-2 right-2 opacity-50 hover:opacity-100"
                  >
                    X
                  </button>

                  {activeTooltip.type === 'income' ? (
                    <div className="space-y-2">
                      <p className="font-bold text-base">What is Household Income?</p>
                      <p>Household income is the combined total gross earnings of all individuals aged 15 or older living in a housing unit, including family members and unrelated residents. It is a key financial metric used to evaluate economic stability, determine tax obligations, and qualify for loans or insurance.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-bold text-base">Something to keep in mind:</p>
                      {isBuy ? (
                        <p>When you buy a house there are a few things to keep in mind. Your annual household income and debt-to-income ratio will determine how much "house" you can afford. To keep this scenario simple, we will assume you can afford a $315,000 home for your first home purchase.</p>
                      ) : (
                        <p>When renting a property, landlords typically require your gross monthly income to be at least 3x the rent to ensure you can afford the rent plus utilities and living expenses.</p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {activeTooltip && <div className="fixed inset-0 z-40" onClick={() => setActiveTooltip(null)} />}
    </div>
  );
}

function MultiSelectionStep({ options, category, state, onToggle, multiplier = 1 }: any) {
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

  const renderOptionGrid = (opts: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {opts.map((opt: Option) => (
        <button
          key={opt.id}
          onClick={() => onToggle(category, opt.id)}
          className="p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center group bg-white"
          style={{
            borderColor: selectedIds.includes(opt.id) ? COLORS.selectedGreen : COLORS.borderSlate,
            backgroundColor: selectedIds.includes(opt.id) ? 'rgba(16, 185, 129, 0.04)' : 'white'
          }}
        >
          <span className="text-4xl mb-3">{opt.emoji}</span>
          <p className="font-bold mb-1" style={{ color: COLORS.headerBlue }}>{opt.name}</p>
          <p className="text-sm font-medium mb-3" style={{ color: COLORS.valueTeal }}>{opt.description}</p>
          <p className="font-black text-xl" style={{ color: COLORS.headerBlue }}>
            ${(opt.monthlyCost * multiplier).toLocaleString()}/mo
          </p>
          <div
            className="mt-4 w-6 h-6 rounded-full border-2 flex items-center justify-center"
            style={{
              backgroundColor: selectedIds.includes(opt.id) ? COLORS.selectedGreen : 'transparent',
              borderColor: selectedIds.includes(opt.id) ? COLORS.selectedGreen : COLORS.borderSlate
            }}
          >
            {selectedIds.includes(opt.id) && <Check className="w-4 h-4 text-white" />}
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {groupedOptions.hasCategories ? (
        <div className="space-y-6">
          {Object.entries(groupedOptions.groups).map(([catName, opts]) => (
            <div key={catName} className="space-y-3">
              <button 
                onClick={() => toggleCategory(catName)}
                className="flex items-center gap-2 w-full text-left group"
              >
                <div className={`transition-transform duration-200 ${expandedCategories[catName] ? 'rotate-0' : '-rotate-90'}`}>
                  <ChevronDown className="w-5 h-5 group-hover:text-slate-700" style={{ color: COLORS.headerBlue }} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-wider flex items-center gap-3" style={{ color: COLORS.headerBlue }}>
                  <span className="text-2xl">{CATEGORY_EMOJIS[catName] || '✨'}</span>
                  {catName}
                  <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{(opts as any[]).length}</span>
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

function StreamingSelectionStep({ options, category, state, onToggle }: any) {
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
      className="w-full rounded-2xl text-left transition-all border-2 flex items-center gap-4 p-4 group h-full bg-white"
      style={{
        borderColor: selectedIds.includes(opt.id) ? COLORS.selectedGreen : COLORS.borderSlate,
        boxShadow: selectedIds.includes(opt.id) ? '0 0 0 2px rgba(16, 185, 129, 0.08)' : undefined
      }}
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-inner">
        <img src={opt.image} alt={opt.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-bold text-sm leading-tight" style={{ color: COLORS.headerBlue }}>
            {opt.name}
          </h4>
          <div
            className="shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all"
            style={{
              backgroundColor: selectedIds.includes(opt.id) ? COLORS.selectedGreen : 'transparent',
              borderColor: selectedIds.includes(opt.id) ? COLORS.selectedGreen : COLORS.borderSlate
            }}
          >
            {selectedIds.includes(opt.id) && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-lg font-black" style={{ color: COLORS.headerBlue }}>${opt.monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/mo</span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-12">
        {/* Desktop Header */}
        <div className="grid grid-cols-2 gap-12 px-6 hidden md:grid">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-xs font-black text-slate-400 tracking-wider">With Ads / Standard</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-300" />
            <span className="text-xs font-black text-slate-400 tracking-wider">Without Ads / Premium</span>
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
  );
}

function PhoneSelectionStep({ state, onSelect, deviceOptions }: any) {
  const [decision, setDecision] = useState<'none' | 'keep' | 'refurbished' | 'new'>(() => {
    const currentId = state.selections.phone;
    if (currentId === 'keep-phone') return 'keep';
    if (currentId?.startsWith('refurb-')) return 'refurbished';
    if (currentId?.startsWith('new-')) return 'new';
    return 'none';
  });
  const refurbishedOptions = deviceOptions.filter((p: any) => p.category === 'refurbished');
  const newOptions = deviceOptions.filter((p: any) => p.category === 'new');

  useEffect(() => {
    const currentId = state.selections.phone;
    if (currentId === 'keep-phone') {
      setDecision('keep');
    } else if (currentId?.startsWith('refurb-')) {
      setDecision('refurbished');
    } else if (currentId?.startsWith('new-')) {
      setDecision('new');
    } else {
      setDecision('none');
    }
  }, [state.selections.phone]);

  const handleDecision = (type: 'keep' | 'refurbished' | 'new') => {
    setDecision(type);
    if (type === 'keep') {
      onSelect('phone', 'keep-phone');
      return;
    }

    const selectedId = state.selections.phone;
    const isSameCategorySelected =
      (type === 'refurbished' && selectedId?.startsWith('refurb-')) ||
      (type === 'new' && selectedId?.startsWith('new-'));

    if (!isSameCategorySelected) {
      onSelect('phone', '');
    }
  };

  const renderPhoneCard = (phone: (typeof PHONE_SUB_OPTIONS.refurbished)[number] | (typeof PHONE_SUB_OPTIONS.new)[number]) => {
    const monthlyCost = phone.price / phone.months;
    const isSelected = state.selections.phone === phone.id;

    return (
      <button
        key={phone.id}
        onClick={() => onSelect('phone', phone.id)}
        className={`p-6 rounded-2xl text-left transition-all border-2 flex flex-col justify-between h-full ${
          isSelected
            ? 'bg-emerald-50/40'
            : 'border-slate-100 bg-white hover:border-slate-300'
        }`}
        style={isSelected ? { borderColor: COLORS.selectedGreen, boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.08)' } : undefined}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-3xl">{phone.emoji}</span>
            {isSelected && <CheckCircle2 className="w-6 h-6" style={{ color: COLORS.selectedGreen }} />}
          </div>
          <h3 className="font-bold text-lg text-slate-900">{phone.name}</h3>
          <p className="text-sm text-slate-500">{phone.description}</p>
          <p className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">
            {phone.months}-Month Plan
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-2xl font-black text-slate-900">
            ${monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-bold text-slate-400 uppercase ml-1">/mo</span>
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-4 shadow-xl">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <Smartphone className="text-orange-500" /> The Year is 2030...
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed">
          Imagine that your current phone is an <strong>iPhone 17 Pro</strong>. It's already paid off (you owe $0),
          but there are some newer phones on the market that you've been looking at. What do you do?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleDecision('keep')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            decision === 'keep' ? 'bg-emerald-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
          style={decision === 'keep' ? { borderColor: COLORS.selectedGreen } : undefined}
        >
          <h3 className="font-bold text-lg mb-1">Keep current phone</h3>
          <p className="text-sm text-slate-500">My iPhone 17 Pro works fine. I'll save my money.</p>
          <p className="mt-4 font-black text-xl">$0/mo</p>
        </button>

        <button
          onClick={() => handleDecision('refurbished')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            decision === 'refurbished' ? 'bg-emerald-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
          style={decision === 'refurbished' ? { borderColor: COLORS.selectedGreen } : undefined}
        >
          <h3 className="font-bold text-lg mb-1">Buy refurbished</h3>
          <p className="text-sm text-slate-500">I want a newer model, but I want to save some money.</p>
        </button>

        <button
          onClick={() => handleDecision('new')}
          className={`p-6 rounded-2xl border-2 transition-all text-left ${
            decision === 'new' ? 'bg-emerald-50/40' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
          style={decision === 'new' ? { borderColor: COLORS.selectedGreen } : undefined}
        >
          <h3 className="font-bold text-lg mb-1">Buy a new phone</h3>
          <p className="text-sm text-slate-500">I want the latest tech (iPhone 21) right now!</p>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {decision === 'refurbished' && (
          <motion.div
            key="refurbished"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4"
          >
            {refurbishedOptions.map(renderPhoneCard)}
          </motion.div>
        )}

        {decision === 'new' && (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4"
          >
            {newOptions.map(renderPhoneCard)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhonePlanSelectionStep({ options, category, state, onSelect }: any) {
  const selectedId = state.selections[category];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {options.map((opt: any) => {
          const isSelected = selectedId === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => onSelect(category, opt.id)}
              className="relative flex flex-col items-center text-center p-6 transition-all border-2 rounded-3xl group bg-white"
              style={{
                borderColor: isSelected ? COLORS.selectedGreen : 'transparent',
                boxShadow: isSelected ? '0 0 0 2px rgba(16, 185, 129, 0.08)' : undefined
              }}
            >
              {opt.image && (
                <div className="h-24 w-full flex items-center justify-center mb-4">
                  <img src={opt.image} alt={opt.name} className="max-h-full max-w-[80%] object-contain" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="font-black text-3xl mb-4" style={{ color: COLORS.headerBlue }}>
                ${opt.monthlyCost}/Month
              </div>

              <div className="space-y-1 text-left w-full max-w-[280px] mx-auto text-[13px] leading-snug">
                <p style={{ color: COLORS.headerBlue }}><span className="font-bold">Plan Name:</span> <span style={{ color: COLORS.valueTeal }}>{opt.planName}</span></p>
                <p style={{ color: COLORS.headerBlue }}><span className="font-bold">High-Speed Data:</span> <span style={{ color: COLORS.valueTeal }}>{opt.data}</span></p>
                <p style={{ color: COLORS.headerBlue }}><span className="font-bold">Hotspot:</span> <span style={{ color: COLORS.valueTeal }}>{opt.hotspot}</span></p>
                <p style={{ color: COLORS.headerBlue }}><span className="font-bold">5G Access:</span> <span style={{ color: COLORS.valueTeal }}>{opt.access}</span></p>
                <p style={{ color: COLORS.headerBlue }}><span className="font-bold">Notes:</span> <span style={{ color: COLORS.valueTeal }}>{opt.notes}</span></p>
              </div>

              {isSelected && (
                <div className="absolute -top-2 -right-2 text-white rounded-full p-1 shadow-md" style={{ backgroundColor: COLORS.selectedGreen }}>
                  <Check className="w-5 h-5" />
                </div>
              )}
            </button>
          );
        })}
    </div>
  );
}

function QuizWrapper({ title, children, description }: { title: string, children: React.ReactNode, description?: string }) {
  return (
    <div className="max-w-6xl mx-auto mb-12 px-4 md:px-0">
      {description && (
        <div className="mb-6 text-center">
          <p className="text-slate-500 text-lg font-medium">{description}</p>
        </div>
      )}

      <div className="border-2 rounded-xl bg-white shadow-xl relative" style={{ borderColor: COLORS.borderSlate }}>
        <div className="text-white py-4 px-6 text-center font-bold text-xl uppercase tracking-tight rounded-t-[10px]" style={{ backgroundColor: COLORS.headerBlue }}>
          {title}
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function FoodSelectionStep({ options, category, state, onSelect, multiplier = 1 }: any) {
  const selectedId = state.selections[category];
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const renderSection = (type: 'essential' | 'premium', title: string, logos: string[]) => (
    <div className="relative border-b border-slate-100 last:border-0 py-10 first:pt-4 pl-12 md:pl-16">
      <div className="absolute left-0 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center">
        <div className="-rotate-90 whitespace-nowrap">
          <span className={`font-black text-[15px] md:text-lg uppercase tracking-[0.3em] ${
            type === 'essential' ? 'text-orange-500' : 'text-[#2D9B8E]'
          }`}>
            {title}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10 grayscale opacity-60">
          {logos.map((url, i) => (
            <img key={i} src={url} className="h-12 md:h-16 object-contain" alt="Store logo" referrerPolicy="no-referrer" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {options.filter((o: any) => o.type === type).map((opt: any) => {
            const isSelected = selectedId === opt.id;
            return (
              <div key={opt.id} className="relative">
                <button
                  onClick={() => onSelect(category, opt.id)}
                  className={`w-full flex flex-col items-center text-center p-6 transition-all border-2 rounded-3xl relative group ${
                    isSelected 
                      ? 'border-[#10B981] ring-2 ring-emerald-50 bg-emerald-50/10' 
                      : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm'
                  }`}
                >
                  <div className="text-[#3372B2] font-black text-2xl mb-1">
                    ~${((opt.weeklyPrice ?? 0) * multiplier).toLocaleString()}/Week
                  </div>
                  <div className="text-[#3372B2] font-bold text-lg mb-4 leading-tight">{opt.name}</div>
                  
                  <p className="text-slate-500 text-sm mb-6 min-h-[40px]">{opt.description}</p>
                  
                  <div 
                    onClick={(e) => { e.stopPropagation(); setActiveTooltip(opt.id); }}
                    className="p-2 text-[#3372B2] hover:text-[#2D9B8E] transition-colors flex items-center gap-2 text-sm font-bold cursor-pointer"
                  >
                    <Info className="w-5 h-5" />
                    What's included?
                  </div>

                  {isSelected && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#10B981] border-4 border-white text-white rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 stroke-[4px]" />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {activeTooltip === opt.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute z-[110] top-full mt-2 left-0 right-0 p-6 bg-white border-2 border-[#3372B2] rounded-2xl shadow-2xl"
                    >
                      <button onClick={() => setActiveTooltip(null)} className="absolute top-2 right-2 text-slate-400 p-2">✕</button>
                      <p className="text-[#3372B2] font-bold mb-3 text-sm pr-6">
                        {opt.isPlus ? "*Everything from just the essentials PLUS:" : "This package includes things such as:"}
                      </p>
                      <ul className="grid grid-cols-1 gap-1">
                        {opt.items?.map((item: string, i: number) => (
                          <li key={i} className="text-[#3372B2] text-xs flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#2D9B8E] rounded-full shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderSection('essential', 'Essential Shopping', [
        'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/1.png',
        'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/2.png',
        'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/3.png',
        'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/4.png'
      ])}
      <div className="h-px bg-slate-100 my-4" />
      {renderSection('premium', 'Premium Shopping', [
        'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/5.png',
        'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/6.png',
        'https://tclrzjhxongpnlyxdpcz.supabase.co/storage/v1/object/public/Grocery%20Stores/7.png'
      ])}
      
      {/* Background overlay to close tooltips */}
      {activeTooltip && (
        <div className="fixed inset-0 z-[105]" onClick={() => setActiveTooltip(null)} />
      )}
    </div>
  );
}

function TransportationGridStep({ state, onSelect, options }: any) {
  const selectedIds = state.selections.transportation as string[];
  const [showTooltip, setShowTooltip] = useState(false);
  const normalizeCategory = (opt: any) => {
    if (opt.category === 'new' || opt.category === 'used' || opt.category === 'new_ev' || opt.category === 'used_ev') {
      return opt.category;
    }
    if (opt.id?.includes('ev-new')) return 'new_ev';
    if (opt.id?.includes('ev-used')) return 'used_ev';
    if (opt.id?.includes('new_ev')) return 'new_ev';
    if (opt.id?.includes('used_ev')) return 'used_ev';
    if (opt.id?.endsWith('-new')) return 'new';
    if (opt.id?.endsWith('-used')) return 'used';
    return '';
  };
  const newCars = options.filter((o: any) => normalizeCategory(o) === 'new');
  const usedCars = options.filter((o: any) => normalizeCategory(o) === 'used');
  const newEVs = options.filter((o: any) => normalizeCategory(o) === 'new_ev');
  const usedEVs = options.filter((o: any) => normalizeCategory(o) === 'used_ev');
  const findOption = (rowId: string, list: any[], type: string) => {
    const idsByType: Record<string, string[]> = {
      new: [`${rowId}`, `${rowId}-new`],
      used: [`${rowId}-used`],
      'new-ev': [`${rowId}-ev-new`, `${rowId}-new-ev`, `${rowId}-new_ev`],
      'used-ev': [`${rowId}-ev-used`, `${rowId}-used-ev`, `${rowId}-used_ev`],
    };

    return list.find((opt: any) => idsByType[type]?.includes(opt.id));
  };

  const calculateMonthly = (price: number, annualRate: number) => {
    if (price === 0) return 0;
    const r = annualRate / 100 / 12;
    const n = 60;
    return (price * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const renderCell = (rowId: string, type: string, price: number, label?: string) => {
    const cellId = `${rowId}-${type}`;
    const isSelected = selectedIds.includes(cellId);
    const rate = INTEREST_RATES[type as keyof typeof INTEREST_RATES] || 0;
    const monthly = calculateMonthly(price, rate);

    return (
      <button
        key={cellId}
        onClick={() => onSelect('transportation', [cellId])}
        className={`flex-1 p-3 transition-all rounded-xl text-center group min-h-[80px] flex flex-col justify-center ${
          isSelected
            ? 'border-2 border-[#10B981] bg-white shadow-lg z-10 scale-105'
            : 'hover:bg-white/60'
        }`}
      >
        {price === 0 ? (
          <span className="text-[#3372B2] text-sm font-bold leading-snug block px-2">{label}</span>
        ) : (
          <div className="space-y-1">
            <span className="text-[#3372B2] font-black text-lg block">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[14px] text-[#2D9B8E] font-bold leading-tight">
              {rate}% Int. • ${monthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
            </div>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-8 relative">
      <div className="grid grid-cols-5 gap-4 px-6 items-center mb-4">
        <div className="text-[#3372B2] font-black text-lg uppercase tracking-tight">Total Price:</div>
        <div className="text-[#3372B2] font-black text-lg text-center uppercase tracking-tight">New</div>
        <div className="text-[#3372B2] font-black text-lg text-center uppercase tracking-tight">Used</div>
        <div className="text-[#3372B2] font-black text-lg text-center uppercase tracking-tight">New EV</div>
        <div className="text-[#3372B2] font-black text-lg text-center uppercase tracking-tight">Used EV</div>
      </div>

      <div className="space-y-2">
        {TRANSPORT_GRID_DATA.map((row, index) => (
          <div
            key={row.id}
            className={`grid grid-cols-5 gap-4 px-6 py-4 items-center rounded-3xl transition-colors border-2 border-transparent ${
              index % 2 !== 0 ? 'bg-[#D9EFE9]' : 'bg-white'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl md:text-5xl">{row.emoji}</span>
              <span className="text-[#3372B2] font-black text-sm uppercase tracking-wide">{row.name}</span>
            </div>

            {[
              { type: 'new', opt: findOption(row.id, newCars, 'new') },
              { type: 'used', opt: findOption(row.id, usedCars, 'used') },
              { type: 'new-ev', opt: findOption(row.id, newEVs, 'new-ev') },
              { type: 'used-ev', opt: findOption(row.id, usedEVs, 'used-ev') },
            ].map(({ type, opt }) => {
              const legacyOpt = row.options.find(o => o.type === type);
              const price = typeof opt?.price === 'number' ? Number(opt.price) : legacyOpt?.price;
              const label = (opt as any)?.label || (legacyOpt as any)?.label;

              return typeof price === 'number'
                ? renderCell(row.id, type, price, label)
                : <div key={type} />;
            })}
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="flex items-center gap-3 text-[#3372B2] font-black text-base hover:underline group"
        >
          <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
            <Info className="w-6 h-6" />
          </div>
          Wait, what is "Interest" and "Refinancing"?
        </button>
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[450px] p-8 bg-[#3372B2] text-white rounded-3xl shadow-2xl z-50 text-sm leading-relaxed"
          >
            <p className="font-black mb-4 text-lg uppercase border-b border-white/20 pb-2">Interest & Refinancing</p>
            <p className="mb-4">
              <span className="font-black text-orange-300">Interest</span> is the extra money you pay to a bank for letting you borrow money to buy a car. The rate depends on your "Credit Score"—the higher your score, the lower your interest!
            </p>
            <p>
              <span className="font-black text-orange-300">Refinancing</span> means that later on, if interest rates go down or your credit gets better, you can get a NEW loan to pay off the OLD one. This can lower your monthly payment and save you money!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Nav({
  session,
  stepLabel,
  currentQuestionStep,
  totalQuestionSteps,
  progressPercent,
  showProgress,
  onReset,
  onToggleHistory
}: any) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className="max-w-5xl mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-100">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-black text-xl tracking-tight">Lifestyle Calculator</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{session.user.email}</span>
          </div>
        </div>

        {showProgress && (
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step {currentQuestionStep} of {totalQuestionSteps}</span>
              <span className="font-bold text-slate-700">{stepLabel}</span>
            </div>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div className="h-full bg-orange-500" animate={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleHistory}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-orange-600 font-bold text-sm"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-orange-600 font-bold text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Quiz</span>
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

function PilotAuthGate() {
  const [view, setView] = useState<'sign_in' | 'sign_up' | 'forgot_password'>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const signInWithProvider = async (provider: 'google') => {
    setMessage(null);
    setLoadingProvider(provider);
    const resetProviderLoading = window.setTimeout(() => {
      setLoadingProvider(current => current === provider ? null : current);
    }, 5000);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      window.clearTimeout(resetProviderLoading);
      console.error('OAuth sign-in failed:', error);
      alert('Sign-in could not be started right now.');
      setLoadingProvider(null);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    window.clearTimeout(resetProviderLoading);
    setLoadingProvider(null);
  };

  const handleEmailAction = async () => {
    setSubmitting(true);
    setMessage(null);
    setLoadingProvider(null);

    try {
      if (view === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (view === 'sign_up') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        setMessage('Check your email to confirm your account.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        setMessage('Password reset email sent.');
      }
    } catch (error: any) {
      console.error('Email auth failed:', error);
      setMessage(error?.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-black mb-2">Lifestyle Calculator</h1>
        <p className="text-center text-slate-400 text-sm uppercase font-bold tracking-widest">Pilot Testing Portal</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => signInWithProvider('google')}
          disabled={!!loadingProvider || submitting}
          className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all"
        >
          {loadingProvider === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-slate-400">
          <span className="bg-white px-3">or use email</span>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm"
        />
        {view !== 'forgot_password' && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm"
          />
        )}

        {message && (
          <div className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
            {message}
          </div>
        )}

        <button
          onClick={handleEmailAction}
          disabled={!email || (view !== 'forgot_password' && !password) || submitting}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all"
        >
          {submitting
            ? 'Working...'
            : view === 'sign_in'
            ? 'Sign In'
            : view === 'sign_up'
            ? 'Create Account'
            : 'Send Reset Link'}
        </button>
      </div>

      <div className="flex justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        <button
          onClick={() => { setView('sign_in'); setMessage(null); setLoadingProvider(null); }}
          className={`rounded-full px-3 py-2 transition-all ${view === 'sign_in' ? 'bg-orange-50 text-orange-500 shadow-sm' : 'hover:bg-slate-100 hover:text-slate-700'}`}
        >
          Login
        </button>
        <button
          onClick={() => { setView('sign_up'); setMessage(null); setLoadingProvider(null); }}
          className={`rounded-full px-3 py-2 transition-all ${view === 'sign_up' ? 'bg-orange-50 text-orange-500 shadow-sm' : 'hover:bg-slate-100 hover:text-slate-700'}`}
        >
          Sign Up
        </button>
        <button
          onClick={() => { setView('forgot_password'); setMessage(null); setLoadingProvider(null); }}
          className={`rounded-full px-3 py-2 transition-all ${view === 'forgot_password' ? 'bg-orange-50 text-orange-500 shadow-sm' : 'hover:bg-slate-100 hover:text-slate-700'}`}
        >
          Forgot Password
        </button>
      </div>
    </div>
  );
}

function FeedbackTool({ stepName, userId }: { stepName: string, userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [rawScreenshot, setRawScreenshot] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const takeScreenshot = async () => {
    setIsCapturing(true);

    try {
      const canvas = await html2canvas(document.body, {
        backgroundColor: '#f8fafc',
        useCORS: true,
        scale: 2,
        foreignObjectRendering: true,
        ignoreElements: (element) => element.id === 'feedback-tool'
      });
      setRawScreenshot(canvas.toDataURL('image/png'));
      setIsDrawingMode(true);
    } catch (error) {
      console.error('Screenshot capture failed:', error);
      alert('Screenshot capture is not available on this page right now. You can still submit written feedback.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSubmit = async () => {
    let final_screenshot_url = null;

    if (screenshot) {
      try {
        console.log('Starting upload...');

        const response = await fetch(screenshot);
        const blob = await response.blob();
        const fileName = `${userId}/${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from('feedback_screenshots')
          .upload(fileName, blob, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          console.error('Storage Upload Error:', uploadError);
          alert(`Storage Error: ${uploadError.message}`);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('feedback_screenshots')
          .getPublicUrl(fileName);

        final_screenshot_url = urlData.publicUrl;
        console.log('Upload Success! URL:', final_screenshot_url);
      } catch (err) {
        console.error('System Error:', err);
        alert('Something went wrong preparing the image.');
        return;
      }
    }

    const { error: dbError } = await supabase.from('pilot_feedback').insert({
      user_id: userId,
      step_name: stepName,
      note,
      screenshot_url: final_screenshot_url
    });

    if (dbError) {
      console.error('Database Error:', dbError);
      alert(`Database Error: ${dbError.message}`);
    } else {
      alert('Feedback submitted! Thank you.');
      setNote('');
      setScreenshot(null);
      setIsOpen(false);
    }
  };

  return (
    <>
      <div id="feedback-tool" className="fixed right-6 top-1/2 -translate-y-1/2 z-[200]">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-orange-500 transition-all flex flex-col items-center gap-1"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Feedback</span>
          </button>
        ) : (
          <div className="bg-white w-80 rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Pilot Feedback</h3>
              <button onClick={() => setIsOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <p className="text-xs text-slate-400 uppercase font-bold">Page: {stepName}</p>

            <textarea
              placeholder="Write your notes here..."
              className="w-full h-32 p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {screenshot ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                <img src={screenshot} alt="Preview" className="w-full" />
                <button onClick={() => setScreenshot(null)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X className="w-3 h-3" /></button>
                <p className="text-[10px] text-center bg-slate-100 py-1">Screenshot annotated and ready to send</p>
              </div>
            ) : (
              <button
                onClick={takeScreenshot}
                disabled={isCapturing}
                className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 disabled:opacity-60"
              >
                <Camera className="w-4 h-4" /> {isCapturing ? 'Capturing...' : 'Take Screenshot'}
              </button>
            )}

            <button
              disabled={!note && !screenshot}
              onClick={handleSubmit}
              className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 disabled:opacity-50"
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDrawingMode && rawScreenshot && (
          <DrawingCanvas
            imageSrc={rawScreenshot}
            onSave={(finalImage) => {
              setScreenshot(finalImage);
              setRawScreenshot(null);
              setIsDrawingMode(false);
            }}
            onCancel={() => {
              setIsDrawingMode(false);
              setRawScreenshot(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function DrawingCanvas({ imageSrc, onSave, onCancel }: { imageSrc: string, onSave: (dataUrl: string) => void, onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ef4444');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 8;
    };
  }, [imageSrc]);

  const getCanvasPoint = (event: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasPoint(event, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasPoint(event, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/90 flex flex-col p-6 items-center justify-center">
      <div className="w-full max-w-5xl flex justify-between items-center mb-4 text-white">
        <div className="flex gap-4">
          <button onClick={() => setColor('#ef4444')} className={`w-8 h-8 rounded-full bg-red-500 border-2 ${color === '#ef4444' ? 'border-white' : 'border-transparent'}`} />
          <button onClick={() => setColor('#fbbf24')} className={`w-8 h-8 rounded-full bg-yellow-400 border-2 ${color === '#fbbf24' ? 'border-white' : 'border-transparent'}`} />
          <button onClick={() => setColor('#3b82f6')} className={`w-8 h-8 rounded-full bg-blue-500 border-2 ${color === '#3b82f6' ? 'border-white' : 'border-transparent'}`} />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-6 py-2 bg-slate-800 rounded-xl font-bold">Cancel</button>
          <button onClick={handleSave} className="px-6 py-2 bg-orange-500 rounded-xl font-bold">Done Drawing</button>
        </div>
      </div>

      <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="max-w-full max-h-[70vh] block"
        />
      </div>
      <p className="text-slate-400 mt-4 text-sm">Draw anywhere on the screenshot to highlight your feedback!</p>
    </div>
  );
}

function HistoryPage({ userId }: { userId: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('lifestyle_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (data) setResults(data);
      setLoading(false);
    };
    fetchHistory();
  }, [userId]);

  if (loading) return <div className="py-20 text-center text-slate-400">Loading your journey...</div>;

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-black">Your <span className="text-orange-500">Journey History</span></h2>
      {results.length === 0 ? (
        <p className="text-slate-500">You haven't completed a calculator journey yet!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((res) => (
            <div key={res.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{new Date(res.created_at).toLocaleDateString()}</p>
                  <h3 className="text-xl font-bold">{res.region}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-orange-500">${res.annual_salary.toLocaleString()}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual Salary</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <p className="text-sm font-bold text-slate-400 mb-2 uppercase">Key Selections:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(res.selections).slice(0, 4).map(([key, value]: [string, any]) => (
                    <span key={key} className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-500 uppercase">{key}: {Array.isArray(value) ? value.length : 'Selected'}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultsStep({ state, monthlyTotal, annualTotal, recommendedSalary, onReset, userId, streamingOptions, subscriptionOptions, clothingOptions, insuranceOptions, phonePlanOptions, transportOptions }: any) {
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
            user_id: userId,
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
    add(phonePlanOptions.find((o: any) => o.id === state.selections.phonePlan), 'Phone Plan');
    add(INTERNET_OPTIONS.find(o => o.id === state.selections.internet), 'Internet');
    
    state.selections.utilities.forEach((id: string) => add(UTILITY_OPTIONS.find(o => o.id === id), 'Utilities', m));
    state.selections.streaming.forEach((id: string) => add(streamingOptions.find((o: any) => o.id === id), 'Streaming'));
    state.selections.subscriptions.forEach((id: string) => add(subscriptionOptions.find((o: any) => o.id === id), 'Subscriptions'));
    
    add(FOOD_OPTIONS.find(o => o.id === state.selections.food), 'Food', m);
    state.selections.transportation.forEach((id: string) => {
      const opt = transportOptions.find((o: any) => o.id === id) || getTransportationOption(id);
      if (opt) {
        items.push({
          name: opt.name,
          cost: getTransportMonthlyCost(opt),
          category: 'Transportation',
          emoji: opt.emoji,
        });
      }
    });
    add(clothingOptions.find((o: any) => o.id === state.selections.clothing), 'Clothing');
    
    state.selections.insurance.forEach((id: string) => add(insuranceOptions.find((o: any) => o.id === id), 'Insurance', m));
    state.selections.other.forEach((id: string) => add(OTHER_OPTIONS.find(o => o.id === id), 'Other'));

    return items;
  }, [state.selections, currentRegion.costMultiplier, streamingOptions, subscriptionOptions, clothingOptions, insuranceOptions, phonePlanOptions, transportOptions]);

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
              This represents the total cost of your selected lifestyle over one full year (12 months).
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
