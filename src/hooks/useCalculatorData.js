import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CLOTHING_OPTIONS } from '../data/texasData';

const CLOTHING_STYLE_IMAGE_BY_TIER = {
  tier1: CLOTHING_OPTIONS.find((option) => option.id === 'tier1')?.image,
  tier2: CLOTHING_OPTIONS.find((option) => option.id === 'tier2')?.image,
  tier3: CLOTHING_OPTIONS.find((option) => option.id === 'tier3')?.image,
  tier4: CLOTHING_OPTIONS.find((option) => option.id === 'tier4')?.image,
};

const getClothingImage = (row) => {
  const key = `${row.id || ''} ${row.name || ''} ${row.description || ''}`.toLowerCase();
  const fallback = CLOTHING_OPTIONS.find((option) =>
    option.id === row.id ||
    option.name === row.name ||
    option.name.toLowerCase().includes(String(row.name || '').toLowerCase()) ||
    String(row.name || '').toLowerCase().includes(option.name.toLowerCase())
  );

  if (row.image || row.image_url || row.imageUrl) return row.image || row.image_url || row.imageUrl;
  if (fallback?.image) return fallback.image;
  if (key.includes('tier1') || key.includes('tier 1') || key.includes('minimal') || key.includes('essential')) {
    return CLOTHING_STYLE_IMAGE_BY_TIER.tier1;
  }
  if (key.includes('tier2') || key.includes('tier 2') || key.includes('trend') || key.includes('fast-fashion')) {
    return CLOTHING_STYLE_IMAGE_BY_TIER.tier2;
  }
  if (key.includes('tier3') || key.includes('tier 3') || key.includes('everyday') || key.includes('regular')) {
    return CLOTHING_STYLE_IMAGE_BY_TIER.tier3;
  }
  if (key.includes('tier4') || key.includes('tier 4') || key.includes('brand') || key.includes('premium')) {
    return CLOTHING_STYLE_IMAGE_BY_TIER.tier4;
  }

  return CLOTHING_STYLE_IMAGE_BY_TIER.tier3;
};

export function useCalculatorData() {
  const [regions, setRegions] = useState([]);
  const [internetOptions, setInternetOptions] = useState([]);
  const [utilityOptions, setUtilityOptions] = useState([]);
  const [streamingOptions, setStreamingOptions] = useState([]);
  const [subscriptionOptions, setSubscriptionOptions] = useState([]);
  const [clothingOptions, setClothingOptions] = useState([]);
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

        const [regionsRes, internetRes, utilityRes, streamingRes, subscriptionRes, clothingRes, insuranceRes, phonePlanRes, phoneDeviceRes, transportRes] = await Promise.all([
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
            .from('clothing_options')
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
        ]);

        if (regionsRes.error) throw regionsRes.error;
        if (internetRes.error) throw internetRes.error;
        if (utilityRes.error) throw utilityRes.error;
        if (streamingRes.error) throw streamingRes.error;
        if (subscriptionRes.error) throw subscriptionRes.error;
        if (clothingRes.error) throw clothingRes.error;
        if (insuranceRes.error) throw insuranceRes.error;
        if (phonePlanRes.error) throw phonePlanRes.error;
        if (phoneDeviceRes.error) throw phoneDeviceRes.error;
        if (transportRes.error) throw transportRes.error;

        setRegions(
          (regionsRes.data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            majorCity: row.major_city,
            emoji: row.emoji,
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

        setClothingOptions(
          (clothingRes.data ?? []).map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            monthlyCost: Number(row.monthly_cost),
            emoji: row.emoji,
            image: getClothingImage(row),
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
    clothingOptions,
    insuranceOptions,
    phonePlanOptions,
    phoneDeviceOptions,
    transportOptions,
    loading,
    error,
  };
}
