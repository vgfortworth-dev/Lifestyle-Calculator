import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

        const [regionsRes, internetRes, utilityRes, streamingRes, subscriptionRes, insuranceRes, phonePlanRes, phoneDeviceRes, transportRes, clothingItemsRes] = await Promise.all([
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
          supabase
            .from('clothing_items')
            .select('id, name, category, description, price, lifespan_months, image_url, sort_order, is_active')
            .eq('is_active', true)
            .order('sort_order', { ascending: true }),
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
        if (clothingItemsRes.error) {
          console.warn('Optional clothing_items query failed, using fallback clothing item data.', clothingItemsRes.error);
        }

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

        setClothingItems(
          ((clothingItemsRes.data ?? []) || []).map((row) => ({
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
