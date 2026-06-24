import { Metadata } from "next";
import { CarousellAggregator } from "@/components/screener/CarousellAggregator";

export const metadata: Metadata = {
  title: "Carousell Arbitrage Screener | FlashBK",
  description: "Find arbitrage opportunities from Carousell HK listings",
};

export default function ScreenerPage() {
  return (
    <div className="min-h-screen pt-20 pb-24 bg-background">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground">
            Carousell Arbitrage Screener
          </h1>
          <p className="text-slate-400 mt-1">
            Localized HK marketplace arbitrage opportunities
          </p>
        </div>

        {/* Main Component */}
        <CarousellAggregator />
      </div>
    </div>
  );
}
