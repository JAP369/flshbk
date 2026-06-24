"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface SalesHistoryRecord {
  id: string;
  catalog_item_id: string;
  price_hkd: number;
  platform: string;
  sale_date: string;
  transaction_type: "auction" | "fixed_price" | "best_offer";
  item_name?: string;
  set_code?: string;
}

interface ChartDataPoint {
  date: string;
  price: number;
  platform: string;
  transactionType: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatHKD(value: number): string {
  return new Intl.NumberFormat("en-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface SalesHistoryChartProps {
  catalogItemId?: string;
  itemName?: string;
  showHeader?: boolean;
}

export function SalesHistoryChart({
  catalogItemId,
  itemName,
  showHeader = true,
}: SalesHistoryChartProps) {
  const [salesData, setSalesData] = useState<SalesHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"line" | "area">("area");

  useEffect(() => {
    fetchSalesHistory();
  }, [catalogItemId]);

  const fetchSalesHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In production, this would fetch from Supabase sales_history table
      // For now, we simulate the data structure
      const params = new URLSearchParams();
      if (catalogItemId) {
        params.set("catalog_item_id", catalogItemId);
      }
      params.set("limit", "50");

      // Simulated API call - in production, replace with actual Supabase query
      const response = await fetch(`/api/sales-history?${params.toString()}`);

      if (response.ok) {
        const result = await response.json();
        setSalesData(result.data || getMockSalesData());
      } else {
        // Fallback to mock data
        setSalesData(getMockSalesData());
      }
    } catch (err) {
      console.error("Failed to fetch sales history:", err);
      // Use mock data on error
      setSalesData(getMockSalesData());
    } finally {
      setIsLoading(false);
    }
  };

  const chartData: ChartDataPoint[] = useMemo(() => {
    return salesData
      .sort(
        (a, b) =>
          new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime(),
      )
      .map((record) => ({
        date: new Date(record.sale_date).toLocaleDateString("en-HK", {
          month: "short",
          day: "numeric",
        }),
        price: record.price_hkd,
        platform: record.platform,
        transactionType: record.transaction_type,
      }));
  }, [salesData]);

  const priceStats = useMemo(() => {
    if (chartData.length === 0) return null;

    const prices = chartData.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    const latest = prices[prices.length - 1];
    const first = prices[0];
    const change = ((latest - first) / first) * 100;

    return { min, max, avg, latest, first, change };
  }, [chartData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='glass-card rounded-2xl p-5 border border-border'
    >
      {showHeader && (
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <BarChart3 className='w-4 h-4 text-accent' />
            <h3 className='font-serif text-lg text-foreground'>
              Sales History
              {itemName && (
                <span className='text-sm text-slate-400 ml-2'>
                  — {itemName}
                </span>
              )}
            </h3>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() =>
                setChartType(chartType === "line" ? "area" : "line")
              }
              className='p-1.5 rounded-lg bg-surface-elevated text-slate-400 hover:text-foreground transition-colors'
              title={`Switch to ${chartType === "line" ? "area" : "line"} chart`}
            >
              {chartType === "line" ? (
                <BarChart3 className='w-4 h-4' />
              ) : (
                <TrendingUp className='w-4 h-4' />
              )}
            </button>
            <button
              onClick={fetchSalesHistory}
              disabled={isLoading}
              className='p-1.5 rounded-lg bg-surface-elevated text-slate-400 hover:text-foreground transition-colors disabled:opacity-50'
              title='Refresh data'
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Price Stats */}
      {priceStats && (
        <div className='grid grid-cols-4 gap-3 mb-4'>
          <div className='p-2 rounded-lg bg-surface-elevated/50'>
            <p className='text-[10px] text-slate-400 uppercase tracking-wide'>
              Latest
            </p>
            <p className='text-sm font-bold text-foreground'>
              {formatHKD(priceStats.latest)}
            </p>
          </div>
          <div className='p-2 rounded-lg bg-surface-elevated/50'>
            <p className='text-[10px] text-slate-400 uppercase tracking-wide'>
              Average
            </p>
            <p className='text-sm font-bold text-foreground'>
              {formatHKD(priceStats.avg)}
            </p>
          </div>
          <div className='p-2 rounded-lg bg-surface-elevated/50'>
            <p className='text-[10px] text-slate-400 uppercase tracking-wide'>
              Range
            </p>
            <p className='text-sm font-bold text-foreground'>
              {formatHKD(priceStats.min)} - {formatHKD(priceStats.max)}
            </p>
          </div>
          <div className='p-2 rounded-lg bg-surface-elevated/50'>
            <p className='text-[10px] text-slate-400 uppercase tracking-wide'>
              Change
            </p>
            <p
              className={`text-sm font-bold ${priceStats.change >= 0 ? "text-emerald-400" : "text-red-400"}`}
            >
              {priceStats.change >= 0 ? "+" : ""}
              {priceStats.change.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className='h-[250px]'>
        {isLoading ? (
          <div className='h-full flex items-center justify-center'>
            <Loader2 className='w-6 h-6 text-accent animate-spin' />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width='100%' height='100%'>
            {chartType === "area" ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id='salesGradient'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='0%' stopColor='#ff2d2d' stopOpacity={0.3} />
                    <stop offset='100%' stopColor='#ff2d2d' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='rgba(255,255,255,0.05)'
                />
                <XAxis
                  dataKey='date'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 15, 20, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [formatHKD(Number(value)), "Price"]}
                />
                <Area
                  type='monotone'
                  dataKey='price'
                  stroke='#ff2d2d'
                  strokeWidth={2}
                  fill='url(#salesGradient)'
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='rgba(255,255,255,0.05)'
                />
                <XAxis
                  dataKey='date'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 15, 20, 0.95)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [formatHKD(Number(value)), "Price"]}
                />
                <Line
                  type='monotone'
                  dataKey='price'
                  stroke='#ff2d2d'
                  strokeWidth={2}
                  dot={{ fill: "#ff2d2d", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: "#ff2d2d" }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className='h-full flex items-center justify-center'>
            <div className='text-center'>
              <AlertCircle className='w-8 h-8 text-slate-600 mx-auto mb-2' />
              <p className='text-sm text-slate-400'>No sales data available</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// MOCK DATA - Replace with actual Supabase query in production
// =============================================================================

function getMockSalesData(): SalesHistoryRecord[] {
  return [
    {
      id: "sh-001",
      catalog_item_id: "cat-001",
      price_hkd: 7200,
      platform: "eBay",
      sale_date: "2024-12-15",
      transaction_type: "auction",
      item_name: "Charizard ex",
    },
    {
      id: "sh-002",
      catalog_item_id: "cat-001",
      price_hkd: 7800,
      platform: "Carousell",
      sale_date: "2024-12-22",
      transaction_type: "fixed_price",
      item_name: "Charizard ex",
    },
    {
      id: "sh-003",
      catalog_item_id: "cat-001",
      price_hkd: 8100,
      platform: "TCGPlayer",
      sale_date: "2025-01-02",
      transaction_type: "best_offer",
      item_name: "Charizard ex",
    },
    {
      id: "sh-004",
      catalog_item_id: "cat-001",
      price_hkd: 8500,
      platform: "eBay",
      sale_date: "2025-01-10",
      transaction_type: "auction",
      item_name: "Charizard ex",
    },
  ];
}
