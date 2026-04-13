/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  MapPin, Home, ShieldCheck, ChevronRight, ChevronLeft, ChevronDown,
  RotateCcw, Info, CheckCircle2, Calculator,
  Save, Loader2, Check, Sparkles,
  Camera, MessageSquare, X,
  PieChart as PieChartIcon 
} from 'lucide-react';

import {
  REGIONS,
  HOUSING_OPTIONS,
  PHONE_OPTIONS,
  PHONE_SUB_OPTIONS,
  PHONE_PLAN_OPTIONS,
  INTERNET_OPTIONS,
  UTILITY_OPTIONS,
  STREAMING_OPTIONS,
  SUBSCRIPTION_OPTIONS,
  TRANSPORT_OPTIONS,
  INSURANCE_OPTIONS,
  OTHER_OPTIONS,
} from './data/texasData';
import { ALL_FUEL_OPTIONS, EV_FUEL_OPTIONS, GAS_FUEL_OPTIONS } from './data/fuelOptions';
import { QuizState, STEPS, Option } from './types';
import { FuelPlanType } from './types/options';
import {
  FUEL_PRICE_ENVIRONMENTS,
  getFuelMonthlyCost,
  getFuelPlanType,
  getFuelPriceEnvironment,
  getTransportMonthlyCost,
} from './lib/calculator';
import { supabase } from './lib/supabase';
import { CareerSuggestion } from './services/gemini';
import { useCalculatorData } from './hooks/useCalculatorData';
import AdminPage from './pages/AdminPage';
import { CLOTHING_GAME_ITEMS } from './data/clothingItems';
import { GROCERY_GAME_ITEMS, LEGACY_FOOD_PACKAGE_STARTERS } from './data/groceryItems';

import { ClothingGameStep } from './components/ClothingGameStep';
import { CareerMatchCard } from './components/careers/CareerMatchCard';
import { CareerDetailModal } from './components/careers/CareerDetailModal';
import { FuelPlanSelectionStep } from './components/FuelPlanSelectionStep';
import { GrocerySelectionStep } from './components/GrocerySelectionStep';
import { InfoButton } from './components/InfoButton';
import { InsuranceInfoStep } from './components/InsuranceInfoStep';
import { InsuranceSelectionStep } from './components/InsuranceSelectionStep';
import { InternetSelectionStep } from './components/InternetSelectionStep';
import { Nav } from './components/Nav';
import { PhonePlanSelectionStep } from './components/PhonePlanSelectionStep';
import { PhoneSelectionStep } from './components/PhoneSelectionStep';
import { QuizWrapper } from './components/QuizWrapper';
import { StreamingSelectionStep } from './components/StreamingSelectionStep';
import { SubscriptionInfoModal } from './components/SubscriptionInfoModal';
import { TransportationGridStep, getTransportationOption } from './components/TransportationGridStep';
import { UtilitiesSelectionStep } from './components/UtilitiesSelectionStep';
import { getEnhancedInsuranceOptions } from './content/insuranceInfo';
import { SUBSCRIPTION_OPTION_INFO } from './content/subscriptionInfo';
import { RiasecQuiz } from './pages/student/RiasecQuiz';
import { RiasecSetup } from './pages/student/RiasecSetup';
import { isRiasecSummary, loadRiasecSummary, saveRiasecSummary } from './lib/riasecStorage';
import { RiasecSummary } from './types/riasec';
import { rankCareerMatches } from './lib/rankCareerMatches';
import { getCareerSuggestionKey, getStableCareerSuggestions } from './lib/careerSuggestionCache';
import { getTotalMonthlyClothingCost, getTotalSelectedItemCount } from './lib/clothingBudget';
import { getTotalGroceryItemCount, getTotalMonthlyGroceryCost } from './lib/groceryBudget';

// App-owned defaults and display tokens.
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
    foodCart: {},
    transportation: [],
    fuel: '',
    fuelPriceEnvironment: 'average',
    clothingCloset: {},
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
  'Dental': '🦷',
  'Vision': '👓',
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
  borderSlate: '#E2E8F0',
  brandOrange: '#F97316',
};

const USE_SUPABASE = true;

function LocationIcon({ region }: { region: { name: string; emoji?: string; image?: string } }) {
  const [iconFailed, setIconFailed] = useState(false);

  if (region.image && !iconFailed) {
    return (
      <img
        src={region.image}
        alt={`${region.name} icon`}
        className="h-8 w-8 shrink-0 object-contain"
        onError={() => {
          console.error('Failed to load location icon:', region.name, region.image);
          setIconFailed(true);
        }}
      />
    );
  }

  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-2xl leading-none">
      {region.emoji}
    </span>
  );
}
const REQUIRED_INDEPENDENT_UTILITY_IDS = ['water', 'trash'];
const RESULTS_GROUPED_CATEGORIES = ['Streaming', 'Subscriptions', 'Utilities', 'Insurance', 'Other'];

function formatWholeDollar(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatMonthlyCurrency(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Shared badge styling still used by App-owned generic option rendering.
const USAGE_BADGE_STYLES: Record<string, string> = {
  'Light Use': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Moderate Use': 'bg-amber-50 text-amber-700 border-amber-200',
  'Heavy Use': 'bg-red-50 text-red-700 border-red-200',
  'Light Driving': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Moderate Driving': 'bg-amber-50 text-amber-700 border-amber-200',
  'Heavy Driving': 'bg-red-50 text-red-700 border-red-200',
};

const USAGE_BADGE_ICONS: Record<string, string> = {
  'Light Use': '🟢',
  'Moderate Use': '🟡',
  'Heavy Use': '🔴',
  'Light Driving': '🟢',
  'Moderate Driving': '🟡',
  'Heavy Driving': '🔴',
};

const EXTRA_CLOUD_STORAGE_OPTIONS = SUBSCRIPTION_OPTIONS.filter(option =>
  ['onedrive-100gb', 'googleone-2tb', 'box-personal-pro'].includes(option.id)
);

// Small data adapters that still bridge App-owned option sources.
function getEnhancedSubscriptionOptions(options: any[]) {
  const existingIds = new Set(options.map((option) => option.id));
  return [
    ...options,
    ...EXTRA_CLOUD_STORAGE_OPTIONS.filter(option => !existingIds.has(option.id)),
  ];
}

function getFuelOptionsForType(type: FuelPlanType): Option[] {
  if (type === 'ev') return EV_FUEL_OPTIONS;
  if (type === 'gas') return GAS_FUEL_OPTIONS;
  return [];
}

function buildLegacyFoodCart(legacyFoodId: string) {
  const starterItems = LEGACY_FOOD_PACKAGE_STARTERS[legacyFoodId];
  if (!starterItems) return {};

  return starterItems.reduce<QuizState['selections']['foodCart']>((cart, starter) => {
    const item = GROCERY_GAME_ITEMS.find((candidate) => candidate.id === starter.id);
    if (!item) return cart;

    cart[item.id] = {
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.itemPrice,
      quantity: starter.quantity,
      description: item.description,
      image: item.imageUrl,
      productType: item.productType,
      quality: item.quality,
      quantityLabel: item.quantity,
      shopperTags: item.shopperTags,
      isBudget: item.isBudget,
      isPremium: item.isPremium,
      isAllergyFriendly: item.isAllergyFriendly,
    };
    return cart;
  }, {});
}

function getHistoryRiasecSummary(): RiasecSummary | null {
  const historyState = window.history.state as { riasecResult?: unknown } | null;
  return isRiasecSummary(historyState?.riasecResult) ? historyState.riasecResult : null;
}

export default function App() {
  // State
  const [session, setSession] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [routePath, setRoutePath] = useState(() => window.location.pathname);
  const [riasecSummary, setRiasecSummary] = useState<RiasecSummary | null>(() =>
    getHistoryRiasecSummary() || loadRiasecSummary()
  );
  const [hasCompletedRiasecSetup, setHasCompletedRiasecSetup] = useState(() =>
    !!getHistoryRiasecSummary() || !!loadRiasecSummary()
  );
  const {
    regions,
    internetOptions,
    utilityOptions,
    streamingOptions,
    subscriptionOptions,
    clothingItems,
    insuranceOptions,
    phonePlanOptions,
    phoneDeviceOptions,
    transportOptions,
    loading: calculatorDataLoading
  } = useCalculatorData();
  const [state, setState] = useState<QuizState>(() => {
    const saved = localStorage.getItem('lifestyle_calculator_state');
    if (!saved) return INITIAL_STATE;

    try {
      const parsed = JSON.parse(saved);
      const migrated = {
        ...INITIAL_STATE,
        ...parsed,
        selections: {
          ...INITIAL_STATE.selections,
          ...(parsed.selections || {}),
        },
      };

      // Migration: ensure transportation is an array
      if (typeof migrated.selections.transportation === 'string') {
        migrated.selections.transportation = migrated.selections.transportation
          ? [migrated.selections.transportation]
          : [];
      }
      if (migrated.selections.phone === 'keep-current') {
        migrated.selections.phone = 'keep-phone';
      }
      if (migrated.selections.phone === 'new-21') {
        migrated.selections.phone = 'new-21-256';
      }
      if (typeof migrated.selections.fuel !== 'string') {
        migrated.selections.fuel = '';
      }
      migrated.selections.fuelPriceEnvironment = getFuelPriceEnvironment(migrated.selections.fuelPriceEnvironment);
      if (Array.isArray(migrated.selections.insurance)) {
        migrated.selections.insurance = migrated.selections.insurance.map((id: string) => {
          if (id === 'dental-standard') return 'dental-low';
          if (id === 'vision-standard') return 'vision-low';
          return id;
        });
      }
      if (
        !migrated.selections.clothingCloset ||
        Array.isArray(migrated.selections.clothingCloset) ||
        typeof migrated.selections.clothingCloset !== 'object'
      ) {
        migrated.selections.clothingCloset = {};
      }
      if (
        !migrated.selections.foodCart ||
        Array.isArray(migrated.selections.foodCart) ||
        typeof migrated.selections.foodCart !== 'object'
      ) {
        migrated.selections.foodCart = {};
      }
      if (
        Object.keys(migrated.selections.foodCart).length === 0 &&
        typeof migrated.selections.food === 'string' &&
        migrated.selections.food
      ) {
        migrated.selections.foodCart = buildLegacyFoodCart(migrated.selections.food);
      }
      if ('clothing' in migrated.selections) {
        delete migrated.selections.clothing;
      }

      return migrated;
    } catch {
      return INITIAL_STATE;
    }
  });

  // Derived option data
  const activeRegions = useMemo(() => {
    const regionSource = USE_SUPABASE && regions.length ? regions : REGIONS;

    return regionSource.map((region: any) => {
      const fallbackRegion = REGIONS.find((entry) => entry.id === region.id);

      return {
        ...region,
        emoji: region.emoji ?? fallbackRegion?.emoji,
        image: region.image ?? fallbackRegion?.image,
      };
    });
  }, [regions]);
  const activeInternetOptions = USE_SUPABASE && internetOptions.length ? internetOptions : INTERNET_OPTIONS;
  const activeUtilityOptions = USE_SUPABASE && utilityOptions.length ? utilityOptions : UTILITY_OPTIONS;
  const activeStreamingOptions = USE_SUPABASE && streamingOptions.length ? streamingOptions : STREAMING_OPTIONS;
  const activeSubscriptionOptions = getEnhancedSubscriptionOptions(USE_SUPABASE && subscriptionOptions.length ? subscriptionOptions : SUBSCRIPTION_OPTIONS);
  const activeClothingGameItems = USE_SUPABASE && clothingItems.length ? clothingItems : CLOTHING_GAME_ITEMS;
  const activeInsuranceOptions = getEnhancedInsuranceOptions(USE_SUPABASE && insuranceOptions.length ? insuranceOptions : INSURANCE_OPTIONS);
  const activePhonePlanOptions = USE_SUPABASE && phonePlanOptions.length ? phonePlanOptions : PHONE_PLAN_OPTIONS;
  const activeTransportOptions = transportOptions.length ? transportOptions : TRANSPORT_OPTIONS;
  const activePhoneDeviceOptions = USE_SUPABASE && phoneDeviceOptions.length
    ? phoneDeviceOptions
    : [
        ...PHONE_SUB_OPTIONS.refurbished.map(p => ({ ...p, category: 'refurbished' })),
        ...PHONE_SUB_OPTIONS.new.map(p => ({ ...p, category: 'new' }))
      ];
  const activePhoneOptions = USE_SUPABASE && phoneDeviceOptions.length
    ? [
        PHONE_OPTIONS[0],
        ...phoneDeviceOptions.map((p: any) => ({
          ...p,
          monthlyCost: Number(p.price) / Number(p.months),
        }))
      ]
    : PHONE_OPTIONS;

  // Persistence and session effects
  useEffect(() => {
    localStorage.setItem('lifestyle_calculator_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const handleRouteChange = () => {
      setRoutePath(window.location.pathname);
      const routeSummary = getHistoryRiasecSummary();
      if (routeSummary) {
        setRiasecSummary(routeSummary);
        setHasCompletedRiasecSetup(true);
      } else {
        const storedSummary = loadRiasecSummary();
        setRiasecSummary(storedSummary);
        if (storedSummary) setHasCompletedRiasecSetup(true);
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

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

  // Selection normalization effects
  useEffect(() => {
    const shouldRequireBaseUtilities = !!state.selections.housing && state.selections.housing !== 'family';
    const availableRequiredUtilityIds = REQUIRED_INDEPENDENT_UTILITY_IDS.filter(id =>
      activeUtilityOptions.some((opt: any) => opt.id === id)
    );

    setState(prev => {
      const currentUtilities = prev.selections.utilities;
      const nextUtilities = shouldRequireBaseUtilities
        ? Array.from(new Set([...currentUtilities, ...availableRequiredUtilityIds]))
        : currentUtilities.filter(id => !REQUIRED_INDEPENDENT_UTILITY_IDS.includes(id));

      if (
        nextUtilities.length === currentUtilities.length &&
        nextUtilities.every((id, index) => id === currentUtilities[index])
      ) {
        return prev;
      }

      return {
        ...prev,
        selections: {
          ...prev.selections,
          utilities: nextUtilities,
        },
      };
    });
  }, [state.selections.housing, activeUtilityOptions]);

  useEffect(() => {
    const nextFuelPlanType = getFuelPlanType(state.selections.transportation);
    const validFuelOptions = getFuelOptionsForType(nextFuelPlanType);

    setState(prev => {
      const currentFuel = prev.selections.fuel;
      const shouldClearFuel = nextFuelPlanType === 'none' || !validFuelOptions.some(option => option.id === currentFuel);

      if (!currentFuel || !shouldClearFuel) return prev;

      return {
        ...prev,
        selections: {
          ...prev.selections,
          fuel: '',
        },
      };
    });
  }, [state.selections.transportation]);

  // Totals and step-derived state
  const calculateMonthlyTotal = () => {
    let total = 0;
    const multiplier = currentRegion.costMultiplier;

    // Housing
    const housing = HOUSING_OPTIONS.find(o => o.id === state.selections.housing);
    if (housing) total += housing.monthlyCost * multiplier;

    // Phone
    const phone = activePhoneOptions.find((o: any) => o.id === state.selections.phone);
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
    total += getTotalMonthlyGroceryCost(state.selections.foodCart) * multiplier;

    // Transportation
    state.selections.transportation.forEach(id => {
      const opt = activeTransportOptions.find((o: any) => o.id === id) || getTransportationOption(id);
      total += getTransportMonthlyCost(opt);
    });

    // Fuel
    const fuel = ALL_FUEL_OPTIONS.find(o => o.id === state.selections.fuel);
    total += getFuelMonthlyCost(fuel, state.selections.fuelPriceEnvironment);

    // Clothing
    total += getTotalMonthlyClothingCost(state.selections.clothingCloset);

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
  const fuelPlanType = getFuelPlanType(state.selections.transportation);
  const availableFuelOptions = getFuelOptionsForType(fuelPlanType);
  const fuelPlanRequired = STEPS[state.currentStep] === 'Fuel' && fuelPlanType !== 'none';
  const canAdvanceCurrentStep = !fuelPlanRequired || availableFuelOptions.some(option => option.id === state.selections.fuel);
  const firstQuestionStep = 1;
  const lastQuestionStep = STEPS.length - 2;
  const totalQuestionSteps = lastQuestionStep - firstQuestionStep + 1;
  const currentQuestionStep = Math.max(0, Math.min(state.currentStep - firstQuestionStep + 1, totalQuestionSteps));
  const progressPercent = totalQuestionSteps > 0 ? (currentQuestionStep / totalQuestionSteps) * 100 : 0;

  // Navigation and selection handlers
  const nextStep = () => {
    if (!canAdvanceCurrentStep) return;

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

  const handleClothingClosetChange = (clothingCloset: QuizState['selections']['clothingCloset']) => {
    setState(prev => ({
      ...prev,
      selections: {
        ...prev.selections,
        clothingCloset,
      },
    }));
  };

  const handleFoodCartChange = (foodCart: QuizState['selections']['foodCart']) => {
    setState(prev => ({
      ...prev,
      selections: {
        ...prev.selections,
        foodCart,
        food: '',
      },
    }));
  };

  const openRiasecQuiz = () => {
    window.history.pushState({}, '', '/riasec');
    setRoutePath('/riasec');
    window.scrollTo(0, 0);
  };

  const handleRiasecHandoff = (summary: RiasecSummary) => {
    saveRiasecSummary(summary);
    setRiasecSummary(summary);
    setHasCompletedRiasecSetup(true);
    window.history.pushState({ riasecResult: summary }, '', '/');
    setRoutePath('/');
    window.scrollTo(0, 0);
  };

  const handleRiasecSkip = () => {
    setHasCompletedRiasecSetup(true);
    window.history.replaceState(window.history.state || {}, '', '/');
    setRoutePath('/');
    window.scrollTo(0, 0);
  };

  // Step rendering
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
            <button
              onClick={openRiasecQuiz}
              className="px-8 py-4 bg-white text-slate-700 rounded-2xl text-base font-black hover:bg-slate-100 transition-all shadow-sm border border-slate-100 active:scale-95"
            >
              Take the RIASEC Career Quiz
            </button>
            {riasecSummary && (
              <div className="max-w-2xl rounded-3xl border border-blue-100 bg-blue-50/80 p-5 text-left shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-[#3372B2]">Career interest summary loaded</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                  Your current RIASEC match is <span className="font-black text-slate-900">{riasecSummary.topThree}</span>. Only this short same-session summary is available to the calculator, not your individual quiz answers.
                </p>
              </div>
            )}
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
          <QuizWrapper colors={COLORS} title="Where Will You Live?" description="Prices change depending on where you are in Texas!">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...activeRegions]
                .sort((a, b) => a.majorCity.localeCompare(b.majorCity))
                .map(region => (
                <button
                  key={region.id}
                  onClick={() => {
                    handleSelection('regionId', region.id);
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
                        <LocationIcon region={region} />
                        <span>{region.majorCity}</span>
                      </h3>
                      <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">
                        {region.name}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {state.regionId === region.id && <CheckCircle2 className="w-6 h-6" style={{ color: COLORS.selectedGreen }} />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </QuizWrapper>
        );

      case 'Housing':
        return (
          <QuizWrapper colors={COLORS} title="Choose Your New Home" description="Where will you hang your hat?">
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
          <QuizWrapper colors={COLORS} title="Choose Your Phone" description="Decide whether to keep your current device, go refurbished, or buy new.">
            <PhoneSelectionStep
              state={state}
              onSelect={handleSelection}
              deviceOptions={activePhoneDeviceOptions}
              colors={COLORS}
            />
          </QuizWrapper>
        );

      case 'Phone Plan':
        return (
          <QuizWrapper colors={COLORS} title="Choose Your Phone Plan">
            <PhonePlanSelectionStep
              options={activePhonePlanOptions}
              category="phonePlan"
              state={state}
              onSelect={handleSelection}
              colors={COLORS}
            />
          </QuizWrapper>
        );

      case 'Internet':
        return (
          <QuizWrapper colors={COLORS} title="Choose Your Internet Plan" description="Fast speeds for gaming and streaming.">
            <InternetSelectionStep
              options={activeInternetOptions.filter((o: any) => !o.region_id || o.region_id === state.regionId)}
              category="internet"
              state={state}
              onSelect={handleSelection}
              usageBadgeStyles={USAGE_BADGE_STYLES}
              usageBadgeIcons={USAGE_BADGE_ICONS}
            />
          </QuizWrapper>
        );

      case 'Utilities':
        return (
          <QuizWrapper colors={COLORS} title="Choose Your Utilities" description="Don't forget the basics! Select all that apply.">
            <UtilitiesSelectionStep
              options={activeUtilityOptions.filter((o: any) => !o.region_id || o.region_id === state.regionId)}
              category="utilities"
              state={state}
              onToggle={toggleMultiSelection}
              multiplier={currentRegion.costMultiplier}
              requiredUtilityIds={state.selections.housing && state.selections.housing !== 'family' ? REQUIRED_INDEPENDENT_UTILITY_IDS : []}
              essentialUtilityIds={REQUIRED_INDEPENDENT_UTILITY_IDS}
              colors={COLORS}
            />
          </QuizWrapper>
        );

      case 'Streaming':
        return (
          <QuizWrapper colors={COLORS} title="Choose Your Streaming Plans" description="What will you watch and listen to? Compare with ads and premium options.">
            <StreamingSelectionStep
              options={activeStreamingOptions}
              category="streaming"
              state={state}
              onToggle={toggleMultiSelection}
              colors={COLORS}
            />
          </QuizWrapper>
        );

      case 'Subscriptions':
        return (
          <QuizWrapper colors={COLORS} title="More Subscriptions" description="Extra perks for your lifestyle.">
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
          <QuizWrapper colors={COLORS} title="Food & Groceries" description="How do you plan to eat?">
            <GrocerySelectionStep
              groceryItems={GROCERY_GAME_ITEMS}
              groceryCart={state.selections.foodCart}
              onCartChange={handleFoodCartChange}
              multiplier={currentRegion.costMultiplier}
            />
          </QuizWrapper>
        );

      case 'Transportation':
        return (
          <QuizWrapper colors={COLORS} title="Choose Your Transportation" description="How will you get around Texas?">
            <TransportationGridStep
              state={state}
              onSelect={handleSelection}
              options={activeTransportOptions}
            />
          </QuizWrapper>
        );

      case 'Fuel':
        return (
          <QuizWrapper colors={COLORS} title="Choose Your Fuel Plan" description="Fuel is a recurring monthly cost for most vehicles.">
            <FuelPlanSelectionStep
              state={state}
              onSelect={handleSelection}
              fuelPlanType={fuelPlanType}
              options={availableFuelOptions}
              fuelPriceEnvironment={state.selections.fuelPriceEnvironment}
              fuelPriceEnvironments={FUEL_PRICE_ENVIRONMENTS}
              getFuelPriceEnvironment={getFuelPriceEnvironment}
              getFuelMonthlyCost={getFuelMonthlyCost}
              usageBadgeStyles={USAGE_BADGE_STYLES}
              usageBadgeIcons={USAGE_BADGE_ICONS}
              headerBlue={COLORS.headerBlue}
            />
          </QuizWrapper>
        );

      case 'Clothing':
        return (
          <QuizWrapper
            colors={COLORS}
            title="Build Your Closet"
            description="Choose the clothes and accessories you actually use, then see what your wardrobe might cost over time."
          >
            <ClothingGameStep
              clothingItems={activeClothingGameItems}
              clothingCloset={state.selections.clothingCloset}
              onClosetChange={handleClothingClosetChange}
            />
          </QuizWrapper>
        );

      case 'Insurance Info':
        return (
          <QuizWrapper colors={COLORS} title="All About Insurance">
            <InsuranceInfoStep onNext={nextStep} />
          </QuizWrapper>
        );

      case 'Insurance Selection':
        return (
          <QuizWrapper colors={COLORS} title="Choose Your Insurance" description="Protect your future self.">
            <InsuranceSelectionStep
              options={activeInsuranceOptions}
              category="insurance"
              state={state}
              onToggle={toggleMultiSelection}
              multiplier={currentRegion.costMultiplier}
              colors={COLORS}
              categoryEmojis={CATEGORY_EMOJIS}
            />
          </QuizWrapper>
        );

      case 'Other Services':
        return (
          <QuizWrapper colors={COLORS} title="Other Services" description="The little things that add up.">
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
        return <ResultsStep state={state} monthlyTotal={monthlyTotal} annualTotal={annualTotal} recommendedSalary={recommendedSalary} onReset={resetQuiz} userId={session?.user?.id} regionOptions={activeRegions} internetOptions={activeInternetOptions} utilityOptions={activeUtilityOptions} streamingOptions={activeStreamingOptions} subscriptionOptions={activeSubscriptionOptions} insuranceOptions={activeInsuranceOptions} phoneOptions={activePhoneOptions} phonePlanOptions={activePhonePlanOptions} transportOptions={activeTransportOptions} riasecSummary={riasecSummary} isCalculatorDataLoading={calculatorDataLoading} />;

      default:
        return <div>Step not found</div>;
    }
  };

  if (routePath === '/riasec') {
    return <RiasecQuiz onTryLifestyle={handleRiasecHandoff} />;
  }

  if (!session) {
    if (routePath === '/admin') {
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

  if (routePath === '/admin') {
    return <AdminPage />;
  }

  if (!hasCompletedRiasecSetup) {
    return (
      <RiasecSetup
        onTakeQuiz={openRiasecQuiz}
        onSubmitKnownCode={handleRiasecHandoff}
        onSkip={handleRiasecSkip}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 font-sans text-slate-900 pb-52 sm:pb-32">
      <Nav
        sessionEmail={session.user.email}
        stepLabel={showHistory ? 'History' : STEPS[state.currentStep]}
        currentQuestionStep={currentQuestionStep}
        totalQuestionSteps={totalQuestionSteps}
        progressPercent={progressPercent}
        showProgress={!showHistory && state.currentStep > 0 && state.currentStep < STEPS.length - 1}
        onReset={resetQuiz}
        onToggleHistory={() => setShowHistory(!showHistory)}
        onSignOut={() => supabase.auth.signOut()}
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
                disabled={!canAdvanceCurrentStep}
                className="flex-1 sm:flex-none px-10 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
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

// Remaining local selection helpers.
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
        const tooltip = activeTooltip?.id === opt.id ? activeTooltip : null;

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
              {tooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  className={`absolute z-[100] left-full ml-4 top-0 w-72 p-6 rounded-2xl shadow-2xl text-sm font-medium leading-relaxed hidden xl:block ${
                    tooltip.type === 'income'
                      ? 'bg-lime-300 text-lime-900'
                      : isBuy
                      ? 'bg-orange-300 text-orange-900'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  <div className={`absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 rotate-45 ${
                    tooltip.type === 'income'
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

                  {tooltip.type === 'income' ? (
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

function MultiSelectionStep({ options, category, state, onToggle, multiplier = 1, lockedIds = [], lockedNote }: any) {
  const selectedIds = state.selections[category] as string[];
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [activeInfoOption, setActiveInfoOption] = useState<Option | null>(null);

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
      {opts.map((opt: Option) => {
        const isSelected = selectedIds.includes(opt.id);
        const isLocked = lockedIds.includes(opt.id);
        const info = SUBSCRIPTION_OPTION_INFO[opt.id];

        return (
          <div
            key={opt.id}
            role="button"
            tabIndex={isLocked ? -1 : 0}
            onClick={() => {
              if (!isLocked) onToggle(category, opt.id);
            }}
            onKeyDown={(event) => {
              if (!isLocked && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                onToggle(category, opt.id);
              }
            }}
            aria-disabled={isLocked}
            className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center group bg-white ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
            style={{
              borderColor: isSelected ? COLORS.selectedGreen : COLORS.borderSlate,
              backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.04)' : 'white'
            }}
          >
            {info && (
              <InfoButton
                label={`Learn more about ${opt.name}`}
                onClick={() => setActiveInfoOption(opt)}
              />
            )}
            {isLocked && (
              <span className="mb-3 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 border border-emerald-100">
                Usually Needed
              </span>
            )}
            <span className="text-4xl mb-3">{opt.emoji}</span>
            <p className="font-bold mb-1" style={{ color: COLORS.headerBlue }}>{opt.name}</p>
            <p className="text-sm font-medium mb-3" style={{ color: COLORS.valueTeal }}>{opt.description}</p>
            {isLocked && lockedNote && (
              <p className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium leading-relaxed text-slate-500">
                {lockedNote}
              </p>
            )}
            <p className="font-black text-xl" style={{ color: COLORS.headerBlue }}>
              ${(opt.monthlyCost * multiplier).toLocaleString()}/mo
            </p>
            <div
              className="mt-4 w-6 h-6 rounded-full border-2 flex items-center justify-center"
              style={{
                backgroundColor: isSelected ? COLORS.selectedGreen : 'transparent',
                borderColor: isSelected ? COLORS.selectedGreen : COLORS.borderSlate
              }}
            >
              {isSelected && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>
        );
      })}
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
      <SubscriptionInfoModal
        option={activeInfoOption}
        onClose={() => setActiveInfoOption(null)}
      />
    </div>
  );
}

// Auth, feedback, and history.
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

// Results.
function ResultsStep({ state, monthlyTotal, annualTotal, recommendedSalary, onReset, userId, regionOptions, internetOptions, utilityOptions, streamingOptions, subscriptionOptions, insuranceOptions, phoneOptions, phonePlanOptions, transportOptions, riasecSummary, isCalculatorDataLoading }: any) {
  const currentRegion = regionOptions.find((r: any) => r.id === state.regionId) || regionOptions[0] || REGIONS[5];
  const finalizedRecommendedSalary = Math.round(recommendedSalary);
  const displayedRecommendedSalary = formatWholeDollar(finalizedRecommendedSalary);
  const matcherRiasecCode = riasecSummary?.topThree || null;
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [careers, setCareers] = useState<CareerSuggestion[]>([]);
  const [isLoadingCareers, setIsLoadingCareers] = useState(true);
  const [openCareerKey, setOpenCareerKey] = useState<string | null>(null);
  const [expandedBreakdownCategories, setExpandedBreakdownCategories] = useState<string[]>([]);
  const latestCareerFetchKey = useRef('');
  const careerFetchKey = useMemo(
    () => getCareerSuggestionKey(finalizedRecommendedSalary, currentRegion.name, matcherRiasecCode),
    [finalizedRecommendedSalary, currentRegion.name, matcherRiasecCode]
  );

  useEffect(() => {
    if (isCalculatorDataLoading) return;

    let isActive = true;
    latestCareerFetchKey.current = careerFetchKey;
    setOpenCareerKey(null);
    setIsLoadingCareers(true);

    const fetchCareers = async (fetchKey: string) => {
      try {
        const suggestions = await getStableCareerSuggestions(fetchKey, finalizedRecommendedSalary, currentRegion.name);
        if (!isActive || latestCareerFetchKey.current !== fetchKey) return;
        setCareers(suggestions);
      } catch (err) {
        if (!isActive || latestCareerFetchKey.current !== fetchKey) return;
        console.error('Failed to fetch careers:', err);
        setCareers([]);
      } finally {
        if (!isActive || latestCareerFetchKey.current !== fetchKey) return;
        setIsLoadingCareers(false);
      }
    };

    fetchCareers(careerFetchKey);

    return () => {
      isActive = false;
    };
  }, [careerFetchKey, finalizedRecommendedSalary, currentRegion.name, isCalculatorDataLoading]);

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
    add(phoneOptions.find((o: any) => o.id === state.selections.phone), 'Phone');
    add(phonePlanOptions.find((o: any) => o.id === state.selections.phonePlan), 'Phone Plan');
    add(internetOptions.find((o: any) => o.id === state.selections.internet), 'Internet');
    
    state.selections.utilities.forEach((id: string) => add(utilityOptions.find((o: any) => o.id === id), 'Utilities', m));
    state.selections.streaming.forEach((id: string) => add(streamingOptions.find((o: any) => o.id === id), 'Streaming'));
    state.selections.subscriptions.forEach((id: string) => add(subscriptionOptions.find((o: any) => o.id === id), 'Subscriptions'));
    
    const groceryItemCount = getTotalGroceryItemCount(state.selections.foodCart);
    const groceryMonthlyCost = getTotalMonthlyGroceryCost(state.selections.foodCart) * m;
    if (groceryItemCount > 0 && groceryMonthlyCost > 0) {
      items.push({
        name: `Grocery Cart (${groceryItemCount})`,
        cost: groceryMonthlyCost,
        category: 'Food',
        emoji: '🛒',
      });
    }
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
    const fuel = ALL_FUEL_OPTIONS.find(o => o.id === state.selections.fuel);
    if (fuel) {
      items.push({
        name: fuel.name,
        cost: getFuelMonthlyCost(fuel, state.selections.fuelPriceEnvironment),
        category: 'Fuel',
        emoji: fuel.emoji,
      });
    }
    const clothingItemCount = getTotalSelectedItemCount(state.selections.clothingCloset);
    const clothingMonthlyCost = getTotalMonthlyClothingCost(state.selections.clothingCloset);
    if (clothingItemCount > 0 && clothingMonthlyCost > 0) {
      items.push({
        name: `Closet Items (${clothingItemCount})`,
        cost: clothingMonthlyCost,
        category: 'Clothing',
        emoji: '👕',
      });
    }
    
    state.selections.insurance.forEach((id: string) => add(insuranceOptions.find((o: any) => o.id === id), 'Insurance', m));
    state.selections.other.forEach((id: string) => add(OTHER_OPTIONS.find(o => o.id === id), 'Other'));

    return items;
  }, [state.selections, currentRegion.costMultiplier, internetOptions, utilityOptions, streamingOptions, subscriptionOptions, insuranceOptions, phoneOptions, phonePlanOptions, transportOptions]);

  const categoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    details.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + item.cost;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [details]);

  const breakdownRows = useMemo(() => {
    const groupedCategories = new Set(RESULTS_GROUPED_CATEGORIES);
    const rows: Array<
      | { type: 'item'; item: { name: string; cost: number; category: string; emoji?: string } }
      | { type: 'group'; category: string; emoji?: string; count: number; subtotal: number; items: { name: string; cost: number; category: string; emoji?: string }[] }
    > = [];
    const groupedItems = new Map<string, { name: string; cost: number; category: string; emoji?: string }[]>();

    details.forEach((item) => {
      if (groupedCategories.has(item.category)) {
        groupedItems.set(item.category, [...(groupedItems.get(item.category) || []), item]);
      } else {
        rows.push({ type: 'item', item });
      }
    });

    groupedItems.forEach((items, category) => {
      if (items.length === 1) {
        rows.push({ type: 'item', item: items[0] });
        return;
      }

      rows.push({
        type: 'group',
        category,
        emoji: items[0]?.emoji,
        count: items.length,
        subtotal: items.reduce((sum, item) => sum + item.cost, 0),
        items,
      });
    });

    return rows;
  }, [details]);

  const rankedCareerMatches = useMemo(
    () => rankCareerMatches(careers, riasecSummary, monthlyTotal),
    [careers, riasecSummary, monthlyTotal]
  );
  const openCareer = useMemo(
    () => rankedCareerMatches.find((career, index) => `${career.title}-${index}` === openCareerKey) || null,
    [rankedCareerMatches, openCareerKey]
  );
  const toggleBreakdownCategory = (category: string) => {
    setExpandedBreakdownCategories(prev =>
      prev.includes(category)
        ? prev.filter(item => item !== category)
        : [...prev, category]
    );
  };

  const budgetChartColors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  if (isCalculatorDataLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest">Finalizing your calculator results...</p>
      </div>
    );
  }

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
        <p className="text-xl text-slate-500 max-w-2xl mx-auto">Based on your choices in <span className="text-slate-900 font-bold">{currentRegion.name}</span>, here is what you'll need to earn.</p>
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
              {breakdownRows.map((row, i) => {
                if (row.type === 'item') {
                  const { item } = row;
                  return (
                    <div key={`${item.category}-${item.name}-${i}`} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg">{item.emoji}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                          <span className="font-bold text-slate-700">{item.name}</span>
                        </div>
                      </div>
                      <span className="font-black text-slate-900">${formatMonthlyCurrency(item.cost)}</span>
                    </div>
                  );
                }

                const isExpanded = expandedBreakdownCategories.includes(row.category);

                return (
                  <div key={`${row.category}-${i}`} className="rounded-2xl border border-slate-100 bg-slate-50/70">
                    <button
                      onClick={() => toggleBreakdownCategory(row.category)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left transition-all hover:bg-slate-100/70"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl w-8 h-8 flex items-center justify-center bg-white rounded-lg">{row.emoji}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{row.category}</span>
                          <span className="font-bold text-slate-700">{row.count} selected</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-slate-900">${formatMonthlyCurrency(row.subtotal)}</span>
                        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2 border-t border-slate-100 px-4 py-3">
                            {row.items.map((item) => (
                              <div key={`${row.category}-${item.name}`} className="flex items-center justify-between gap-4 rounded-xl bg-white px-3 py-2">
                                <span className="text-sm font-bold text-slate-600">{item.name}</span>
                                <span className="text-sm font-black text-slate-900">${formatMonthlyCurrency(item.cost)}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
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
                      <Cell key={`cell-${index}`} fill={budgetChartColors[index % budgetChartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [
                      `$${typeof value === 'number' ? value.toLocaleString() : value ?? ''}`,
                      'Monthly Cost'
                    ]}
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
              <h4 className="text-5xl font-black">${displayedRecommendedSalary}</h4>
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
              {riasecSummary ? (
                <>
                  Based on your <span className="font-bold text-slate-900">{riasecSummary.topThree}</span> RIASEC pattern and target salary of <span className="font-bold text-slate-900">${displayedRecommendedSalary}</span>, here are careers to explore in <span className="font-bold text-slate-900">{currentRegion.name}</span>:
                </>
              ) : (
                <>
                  Based on your target salary of <span className="font-bold text-slate-900">${displayedRecommendedSalary}</span>, here are some high-demand careers in <span className="font-bold text-slate-900">{currentRegion.name}</span>:
                </>
              )}
            </p>

            <div className="space-y-4">
              {isLoadingCareers ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest">Finding your matches...</p>
                </div>
              ) : rankedCareerMatches.length > 0 ? (
                rankedCareerMatches.map((career, i) => {
                  const careerKey = `${career.title}-${i}`;
                  return (
                    <CareerMatchCard
                      key={careerKey}
                      career={career}
                      index={i}
                      showRiasecTags={!!riasecSummary}
                      onViewDetails={() => setOpenCareerKey(careerKey)}
                    />
                  );
                })
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
      <CareerDetailModal career={openCareer} onClose={() => setOpenCareerKey(null)} />
    </div>
  );
}


