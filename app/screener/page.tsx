"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import {
  ScreeningFormWithInterceptor,
  InlineScreenerBanner,
} from "@/components/screener/PopulationScreener";
import { TrackedRecord } from "@/types/population-screener";

export default function ScreenerPage() {
  const [records, setRecords] = useState<TrackedRecord[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (data: {
    psaPop: number;
    setType: string;
    isBaseRarity: boolean;
    assetName: string;
    listedPrice: number;
    marketFloor: number;
  }) => {
    const newRecord: TrackedRecord = {
      id: `rec-${Date.now()}`,
      assetName: data.assetName,
      psaPop: data.psaPop,
      setType: data.setType,
      isBaseRarity: data.isBaseRarity,
      listedPrice: data.listedPrice,
      marketFloor: data.marketFloor,
      createdAt: new Date().toISOString(),
    };
    setRecords((prev) => [newRecord, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-background">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h1 className="font-serif text-3xl sm:text-4xl text-foreground">
                  Population Screener
                </h1>
                <p className="text-silver mt-1">
                  Automated risk validation for asset submissions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-background font-medium hover:bg-accent-hover transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              New Record
            </button>
          </div>
        </motion.header>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-5 mb-6"
          >
            <h2 className="font-serif text-lg text-foreground mb-4">
              Add New Record
            </h2>
            <ScreeningFormWithInterceptor
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}

        {/* Records List */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl text-foreground">
            Tracked Records ({records.length})
          </h2>

          {records.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-silver mx-auto mb-3" />
              <p className="text-silver">No records yet</p>
              <p className="text-sm text-silver/60 mt-1">
                Add a new record to see the screener in action
              </p>
            </div>
          ) : (
            records.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {record.assetName}
                    </h3>
                    <p className="text-sm text-silver">{record.setType}</p>
                  </div>
                  <span className="text-xs text-silver">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <InlineScreenerBanner
                  psaPop={record.psaPop}
                  setType={record.setType}
                  isBaseRarity={record.isBaseRarity}
                />

                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="p-2 rounded-lg bg-surface-elevated">
                    <p className="text-xs text-silver">PSA Pop</p>
                    <p className="font-medium text-foreground">
                      {record.psaPop.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-elevated">
                    <p className="text-xs text-silver">Listed</p>
                    <p className="font-medium text-foreground">
                      HKD {record.listedPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-elevated">
                    <p className="text-xs text-silver">Floor</p>
                    <p className="font-medium text-foreground">
                      HKD {record.marketFloor.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
