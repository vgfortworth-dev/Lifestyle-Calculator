import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const OPTIONAL_CLOTHING_TABLE = import.meta.env.VITE_SUPABASE_CLOTHING_TABLE;

const REGION_EMOJI_BY_KEY = {
  alamo: '\u{1F3DB}\uFE0F',
  football: '\u{1F3C8}',
  rocket: '\u{1F680}',
  music: '\u{1F3B5}',
  badge: '\u{1F6E1}\uFE0F',
  waves: '\u{1F30A}',
  sheep: '\u{1F411}',
  city: '\u{1F3D9}\uFE0F',
  deer: '\u{1F98C}',
  rose: '\u{1F339}',
  shell: '\u{1F41A}',
  heart: '\u2764\uFE0F',
  palm: '\u{1F334}',
  eagle: '\u{1F985}',
  fair: '\u{1F3A1}',
  pine: '\u{1F332}',
  tornado: '\u{1F32A}\uFE0F',
  hat: '\u{1F920}',
  oil: '\u{1F6E2}\uFE0F',
  baseball: '\u26BE',
  ship: '\u{1F6A2}',
  wheat: '\u{1F33E}',
  pepper: '\u{1F336}\uFE0F',
  bull: '\u{1F402}',
  fishing: '\u{1F3A3}',
  mountain: '\u26F0\uFE0F',
  cactus: '\u{1F335}',
};

function getRegionEmoji(row) {
  return row.emoji || REGION_EMOJI_BY_KEY[row.icon_key] || REGION_EMOJI_BY_KEY[row.id] || '\u{1F4CD}';
}

function logSupabaseDiagnostic({ table, error, usedFallback }) {
  if (!import.meta.env.DEV) return;

  console.info('[CalculatorData] Supabase diagnostic', {
    table,
    errorCode: error?.code || null,
    errorMessage: error?.message || null,
    errorDetails: error?.details || null,
    errorHint: error?.hint || null,
    usedFallback,
  });
}

async function loadOptionalClothingItems() {
  if (!OPTIONAL_CLOTHING_TABLE) {
    logSupabaseDiagnostic({
      table: 'clothing_items',
      error: { message: 'Skipped optional clothing query because VITE_SUPABASE_CLOTHING_TABLE is not configured.' },
      usedFallback: true,
    });
    return { data: [], error: null };
  }

  const response = await supabase
    .from(OPTIONAL_CLOTHING_TABLE)
    .select('id, name, category, description, price, lifespan_months, image_url, sort_order, is_active')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  logSupabaseDiagnostic({
    table: OPTIONAL_CLOTHING_TABLE,
    error: response.error,
    usedFallback: !!response.error,
  });

  return response;
}

export function useCalculatorData() {
  const [regions, setRegions] = useState([]);
  const [internetOptions, setInternetOptions] = useState([]);
  const [utilityOptions, setUtilityOptions] = useState([]);
  const [streamingOptions, setStreamingOptions] = useState([]);
  const [subscriptionOptions, setSubscriptionOptions] = useState([]);
  const [clothingItems, setClothingItems] = useState([]);
  const [insuranceOptions, setInsuranceOptions] = useState([]);
  const [phonePlanOptions, setPhonePlanOptions] = useState([]);
  const [phoneDeviceOptions, setPhoneDeviceOptions] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [
          regionsRes,
          internetRes,
          utilityRes,
          streamingRes,
          subscriptionRes,
          insuranceRes,
          phonePlanRes,
          phoneDeviceRes,
          transportRes,
          clothingItemsRes,
        ] = await Promise.all([
          supabase
            .from('regions')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('internet_options')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('utility_options')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('streaming_options')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('subscription_options')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('insurance_options')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('phone_plan_options')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('phone_device_options')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          supabase
            .from('transportation_options')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
          loadOptionalClothingItems(),
        ]);

        if (regionsRes.error) throw regionsRes.error;
        if (internetRes.error) throw internetRes.error;
        if (utilityRes.error) throw utilityRes.error;
        if (streamingRes.error) throw streamingRes.error;
        if (subscriptionRes.error) throw subscriptionRes.error;
        if (insuranceRes.error) throw insuranceRes.error;
        if (phonePlanRes.error) throw phonePlanRes.error;
        if (phoneDeviceRes.error) throw phoneDeviceRes.error;
        if (transportRes.error) throw transportRes.error;

        setRegions(
          (regionsRes.data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            majorCity: row.major_city,
            emoji: getRegionEmoji(row),
            costMultiplier: Number(row.cost_multiplier),
            sort_order: row.sort_order,
          }))
        );

        setInternetOptions(
          (internetRes.data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            monthlyCost: Number(row.monthly_cost),
            image: row.image_url,
            companyName: row.company_name,
            region_id: row.region_id,
          }))
        );

        setUtilityOptions(
          (utilityRes.data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            monthlyCost: Number(row.monthly_cost),
            emoji: row.emoji,
            region_id: row.region_id,
          }))
        );

        setStreamingOptions(
          (streamingRes.data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            service: row.service,
            planType: row.plan_type,
            description: row.description,
            monthlyCost: Number(row.monthly_cost),
            image: row.image_url,
          }))
        );

        setSubscriptionOptions(
          (subscriptionRes.data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            description: row.description,
            monthlyCost: Number(row.monthly_cost),
            emoji: row.emoji,
          }))
        );

        setClothingItems(
          (clothingItemsRes.data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            description: row.description,
            price: Number(row.price),
            lifespan_months: Number(row.lifespan_months),
            image_url: row.image_url,
            sort_order: row.sort_order,
            is_active: row.is_active,
          }))
        );

        setInsuranceOptions(
          (insuranceRes.data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            description: row.description,
            monthlyCost: Number(row.monthly_cost),
            emoji: row.emoji,
          }))
        );

        setPhonePlanOptions(
          (phonePlanRes.data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            companyName: row.company_name,
            planName: row.plan_name,
            data: row.data,
            hotspot: row.hotspot,
            access: row.access,
            notes: row.notes,
            monthlyCost: Number(row.monthly_cost),
            image: row.image_url,
          }))
        );

        setPhoneDeviceOptions(
          (phoneDeviceRes.data ?? []).map((row) => ({
            id: row.id,
            category: row.category,
            name: row.name,
            description: row.description,
            price: Number(row.price),
            months: Number(row.months),
            emoji: row.emoji,
          }))
        );

        setTransportOptions(
          (transportRes.data ?? []).map((row) => ({
            id: row.id,
            category: row.category,
            name: row.name,
            description: row.description,
            price: Number(row.price),
            emoji: row.emoji,
          }))
        );
      } catch (err) {
        console.error('Failed to load calculator data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
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
    loading,
    error,
  };
}
