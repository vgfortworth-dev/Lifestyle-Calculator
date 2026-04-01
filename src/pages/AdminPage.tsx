import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const TABLE_OPTIONS = [
  { value: 'internet_options', label: 'Internet', regional: true },
  { value: 'utility_options', label: 'Utilities', regional: true },
  { value: 'streaming_options', label: 'Streaming', regional: false },
  { value: 'subscription_options', label: 'Subscriptions', regional: false },
  { value: 'clothing_options', label: 'Clothing', regional: false },
  { value: 'insurance_options', label: 'Insurance', regional: false },
  { value: 'phone_plan_options', label: 'Phone Plans', regional: false },
  { value: 'phone_device_options', label: 'Phone Devices', regional: false },
  { value: 'transportation_options', label: 'Transportation', regional: false },
];

const HIDDEN_FIELDS = ['created_at', 'updated_at'];
const ADMIN_EMAIL = 'vgonzalez@t3partnership.org';

export default function AdminPage() {
  const [table, setTable] = useState('internet_options');
  const [regionId, setRegionId] = useState('tarrant');
  const [regions, setRegions] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const selectedTable = useMemo(
    () => TABLE_OPTIONS.find((opt) => opt.value === table),
    [table]
  );

  const isRegionalTable = Boolean(selectedTable?.regional);

  const loadRegions = async () => {
    const { data, error } = await supabase
      .from('regions')
      .select('id, major_city, name, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to load regions:', error);
      return;
    }

    setRegions(data || []);
  };

  const loadData = async () => {
    setLoading(true);

    let query = supabase.from(table).select('*');

    if (isRegionalTable) {
      query = query.eq('region_id', regionId);
    }

    const { data, error } = await query.order('sort_order', { ascending: true });

    if (error) {
      console.error(error);
      alert('Failed to load data.');
    } else {
      setData(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    const checkAccess = async () => {
      const { data, error } = await supabase.auth.getUser();
      const email = data.user?.email?.toLowerCase();

      if (error || email !== ADMIN_EMAIL) {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    };

    checkAccess();
  }, []);

  useEffect(() => {
    loadRegions();
  }, [authorized]);

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [table, regionId, authorized]);

  useEffect(() => {
    const currentTable = TABLE_OPTIONS.find((opt) => opt.value === table);
    if (!currentTable?.regional) return;

    if (!regionId && regions.length > 0) {
      setRegionId(regions[0].id);
    }
  }, [table, regions, regionId]);

  const updateRow = async (row: any) => {
    setSavingRowId(row.id);

    const { id, created_at, updated_at, ...safeRow } = row;

    const { error } = await supabase
      .from(table)
      .update(safeRow)
      .eq('id', id);

    if (error) {
      console.error(error);
      alert('Error saving row.');
    } else {
      await loadData();
      alert('Saved!');
    }

    setSavingRowId(null);
  };

  const handleFieldChange = (
    rowIndex: number,
    key: string,
    value: string | number | boolean
  ) => {
    const newData = [...data];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [key]: value,
    };
    setData(newData);
  };

  const renderField = (row: any, rowIndex: number, key: string) => {
    if (HIDDEN_FIELDS.includes(key)) return null;

    const value = row[key];

    if (key === 'id') {
      return (
        <div key={key} className="md:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            ID
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
            {value}
          </div>
        </div>
      );
    }

    if (key === 'region_id') {
      return (
        <div key={key}>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Region
          </label>
          <select
            value={value ?? ''}
            onChange={(e) => handleFieldChange(rowIndex, key, e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          >
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.major_city} ({region.name})
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (typeof value === 'boolean' || key === 'is_active') {
      return (
        <div key={key} className="md:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {key.replaceAll('_', ' ')}
          </label>
          <label className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) =>
                handleFieldChange(rowIndex, key, e.target.checked)
              }
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">
              {Boolean(value) ? 'Active' : 'Inactive'}
            </span>
          </label>
        </div>
      );
    }

    if (
      key.includes('description') ||
      key.includes('details') ||
      key.includes('notes')
    ) {
      return (
        <div key={key} className="md:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {key.replaceAll('_', ' ')}
          </label>
          <textarea
            value={value ?? ''}
            onChange={(e) => handleFieldChange(rowIndex, key, e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>
      );
    }

    if (
      typeof value === 'number' ||
      key.includes('cost') ||
      key.includes('price') ||
      key.includes('sort_order') ||
      key.includes('months')
    ) {
      return (
        <div key={key}>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {key.replaceAll('_', ' ')}
          </label>
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) =>
              handleFieldChange(
                rowIndex,
                key,
                e.target.value === '' ? '' : Number(e.target.value)
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>
      );
    }

    return (
      <div key={key}>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {key.replaceAll('_', ' ')}
        </label>
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => handleFieldChange(rowIndex, key, e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </div>
    );
  };

  const selectedTableLabel = selectedTable?.label ?? table;
  const selectedRegion = regions.find((region) => region.id === regionId);

  if (authorized === null) {
    return <div className="p-8">Checking access...</div>;
  }

  if (!authorized) {
    return <div className="p-8">Not authorized.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                Internal Tools
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Admin Editor
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Update calculator data without touching SQL or code.
              </p>
            </div>

            <div className="grid w-full gap-4 md:grid-cols-2 lg:w-auto">
              <div className="min-w-[260px]">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Data Table
                </label>
                <select
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  {TABLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {isRegionalTable && (
                <div className="min-w-[260px]">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Region
                  </label>
                  <select
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  >
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.major_city} ({region.name})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {selectedTableLabel}
            </h2>
            <p className="text-sm text-slate-500">
              {isRegionalTable && selectedRegion
                ? `${selectedRegion.major_city} (${selectedRegion.name})`
                : 'Global options'}
            </p>
          </div>

          <p className="text-sm text-slate-500">
            {loading ? 'Loading records...' : `${data.length} records loaded`}
          </p>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm font-medium text-slate-500 shadow-sm">
            Loading data...
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((row, i) => (
              <div
                key={row.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Record {i + 1}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      {row.name || row.id}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {'region_id' in row && row.region_id ? (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                        {row.region_id}
                      </span>
                    ) : null}

                    {'is_active' in row ? (
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                          row.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {row.is_active ? 'Active' : 'Inactive'}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.keys(row).map((key) => renderField(row, i, key))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => updateRow(row)}
                    disabled={savingRowId === row.id}
                    className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingRowId === row.id ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
